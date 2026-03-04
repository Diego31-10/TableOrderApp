import { Tabs } from 'expo-router';
import { QrCode, UtensilsCrossed, Clock } from 'lucide-react-native';
import { Brand } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useCartStore } from '@/src/stores/useCartStore';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const scheme = Colors[colorScheme ?? 'dark'];

  const cartItems = useCartStore((s) => s.items);
  const totalCartItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Brand.surface,
          borderTopColor: Brand.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Brand.primary,
        tabBarInactiveTintColor: scheme.tabIconDefault,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Escanear',
          tabBarIcon: ({ color, size }) => (
            <QrCode size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarBadge: totalCartItems > 0 ? totalCartItems : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Brand.primary,
            fontSize: 10,
            fontWeight: '800',
            minWidth: 18,
            height: 18,
          },
          tabBarIcon: ({ color, size }) => (
            <UtensilsCrossed size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <Clock size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}