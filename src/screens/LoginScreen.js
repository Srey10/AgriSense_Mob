import React, {useState, useRef, useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

export default function LoginScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 700, useNativeDriver: true}),
      Animated.timing(slideAnim, {toValue: 0, duration: 700, useNativeDriver: true}),
    ]).start();
  }, []);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Main');
    }, 1400);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.logoWrap, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
          <View style={styles.logoIconBig}><Text style={styles.logoLeaf}>🌿</Text></View>
          <Text style={styles.appName}>AgriSense</Text>
          <Text style={styles.tagline}>AI Smart Farming Platform</Text>
        </Animated.View>

        <Animated.View style={[styles.card, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
          <Text style={styles.cardTitle}>Welcome Back 👋</Text>
          <Text style={styles.cardSub}>Sign in to your farmer account</Text>

          {/* Email */}
          <Text style={styles.label}>Email / Phone</Text>
          <View style={[styles.inputRow, focused === 'email' && styles.inputRowFocused]}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              style={styles.input}
              placeholder="farmer@example.com"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputRow, focused === 'pass' && styles.inputRowFocused]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              onFocus={() => setFocused('pass')}
              onBlur={() => setFocused(null)}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={styles.eyeBtn}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnLoading]}
            onPress={handleLogin}
            disabled={loading}>
            <Text style={styles.loginBtnText}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            {[{icon: '🇬', label: 'Google'}, {icon: '📱', label: 'OTP'}].map(s => (
              <TouchableOpacity key={s.label} style={styles.socialBtn}>
                <Text>{s.icon}</Text>
                <Text style={styles.socialBtnText}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.bottomRow, {opacity: fadeAnim}]}>
          <Text style={styles.bottomText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.bottomLink}>Create Account</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.demoBtn} onPress={() => navigation.navigate('Main')}>
          <Text style={styles.demoBtnText}>Skip → Enter Demo Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0f1e'},
  bgCircle1: {position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#22C55E0A', top: -80, right: -80},
  bgCircle2: {position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#22C55E07', bottom: 60, left: -60},
  scroll: {flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 30},
  logoWrap: {alignItems: 'center', marginBottom: 32},
  logoIconBig: {width: 76, height: 76, borderRadius: 22, backgroundColor: '#166534', alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: '#22C55E', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8},
  logoLeaf: {fontSize: 38},
  appName: {color: '#fff', fontSize: 29, fontWeight: '900', letterSpacing: 0.3, marginBottom: 4},
  tagline: {color: '#64748b', fontSize: 13},
  card: {backgroundColor: '#0d1f12', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1a3a22', marginBottom: 22},
  cardTitle: {color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4},
  cardSub: {color: '#64748b', fontSize: 13, marginBottom: 24},
  label: {color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.4},
  inputRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a1a10', borderRadius: 14, borderWidth: 1.5, borderColor: '#1a3a22', paddingHorizontal: 14, paddingVertical: 13, gap: 10, marginBottom: 18},
  inputRowFocused: {borderColor: '#22C55E', backgroundColor: '#0d2218'},
  inputIcon: {fontSize: 18},
  input: {flex: 1, fontSize: 15, color: '#fff'},
  eyeBtn: {fontSize: 18},
  forgotWrap: {alignItems: 'flex-end', marginTop: -10, marginBottom: 22},
  forgotText: {color: '#22C55E', fontSize: 13, fontWeight: '600'},
  loginBtn: {backgroundColor: '#22C55E', borderRadius: 16, paddingVertical: 17, alignItems: 'center', shadowColor: '#22C55E', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6, marginBottom: 22},
  loginBtnLoading: {backgroundColor: '#16a34a', opacity: 0.85},
  loginBtnText: {color: '#fff', fontWeight: '800', fontSize: 17},
  divider: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18},
  dividerLine: {flex: 1, height: 1, backgroundColor: '#1a3a22'},
  dividerText: {color: '#475569', fontSize: 12},
  socialRow: {flexDirection: 'row', gap: 12},
  socialBtn: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0a1a10', borderRadius: 13, paddingVertical: 13, borderWidth: 1, borderColor: '#1a3a22'},
  socialBtnText: {color: '#94a3b8', fontWeight: '600', fontSize: 13},
  bottomRow: {flexDirection: 'row', justifyContent: 'center', marginBottom: 14},
  bottomText: {color: '#64748b', fontSize: 14},
  bottomLink: {color: '#22C55E', fontSize: 14, fontWeight: '700'},
  demoBtn: {alignItems: 'center', paddingVertical: 8},
  demoBtnText: {color: '#334155', fontSize: 13, textDecorationLine: 'underline'},
});
