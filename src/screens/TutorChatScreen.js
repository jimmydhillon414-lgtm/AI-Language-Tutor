import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  ImageBackground,
} from 'react-native';
import * as Speech from 'expo-speech';
import { supabase } from '../api/supabase';
import { GoogleGenAI } from '@google/genai';

export default function TutorChatScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [userId, setUserId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [userProfile, setUserProfile] = useState({ target_language: 'English', proficiency_level: 'Beginner' });
  const flatListRef = useRef();
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchUserAndHistory();
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  async function fetchUserAndHistory() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) setUserProfile(profile);

    const { data, error } = await supabase
      .from('tutor_chat_history')
      .select('*')
      .eq('id', user.id) // fixed user_id filtering bug if any
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  }

  const toggleVoiceInput = () => {
    if (Platform.OS !== 'web') {
      alert('Speech Recognition is currently configured for Web browsers.');
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }

    if (listening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      const langMap = {
        English: 'en-IN',
        Punjabi: 'pa-IN',
        Hindi: 'hi-IN',
      };

      recognition.lang = langMap[userProfile?.target_language] || 'hi-IN';

      recognition.onstart = () => {
        setListening(true);
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          setInput(currentText);
        }
      };

      recognition.onerror = (event) => {
        console.log('Speech recognition error:', event.error);
        setListening(false);
        if (event.error === 'no-speech') {
          alert('No speech was detected. Please speak clearly into your microphone.');
        } else if (event.error === 'not-allowed') {
          alert('Microphone access blocked. Please check your browser permissions.');
        }
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.log('Mic init error:', err);
      setListening(false);
      alert('Could not start microphone.');
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
      language: 'en-US',
      onDone: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  async function getAiResponse(promptText) {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key is missing.');
    }

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: promptText,
    });

    return response.text.trim();
  }

  async function handleSend() {
    if (!input || !input.trim() || !userId) return;

    if (listening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setListening(false);
    }

    const userText = input.trim();
    setInput('');

    const tempUserMsg = {
      id: Date.now().toString(),
      user_id: userId,
      role: 'user',
      message: userText,
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      await supabase.from('tutor_chat_history').insert({
        user_id: userId,
        role: 'user',
        message: userText,
      });

      const targetLang = userProfile?.target_language || 'English';
      const proficiency = userProfile?.proficiency_level || 'Beginner';

      const prompt = `You are an expert ${targetLang} language tutor coaching a ${proficiency} level student. The user says: "${userText}".
Answer their question directly and helpfully. Check if their text has any mistakes based on ${targetLang}.

You MUST reply ONLY with a valid JSON object in this exact format (no markdown code blocks, just raw JSON text):
{
  "hasCorrection": false,
  "originalText": "${userText}",
  "correctedText": "",
  "explanation": "",
  "reply": "Your detailed and helpful answer here"
}`;

      const responseText = await getAiResponse(prompt);

      let parsedData;
      try {
        const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleanJsonStr);
      } catch (e) {
        parsedData = {
          hasCorrection: false,
          originalText: userText,
          correctedText: '',
          explanation: '',
          reply: responseText || 'Please tell me more about what you would like to learn.',
        };
      }

      const messagePayload = JSON.stringify(parsedData);

      const { data: savedAiMsg } = await supabase
        .from('tutor_chat_history')
        .insert({
          user_id: userId,
          role: 'model',
          message: messagePayload,
        })
        .select()
        .maybeSingle();

      const newAiId = savedAiMsg ? savedAiMsg.id : Date.now().toString();
      const aiMsgObj = savedAiMsg || { id: newAiId, role: 'model', message: messagePayload };

      if (savedAiMsg) {
        setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, savedAiMsg]);
      } else {
        setMessages((prev) => [...prev, aiMsgObj]);
      }

      const autoSpeechText = parsedData.reply || responseText;
      if (autoSpeechText) {
        speakText(autoSpeechText, newAiId);
      }

    } catch (err) {
      let errorReply = 'An error occurred with the AI service.';
      if (err.message && err.message.includes('429')) {
        errorReply = '⚠️ API Quota limit exceeded. Please wait a few minutes.';
      }

      const errorPayload = JSON.stringify({
        hasCorrection: false,
        originalText: userText,
        correctedText: '',
        explanation: '',
        reply: errorReply,
      });

      const errorMsgObj = {
        id: Date.now().toString(),
        user_id: userId,
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
          <Text style={styles.senderLabel}>AI Tutor</Text>
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
      <View style={styles.overlay}>
        
        <View style={styles.topHeaderBar}>
          <Text style={styles.topHeaderTitle}>AI Language Tutor</Text>
          <TouchableOpacity 
            style={styles.helpButton} 
            onPress={() => alert('Help & Support: Type your queries or use voice input to practice conversation with your AI tutor.')}
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

        {/* Web optimized form wrapper to ensure Enter key submission works 100% reliably */}
        <View 
          style={styles.inputContainer}
          {...(Platform.OS === 'web' ? {
            onKeyDown: (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }
          } : {})}
        >
          <TextInput
            style={styles.input}
            placeholder="Ask your tutor anything..."
            placeholderTextColor="#8FA39D"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity 
            style={[styles.micButton, listening && styles.micButtonActive]} 
            onPress={toggleVoiceInput}
          >
            <Text style={styles.micText}>{listening ? '🎙️' : '🎤'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
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
    } : {}),
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 14, 0.72)',
    flexDirection: 'column',
    width: '100%',
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
  speakerBtn: { backgroundColor: '#0A3B3D', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#8C6E52' },
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
    borderRadius: 12,
    marginLeft: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
  },
  loadingText: { color: '#E8B486', marginLeft: 8, fontSize: 15, fontWeight: '500' },
  
  inputContainer: { 
    flexDirection: 'row', 
    padding: 16, 
    backgroundColor: 'rgba(17, 23, 21, 0.92)',
    borderTopWidth: 1.5, 
    borderTopColor: '#0A3B3D', 
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  input: { 
    flex: 1, 
    maxWidth: 700,
    backgroundColor: 'rgba(23, 33, 30, 0.9)', 
    color: '#E1F2EC', 
    paddingHorizontal: 18,
    paddingVertical: 12, 
    borderRadius: 14, 
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
    fontSize: 16, 
  },
  micButton: { 
    backgroundColor: 'rgba(23, 33, 30, 0.9)', 
    width: 48,
    height: 48, 
    borderRadius: 14, 
    marginRight: 10, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
  },
  micButtonActive: { backgroundColor: '#0A3B3D', borderColor: '#8C6E52' },
  micText: { fontSize: 20 }, 
  sendButton: { 
    backgroundColor: '#C29B72', 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 22, 
    height: 48,
    borderRadius: 14,
  },
  sendButtonText: { color: '#111715', fontWeight: 'bold', fontSize: 16 }, 
});
