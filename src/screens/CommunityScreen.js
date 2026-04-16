import React, {useState, useRef} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');
const LANGS = ['English','हिंदी','বাংলা','ਪੰਜਾਬੀ'];

const INIT_MESSAGES = [
  {id:1, role:'ai', text:"Namaste! I've analyzed your local soil telemetry. Would you like to check the nitrogen levels today?", time:'4:00 AM'},
  {id:2, role:'user', text:'Yes, check nitrogen and suggest if I need urea for my field.', time:'4:12 AM'},
  {id:3, role:'ai', text:'Analyzing your field data... Nitrogen levels appear adequate. I recommend monitoring for 48 hours before adding urea.', time:'4:13 AM'},
];

function PostCard() {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(24);
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}><Text style={{fontSize:20}}>👨‍🌾</Text></View>
        <View style={{flex:1}}>
          <Text style={styles.postAuthor}>Ramesh Kumar</Text>
          <Text style={styles.postTime}>20 minutes ago</Text>
        </View>
        <View style={styles.healthBadge}><Text style={styles.healthBadgeText}>30% HEALTH</Text></View>
      </View>
      <Text style={styles.postText}>
        Finding yellow spots on tomato leaves. Is this early blight or nutrient deficiency? Irrigation schedule hasn't changed.
      </Text>
      {/* Leaf image placeholder */}
      <View style={styles.postImage}>
        {[...Array(5)].map((_,i) => (
          <View key={i} style={styles.leafRow}>
            {[...Array(7)].map((_,j) => (
              <View key={j} style={[styles.leafCell, {
                backgroundColor: (i+j)%3===0?'#15803d':(i+j)%3===1?'#16a34a':'#166534',
              }]} />
            ))}
          </View>
        ))}
        <View style={styles.yellowSpot} />
        <View style={[styles.yellowSpot, {left:'62%', top:'28%'}]} />
      </View>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => { setLiked(!liked); setLikes(liked ? likes-1 : likes+1); }}>
          <Text style={[styles.actionBtnText, liked && {color:'#22C55E'}]}>👍 {likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>💬 8</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AIChat() {
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);

  const send = () => {
    if (!text.trim()) return;
    const userMsg = {id: messages.length+1, role:'user', text, time:'Just now'};
    setMessages(prev => [...prev, userMsg]);
    setText('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length+1,
        role: 'ai',
        text: 'I\'ve checked the latest soil telemetry for your location. Recommend adding 25kg urea per acre in the next irrigation cycle.',
        time: 'Just now',
      }]);
    }, 1200);
  };

  return (
    <View style={styles.chatWrap}>
      <View style={styles.aiStatusBar}>
        <View style={styles.aiAvatarSm}><Text style={{fontSize:14}}>🤖</Text></View>
        <View style={{flex:1}}>
          <Text style={styles.aiStatusTitle}>AgroSense AI</Text>
          <Text style={styles.aiStatusSub}>Listening for your query...</Text>
        </View>
        <View style={styles.aiOnlineDot} />
      </View>

      <ScrollView style={styles.msgArea} showsVerticalScrollIndicator={false}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.msgRow, msg.role==='user' && styles.msgRowUser]}>
            {msg.role==='ai' && <View style={styles.aiMsgAvatar}><Text style={{fontSize:13}}>🤖</Text></View>}
            <View style={[styles.bubble, msg.role==='user' ? styles.bubbleUser : styles.bubbleAI]}>
              <Text style={[styles.bubbleText, msg.role==='user' && styles.bubbleTextUser]}>{msg.text}</Text>
              <Text style={styles.bubbleTime}>{msg.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.chatInputRow}>
        <TouchableOpacity style={styles.attachBtn}><Text style={{fontSize:20}}>📎</Text></TouchableOpacity>
        <TextInput
          style={styles.chatInput}
          placeholder="Type a message..."
          placeholderTextColor="#94a3b8"
          value={text}
          onChangeText={setText}
          onSubmitEditing={send}
        />
        <TouchableOpacity style={styles.attachBtn}><Text style={{fontSize:20}}>🌐</Text></TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.voiceBtn, listening && styles.voiceBtnActive]}
        onPress={() => setListening(!listening)}>
        <Text style={styles.voiceBtnText}>
          {listening ? '🔴  Listening...' : '🎤  Tap to Speak'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CommunityScreen() {
  const [tab, setTab] = useState('community');
  const [lang, setLang] = useState(0);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS==='ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerInner}>
          <View style={styles.headerTopRow}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}><Text>🌿</Text></View>
              <Text style={styles.logoText}>AgroSense</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <View style={styles.notifDot} />
              <Text style={{fontSize:22}}>🔔</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Text style={{fontSize:16}}>🔍</Text>
            <TextInput style={styles.searchInput} placeholder="Search pests, soil, market..." placeholderTextColor="#94a3b8" />
            <TouchableOpacity><Text style={{fontSize:18}}>🎙️</Text></TouchableOpacity>
          </View>
          <View style={styles.langRow}>
            {LANGS.map((l,i) => (
              <TouchableOpacity key={l} style={[styles.langChip, lang===i && styles.langChipActive]} onPress={() => setLang(i)}>
                <Text style={[styles.langChipText, lang===i && styles.langChipTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Tab toggle */}
      <View style={styles.tabToggle}>
        <TouchableOpacity style={[styles.toggleBtn, tab==='community' && styles.toggleBtnActive]} onPress={() => setTab('community')}>
          <Text style={[styles.toggleBtnText, tab==='community' && styles.toggleBtnTextActive]}>Community</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, tab==='ai' && styles.toggleBtnActive]} onPress={() => setTab('ai')}>
          <Text style={[styles.toggleBtnText, tab==='ai' && styles.toggleBtnTextActive]}>AI Chat</Text>
        </TouchableOpacity>
      </View>

      {tab === 'community' ? (
        <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
          <PostCard />
          <View style={{height:80}} />
        </ScrollView>
      ) : (
        <AIChat />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex:1, backgroundColor:'#f8fafc'},
  headerCard: {marginHorizontal:16, marginTop:48, marginBottom:8, borderWidth:1.5, borderColor:'#22C55E', borderStyle:'dashed', borderRadius:18, backgroundColor:'#f0fdf4'},
  headerInner: {padding:14},
  headerTopRow: {flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12},
  logoRow: {flexDirection:'row', alignItems:'center', gap:8},
  logoIcon: {width:28, height:28, borderRadius:7, backgroundColor:'#166534', alignItems:'center', justifyContent:'center'},
  logoText: {fontSize:16, fontWeight:'800', color:'#0f172a'},
  notifBtn: {position:'relative', padding:4},
  notifDot: {position:'absolute', top:2, right:2, width:8, height:8, borderRadius:4, backgroundColor:'#ef4444', zIndex:1},
  searchBar: {flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderRadius:12, paddingHorizontal:12, paddingVertical:10, gap:8, marginBottom:10, borderWidth:1, borderColor:'#e2e8f0'},
  searchInput: {flex:1, fontSize:13, color:'#0f172a'},
  langRow: {flexDirection:'row', gap:6, flexWrap:'wrap'},
  langChip: {paddingHorizontal:10, paddingVertical:5, borderRadius:20, backgroundColor:'#fff', borderWidth:1, borderColor:'#e2e8f0'},
  langChipActive: {backgroundColor:'#22C55E', borderColor:'#22C55E'},
  langChipText: {fontSize:11, color:'#64748b', fontWeight:'600'},
  langChipTextActive: {color:'#fff', fontWeight:'700'},
  tabToggle: {flexDirection:'row', marginHorizontal:16, marginBottom:8, backgroundColor:'#f1f5f9', borderRadius:12, padding:3},
  toggleBtn: {flex:1, paddingVertical:8, borderRadius:10, alignItems:'center'},
  toggleBtnActive: {backgroundColor:'#fff', elevation:2},
  toggleBtnText: {fontSize:13, color:'#94a3b8', fontWeight:'600'},
  toggleBtnTextActive: {color:'#22C55E', fontWeight:'700'},
  postCard: {backgroundColor:'#fff', borderRadius:18, marginHorizontal:16, marginBottom:12, padding:14, elevation:2},
  postHeader: {flexDirection:'row', alignItems:'center', gap:10, marginBottom:10},
  postAvatar: {width:42, height:42, borderRadius:21, backgroundColor:'#dcfce7', alignItems:'center', justifyContent:'center'},
  postAuthor: {fontSize:13, fontWeight:'700', color:'#0f172a'},
  postTime: {fontSize:10, color:'#94a3b8', marginTop:1},
  healthBadge: {backgroundColor:'#fef3c720', borderRadius:8, paddingHorizontal:8, paddingVertical:4},
  healthBadgeText: {fontSize:10, fontWeight:'700', color:'#f59e0b'},
  postText: {fontSize:13, color:'#475569', lineHeight:19, marginBottom:10},
  postImage: {height:130, borderRadius:12, overflow:'hidden', marginBottom:10, position:'relative'},
  leafRow: {flex:1, flexDirection:'row'},
  leafCell: {flex:1},
  yellowSpot: {position:'absolute', width:16, height:16, borderRadius:8, backgroundColor:'#fbbf2480', top:'58%', left:'28%'},
  postActions: {flexDirection:'row', gap:14},
  actionBtn: {flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:12, paddingVertical:6, backgroundColor:'#f8fafc', borderRadius:8},
  actionBtnText: {fontSize:13, color:'#64748b', fontWeight:'600'},
  chatWrap: {flex:1},
  aiStatusBar: {flexDirection:'row', alignItems:'center', margin:16, marginBottom:8, backgroundColor:'#fff', borderRadius:14, padding:12, gap:10, elevation:2},
  aiAvatarSm: {width:32, height:32, borderRadius:16, backgroundColor:'#dcfce7', alignItems:'center', justifyContent:'center'},
  aiStatusTitle: {fontSize:12, fontWeight:'700', color:'#22C55E'},
  aiStatusSub: {fontSize:11, color:'#94a3b8', marginTop:1},
  aiOnlineDot: {width:8, height:8, borderRadius:4, backgroundColor:'#22C55E'},
  msgArea: {flex:1, paddingHorizontal:16},
  msgRow: {flexDirection:'row', alignItems:'flex-end', gap:6, marginBottom:10},
  msgRowUser: {justifyContent:'flex-end'},
  aiMsgAvatar: {width:28, height:28, borderRadius:14, backgroundColor:'#dcfce7', alignItems:'center', justifyContent:'center', marginBottom:4},
  bubble: {maxWidth:'75%', borderRadius:16, padding:10},
  bubbleAI: {backgroundColor:'#fff', borderBottomLeftRadius:4, elevation:1},
  bubbleUser: {backgroundColor:'#22C55E', borderBottomRightRadius:4},
  bubbleText: {fontSize:13, color:'#0f172a', lineHeight:18},
  bubbleTextUser: {color:'#fff'},
  bubbleTime: {fontSize:9, color:'#94a3b8', marginTop:4, alignSelf:'flex-end'},
  chatInputRow: {flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:8, backgroundColor:'#fff', borderTopWidth:1, borderTopColor:'#f1f5f9', gap:8},
  attachBtn: {padding:4},
  chatInput: {flex:1, fontSize:13, color:'#0f172a', backgroundColor:'#f8fafc', borderRadius:20, paddingHorizontal:14, paddingVertical:8, borderWidth:1, borderColor:'#e2e8f0'},
  voiceBtn: {backgroundColor:'#22C55E', margin:16, marginTop:8, borderRadius:30, paddingVertical:15, alignItems:'center', shadowColor:'#22C55E', shadowOffset:{width:0,height:4}, shadowOpacity:0.35, shadowRadius:8, elevation:5},
  voiceBtnActive: {backgroundColor:'#dc2626'},
  voiceBtnText: {color:'#fff', fontWeight:'800', fontSize:16},
});
