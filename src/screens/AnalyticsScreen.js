import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
const TABS = ['Rainfall','Soil Health','Fertilizer'];

function WeatherChart() {
  const pts = [30,55,45,80,70,90,75];
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const chartH = 80;
  const chartW = width - 64;
  return (
    <View style={styles.weatherWrap}>
      <View style={[styles.chartCanvas, {height: chartH}]}>
        {pts.map((p, i) => (
          <View key={i} style={[styles.chartPoint, {
            left: (i / (pts.length - 1)) * (chartW - 20) + 8,
            bottom: (p / 90) * chartH - 4,
          }]} />
        ))}
      </View>
      <View style={styles.dayRow}>
        {days.map(d => <Text key={d} style={styles.dayLabel}>{d}</Text>)}
      </View>
      <View style={styles.yieldRow}>
        <View style={styles.yieldDot} />
        <Text style={styles.yieldText}>Predicted Yield Impact: +12%  </Text>
        <Text style={styles.tempText}>24° / 13°</Text>
      </View>
    </View>
  );
}

function RiskHeatmap() {
  return (
    <View style={styles.heatmapWrap}>
      {[...Array(8)].map((_,i) => (
        <View key={i} style={styles.heatRow}>
          {[...Array(6)].map((_,j) => (
            <View key={j} style={[styles.heatCell, {
              backgroundColor: (i===2&&j===1)||(i===5&&j===4) ? '#dc2626'
                : (i+j)%3===0 ? '#16a34a' : (i+j)%3===1 ? '#15803d' : '#166534',
            }]} />
          ))}
        </View>
      ))}
      <View style={[styles.hotspot, {top:'26%', left:'17%'}]}>
        <View style={styles.hotspotRing} /><View style={styles.hotspotDot} />
      </View>
      <View style={[styles.hotspot, {top:'63%', left:'71%'}]}>
        <View style={styles.hotspotRing} /><View style={styles.hotspotDot} />
      </View>
    </View>
  );
}

