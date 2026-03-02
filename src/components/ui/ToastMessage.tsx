import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { AlertCircle } from 'lucide-react-native';
import { Brand } from '@/constants/Colors';

interface ToastMessageProps {
  visible: boolean;
  message: string;
  onHide: () => void;
  /** Auto-dismiss delay in ms. Default: 2500 */
  duration?: number;
}

/**
 * Animated in-screen toast — replaces system Alert for non-blocking feedback.
 * Slides in from the top, holds for `duration` ms, then fades out.
 * Calls `onHide` when the exit animation completes so the parent can reset state.
 */
export default function ToastMessage({
  visible,
  message,
  onHide,
  duration = 2500,
}: ToastMessageProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 250 }),
        withTiming(1, { duration: duration }),
        withTiming(0, { duration: 300 }, (finished) => {
          if (finished) runOnJS(onHide)();
        })
      );
      translateY.value = withSequence(
        withTiming(0, { duration: 250 }),
        withTiming(0, { duration: duration }),
        withTiming(-20, { duration: 300 })
      );
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animStyle]} pointerEvents="none">
      <AlertCircle size={18} color="#fff" strokeWidth={2} />
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Brand.border,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  text: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
