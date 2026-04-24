import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, FlatList, Alert,
} from 'react-native';
import { rtdb } from '../config/firebase';
import { ref, push, onValue, serverTimestamp, query, orderByChild, limitToLast } from 'firebase/database';

const FARMERS = [
  { id: 'farmer_ramesh', name: 'Ramesh Kumar',  location: 'Punjab',      crop: 'Wheat',     online: true,  avatar: '👨‍🌾' },
  { id: 'farmer_suresh', name: 'Suresh Mehta',  location: 'MP',          crop: 'Soybean',   online: false, avatar: '🧑‍🌾' },
  { id: 'farmer_anita',  name: 'Anita Devi',    location: 'UP',          crop: 'Sugarcane', online: true,  avatar: '👩‍🌾' },
  { id: 'farmer_vikram', name: 'Vikram Singh',  location: 'Rajasthan',   crop: 'Cotton',    online: false, avatar: '👨‍🌾' },
  { id: 'farmer_priya',  name: 'Priya Sharma',  location: 'Maharashtra', crop: 'Onion',     online: true,  avatar: '👩‍🌾' },
];

const MY_USER_ID = 'farmer_me';
const MY_NAME = 'You';

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('__');
}

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Chat Window ──────────────────────────────────────────────
function ChatWindow({ farmer, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [rtdbError, setRtdbError] = useState(false);
  const scrollRef = useRef(null);
  const chatId = getChatId(MY_USER_ID, farmer.id);

  useEffect(() => {
    const chatRef = ref(rtdb, `chats/${chatId}/messages`);
    const chatQuery = query(chatRef, orderByChild('timestamp'), limitToLast(50));

    const unsub = onValue(
      chatQuery,
      (snapshot) => {
        setRtdbError(false);
        const data = snapshot.val();
        if (data) {
          const msgs = Object.entries(data)
            .map(([key, val]) => ({ id: key, ...val }))
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          setMessages(msgs);
        } else {
          setMessages([]);
        }
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      },
      (error) => {
        console.log('RTDB error:', error.message);
        setRtdbError(true);
      }
    );

    return () => unsub();
  }, [chatId]);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');

    if (rtdbError) {
      // Optimistic local update when Firebase rules block
      const localMsg = {
        id: String(Date.now()),
        senderId: MY_USER_ID,
        senderName: MY_NAME,
        text,
        timestamp: Date.now(),
        local: true,
      };
      setMessages(prev => [...prev, localMsg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    try {
      const chatRef = ref(rtdb, `chats/${chatId}/messages`);
      await push(chatRef, {
        senderId: MY_USER_ID,
        senderName: MY_NAME,
        text,
        timestamp: serverTimestamp(),
      });
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    } catch (err) {
      // Fallback: show message locally
      Alert.alert(
        'Firebase Rules Needed',
        'Set your Realtime Database rules to allow read/write in Test Mode on the Firebase Console. For now showing locally.',
        [{ text: 'OK' }]
      );
      const localMsg = {
        id: String(Date.now()),
        senderId: MY_USER_ID,
        senderName: MY_NAME,
        text,
        timestamp: Date.now(),
        local: true,
      };
      setMessages(prev => [...prev, localMsg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={[styles.avatarCircle, { backgroundColor: farmer.online ? '#dcfce7' : '#f1f5f9' }]}>
          <Text style={{ fontSize: 20 }}>{farmer.avatar}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatHeaderName}>{farmer.name}</Text>
          <Text style={styles.chatHeaderSub}>
            {farmer.online ? 'ONLINE' : 'OFFLINE'} · {farmer.crop} · {farmer.location}
            {rtdbError ? '  (LOCAL)' : ''}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.msgArea}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.emptyChatBox}>
            <Text style={styles.emptyChatText}>START CHAT WITH {farmer.name.toUpperCase()}</Text>
            <Text style={styles.emptyChatSub}>Discuss farming, soil, and yield.</Text>
          </View>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === MY_USER_ID;
          return (
            <View key={msg.id} style={[styles.msgRow, isMe && styles.msgRowMe]}>
              <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
                <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{msg.text}</Text>
                <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
                  {formatTime(msg.timestamp)}{msg.local ? ' · local' : ''}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input */}
      <View style={styles.chatInputBar}>
        <TextInput
          style={styles.chatInput}
          placeholder={`Message ${farmer.name.split(' ')[0]}...`}
          placeholderTextColor="#94a3b8"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={300}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[styles.chatSendBtn, !inputText.trim() && styles.chatSendBtnOff]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.chatSendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Contact List ─────────────────────────────────────────────
function ContactList({ onSelectFarmer }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.sectionTitle}>Farmer Network</Text>
      <Text style={styles.sectionSub}>Select a colleague to start a conversation</Text>
      <FlatList
        data={FARMERS}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.contactCard} onPress={() => onSelectFarmer(item)}>
            <View style={[styles.contactAva, { backgroundColor: item.online ? '#dcfce7' : '#f1f5f9' }]}>
              <Text style={{ fontSize: 26 }}>{item.avatar}</Text>
              {item.online && <View style={styles.onlineDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactMeta}>LOCATION: {item.location}  |  CROP: {item.crop}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: item.online ? '#dcfce7' : '#f1f5f9' }]}>
              <Text style={[styles.statusText, { color: item.online ? '#16a34a' : '#64748b' }]}>
                {item.online ? 'Online' : 'Offline'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ── Forum Posts ──────────────────────────────────────────────
const POSTS = [
  {
    id: '1', author: 'Ramesh Kumar', location: 'Punjab', time: '20 min ago',
    text: 'Finding yellow spots on tomato leaves. Is this early blight or nutrient deficiency? Irrigation schedule hasn\'t changed.',
    likes: 24, comments: 8, badge: '⚠️ DISEASE', emoji: '👨‍🌾',
  },
  {
    id: '2', author: 'Priya Sharma', location: 'Maharashtra', time: '1 hr ago',
    text: 'Great harvest of onions this season! Used the drip irrigation method suggested in this community. Yield up by 30%!',
    likes: 56, comments: 14, badge: '✅ SUCCESS', emoji: '👩‍🌾',
  },
];

function ForumPosts() {
  const [likedPosts, setLikedPosts] = useState({});
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30, gap: 12 }}>
      {POSTS.map(post => (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.postAvatar}><Text style={{ fontSize: 22 }}>{post.emoji}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.postAuthor}>{post.author}</Text>
              <Text style={styles.postTime}>{post.time} · {post.location}</Text>
            </View>
            <View style={styles.postBadge}><Text style={styles.postBadgeText}>{post.badge}</Text></View>
          </View>
          <Text style={styles.postText}>{post.text}</Text>
          <View style={styles.postActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setLikedPosts(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
            >
              <Text style={[styles.actionText, likedPosts[post.id] && { color: '#22C55E' }]}>
                UPVOTE {likedPosts[post.id] ? post.likes + 1 : post.likes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionText}>COMMENTS: {post.comments}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Main Screen ──────────────────────────────────────────────
export default function CommunityScreen() {
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [tab, setTab] = useState('chat');

  if (selectedFarmer) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f0fdf4' }}>
        <ChatWindow farmer={selectedFarmer} onBack={() => setSelectedFarmer(null)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>COMMUNITY</Text>
        <Text style={styles.headerSub}>OFFICIAL FARMER NETWORK</Text>
      </View>

      <View style={styles.tabRow}>
        {[
          { key: 'chat',  label: 'Direct Chat' },
          { key: 'forum', label: 'Farmer Forum' },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabBtnText, tab === t.key && styles.tabBtnTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'chat' ? <ContactList onSelectFarmer={setSelectedFarmer} /> : <ForumPosts />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#0d2b18', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 9, color: '#86efac', letterSpacing: 1.5, fontWeight: '600', marginTop: 2 },
  tabRow: {
    flexDirection: 'row', margin: 16, backgroundColor: '#f1f5f9',
    borderRadius: 12, padding: 3,
  },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: '#fff', elevation: 2 },
  tabBtnText: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
  tabBtnTextActive: { color: '#16a34a', fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', paddingHorizontal: 16, marginBottom: 2 },
  sectionSub: { fontSize: 12, color: '#64748b', paddingHorizontal: 16, marginBottom: 4 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 },
  },
  contactAva: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff',
  },
  contactName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  contactMeta: { fontSize: 11, color: '#64748b', marginTop: 3 },
  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  // Chat window
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#0d2b18', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
  },
  backBtn: { paddingRight: 4 },
  backArrow: { fontSize: 32, color: '#fff', lineHeight: 36 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  chatHeaderName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  chatHeaderSub: { fontSize: 10, color: '#86efac', marginTop: 1 },
  msgArea: { flex: 1, backgroundColor: '#f0fdf4' },
  msgRow: { flexDirection: 'row', marginBottom: 8 },
  msgRowMe: { justifyContent: 'flex-end' },
  msgBubble: { maxWidth: '76%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  msgBubbleMe: { backgroundColor: '#16a34a', borderBottomRightRadius: 4 },
  msgBubbleOther: {
    backgroundColor: '#fff', borderBottomLeftRadius: 4,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 },
  },
  msgText: { fontSize: 14, color: '#0f172a', lineHeight: 20 },
  msgTextMe: { color: '#fff' },
  msgTime: { fontSize: 9, color: '#94a3b8', marginTop: 4, alignSelf: 'flex-end' },
  msgTimeMe: { color: '#bbf7d0' },
  emptyChatBox: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyChatText: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  emptyChatSub: { fontSize: 13, color: '#64748b' },
  chatInputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  chatInput: {
    flex: 1, fontSize: 14, color: '#0f172a', backgroundColor: '#f8fafc',
    borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: '#e2e8f0', maxHeight: 80,
  },
  chatSendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  chatSendBtnOff: { backgroundColor: '#bbf7d0' },
  chatSendIcon: { color: '#fff', fontSize: 18 },
  // Forum
  postCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 },
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  postAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  postAuthor: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  postTime: { fontSize: 10, color: '#94a3b8', marginTop: 1 },
  postBadge: { backgroundColor: '#fff7ed', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  postBadgeText: { fontSize: 10, fontWeight: '700', color: '#f59e0b' },
  postText: { fontSize: 13, color: '#475569', lineHeight: 19, marginBottom: 12 },
  postActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f8fafc', borderRadius: 8 },
  actionText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
});