function YieldBars() {
  const qs = ['Q1','Q2','Q3','Q4'];
  const hist = [3.2,2.8,4.1,3.6];
  const ai   = [3.5,3.4,4.6,4.2];
  return (
    <View>
      <View style={styles.barsGroup}>
        {qs.map((q,i) => (
          <View key={q} style={styles.barGroup}>
            <View style={styles.barPair}>
              <View style={[styles.bar, {height: hist[i]*16, backgroundColor:'#94a3b8'}]} />
              <View style={[styles.bar, {height: ai[i]*16, backgroundColor:'#22C55E'}]} />
            </View>
            <Text style={styles.barLabel}>{q}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.legendDot,{backgroundColor:'#94a3b8'}]} /><Text style={styles.legendText}>Historical</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot,{backgroundColor:'#22C55E'}]} /><Text style={styles.legendText}>AI Predicted</Text></View>
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const [tab, setTab] = useState(0);
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header dashed card */}
      <View style={styles.headerCard}>
        <View style={styles.headerCardInner}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}><Text>🌿</Text></View>
            <View>
              <Text style={styles.logoText}>AgroSense</Text>
              <Text style={styles.headerSub}>YIELD & CLIMATE RISK</Text>
            </View>
          </View>
          <View style={styles.tabsRow}>
            {TABS.map((t,i) => (
              <TouchableOpacity key={t} style={[styles.tabChip, tab===i && styles.tabChipActive]} onPress={() => setTab(i)}>
                <Text style={[styles.tabChipText, tab===i && styles.tabChipTextActive]}>
                  {i===0?'🌧 ':i===1?'🌱 ':'🧪 '}{t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* LSTM Weather */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>LSTM Weather Forecast</Text>
          <View style={styles.conformTag}><Text style={styles.conformTagText}>80% CONFORMANCE</Text></View>
        </View>
        <Text style={styles.cardSub}>AI-driven 7-day projection</Text>
        <WeatherChart />
      </View>

      {/* Risk Heatmap */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>GIS Risk Heatmap</Text>
          <View style={styles.moderateTag}><Text style={styles.moderateTagText}>⚠️ MODERATE RISK</Text></View>
        </View>
        <RiskHeatmap />
      </View>

      {/* Yield Projections */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Yield Projections</Text>
          <Text style={styles.cardSubInline}>Comparison by Quarter (Tons/Ha)</Text>
        </View>
        <YieldBars />
      </View>

      {/* Smart Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Smart Actions</Text>
        {[
          {icon:'💧', color:'#22C55E', bg:'#dcfce7', title:'Irrigation Recommended', desc:'Sector B soil moisture is 32%. Activate sprinklers tonight at 2:00 AM for optimal absorption.'},
          {icon:'🐛', color:'#f59e0b', bg:'#fef3c7', title:'Pest Warning', desc:'Satellite thermal imagery detects potential pest infestation in NW cluster. Physical inspection required.'},
        ].map(a => (
          <View key={a.title} style={[styles.actionCard, {borderLeftColor: a.color}]}>
            <View style={[styles.actionIcon, {backgroundColor: a.bg}]}><Text style={{fontSize:18}}>{a.icon}</Text></View>
            <View style={{flex:1}}>
              <Text style={styles.actionTitle}>{a.title}</Text>
              <Text style={styles.actionDesc}>{a.desc}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={{height:24}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex:1, backgroundColor:'#f8fafc'},
  headerCard: {margin:16, marginTop:50, borderWidth:1.5, borderColor:'#22C55E', borderStyle:'dashed', borderRadius:18, backgroundColor:'#f0fdf4'},
  headerCardInner: {padding:14},
  logoRow: {flexDirection:'row', alignItems:'center', gap:10, marginBottom:12},
  logoIcon: {width:30, height:30, borderRadius:8, backgroundColor:'#166534', alignItems:'center', justifyContent:'center'},
  logoText: {fontSize:16, fontWeight:'800', color:'#0f172a'},
  headerSub: {fontSize:8, color:'#94a3b8', letterSpacing:1, fontWeight:'600'},
  tabsRow: {flexDirection:'row', gap:8},
  tabChip: {flex:1, paddingVertical:8, borderRadius:10, backgroundColor:'#fff', alignItems:'center', borderWidth:1, borderColor:'#e2e8f0'},
  tabChipActive: {backgroundColor:'#22C55E', borderColor:'#22C55E'},
  tabChipText: {fontSize:10, color:'#64748b', fontWeight:'600'},
  tabChipTextActive: {color:'#fff', fontWeight:'700'},
  card: {backgroundColor:'#fff', borderRadius:18, padding:16, marginHorizontal:16, marginBottom:14, elevation:2},
  cardHeader: {flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4},
  cardTitle: {fontSize:15, fontWeight:'700', color:'#0f172a'},
  cardSub: {fontSize:11, color:'#94a3b8', marginBottom:12},
  cardSubInline: {fontSize:10, color:'#94a3b8'},
  conformTag: {backgroundColor:'#22C55E', borderRadius:6, paddingHorizontal:8, paddingVertical:3},
  conformTagText: {color:'#fff', fontSize:8, fontWeight:'800', letterSpacing:0.3},
  moderateTag: {backgroundColor:'#fef3c7', borderRadius:6, paddingHorizontal:8, paddingVertical:3},
  moderateTagText: {color:'#d97706', fontSize:9, fontWeight:'700'},
  weatherWrap: {marginTop:8},
  chartCanvas: {position:'relative', borderBottomWidth:1, borderBottomColor:'#e2e8f0', marginBottom:18},
  chartPoint: {position:'absolute', width:8, height:8, borderRadius:4, backgroundColor:'#22C55E', marginLeft:-4, marginBottom:-4},
  dayRow: {flexDirection:'row', justifyContent:'space-between', paddingHorizontal:4, marginBottom:10},
  dayLabel: {fontSize:9, color:'#94a3b8'},
  yieldRow: {flexDirection:'row', alignItems:'center', gap:6},
  yieldDot: {width:8, height:8, borderRadius:4, backgroundColor:'#22C55E'},
  yieldText: {fontSize:11, color:'#22C55E', fontWeight:'600'},
  tempText: {fontSize:11, color:'#64748b'},
  heatmapWrap: {height:165, borderRadius:12, overflow:'hidden', position:'relative', marginTop:8},
  heatRow: {flex:1, flexDirection:'row'},
  heatCell: {flex:1, borderWidth:0.3, borderColor:'#00000010'},
  hotspot: {position:'absolute', width:30, height:30, alignItems:'center', justifyContent:'center'},
  hotspotRing: {position:'absolute', width:28, height:28, borderRadius:14, borderWidth:2, borderColor:'#fff', opacity:0.6},
  hotspotDot: {width:12, height:12, borderRadius:6, backgroundColor:'#fff', opacity:0.9},
  barsGroup: {flexDirection:'row', justifyContent:'space-around', alignItems:'flex-end', height:80, marginTop:12, marginBottom:8},
  barGroup: {alignItems:'center', gap:4},
  barPair: {flexDirection:'row', alignItems:'flex-end', gap:3},
  bar: {width:18, borderRadius:5},
  barLabel: {fontSize:10, color:'#94a3b8', fontWeight:'600'},
  legendRow: {flexDirection:'row', justifyContent:'center', gap:20, marginTop:8},
  legendItem: {flexDirection:'row', alignItems:'center', gap:5},
  legendDot: {width:8, height:8, borderRadius:4},
  legendText: {fontSize:11, color:'#64748b'},
  actionCard: {flexDirection:'row', alignItems:'flex-start', backgroundColor:'#f8fafc', borderRadius:14, padding:12, borderLeftWidth:3, gap:10, marginTop:12},
  actionIcon: {width:36, height:36, borderRadius:10, alignItems:'center', justifyContent:'center'},
  actionTitle: {fontSize:13, fontWeight:'700', color:'#0f172a', marginBottom:3},
  actionDesc: {fontSize:11, color:'#64748b', lineHeight:16},
});
