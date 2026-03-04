import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModeCardProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  gradient: readonly [string, string];
  onPress: () => void;
  size: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ModeCard({
  icon,
  label,
  sublabel,
  gradient,
  onPress,
  size,
}: ModeCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withSpring(0, { damping: 18, stiffness: 120, mass: 0.8 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    onPress();
  };

  return (
    <Animated.View style={[{ width: size, height: size }, animStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touch}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.iconCircle}>{icon}</View>

          <View style={styles.textBlock}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.sublabel}>{sublabel}</Text>
          </View>

          {/* Decorative corner circle */}
          <View style={styles.cornerDot} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  touch: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  textBlock: {
    gap: 4,
  },
  label: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  sublabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 17,
  },
  cornerDot: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -20,
    right: -20,
  },
});