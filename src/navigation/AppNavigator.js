import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Navbar from '../components/Navbar';
import LoginScreen from '../screens/LoginScreen';
import AuthScreen from '../screens/AuthScreen';

// Screens
import HomeScreen from '../screens/HomeScreen';
import PricingScreen from '../screens/PricingScreen';
import RoadmapScreen from '../screens/RoadmapScreen';
import TutorChatScreen from '../screens/TutorChatScreen';
import GrammarHistoryScreen from '../screens/GrammarHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

export default function AppNavigator() {
  const [user, setUser] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('ai_tutor_user');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Funnel steps for logged-in user: 'pricing' -> 'roadmap' -> 'chat'
  const [currentStep, setCurrentStep] = useState('pricing');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const [activeTab, setActiveTab] = useState('AI Tutor');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleLoginSuccess = (email) => {
    const userData = { email: email || 'Creatorstack9@gmail.com' };
    setUser(userData);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem('ai_tutor_user', JSON.stringify(userData));
    }
    setShowAuthModal(false);
    setCurrentStep('pricing'); // Direct user to pricing plans post-login
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentStep('pricing');
    setSelectedPlan(null);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.removeItem('ai_tutor_user');
    }
  };

  const handleSelectPlan = (planName) => {
    setSelectedPlan(planName);
    setCurrentStep('roadmap'); // Move to 60-day roadmap after plan choice
  };

  const handleSelectDay = (dayNumber) => {
    setSelectedDay(dayNumber);
    setCurrentStep('chat'); // Jump into the specific day's chat session
    setActiveTab('AI Tutor');
  };

  const renderContent = () => {
    // If login or signup screen is active
    if (showAuthModal) {
      if (authMode === 'signup') {
        return (
          <AuthScreen 
            onAuthSuccess={handleLoginSuccess} 
            onSwitchToLogin={() => setAuthMode('login')} 
          />
        );
      }
      return (
        <LoginScreen 
          onLogin={handleLoginSuccess} 
          onSwitchToSignup={() => setAuthMode('signup')} 
        />
      );
    }

    // If user is NOT logged in, show HomeScreen
    if (!user) {
      return (
        <HomeScreen 
          onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }} 
          onOpenSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }} 
        />
      );
    }

    // Step-based flow for logged-in users before reaching main tabs
    if (currentStep === 'pricing') {
      return <PricingScreen onSelectPlan={handleSelectPlan} />;
    }

    if (currentStep === 'roadmap') {
      return <RoadmapScreen onSelectDay={handleSelectDay} />;
    }

    // Main Tab Navigation when inside the app
    switch (activeTab) {
      case 'AI Tutor':
        return <TutorChatScreen selectedDay={selectedDay} />;
      case 'Grammar History':
        return <GrammarHistoryScreen />;
      case 'Profile Settings':
        return <ProfileScreen user={user} selectedPlan={selectedPlan} />;
      default:
        return <TutorChatScreen selectedDay={selectedDay} />;
    }
  };

  return (
    <View style={styles.container}>
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'AI Tutor') setCurrentStep('roadmap'); // Return to roadmap when clicking AI Tutor tab
        }} 
        onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }}
        onOpenSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }}
        onSignOut={handleSignOut}
      />
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070D10',
  },
  content: {
    flex: 1,
  },
});
