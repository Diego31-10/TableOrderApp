import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Lock, Mail, Eye, EyeOff, ChefHat, ArrowRight, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.32;

// ─── Decorative circles ───────────────────────────────────────────────────────

function HeaderCircles() {
  return (
    <>
      <View style={[styles.circle, { width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -60 }]} />
      <View style={[styles.circle, { width: 180, height: 180, borderRadius: 90,  backgroundColor: 'rgba(255,255,255,0.08)', top: 20,  right: 60  }]} />
      <View style={[styles.circle, { width: 90,  height: 90,  borderRadius: 45,  backgroundColor: 'rgba(255,255,255,0.12)', top: 60,  right: 170 }]} />
      <View style={[styles.circle, { width: 140, height: 140, borderRadius: 70,  backgroundColor: 'rgba(192,64,21,0.45)',   bottom: -50, left: -40 }]} />
      <View style={[styles.circle, { width: 50,  height: 50,  borderRadius: 25,  backgroundColor: 'rgba(255,255,255,0.10)', top: 30,  left: 30   }]} />
      <View style={[styles.circle, { width: 200, height: 200, borderRadius: 100, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'transparent', bottom: -100, left: 40 }]} />
    </>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
}

function InputField({
  label, value, onChangeText, placeholder, icon,
  secureTextEntry = false, keyboardType = 'default', autoCapitalize = 'none',
}: InputFieldProps) {
  const [visible, setVisible] = useState(!secureTextEntry);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
        <View style={styles.inputIcon}>{icon}</View>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#C0B8B0"
          secureTextEntry={!visible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setVisible(v => !v)} style={styles.eyeBtn}>
            {visible
              ? <Eye size={18} color="#A09890" strokeWidth={1.8} />
              : <EyeOff size={18} color="#A09890" strokeWidth={1.8} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 40, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleRegister = () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
      setError('Por favor completa todos los campos.');
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Ingresa un correo electrónico válido.');
      shake();
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      shake();
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    }, 800);
  };

  return (
    <View style={styles.screenContainer}>
      {/* Header tomate 32% */}
      <View style={[styles.header, { height: HEADER_HEIGHT }]}>
        <HeaderCircles />
        <SafeAreaView edges={['top']} style={styles.headerContent}>
          {/* Botón volver */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <View style={styles.logoIconWrap}>
              <ChefHat size={28} color="#E25822" strokeWidth={1.8} />
            </View>
            <View>
              <Text style={styles.logoTitle}>TableOrder</Text>
            </View>
          </View>
          <Text style={styles.headerTagline}>
            Aquí comienza una{'\n'}nueva experiencia
          </Text>
        </SafeAreaView>
      </View>

      {/* Formulario blanco 68% */}
      <KeyboardAvoidingView
        style={styles.bodyFlex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.formTitle}>Crear cuenta</Text>

          <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
            <InputField
              label="Nombre completo"
              value={name}
              onChangeText={setName}
              placeholder="Juan Pérez"
              icon={<User size={17} color="#A09890" strokeWidth={1.8} />}
              autoCapitalize="words"
            />
            <InputField
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              icon={<Mail size={17} color="#A09890" strokeWidth={1.8} />}
              keyboardType="email-address"
            />
            <InputField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              icon={<Lock size={17} color="#A09890" strokeWidth={1.8} />}
              secureTextEntry
            />
            <InputField
              label="Confirmar contraseña"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repite tu contraseña"
              icon={<Lock size={17} color="#A09890" strokeWidth={1.8} />}
              secureTextEntry
            />
          </Animated.View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.ctaBtn, loading && styles.ctaBtnLoading]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.ctaBtnText}>Crear cuenta</Text>
                <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.switchHint}
            activeOpacity={0.7}
          >
            <Text style={styles.switchHintText}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.switchHintLink}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#fff' },

  header: { backgroundColor: '#E25822', overflow: 'hidden', position: 'relative' },
  circle: { position: 'absolute' },
  headerContent: { flex: 1, paddingHorizontal: 28, paddingBottom: 24 },
  backBtn: { alignSelf: 'flex-start', marginTop: 4, marginBottom: 8, padding: 4 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  logoIconWrap: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logoTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  logoSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.3, marginTop: 1 },
  headerTagline: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.8, lineHeight: 34 },

  bodyFlex: { flex: 1 },
  body: { flex: 1, backgroundColor: '#fff' },
  bodyContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },

  formTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5, marginBottom: 4 },

  form: { gap: 16 },
  inputWrapper: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#6B6560', textTransform: 'uppercase', letterSpacing: 0.8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F5F2', borderRadius: 14, borderWidth: 1.5, borderColor: '#EDE9E5', paddingHorizontal: 14, height: 52, gap: 10 },
  inputRowFocused: { borderColor: '#E25822', backgroundColor: '#FFF9F6' },
  inputIcon: { width: 22, alignItems: 'center' },
  textInput: { flex: 1, fontSize: 15, color: '#1A1A1A', height: '100%' },
  eyeBtn: { padding: 4 },

  errorBox: { marginTop: 16, backgroundColor: '#FFF0EE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#FFCFC8' },
  errorText: { fontSize: 13, color: '#C04015', fontWeight: '500', textAlign: 'center' },

  ctaBtn: { marginTop: 24, backgroundColor: '#E25822', borderRadius: 16, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#E25822', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.40, shadowRadius: 14, elevation: 8 },
  ctaBtnLoading: { opacity: 0.75, shadowOpacity: 0, elevation: 0 },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },

  switchHint: { alignItems: 'center', marginTop: 24, paddingVertical: 4 },
  switchHintText: { fontSize: 14, color: '#9A9080' },
  switchHintLink: { color: '#E25822', fontWeight: '700' },
});