import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolateColor,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { CheckCircle, AlertCircle } from 'lucide-react-native';
import { Brand } from '@/constants/Colors';

export type ScanState = 'idle' | 'success' | 'error';

interface ScanFrameProps {
  state: ScanState;
  size?: number;
}

const CORNER_SIZE = 30;
const CORNER_WIDTH = 4;
const CORNER_RADIUS = 7;

// ─── Animated corner ─────────────────────────────────────────────────────────
// A single reusable animated corner view that interpolates its border color.

interface CornerProps {
  style: object;
  colorValue: Animated.SharedValue<number>;
}

function AnimatedCorner({ style, colorValue }: CornerProps) {
  const animStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      colorValue.value,
      [-1, 0, 1],
      [Brand.error, 'rgba(255,255,255,0.85)', Brand.success]
    ),
  }));
  return <Animated.View style={[styles.cornerBase, style, animStyle]} />;
}

// ─── ScanFrame ────────────────────────────────────────────────────────────────

export default function ScanFrame({ state, size = 260 }: ScanFrameProps) {
  /**
   * colorValue drives ALL color interpolations:
   *  -1 → Brand.error (red)
   *   0 → white (idle)
   *   1 → Brand.success (green)
   */
  const colorValue = useSharedValue(0);

  // Scanning line: 0 = top, 1 = bottom of frame
  const scanLineY = useSharedValue(0);
  const scanLineOpacity = useSharedValue(0);

  // Center icon fade
  const iconOpacity = useSharedValue(0);

  // Subtle frame fill tint
  const fillOpacity = useSharedValue(0);

  // Frame scale pulse
  const frameScale = useSharedValue(1);

  useEffect(() => {
    if (state === 'idle') {
      // ── Reset to neutral ──────────────────────────────────────────────────
      colorValue.value = withTiming(0, { duration: 400 });
      iconOpacity.value = withTiming(0, { duration: 200 });
      fillOpacity.value = withTiming(0, { duration: 300 });

      // Restart scanning line
      scanLineOpacity.value = withTiming(0.7, { duration: 300 });
      scanLineY.value = withRepeat(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        -1,   // infinite
        true  // reverse direction each cycle
      );
    } else if (state === 'success') {
      // ── Success ───────────────────────────────────────────────────────────
      cancelAnimation(scanLineY);
      scanLineOpacity.value = withTiming(0, { duration: 150 });

      colorValue.value = withTiming(1, { duration: 350 });
      iconOpacity.value = withTiming(1, { duration: 400 });
      fillOpacity.value = withTiming(1, { duration: 350 });

      // Quick scale pulse: grow → shrink → settle
      frameScale.value = withSequence(
        withTiming(1.05, { duration: 140 }),
        withTiming(0.98, { duration: 100 }),
        withTiming(1.0, { duration: 160 })
      );
    } else if (state === 'error') {
      // ── Error ─────────────────────────────────────────────────────────────
      cancelAnimation(scanLineY);
      scanLineOpacity.value = withTiming(0, { duration: 150 });

      colorValue.value = withTiming(-1, { duration: 300 });
      iconOpacity.value = withTiming(1, { duration: 300 });
      fillOpacity.value = withTiming(1, { duration: 300 });

      // Sharp shake: left → right → settle
      frameScale.value = withSequence(
        withTiming(0.97, { duration: 80 }),
        withTiming(1.02, { duration: 80 }),
        withTiming(0.99, { duration: 60 }),
        withTiming(1.0, { duration: 80 })
      );
    }
  }, [state]);

  // ── Animated styles ────────────────────────────────────────────────────────

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: frameScale.value }],
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    // scanLineY 0→1 maps to 0→(size-4) pixels from the top
    transform: [{ translateY: scanLineY.value * (size - 4) }],
    opacity: scanLineOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: 0.8 + iconOpacity.value * 0.2 }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    opacity: fillOpacity.value,
    backgroundColor: interpolateColor(
      colorValue.value,
      [-1, 0, 1],
      ['rgba(255,59,48,0.10)', 'transparent', 'rgba(52,199,89,0.10)']
    ),
  }));

  const iconColor = state === 'success' ? Brand.success : Brand.error;

  return (
    <Animated.View style={[{ width: size, height: size }, containerStyle]}>
      {/* Subtle colored fill behind the frame */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.fill, fillStyle]} />

      {/* Scanning line — only active during idle */}
      <Animated.View style={[styles.scanLine, { width: size - 48 }, scanLineStyle]} />

      {/* Corners */}
      <AnimatedCorner colorValue={colorValue} style={styles.topLeft} />
      <AnimatedCorner colorValue={colorValue} style={styles.topRight} />
      <AnimatedCorner colorValue={colorValue} style={styles.bottomLeft} />
      <AnimatedCorner colorValue={colorValue} style={styles.bottomRight} />

      {/* Center icon — fades in on success or error */}
      <Animated.View style={[styles.iconContainer, iconStyle]}>
        {state === 'success' ? (
          <CheckCircle size={52} color={iconColor} strokeWidth={1.5} />
        ) : state === 'error' ? (
          <AlertCircle size={52} color={iconColor} strokeWidth={1.5} />
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fill: {
    borderRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.75)',
    // Subtle center glow via shadow
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 2,
  },
  cornerBase: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: CORNER_RADIUS,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: CORNER_RADIUS,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: CORNER_RADIUS,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: CORNER_RADIUS,
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
