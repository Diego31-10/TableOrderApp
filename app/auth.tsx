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
import { Lock, Mail, Eye, EyeOff, ChefHat, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { stylesAuth } from '@/constants/authStyles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.32;

// ─── Decorative circles ───────────────────────────────────────────────────────

function HeaderCircles() {
  return (
    <>
      <View style={[stylesAuth.circle, { width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -60 }]} />
      <View style={[stylesAuth.circle, { width: 180, height: 180, borderRadius: 90,  backgroundColor: 'rgba(255,255,255,0.08)', top: 20,  right: 60  }]} />
      <View style={[stylesAuth.circle, { width: 90,  height: 90,  borderRadius: 45,  backgroundColor: 'rgba(255,255,255,0.12)', top: 60,  right: 170 }]} />
      <View style={[stylesAuth.circle, { width: 140, height: 140, borderRadius: 70,  backgroundColor: 'rgba(192,64,21,0.45)',   bottom: -50, left: -40 }]} />
      <View style={[stylesAuth.circle, { width: 50,  height: 50,  borderRadius: 25,  backgroundColor: 'rgba(255,255,255,0.10)', top: 30,  left: 30   }]} />
      <View style={[stylesAuth.circle, { width: 200, height: 200, borderRadius: 100, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'transparent', bottom: -100, left: 40 }]} />
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
}

function InputField({
  label, value, onChangeText, placeholder, icon,
  secureTextEntry = false, keyboardType = 'default',
}: InputFieldProps) {
  const [visible, setVisible] = useState(!secureTextEntry);
  const [focused, setFocused] = useState(false);

  return (
    <View style={stylesAuth.inputWrapper}>
      <Text style={stylesAuth.inputLabel}>{label}</Text>
      <View style={[stylesAuth.inputRow, focused && stylesAuth.inputRowFocused]}>
        <View style={stylesAuth.inputIcon}>{icon}</View>
        <TextInput
          style={stylesAuth.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#C0B8B0"
          secureTextEntry={!visible}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setVisible(v => !v)} style={stylesAuth.eyeBtn}>
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

export default function AuthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleLogin = () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
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
    <View style={stylesAuth.screenContainer}>
      {/* Header tomate 32% */}
      <View style={[stylesAuth.header, { height: HEADER_HEIGHT }]}>
        <HeaderCircles />
        <SafeAreaView edges={['top']} style={stylesAuth.headerContent}>
          <View style={stylesAuth.logoRow}>
            <View style={stylesAuth.logoIconWrap}>
              <ChefHat size={28} color="#E25822" strokeWidth={1.8} />
            </View>
            <View>
              <Text style={stylesAuth.logoTitle}>TableOrder</Text>
            </View>
          </View>
          <Text style={stylesAuth.headerTagline}>
            Bienvenido de{'\n'}vuelta
          </Text>
        </SafeAreaView>
      </View>

      {/* Formulario blanco 68% */}
      <KeyboardAvoidingView
        style={stylesAuth.bodyFlex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={stylesAuth.body}
          contentContainerStyle={stylesAuth.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={stylesAuth.formTitle}>Iniciar sesión</Text>

          <Animated.View style={[stylesAuth.form, { transform: [{ translateX: shakeAnim }] }]}>
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
              placeholder="••••••••"
              icon={<Lock size={17} color="#A09890" strokeWidth={1.8} />}
              secureTextEntry
            />
          </Animated.View>

          {error ? (
            <View style={stylesAuth.errorBox}>
              <Text style={stylesAuth.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[stylesAuth.ctaBtn, loading && stylesAuth.ctaBtnLoading]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={stylesAuth.ctaBtnText}>Entrar</Text>
                <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
              </>
            )}
          </TouchableOpacity>

          {/* Link a registro */}
          <TouchableOpacity
            onPress={() => router.push('/register')}
            style={stylesAuth.switchHint}
            activeOpacity={0.7}
          >
            <Text style={stylesAuth.switchHintText}>
              ¿No tienes cuenta?{' '}
              <Text style={stylesAuth.switchHintLink}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}