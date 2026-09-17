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
  Modal,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { supabase } from '../api/supabase';
import { getTutorResponse } from '../api/gemini';
import AppBackground from '../components/AppBackground';
import RoleplaySelector from '../components/RoleplaySelector';
import sentimentAnalyzer from '../utils/sentimentAnalyzer';

export default function TutorChatScreen({ navigation, selectedDay = 1, onBack }) {
  const [userProfile, setUserProfile] = useState({ 
    target_language: 'English', 
    proficiency_level: 'Beginner',
    learning_goal: null,
    field_of_interest: null,
    preferred_voice: null,
    current_scenario: null,
    scenario_objective: 'Initialize immersive roleplay simulation',
    full_name: 'User',
    avatar_type: '🎓',
  });
  
  const currentDayNum = selectedDay || 1;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  const [speechLang, setSpeechLang] = useState('en-US');
  const [speakingId, setSpeakingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [availableVoices, setAvailableVoices] = useState([]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  const speechQueueRef = useRef([]);
  const activeUtteranceRef = useRef(null);

  const flatListRef = useRef();
  const recognitionRef = useRef(null);
  const userIdRef = useRef(null);

  // Wave Animation values for live speech visualization
  const waveAnim1 = useRef(new Animated.Value(10)).current;
  const waveAnim2 = useRef(new Animated.Value(20)).current;
  const waveAnim3 = useRef(new Animated.Value(15)).current;
  const waveAnim4 = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    fetchUserAndProfile();
    loadDeviceVoices();

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadDeviceVoices;
    }

    return () => {
      stopLiveSession();
    };
  }, [currentDayNum]);

  useEffect(() => {
    if (listening) {
      startWaveAnimation();
    } else {
      stopWaveAnimation();
    }
  }, [listening]);

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(waveAnim1, { toValue: 35, duration: 300, useNativeDriver: false }),
          Animated.timing(waveAnim1, { toValue: 10, duration: 300, useNativeDriver: false }),
        ]),
        Animated.sequence([
          Animated.timing(waveAnim2, { toValue: 40, duration: 250, useNativeDriver: false }),
          Animated.timing(waveAnim2, { toValue: 15, duration: 250, useNativeDriver: false }),
        ]),
        Animated.sequence([
          Animated.timing(waveAnim3, { toValue: 45, duration: 350, useNativeDriver: false }),
          Animated.timing(waveAnim3, { toValue: 12, duration: 350, useNativeDriver: false }),
        ]),
        Animated.sequence([
          Animated.timing(waveAnim4, { toValue: 30, duration: 280, useNativeDriver: false }),
          Animated.timing(waveAnim4, { toValue: 8, duration: 280, useNativeDriver: false }),
        ]),
      ])
    ).start();
  };

  const stopWaveAnimation = () => {
    waveAnim1.setValue(10);
    waveAnim2.setValue(15);
    waveAnim3.setValue(12);
    waveAnim4.setValue(8);
  };

  const loadDeviceVoices = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    }
  };

  const stopAllSpeech = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    speechQueueRef.current = [];
    activeUtteranceRef.current = null;
    setIsPlaying(false);
    setSpeakingId(null);
  };

  async function fetchUserAndProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userIdRef.current = user.id;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
        initializeDayCurriculumChat(profile, currentDayNum);
      } else {
        initializeDayCurriculumChat({ target_language: 'English' }, currentDayNum);
      }
    } catch (err) {
      console.log('Error fetching user profile:', err);
      initializeDayCurriculumChat({ target_language: 'English' }, currentDayNum);
    }
  }

  const initializeDayCurriculumChat = (profile, dayNum) => {
    const scenario = profile.current_scenario || 'Interactive Roleplay Simulation';
    const objective = profile.scenario_objective || 'Introduce yourself, state your current goal, and let the session adapt to you.';

    const welcomeMsg = {
      id: '1',
      role: 'model',
      timestamp: getCurrentTimeString(),
      message: JSON.stringify({
        hasCorrection: false,
        pronunciationScore: 90,
        pronunciationTip: "Keep your pacing steady and clear.",
        roleplayContext: scenario,
        scenarioObjective: objective,
        scenarioStage: 'Introduction',
        reply: `Welcome to Day ${dayNum} simulation! I am your adaptive AI language coach. Let's start practicing right away—tell me about your day or what topic you would like to explore today!`,
        isVoiceNote: false,
      }),
    };
    setMessages([welcomeMsg]);
    queueOrPlayAudio(JSON.parse(welcomeMsg.message).reply, welcomeMsg.id);
  };

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

  const updatePreferredVoice = async (voiceName) => {
    setUserProfile(prev => ({ ...prev, preferred_voice: voiceName }));
    setShowVoiceModal(false);

    if (userIdRef.current) {
      try {
        await supabase
          .from('user_profiles')
          .update({ preferred_voice: voiceName, updated_at: new Date().toISOString() })
          .eq('id', userIdRef.current);
      } catch (err) {
        console.log('Error saving preferred voice:', err);
      }
    }
  };

  // Continuous Live Call Toggle & Auto-Loop Recognition
  const toggleLiveSession = () => {
    if (isSessionActive) {
      stopLiveSession();
    } else {
      startLiveSession();
    }
  };

  const startLiveSession = () => {
    setIsSessionActive(true);
    startContinuousListening();
  };

  const stopLiveSession = () => {
    setIsSessionActive(false);
    setListening(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    stopAllSpeech();
  };

  const startContinuousListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Safari.');
      setIsSessionActive(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognitionRef.current = recognition;
      setListening(true);

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece;
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText.trim()) {
          setInput(currentText.trim());
        }

        if (finalTranscript.trim()) {
          const spokenText = finalTranscript.trim();
          handleSendDirect(spokenText);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (isSessionActive && event.error !== 'aborted') {
          setTimeout(() => {
            try { recognition.start(); } catch (e) {}
          }, 1000);
        }
      };

      recognition.onend = () => {
        if (isSessionActive) {
          try {
            recognition.start();
          } catch (e) {
            setListening(false);
          }
        } else {
          setListening(false);
        }
      };

      recognition.start();
    } catch (err) {
      console.log('Recognition start error:', err);
      setListening(false);
      setIsSessionActive(false);
    }
  };

  const handlePlayPauseAudio = (text, messageId) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      const synth = window.speechSynthesis;

      if (speakingId === messageId) {
        if (synth.speaking && !synth.paused) {
          synth.pause();
          setIsPlaying(false);
          return;
        }
        if (synth.paused) {
          synth.resume();
          setIsPlaying(true);
          return;
        }
      }

      synth.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(userProfile?.target_language);
      utterance.rate = 0.95;

      if (userProfile?.preferred_voice) {
        const selectedVoiceObj = availableVoices.find(v => v.name === userProfile.preferred_voice);
        if (selectedVoiceObj) {
          utterance.voice = selectedVoiceObj;
        }
      }
      
      utterance.onstart = () => {
        setSpeakingId(messageId);
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setSpeakingId(null);
        setIsPlaying(false);
        activeUtteranceRef.current = null;
        processNextInQueue();
      };

      utterance.onerror = () => {
        setSpeakingId(null);
        setIsPlaying(false);
        activeUtteranceRef.current = null;
      };

      activeUtteranceRef.current = utterance;
      synth.speak(utterance);
    }
  };

  const processNextInQueue = () => {
    if (speechQueueRef.current.length > 0) {
      const nextItem = speechQueueRef.current.shift();
      handlePlayPauseAudio(nextItem.text, nextItem.id);
    }
  };

  const queueOrPlayAudio = (text, messageId) => {
    if (isPlaying && speakingId !== messageId) {
      speechQueueRef.current.push({ text, id: messageId });
    } else {
      handlePlayPauseAudio(text, messageId);
    }
  };

  const getCurrentTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  async function logGrammarCorrection(original, corrected, explanation) {
    try {
      if (!userIdRef.current) return;
      await supabase.from('grammar_history').insert({
        user_id: userIdRef.current,
        original_text: original,
        corrected_text: corrected,
        explanation: explanation || 'Grammar correction during live session.'
      });
    } catch (err) {
      console.log('Error saving grammar history:', err);
    }
  }

  async function getAiResponse(promptText) {
    const targetLang = userProfile?.target_language || 'English';
    const proficiency = userProfile?.proficiency_level || 'Beginner';
    return await getTutorResponse(promptText, targetLang, proficiency);
  }

  const parseAiResponse = (responseText) => {
    try {
      const cleanedString = responseText.replace(/```json\s*([\s\S]*?)\s*```/g, '$1').trim();
      return JSON.parse(cleanedString);
    } catch (e) {
      return {
        hasCorrection: false,
        pronunciationScore: 85,
        pronunciationTip: "Good articulation. Maintain conversational flow.",
        roleplayContext: "Interactive Simulation",
        scenarioObjective: "Continue practicing key vocabulary.",
        scenarioStage: "Active Practice",
        reply: responseText || 'Let us continue our conversation in English!',
      };
    }
  };

