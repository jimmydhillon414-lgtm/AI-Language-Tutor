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
        const savedUser = sessionStorage.getItem('ai_tutor_user');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [currentStep, setCurrentStep] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return sessionStorage.getItem('ai_tutor_current_step') || 'pricing';
    }
    return 'pricing';
  });

  const [selectedPlan, setSelectedPlan] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return sessionStorage.getItem('ai_tutor_selected_plan') || null;
    }
    return null;
  });

  const [selectedDay, setSelectedDay] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const day = sessionStorage.getItem('ai_tutor_selected_day');
      return day ? JSON.parse(day) : null;
    }
    return null;
  });

  const [isPaid, setIsPaid] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return sessionStorage.getItem('ai_tutor_is_paid') === 'true';
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return sessionStorage.getItem('ai_tutor_active_tab') || 'AI Tutor';
    }
    return 'AI Tutor';
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const updateSessionStorage = (key, value) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (value === null) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    }
  };

  const handleLoginSuccess = (email) => {
    const userData = { email: email || 'Creatorstack9@gmail.com' };
    setUser(userData);
    updateSessionStorage('ai_tutor_user', userData);
    setShowAuthModal(false);
    
    setCurrentStep('pricing');
    updateSessionStorage('ai_tutor_current_step', 'pricing');
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentStep('pricing');
    setSelectedPlan(null);
    setIsPaid(false);
    setSelectedDay(null);
    setActiveTab('AI Tutor');
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  };

  const handleSelectPlan = (planName) => {
    setSelectedPlan(planName);
    setIsPaid(true);
    setCurrentStep('roadmap');
    
    updateSessionStorage('ai_tutor_selected_plan', planName);
    updateSessionStorage('ai_tutor_is_paid', 'true');
    updateSessionStorage('ai_tutor_current_step', 'roadmap');
  };

  const handleSelectDay = (dayNumber) => {
    setSelectedDay(dayNumber);
    setCurrentStep('chat');
    setActiveTab('AI Tutor');
    
    updateSessionStorage('ai_tutor_selected_day', dayNumber);
    updateSessionStorage('ai_tutor_current_step', 'chat');
    updateSessionStorage('ai_tutor_active_tab', 'AI Tutor');
  };

  const renderContent = () => {
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

    if (!user) {
      return (
        <HomeScreen 
          onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }} 
          onOpenSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }} 
        />
      );
    }

    if (currentStep === 'pricing') {
      return (
        <PricingScreen 
          onSelectPlan={handleSelectPlan} 
          onSignOut={handleSignOut} 
          onBack={() => {
            setUser(null);
            updateSessionStorage('ai_tutor_user', null);
          }}
        />
      );
    }

    if (currentStep === 'roadmap') {
      return (
        <RoadmapScreen 
          selectedPlan={selectedPlan}
          onSelectDay={handleSelectDay}
          onBack={() => {
            setCurrentStep('pricing');
            updateSessionStorage('ai_tutor_current_step', 'pricing');
          }}
        />
      );
    }

    switch (activeTab) {
      case 'AI Tutor':
        return (
          <TutorChatScreen 
            selectedDay={selectedDay} 
            onBack={() => {
              setCurrentStep('roadmap');
              updateSessionStorage('ai_tutor_current_step', 'roadmap');
            }}
            onSignOut={handleSignOut}
          />
        );
      case 'History': 
      case 'Grammar History':
        return <GrammarHistoryScreen />;
      case 'Profile': 
      case 'Profile Settings':
        return <ProfileScreen user={user} selectedPlan={selectedPlan} />;
      default:
        return (
          <TutorChatScreen 
            selectedDay={selectedDay} 
            onBack={() => {
              setCurrentStep('roadmap');
              updateSessionStorage('ai_tutor_current_step', 'roadmap');
            }}
            onSignOut={handleSignOut}
          />
        );
    }
  };

  const showNavbar = !(user && (currentStep === 'pricing' || currentStep === 'roadmap') && !showAuthModal);

  return (
    <View style={styles.container}>
      {showNavbar && (
        <Navbar 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            updateSessionStorage('ai_tutor_active_tab', tab);
            if (tab === 'AI Tutor' && isPaid) {
              setCurrentStep('roadmap');
              updateSessionStorage('ai_tutor_current_step', 'roadmap');
            }
          }} 
          onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }}
          onOpenSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }}
          onSignOut={handleSignOut}
        />
      )}
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
    // 👈 'overflow: hidden' yahan se hata diya hai taaki scrollbar block na ho
    ...(Platform.OS === 'web' ? { height: '100dvh', maxHeight: '100dvh', overflowY: 'auto' } : {}),
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    // 👈 Yahan se bhi 'overflow: 'hidden'' hata diya hai
    overflowY: 'visible', 
  },
});
