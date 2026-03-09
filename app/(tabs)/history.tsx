import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
  } from 'react-native';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { useRouter } from 'expo-router';
  import { ArrowLeft, Receipt } from 'lucide-react-native';
  
  import { Brand } from '@/constants/Colors';
  import { useOrderHistoryStore } from '@/src/stores/useOrderHistoryStore';
  import { OrderRecord } from '@/src/lib/core/types';
  
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={Brand.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial</Text>
        </View>
  
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            orders.length === 0 ? styles.emptyList : styles.listContent
          }
          ListEmptyComponent={<EmptyState />}
          renderItem={() => null}
          showsVerticalScrollIndicator={false}
        />
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
    listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 14 },
    emptyList: { flex: 1 },
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