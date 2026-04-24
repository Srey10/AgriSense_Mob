import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, Platform,
} from 'react-native';
import { ref, set } from 'firebase/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, rtdb } from '../config/firebase';

const CROPS = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Vegetables', 'Pulses'];

// Simple local storage helpers for web fallback
const saveUserLocally = (user) => {
  try {
    const existing = JSON.parse(localStorage.getItem('agrisense_users') || '[]');
    existing.push(user);
    localStorage.setItem('agrisense_users', JSON.stringify(existing));
  } catch (_) {}
};

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [crop, setCrop] = useState(null);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const progressAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const goStep2 = () => {
    if (!name.trim()) { setError('Please enter your full name'); return; }
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setStep(2);
    Animated.timing(progressAnim, { toValue: 1, duration: 400, useNativeDriver: false }).start();
  };

  const goStep1 = () => {
    setStep(1);
    Animated.timing(progressAnim, { toValue: 0.5, duration: 400, useNativeDriver: false }).start();
  };

  const handleRegister = async () => {
    if (!crop) { setError('Please select a primary crop'); return; }
    setLoading(true);
    setError('');

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Save Additional Profile to RTDB
      const userProfile = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        farmSize: farmSize.trim(),
        state: stateVal.trim(),
        primaryCrop: crop,
        registeredAt: new Date().toISOString(),
      };

      await set(ref(rtdb, `users/${user.uid}`), userProfile);
      
      setLoading(false);
      setSuccess(true);
      // Navigation handled by App.js onAuthStateChanged
    } catch (err) {
      setLoading(false);
      console.error('Registration Error:', err);
      let msg = 'Registration failed';
      if (err.code === 'auth/email-already-in-use') msg = 'Email already registered';
      else if (err.code === 'auth/weak-password') msg = 'Password too weak';
      else if (err.code === 'auth/invalid-email') msg = 'Invalid email address';
      else if (err.code === 'auth/network-request-failed') msg = 'Network error. Check your connection.';
      else msg = err.message || 'Registration failed';
      setError(msg);
    }
  };

  const Field = ({ label, val, onChange, kb, secure, placeholder }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focused === label && styles.inputFocused]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#475569"
          value={val}
          onChangeText={(t) => { onChange(t); setError(''); }}
          keyboardType={kb || 'default'}
          secureTextEntry={!!secure}
          autoCapitalize={kb === 'email-address' ? 'none' : 'words'}
          autoCorrect={false}
          onFocus={() => setFocused(label)}
          onBlur={() => setFocused(null)}
        />
      </View>
    </View>
  );

  if (success) {
    return (
      <View style={styles.successScreen}>
        <View style={styles.successIcon}>
          <View style={styles.successCheckOuter}>
            <View style={styles.successCheck} />
          </View>
        </View>
        <Text style={styles.successTitle}>Account Created!</Text>
        <Text style={styles.successSub}>Welcome, {name}!</Text>
        <Text style={styles.successSub2}>Taking you to the dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.logoTxt}>AgriSense</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, {
            width: progressAnim.interpolate({ inputRange: [0.5, 1], outputRange: ['50%', '100%'] }),
          }]} />
        </View>
        <View style={styles.stepsRow}>
          <Text style={[styles.stepTxt, step >= 1 && styles.stepTxtActive]}>Personal Info</Text>
          <Text style={[styles.stepTxt, step >= 2 && styles.stepTxtActive]}>Farm Details</Text>
        </View>

        {/* Error */}
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTxt}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          {step === 1 ? (
            <>
              <Text style={styles.cardTitle}>Create Account</Text>
              <Text style={styles.cardSub}>Join thousands of smart farmers</Text>
              <Field label="FULL NAME" val={name} onChange={setName} placeholder="Ramesh Kumar" />
              <Field label="PHONE" val={phone} onChange={setPhone} kb="phone-pad" placeholder="+91 98765 43210" />
              <Field label="EMAIL" val={email} onChange={setEmail} kb="email-address" placeholder="farmer@example.com" />
              <Field label="PASSWORD" val={password} onChange={setPassword} secure placeholder="Min 4 characters" />
              <TouchableOpacity style={styles.btn} onPress={goStep2}>
                <Text style={styles.btnTxt}>Next →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Farm Details</Text>
              <Text style={styles.cardSub}>Personalise your experience</Text>
              <Field label="FARM SIZE (ACRES)" val={farmSize} onChange={setFarmSize} kb="decimal-pad" placeholder="e.g. 5.5" />
              <Field label="STATE / REGION" val={stateVal} onChange={setStateVal} placeholder="e.g. Punjab" />

              <Text style={styles.label}>PRIMARY CROP</Text>
              <View style={styles.chipsRow}>
                {CROPS.map(c => (
                  <TouchableOpacity key={c} style={[styles.chip, crop === c && styles.chipOn]} onPress={() => setCrop(c)}>
                    <Text style={[styles.chipTxt, crop === c && styles.chipTxtOn]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.btn, loading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.btnTxt}>{loading ? 'Creating...' : 'Create My Account'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backStep} onPress={goStep1}>
                <Text style={styles.backStepTxt}>← Back to Personal Info</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        <View style={styles.signinRow}>
          <Text style={styles.signinTxt}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signinLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  glow1: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#22C55E08', top: -70, left: -70 },
  glow2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#22C55E05', bottom: 60, right: -50 },
  content: { paddingHorizontal: 24, paddingTop: 52, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { padding: 6 },
  backTxt: { color: '#22C55E', fontSize: 15, fontWeight: '600' },
  logoTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
  progressTrack: { height: 5, backgroundColor: '#1a3a22', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 3 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  stepTxt: { fontSize: 11, color: '#475569', fontWeight: '600' },
  stepTxtActive: { color: '#22C55E' },
  errorBox: { backgroundColor: '#3f0f0f', borderRadius: 10, padding: 12, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: '#ef4444' },
  errorTxt: { color: '#fca5a5', fontSize: 13 },
  card: { backgroundColor: '#0d1f12', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1a3a22', marginBottom: 20 },
  cardTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  cardSub: { color: '#64748b', fontSize: 13, marginBottom: 22 },
  label: { color: '#4ade80', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  inputWrap: {
    backgroundColor: '#0a1a10', borderRadius: 12, borderWidth: 1.5, borderColor: '#1a3a22',
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'web' ? 12 : 14,
  },
  inputFocused: { borderColor: '#22C55E', backgroundColor: '#0d2218' },
  input: { fontSize: 15, color: '#fff', outlineStyle: 'none' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: '#0a1a10', borderWidth: 1.5, borderColor: '#1a3a22' },
  chipOn: { backgroundColor: '#166534', borderColor: '#22C55E' },
  chipTxt: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  chipTxtOn: { color: '#22C55E', fontWeight: '700' },
  btn: { backgroundColor: '#22C55E', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  btnTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  backStep: { alignItems: 'center', paddingVertical: 8 },
  backStepTxt: { color: '#475569', fontSize: 13 },
  signinRow: { flexDirection: 'row', justifyContent: 'center' },
  signinTxt: { color: '#64748b', fontSize: 14 },
  signinLink: { color: '#22C55E', fontSize: 14, fontWeight: '700' },
  // Success screen
  successScreen: { flex: 1, backgroundColor: '#0a0f1e', alignItems: 'center', justifyContent: 'center', gap: 12 },
  successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#0d2b18', borderWidth: 2, borderColor: '#22C55E', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  successCheckOuter: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' },
  successCheck: { width: 20, height: 10, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#fff', transform: [{ rotate: '-45deg' }], marginTop: -4 },
  successTitle: { color: '#fff', fontSize: 28, fontWeight: '900' },
  successSub: { color: '#22C55E', fontSize: 16, fontWeight: '600' },
  successSub2: { color: '#64748b', fontSize: 13 },
});
