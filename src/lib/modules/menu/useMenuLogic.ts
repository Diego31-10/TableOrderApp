import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { PRODUCTS, TABLES_DATA } from '@/src/lib/core/mockData';
import { useCartStore } from '@/src/stores/useCartStore';
import { useTableStore } from '@/src/stores/useTableStore';
import { Product } from '@/src/lib/core/types';

export function useMenuLogic() {
  const { tableId } = useLocalSearchParams<{ tableId?: string }>();
  const currentTable = useTableStore((s) => s.currentTable);
  const setTable = useTableStore((s) => s.setTable);
  const setBirthdayMode = useCartStore((s) => s.setBirthdayMode);

  // Hydrate table from route params if the store is cold (e.g. deep link or reload)
  useEffect(() => {
    if (tableId && (!currentTable || currentTable.id !== tableId)) {
      setTable(tableId);
    }
  }, [tableId]);

  // Activate birthday mode with discount as soon as the table is known
  useEffect(() => {
    if (!currentTable) return;
    if (currentTable.specialEvent === 'BIRTHDAY') {
      setBirthdayMode(true, currentTable.discount ?? 0);
    } else {
      setBirthdayMode(false, 0);
    }
  }, [currentTable?.id]);

  // Filter products based on the table's menuType
  const products: Product[] =
    currentTable?.menuType === 'DRINKS_ONLY'
      ? PRODUCTS.filter((p) => p.category === 'DRINK')
      : PRODUCTS;

  // Group by category for section rendering
  const sections = [
    { key: 'FOOD', title: 'Platos', data: products.filter((p) => p.category === 'FOOD') },
    { key: 'SNACK', title: 'Snacks', data: products.filter((p) => p.category === 'SNACK') },
    { key: 'DRINK', title: 'Bebidas', data: products.filter((p) => p.category === 'DRINK') },
    { key: 'DESSERT', title: 'Postres', data: products.filter((p) => p.category === 'DESSERT') },
  ].filter((s) => s.data.length > 0);

  return {
    table: currentTable,
    sections,
    isBirthdayMode: currentTable?.specialEvent === 'BIRTHDAY',
    discount: currentTable?.discount ?? 0,
  };
}
