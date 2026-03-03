import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CameraScanner from '@/src/components/scanner/CameraScanner';
import ContextSwitcher from '@/src/components/location/ContextSwitcher';
import { Brand } from '@/constants/Colors';
import { useLocationStore } from '@/src/stores/useLocationStore';

export default function MainTab() {
  const appMode = useLocationStore((s) => s.appMode);

  // ── Geofencing check: show map to determine mode ───────────────────────────
  if (appMode === 'CHECKING') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>
            Toca el mapa para seleccionar el restaurante
          </Text>
        </View>
        <View style={styles.mapContainer}>
          <ContextSwitcher />
        </View>
      </SafeAreaView>
    );
  }

  // ── Scanner mode: user is inside the restaurant ────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Escanear mesa</Text>
        <Text style={styles.subtitle}>
          Apunta al codigo QR para comenzar tu pedido
        </Text>
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Brand.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Brand.textSecondary,
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
  },
});