async function handleSendDirect(textToSend) {
    const messageValue = typeof textToSend === 'string' ? textToSend : input;
    if (!messageValue || !messageValue.trim() || loading) return;

    setInput('');
    stopAllSpeech();

    const timeStr = getCurrentTimeString();
    const tempUserMsg = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      role: 'user',
      timestamp: timeStr,
      message: messageValue.trim(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const currentScenario = userProfile?.current_scenario || 'Professional Simulation';
      const currentObj = userProfile?.scenario_objective || 'Engage in dialogue';

      const prompt = `You are a live, professional, and friendly English conversation partner and language coach.
Current Training Roadmap Day: Day ${currentDayNum}.
Active Simulation Scenario: "${currentScenario}".
Current Scenario Objective: "${currentObj}".
User's Latest Spoken Input: "${messageValue.trim()}".

CRITICAL RULES:
1. ALWAYS reply entirely in natural English. Never switch to Hindi or any other language.
2. Maintain a live, flowing conversational tone. Do NOT repeat or echo the user's message like a robot. Keep it fresh, dynamic, and contextually advancing.
3. Check grammar. If there is an error, set "hasCorrection": true, provide "originalText", "correctedText", and a professional "explanation".
4. Score pronunciation from 50 to 100 as "pronunciationScore" with a constructive "pronunciationTip".

You MUST reply ONLY with a valid JSON object in this exact format:
{
  "hasCorrection": true/false,
  "originalText": "${messageValue.trim()}",
  "correctedText": "Corrected sentence if error exists, otherwise empty string",
  "explanation": "Grammar feedback explanation",
  "pronunciationScore": 88,
  "pronunciationTip": "Tip for spoken rhythm",
  "roleplayContext": "${currentScenario}",
  "scenarioObjective": "${currentObj}",
  "scenarioStage": "Active Practice",
  "reply": "Your strict in-character conversational response in English continuing the dialogue dynamically"
}`;

      let responseText = '';
      try {
        responseText = await getTutorResponse(prompt, userProfile?.target_language || 'English', userProfile?.proficiency_level || 'Beginner');
      } catch (apiErr) {
        console.log('Edge function error, using direct dynamic fallback:', apiErr);
      }

      let parsedData = null;
      try {
        const cleanedString = responseText.replace(/```json\s*([\s\S]*?)\s*```/g, '$1').trim();
        parsedData = JSON.parse(cleanedString);
      } catch (e) {
        // Fallback dynamic response if JSON parsing fails so it never repeats hardcoded text
        parsedData = {
          hasCorrection: false,
          originalText: messageValue.trim(),
          correctedText: '',
          explanation: '',
          pronunciationScore: 90,
          pronunciationTip: "Clear pronunciation. Let's keep the momentum going.",
          roleplayContext: currentScenario,
          scenarioObjective: currentObj,
          scenarioStage: 'Active Practice',
          reply: `That's interesting! Regarding "${messageValue.trim()}", can you tell me more details about how you would handle this situation professionally?`
        };
      }

      if (!parsedData.pronunciationScore) parsedData.pronunciationScore = 88;
      if (!parsedData.pronunciationTip) parsedData.pronunciationTip = "Good rhythm and articulation.";
      if (!parsedData.roleplayContext) parsedData.roleplayContext = currentScenario;
      if (!parsedData.scenarioObjective) parsedData.scenarioObjective = currentObj;
      if (!parsedData.scenarioStage) parsedData.scenarioStage = 'Active Practice';

      if (parsedData.hasCorrection && parsedData.correctedText) {
        await logGrammarCorrection(
          parsedData.originalText || messageValue.trim(),
          parsedData.correctedText,
          parsedData.explanation
        );
      }

      const aiMsgObj = { 
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, 
        role: 'model', 
        timestamp: getCurrentTimeString(), 
        message: JSON.stringify(parsedData) 
      };

      setMessages((prev) => [...prev, aiMsgObj]);
      if (parsedData.reply) {
        queueOrPlayAudio(parsedData.reply, aiMsgObj.id);
      }
    } catch (err) {
      console.log('AI Simulation Error:', err);
    } finally {
      setLoading(false);
    }
  }

  const renderMessageItem = ({ item }) => {
    const isUser = item.role === 'user';
    
    if (isUser) {
      const displayName = userProfile?.full_name?.trim() ? userProfile.full_name : 'User';
      const displayAvatar = userProfile?.avatar_type || '👤';

      return (
        <View style={styles.userBubbleRow}>
          <View style={styles.userBubble}>
            <View style={styles.chatProfileHeader}>
              <Text style={styles.chatSenderName} numberOfLines={1}>{displayName}</Text>
              <View style={styles.chatMiniAvatar}>
                <Text style={styles.miniEmoji}>{displayAvatar}</Text>
              </View>
            </View>

            <Text style={styles.userText}>{item.message}</Text>
            
            <View style={styles.timeAndAvatarRowUser}>
              <Text style={styles.timestampText}>{item.timestamp}</Text>
            </View>
          </View>
        </View>
      );
    }

    let parsedData = { 
      reply: item.message, 
      hasCorrection: false, 
      explanation: '', 
      correctedText: '', 
      pronunciationScore: 85, 
      pronunciationTip: 'Keep pacing steady.',
      roleplayContext: userProfile.current_scenario || 'Simulation',
      scenarioObjective: userProfile.scenario_objective || 'Complete the task',
      scenarioStage: 'Active Practice'
    };
    
    try {
      parsedData = JSON.parse(item.message);
    } catch (e) {}

    const isThisSpeaking = speakingId === item.id && isPlaying;

    return (
      <View style={styles.aiBubbleRow}>
        <View style={styles.aiBubble}>
          <View style={styles.badgeRow}>
            {parsedData.roleplayContext ? (
              <View style={styles.roleplayBadge}>
                <Text style={styles.roleplayBadgeText}>🎭 {parsedData.roleplayContext}</Text>
              </View>
            ) : null}
            {parsedData.scenarioStage ? (
              <View style={styles.stageBadge}>
                <Text style={styles.stageBadgeText}>📌 {parsedData.scenarioStage}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.aiSenderHeader}>
            <Text style={styles.buddyLabel}>⚡ DAY {currentDayNum} SIMULATION AI</Text>
            <TouchableOpacity onPress={() => queueOrPlayAudio(parsedData.reply, item.id)}>
              <Text style={{ fontSize: 12 }}>{isThisSpeaking ? '⏸️' : '🔊'}</Text>
            </TouchableOpacity>
          </View>

          {parsedData.scenarioObjective ? (
            <View style={styles.objectiveBox}>
              <Text style={styles.objectiveTitle}>🎯 Current Mission Objective:</Text>
              <Text style={styles.objectiveText}>{parsedData.scenarioObjective}</Text>
            </View>
          ) : null}

          {parsedData.hasCorrection && parsedData.correctedText ? (
            <View style={styles.correctionBox}>
              <Text style={styles.correctionTitle}>💡 Grammar Correction Tip:</Text>
              <Text style={styles.correctionText}>❌ <Text style={{textDecorationLine: 'line-through'}}>{parsedData.originalText}</Text></Text>
              <Text style={styles.correctionText}>✅ <Text style={{fontWeight: 'bold', color: '#FFCB9A'}}>{parsedData.correctedText}</Text></Text>
              {parsedData.explanation ? (
                <Text style={styles.explanationText}>{parsedData.explanation}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.pronunciationBox}>
            <Text style={styles.pronunciationText}>
              ⚡ Pronunciation: <Text style={{color: '#FFCB9A', fontWeight: 'bold'}}>{parsedData.pronunciationScore || 85}/100</Text>
            </Text>
            {parsedData.pronunciationTip ? (
              <Text style={styles.explanationText}>Tip: {parsedData.pronunciationTip}</Text>
            ) : null}
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
        <View style={styles.headerLeftGroup}>
          {onBack && (
            <TouchableOpacity onPress={() => { stopLiveSession(); onBack(); }} style={styles.backButton} activeOpacity={0.8}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={[styles.voiceConfigBtn, { marginLeft: 8 }]} onPress={() => setShowVoiceModal(true)}>
            <Text style={styles.voiceConfigBtnText}>🎙️ Voice</Text>
          </TouchableOpacity>
        </View>

        {/* Live Call Session Start / End Button */}
        <TouchableOpacity 
          style={[styles.voiceConfigBtn, { backgroundColor: isSessionActive ? '#FF4444' : '#116466' }]} 
          onPress={toggleLiveSession}
        >
          <Text style={[styles.voiceConfigBtnText, { color: '#FFFFFF' }]}>
            {isSessionActive ? '🛑 End Live Session' : '🟢 Start Live Call'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Day {currentDayNum}</Text>
      </View>

      {/* Live Wave Visualizer Banner when session is active */}
      {isSessionActive && (
        <View style={{ backgroundColor: '#142C28', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#116466' }}>
          <Text style={{ color: '#FFCB9A', fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>
            {listening ? '🎙️ Listening... Speak naturally (Continuous Mode)' : '🤖 AI is responding...'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 45 }}>
            <Animated.View style={{ width: 4, height: waveAnim1, backgroundColor: '#6EE7B7', borderRadius: 2 }} />
            <Animated.View style={{ width: 4, height: waveAnim2, backgroundColor: '#FFCB9A', borderRadius: 2 }} />
            <Animated.View style={{ width: 4, height: waveAnim3, backgroundColor: '#6EE7B7', borderRadius: 2 }} />
            <Animated.View style={{ width: 4, height: waveAnim4, backgroundColor: '#FFCB9A', borderRadius: 2 }} />
            <Animated.View style={{ width: 4, height: waveAnim2, backgroundColor: '#6EE7B7', borderRadius: 2 }} />
          </View>
        </View>
      )}

      <RoleplaySelector 
        onSelectScenario={(selectedScenario) => {
          setUserProfile(prev => ({ ...prev, current_scenario: selectedScenario }));
        }} 
      />

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
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder={`Type or use Live Call mode (Day ${currentDayNum})...`}
            placeholderTextColor="#A3B8B0"
            onSubmitEditing={() => handleSendDirect(input)}
            returnKeyType="send"
          />

          <TouchableOpacity 
            style={[styles.micButton, isSessionActive && { backgroundColor: '#FF4444' }]} 
            onPress={toggleLiveSession}
          >
            <Text style={{ fontSize: 18 }}>{isSessionActive ? '⏹' : '🎙️'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendPlaneButton} onPress={() => handleSendDirect(input)}>
            <Text style={{ fontSize: 16, color: '#1B2A26', fontWeight: 'bold' }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showVoiceModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Choose Tutor Voice & Accent</Text>
            <Text style={styles.modalSubtitle}>Select an available accent profile for your device:</Text>

            <FlatList
              data={availableVoices}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              style={{ maxHeight: 250, marginVertical: 10 }}
              renderItem={({ item }) => {
                const isSelected = userProfile?.preferred_voice === item.name;
                return (
                  <TouchableOpacity 
                    style={[styles.voiceOptionItem, isSelected && styles.voiceOptionSelected]}
                    onPress={() => updatePreferredVoice(item.name)}
                  >
                    <Text style={[styles.voiceOptionText, isSelected && { color: '#FFCB9A', fontWeight: 'bold' }]}>
                      {item.name} ({item.lang})
                    </Text>
                    {isSelected && <Text style={{ color: '#FFCB9A' }}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => setShowVoiceModal(false)}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(11, 25, 23, 0.95)',
    borderBottomWidth: 1.5,
    borderBottomColor: '#116466',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#116466',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCB9A',
  },
  backButtonText: {
    color: '#FFCB9A',
    fontSize: 11,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  voiceConfigBtn: {
    backgroundColor: '#1C312B',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCB9A',
  },
  voiceConfigBtnText: {
    color: '#FFCB9A',
    fontSize: 10,
    fontWeight: '700',
  },
  langSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#121E1A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#116466',
    padding: 2,
    gap: 2,
  },
  langToggleBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeLangToggle: {
    backgroundColor: '#FFCB9A',
  },
  langToggleText: {
    color: '#FFCB9A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeObjectiveBanner: {
    backgroundColor: '#142C28',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#116466',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerLabel: {
    color: '#FFCB9A',
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 6,
  },
  bannerText: {
    color: '#E2E8F0',
    fontSize: 12,
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? { 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: 'calc(100dvh - 150px)',
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
    maxWidth: '82%',
    borderWidth: 1.5,
    borderColor: '#FFCB9A',
  },
  userBubble: {
    backgroundColor: '#1C312B',
    padding: 15,
    borderRadius: 16,
    borderTopRightRadius: 4,
    maxWidth: '82%',
    borderWidth: 1.5,
    borderColor: '#116466',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  roleplayBadge: {
    backgroundColor: 'rgba(255, 203, 154, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFCB9A',
  },
  roleplayBadgeText: {
    color: '#FFCB9A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  stageBadge: {
    backgroundColor: 'rgba(110, 231, 183, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  stageBadgeText: {
    color: '#6EE7B7',
    fontSize: 10,
    fontWeight: 'bold',
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
    marginTop: 4,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    marginTop: 4,
  },
  objectiveBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFCB9A',
  },
  objectiveTitle: {
    color: '#FFCB9A',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  objectiveText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  correctionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFCB9A',
  },
  pronunciationBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#6EE7B7',
  },
  correctionTitle: {
    color: '#FFCB9A',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  correctionText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 2,
  },
  pronunciationText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 2,
  },
  explanationText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
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
  miniEmoji: {
    fontSize: 11,
  },
  chatProfileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatSenderName: {
    color: '#FFCB9A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  chatMiniAvatar: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(11, 25, 23, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#116466',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#121E1A',
    borderWidth: 1,
    borderColor: '#116466',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
  },
  micButton: {
    marginLeft: 8,
    backgroundColor: '#116466',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCB9A',
  },
  sendPlaneButton: {
    marginLeft: 8,
    backgroundColor: '#FFCB9A',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#112220',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#116466',
  },
  modalTitle: {
    color: '#FFCB9A',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#A3B8B0',
    fontSize: 12,
    marginBottom: 12,
  },
  voiceOptionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#19332D',
    marginBottom: 6,
  },
  voiceOptionSelected: {
    backgroundColor: '#1F4038',
    borderColor: '#FFCB9A',
    borderWidth: 1,
  },
  voiceOptionText: {
    color: '#E2E8F0',
    fontSize: 13,
  },
  modalCloseButton: {
    backgroundColor: '#FFCB9A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseText: {
    color: '#1B2A26',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
