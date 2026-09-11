import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';

export default function PricingScreen({ onSelectPlan, onSignOut, onPaymentSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);

  const handleOpenCheckout = (plan) => {
    if (plan === 'Free Demo') {
      if (onPaymentSuccess) onPaymentSuccess(plan);
      if (onSelectPlan) onSelectPlan(plan);
      return;
    }
    setSelectedPlan(plan);
  };

  const handleConfirmPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const purchasedPlan = selectedPlan;
      setSelectedPlan(null);
      if (onPaymentSuccess) {
        onPaymentSuccess(purchasedPlan);
      }
      if (onSelectPlan) {
        onSelectPlan(purchasedPlan);
      }
    }, 2000);
  };

  return (
    <View style={styles.mainWrapper}>
      {/* Sharp Background Image */}
      <Image 
        source={require('../../assets/tutor_girl.png.png')} 
        style={styles.bgImage} 
      />
      
      <div style={styles.bgOverlayStyle} />

      {/* Top Bar with Sign Out button */}
      <View style={styles.topBar}>
        <View style={styles.logoArea}>
          <Text style={styles.logoText}>🧠 AI Tutor</Text>
        </View>
        {onSignOut && (
          <TouchableOpacity onPress={onSignOut} style={styles.signOutBtn} activeOpacity={0.8}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.badge}>⚡ CHOOSE YOUR MASTERY PATH</Text>
          <Text style={styles.title}>Unlock Your Fluent Future with AI</Text>
          <Text style={styles.subtitle}>
            Select a plan tailored to your goals with 60 days of structured daily AI coaching.
          </Text>
        </View>

        <View style={styles.pricingGrid}>
          {/* Free Demo Card */}
          <View style={styles.card}>
            <View>
              <Text style={styles.planTitle}>Free Demo</Text>
              <Text style={styles.planPrice}>₹0 <Text style={styles.planSub}>/ trial</Text></Text>
              <Text style={styles.planDesc}>Test out our AI voice intelligence.</Text>
              
              <View style={styles.featureList}>
                <Text style={styles.featureItem}>✨ 1 Interactive Demo Class</Text>
                <Text style={styles.featureItem}>🛡️ Basic AI Accent Analysis</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.outlineButton}
              onPress={() => handleOpenCheckout('Free Demo')}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineButtonText}>Start Free Demo</Text>
            </TouchableOpacity>
          </View>

          {/* Base Starter Card */}
          <View style={styles.card}>
            <View>
              <Text style={styles.planTitle}>Base Starter</Text>
              <Text style={styles.planPrice}>₹999 <Text style={styles.planSub}>/ 30 days</Text></Text>
              <Text style={styles.planDesc}>Ideal for casual learners building habits.</Text>
              
              <View style={styles.featureList}>
                <Text style={styles.featureItem}>📚 30 Days Structured Lessons</Text>
                <Text style={styles.featureItem}>🎤 Real-time Voice Correction</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.outlineButton}
              onPress={() => handleOpenCheckout('Base Starter')}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineButtonText}>Get Base Plan</Text>
            </TouchableOpacity>
          </View>

          {/* 60-Day Pro Master Card */}
          <View style={[styles.card, styles.popularCard]}>
            <View style={styles.popularBadge}>MOST POPULAR 🔥</View>
            <View>
              <Text style={styles.planTitle}>60-Day Pro Master</Text>
              <Text style={styles.planPrice}>₹1,799 <Text style={styles.planSub}>/ 60 days</Text></Text>
              <Text style={styles.planDesc}>Complete 60-day roadmap for true fluency.</Text>
              
              <View style={styles.featureList}>
                <Text style={styles.featureItem}>🚀 Full 60 Days Masterclass Curriculum</Text>
                <Text style={styles.featureItem}>🎙️ Advanced AI Voice & Accent Coaching</Text>
                <Text style={styles.featureItem}>📊 Detailed Progress Analytics Dashboard</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.solidButton}
              onPress={() => handleOpenCheckout('60-Day Pro Master')}
              activeOpacity={0.8}
            >
              <Text style={styles.solidButtonText}>Get Pro Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* SECURE CHECKOUT MODAL WITH PAYMENT METHODS */}
      {selectedPlan && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalLock}>🔒 Secure Checkout</Text>
            <Text style={styles.modalPlanTitle}>Plan: {selectedPlan}</Text>
            
            <Text style={styles.modalPrice}>
              {selectedPlan === 'Base Starter' ? '₹999' : '₹1,799'}
            </Text>

            <Text style={styles.sectionLabel}>Select Payment Method:</Text>
            
            <View style={styles.paymentMethodsContainer}>
              <TouchableOpacity 
                style={[styles.payOption, selectedMethod === 'upi' && styles.payOptionActive]}
                onPress={() => setSelectedMethod('upi')}
              >
                <Text style={styles.payOptionText}>📱 UPI / GPay / PhonePe</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.payOption, selectedMethod === 'card' && styles.payOptionActive]}
                onPress={() => setSelectedMethod('card')}
              >
                <Text style={styles.payOptionText}>💳 Credit / Debit Card</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.payOption, selectedMethod === 'netbanking' && styles.payOptionActive]}
                onPress={() => setSelectedMethod('netbanking')}
              >
                <Text style={styles.payOptionText}>🏦 NetBanking</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.payNowButton} 
              onPress={handleConfirmPayment}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#121E1A" />
              ) : (
                <Text style={styles.payNowText}>Pay & Unlock Now 🚀</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setSelectedPlan(null)} 
              disabled={processing}
              style={styles.cancelTouch}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    minHeight: '100vh',
    backgroundColor: '#070D10',
    position: 'relative',
    overflowX: 'hidden',
  },
  bgImage: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    resizeMode: 'cover',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgOverlayStyle: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(7, 13, 16, 0.55)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  topBar: {
    position: 'relative',
    zIndex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  container: {
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 25,
    maxWidth: 700,
  },
  badge: {
    color: '#FFCB9A',
    backgroundColor: 'rgba(255, 203, 154, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 203, 154, 0.3)',
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: '#D1E8E2',
    fontSize: 13,
    textAlign: 'center',
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    maxWidth: 1100,
    width: '100%',
  },
  card: {
    flex: 1,
    minWidth: 260,
    maxWidth: 340,
    backgroundColor: '#12221D', // Solid sharp dark green look
    borderRadius: 20,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#116466',
    justifyContent: 'space-between',
    ...(Platform.OS === 'web' ? { boxShadow: '0 12px 36px rgba(0,0,0,0.8)' } : {}),
  },
  popularCard: {
    borderColor: '#FFCB9A',
    backgroundColor: '#162C24',
  },
  popularBadge: {
    alignSelf: 'center',
    backgroundColor: '#FFCB9A',
    color: '#121E1A',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 10,
  },
  planTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planPrice: {
    color: '#FFCB9A',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 8,
  },
  planSub: {
    fontSize: 12,
    color: '#D1E8E2',
    fontWeight: 'normal',
  },
  planDesc: {
    color: '#D1E8E2',
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 16,
  },
  featureList: {
    gap: 8,
    marginBottom: 20,
  },
  featureItem: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#116466',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(17, 100, 102, 0.2)',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  outlineButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  solidButton: {
    backgroundColor: '#FFCB9A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', border: 'none' } : {}),
  },
  solidButtonText: {
    color: '#121E1A',
    fontSize: 13,
    fontWeight: '800',
  },
  // Modal & Payment Option Styles added cleanly
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#12221D',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#116466',
    padding: 28,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: '0 20px 50px rgba(0,0,0,0.9)' } : {}),
  },
  modalLock: {
    color: '#FFCB9A',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalPlanTitle: {
    color: '#D1E8E2',
    fontSize: 14,
    marginBottom: 12,
  },
  modalPrice: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#D1E8E2',
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  paymentMethodsContainer: {
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },
  payOption: {
    backgroundColor: 'rgba(17, 100, 102, 0.2)',
    borderWidth: 1.5,
    borderColor: '#116466',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  payOptionActive: {
    borderColor: '#FFCB9A',
    backgroundColor: 'rgba(255, 203, 154, 0.15)',
  },
  payOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  payNowButton: {
    backgroundColor: '#FFCB9A',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  payNowText: {
    color: '#121E1A',
    fontSize: 15,
    fontWeight: '800',
  },
  cancelTouch: {
    padding: 6,
  },
  cancelText: {
    color: '#8FA39D',
    fontSize: 13,
    fontWeight: '600',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
});
