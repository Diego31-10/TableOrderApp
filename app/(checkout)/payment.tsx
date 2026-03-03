import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, Lock, CheckCircle, XCircle, Cpu } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Brand } from '@/constants/Colors';
import { useCartStore } from '@/src/stores/useCartStore';
import { useTableStore } from '@/src/stores/useTableStore';
import { useLocationStore } from '@/src/stores/useLocationStore';
import { processMockPayment } from '@/src/lib/core/payments/paymentService';
import { sendPaymentNotification } from '@/src/lib/core/notifications/NotificationService';
import { generateTicketPDF } from '@/src/lib/services/pdfService';
import { sendTicketToTelegram } from '@/src/lib/services/telegramService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function maskCardDisplay(number: string): string {
  const digits = number.replace(/\s/g, '');
  const visible = digits.slice(-4).padStart(4, '');
  if (digits.length < 4) return number || '•••• •••• •••• ••••';
  return `•••• •••• •••• ${visible}`;
}

// ─── Virtual Card ─────────────────────────────────────────────────────────────

interface CardPreviewProps {
  number: string;
  holder: string;
  expiry: string;
}

function CardPreview({ number, holder, expiry }: CardPreviewProps) {
  return (
    <LinearGradient
      colors={['#1A1040', '#2D1B69', '#0F0F2E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.cardTopRow}>
        <Cpu size={28} color="rgba(255,255,255,0.6)" strokeWidth={1.2} />
        <Text style={styles.cardBrand}>TABLEORDER</Text>
      </View>
      <Text style={styles.cardNumber}>{maskCardDisplay(number)}</Text>
      <View style={styles.cardBottomRow}>
        <View>
          <Text style={styles.cardLabel}>TITULAR</Text>
          <Text style={styles.cardValue} numberOfLines={1}>
            {holder.toUpperCase() || 'TU NOMBRE'}
          </Text>
        </View>
        <View>
          <Text style={styles.cardLabel}>VENCE</Text>
          <Text style={styles.cardValue}>{expiry || 'MM/AA'}</Text>
        </View>
      </View>
      <View style={styles.cardCircle1} />
      <View style={styles.cardCircle2} />
    </LinearGradient>
  );
}

// ─── Order Summary ────────────────────────────────────────────────────────────

function OrderSummary() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const isBirthdayMode = useCartStore((s) => s.isBirthdayMode);
  const discount = useCartStore((s) => s.discount);
  const shippingCost = useCartStore((s) => s.shippingCost);
  const serviceType = useCartStore((s) => s.serviceType);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const grandTotal = total + shippingCost;

  return (
    <View style={styles.summary}>
      <Text style={styles.sectionTitle}>Resumen del pedido</Text>
      {items.map((item) => (
        <View key={item.product.id} style={styles.summaryRow}>
          <Text style={styles.summaryItem} numberOfLines={1}>
            {item.quantity}x {item.product.name}
          </Text>
          <Text style={styles.summaryItemPrice}>
            ${(item.product.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      ))}

      {isBirthdayMode && (
        <View style={styles.summaryRow}>
          <Text style={styles.discountLabel}>
            Descuento ({Math.round(discount * 100)}% OFF)
          </Text>
          <Text style={styles.discountValue}>-${(subtotal - total).toFixed(2)}</Text>
        </View>
      )}

      {serviceType === 'DELIVERY' && shippingCost > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryItem}>Costo de envío</Text>
          <Text style={styles.summaryItemPrice}>${shippingCost.toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.divider} />
      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
      </View>
    </View>
  );
}

// ─── Loading step labels ──────────────────────────────────────────────────────

const LOADING_LABELS: Record<string, string> = {
  payment: 'Validando con el banco...',
  ticket: 'Generando ticket PDF...',
  telegram: 'Enviando comprobante...',
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

type PaymentState = 'idle' | 'loading' | 'success' | 'error';

export default function PaymentScreen() {
  const router = useRouter();

  // Store selectors
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const discount = useCartStore((s) => s.discount);
  const shippingCost = useCartStore((s) => s.shippingCost);
  const serviceType = useCartStore((s) => s.serviceType);
  const resetCart = useCartStore((s) => s.resetCart);

  const currentTable = useTableStore((s) => s.currentTable);
  const clearSession = useTableStore((s) => s.clearSession);

  const resetLocation = useLocationStore((s) => s.resetLocation);

  // Local state
  const [cardNumber, setCardNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [loadingStep, setLoadingStep] = useState('payment');
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const grandTotal = total + shippingCost;

  const isFormValid =
    cardNumber.replace(/\s/g, '').length === 16 &&
    holder.trim().length > 2 &&
    expiry.length === 5 &&
    cvv.length >= 3;

  // ── Orchestrated payment flow ─────────────────────────────────────────────
  const handlePay = useCallback(async () => {
    if (!isFormValid || paymentState === 'loading') return;

    setPaymentState('loading');
    setLoadingStep('payment');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Step 1: Process payment
    const result = await processMockPayment(grandTotal);

    if (!result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMsg(result.error);
      setPaymentState('error');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Step 2: Generate PDF ticket
    setLoadingStep('ticket');
    let pdfUri = '';
    try {
      pdfUri = await generateTicketPDF({
        items,
        subtotal,
        discount,
        total,
        shippingCost,
        serviceType,
        tableName: currentTable?.displayName,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[PDF] Generation failed:', err);
    }

    // Step 3: Send to Telegram (silent failure if unconfigured)
    setLoadingStep('telegram');
    if (pdfUri) {
      await sendTicketToTelegram(pdfUri);
    }

    // Step 4: Local push notification
    const serviceName =
      serviceType === 'TABLE'
        ? (currentTable?.displayName ?? 'tu mesa')
        : 'delivery';
    await sendPaymentNotification(grandTotal, serviceName);

    setPaymentState('success');
  }, [
    isFormValid,
    paymentState,
    grandTotal,
    items,
    subtotal,
    discount,
    total,
    shippingCost,
    serviceType,
    currentTable,
  ]);

  // ── Success navigation decision ───────────────────────────────────────────
  const handleSuccessDismiss = useCallback(() => {
    resetCart();
    if (serviceType === 'TABLE') {
      // Table order: clear session and go back to scanner/context switcher
      clearSession();
      resetLocation();
      router.replace('/(tabs)');
    } else {
      // Delivery order: navigate to track-order to show the route
      router.replace('/(delivery)/track-order');
    }
  }, [serviceType, resetCart, clearSession, resetLocation, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Brand.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <Lock size={18} color={Brand.textSecondary} strokeWidth={1.8} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <OrderSummary />

        <CardPreview number={cardNumber} holder={holder} expiry={expiry} />

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Datos de pago</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Numero de tarjeta</Text>
            <View style={styles.inputRow}>
              <CreditCard size={18} color={Brand.textSecondary} strokeWidth={1.8} />
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={Brand.textTertiary}
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                maxLength={19}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre del titular</Text>
            <TextInput
              style={[styles.input, styles.inputStandalone]}
              placeholder="Como aparece en la tarjeta"
              placeholderTextColor={Brand.textTertiary}
              autoCapitalize="words"
              value={holder}
              onChangeText={setHolder}
            />
          </View>

          <View style={styles.inputHalfRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Vencimiento</Text>
              <TextInput
                style={[styles.input, styles.inputStandalone]}
                placeholder="MM/AA"
                placeholderTextColor={Brand.textTertiary}
                keyboardType="numeric"
                value={expiry}
                onChangeText={(t) => setExpiry(formatExpiry(t))}
                maxLength={5}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={[styles.input, styles.inputStandalone]}
                placeholder="•••"
                placeholderTextColor={Brand.textTertiary}
                keyboardType="numeric"
                secureTextEntry
                value={cvv}
                onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Pay button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, !isFormValid && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={!isFormValid || paymentState === 'loading'}
          activeOpacity={0.85}
        >
          {paymentState === 'loading' ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.payBtnText}>
                {LOADING_LABELS[loadingStep] ?? 'Procesando...'}
              </Text>
            </>
          ) : (
            <Text style={styles.payBtnText}>Pagar ${grandTotal.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success modal */}
      <Modal visible={paymentState === 'success'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <CheckCircle size={64} color={Brand.success} strokeWidth={1.5} />
            <Text style={styles.modalTitle}>Pago exitoso</Text>
            <Text style={styles.modalBody}>
              {serviceType === 'TABLE'
                ? `Pagaste $${grandTotal.toFixed(2)} en ${currentTable?.displayName ?? 'tu mesa'}.\nGracias por tu visita.`
                : `Pagaste $${grandTotal.toFixed(2)}.\nTu pedido está en camino.`}
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={handleSuccessDismiss}>
              <Text style={styles.modalBtnText}>
                {serviceType === 'TABLE' ? 'Finalizar' : 'Ver ruta'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error modal */}
      <Modal visible={paymentState === 'error'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.modalCardError]}>
            <XCircle size={56} color={Brand.error} strokeWidth={1.5} />
            <Text style={styles.modalTitle}>Pago rechazado</Text>
            <Text style={styles.modalBody}>{errorMsg}</Text>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnError]}
              onPress={() => setPaymentState('idle')}
            >
              <Text style={styles.modalBtnText}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Brand.textPrimary,
    letterSpacing: -0.3,
  },
  scrollContent: { paddingBottom: 24 },
  // Summary
  summary: {
    marginHorizontal: 20,
    backgroundColor: Brand.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.textPrimary,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 14,
    color: Brand.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  summaryItemPrice: { fontSize: 14, color: Brand.textPrimary, fontWeight: '600' },
  discountLabel: { fontSize: 14, color: Brand.birthday, fontWeight: '600' },
  discountValue: { fontSize: 14, color: Brand.birthday, fontWeight: '700' },
  divider: { height: 1, backgroundColor: Brand.border, marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: Brand.textPrimary },
  totalValue: { fontSize: 18, fontWeight: '800', color: Brand.primary },
  // Virtual card
  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    height: 190,
    overflow: 'hidden',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 3,
    alignSelf: 'center',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  cardValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
    maxWidth: 160,
  },
  cardCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)',
    right: -60,
    top: -60,
  },
  cardCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    left: -30,
    bottom: -40,
  },
  // Form
  form: { marginHorizontal: 20, gap: 16 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Brand.textSecondary },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingHorizontal: 14,
    gap: 10,
    height: 52,
  },
  input: { flex: 1, fontSize: 15, color: Brand.textPrimary, height: '100%' },
  inputStandalone: {
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputHalfRow: { flexDirection: 'row', gap: 12 },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  payBtn: {
    backgroundColor: Brand.primary,
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  payBtnDisabled: {
    backgroundColor: Brand.surfaceElevated,
    shadowOpacity: 0,
    elevation: 0,
  },
  payBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: Brand.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  modalCardError: { borderWidth: 1, borderColor: Brand.error },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Brand.textPrimary,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 15,
    color: Brand.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalBtn: {
    backgroundColor: Brand.success,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnError: { backgroundColor: Brand.error },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
