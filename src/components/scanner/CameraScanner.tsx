import { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { CameraOff, QrCode, Settings } from 'lucide-react-native';
import { TABLES_DATA } from '@/src/lib/core/mockData';
import { useTableStore } from '@/src/stores/useTableStore';

export default function CameraScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const setTable = useTableStore((s) => s.setTable);

  // Idempotency guard — prevents double-scan processing
  const isProcessing = useRef(false);

  const onBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      // ── Idempotency check ─────────────────────────────────────────
      if (isProcessing.current) return;
      isProcessing.current = true;

      // ── Haptic feedback ───────────────────────────────────────────
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // ── QR Validation ─────────────────────────────────────────────
      const tableData = TABLES_DATA[data];

      if (tableData) {
        setTable(data);
        router.push({ pathname: '/(tabs)/menu', params: { tableId: data } });
        // Keep isProcessing true so we don't scan again while navigating
      } else {
        const message = data.startsWith('TABLE_')
          ? 'Este código no pertenece a ninguna mesa de TableOrder.'
          : `Código inválido: "${data}"`;

        Alert.alert('Código no reconocido', message, [
          {
            text: 'Volver a intentar',
            onPress: () => {
              // Reset after 2 seconds for a smooth UX
              setTimeout(() => {
                isProcessing.current = false;
              }, 2000);
            },
          },
        ]);
      }
    },
    [router, setTable]
  );

  // ── Loading state ───────────────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E25822" />
      </View>
    );
  }

  // ── Permission denied ────────────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <CameraOff size={56} color="#E25822" strokeWidth={1.5} />
        <Text style={styles.permissionTitle}>Cámara bloqueada</Text>
        <Text style={styles.permissionText}>
          TableOrder necesita acceso a la cámara para escanear el QR de tu mesa.
        </Text>
        {permission.canAskAgain ? (
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Permitir acceso</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openSettings()}
          >
            <Settings size={16} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Abrir configuración</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Camera active ────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onBarcodeScanned}
      />

      {/* Overlay with scanning frame */}
      <View style={styles.overlay}>
        <View style={styles.topMask} />
        <View style={styles.middleRow}>
          <View style={styles.sideMask} />
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.sideMask} />
        </View>
        <View style={styles.bottomMask}>
          <QrCode size={20} color="#fff" strokeWidth={1.5} style={styles.hintIcon} />
          <Text style={styles.hint}>Apunta al código QR de tu mesa</Text>
        </View>
      </View>
    </View>
  );
}

const FRAME_SIZE = 260;
const CORNER_SIZE = 28;
const CORNER_WIDTH = 4;
const CORNER_COLOR = '#E25822';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#0a0a0a',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    marginTop: 20,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#E25822',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonIcon: {
    // space managed by gap
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  // ── Overlay styles ──────────────────────────────────────────────────────────
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  topMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  middleRow: {
    flexDirection: 'row',
    height: FRAME_SIZE,
  },
  sideMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    backgroundColor: 'transparent',
  },
  bottomMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    paddingTop: 20,
    gap: 8,
  },
  hintIcon: {
    opacity: 0.8,
  },
  hint: {
    color: '#fff',
    fontSize: 15,
    opacity: 0.8,
    fontWeight: '500',
  },
  // ── Scanning frame corners ──────────────────────────────────────────────────
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: CORNER_COLOR,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: 6,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: 6,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: 6,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: 6,
  },
});
