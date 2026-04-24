import React, {useEffect, useRef} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

function GISMapPlaceholder() {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, {toValue: 1, duration: 1800, useNativeDriver: true}),
      Animated.timing(pulseAnim, {toValue: 0.6, duration: 1800, useNativeDriver: true}),
    ])).start();
  }, []);

  return (
    <View style={styles.gisBox}>
      {[...Array(16)].map((_, i) => (
        <View key={i} style={[styles.gridDot, {
          left: `${(i % 4) * 25 + 4}%`,
          top: `${Math.floor(i / 4) * 25 + 4}%`,
        }]} />
      ))}
      <View style={styles.polyOutline} />
      <Animated.View style={[styles.mapPin, {opacity: pulseAnim}]}>
        <View style={styles.mapPinDot} />
      </Animated.View>
      <Text style={styles.gisLabel}>GIS Field Map · Live</Text>
    </View>
  );
}

function FeatureCard({icon, title, desc}) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconWrap}>
        <Text style={styles.featureIcon}>{icon}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

export default function LandingScreen({navigation}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseBtn = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 900, useNativeDriver: true}),
      Animated.timing(slideAnim, {toValue: 0, duration: 900, useNativeDriver: true}),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulseBtn, {toValue: 1.04, duration: 1400, useNativeDriver: true}),
      Animated.timing(pulseBtn, {toValue: 1, duration: 1400, useNativeDriver: true}),
    ])).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}></View>
          <Text style={styles.logoText}>AgriSense</Text>
        </View>
        <TouchableOpacity style={styles.menuBtn}>
          <Text style={styles.menuLine} /><Text style={styles.menuLine} /><Text style={styles.menuLine} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroBorder}>
          <Animated.View style={[styles.heroSection, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>SPATIAL INTELLIGENCE</Text>
            </View>
            <Text style={styles.heroTitle}>AI Smart Farming{'\n'}Platform</Text>
            <Text style={styles.heroSubtitle}>
              Optimize your yield with real-time spatial data and autonomous AI-driven insights.
            </Text>
            <GISMapPlaceholder />
            <View style={styles.statsRow}>
              {[{v:'24/7',l:'Monitoring'},{v:'98%',l:'Accuracy'},{v:'12K+',l:'Farms'}].map(s=>(
                <View key={s.l} style={styles.statItem}>
                  <Text style={styles.statValue}>{s.v}</Text>
                  <Text style={styles.statLabel}>{s.l}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>

        <View style={styles.ctaSection}>
          <Animated.View style={{transform: [{scale: pulseBtn}]}}>
            <TouchableOpacity style={styles.explorBtn} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.explorBtnText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresSection}>
          <FeatureCard icon="" title="GIS Intelligence" desc="High-resolution spatial mapping for precision field monitoring." />
          <FeatureCard icon="" title="AI Analytics" desc="Predictive models for crop health and harvest timing." />
          <FeatureCard icon="" title="Smart Irrigation" desc="Automated watering cycles based on soil moisture sensors." />
        </View>

        <View style={styles.bottomBanner}>
          <Text style={styles.bannerNumber}>24/7</Text>
          <Text style={styles.bannerTitle}>Real-time Field Monitoring</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active online status</Text>
          </View>
        </View>
        <View style={{height: 34}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0f1e'},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14, backgroundColor: '#0a0f1e',
  },
  logoRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  logoIcon: {width: 34, height: 34, borderRadius: 10, backgroundColor: '#166534', alignItems: 'center', justifyContent: 'center'},
  logoLeaf: {fontSize: 18},
  logoText: {color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.3},
  menuBtn: {padding: 6, gap: 5, alignItems: 'center'},
  menuLine: {width: 22, height: 2, backgroundColor: '#64748b', borderRadius: 2, marginVertical: 2},
  heroBorder: {margin: 16, borderRadius: 18, borderWidth: 1.5, borderColor: '#22C55E', borderStyle: 'dashed', overflow: 'hidden'},
  heroSection: {padding: 20, backgroundColor: '#0d1a0e'},
  heroBadge: {alignSelf: 'flex-start', backgroundColor: '#14532d', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 12},
  heroBadgeText: {color: '#22C55E', fontSize: 11, fontWeight: '800', letterSpacing: 1},
  heroTitle: {color: '#fff', fontSize: 28, fontWeight: '900', lineHeight: 36, marginBottom: 10},
  heroSubtitle: {color: '#86efac', fontSize: 13, lineHeight: 20, marginBottom: 18},
  gisBox: {height: 165, backgroundColor: '#0a1f12', borderRadius: 14, borderWidth: 1, borderColor: '#22C55E30', marginBottom: 18, position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center'},
  gridDot: {position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: '#22C55E35'},
  polyOutline: {width: 130, height: 90, borderWidth: 1.5, borderColor: '#22C55E', borderRadius: 6, transform: [{rotate: '12deg'}]},
  mapPin: {position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: '#22C55E25', alignItems: 'center', justifyContent: 'center', top: '38%', left: '46%'},
  mapPinDot: {width: 9, height: 9, borderRadius: 5, backgroundColor: '#22C55E'},
  gisLabel: {position: 'absolute', bottom: 9, left: 14, color: '#22C55E', fontSize: 10, fontWeight: '700', letterSpacing: 0.4},
  statsRow: {flexDirection: 'row', justifyContent: 'space-around', marginTop: 6},
  statItem: {alignItems: 'center'},
  statValue: {color: '#22C55E', fontSize: 20, fontWeight: '900'},
  statLabel: {color: '#86efac', fontSize: 10, marginTop: 2},
  ctaSection: {paddingHorizontal: 16, gap: 11, marginBottom: 10},
  explorBtn: {backgroundColor: '#22C55E', borderRadius: 14, paddingVertical: 17, alignItems: 'center', shadowColor: '#22C55E', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6},
  explorBtnText: {color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3},
  loginBtn: {backgroundColor: 'transparent', borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#22C55E40'},
  loginBtnText: {color: '#94a3b8', fontWeight: '600', fontSize: 15},
  featuresSection: {paddingHorizontal: 16, gap: 11, marginTop: 6},
  featureCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1a0e', borderRadius: 16, padding: 16, gap: 14, borderWidth: 1, borderColor: '#1a3a22'},
  featureIconWrap: {width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center'},
  featureIcon: {fontSize: 0},
  featureTitle: {color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 3},
  featureDesc: {color: '#64748b', fontSize: 12, lineHeight: 17},
  bottomBanner: {margin: 16, backgroundColor: '#0d1a0e', borderRadius: 18, padding: 22, alignItems: 'center', borderWidth: 1, borderColor: '#1a3a22'},
  bannerNumber: {color: '#22C55E', fontSize: 44, fontWeight: '900', lineHeight: 48},
  bannerTitle: {color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 4},
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10},
  statusDot: {width: 9, height: 9, borderRadius: 5, backgroundColor: '#22C55E'},
  statusText: {color: '#86efac', fontSize: 12},
});
