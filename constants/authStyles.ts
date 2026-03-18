import { StyleSheet } from 'react-native';

export const stylesAuth = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#fff' },

  header: { backgroundColor: '#E25822', overflow: 'hidden', position: 'relative' },
  circle: { position: 'absolute' },
  headerContent: { flex: 1, paddingHorizontal: 28, justifyContent: 'space-between', paddingBottom: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  logoIconWrap: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logoTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  headerTagline: { fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: -1, lineHeight: 38 },

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