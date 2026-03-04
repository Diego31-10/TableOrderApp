import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag, Truck, ChevronRight, Trash2, X, Package } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Brand } from '@/constants/Colors';
import { useOrderHistoryStore, OrderRecord } from '@/src/stores/useOrderHistoryStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeDate(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Ahora mismo';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHr < 24) return `Hace ${diffHr} h`;
  if (diffDay === 1) return 'Ayer';
  return formatDate(iso);
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

interface OrderDetailModalProps {
  order: OrderRecord | null;
  onClose: () => void;
}

function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const translateY = useSharedValue(600);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (order) {
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(600, { duration: 250 });
    }
  }, [order]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!order) return null;

  const discountAmount = order.subtotal - (order.total - order.shippingCost);

  return (
    <Modal visible={!!order} transparent animationType="none">
      <Animated.View style={[styles.detailOverlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <Animated.View style={[styles.detailSheet, sheetStyle]}>
          <View style={styles.sheetHandle} />

          <View style={styles.detailHeader}>
            <View>
              <Text style={styles.detailOrderId}>{order.id}</Text>
              <Text style={styles.detailDate}>{formatDate(order.paidAt)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Brand.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.serviceBadgeRow}>
            {order.serviceType === 'TABLE' ? (
              <ShoppingBag size={14} color={Brand.primary} strokeWidth={2} />
            ) : (
              <Truck size={14} color={Brand.primary} strokeWidth={2} />
            )}
            <Text style={styles.serviceBadgeText}>
              {order.serviceType === 'TABLE'
                ? `Mesa · ${order.tableName ?? 'Sin nombre'}`
                : 'Delivery'}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.detailScroll}>
            <Text style={styles.detailSectionTitle}>Detalle del pedido</Text>
            {order.items.map((item) => (
              <View key={item.product.id} style={styles.detailItem}>
                <Text style={styles.detailItemQty}>{item.quantity}x</Text>
                <Text style={styles.detailItemName} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={styles.detailItemPrice}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.detailDivider} />

            <View style={styles.detailTotalRow}>
              <Text style={styles.detailTotalLabel}>Subtotal</Text>
              <Text style={styles.detailTotalValue}>${order.subtotal.toFixed(2)}</Text>
            </View>

            {order.discount > 0 && discountAmount > 0 && (
              <View style={styles.detailTotalRow}>
                <Text style={[styles.detailTotalLabel, { color: Brand.birthday }]}>
                  Descuento ({Math.round(order.discount * 100)}% OFF)
                </Text>
                <Text style={[styles.detailTotalValue, { color: Brand.birthday }]}>
                  -${discountAmount.toFixed(2)}
                </Text>
              </View>
            )}

            {order.shippingCost > 0 && (
              <View style={styles.detailTotalRow}>
                <Text style={styles.detailTotalLabel}>Costo de envío</Text>
                <Text style={styles.detailTotalValue}>${order.shippingCost.toFixed(2)}</Text>
              </View>
            )}

            <View style={[styles.detailTotalRow, styles.detailGrandRow]}>
              <Text style={styles.detailGrandLabel}>Total pagado</Text>
              <Text style={styles.detailGrandValue}>${order.grandTotal.toFixed(2)}</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: OrderRecord;
  onPress: () => void;
}

function OrderCard({ order, onPress }: OrderCardProps) {
  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
  const isDelivery = order.serviceType === 'DELIVERY';

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.orderIconWrap}>
        {isDelivery ? (
          <Truck size={20} color={Brand.primary} strokeWidth={1.8} />
        ) : (
          <ShoppingBag size={20} color={Brand.primary} strokeWidth={1.8} />
        )}
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.orderTopRow}>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.orderRelDate}>{formatRelativeDate(order.paidAt)}</Text>
        </View>
        <Text style={styles.orderMeta} numberOfLines={1}>
          {isDelivery ? 'Delivery' : order.tableName ?? 'Mesa'} ·{' '}
          {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
        </Text>
        <Text style={styles.orderItems} numberOfLines={1}>
          {order.items.map((i) => i.product.name).join(', ')}
        </Text>
      </View>

      <View style={styles.orderRight}>
        <Text style={styles.orderTotal}>${order.grandTotal.toFixed(2)}</Text>
        <ChevronRight size={16} color={Brand.textTertiary} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyHistory() {
  return (
    <View style={styles.emptyContainer}>
      <Package size={80} color={Brand.textTertiary} strokeWidth={1.0} />
      <Text style={styles.emptyTitle}>Sin órdenes aún</Text>
      <Text style={styles.emptySubtitle}>
        Tus pedidos completados aparecerán aquí. Escanea una mesa o pedí delivery para empezar.
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const { orders, isLoaded, loadHistory, clearHistory } = useOrderHistoryStore();
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = useCallback(() => {
    Alert.alert(
      'Borrar historial',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar todo', style: 'destructive', onPress: () => clearHistory() },
      ]
    );
  }, [clearHistory]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mis órdenes</Text>
          <Text style={styles.subtitle}>
            {orders.length > 0
              ? `${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'} registrados`
              : 'Tu historial de pedidos'}
          </Text>
        </View>
        {orders.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Trash2 size={18} color={Brand.error} strokeWidth={1.8} />
          </TouchableOpacity>
        )}
      </View>

      {!isLoaded ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            orders.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={<EmptyHistory />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={() => setSelectedOrder(item)} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Brand.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 13, color: Brand.textSecondary, marginTop: 3 },
  clearBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: `${Brand.error}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  listContentEmpty: { flex: 1 },
  separator: { height: 10 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, color: Brand.textSecondary },
  orderCard: {
    backgroundColor: Brand.surface,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  orderIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${Brand.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderInfo: { flex: 1, gap: 3 },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 13, fontWeight: '700', color: Brand.textPrimary },
  orderRelDate: { fontSize: 11, color: Brand.textTertiary },
  orderMeta: { fontSize: 12, color: Brand.primary, fontWeight: '600' },
  orderItems: { fontSize: 12, color: Brand.textSecondary, lineHeight: 16 },
  orderRight: { alignItems: 'flex-end', gap: 4 },
  orderTotal: { fontSize: 15, fontWeight: '800', color: Brand.textPrimary },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 14,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Brand.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Brand.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  detailSheet: {
    backgroundColor: Brand.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: Brand.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Brand.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailOrderId: { fontSize: 18, fontWeight: '800', color: Brand.textPrimary },
  detailDate: { fontSize: 13, color: Brand.textSecondary, marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: `${Brand.primary}18`,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  serviceBadgeText: { fontSize: 13, fontWeight: '700', color: Brand.primary },
  detailScroll: { paddingHorizontal: 20 },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  detailItemQty: { fontSize: 13, fontWeight: '700', color: Brand.primary, minWidth: 24 },
  detailItemName: { flex: 1, fontSize: 14, color: Brand.textPrimary },
  detailItemPrice: { fontSize: 14, fontWeight: '600', color: Brand.textPrimary },
  detailDivider: { height: 1, backgroundColor: Brand.border, marginVertical: 14 },
  detailTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailTotalLabel: { fontSize: 14, color: Brand.textSecondary },
  detailTotalValue: { fontSize: 14, color: Brand.textPrimary, fontWeight: '600' },
  detailGrandRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Brand.border },
  detailGrandLabel: { fontSize: 16, fontWeight: '700', color: Brand.textPrimary },
  detailGrandValue: { fontSize: 18, fontWeight: '800', color: Brand.primary },
});