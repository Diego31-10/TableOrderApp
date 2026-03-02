// ─── Table Domain ────────────────────────────────────────────────────────────

export type TableStatus = 'FREE' | 'OCCUPIED' | 'PAYING';

export type MenuType = 'FULL' | 'DRINKS_ONLY';

export type SpecialEvent = 'NONE' | 'BIRTHDAY';

export interface TableData {
  id: string;
  displayName: string;
  status: TableStatus;
  menuType: MenuType;
  specialEvent: SpecialEvent;
  discount?: number;
  animation?: 'cake';
}

// ─── Menu / Product Domain ────────────────────────────────────────────────────

export type ProductCategory = 'FOOD' | 'DRINK' | 'SNACK' | 'DESSERT';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  image: string;
  description?: string;
}

// ─── Cart Domain ─────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}
