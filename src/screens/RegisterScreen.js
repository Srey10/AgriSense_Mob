import React, {useState, useRef, useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';

const CROPS = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Vegetables', 'Pulses'];

export default function RegisterScreen({navigation}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [state, setState] = useState('');
  const [crop, setCrop] = useState(null);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const progressAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 700, useNativeDriver: true}),
      Animated.timing(slideAnim, {toValue: 0, duration: 700, useNativeDriver: true}),
    ]).start();
  }, []);

  const goStep2 = () => {
    setStep(2);
    Animated.timing(progressAnim, {toValue: 1, duration: 500, useNativeDriver: false}).start();
  };

  const goStep1 = () => {
    setStep(1);
    Animated.timing(progressAnim, {toValue: 0.5, duration: 400, useNativeDriver: false}).start();
  };

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); navigation.navigate('Main'); }, 1500);
  };

  const Field = ({label, icon, val, onChange, kb, secure}) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, focused === label && styles.inputRowFocused]}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
          style={styles.input}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#475569"
          value={val}
          onChangeText={onChange}
          keyboardType={kb || 'default'}
          secureTextEntry={!!secure}
          onFocus={() => setFocused(label)}
          onBlur={() => setFocused(null)}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Animated.View style={[styles.header, {opacity: fadeAnim}]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoSmall}>
            <View style={styles.logoIcon}><Text>🌿</Text></View>
            <Text style={styles.logoText}>AgriSense</Text>
          </View>
        </Animated.View>

        {/* Progress */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, {
            width: progressAnim.interpolate({inputRange: [0.5, 1], outputRange: ['50%', '100%']}),
          }]} />
        </View>
        <View style={styles.progressLabels}>
          {['Personal Info', 'Farm Details'].map((l, i) => (
            <Text key={l} style={[styles.progressLabel, step >= i + 1 && styles.progressLabelActive]}>{l}</Text>
          ))}
        </View>

        <Animated.View style={[styles.card, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
          {step === 1 ? (
            <>
              <Text style={styles.cardTitle}>Create Account 🌱</Text>
              <Text style={styles.cardSub}>Join thousands of smart farmers</Text>
              <Field label="Full Name" icon="👤" val={name} onChange={setName} />
              <Field label="Phone Number" icon="📱" val={phone} onChange={setPhone} kb="phone-pad" />
              <Field label="Email" icon="📧" val={email} onChange={setEmail} kb="email-address" />
              <Field label="Password" icon="🔒" val={password} onChange={setPassword} secure />
              <TouchableOpacity style={styles.primaryBtn} onPress={goStep2}>
                <Text style={styles.primaryBtnText}>Next: Farm Details →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Your Farm Details 🚜</Text>
              <Text style={styles.cardSub}>Help us personalise your experience</Text>
              <Field label="Farm Size (Acres)" icon="📐" val={farmSize} onChange={setFarmSize} kb="decimal-pad" />
              <Field label="State / Region" icon="📍" val={state} onChange={setState} />

              <Text style={styles.label}>Primary Crop</Text>
              <View style={styles.chipsWrap}>
                {CROPS.map(c => (
                  <TouchableOpacity key={c} style={[styles.chip, crop === c && styles.chipActive]} onPress={() => setCrop(c)}>
                    <Text style={[styles.chipText, crop === c && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.termsText}>
                By registering, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>

              <TouchableOpacity style={[styles.primaryBtn, loading && styles.primaryBtnLoading]} onPress={handleRegister} disabled={loading}>
                <Text style={styles.primaryBtnText}>{loading ? 'Creating Account...' : '🌿 Create My Account'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backStepBtn} onPress={goStep1}>
                <Text style={styles.backStepText}>← Back to Personal Info</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        <Animated.View style={[styles.bottomRow, {opacity: fadeAnim}]}>
          <Text style={styles.bottomText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.bottomLink}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0f1e'},
  bgCircle1: {position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#22C55E09', top: -60, left: -60},
  bgCircle2: {position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: '#22C55E06', bottom: 80, right: -40},
  scroll: {flexGrow: 1, paddingHorizontal: 24, paddingTop: 52, paddingBottom: 30},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24},
  backBtn: {padding: 6},
  backBtnText: {color: '#22C55E', fontSize: 15, fontWeight: '600'},
  logoSmall: {flexDirection: 'row', alignItems: 'center', gap: 8},
  logoIcon: {width: 28, height: 28, borderRadius: 8, backgroundColor: '#166534', alignItems: 'center', justifyContent: 'center'},
  logoText: {color: '#fff', fontSize: 16, fontWeight: '800'},
  progressTrack: {height: 6, backgroundColor: '#1a3a22', borderRadius: 3, overflow: 'hidden', marginBottom: 8},
  progressFill: {height: '100%', backgroundColor: '#22C55E', borderRadius: 3},
  progressLabels: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20},
  progressLabel: {fontSize: 11, color: '#475569', fontWeight: '600'},
  progressLabelActive: {color: '#22C55E'},
  card: {backgroundColor: '#0d1f12', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1a3a22', marginBottom: 22},
  cardTitle: {color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4},
  cardSub: {color: '#64748b', fontSize: 13, marginBottom: 22},
  fieldWrap: {marginBottom: 16},
  label: {color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.3},
  inputRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a1a10', borderRadius: 14, borderWidth: 1.5, borderColor: '#1a3a22', paddingHorizontal: 14, paddingVertical: 13, gap: 10},
  inputRowFocused: {borderColor: '#22C55E', backgroundColor: '#0d2218'},
  inputIcon: {fontSize: 18},
  input: {flex: 1, fontSize: 15, color: '#fff'},
  chipsWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18},
  chip: {paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0a1a10', borderWidth: 1.5, borderColor: '#1a3a22'},
  chipActive: {backgroundColor: '#166534', borderColor: '#22C55E'},
  chipText: {color: '#64748b', fontSize: 13, fontWeight: '600'},
  chipTextActive: {color: '#22C55E', fontWeight: '700'},
  termsText: {color: '#475569', fontSize: 12, lineHeight: 18, marginBottom: 18},
  termsLink: {color: '#22C55E', fontWeight: '600'},
  primaryBtn: {backgroundColor: '#22C55E', borderRadius: 16, paddingVertical: 17, alignItems: 'center', shadowColor: '#22C55E', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6, marginBottom: 12},
  primaryBtnLoading: {backgroundColor: '#16a34a', opacity: 0.85},
  primaryBtnText: {color: '#fff', fontWeight: '800', fontSize: 16},
  backStepBtn: {alignItems: 'center', paddingVertical: 6},
  backStepText: {color: '#475569', fontSize: 13},
  bottomRow: {flexDirection: 'row', justifyContent: 'center'},
  bottomText: {color: '#64748b', fontSize: 14},
  bottomLink: {color: '#22C55E', fontSize: 14, fontWeight: '700'},
});
