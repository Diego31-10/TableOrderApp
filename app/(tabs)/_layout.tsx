import { Tabs } from 'expo-router';
import { QrCode, UtensilsCrossed } from 'lucide-react-native';
import { Brand } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const scheme = Colors[colorScheme ?? 'dark'];

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
          tabBarIcon: ({ color, size }) => (
            <UtensilsCrossed size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      {/* Hide legacy boilerplate tab from the tab bar */}
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
