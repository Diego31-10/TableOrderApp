import { Product, TableData } from './types';

// ─── Products ─────────────────────────────────────────────────────────────────

export const PRODUCTS: Product[] = [
  // FOOD
  {
    id: 'p01',
    name: 'Hamburguesa Clásica',
    price: 12.99,
    category: 'FOOD',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    description: 'Carne 200g, lechuga, tomate, queso cheddar',
  },
  {
    id: 'p02',
    name: 'Pasta Carbonara',
    price: 10.5,
    category: 'FOOD',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
    description: 'Espaguetis, panceta, huevo, parmesano',
  },
  {
    id: 'p03',
    name: 'Ensalada César',
    price: 8.75,
    category: 'FOOD',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    description: 'Lechuga romana, crutones, parmesano, aderezo César',
  },
  {
    id: 'p04',
    name: 'Pizza Margherita',
    price: 11.0,
    category: 'FOOD',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
    description: 'Salsa de tomate, mozzarella, albahaca fresca',
  },
  // SNACKS
  {
    id: 'p05',
    name: 'Nachos con Guacamole',
    price: 6.5,
    category: 'SNACK',
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400',
    description: 'Totopos crujientes con guacamole casero',
  },
  {
    id: 'p06',
    name: 'Alitas BBQ (6 pzs)',
    price: 9.0,
    category: 'SNACK',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400',
    description: 'Alitas de pollo glaseadas con salsa BBQ',
  },
  // DRINKS
  {
    id: 'p07',
    name: 'Cerveza Artesanal',
    price: 4.5,
    category: 'DRINK',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
    description: 'Rubia, tostada o negra — 500ml',
  },
  {
    id: 'p08',
    name: 'Mojito Clásico',
    price: 7.0,
    category: 'DRINK',
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400',
    description: 'Ron blanco, lima, menta, azúcar, soda',
  },
  {
    id: 'p09',
    name: 'Agua con Gas',
    price: 2.0,
    category: 'DRINK',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400',
    description: 'San Pellegrino 500ml',
  },
  {
    id: 'p10',
    name: 'Smoothie de Mango',
    price: 5.5,
    category: 'DRINK',
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400',
    description: 'Mango, yogur, miel y un toque de jengibre',
  },
  // DESSERTS
  {
    id: 'p11',
    name: 'Tarta de Chocolate',
    price: 5.0,
    category: 'DESSERT',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    description: 'Tarta casera con ganache de 70% cacao',
  },
  {
    id: 'p12',
    name: 'Tiramisú',
    price: 5.5,
    category: 'DESSERT',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    description: 'Clásico italiano con mascarpone y bizcochos',
  },
];

// ─── Tables ───────────────────────────────────────────────────────────────────

export const TABLES_DATA: Record<string, TableData> = {
  TABLE_BAR_01: {
    id: 'TABLE_BAR_01',
    displayName: 'Barra 01',
    status: 'FREE',
    menuType: 'DRINKS_ONLY',
    specialEvent: 'NONE',
  },
  TABLE_HALL_05: {
    id: 'TABLE_HALL_05',
    displayName: 'Salón 05',
    status: 'FREE',
    menuType: 'FULL',
    specialEvent: 'NONE',
  },
  TABLE_BDAY_99: {
    id: 'TABLE_BDAY_99',
    displayName: 'Mesa Especial ✨',
    status: 'FREE',
    menuType: 'FULL',
    specialEvent: 'BIRTHDAY',
    discount: 0.15,
    animation: 'cake',
  },
};
