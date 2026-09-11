import React, { useState } from 'react';
import { View, StyleSheet, Platform, Modal, Text, TouchableOpacity } from 'react-native';
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
  // By default user ko null rakha hai taaki fresh open karne par hamesha HomeScreen khule
  const [user, setUser] = useState(null);

  const [currentStep, setCurrentStep] = useState('pricing'); // 'pricing', 'roadmap', 'chat'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
    setCurrentStep('pricing');
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentStep('pricing');
    setSelectedPlan(null);
    setIsPaid(false);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.removeItem('ai_tutor_user');
    }
  };

  const handleSelectPlan = (planName) => {
    setSelectedPlan(planName);
    if (planName === 'Free Demo') {
      setIsPaid(true);
      setCurrentStep('roadmap');
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setIsPaid(true);
    setCurrentStep('roadmap');
  };

  const handleSelectDay = (dayNumber) => {
    setSelectedDay(dayNumber);
    setCurrentStep('chat');
    setActiveTab('AI Tutor');
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
          onBack={() => setUser(null)}
        />
      );
    }

    if (currentStep === 'roadmap') {
      return (
        <RoadmapScreen 
          selectedPlan={selectedPlan}
          onSelectDay={handleSelectDay}
          onBack={() => setCurrentStep('pricing')}
        />
      );
    }

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

  const showNavbar = !(user && (currentStep === 'pricing' || currentStep === 'roadmap') && !showAuthModal);

  return (
    <View style={styles.container}>
      {showNavbar && (
        <Navbar 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'AI Tutor' && isPaid) setCurrentStep('roadmap');
          }} 
          onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }}
          onOpenSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }}
          onSignOut={handleSignOut}
        />
      )}
      <View style={styles.content}>
        {renderContent()}
      </View>

      <Modal visible={showPaymentModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.paymentCard}>
            <Text style={styles.paymentTitle}>🔒 Secure Checkout</Text>
            <Text style={styles.paymentSub}>Plan: <Text style={{color: '#FFCB9A'}}>{selectedPlan}</Text></Text>
            
            <View style={styles.priceBox}>
              <Text style={styles.priceText}>
                {selectedPlan === 'Base Starter' ? '₹999' : '₹1,799'}
              </Text>
            </View>

            <Text style={styles.paymentDesc}>Complete payment via UPI / Card / NetBanking to unlock your curriculum.</Text>

            <TouchableOpacity style={styles.payNowBtn} onPress={handlePaymentSuccess} activeOpacity={0.8}>
              <Text style={styles.payNowText}>Pay & Unlock Now 🚀</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelPayBtn} onPress={() => setShowPaymentModal(false)}>
              <Text style={styles.cancelPayText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paymentCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#122322',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#116466',
    alignItems: 'center',
  },
  paymentTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  paymentSub: {
    color: '#D1E8E2',
    fontSize: 14,
    marginBottom: 16,
  },
  priceBox: {
    backgroundColor: 'rgba(255,203,154,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCB9A',
    marginBottom: 16,
  },
  priceText: {
    color: '#FFCB9A',
    fontSize: 28,
    fontWeight: '900',
  },
  paymentDesc: {
    color: '#A7B0AE',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  payNowBtn: {
    backgroundColor: '#FFCB9A',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  payNowText: {
    color: '#121E1A',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelPayBtn: {
    paddingVertical: 8,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  cancelPayText: {
    color: '#D1E8E2',
    fontSize: 12,
  },
});
