import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated} from 'react-native';

const STEPS = [
  {icon:'🚜', label:'FARM', done:true},
  {icon:'📦', label:'PROCESS', done:true},
  {icon:'🏪', label:'STORAGE', done:true},
  {icon:'🛒', label:'MARKET', done:false},
];

export default function TraceabilityScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue:1, duration:700, useNativeDriver:true}),
      Animated.timing(slideAnim, {toValue:0, duration:700, useNativeDriver:true}),
    ]).start();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}><Text>🌿</Text></View>
            <Text style={styles.logoText}>AGROSENSE</Text>
          </View>
          <Text style={styles.headerSub}>Traceability Tracker · Batch #TH-4020</Text>
        </View>
        <TouchableOpacity><Text style={styles.scanIcon}>⊡</Text></TouchableOpacity>
      </View>

      <Animated.View style={{opacity:fadeAnim, transform:[{translateY:slideAnim}]}}>
        {/* Step Tracker */}
        <View style={styles.card}>
          <View style={styles.stepTracker}>
            {STEPS.map((s,i) => (
              <React.Fragment key={s.label}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, s.done && styles.stepCircleDone]}>
                    <Text style={styles.stepIcon}>{s.icon}</Text>
                  </View>
                  <Text style={[styles.stepLabel, s.done && styles.stepLabelDone]}>{s.label}</Text>
                </View>
                {i < STEPS.length-1 && (
                  <View style={[styles.stepLine, STEPS[i+1].done && styles.stepLineDone]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* AI Engine */}
        <View style={styles.card}>
          <View style={styles.aiRow}>
            <View>
              <Text style={styles.aiTitle}>AI ENGINE STATUS</Text>
              <Text style={styles.aiStatus}>
                Health Scan: <Text style={styles.aiStatusGreen}>Optimal Condition</Text>
              </Text>
            </View>
            <View style={styles.shieldBadge}><Text>🛡️</Text></View>
          </View>
          <View style={styles.aiAlert}>
            <Text style={styles.aiAlertText}>
              📡  Continuous AI monitoring enabled for Batch #TH-4020. No thermal anomalies detected in the last 36h.
            </Text>
          </View>
        </View>

        {/* GPS Map */}
        <View style={styles.card}>
          <View style={styles.gpsMap}>
            {[...Array(6)].map((_,i) => (
              <View key={i} style={styles.gpsRow}>
                {[...Array(8)].map((_,j) => (
                  <View key={j} style={[styles.gpsCell, {
                    backgroundColor: j===3||j===4?'#f1f5f9':(i+j)%4===0?'#e2e8f0':'#f8fafc',
                  }]} />
                ))}
              </View>
            ))}
            {[0.15,0.35,0.55,0.75,0.9].map((pos,i) => (
              <View key={i} style={[styles.routeDot, {
                left:`${pos*82+5}%`,
                top: i%2===0 ? '35%' : '55%',
                backgroundColor: i<4 ? '#22C55E' : '#94a3b8',
              }]} />
            ))}
            <View style={styles.gpsTag}>
              <Text style={styles.gpsTagText}>📍 GPS TRACKING: H4R 4 CELLS STORAGE</Text>
            </View>
          </View>
        </View>

        {/* Quality Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>QUALITY CLASS</Text>
            <Text style={styles.statBig}>A<Text style={styles.statPlus}>+</Text></Text>
            <Text style={styles.statSub}>A2 GRADE</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>STORAGE TIME</Text>
            <Text style={styles.statBig}>14<Text style={styles.statUnit}> / 20</Text></Text>
            <Text style={styles.statSub}>Days</Text>
            <View style={styles.coldTag}><Text style={styles.coldTagText}>❄️ COLD EXPOSURE</Text></View>
          </View>
        </View>

        {/* Env */}
        <View style={styles.card}>
          {[
            {icon:'🌡️', label:'Avg. Temp', value:'3.4°C'},
            {icon:'💧', label:'Humidity', value:'88%'},
            {icon:'🌿', label:'Eco-Score', value:'92/100 ★'},
          ].map((item, idx) => (
            <View key={item.label} style={[styles.envRow, idx===2 && {borderBottomWidth:0}]}>
              <Text style={styles.envIcon}>{item.icon}</Text>
              <Text style={styles.envLabel}>{item.label}</Text>
              <Text style={styles.envValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.certBtn}>
          <Text style={styles.certIcon}>🏅</Text>
          <Text style={styles.certText}>Get AgroSense Certificate</Text>
        </TouchableOpacity>
      </Animated.View>
      <View style={{height:30}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex:1, backgroundColor:'#f8fafc'},
  header: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:50, paddingBottom:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:'#f1f5f9'},
  backBtn: {padding:6},
  backIcon: {fontSize:20, color:'#22C55E', fontWeight:'700'},
  headerCenter: {alignItems:'center'},
  logoRow: {flexDirection:'row', alignItems:'center', gap:6},
  logoIcon: {width:26, height:26, borderRadius:6, backgroundColor:'#166534', alignItems:'center', justifyContent:'center'},
  logoText: {fontSize:14, fontWeight:'800', color:'#0f172a', letterSpacing:1},
  headerSub: {fontSize:10, color:'#94a3b8', marginTop:2},
  scanIcon: {fontSize:22, color:'#94a3b8', padding:6},
  card: {backgroundColor:'#fff', borderRadius:18, padding:16, marginHorizontal:16, marginTop:12, elevation:2},
  stepTracker: {flexDirection:'row', alignItems:'center', justifyContent:'center'},
  stepItem: {alignItems:'center', gap:4},
  stepCircle: {width:48, height:48, borderRadius:24, backgroundColor:'#f1f5f9', alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:'#e2e8f0'},
  stepCircleDone: {backgroundColor:'#dcfce7', borderColor:'#22C55E'},
  stepIcon: {fontSize:20},
  stepLabel: {fontSize:9, color:'#94a3b8', fontWeight:'700', letterSpacing:0.5},
  stepLabelDone: {color:'#22C55E'},
  stepLine: {width:18, height:2, backgroundColor:'#e2e8f0', marginBottom:14},
  stepLineDone: {backgroundColor:'#22C55E'},
  aiRow: {flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10},
  aiTitle: {fontSize:10, color:'#94a3b8', fontWeight:'700', letterSpacing:0.5, marginBottom:4},
  aiStatus: {fontSize:13, color:'#0f172a', fontWeight:'600'},
  aiStatusGreen: {color:'#22C55E', fontWeight:'700'},
  shieldBadge: {width:36, height:36, borderRadius:10, backgroundColor:'#dcfce7', alignItems:'center', justifyContent:'center'},
  aiAlert: {backgroundColor:'#f0fdf4', borderRadius:10, padding:10, borderWidth:1, borderColor:'#bbf7d0'},
  aiAlertText: {fontSize:11, color:'#166534', lineHeight:17},
  gpsMap: {height:118, borderRadius:12, overflow:'hidden', position:'relative', backgroundColor:'#f8fafc'},
  gpsRow: {flex:1, flexDirection:'row'},
  gpsCell: {flex:1, borderWidth:0.3, borderColor:'#e2e8f0'},
  routeDot: {position:'absolute', width:10, height:10, borderRadius:5, borderWidth:2, borderColor:'#fff'},
  gpsTag: {position:'absolute', bottom:8, left:8, backgroundColor:'#0f172a90', borderRadius:6, paddingHorizontal:8, paddingVertical:3},
  gpsTagText: {color:'#fff', fontSize:8, fontWeight:'600'},
  statsRow: {flexDirection:'row', gap:12, marginHorizontal:16, marginTop:12},
  statCard: {flex:1, backgroundColor:'#fff', borderRadius:18, padding:16, elevation:2},
  statLabel: {fontSize:9, color:'#94a3b8', fontWeight:'700', letterSpacing:0.5, marginBottom:6},
  statBig: {fontSize:28, fontWeight:'900', color:'#0f172a'},
  statPlus: {fontSize:20, color:'#22C55E'},
  statUnit: {fontSize:16, color:'#94a3b8', fontWeight:'400'},
  statSub: {fontSize:10, color:'#64748b', marginTop:2},
  coldTag: {backgroundColor:'#e0f2fe', borderRadius:6, paddingHorizontal:6, paddingVertical:3, marginTop:6, alignSelf:'flex-start'},
  coldTagText: {color:'#0369a1', fontSize:8, fontWeight:'700'},
  envRow: {flexDirection:'row', alignItems:'center', paddingVertical:11, borderBottomWidth:1, borderBottomColor:'#f1f5f9', gap:10},
  envIcon: {fontSize:18, width:26},
  envLabel: {flex:1, fontSize:13, color:'#475569', fontWeight:'600'},
  envValue: {fontSize:13, color:'#0f172a', fontWeight:'700'},
  certBtn: {marginHorizontal:16, marginTop:16, backgroundColor:'#22C55E', borderRadius:18, paddingVertical:18, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, shadowColor:'#22C55E', shadowOffset:{width:0,height:4}, shadowOpacity:0.4, shadowRadius:10, elevation:6},
  certIcon: {fontSize:20},
  certText: {color:'#fff', fontWeight:'800', fontSize:16},
});
