import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { supabase } from '../api/supabase';
import AppBackground from '../components/AppBackground';

export default function TutorChatScreen({ navigation, selectedDay = 1, onBack }) {
  const [userProfile, setUserProfile] = useState({ target_language: 'English', proficiency_level: 'Beginner' });
  
  const currentDayNum = selectedDay || 1;

  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'model',
      timestamp: '09:30 AM',
      message: JSON.stringify({
        hasCorrection: false,
        reply: `Hello! Welcome to Day 1. Today we will learn simple greetings and how to say who we are. Greetings: Hello, Hi, Good morning, Good evening. Introducing yourself: My name is... I am from... I am a student. Practice: Write three sentences about yourself using the pattern above.`,
        isVoiceNote: false,
      }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  
  // Advanced Speech tracking states for sentence-by-sentence resumption
  const [speakingId, setSpeakingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const sentenceIndexRef = useRef(0);
  const sentencesRef = useRef([]);
  
  const flatListRef = useRef();
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    fetchUserAndProfile();
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
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
      startMobileAudioFallback();
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
          startMobileAudioFallback();
        } else {
          setListening(false);
        }
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch (err) {
      startMobileAudioFallback();
    }
  };

  const startMobileAudioFallback = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone access is not supported on this mobile browser.');
        setListening(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      setListening(true);

      mediaRecorder.onstop = async () => {
        setListening(false);
        stream.getTracks().forEach(track => track.stop());
        setInput("Voice note recorded successfully. Tap send or type.");
      };

      mediaRecorder.start();

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 6000);

    } catch (err) {
      alert('Please allow microphone permissions in your mobile browser settings.');
      setListening(false);
    }
  };

  const stopVoiceInput = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    setListening(false);
  };

  // Sentence-by-sentence queue runner so that pausing/resuming continues from where it left off!
  const playNextSentence = (synth, langCode, messageId) => {
    if (sentenceIndexRef.current >= sentencesRef.current.length) {
      setSpeakingId(null);
      setIsPlaying(false);
      sentenceIndexRef.current = 0;
      return;
    }

    const currentSentence = sentencesRef.current[sentenceIndexRef.current];
    if (!currentSentence || !currentSentence.trim()) {
      sentenceIndexRef.current++;
      playNextSentence(synth, langCode, messageId);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentSentence);
    utterance.lang = langCode;

    utterance.onend = () => {
      sentenceIndexRef.current++;
      playNextSentence(synth, langCode, messageId);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
      setIsPlaying(false);
    };

    synth.speak(utterance);
  };

  const handlePlayPauseAudio = (text, messageId) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      const synth = window.speechSynthesis;
      const langCode = getLanguageCode(userProfile?.target_language);

      // Agar wahi message pehle se play ho raha hai, toh ise pause/stop karo
      if (speakingId === messageId && isPlaying) {
        synth.cancel();
        setIsPlaying(false);
        // Note: sentenceIndexRef.current wahin par ruk jayega jahan chhoda tha!
        return;
      }

      // Agar naya message hai ya paused state se wapas play karna hai
      synth.cancel();
      
      if (speakingId !== messageId) {
        // Naye message ke liye sentences ko split karo aur index 0 se shuru karo
        sentencesRef.current = text.split(/(?<=[.!?])\s+|\n+/).filter(Boolean);
        sentenceIndexRef.current = 0;
        setSpeakingId(messageId);
      }

      setIsPlaying(true);
      playNextSentence(synth, langCode, messageId);
    }
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
      
      let difficultyLevel = "Beginner (A1)";
      if (currentDayNum > 10 && currentDayNum <= 25) difficultyLevel = "Elementary (A2)";
      else if (currentDayNum > 25 && currentDayNum <= 45) difficultyLevel = "Intermediate (B1)";
      else if (currentDayNum > 45) difficultyLevel = "Advanced (B2/C1)";

      const prompt = `You are an expert, proactive ${targetLang} language tutor coaching a student on Day ${currentDayNum} of their curriculum. 
Current Proficiency Standard: ${difficultyLevel}.

The user says: "${messageValue.trim()}".

Act as a proactive tutor:
1. Respond directly and helpfully to their input keeping the Day ${currentDayNum} topic and ${difficultyLevel} standard in mind.
2. Adjust your vocabulary, sentence length, and tone strictly according to ${difficultyLevel}.
3. Provide real-time corrections if there are grammar mistakes.

You MUST reply ONLY with a valid JSON object in this exact format:
{
  "hasCorrection": false,
  "originalText": "${messageValue.trim()}",
  "correctedText": "",
  "explanation": "",
  "reply": "Your detailed, level-appropriate response here",
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
        handlePlayPauseAudio(parsedData.reply, aiMsgObj.id);
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

    const isThisSpeaking = speakingId === item.id && isPlaying;

    return (
      <View style={styles.aiBubbleRow}>
        <View style={styles.aiBubble}>
          <View style={styles.aiSenderHeader}>
            <Text style={styles.buddyLabel}>⚡ BUDDY AI (DAY {currentDayNum})</Text>
            <TouchableOpacity onPress={() => handlePlayPauseAudio(parsedData.reply, item.id)}>
              <Text style={{ fontSize: 12 }}>
                {isThisSpeaking ? '⏹️' : '🔊'}
              </Text>
            </TouchableOpacity>
          </View>

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
    <AppBackground>
      <View style={styles.headerBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
            <Text style={styles.backButtonText}>← Roadmap</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Day {currentDayNum} Session</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatArea}>
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
        </View>

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.plusButton}>
            <Text style={{ color: '#FFCB9A', fontSize: 20, fontWeight: 'bold' }}>+</Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder={`Reply to Buddy for Day ${currentDayNum}...`}
            placeholderTextColor="#A3B8B0"
            onSubmitEditing={() => handleSendDirect(input)}
            returnKeyType="send"
          />

          <TouchableOpacity 
            style={[styles.micButton, listening && { backgroundColor: '#FF4444' }]} 
            onPress={toggleVoiceInput}
          >
            <Text style={{ fontSize: 18 }}>{listening ? '⏹' : '🎙️'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendPlaneButton} onPress={() => handleSendDirect(input)}>
            <Text style={{ fontSize: 16, color: '#1B2A26', fontWeight: 'bold' }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(11, 25, 23, 0.95)',
    borderBottomWidth: 1.5,
    borderBottomColor: '#116466',
  },
  backButton: {
    backgroundColor: '#116466',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCB9A',
  },
  backButtonText: {
    color: '#FFCB9A',
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? { 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: 'calc(100dvh - 110px)',
      overflow: 'hidden' 
    } : {}),
  },
  chatArea: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  chatOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messageListContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  aiBubbleRow: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  userBubbleRow: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#116466',
    padding: 15,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    maxWidth: '78%',
    borderWidth: 1.5,
    borderColor: '#FFCB9A',
    shadowColor: '#FFCB9A',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  userBubble: {
    backgroundColor: '#1C312B',
    padding: 15,
    borderRadius: 16,
    borderTopRightRadius: 4,
    maxWidth: '78%',
    borderWidth: 1.5,
    borderColor: '#116466',
    shadowColor: '#116466',
    shadowOpacity: 0.3,
    shadowRadius: 6,
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
    letterSpacing: 1,
  },
  aiText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
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
    color: '#94A3B8',
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
    borderColor: '#FFCB9A',
  },
  miniAvatarContainerAi: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#182C25',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFCB9A',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 44, 37, 0.98)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: '#116466',
    ...(Platform.OS === 'web' ? { 
      position: 'sticky', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      zIndex: 999,
      width: '100%',
      pointerEvents: 'auto' 
    } : {}),
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#116466',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#FFCB9A',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  textInput: {
    flex: 1,
    backgroundColor: '#121E1A',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 13,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#116466',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  micButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#116466',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: paragraphMargin = 4,
    borderWidth: 1,
    borderColor: '#FFCB9A',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  sendPlaneButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFCB9A',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
});
