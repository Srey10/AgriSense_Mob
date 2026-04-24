import React, {useState, useRef, useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

export default function IrrigationScreen() {
  const [volume, setVolume] = useState('15400');
  const [duration, setDuration] = useState('45');
  const [mapMode, setMapMode] = useState('satellite');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, {toValue: 1.03, duration: 1200, useNativeDriver: true}),
      Animated.timing(pulseAnim, {toValue: 1, duration: 1200, useNativeDriver: true}),
    ])).start();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <View style={{width:12, height:12, borderRadius:6, backgroundColor:'#fff'}} />
            </View>
            <Text style={styles.logoText}>AgroSense</Text>
          </View>
          <Text style={styles.subText}>AI PRECISION FARMING</Text>
        </View>
        <View style={styles.profileBtn}><Text style={styles.profileBtnText}>PROFILE</Text></View>
      </View>

      {/* Map */}
      <View style={styles.mapView}>
        <View style={styles.satelliteGrid}>
          {[...Array(10)].map((_,i) => (
            <View key={i} style={styles.satRow}>
              {[...Array(8)].map((_,j) => (
                <View key={j} style={[styles.satCell, {
                  backgroundColor: (i+j)%4===0?'#14532d':(i+j)%4===1?'#166534':(i+j)%4===2?'#15803d':'#16a34a',
                }]} />
              ))}
            </View>
          ))}
        </View>
        <View style={styles.vehicleDot} />
        <View style={styles.mapBtns}>
          {['+','−','◎'].map(b => (
            <TouchableOpacity key={b} style={styles.mapCircleBtn}>
              <Text style={styles.mapCircleBtnText}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.mapToggleRow}>
          <TouchableOpacity
            style={[styles.mapToggle, mapMode==='satellite' && styles.mapToggleActive]}
            onPress={() => setMapMode('satellite')}>
            <Text style={[styles.mapToggleText, mapMode==='satellite' && styles.mapToggleTextActive]}>SATELLITE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mapToggle, mapMode==='soil' && styles.mapToggleActive]}
            onPress={() => setMapMode('soil')}>
            <Text style={[styles.mapToggleText, mapMode==='soil' && styles.mapToggleTextActive]}>SOIL MAP</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Recommendations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
          </View>
          <View style={styles.analysisTag}><Text style={styles.analysisTagText}>ANALYSIS READY</Text></View>
        </View>
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>WATER REQUIRED</Text>
            <Text style={styles.metricBig}>15,400 <Text style={styles.metricSmall}>L</Text></Text>
            <Text style={styles.metricSub}>↓ -10% vs avg</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>OPTIMAL TIME</Text>
            <Text style={styles.metricBig}>04:30 <Text style={styles.metricSmall}>AM</Text></Text>
            <View style={styles.evapTag}><Text style={styles.evapTagText}>LOW EVAPORATION</Text></View>
          </View>
        </View>
        <TouchableOpacity style={styles.riskRow}>
          <View style={{flex:1}}>
            <Text style={styles.riskLabel}>RISK LEVEL</Text>
            <Text style={styles.riskValue}>Moderate Risk</Text>
          </View>
          <Text style={styles.riskChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Manual Overrides */}
      <View style={styles.section}>
        <Text style={styles.overrideTitle}>Manual Overrides</Text>
        <Text style={styles.inputLabel}>CUSTOM VOLUME (LITERS)</Text>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} value={volume} onChangeText={setVolume} keyboardType="numeric" placeholderTextColor="#94a3b8" />
        </View>
        <Text style={styles.inputLabel}>DURATION (MINUTES)</Text>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholderTextColor="#94a3b8" />
        </View>
      </View>

      {/* Execute */}
      <Animated.View style={[styles.execWrap, {transform:[{scale:pulseAnim}]}]}>
        <TouchableOpacity style={styles.execBtn}>
          <Text style={styles.execText}>Execute Irrigation</Text>
        </TouchableOpacity>
      </Animated.View>
      <View style={{height:30}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex:1, backgroundColor:'#f8fafc'},
  header: {flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', padding:20, paddingTop:52, backgroundColor:'#fff'},
  logoRow: {flexDirection:'row', alignItems:'center', gap:8},
  logoIcon: {width:30, height:30, borderRadius:8, backgroundColor:'#166534', alignItems:'center', justifyContent:'center'},
  logoLeaf: {fontSize:16},
  logoText: {fontSize:18, fontWeight:'800', color:'#0f172a'},
  subText: {fontSize:9, color:'#94a3b8', letterSpacing:1.5, marginTop:2, marginLeft:38},
  profileBtn: {paddingHorizontal:12, paddingVertical:6, borderRadius:8, backgroundColor:'#f1f5f9', alignItems:'center', justifyContent:'center'},
  profileBtnText: {fontSize:9, fontWeight:'800', color:'#475569'},
  mapView: {height:225, position:'relative', overflow:'hidden', borderRadius:18, margin:16, elevation:4, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.12, shadowRadius:8},
  satelliteGrid: {flex:1},
  satRow: {flex:1, flexDirection:'row'},
  satCell: {flex:1, borderWidth:0.3, borderColor:'#00000012'},
  vehicleDot: {position:'absolute', width:14, height:14, borderRadius:7, backgroundColor:'#facc15', borderWidth:2, borderColor:'#fff', top:'55%', left:'45%', elevation:3},
  mapBtns: {position:'absolute', right:10, top:10, gap:6},
  mapCircleBtn: {width:32, height:32, borderRadius:16, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', elevation:2},
  mapCircleBtnText: {fontSize:18, color:'#0f172a', fontWeight:'700', lineHeight:22},
  mapToggleRow: {position:'absolute', bottom:10, left:10, right:10, flexDirection:'row', gap:8},
  mapToggle: {flex:1, backgroundColor:'#ffffff90', borderRadius:20, paddingVertical:9, alignItems:'center'},
  mapToggleActive: {backgroundColor:'#22C55E'},
  mapToggleText: {color:'#0f172a', fontWeight:'600', fontSize:13},
  mapToggleTextActive: {color:'#fff', fontWeight:'700'},
  section: {backgroundColor:'#fff', borderRadius:18, padding:16, marginHorizontal:16, marginBottom:14, elevation:2},
  sectionHeader: {flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14},
  sectionTitleRow: {flexDirection:'row', alignItems:'center', gap:6},
  sectionTitle: {fontSize:16, fontWeight:'700', color:'#0f172a'},
  analysisTag: {backgroundColor:'#dcfce7', borderRadius:6, paddingHorizontal:8, paddingVertical:3},
  analysisTagText: {color:'#15803d', fontSize:9, fontWeight:'800', letterSpacing:0.4},
  metricsRow: {flexDirection:'row', gap:12, marginBottom:12},
  metricBox: {flex:1, backgroundColor:'#f8fafc', borderRadius:14, padding:12},
  metricLabel: {fontSize:9, color:'#94a3b8', fontWeight:'600', letterSpacing:0.5, marginBottom:4},
  metricBig: {fontSize:22, fontWeight:'800', color:'#22C55E'},
  metricSmall: {fontSize:14, color:'#64748b', fontWeight:'400'},
  metricSub: {fontSize:10, color:'#94a3b8', marginTop:2},
  evapTag: {backgroundColor:'#e0f2fe', borderRadius:4, paddingHorizontal:6, paddingVertical:2, marginTop:4, alignSelf:'flex-start'},
  evapTagText: {color:'#0369a1', fontSize:8, fontWeight:'700', letterSpacing:0.3},
  riskRow: {flexDirection:'row', alignItems:'center', backgroundColor:'#fffbeb', borderRadius:14, padding:14, borderWidth:1, borderColor:'#fde68a', gap:10},
  riskLabel: {fontSize:10, color:'#92400e', fontWeight:'600', letterSpacing:0.5},
  riskValue: {fontSize:16, fontWeight:'700', color:'#d97706'},
  riskChevron: {fontSize:22, color:'#94a3b8'},
  overrideTitle: {fontSize:16, fontWeight:'700', color:'#0f172a', marginBottom:14},
  inputLabel: {fontSize:10, color:'#94a3b8', fontWeight:'600', letterSpacing:0.5, marginBottom:7},
  inputRow: {flexDirection:'row', alignItems:'center', backgroundColor:'#f8fafc', borderRadius:14, borderWidth:1, borderColor:'#e2e8f0', paddingHorizontal:14, paddingVertical:11, marginBottom:14, gap:10},
  input: {flex:1, fontSize:16, fontWeight:'700', color:'#0f172a'},
  execWrap: {marginHorizontal:16, marginTop:4},
  execBtn: {backgroundColor:'#22C55E', borderRadius:18, paddingVertical:18, alignItems:'center', shadowColor:'#22C55E', shadowOffset:{width:0,height:4}, shadowOpacity:0.4, shadowRadius:10, elevation:6},
  execText: {color:'#fff', fontWeight:'800', fontSize:17, letterSpacing:0.3},
});
