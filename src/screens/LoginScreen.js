import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, Platform, Alert,
} from 'react-native';
import { ref, push, get } from 'firebase/database';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Navigation will be handled by App.js onAuthStateChanged
    } catch (err) {
      setLoading(false);
      let msg = 'Invalid credentials';
      if (err.code === 'auth/user-not-found') msg = 'No account found';
      if (err.code === 'auth/wrong-password') msg = 'Wrong password';
      setError(msg);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Animated.View style={[styles.logoWrap, { opacity: fadeAnim }]}>
          <View style={styles.logoCircle}>
            <View style={styles.leaf1} />
            <View style={styles.leaf2} />
          </View>
          <Text style={styles.appName}>AgriSense</Text>
          <Text style={styles.tagline}>AI Smart Farming Platform</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSub}>Sign in to your farmer account</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTxt}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>EMAIL</Text>
          <View style={[styles.inputWrap, focused === 'email' && styles.inputWrapFocused]}>
            <TextInput
              style={styles.input}
              placeholder="farmer@example.com"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
          </View>

          <Text style={styles.label}>PASSWORD</Text>
          <View style={[styles.inputWrap, focused === 'pass' && styles.inputWrapFocused, { flexDirection: 'row', alignItems: 'center' }]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter your password"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCorrect={false}
              onFocus={() => setFocused('pass')}
              onBlur={() => setFocused(null)}
            />
            <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.showBtn}>
              <Text style={styles.showBtnText}>{showPass ? 'HIDE' : 'SHOW'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.row}>
            <Text style={styles.bottomText}>No account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  bgGlow1: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: '#22C55E0A', top: -100, right: -100 },
  bgGlow2: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: '#22C55E06', bottom: 40, left: -80 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#0d2b18', borderWidth: 1.5, borderColor: '#22C55E40',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: '#22C55E', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 16,
  },
  leaf1: { position: 'absolute', width: 24, height: 32, borderRadius: 14, backgroundColor: '#22C55E', transform: [{ rotate: '-30deg' }], top: 16, left: 20 },
  leaf2: { position: 'absolute', width: 16, height: 22, borderRadius: 10, backgroundColor: '#16a34a', transform: [{ rotate: '20deg' }], top: 26, left: 36 },
  appName: { color: '#fff', fontSize: 30, fontWeight: '900', marginBottom: 4 },
  tagline: { color: '#64748b', fontSize: 13 },
  card: {
    backgroundColor: '#0d1f12', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#1a3a22',
  },
  cardTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  cardSub: { color: '#64748b', fontSize: 13, marginBottom: 28 },
  label: { color: '#4ade80', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  inputWrap: {
    backgroundColor: '#0a1a10', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#1a3a22',
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'web' ? 12 : 14,
    marginBottom: 20,
  },
  inputWrapFocused: { borderColor: '#22C55E', backgroundColor: '#0d2218' },
  input: { fontSize: 15, color: '#fff', outlineStyle: 'none' },
  showBtn: { paddingLeft: 12 },
  showBtnText: { color: '#4ade80', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  loginBtn: {
    backgroundColor: '#22C55E', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 4, marginBottom: 24,
    shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10,
  },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1a3a22' },
  dividerText: { color: '#475569', fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'center' },
  bottomText: { color: '#64748b', fontSize: 14 },
  link: { color: '#22C55E', fontSize: 14, fontWeight: '700' },
});
