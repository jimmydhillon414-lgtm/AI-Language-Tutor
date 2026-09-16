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
} from 'react-native';
import { supabase } from '../api/supabase';
import { getTutorResponse } from '../api/gemini';
import AppBackground from '../components/AppBackground';
import ImmersiveBackground from '../components/ImmersiveBackground';
import RoleplaySelector from '../components/RoleplaySelector';
import speechService from '../utils/speechService';
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
  
  const [speechLang, setSpeechLang] = useState('en-US');
  const [speakingId, setSpeakingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [availableVoices, setAvailableVoices] = useState([]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  const speechQueueRef = useRef([]);
  const activeUtteranceRef = useRef(null);

  const flatListRef = useRef();
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const userIdRef = useRef(null);

  useEffect(() => {
    fetchUserAndProfile();
    loadDeviceVoices();

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadDeviceVoices;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      stopAllSpeech();
    };
  }, [currentDayNum]);

  useEffect(() => {
    if (userProfile?.target_language) {
      setSpeechLang(getLanguageCode(userProfile.target_language));
    }
  }, [userProfile?.target_language]);

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
        reply: `Welcome to Day ${dayNum} simulation! I am your adaptive AI language coach. Tell me your name, what you want to achieve, or any topic you wish to practice. Let's begin!`,
        isVoiceNote: false,
      }),
    };
    setMessages([welcomeMsg]);
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
      recognition.continuous = false;
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
          stopVoiceInput();
          handleSendDirect(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
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
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    setListening(false);
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
        explanation: explanation || 'Grammar correction during roleplay session.'
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
        reply: responseText || 'Let us continue the roleplay simulation!',
      };
    }
  };

  async function handleSendDirect(textToSend) {
    const messageValue = typeof textToSend === 'string' ? textToSend : input;
    if (!messageValue || !messageValue.trim() || loading) return;

    const userSentiment = sentimentAnalyzer ? sentimentAnalyzer.analyze(messageValue) : null;

    stopVoiceInput();
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
      const targetLang = userProfile?.target_language || 'English';
      const currentInterest = userProfile?.field_of_interest || 'General Communication';
      const currentScenario = userProfile?.current_scenario || 'Professional Simulation';
      const currentObj = userProfile?.scenario_objective || 'Engage in dialogue';

      const prompt = `You are an expert, highly adaptive **Dynamic Roleplay Scenario Engine and Language Coach** for ${targetLang}.
Current Training Roadmap Day: Day ${currentDayNum}.
Previously Saved User Interest/Topic: "${currentInterest}".
Active Simulation Scenario: "${currentScenario}".
Current Scenario Objective: "${currentObj}".
User's Latest Spoken Input: "${messageValue.trim()}".
User Tone/Sentiment Analysis: "${userSentiment?.sentiment || 'neutral'}".

CRITICAL INSTRUCTIONS FOR INTENT & GOAL SWITCHING:
1. **Dynamic Intent Detection**: Analyze the user's latest input ("${messageValue.trim()}"). If the user specifies a brand new goal, introduction, or interest, you MUST dynamically switch the context.
2. **In-Character Immersion**: Adopt a professional coaching persona matching the user's *newly stated* goal or interest.
3. **Scenario Progression**: Provide an updated "roleplayContext", a fresh "scenarioObjective", and appropriate "scenarioStage".
4. **Grammar & Fluency Analysis**: Check grammar. If there is an error, set "hasCorrection": true, provide "originalText", "correctedText", and a professional "explanation".
5. **Pronunciation & Fluency Score (MANDATORY)**: Score from 50 to 100 as "pronunciationScore" with a short constructive "pronunciationTip".

You MUST reply ONLY with a valid JSON object in this exact format:
{
  "hasCorrection": true/false,
  "originalText": "${messageValue.trim()}",
  "correctedText": "Corrected sentence if error exists, otherwise empty string",
  "explanation": "Grammar feedback explanation",
  "pronunciationScore": 88,
  "pronunciationTip": "Tip for spoken rhythm",
  "roleplayContext": "Updated roleplay context matching user's new goal/interest",
  "scenarioObjective": "Next clear mission objective based on user's input",
  "scenarioStage": "Current phase (e.g. Core Drill)",
  "new_field_of_interest": "Extracted new field of interest or goal from user message",
  "learning_goal": "Updated learning goal if changed",
  "reply": "Your strict in-character conversational response acknowledging their goal and continuing the session"
}`;

      const responseText = await getAiResponse(prompt);
      const parsedData = parseAiResponse(responseText);

      if (!parsedData.pronunciationScore) parsedData.pronunciationScore = 85;
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

      const updatedFields = {
        field_of_interest: parsedData.new_field_of_interest || userProfile.field_of_interest || currentInterest,
        learning_goal: parsedData.learning_goal || userProfile.learning_goal || 'Simulation practice',
        current_scenario: parsedData.roleplayContext,
        scenario_objective: parsedData.scenarioObjective,
        updated_at: new Date().toISOString()
      };

      if (userIdRef.current) {
        const { error: updateErr } = await supabase
          .from('user_profiles')
          .update(updatedFields)
          .eq('id', userIdRef.current);

        if (!updateErr) {
          setUserProfile(prev => ({ ...prev, ...updatedFields }));
        }
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
            <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={[styles.voiceConfigBtn, { marginLeft: 8 }]} onPress={() => setShowVoiceModal(true)}>
            <Text style={styles.voiceConfigBtnText}>🎙️ Voice</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.langSelectorContainer}>
          {[
            { code: 'en-US', label: 'EN' },
            { code: 'hi-IN', label: 'HI' },
            { code: 'pa-IN', label: 'PA' }
          ].map((item) => (
            <TouchableOpacity
              key={item.code}
              style={[styles.langToggleBtn, speechLang === item.code && styles.activeLangToggle]}
              onPress={() => setSpeechLang(item.code)}
            >
              <Text style={[styles.langToggleText, speechLang === item.code && { color: '#1B2A26' }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.headerTitle}>Day {currentDayNum}</Text>
      </View>

{/* <View style={styles.activeObjectiveBanner}>
        <Text style={styles.bannerLabel}>🎯 Active Mission:</Text>
        <Text style={styles.bannerText} numberOfLines={1}>
          {userProfile?.scenario_objective || 'Immersive Roleplay Simulation in progress...'}
        </Text>
      </View>
*/}
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
            placeholder={`Reply in simulation (Day ${currentDayNum})...`}
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
