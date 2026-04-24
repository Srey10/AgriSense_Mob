import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { askGemini } from '../config/gemini';

const QUICK_PROMPTS = [
  'Yellow leaves on tomato plant',
  'Best fertilizer for wheat?',
  'When to irrigate rice?',
  'Onion mandi price today',
  'How to prevent pest attack?',
  'Soil pH correction tips',
];

const FAQ_KB = {
  'yellow leaves on tomato plant': 'Yellow leaves on tomatoes often mean overwatering or Nitrogen deficiency. Try adding 5kg/acre of Nitrogen and reducing water frequency.',
  'best fertilizer for wheat': 'For wheat, a balanced NPK fertilizer (120:60:40 kg/ha) is usually recommended. Apply half of Nitrogen as basal, and the rest in two splits after 1st and 2nd irrigation.',
  'when to irrigate rice': 'Irrigate rice when the water level drops. Maintain 5cm of water during the critical stages: tillering, panicle initiation, and flowering.',
  'onion mandi price today': 'Mandi prices vary by location. Today, typical prices range between ₹15-₹30 per kg. Check the Agmarknet app for your specific local market (APMC).',
  'how to prevent pest attack': 'Use neem oil (5ml/L) as a first defense. Practice intercropping (e.g., Marigolds) and install yellow sticky traps to catch aphids and whiteflies naturally.',
  'soil ph correction tips': 'For acidic soils (pH < 6.5), add agricultural lime. For alkaline soils (pH > 7.5), apply gypsum or organic sulfur. Always perform a soil test before treatment.'
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'model',
      text: 'Namaste! I am AgriBot, your AI farming assistant.\n\nAsk me anything about:\n• Crop diseases & pest control\n• Fertilizers & soil health\n• Irrigation & weather\n• Market prices & farming tips',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const scrollRef = useRef(null);
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isLoading) {
      const anim = (dot, delay) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ])
        );
      Animated.parallel([anim(dot1, 0), anim(dot2, 200), anim(dot3, 400)]).start();
    } else {
      dot1.setValue(0.3); dot2.setValue(0.3); dot3.setValue(0.3);
    }
  }, [isLoading]);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  };

  const sendMessage = async (prompt) => {
    const query = (prompt || inputText).trim();
    if (!query || isLoading) return;

    setInputText('');
    setErrorMsg('');

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    scrollToBottom();

    try {
      // Check local FAQ Knowledge Base first
      const normalizedQuery = query.toLowerCase().replace(/[?.,!]/g, '');
      const localAnswer = FAQ_KB[normalizedQuery];

      if (localAnswer) {
        // Fast path: instant response from local KB
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'model',
          text: `[Instant Help] ${localAnswer}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setIsLoading(false);
        scrollToBottom();
        return;
      }

      // If not in KB, ask Gemini
      const history = messages
        .filter(m => m.id !== 1)
        .slice(-6)
        .map(m => ({ role: m.role, text: m.text }));

      const reply = await askGemini(query, history);

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'model',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err) {
      let errText = err.message || 'Unknown error';
      let friendlyMsg = `Sorry, I could not respond right now.\n\nError: ${errText}\n\nPlease check your internet connection and try again.`;

      if (errText.includes('quota') || errText.includes('rate limit') || errText.includes('429')) {
        friendlyMsg = "Namaste! AgriBot is getting a lot of questions right now and needs a quick 15-second breather. 🌾\n\nPlease wait a moment and try your question again!";
      }

      setErrorMsg(friendlyMsg);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'model',
        text: friendlyMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <View style={styles.avatarLeaf} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>AgriBot</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineTxt}>AI Farming Assistant · Online</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.msgArea}
        contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToBottom}
      >
        {messages.map(msg => (
          <View key={msg.id} style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
            {msg.role === 'model' && (
              <View style={styles.botAvatar}>
                <View style={styles.botAvatarLeaf} />
              </View>
            )}
            <View style={[
              styles.bubble,
              msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot,
              msg.isError && styles.bubbleError,
            ]}>
              <Text style={[styles.bubbleTxt, msg.role === 'user' && styles.bubbleTxtUser]}>
                {msg.text}
              </Text>
              <Text style={[styles.bubbleTime, msg.role === 'user' && styles.bubbleTimeUser]}>
                {msg.time}
              </Text>
            </View>
          </View>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <View style={styles.msgRow}>
            <View style={styles.botAvatar}>
              <View style={styles.botAvatarLeaf} />
            </View>
            <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
              <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
              <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
              <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick prompts — show only early in conversation */}
      {messages.length <= 2 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {QUICK_PROMPTS.map((p, i) => (
            <TouchableOpacity key={i} style={styles.quickChip} onPress={() => sendMessage(p)}>
              <Text style={styles.quickChipTxt}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input Bar — plain View, NOT KeyboardAvoidingView */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.inputField}
          placeholder="Ask about crops, soil, weather..."
          placeholderTextColor="#94a3b8"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          blurOnSubmit={false}
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnOff]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.sendBtnTxt}>&#10148;</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#0d2b18',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
  },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center',
  },
  avatarLeaf: {
    width: 18, height: 24, borderRadius: 12, backgroundColor: '#fff',
    transform: [{ rotate: '-30deg' }],
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  onlineTxt: { fontSize: 11, color: '#86efac' },
  msgArea: { flex: 1 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  msgRowUser: { justifyContent: 'flex-end' },
  botAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center',
  },
  botAvatarLeaf: {
    width: 12, height: 16, borderRadius: 8, backgroundColor: '#22C55E',
    transform: [{ rotate: '-20deg' }],
  },
  bubble: {
    maxWidth: '78%', borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  bubbleBot: {
    backgroundColor: '#fff', borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  bubbleUser: { backgroundColor: '#16a34a', borderBottomRightRadius: 4 },
  bubbleError: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  bubbleTxt: { fontSize: 13.5, color: '#0f172a', lineHeight: 20 },
  bubbleTxtUser: { color: '#fff' },
  bubbleTime: { fontSize: 9, color: '#94a3b8', marginTop: 4, alignSelf: 'flex-end' },
  bubbleTimeUser: { color: '#bbf7d0' },
  typingBubble: {
    flexDirection: 'row', gap: 5,
    paddingVertical: 14, paddingHorizontal: 18,
  },
  typingDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E',
  },
  quickRow: { maxHeight: 50, marginBottom: 4 },
  quickChip: {
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: '#bbf7d0', elevation: 1,
  },
  quickChipTxt: { fontSize: 12, color: '#15803d', fontWeight: '600' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  inputField: {
    flex: 1, fontSize: 14, color: '#0f172a',
    backgroundColor: '#f8fafc', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
    maxHeight: 100,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center',
  },
  sendBtnOff: { backgroundColor: '#bbf7d0' },
  sendBtnTxt: { color: '#fff', fontSize: 18 },
});
