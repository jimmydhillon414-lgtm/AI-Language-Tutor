```javascript
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
  Image,
} from 'react-native';
import * as Speech from 'expo-speech';
import { supabase } from '../api/supabase';

export default function TutorChatScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState({ target_language: 'English', proficiency_level: 'Beginner' });
  
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'model',
      timestamp: '09:30 AM',
      message: JSON.stringify({
        hasCorrection: false,
        reply: `Hi Sarah! Today we're learning common greetings.`,
        isVoiceNote: false,
      }),
    },
    {
      id: '2',
      role: 'user',
      timestamp: '09:30 AM',
      message: 'Hello Buddy!',
    },
    {
      id: '3',
      role: 'model',
      timestamp: '09:31 AM',
      message: JSON.stringify({
        hasCorrection: false,
        reply: `Great start! How are you today?`,
        isVoiceNote: true,
        duration: '0:03',
      }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  
  const flatListRef = useRef();
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  useEffect(() => {
    fetchUserAndProfile();
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
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
    if (listening) {
      stopVoiceInput();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getLanguageCode(userProfile?.target_language);

      recognitionRef.current = recognition;
      setListening(true);

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

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            stopVoiceInput();
            if (currentText.trim()) {
              handleSendDirect(currentText.trim());
            }
          }, 2500);
        }
      };

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.error('Speech recognition error:', event.error);
        }
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setListening(false);
    }
  };

  const stopVoiceInput = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setListening(false);
  };

  const speakText = (text, messageId) => {
    if (speakingId === messageId) {
      Speech.stop();
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeakingId(null);
      return;
    }
    
    Speech.stop();
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    setSpeakingId(messageId);
    
    Speech.speak(text, {
      language: getLanguageCode(userProfile?.target_language),
      onDone: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const getCurrentTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  async function getAiResponse(promptText) {
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { prompt: promptText },
    });

    if (error) throw new Error(error.message || 'Failed to communicate with AI proxy.');
    if (data && data.error) throw new Error(data.error || 'AI service returned an error.');
    return data.choices[0].message.content;
  }

  async function handleSendDirect(textToSend) {
    const messageValue = typeof textToSend === 'string' ? textToSend : input;
    if (!messageValue || !messageValue.trim() || loading) return;

    stopVoiceInput();
    setInput('');

    const timeStr = getCurrentTimeString();
    const tempUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      timestamp: timeStr,
      message: messageValue.trim(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const targetLang = userProfile?.target_language || 'English';
      const proficiency = userProfile?.proficiency_level || 'Beginner';

      const prompt = `You are an expert ${targetLang} language tutor coaching a ${proficiency} level student. The user says: "${messageValue.trim()}".
Answer their question directly and helpfully. Check if their text has any mistakes based on ${targetLang}.

You MUST reply ONLY with a valid JSON object in this exact format:
{
  "hasCorrection": false,
  "originalText": "${messageValue.trim()}",
  "correctedText": "",
  "explanation": "",
  "reply": "Your detailed and helpful answer here",
  "isVoiceNote": false
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
          reply: responseText || 'Let us continue practicing!',
          isVoiceNote: false,
        };
      }

      const aiMsgObj = { 
        id: Date.now().toString(), 
        role: 'model', 
        timestamp: getCurrentTimeString(), 
        message: JSON.stringify(parsedData) 
      };

      setMessages((prev) => [...prev, aiMsgObj]);
      if (parsedData.reply) {
        speakText(parsedData.reply, aiMsgObj.id);
      }
    } catch (err) {
      console.log('AI Error:', err);
    } finally {
      setLoading(false);
    }
  }

  const renderMessageItem = ({ item }) => {
    const isUser = item.role === 'user';
    
    if (isUser) {
      return (
        <View style={styles.userBubbleRow}>
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{item.message}</Text>
            <View style={styles.timeAndAvatarRowUser}>
              <Text style={styles.timestampText}>{item.timestamp}</Text>
              <View style={styles.miniAvatarContainer}>
                <Text style={{ fontSize: 10 }}>👤</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    let parsedData = { reply: item.message, isVoiceNote: false };
    try {
      parsedData = JSON.parse(item.message);
    } catch (e) {}

    return (
      <View style={styles.aiBubbleRow}>
        <View style={styles.aiBubble}>
          <View style={styles.aiSenderHeader}>
            <Text style={styles.buddyLabel}>Buddy</Text>
            <TouchableOpacity onPress={() => speakText(parsedData.reply, item.id)}>
              <Text style={{ fontSize: 12 }}>🔊</Text>
            </TouchableOpacity>
          </View>

          {parsedData.isVoiceNote ? (
            <View style={styles.voiceNoteContainer}>
              <Text style={styles.voiceIcon}>▶️ 0:03</Text>
              <View style={styles.waveformMock} />
            </View>
          ) : null}

          <Text style={styles.aiText}>{parsedData.reply}</Text>
          
          <View style={styles.timeAndAvatarRowAi}>
            <View style={styles.miniAvatarContainerAi}>
              <Text style={{ fontSize: 10 }}>🤖</Text>
            </View>
            <Text style={styles.timestampText}>{item.timestamp}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top AI Character Header & Progress Bar */}
      <View style={styles.headerContainer}>
        <View style={styles.aiAvatarHeader}>
          <Text style={{ fontSize: 24 }}>🤖</Text>
          <View style={styles.aiHeaderBubble}>
            <Text style={styles.aiHeaderTitle}>Hello! I'm Buddy.</Text>
            <Text style={styles.aiHeaderSubtitle}>Ready to practice?</Text>
          </View>
        </View>
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>Lesson progress: 45%</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '45%' }]} />
          </View>
        </View>
      </View>

      {/* Message Stream */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop' }} 
        style={styles.chatArea}
      >
        <View style={styles.chatOverlay}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageListContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={renderMessageItem}
          />
        </View>
      </ImageBackground>

      {/* Bottom WhatsApp-Style Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.plusButton}>
          <Text style={{ color: '#888', fontSize: 20 }}>+</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor="#888"
          onSubmitEditing={() => handleSendDirect(input)}
          returnKeyType="send"
        />

        <TouchableOpacity 
          style={[styles.micButton, listening && { backgroundColor: '#FF4444' }]} 
          onPress={toggleVoiceInput}
        >
          <Text style={{ fontSize: 18 }}>{listening ? '⏹' : '🎤'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendPlaneButton} onPress={() => handleSendDirect(input)}>
          <Text style={{ fontSize: 16 }}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerContainer: {
    backgroundColor: '#1E293B',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  aiAvatarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiHeaderBubble: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 10,
  },
  aiHeaderTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  aiHeaderSubtitle: {
    color: '#E2E8F0',
    fontSize: 12,
  },
  progressSection: {
    marginTop: 4,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  chatArea: {
    flex: 1,
  },
  chatOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  messageListContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  aiBubbleRow: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'flex-start',
  },
  userBubbleRow: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#1D4ED8',
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    maxWidth: '75%',
  },
  userBubble: {
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 16,
    borderTopRightRadius: 4,
    maxWidth: '75%',
  },
  aiSenderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  buddyLabel: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: 'bold',
  },
  aiText: {
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 20,
  },
  timeAndAvatarRowUser: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeAndAvatarRowAi: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  timestampText: {
    color: '#CBD5E1',
    fontSize: 10,
    marginHorizontal: 4,
  },
  miniAvatarContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarContainerAi: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  voiceIcon: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  waveformMock: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  plusButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 14,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  micButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  sendPlaneButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
