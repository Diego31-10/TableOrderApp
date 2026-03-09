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

// ─── Location / Context-Aware Domain ─────────────────────────────────────────

/** Application context mode determined by GPS-based geofencing */
export type AppMode = 'CHECKING' | 'SCANNER' | 'DELIVERY';

/** WGS-84 geographic coordinates */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Decoded Mapbox Directions route metadata */
export interface DeliveryInfo {
  distanceKm: number;
  etaMinutes: number;
  /** Encoded polyline string from Mapbox API */
  polyline: string;
  /** Decoded array of coordinates ready for react-native-maps <Polyline /> */
  decodedRoute: Coordinates[];
}

// ─── Order History Domain ─────────────────────────────────────────────────────

export interface OrderRecord {
  id: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  shippingCost: number;
  serviceType: 'TABLE' | 'DELIVERY';
  tableName?: string;
}