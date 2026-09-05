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
  ScrollView,
} from 'react-native';
import * as Speech from 'expo-speech';
import { supabase } from '../api/supabase';
import { GoogleGenAI } from '@google/genai';

export default function TutorChatScreen({ navigation }) {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'chat'
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
      alert('Speech Recognition is not supported or is disabled in your browser.');
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
      recognition.continuous = true;
      recognition.interimResults = true;

      const langMap = {
        English: 'en-IN',
        Punjabi: 'pa-IN',
        Hindi: 'hi-IN',
      };

      recognition.lang = langMap[userProfile?.target_language] || 'hi-IN';

      recognition.onstart = () => setListening(true);
      recognition.onresult = (event) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        setInput(fullTranscript);
      };
      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') setListening(false);
      };
      recognition.onend = () => setListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
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
    if (!input.trim() || !userId) return;

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

      const prompt = `You are an expert English and multilingual AI language tutor. The user is asking: "${userText}".
Answer their question directly and helpfully as a tutor. Also check if their sentence has any grammatical mistakes.

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

  // --- RENDER HOME DASHBOARD VIEW (Matching precise dark layout requested) ---
  if (currentView === 'home') {
    return (
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop' }} 
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Top Navbar */}
          <View style={styles.topHeaderBar}>
            <Text style={styles.topHeaderTitle}>SIRIN LABS</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity 
                style={styles.navAuthBtn} 
                onPress={() => alert('Login Screen')}
              >
                <Text style={styles.navAuthText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.navSignUpBtn} 
                onPress={() => alert('Sign Up Screen')}
              >
                <Text style={styles.navSignUpText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.homeScrollContent}>
            {/* Welcome Banner */}
            <Text style={styles.welcomeHeading}>Welcome Back, Creatorstack9@gmail.com!</Text>
            
            <TouchableOpacity 
              style={styles.resumeButton}
              onPress={() => setCurrentView('chat')}
            >
              <Text style={styles.resumeButtonText}>Resume My Last Lesson</Text>
            </TouchableOpacity>

            {/* Progress & Feature Cards Row */}
            <View style={styles.homeCardsGrid}>
              <View style={styles.dashboardCard}>
                <Text style={styles.cardLabel}>Lessons Completed</Text>
                <Text style={styles.cardValueLarge}>35/50</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '70%' }]} />
                </View>
              </View>

              <View style={styles.dashboardCard}>
                <Text style={styles.cardLabel}>Current Streak</Text>
                <Text style={styles.cardValueLarge}>🔥 7 Days</Text>
              </View>

              <View style={styles.dashboardCard}>
                <Text style={styles.cardLabel}>Accuracy Score</Text>
                <Text style={styles.cardValueLarge}>92%</Text>
              </View>

              <TouchableOpacity style={styles.featureMiniCard} onPress={() => setCurrentView('chat')}>
                <Text style={styles.featureCardTitle}>✏️ 24/7 AI Grammar Tutor</Text>
                <Text style={styles.featureCardDesc}>Instant feedback on your writing.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.featureMiniCard} onPress={() => setCurrentView('chat')}>
                <Text style={styles.featureCardTitle}>📖 Vocabulary Builder</Text>
                <Text style={styles.featureCardDesc}>Expand your word bank.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.featureMiniCard} onPress={() => setCurrentView('chat')}>
                <Text style={styles.featureCardTitle}>📊 Writing History & Analysis</Text>
                <Text style={styles.featureCardDesc}>Track your progress over time.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.featureMiniCard} onPress={() => setCurrentView('chat')}>
                <Text style={styles.featureCardTitle}>🌍 Contextual Examples</Text>
                <Text style={styles.featureCardDesc}>Learn in real context.</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Section: Recent Activity & Quick Start */}
            <View style={styles.bottomSectionRow}>
              <View style={styles.recentActivityBox}>
                <Text style={styles.sectionHeaderTitle}>Recent Activity Feed</Text>
                <Text style={styles.activityItemText}>1. The sare your team is essied to grammar exercises. <Text style={styles.activityTime}>1 days ago</Text></Text>
                <Text style={styles.activityItemText}>2. You use the tsit grammer exercises. <Text style={styles.activityTime}>1 days ago</Text></Text>
                <Text style={styles.activityItemText}>3. Fhe wihy sransories don't head et .utoor exerclo this. <Text style={styles.activityTime}>1 days ago</Text></Text>
              </View>

              <TouchableOpacity 
                style={styles.quickStartBox}
                onPress={() => setCurrentView('chat')}
              >
                <Text style={styles.sectionHeaderTitle}>Quick Start Tutor</Text>
                <Text style={styles.quickStartDesc}>Start a quick grammar check instantly with AI.</Text>
              </TouchableOpacity>
            </View>

            {/* Recommended Plans / Language Subscriptions Section (Strictly Language Tutor Focused) */}
            <View style={styles.plansSectionContainer}>
              <Text style={styles.plansMainTitle}>Recommended Language Learning Plans</Text>
              <Text style={styles.plansSubTitle}>Choose tailored AI tutor subscriptions based on your preferred target language.</Text>

              <View style={styles.plansGrid}>
                <View style={styles.planCard}>
                  <Text style={styles.planBadge}>Most Popular</Text>
                  <Text style={styles.planLangName}>🇬🇧 English Master Pro</Text>
                  <Text style={styles.planPrice}>₹499 <Text style={styles.planDuration}>/ month</Text></Text>
                  <Text style={styles.planFeatureText}>• 24/7 AI Grammar & Speech Correction</Text>
                  <Text style={styles.planFeatureText}>• Unlimited Vocabulary Builder</Text>
                  <Text style={styles.planFeatureText}>• Advanced IELTS / Conversational Modules</Text>
                  <TouchableOpacity style={styles.planSubscribeBtn} onPress={() => setCurrentView('chat')}>
                    <Text style={styles.planSubscribeText}>Start English Plan</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.planCard}>
                  <Text style={styles.planLangName}>🇮🇳 Hindi Fluency Pack</Text>
                  <Text style={styles.planPrice}>₹399 <Text style={styles.planDuration}>/ month</Text></Text>
                  <Text style={styles.planFeatureText}>• Shuddh Hindi Grammar Guidance</Text>
                  <Text style={styles.planFeatureText}>• Script & Vocabulary Training</Text>
                  <Text style={styles.planFeatureText}>• Real-time Conversational Practice</Text>
                  <TouchableOpacity style={styles.planSubscribeBtn} onPress={() => setCurrentView('chat')}>
                    <Text style={styles.planSubscribeText}>Start Hindi Plan</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.planCard}>
                  <Text style={styles.planLangName}>🇮🇳 Punjabi Expert Tier</Text>
                  <Text style={styles.planPrice}>₹399 <Text style={styles.planDuration}>/ month</Text></Text>
                  <Text style={styles.planFeatureText}>• Gurmukhi Script Assistance</Text>
                  <Text style={styles.planFeatureText}>• Cultural & Idiomatic Phrases</Text>
                  <Text style={styles.planFeatureText}>• Voice-enabled Interactive Tutor</Text>
                  <TouchableOpacity style={styles.planSubscribeBtn} onPress={() => setCurrentView('chat')}>
                    <Text style={styles.planSubscribeText}>Start Punjabi Plan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Footer info */}
            <View style={styles.footerRow}>
              <Text style={styles.footerInfoText}>App version: info</Text>
              <TouchableOpacity onPress={() => alert('Upgrade to Pro')}>
                <Text style={styles.footerUpgradeText}>Upgrade to Pro</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    );
  }

  // --- RENDER CHAT INTERACTIVE VIEW ---
  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop' }} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Top Header Bar */}
        <View style={styles.topHeaderBar}>
          <TouchableOpacity onPress={() => setCurrentView('home')} style={styles.backHomeBtn}>
            <Text style={styles.backHomeText}>⬅ Back to Dashboard</Text>
          </TouchableOpacity>
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

        <View style={styles.inputContainer}>
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
    backgroundColor: 'rgba(10, 15, 14, 0.82)',
    flexDirection: 'column',
    width: '100%',
  },
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: 'rgba(17, 23, 21, 0.95)',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0A3B3D',
  },
  topHeaderTitle: {
    color: '#E8B486',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  navAuthBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  navAuthText: {
    color: '#E1F2EC',
    fontSize: 14,
    fontWeight: '600',
  },
  navSignUpBtn: {
    backgroundColor: '#E8B486',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navSignUpText: {
    color: '#111715',
    fontSize: 14,
    fontWeight: 'bold',
  },
  helpButton: {
    backgroundColor: 'rgba(23, 33, 30, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0A3B3D',
  },
  helpButtonText: {
    color: '#E1F2EC',
    fontSize: 14,
    fontWeight: '600',
  },
  backHomeBtn: {
    backgroundColor: 'rgba(10, 59, 61, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backHomeText: {
    color: '#E8B486',
    fontSize: 13,
    fontWeight: 'bold',
  },
  homeScrollContent: {
    padding: 24,
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: 50,
  },
  welcomeHeading: {
    color: '#E8B486',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resumeButton: {
    backgroundColor: 'rgba(30, 40, 36, 0.9)',
    borderWidth: 1.5,
    borderColor: '#8C6E52',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  resumeButtonText: {
    color: '#E1F2EC',
    fontSize: 15,
    fontWeight: '600',
  },
  homeCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  dashboardCard: {
    backgroundColor: 'rgba(17, 23, 21, 0.85)',
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
    borderRadius: 16,
    padding: 18,
    minWidth: 220,
    flex: 1,
  },
  cardLabel: {
    color: '#8FA39D',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  cardValueLarge: {
    color: '#E1F2EC',
    fontSize: 22,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#0A3B3D',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E8B486',
  },
  featureMiniCard: {
    backgroundColor: 'rgba(17, 23, 21, 0.85)',
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
    borderRadius: 16,
    padding: 16,
    minWidth: 220,
    flex: 1,
    justifyContent: 'center',
  },
  featureCardTitle: {
    color: '#E8B486',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureCardDesc: {
    color: '#8FA39D',
    fontSize: 13,
  },
  bottomSectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  recentActivityBox: {
    flex: 2,
    backgroundColor: 'rgba(17, 23, 21, 0.85)',
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
    borderRadius: 16,
    padding: 20,
    minWidth: 300,
  },
  quickStartBox: {
    flex: 1.5,
    backgroundColor: 'rgba(17, 23, 21, 0.85)',
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
    borderRadius: 16,
    padding: 20,
    minWidth: 260,
    justifyContent: 'center',
  },
  sectionHeaderTitle: {
    color: '#E8B486',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activityItemText: {
    color: '#E1F2EC',
    fontSize: 14,
    marginBottom: 8,
  },
  activityTime: {
    color: '#8FA39D',
    fontSize: 12,
    float: 'right',
  },
  quickStartDesc: {
    color: '#E1F2EC',
    fontSize: 15,
    lineHeight: 22,
  },
  plansSectionContainer: {
    marginTop: 10,
    marginBottom: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#0A3B3D',
  },
  plansMainTitle: {
    color: '#E8B486',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  plansSubTitle: {
    color: '#8FA39D',
    fontSize: 14,
    marginBottom: 20,
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  planCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: 'rgba(17, 23, 21, 0.9)',
    borderWidth: 2,
    borderColor: '#8C6E52',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  planBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#8C6E52',
    color: '#111715',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  planLangName: {
    color: '#E1F2EC',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  planPrice: {
    color: '#E8B486',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  planDuration: {
    color: '#8FA39D',
    fontSize: 14,
    fontWeight: 'normal',
  },
  planFeatureText: {
    color: '#E1F2EC',
    fontSize: 13,
    marginBottom: 8,
    opacity: 0.9,
  },
  planSubscribeBtn: {
    backgroundColor: '#0A3B3D',
    borderWidth: 1,
    borderColor: '#8C6E52',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  planSubscribeText: {
    color: '#E8B486',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  footerInfoText: {
    color: '#8FA39D',
    fontSize: 13,
  },
  footerUpgradeText: {
    color: '#E8B486',
    fontSize: 13,
    fontWeight: 'bold',
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
    maxWidth: '75%', 
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
