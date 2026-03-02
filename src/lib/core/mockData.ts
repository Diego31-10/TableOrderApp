import { Product, TableData } from './types';

// ─── Products ─────────────────────────────────────────────────────────────────

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=480&h=360&fit=crop&auto=format&q=80`;

export const PRODUCTS: Product[] = [
  // FOOD
  {
    id: 'p01',
    name: 'Hamburguesa Clásica',
    price: 12.99,
    category: 'FOOD',
    image: IMG('1568901346375-23c9450c58cd'), // juicy burger
    description: 'Carne 200g, lechuga, tomate, queso cheddar',
  },
  {
    id: 'p02',
    name: 'Pasta Carbonara',
    price: 10.5,
    category: 'FOOD',
    image: IMG('1621996346565-e3dbc646d9a9'), // creamy pasta
    description: 'Espaguetis, panceta, huevo, parmesano',
  },
  {
    id: 'p03',
    name: 'Ensalada César',
    price: 8.75,
    category: 'FOOD',
    image: IMG('1546793665-c74683f339c1'), // caesar salad
    description: 'Lechuga romana, crutones, parmesano, aderezo César',
  },
  {
    id: 'p04',
    name: 'Pizza Margherita',
    price: 11.0,
    category: 'FOOD',
    image: IMG('1513104890138-7c749659a591'), // margherita pizza
    description: 'Salsa de tomate, mozzarella, albahaca fresca',
  },
  // SNACKS
  {
    id: 'p05',
    name: 'Nachos con Guacamole',
    price: 6.5,
    category: 'SNACK',
    image: IMG('1513456852971-30c0b8199d4d'), // nachos
    description: 'Totopos crujientes con guacamole casero',
  },
  {
    id: 'p06',
    name: 'Alitas BBQ (6 pzs)',
    price: 9.0,
    category: 'SNACK',
    image: IMG('1527477396000-e27163b481c2'), // chicken wings
    description: 'Alitas de pollo glaseadas con salsa BBQ',
  },
  // DRINKS
  {
    id: 'p07',
    name: 'Cerveza Artesanal',
    price: 4.5,
    category: 'DRINK',
    image: IMG('1608270586620-248524c67de9'), // craft beer
    description: 'Rubia, tostada o negra — 500ml',
  },
  {
    id: 'p08',
    name: 'Mojito Clásico',
    price: 7.0,
    category: 'DRINK',
    image: IMG('1551538827-9c037cb4f32a'), // mojito
    description: 'Ron blanco, lima, menta, azúcar, soda',
  },
  {
    id: 'p09',
    name: 'Agua con Gas',
    price: 2.0,
    category: 'DRINK',
    image: IMG('1548839140-29a749e1cf4d'), // sparkling water
    description: 'San Pellegrino 500ml',
  },
  {
    id: 'p10',
    name: 'Smoothie de Mango',
    price: 5.5,
    category: 'DRINK',
    image: IMG('1623065422902-30a2d299bbe4'), // mango smoothie
    description: 'Mango, yogur, miel y un toque de jengibre',
  },
  // DESSERTS
  {
    id: 'p11',
    name: 'Tarta de Chocolate',
    price: 5.0,
    category: 'DESSERT',
    image: IMG('1578985545062-69928b1d9587'), // chocolate cake
    description: 'Tarta casera con ganache de 70% cacao',
  },
  {
    id: 'p12',
    name: 'Tiramisú',
    price: 5.5,
    category: 'DESSERT',
    image: IMG('1571877227200-a0d98ea607e9'), // tiramisu
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
    displayName: 'Mesa Especial',
    status: 'FREE',
    menuType: 'FULL',
    specialEvent: 'BIRTHDAY',
    discount: 0.15,
    animation: 'cake',
  },
};
