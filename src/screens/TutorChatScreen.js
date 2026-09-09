import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  ImageBackground,
  TextInput,
} from 'react-native';
import * as Speech from 'expo-speech';
import { supabase } from '../api/supabase';

export default function TutorChatScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState({ target_language: 'German', proficiency_level: 'Beginner' });
  
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'model',
      message: JSON.stringify({
        hasCorrection: false,
        reply: `Hello! I am your AI language tutor. You are here to learn German. What would you like to practice today?`,
      }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const flatListRef = useRef();
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchUserAndProfile();
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      Speech.stop();
    };
  }, []);

  async function fetchUserAndProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
        setMessages([
          {
            id: '1',
            role: 'model',
            message: JSON.stringify({
              hasCorrection: false,
              reply: `Hello! I am your AI language tutor. You are here to learn ${profile.target_language || 'German'}. What would you like to practice today?`,
            }),
          },
        ]);
      }
    } catch (err) {
      console.log('Error fetching user profile:', err);
    }
  }

  const getLanguageCode = (lang) => {
    const langMap = {
      English: 'en-US',
      German: 'de-DE',
      Hindi: 'hi-IN',
      Punjabi: 'pa-IN',
      French: 'fr-FR',
      Spanish: 'es-ES',
      Italian: 'it-IT',
    };
    return langMap[lang] || 'en-US';
  };

  const toggleVoiceInput = () => {
    const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('firefox');
    if (isFirefox) {
      alert('Speech Recognition is not natively supported in Mozilla Firefox. Please use Google Chrome or type your message below.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }

    if (listening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // <-- Fix 1: Continuous true kiya taaki beech mein cut na ho
      recognition.interimResults = true;
      recognition.lang = getLanguageCode(userProfile?.target_language);

      let finalTranscript = '';

      recognition.onstart = () => {
        finalTranscript = '';
        setListening(true);
      };
      
      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInput((finalTranscript + interim).trim());
      };

      recognition.onerror = (event) => {
        console.log('Speech recognition error:', event.error);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.log('Mic init error:', err);
      setListening(false);
    }
  };

  const speakText = (text, messageId) => {
    if (speakingId === messageId) {
      Speech.stop();
      setSpeakingId(null);
      return;
    }
    Speech.stop();
    setSpeakingId(messageId);
    
    Speech.speak(text, {
      language: getLanguageCode(userProfile?.target_language),
      onDone: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });

    // Fix 2: Fallback timer taaki Chrome mein agar onDone event miss ho jaye toh button auto-reset ho jaye
    const estimatedDuration = Math.min(Math.max(text.length * 80, 3000), 15000);
    setTimeout(() => {
      setSpeakingId((current) => (current === messageId ? null : current));
    }, estimatedDuration);
  };

  async function getAiResponse(promptText) {
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { prompt: promptText },
    });

    if (error) {
      console.error("Supabase Invoke Error:", error);
      throw new Error(error.message || 'Failed to communicate with AI proxy.');
    }

    if (data && data.error) {
      console.error("AI Proxy Data Error:", data.error);
      throw new Error(data.error || 'AI service returned an error.');
    }

    return data.choices[0].message.content;
  }

  async function handleSendDirect(textToSend) {
    const messageValue = typeof textToSend === 'string' ? textToSend : input;
    if (!messageValue || !messageValue.trim() || loading) return;

    if (listening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setListening(false);
    }

    setInput('');

    const tempUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      message: messageValue.trim(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const targetLang = userProfile?.target_language || 'German';
      const proficiency = userProfile?.proficiency_level || 'Beginner';

      const prompt = `You are an expert ${targetLang} language tutor coaching a ${proficiency} level student. The user says: "${messageValue.trim()}".
Answer their question directly and helpfully. Check if their text has any mistakes based on ${targetLang}.

You MUST reply ONLY with a valid JSON object in this exact format:
{
  "hasCorrection": false,
  "originalText": "${messageValue.trim()}",
  "correctedText": "",
  "explanation": "",
  "reply": "Your detailed and helpful answer here"
}`;

      const responseText = await getAiResponse(prompt);

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (e) {
        parsedData = {
          hasCorrection: false,
          originalText: messageValue.trim(),
          correctedText: '',
          explanation: '',
          reply: responseText || 'Please tell me more about what you would like to learn.',
        };
      }

      const messagePayload = JSON.stringify(parsedData);
      const newAiId = Date.now().toString();

      const aiMsgObj = { id: newAiId, role: 'model', message: messagePayload };
      setMessages((prev) => [...prev, aiMsgObj]);

      const autoSpeechText = parsedData.reply || responseText;
      if (autoSpeechText) {
        speakText(autoSpeechText, newAiId);
      }

    } catch (err) {
      console.log('AI Error details:', err);
      let errorReply = 'An error occurred with the AI service.';
      if (err.message && err.message.includes('429')) {
        errorReply = '⚠️ API Quota limit exceeded. Please wait a few minutes.';
      } else if (err.message && (err.message.includes('401') || err.message.includes('400'))) {
        errorReply = '⚠️ API Configuration Error. Please check your Groq API Key.';
      }

      const errorPayload = JSON.stringify({
        hasCorrection: false,
        originalText: messageValue.trim(),
        correctedText: '',
        explanation: '',
        reply: errorReply,
      });

      const errorMsgObj = {
        id: Date.now().toString(),
        role: 'model',
        message: errorPayload,
      };
      setMessages((prev) => [...prev, errorMsgObj]);
      speakText(errorReply, errorMsgObj.id);
    } finally {
      setLoading(false);
    }
  }

  const renderMessageItem = ({ item }) => {
    if (item.role === 'user') {
      return (
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={styles.senderLabel}>You</Text>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      );
    }

    let parsedData = null;
    try {
      parsedData = JSON.parse(item.message);
    } catch (e) {
      parsedData = { reply: item.message, hasCorrection: false };
    }

    const textToSpeak = parsedData.reply || item.message;

    return (
      <View style={[styles.bubble, styles.aiBubble]}>
        <View style={styles.aiHeader}>
          <Text style={styles.senderLabel}>AI Tutor ({userProfile?.target_language || 'Tutor'})</Text>
          <TouchableOpacity 
            onPress={() => speakText(textToSpeak, item.id)} 
            style={styles.speakerBtn}
          >
            <Text style={styles.speakerIcon}>
              {speakingId === item.id ? '⏹ Stop' : '🔊 Listen'}
            </Text>
          </TouchableOpacity>
        </View>

        {parsedData.hasCorrection && (
          <View style={styles.correctionContainer}>
            <Text style={styles.correctionTitle}>💡 Grammar / Translation Tip</Text>
            <Text style={styles.correctionOriginal}>❌ {parsedData.originalText || item.message}</Text>
            {parsedData.correctedText ? (
              <Text style={styles.correctionFixed}>✅ {parsedData.correctedText}</Text>
            ) : null}
            {parsedData.explanation ? (
              <Text style={styles.correctionReason}>{parsedData.explanation}</Text>
            ) : null}
          </View>
        )}

        <Text style={styles.messageText}>{parsedData.reply || item.message}</Text>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop' }} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} pointerEvents="box-none">
        
        <View style={styles.topHeaderBar}>
          <Text style={styles.topHeaderTitle}>AI Language Tutor ({userProfile?.target_language || 'General'})</Text>
          <TouchableOpacity 
            style={styles.helpButton} 
            onPress={() => alert('Tip: Select your target language in your profile settings to practice seamlessly.')}
          >
            <Text style={styles.helpButtonText}>❓ Help</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chatArea}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            style={styles.flatListStyle}
            contentContainerStyle={styles.chatContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={renderMessageItem}
          />
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFCB9A" />
            <Text style={styles.loadingText}>Tutor is typing...</Text>
          </View>
        )}

        <View style={styles.inputBar}>
          <View style={styles.inputInner}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder={`Ask your ${userProfile?.target_language || ''} tutor anything...`}
              placeholderTextColor="#8C6E52"
              onSubmitEditing={() => handleSendDirect(input)}
              returnKeyType="send"
            />
            <TouchableOpacity 
              style={[styles.iconButton, listening && { borderColor: '#E8B486', backgroundColor: '#0A3B3D' }]} 
              onPress={toggleVoiceInput}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20 }}>{listening ? '🎙️' : '🎤'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={() => handleSendDirect(input)}
              activeOpacity={0.7}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' ? {
      height: 'calc(100vh - 56px)',
      maxHeight: 'calc(100vh - 56px)',
      pointerEvents: 'auto',
    } : {}),
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 14, 0.72)',
    flexDirection: 'column',
    width: '100%',
    ...(Platform.OS === 'web' ? {
      pointerEvents: 'auto',
    } : {}),
  },
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: 'rgba(17, 23, 21, 0.85)',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0A3B3D',
    zIndex: 10,
  },
  topHeaderTitle: {
    color: '#E8B486',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  helpButton: {
    backgroundColor: 'rgba(23, 33, 30, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  helpButtonText: {
    color: '#E1F2EC',
    fontSize: 15,
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  flatListStyle: {
    flex: 1,
    width: '100%',
  },
  chatContainer: { 
    padding: 16, 
    paddingBottom: 24,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  bubble: {
    padding: 14, 
    borderRadius: 16, 
    marginBottom: 12, 
    maxWidth: '70%', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  userBubble: { 
    backgroundColor: 'rgba(10, 59, 61, 0.85)',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    borderWidth: 1.5,
    borderColor: '#8C6E52',
  },
  aiBubble: { 
    backgroundColor: 'rgba(17, 23, 21, 0.88)',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1.5,
    borderColor: '#0A3B3D', 
  },
  aiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  senderLabel: { color: '#E8B486', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  speakerBtn: { 
    backgroundColor: '#0A3B3D', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#8C6E52',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  speakerIcon: { color: '#E8B486', fontSize: 13, fontWeight: '600' },
  messageText: { color: '#E1F2EC', fontSize: 15, lineHeight: 21 }, 
  
  correctionContainer: {
    backgroundColor: 'rgba(23, 33, 30, 0.9)',
    borderColor: '#8C6E52',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  correctionTitle: { color: '#E8B486', fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  correctionOriginal: { color: '#8C6E52', fontSize: 14, marginBottom: 4 },
  correctionFixed: { color: '#E1F2EC', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  correctionReason: { color: '#E1F2EC', fontSize: 13, fontStyle: 'italic', lineHeight: 18, opacity: 0.9 },

  loadingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 10,
    backgroundColor: 'rgba(17, 23, 21, 0.88)',
    alignSelf: 'flex-start',
    borderRadius: '12px',
    marginLeft: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
  },
  loadingText: { color: '#E8B486', marginLeft: 8, fontSize: 15, fontWeight: '500' },

  inputBar: {
    padding: 16,
    backgroundColor: 'rgba(17, 23, 21, 0.92)',
    borderTopWidth: 1.5,
    borderTopColor: '#0A3B3D',
    width: '100%',
    alignItems: 'center',
    zIndex: 20,
    ...(Platform.OS === 'web' ? {
      cursor: 'default',
      userSelect: 'none',
      pointerEvents: 'auto',
    } : {}),
  },
  inputInner: {
    flexDirection: 'row',
    maxWidth: 700,
    width: '100%',
    alignItems: 'center',
    gap: 10,
    ...(Platform.OS === 'web' ? { pointerEvents: 'auto' } : {}),
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(23, 33, 30, 0.9)',
    color: '#E1F2EC',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
    fontSize: 16,
    ...(Platform.OS === 'web' ? {
      outlineStyle: 'none',
      pointerEvents: 'auto',
    } : {}),
  },
  iconButton: {
    backgroundColor: 'rgba(23, 33, 30, 0.9)',
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      pointerEvents: 'auto',
    } : {}),
  },
  sendButton: {
    backgroundColor: '#C29B72',
    paddingHorizontal: 22,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      pointerEvents: 'auto',
    } : {}),
  },
  sendButtonText: {
    color: '#111715',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
