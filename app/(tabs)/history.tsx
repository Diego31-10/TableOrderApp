import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
  } from 'react-native';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { useRouter } from 'expo-router';
  import { ArrowLeft, Receipt, ShoppingBag, Bike, Clock } from 'lucide-react-native';
  
  import { Brand } from '@/constants/Colors';
  import { useOrderHistoryStore } from '@/src/stores/useOrderHistoryStore';
  import { OrderRecord } from '@/src/lib/core/types';
  
  // ─── Order Card ───────────────────────────────────────────────────────────────
  
  function OrderCard({ order }: { order: OrderRecord }) {
    const date = new Date(order.timestamp);
    const dateStr = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  
    const isDelivery = order.serviceType === 'DELIVERY';
  
    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.serviceIcon, isDelivery && styles.serviceIconDelivery]}>
            {isDelivery
              ? <Bike size={16} color="#fff" strokeWidth={2} />
              : <ShoppingBag size={16} color="#fff" strokeWidth={2} />
            }
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.serviceLabel}>
              {isDelivery ? 'Delivery' : order.tableName ?? 'Mesa'}
            </Text>
            <View style={styles.dateRow}>
              <Clock size={11} color={Brand.textTertiary} strokeWidth={2} />
              <Text style={styles.dateText}>{dateStr} · {timeStr}</Text>
            </View>
          </View>
          <Text style={styles.totalAmount}>${(order.total + order.shippingCost).toFixed(2)}</Text>
        </View>
  
        {/* Divider */}
        <View style={styles.divider} />
  
        {/* Items list */}
        <View style={styles.itemsList}>
          {order.items.map((item) => (
            <View key={item.product.id} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}x</Text>
              <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
  
        {/* Totals footer */}
        <View style={styles.totalsFooter}>
          {order.discount > 0 && (
            <View style={styles.footerRow}>
              <Text style={styles.discountLabel}>
                Descuento ({Math.round(order.discount * 100)}% OFF)
              </Text>
              <Text style={styles.discountValue}>
                -${(order.subtotal - order.total + order.shippingCost).toFixed(2)}
              </Text>
            </View>
          )}
          {order.shippingCost > 0 && (
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Envío</Text>
              <Text style={styles.footerValue}>${order.shippingCost.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.footerRow}>
            <Text style={styles.footerLabelBold}>Total pagado</Text>
            <Text style={styles.footerValueBold}>
              ${(order.total + order.shippingCost).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  }
  
  // ─── Empty State ──────────────────────────────────────────────────────────────
  
  function EmptyState() {
    return (
      <View style={styles.emptyContainer}>
        <Receipt size={56} color={Brand.textTertiary} strokeWidth={1.2} />
        <Text style={styles.emptyTitle}>Sin órdenes aún</Text>
        <Text style={styles.emptySubtitle}>
          Tus compras aparecerán aquí después de cada pago exitoso.
        </Text>
      </View>
    );
  }
  
  // ─── Main Screen ──────────────────────────────────────────────────────────────
  
  export default function HistoryScreen() {
    const router = useRouter();
    const orders = useOrderHistoryStore((s) => s.orders);
  
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={Brand.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial</Text>
          {orders.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{orders.length}</Text>
            </View>
          )}
        </View>
  
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            orders.length === 0 ? styles.emptyList : styles.listContent
          }
          ListEmptyComponent={<EmptyState />}
          renderItem={({ item }) => <OrderCard order={item} />}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }
  
  // ─── Styles ───────────────────────────────────────────────────────────────────
  
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Brand.background },
  
    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: Brand.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: '700',
      color: Brand.textPrimary,
      letterSpacing: -0.3,
    },
    countBadge: {
      backgroundColor: Brand.primary,
      borderRadius: 10,
      minWidth: 26,
      height: 26,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    countBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  
    // List
    listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 14 },
    emptyList: { flex: 1 },
  
    // Card
    card: {
      backgroundColor: Brand.surface,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: Brand.border,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 12,
    },
    serviceIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: Brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    serviceIconDelivery: {
      backgroundColor: '#2A2A2A',
      borderWidth: 1,
      borderColor: Brand.border,
    },
    cardHeaderText: { flex: 1, gap: 3 },
    serviceLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: Brand.textPrimary,
    },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dateText: { fontSize: 11, color: Brand.textTertiary },
    totalAmount: {
      fontSize: 17,
      fontWeight: '800',
      color: Brand.primary,
    },
    divider: { height: 1, backgroundColor: Brand.border },
  
    // Items
    itemsList: { paddingHorizontal: 14, paddingVertical: 10, gap: 6 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    itemQty: {
      fontSize: 13,
      fontWeight: '700',
      color: Brand.primary,
      width: 24,
    },
    itemName: { flex: 1, fontSize: 13, color: Brand.textSecondary },
    itemPrice: { fontSize: 13, fontWeight: '600', color: Brand.textPrimary },
  
    // Totals footer
    totalsFooter: {
      backgroundColor: Brand.surfaceElevated,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 4,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerLabel: { fontSize: 12, color: Brand.textSecondary },
    footerValue: { fontSize: 12, color: Brand.textSecondary, fontWeight: '600' },
    footerLabelBold: { fontSize: 13, fontWeight: '700', color: Brand.textPrimary },
    footerValueBold: { fontSize: 13, fontWeight: '800', color: Brand.textPrimary },
    discountLabel: { fontSize: 12, color: Brand.birthday, fontWeight: '600' },
    discountValue: { fontSize: 12, color: Brand.birthday, fontWeight: '700' },
  
    // Empty state
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: Brand.textPrimary,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      color: Brand.textSecondary,
      textAlign: 'center',
      lineHeight: 21,
    },
  });