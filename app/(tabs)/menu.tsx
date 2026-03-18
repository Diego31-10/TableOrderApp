import {
    View,
    Text,
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

  import { stylesMenu } from '@/constants/menuStyles';
  
  // ─── Product Card ─────────────────────────────────────────────────────────────
  
  function ProductCard({ product }: { product: Product }) {
    const addItem = useCartStore((s) => s.addItem);
    const removeItem = useCartStore((s) => s.removeItem);
    const items = useCartStore((s) => s.items);
  
    const quantity = items.find((i) => i.product.id === product.id)?.quantity ?? 0;
  
    return (
      <View style={stylesMenu.card}>
        <Image source={{ uri: product.image }} style={stylesMenu.cardImage} resizeMode="cover" />
        <View style={stylesMenu.cardBody}>
          <Text style={stylesMenu.cardName} numberOfLines={2}>{product.name}</Text>
          <Text style={stylesMenu.cardDesc} numberOfLines={1}>{product.description}</Text>
          <View style={stylesMenu.cardFooter}>
            <Text style={stylesMenu.cardPrice}>${product.price.toFixed(2)}</Text>
            {quantity === 0 ? (
              <TouchableOpacity style={stylesMenu.addBtn} onPress={() => addItem(product)} activeOpacity={0.75}>
                <Plus size={16} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            ) : (
              <View style={stylesMenu.qtyRow}>
                <TouchableOpacity style={stylesMenu.qtyBtn} onPress={() => removeItem(product.id)}>
                  <Minus size={14} color={Brand.primary} strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={stylesMenu.qtyText}>{quantity}</Text>
                <TouchableOpacity style={stylesMenu.qtyBtn} onPress={() => addItem(product)}>
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
      <Pressable style={stylesMenu.cartBar} onPress={() => router.push('/(checkout)/payment')}>
        <View style={stylesMenu.cartBadge}>
          <Text style={stylesMenu.cartBadgeText}>{totalItems}</Text>
        </View>
        <Text style={stylesMenu.cartBarText}>Ver carrito</Text>
        <Text style={stylesMenu.cartBarPrice}>${total.toFixed(2)}</Text>
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
      <SafeAreaView style={stylesMenu.container} edges={['top']}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={stylesMenu.listContent}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View>
              {/* Header */}
              <View style={stylesMenu.header}>
                <TouchableOpacity onPress={handleBack} style={stylesMenu.backBtn}>
                  <ArrowLeft size={22} color={Brand.textPrimary} strokeWidth={2} />
                </TouchableOpacity>
                <View style={stylesMenu.headerText}>
                  <Text style={stylesMenu.tableLabel}>Mesa</Text>
                  <Text style={stylesMenu.tableName}>{table?.displayName ?? '—'}</Text>
                </View>
                {table?.menuType === 'DRINKS_ONLY' && (
                  <View style={stylesMenu.menuTypeBadge}>
                    <Text style={stylesMenu.menuTypeBadgeText}>Solo bebidas</Text>
                  </View>
                )}
              </View>
              {isBirthdayMode && <BirthdayBanner discount={discount} />}
            </View>
          }
          renderSectionHeader={({ section }) => (
            <Text style={stylesMenu.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item, section }) => {
            const index = section.data.indexOf(item);
            if (index % 2 !== 0) return null;
            const next = section.data[index + 1];
            return (
              <View style={stylesMenu.row}>
                <ProductCard product={item} />
                {next ? <ProductCard product={next} /> : <View style={stylesMenu.cardPlaceholder} />}
              </View>
            );
          }}
        />
        <CartBar />
      </SafeAreaView>
    );
  }