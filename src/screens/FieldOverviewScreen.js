import React, {useRef, useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { auth, rtdb } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';

const {width} = Dimensions.get('window');

function MetricCard({icon, label, value, unit, badge, badgeColor, trend}) {
  return (
    <View style={styles.metricCard}>
      {badge ? (
        <View style={[styles.badge, {backgroundColor: badgeColor + '25'}]}>
          <Text style={[styles.badgeText, {color: badgeColor}]}>{badge}</Text>
        </View>
      ) : <View style={{height: 20}} />}
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}<Text style={styles.metricUnit}> {unit}</Text></Text>
      {trend ? <Text style={styles.metricTrend}>{trend}</Text> : null}
    </View>
  );
}

function BiomassChart() {
  const points = [10, 25, 18, 40, 35, 55, 50, 70, 65, 80];
  const maxVal = 80;
  const chartW = width - 90;
  const chartH = 68;
  return (
    <View style={[styles.chartContainer, {height: chartH + 24}]}>
      <View style={[styles.chartCanvas, {height: chartH}]}>
        {points.map((p, i) => (
          <View key={i} style={[styles.chartDot, {
            left: (i / (points.length - 1)) * (chartW - 12),
            bottom: (p / maxVal) * chartH - 4,
          }]} />
        ))}
      </View>
      <View style={styles.dayRow}>
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue','Sun'].map((d, i) => (
          i % 3 === 0 ? <Text key={i} style={styles.dayLabel}>{d}</Text> : null
        ))}
      </View>
      <View style={styles.chartTooltip}>
        <Text style={styles.tooltipText}>Max{'\n'}+10%</Text>
      </View>
    </View>
  );
}

