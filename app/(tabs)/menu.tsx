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
  import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react-native';
  
  import { Brand } from '@/constants/Colors';
  import { useMenuLogic } from '@/src/lib/modules/menu/useMenuLogic';
  import { useCartStore } from '@/src/stores/useCartStore';
  import { useTableStore } from '@/src/stores/useTableStore';
  import BirthdayBanner from '@/src/components/ui/BirthdayBanner';
  import { Product } from '@/src/lib/core/types';
  
  // ─── Product Card ─────────────────────────────────────────────────────────────
  
  function ProductCard({ product }: { product: Product }) {
    const addItem = useCartStore((s) => s.addItem);
    const removeItem = useCartStore((s) => s.removeItem);
    const items = useCartStore((s) => s.items);
  
    const quantity = items.find((i) => i.product.id === product.id)?.quantity ?? 0;
  
    return (
      <View style={styles.card}>
        <Image source={{ uri: product.image }} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.cardDesc} numberOfLines={1}>{product.description}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>${product.price.toFixed(2)}</Text>
            {quantity === 0 ? (
              <TouchableOpacity style={styles.addBtn} onPress={() => addItem(product)} activeOpacity={0.75}>
                <Plus size={16} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            ) : (
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(product.id)}>
                  <Minus size={14} color={Brand.primary} strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
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
  
  // ─── Cart Bar ─────────────────────────────────────────────────────────────────
  
  function CartBar() {
    const router = useRouter();
    const items = useCartStore((s) => s.items);
    const total = useCartStore((s) => s.total);
    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  
    if (totalItems === 0) return null;
  
    return (
      <Pressable style={styles.cartBar} onPress={() => router.push('/(checkout)/payment')}>
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{totalItems}</Text>
        </View>
        <Text style={styles.cartBarText}>Ver carrito</Text>
        <Text style={styles.cartBarPrice}>${total.toFixed(2)}</Text>
      </Pressable>
    );
  }
  
  // ─── Main Screen ──────────────────────────────────────────────────────────────
  
  export default function MenuScreen() {
    const router = useRouter();
    const { table, sections, isBirthdayMode, discount } = useMenuLogic();
    const clearSession = useTableStore((s) => s.clearSession);
    const resetCart = useCartStore((s) => s.resetCart);
  
    const handleBack = () => {
      clearSession();
      resetCart();
      router.replace('/(tabs)/scanner');
    };
  
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                  <ArrowLeft size={22} color={Brand.textPrimary} strokeWidth={2} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                  <Text style={styles.tableLabel}>Mesa</Text>
                  <Text style={styles.tableName}>{table?.displayName ?? '—'}</Text>
                </View>
                {table?.menuType === 'DRINKS_ONLY' && (
                  <View style={styles.menuTypeBadge}>
                    <Text style={styles.menuTypeBadgeText}>Solo bebidas</Text>
                  </View>
                )}
              </View>
              {isBirthdayMode && <BirthdayBanner discount={discount} />}
            </View>
          }
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item, section }) => {
            const index = section.data.indexOf(item);
            if (index % 2 !== 0) return null;
            const next = section.data[index + 1];
            return (
              <View style={styles.row}>
                <ProductCard product={item} />
                {next ? <ProductCard product={next} /> : <View style={styles.cardPlaceholder} />}
              </View>
            );
          }}
        />
        <CartBar />
      </SafeAreaView>
    );
  }
  
  // ─── Styles ───────────────────────────────────────────────────────────────────
  
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Brand.background },
    listContent: { paddingBottom: 100 },
  
    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      gap: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: Brand.surface,
      borderWidth: 1,
      borderColor: Brand.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: { flex: 1, gap: 1 },
    tableLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: Brand.primary,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    tableName: {
      fontSize: 22,
      fontWeight: '800',
      color: Brand.textPrimary,
      letterSpacing: -0.5,
    },
    menuTypeBadge: {
      backgroundColor: Brand.surfaceElevated,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    menuTypeBadgeText: {
      fontSize: 11,
      color: Brand.textSecondary,
      fontWeight: '600',
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
  
    // 2-column product grid
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
    cardName: { fontSize: 13, fontWeight: '700', color: Brand.textPrimary, lineHeight: 18 },
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
    cartBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
    cartBarText: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' },
    cartBarPrice: { color: '#fff', fontSize: 16, fontWeight: '800' },
  });