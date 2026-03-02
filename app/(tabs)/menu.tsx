import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShoppingCart, Plus, Minus, QrCode } from 'lucide-react-native';
import { Brand } from '@/constants/Colors';
import { useMenuLogic } from '@/src/lib/modules/menu/useMenuLogic';
import { useCartStore } from '@/src/stores/useCartStore';
import BirthdayBanner from '@/src/components/ui/BirthdayBanner';
import { Product } from '@/src/lib/core/types';

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const items = useCartStore((s) => s.items);

  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: product.image }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.cardDesc} numberOfLines={1}>
          {product.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>${product.price.toFixed(2)}</Text>
          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addItem(product)}
              activeOpacity={0.75}
            >
              <Plus size={16} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => removeItem(product.id)}
              >
                <Minus size={14} color={Brand.primary} strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => addItem(product)}
              >
                <Plus size={14} color={Brand.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Cart Bar ─────────────────────────────────────────────────────────────────

function CartBar() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  if (totalItems === 0) return null;

  return (
    <Pressable
      style={styles.cartBar}
      onPress={() => router.push('/(checkout)/payment')}
    >
      <View style={styles.cartBadge}>
        <Text style={styles.cartBadgeText}>{totalItems}</Text>
      </View>
      <Text style={styles.cartBarText}>Ver carrito</Text>
      <Text style={styles.cartBarPrice}>${total.toFixed(2)}</Text>
    </Pressable>
  );
}

// ─── Empty state (no table scanned) ──────────────────────────────────────────

function EmptyState() {
  const router = useRouter();
  return (
    <View style={styles.emptyState}>
      <QrCode size={64} color={Brand.textTertiary} strokeWidth={1.2} />
      <Text style={styles.emptyTitle}>Ninguna mesa activa</Text>
      <Text style={styles.emptySubtitle}>
        Escanea el codigo QR de tu mesa para ver el menu
      </Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.emptyBtnText}>Ir al escaner</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MenuScreen() {
  const { table, sections, isBirthdayMode, discount } = useMenuLogic();

  if (!table) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.tableLabel}>Mesa</Text>
              <Text style={styles.tableName}>{table.displayName}</Text>
              {table.menuType === 'DRINKS_ONLY' && (
                <Text style={styles.menuTypeBadge}>Solo bebidas</Text>
              )}
            </View>
            {isBirthdayMode && <BirthdayBanner discount={discount} />}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item, section }) => {
          // Render 2-column rows manually: only render on even index
          const index = section.data.indexOf(item);
          if (index % 2 !== 0) return null;
          const next = section.data[index + 1];
          return (
            <View style={styles.row}>
              <ProductCard product={item} />
              {next ? (
                <ProductCard product={next} />
              ) : (
                <View style={styles.cardPlaceholder} />
              )}
            </View>
          );
        }}
      />
      <CartBar />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_WIDTH = '48%';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  tableLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Brand.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  tableName: {
    fontSize: 26,
    fontWeight: '800',
    color: Brand.textPrimary,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  menuTypeBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: Brand.surfaceElevated,
    color: Brand.textSecondary,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: 'hidden',
  },
  // Section header
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: Brand.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  // Row of 2 cards
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  // Product card
  card: {
    width: CARD_WIDTH,
    backgroundColor: Brand.surface,
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
  },
  cardPlaceholder: {
    flex: 1,
  },
  cardImage: {
    width: '100%',
    height: 130,
    backgroundColor: Brand.surfaceElevated,
  },
  cardBody: {
    padding: 12,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.textPrimary,
    lineHeight: 18,
  },
  cardDesc: {
    fontSize: 11,
    color: Brand.textSecondary,
    marginTop: 3,
    lineHeight: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Brand.textPrimary,
  },
  addBtn: {
    backgroundColor: Brand.primary,
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
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
  // Cart bar
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
  cartBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  cartBarText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cartBarPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  // Empty state
  emptyState: {
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
  emptyBtn: {
    marginTop: 8,
    backgroundColor: Brand.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
