import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';

export default function PricingScreen({ onSelectPlan, onSignOut }) {
  return (
    <View style={styles.mainWrapper}>
      {/* Sharp Background Image */}
      <Image 
        source={require('../../assets/tutor_girl.png.png')} 
        style={styles.bgImage} 
      />
      
      <View style={styles.darkOverlay} />

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
              onPress={() => onSelectPlan && onSelectPlan('Free Demo')}
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
              onPress={() => onSelectPlan && onSelectPlan('Base Starter')}
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
              onPress={() => onSelectPlan && onSelectPlan('60-Day Pro Master')}
              activeOpacity={0.8}
            >
              <Text style={styles.solidButtonText}>Get Pro Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    minHeight: '100vh',
    backgroundColor: '#070D10',
    position: 'relative',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    pointerEvents: 'none',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 13, 16, 0.4)',
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
    backgroundColor: 'rgba(24, 44, 37, 0.9)',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#116466',
    justifyContent: 'space-between',
    ...(Platform.OS === 'web' ? { boxShadow: '0 12px 36px rgba(0,0,0,0.6)' } : {}),
  },
  popularCard: {
    borderColor: '#FFCB9A',
    backgroundColor: 'rgba(24, 44, 37, 0.95)',
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
});
