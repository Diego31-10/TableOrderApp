import { useRef, useCallback, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { CameraOff, Settings } from 'lucide-react-native';
import { Brand } from '@/constants/Colors';
import { TABLES_DATA } from '@/src/lib/core/mockData';
import { useTableStore } from '@/src/stores/useTableStore';
import { playBeep } from '@/src/lib/core/sound/SoundService';
import ErrorState from '@/src/components/ui/ErrorState';
import ToastMessage from '@/src/components/ui/ToastMessage';
import { Linking } from 'react-native';

export default function CameraScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const router = useRouter();
  const setTable = useTableStore((s) => s.setTable);

  // Idempotency guard — prevents double-scan processing
  const isProcessing = useRef(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  }, []);

  const onToastHide = useCallback(() => {
    setToastVisible(false);
    // Release the scan lock after the toast exits so the user can retry
    isProcessing.current = false;
  }, []);

  const onBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      // ── Idempotency check ─────────────────────────────────────────────────
      if (isProcessing.current) return;
      isProcessing.current = true;

      const tableData = TABLES_DATA[data];

      if (tableData) {
        // ── Valid QR — full multimodal confirmation ────────────────────────
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        playBeep(); // expo-av short beep
        setTable(data);
        router.push({ pathname: '/(tabs)/menu', params: { tableId: data } });
        // Keep lock true while navigating to prevent re-trigger
      } else {
        // ── Invalid QR — show in-screen toast, auto-reset after dismiss ────
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        const msg = data.startsWith('TABLE_')
          ? 'Este codigo no pertenece a ninguna mesa de TableOrder.'
          : 'Este codigo QR no es valido para TableOrder.';
        showToast(msg);
        // isProcessing.current is reset inside onToastHide after 2.5 s
      }
    },
    [router, setTable, showToast]
  );

  // ── Loading (permissions API not resolved yet) ────────────────────────────
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Brand.primary} />
      </View>
    );
  }

  // ── Permission denied — use reusable ErrorState ───────────────────────────
  if (!permission.granted) {
    return (
      <ErrorState
        icon={<CameraOff size={60} color={Brand.primary} strokeWidth={1.4} />}
        title="Camara bloqueada"
        message="TableOrder necesita acceso a la camara para escanear el codigo QR de tu mesa."
        primaryAction={
          permission.canAskAgain
            ? { label: 'Permitir acceso', onPress: requestPermission }
            : {
                label: 'Abrir configuracion',
                onPress: () => Linking.openSettings(),
                icon: <Settings size={16} color="#fff" strokeWidth={2} />,
              }
        }
        secondaryAction={
          !permission.canAskAgain
            ? {
                label: 'Como habilitar la camara?',
                onPress: () => Linking.openSettings(),
              }
            : undefined
        }
      />
    );
  }

  // ── Camera active ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onBarcodeScanned}
      />

      {/* Darkened overlay with scan frame */}
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
        <View style={styles.bottomMask} />
      </View>

      {/* Invalid QR toast — overlays the camera */}
      <ToastMessage
        visible={toastVisible}
        message={toastMessage}
        onHide={onToastHide}
        duration={2000}
      />
    </View>
  );
}

const FRAME_SIZE = 260;
const CORNER_SIZE = 28;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  middleRow: {
    flexDirection: 'row',
    height: FRAME_SIZE,
  },
  sideMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    backgroundColor: 'transparent',
  },
  bottomMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Brand.primary,
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
