import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Plus, Minus } from 'lucide-react-native';

import { Brand } from '@/constants/Colors';
import { PRODUCTS } from '@/src/lib/core/mockData';
import { useLocationStore } from '@/src/stores/useLocationStore';
import { useCartStore } from '@/src/stores/useCartStore';
import { Config } from '@/src/lib/core/config';
import { Product } from '@/src/lib/core/types';

// ─── Full menu sections (delivery always shows everything) ────────────────────

const SECTIONS = [
  { key: 'FOOD', title: 'Platos', data: PRODUCTS.filter((p) => p.category === 'FOOD') },
  { key: 'SNACK', title: 'Snacks', data: PRODUCTS.filter((p) => p.category === 'SNACK') },
  { key: 'DRINK', title: 'Bebidas', data: PRODUCTS.filter((p) => p.category === 'DRINK') },
  { key: 'DESSERT', title: 'Postres', data: PRODUCTS.filter((p) => p.category === 'DESSERT') },
].filter((s) => s.data.length > 0);

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const items = useCartStore((s) => s.items);

  const qty = items.find((i) => i.product.id === product.id)?.quantity ?? 0;

  return (
    <View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.cardDesc} numberOfLines={1}>
          {product.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>${product.price.toFixed(2)}</Text>
          {qty === 0 ? (
            <TouchableOpacity style={styles.addBtn} onPress={() => addItem(product)}>
              <Plus size={16} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(product.id)}>
                <Minus size={14} color={Brand.primary} strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => addItem(product)}>
                <Plus size={14} color={Brand.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DeliveryCatalog() {
  const router = useRouter();
  const { userLocation, deliveryInfo, resetLocation } = useLocationStore();
  const { items, total, shippingCost } = useCartStore();

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const grandTotal = (total + shippingCost).toFixed(2);

  const handleBack = () => {
    resetLocation();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ArrowLeft size={22} color={Brand.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Delivery</Text>
          <View style={styles.addressRow}>
            <MapPin size={12} color={Brand.primary} strokeWidth={2} />
            <Text style={styles.addressText} numberOfLines={1}>
              {userLocation
                ? `${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)}`
                : 'Detectando ubicación...'}
            </Text>
          </View>
        </View>
      </View>

      {/* Delivery info banner */}
      <View style={styles.infoBanner}>
        {deliveryInfo ? (
          <>
            <Text style={styles.infoText}>
              {deliveryInfo.distanceKm.toFixed(1)} km · ETA {deliveryInfo.etaMinutes} min
            </Text>
            <Text style={styles.infoPrice}>Envío ${shippingCost.toFixed(2)}</Text>
          </>
        ) : (
          <>
            <Text style={styles.infoText}>Menu completo disponible para delivery</Text>
            <Text style={styles.infoPrice}>${Config.restaurant.costPerKm}/km</Text>
          </>
        )}
      </View>

      {/* Product list — full-width cards for delivery */}
      <SectionList
        sections={SECTIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item, section }) => {
          const idx = section.data.indexOf(item);
          if (idx % 2 !== 0) return null;
          const next = section.data[idx + 1];
          return (
            <View style={styles.row}>
              <ProductCard product={item} />
              {next ? <ProductCard product={next} /> : <View style={styles.cardPlaceholder} />}
            </View>
          );
        }}
      />

      {/* Cart bar */}
      {totalItems > 0 && (
        <Pressable
          style={styles.cartBar}
          onPress={() => router.push('/(checkout)/payment')}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems}</Text>
          </View>
          <Text style={styles.cartBarText}>Ver carrito</Text>
          <Text style={styles.cartBarPrice}>${grandTotal}</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  headerCenter: { flex: 1, gap: 2 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Brand.textPrimary,
    letterSpacing: -0.3,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addressText: { fontSize: 12, color: Brand.textSecondary, flex: 1 },
  infoBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Brand.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: { fontSize: 12, color: Brand.textSecondary, fontWeight: '500' },
  infoPrice: { fontSize: 12, color: Brand.primary, fontWeight: '700' },
  listContent: { paddingBottom: 100 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: Brand.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Brand.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardPlaceholder: { flex: 1 },
  cardImage: { width: '100%', height: 130, backgroundColor: Brand.surfaceElevated },
  cardBody: { padding: 12 },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.textPrimary,
    lineHeight: 18,
  },
  cardDesc: { fontSize: 11, color: Brand.textSecondary, marginTop: 3, lineHeight: 15 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cardPrice: { fontSize: 15, fontWeight: '800', color: Brand.textPrimary },
  addBtn: {
    backgroundColor: Brand.primary,
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.textPrimary,
    minWidth: 16,
    textAlign: 'center',
  },
  cartBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: Brand.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  cartBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    minWidth: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 10,
  },
  cartBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  cartBarText: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' },
  cartBarPrice: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
