import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  ImageBackground,
  TextInput,
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
        reply: "Hello! I'm Buddy. Welcome to your elite AI language journey.",
        isVoiceNote: false,
      }),
    },
    {
      id: '2',
      role: 'user',
      timestamp: '09:30 AM',
      message: 'I want to master English fluently.',
    },
    {
      id: '3',
      role: 'model',
      timestamp: '09:31 AM',
      message: JSON.stringify({
        hasCorrection: false,
        reply: "Splendid! Let's begin with your personalized session today.",
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
              <View style={styles.miniAvatarContainerUser}>
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
            <Text style={styles.buddyLabel}>BUDDY AI</Text>
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
      {/* Top Elite AI Header & Progress Bar */}
      <View style={styles.headerContainer}>
        <View style={styles.aiAvatarHeader}>
          <View style={styles.avatarGlowWrapper}>
            <Text style={{ fontSize: 22 }}>🌐</Text>
          </View>
          <View style={styles.aiHeaderBubble}>
            <Text style={styles.aiHeaderTitle}>SOLARIN AI BUDDY</Text>
            <Text style={styles.aiHeaderSubtitle}>Active Session • 60-Day Mastery Plan</Text>
          </View>
        </View>
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressText}>Lesson Progress</Text>
            <Text style={styles.progressPercentage}>45%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '45%' }]} />
          </View>
        </View>
      </View>

      {/* Futuristic Background Area */}
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

      {/* Elite Bottom Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.plusButton}>
          <Text style={{ color: '#D1E8E2', fontSize: 20, fontWeight: 'bold' }}>+</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Type or use voice note..."
          placeholderTextColor="#8A9E96"
          onSubmitEditing={() => handleSendDirect(input)}
          returnKeyType="send"
        />

        <TouchableOpacity 
          style={[styles.micButton, listening && { backgroundColor: '#FFCB9A' }]} 
          onPress={toggleVoiceInput}
        >
          <Text style={{ fontSize: 18 }}>{listening ? '⏹' : '🎙️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendPlaneButton} onPress={() => handleSendDirect(input)}>
          <Text style={{ fontSize: 16, color: '#2C3531', fontWeight: 'bold' }}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3531',
  },
  headerContainer: {
    backgroundColor: '#1b2320',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#116466',
    shadowColor: '#116466',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  aiAvatarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarGlowWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#116466',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D9B08C',
  },
  aiHeaderBubble: {
    backgroundColor: '#116466',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#D9B08C',
  },
  aiHeaderTitle: {
    color: '#FFCB9A',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  aiHeaderSubtitle: {
    color: '#D1E8E2',
    fontSize: 11,
  },
  progressSection: {
    marginTop: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    color: '#D1E8E2',
    fontSize: 11,
    fontWeight: '500',
  },
  progressPercentage: {
    color: '#FFCB9A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#2C3531',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#116466',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D9B08C',
  },
  chatArea: {
    flex: 1,
  },
  chatOverlay: {
    flex: 1,
    backgroundColor: 'rgba(44, 53, 49, 0.92)',
  },
  messageListContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  aiBubbleRow: {
    flexDirection: 'row',
    marginBottom: 14,
    justifyContent: 'flex-start',
  },
  userBubbleRow: {
    flexDirection: 'row',
    marginBottom: 14,
    justifyContent: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#116466',
    padding: 14,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    maxWidth: '78%',
    borderWidth: 1,
    borderColor: '#D9B08C',
    shadowColor: '#D9B08C',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  userBubble: {
    backgroundColor: '#2C3531',
    padding: 14,
    borderRadius: 16,
    borderTopRightRadius: 4,
    maxWidth: '78%',
    borderWidth: 1.5,
    borderColor: '#FFCB9A',
  },
  aiSenderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  buddyLabel: {
    color: '#FFCB9A',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  aiText: {
    color: '#D1E8E2',
    fontSize: 14,
    lineHeight: 21,
  },
  userText: {
    color: '#D1E8E2',
    fontSize: 14,
    lineHeight: 21,
  },
  timeAndAvatarRowUser: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  timeAndAvatarRowAi: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 6,
  },
  timestampText: {
    color: '#8A9E96',
    fontSize: 10,
    marginHorizontal: 4,
  },
  miniAvatarContainerUser: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#116466',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D9B08C',
  },
  miniAvatarContainerAi: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2C3531',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFCB9A',
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 6,
    borderRadius: 8,
  },
  voiceIcon: {
    color: '#FFCB9A',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  waveformMock: {
    flex: 1,
    height: 4,
    backgroundColor: '#D9B08C',
    borderRadius: 2,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b2320',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1.5,
    borderTopColor: '#116466',
  },
    plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#116466',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D9B08C',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2C3531',
    color: '#D1E8E2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    fontSize: 14,
    marginHorizontal: 6,
    borderWidth: 1.5,
    borderColor: '#116466',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#116466',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#D9B08C',
  },
  sendPlaneButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D9B08C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
