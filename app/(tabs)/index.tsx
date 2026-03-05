import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bike, QrCode } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { Brand } from '@/constants/Colors';
import ModeCard from '@/src/components/ui/ModeCard';
import { useLocationStore } from '@/src/stores/useLocationStore';
import { useCartStore } from '@/src/stores/useCartStore';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48 - 12) / 2;

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const setAppMode = useLocationStore((s) => s.setAppMode);
  const setServiceType = useCartStore((s) => s.setServiceType);

  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-20);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerY.value = withSpring(0, { damping: 20, stiffness: 100 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  // ── "En el local": ir directo al escáner QR ───────────────────────────────
  const handleTableMode = () => {
    setAppMode('SCANNER');
    setServiceType('TABLE');
    router.push('/(tabs)/scanner');
  };

  // ── "Delivery": ir al mapa para que el usuario ubique el restaurante ───────
  // ContextSwitcher detecta la ubicación, el usuario toca el pin del
  // restaurante y automáticamente navega a delivery-catalog.
  const handleDeliveryMode = () => {
    setAppMode('CHECKING');
    setServiceType('DELIVERY');
    router.push('/(tabs)/map');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      {/* Background decorative blobs */}
      <View style={styles.bgDot1} />
      <View style={styles.bgDot2} />
      <View style={styles.bgDot3} />

      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <Text style={styles.headline}>
          Bienvenido{'\n'}de nuevo!
        </Text>
        <Text style={styles.subheadline}>
          Selecciona tu modalidad
        </Text>
      </Animated.View>

      {/* Mode selection buttons */}
      <View style={styles.cardsRow}>
        <ModeCard
          icon={<QrCode size={36} color="#fff" strokeWidth={1.6} />}
          label="En el local"
          sublabel="Escanea tu mesa y ordena al instante"
          gradient={['#E25822', '#C04015']}
          onPress={handleTableMode}
          size={CARD_SIZE}
        />
        <ModeCard
          icon={<Bike size={36} color="#fff" strokeWidth={1.6} />}
          label="Delivery"
          sublabel="Recibe tu pedido donde estés"
          gradient={['#2A2A2A', '#1A1A1A']}
          onPress={handleDeliveryMode}
          size={CARD_SIZE}
        />
      </View>

      {/* Bottom hint */}
      <Animated.View style={[styles.bottomHint, { opacity: headerOpacity }]}>
        <View style={styles.hintDivider} />
        <Text style={styles.hintText}>Experiencia adaptada a tu ubicación</Text>
        <View style={styles.hintDivider} />
      </Animated.View>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  bgDot1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(226, 88, 34, 0.06)',
    top: -80,
    right: -80,
  },
  bgDot2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(226, 88, 34, 0.04)',
    bottom: 60,
    left: -60,
  },
  bgDot3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(226, 88, 34, 0.08)',
    bottom: 180,
    right: 30,
  },
  header: {
    marginBottom: 36,
  },
  headline: {
    fontSize: 36,
    fontWeight: '800',
    color: Brand.textPrimary,
    letterSpacing: -1,
    lineHeight: 42,
    marginBottom: 10,
  },
  subheadline: {
    fontSize: 15,
    color: Brand.textSecondary,
    lineHeight: 22,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  bottomHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hintDivider: {
    flex: 1,
    height: 1,
    backgroundColor: Brand.border,
  },
  hintText: {
    fontSize: 12,
    color: Brand.textTertiary,
    letterSpacing: 0.2,
  },
});