import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Cake, Tag } from 'lucide-react-native';
import { Brand } from '@/constants/Colors';

interface Props {
  discount: number;
}

export default function BirthdayBanner({ discount }: Props) {
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 14, stiffness: 110 });
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const pct = Math.round(discount * 100);

  return (
    <Animated.View style={[styles.banner, animStyle]}>
      <Cake size={22} color={Brand.birthday} strokeWidth={1.8} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Mesa de celebracion</Text>
        <Text style={styles.subtitle}>Tienes un descuento especial aplicado</Text>
      </View>
      <View style={styles.badge}>
        <Tag size={12} color={Brand.background} strokeWidth={2} />
        <Text style={styles.badgeText}>{pct}% OFF</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2200',
    borderWidth: 1,
    borderColor: Brand.birthday,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.birthday,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    color: '#B89B00',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.birthday,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Brand.background,
    letterSpacing: 0.5,
  },
});