export default function FieldOverviewScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [userData, setUserData] = React.useState(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {toValue: 1, duration: 600, useNativeDriver: true}).start();

    if (auth.currentUser) {
      const userRef = ref(rtdb, `users/${auth.currentUser.uid}`);
      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
      }, (err) => console.log('Profile fetch error:', err));
    }
  }, []);

  const handleLogout = () => {
    signOut(auth).catch(err => console.log('Logout error:', err));
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, {opacity: fadeAnim}]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Welcome,{'\n'}{userData?.name || 'Farmer'}</Text>
            <Text style={styles.headerSub}>
              {userData?.state || 'Central Valley'} · Plot A-12
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.langBadge}><Text style={styles.langText}>REGION: EN</Text></View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>LOG OUT</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <MetricCard icon="💧" label="Water Demand" value="12%" unit="capacity" badge="OPTIMAL" badgeColor="#22C55E" />
            <MetricCard icon="🌿" label="Crop Health" value="0.82" unit="NDVI" trend="↗️" />
            <MetricCard icon="☀️" label="Climate Risk" value="28°C" unit="Stable" badge="LOW" badgeColor="#f59e0b" />
            <MetricCard icon="📡" label="Tracking" value="4" unit="Active Units" trend="🟢" />
          </View>

          {/* GIS Card */}
          <View style={styles.gisCard}>
            <View style={styles.gisCardHeader}>
              <Text style={styles.gisCardTitle}>GIS Vegetation Index</Text>
              <TouchableOpacity><Text style={styles.expandBtn}>⛶</Text></TouchableOpacity>
            </View>
            <View style={styles.gisMapArea}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={styles.fieldRow}>
                  {[...Array(12)].map((_, j) => (
                    <View key={j} style={[styles.fieldCell, {backgroundColor: (i+j)%3===0?'#166534':(i+j)%3===1?'#15803d':'#16a34a'}]} />
                  ))}
                </View>
              ))}
              <View style={styles.plotLabel}><Text style={styles.plotLabelText}>Plot A-12: High Vigour</Text></View>
              <View style={styles.mapControls}>
                <TouchableOpacity style={styles.mapBtn}><Text style={styles.mapBtnText}>+</Text></TouchableOpacity>
                <TouchableOpacity style={styles.mapBtn}><Text style={styles.mapBtnText}>−</Text></TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Biomass */}
          <View style={styles.biomassCard}>
            <View style={styles.biomassHeader}>
              <Text style={styles.biomassTitle}>Biomass Growth Trend</Text>
              <Text style={styles.biomassPeriod}>Last 30 Days</Text>
            </View>
            <BiomassChart />
          </View>
          <View style={{height: 24}} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex:1, backgroundColor:'#f0f4f0'},
  content: {flex:1, paddingHorizontal:12},
  header: {flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', paddingTop:50, paddingBottom:14},
  headerTitle: {fontSize:22, fontWeight:'800', color:'#0f172a', lineHeight:28},
  headerSub: {fontSize:12, color:'#64748b', marginTop:2},
  headerRight: {flexDirection:'row', alignItems:'center', gap:8, marginTop:4},
  langBadge: {backgroundColor:'#f1f5f9', borderRadius:8, paddingHorizontal:8, paddingVertical:4},
  langText: {fontSize:12, color:'#475569'},
  logoutBtn: {backgroundColor:'#ef444415', borderRadius:8, paddingHorizontal:10, paddingVertical:6, borderWidth:1, borderColor:'#ef444430'},
  logoutText: {fontSize:11, color:'#ef4444', fontWeight:'700'},
  metricsGrid: {flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:14},
  metricCard: {width:(width-80-30)/2, backgroundColor:'#fff', borderRadius:16, padding:14, elevation:2},
  badge: {alignSelf:'flex-start', borderRadius:6, paddingHorizontal:6, paddingVertical:2, marginBottom:6},
  badgeText: {fontSize:9, fontWeight:'800', letterSpacing:0.5},
  metricIcon: {fontSize:22, marginBottom:4},
  metricLabel: {fontSize:11, color:'#64748b', marginBottom:2},
  metricValue: {fontSize:18, fontWeight:'800', color:'#0f172a'},
  metricUnit: {fontSize:11, color:'#94a3b8', fontWeight:'400'},
  metricTrend: {fontSize:14, marginTop:2},
  gisCard: {backgroundColor:'#fff', borderRadius:16, overflow:'hidden', marginBottom:14, elevation:2},
  gisCardHeader: {flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:14},
  gisCardTitle: {fontSize:14, fontWeight:'700', color:'#0f172a'},
  expandBtn: {fontSize:16, color:'#64748b'},
  gisMapArea: {height:165, position:'relative', overflow:'hidden'},
  fieldRow: {flex:1, flexDirection:'row'},
  fieldCell: {flex:1, borderWidth:0.3, borderColor:'#00000010'},
  plotLabel: {position:'absolute', bottom:14, left:'50%', transform:[{translateX:-70}], backgroundColor:'#22C55E', borderRadius:20, paddingHorizontal:12, paddingVertical:6},
  plotLabelText: {color:'#fff', fontSize:11, fontWeight:'700'},
  mapControls: {position:'absolute', right:10, bottom:10, gap:4},
  mapBtn: {width:28, height:28, borderRadius:7, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', elevation:2},
  mapBtnText: {fontSize:16, color:'#0f172a', fontWeight:'700', lineHeight:20},
  biomassCard: {backgroundColor:'#fff', borderRadius:16, padding:14, elevation:2},
  biomassHeader: {flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12},
  biomassTitle: {fontSize:14, fontWeight:'700', color:'#0f172a'},
  biomassPeriod: {fontSize:11, color:'#22C55E', fontWeight:'600'},
  chartContainer: {position:'relative'},
  chartCanvas: {position:'relative', borderBottomWidth:1, borderBottomColor:'#e2e8f0'},
  chartDot: {position:'absolute', width:7, height:7, borderRadius:4, backgroundColor:'#22C55E', marginLeft:-3},
  dayRow: {flexDirection:'row', justifyContent:'space-between', paddingHorizontal:4, marginTop:6},
  dayLabel: {fontSize:10, color:'#94a3b8'},
  chartTooltip: {position:'absolute', top:0, right:0, backgroundColor:'#0f172a', borderRadius:7, padding:5},
  tooltipText: {color:'#22C55E', fontSize:9, fontWeight:'700', textAlign:'center'},
});
