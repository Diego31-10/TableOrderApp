import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bike, QrCode, UserCircle2, LogOut } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Brand } from '@/constants/Colors';
import ModeCard from '@/src/components/ui/ModeCard';
import { useLocationStore } from '@/src/stores/useLocationStore';
import { useCartStore } from '@/src/stores/useCartStore';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48 - 12) / 2;

// ─── Profile Menu ─────────────────────────────────────────────────────────────

function ProfileMenu({
  visible, onClose, onLogout, anchorTop,
}: {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  anchorTop: number;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        {/* El menú se abre justo debajo del botón, alineado a la izquierda */}
        <Pressable
          style={[styles.menuCard, { top: anchorTop, left: 20 }]}
          onPress={() => {}}
        >
          <View style={styles.menuUserRow}>
            <View style={styles.menuAvatar}>
              <UserCircle2 size={22} color="#fff" strokeWidth={1.6} />
            </View>
            <View style={styles.menuUserInfo}>
              <Text style={styles.menuUserName}>Mi cuenta</Text>
              <Text style={styles.menuUserRole}>Cliente</Text>
            </View>
          </View>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={onLogout} activeOpacity={0.7}>
            <LogOut size={18} color={Brand.error} strokeWidth={1.8} />
            <Text style={styles.menuItemText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setAppMode = useLocationStore((s) => s.setAppMode);
  const setServiceType = useCartStore((s) => s.setServiceType);
  const [menuVisible, setMenuVisible] = useState(false);

  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-20);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerY.value = withSpring(0, { damping: 20, stiffness: 100 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const handleTableMode = () => {
    setAppMode('SCANNER');
    setServiceType('TABLE');
    router.push('/(tabs)/scanner');
  };

  const handleDeliveryMode = () => {
    setAppMode('CHECKING');
    setServiceType('DELIVERY');
    router.push('/(tabs)/map');
  };

  const handleLogout = () => {
    setMenuVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/auth');
  };

  // El botón tiene 52px de alto + insets.top de margen desde arriba
  // El menú se abre justo debajo: insets.top + 52 + 8px de gap
  const menuAnchorTop = insets.top + 52 + 8;

  return (
    // No pasamos edges a SafeAreaView porque manejamos el padding manualmente
    // con useSafeAreaInsets para tener control preciso sobre el botón
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Blobs decorativos */}
      <View style={styles.bgDot1} />
      <View style={styles.bgDot2} />
      <View style={styles.bgDot3} />

      {/* ── Botón de perfil — arriba a la izquierda, respetando safe area ── */}
      <TouchableOpacity
        style={[
          styles.profileBtn,
          {
            // insets.top garantiza que no toque la barra de estado del OS
            top: insets.top + 10,
            left: 24,
          },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setMenuVisible(true);
        }}
        activeOpacity={0.8}
      >
        <UserCircle2 size={30} color={Brand.textPrimary} strokeWidth={1.5} />
      </TouchableOpacity>

      {/* Contenido centrado verticalmente */}
      <View style={[styles.content, { paddingTop: insets.top + 72 }]}>
        <Animated.View style={[styles.header, headerStyle]}>
          <Text style={styles.headline}>Bienvenido{'\n'}de nuevo!</Text>
          <Text style={styles.subheadline}>Selecciona tu modalidad</Text>
        </Animated.View>

        <View style={styles.cardsRow}>
          <ModeCard
            icon={<QrCode size={36} color="#fff" strokeWidth={1.6} />}
            label="En el local"
            sublabel="Escanea tu mesa y ordena al instante"
            gradient={['#E25822', '#C04015']}
            onPress={handleTableMode}
            size={CARD_SIZE}
          />
          <ModeCard
            icon={<Bike size={36} color="#fff" strokeWidth={1.6} />}
            label="Delivery"
            sublabel="Recibe tu pedido donde estés"
            gradient={['#2A2A2A', '#1A1A1A']}
            onPress={handleDeliveryMode}
            size={CARD_SIZE}
          />
        </View>

        <Animated.View style={[styles.bottomHint, { opacity: headerOpacity }]}>
          <View style={styles.hintDivider} />
          <Text style={styles.hintText}>Experiencia adaptada a tu ubicación</Text>
          <View style={styles.hintDivider} />
        </Animated.View>
      </View>

      <ProfileMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLogout={handleLogout}
        anchorTop={menuAnchorTop}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.background,
    paddingHorizontal: 24,
  },

  // Blobs decorativos
  bgDot1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(226,88,34,0.06)', top: -80, right: -80 },
  bgDot2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(226,88,34,0.04)', bottom: 60,  left: -60 },
  bgDot3: { position: 'absolute', width: 80,  height: 80,  borderRadius: 40,  backgroundColor: 'rgba(226,88,34,0.08)', bottom: 180, right: 30 },

  // Botón de perfil — posición absoluta, coordenadas calculadas con insets
  profileBtn: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  // Área de contenido principal
  content: {
    flex: 1,
    justifyContent: 'center',
  },

  header: { marginBottom: 36 },
  headline: { fontSize: 36, fontWeight: '800', color: Brand.textPrimary, letterSpacing: -1, lineHeight: 42, marginBottom: 10 },
  subheadline: { fontSize: 15, color: Brand.textSecondary, lineHeight: 22 },

  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },

  bottomHint: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hintDivider: { flex: 1, height: 1, backgroundColor: Brand.border },
  hintText: { fontSize: 12, color: Brand.textTertiary, letterSpacing: 0.2 },

  // Menú desplegable
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  menuCard: {
    position: 'absolute',
    backgroundColor: Brand.surface,
    borderRadius: 18,
    padding: 16,
    minWidth: 220,
    borderWidth: 1,
    borderColor: Brand.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  menuUserRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  menuAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Brand.primary, alignItems: 'center', justifyContent: 'center' },
  menuUserInfo: { flex: 1 },
  menuUserName: { fontSize: 15, fontWeight: '700', color: Brand.textPrimary },
  menuUserRole: { fontSize: 12, color: Brand.textSecondary, marginTop: 1 },
  menuDivider: { height: 1, backgroundColor: Brand.border, marginVertical: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, paddingHorizontal: 2 },
  menuItemText: { fontSize: 15, fontWeight: '600', color: Brand.error },
});