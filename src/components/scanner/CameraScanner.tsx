import { useRef, useCallback, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Linking } from 'react-native';
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
import ScanFrame, { ScanState } from '@/src/components/scanner/ScanFrame';

const FRAME_SIZE = 260;

export default function CameraScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('idle');
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
    setScanState('idle');         // reset frame to neutral after error toast exits
    isProcessing.current = false; // unlock scanner for next attempt
  }, []);

  const onBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      // ── Idempotency check ─────────────────────────────────────────────────
      if (isProcessing.current) return;
      isProcessing.current = true;

      const tableData = TABLES_DATA[data];

      if (tableData) {
        // ── Valid QR: multimodal success feedback ─────────────────────────
        setScanState('success');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        playBeep();
        setTable(data);

        // Brief pause so the user sees the green frame before navigating
        setTimeout(() => {
          router.push({ pathname: '/(tabs)/menu', params: { tableId: data } });
        }, 900);
      } else {
        // ── Invalid QR: error frame + warning haptic + toast ──────────────
        setScanState('error');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        const msg = data.startsWith('TABLE_')
          ? 'Este codigo no pertenece a ninguna mesa de TableOrder.'
          : 'Este codigo QR no es valido para TableOrder.';

        showToast(msg);
        // isProcessing + scanState reset happens inside onToastHide
      }
    },
    [router, setTable, showToast]
  );

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Brand.primary} />
      </View>
    );
  }

  // ── Permission denied ─────────────────────────────────────────────────────
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

      {/* Darkened overlay with the animated scan frame */}
      <View style={styles.overlay}>
        <View style={styles.topMask} />
        <View style={styles.middleRow}>
          <View style={styles.sideMask} />
          <ScanFrame state={scanState} size={FRAME_SIZE} />
          <View style={styles.sideMask} />
        </View>
        <View style={styles.bottomMask} />
      </View>

      {/* Invalid QR toast — slides in from top */}
      <ToastMessage
        visible={toastVisible}
        message={toastMessage}
        onHide={onToastHide}
        duration={2000}
      />
    </View>
  );
}

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
  bottomMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
});
