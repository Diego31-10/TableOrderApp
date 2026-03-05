import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { Brand } from '@/constants/Colors';
import CameraScanner from '@/src/components/scanner/CameraScanner';
import { useLocationStore } from '@/src/stores/useLocationStore';
import { useCartStore } from '@/src/stores/useCartStore';

export default function ScannerScreen() {
  const router = useRouter();
  const setAppMode = useLocationStore((s) => s.setAppMode);
  const setServiceType = useCartStore((s) => s.setServiceType);

  const handleBack = () => {
    // Reset mode so the home screen doesn't skip the selection again
    setAppMode('CHECKING');
    setServiceType('TABLE');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ArrowLeft size={22} color={Brand.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Escanear mesa</Text>
          <Text style={styles.subtitle}>Apunta al código QR para comenzar</Text>
        </View>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraScanner />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Brand.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
  },
});