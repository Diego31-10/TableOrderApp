import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Brand } from '@/constants/Colors';

interface Action {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
}

interface ErrorStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  primaryAction?: Action;
  secondaryAction?: Action;
}

/**
 * Generic full-screen error state — replaces the default React Native red box.
 * Used for camera permission denied, network errors, and any unrecoverable flow.
 */
export default function ErrorState({
  icon,
  title,
  message,
  primaryAction,
  secondaryAction,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>{icon}</View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {primaryAction && (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={primaryAction.onPress}
          activeOpacity={0.8}
        >
          {primaryAction.icon}
          <Text style={styles.primaryBtnText}>{primaryAction.label}</Text>
        </TouchableOpacity>
      )}

      {secondaryAction && (
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={secondaryAction.onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryBtnText}>{secondaryAction.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    backgroundColor: Brand.background,
    gap: 12,
  },
  iconWrap: {
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Brand.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    color: Brand.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Brand.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    paddingVertical: 10,
  },
  secondaryBtnText: {
    color: Brand.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
