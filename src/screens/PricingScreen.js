import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';

export default function PricingScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState('base');

  return (
    <View style={styles.mainWrapper}>
      {/* Background Image Layer */}
      {Platform.OS === 'web' && (
        <div style={styles.bgImageWrapper}>
          <img src="/assets/tutor_girl.png.png" style={styles.bgImageStyle} alt="Background" />
          <div style={styles.bgOverlay} />
        </div>
      )}

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.badge}>⚡ CHOOSE YOUR MASTERY PATH</Text>
          <Text style={styles.title}>Unlock Your Fluent Future with AI</Text>
          <Text style={styles.subtitle}>
            Select a plan tailored to your goals. Master English with 60 days of structured daily AI coaching.
          </Text>
        </View>

        <View style={styles.pricingGrid}>
          {/* Free Demo Card */}
          <View style={styles.card}>
            <View>
              <Text style={styles.planTitle}>Free Demo</Text>
              <Text style={styles.planPrice}>₹0 <Text style={styles.planSub}>/ trial</Text></Text>
              <Text style={styles.planDesc}>Perfect for testing out our AI voice intelligence.</Text>
              
              <View style={styles.featureList}>
                <Text style={styles.featureItem}>✨ 1 Interactive Demo Class</Text>
                <Text style={styles.featureItem}>🛡️ Basic AI Accent Analysis</Text>
                <Text style={styles.featureItem}>💬 Community Support</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.outlineButton}
              onPress={() => navigation.navigate('Roadmap')}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineButtonText}>Start Free Demo</Text>
            </TouchableOpacity>
          </View>

          {/* Base Starter Card */}
          <View style={[styles.card, styles.popularCard]}>
            <View style={styles.popularBadge}>MOST POPULAR 🔥</View>
            <View>
              <Text style={styles.planTitle}>Base Starter</Text>
              <Text style={styles.planPrice}>₹999 <Text style={styles.planSub}>/ 30 days</Text></Text>
              <Text style={styles.planDesc}>Ideal for casual learners building daily habits.</Text>
              
              <View style={styles.featureList}>
                <Text style={styles.featureItem}>📚 30 Days Structured Lessons</Text>
                <Text style={styles.featureItem}>🎤 Real-time Voice Correction</Text>
                <Text style={styles.featureItem}>📊 Basic Progress Dashboard</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.solidButton}
              onPress={() => alert('Base Plan Selected!')}
              activeOpacity={0.8}
            >
              <Text style={styles.solidButtonText}>Get Base Plan</Text>
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
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: '#070D10',
  },
  bgImageWrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -1,
    overflow: 'hidden',
  },
  bgImageStyle: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'blur(6px)',
    transform: 'scale(1.05)',
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(7, 13, 16, 0.75)',
  },
  container: {
    padding: '40px 20px',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 40,
    maxWidth: 700,
  },
  badge: {
    color: '#FFCB9A',
    backgroundColor: 'rgba(255, 203, 154, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 203, 154, 0.3)',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#D1E8E2',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    maxWidth: 900,
    width: '100%',
  },
  card: {
    flex: 1,
    minWidth: 280,
    maxWidth: 400,
    backgroundColor: 'rgba(24, 44, 37, 0.88)',
    borderRadius: 24,
    padding: 30,
    borderWidth: 2,
    borderColor: '#116466',
    justifyContent: 'space-between',
    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
  },
  popularCard: {
    borderColor: '#FFCB9A',
  },
  popularBadge: {
    alignSelf: 'center',
    backgroundColor: '#FFCB9A',
    color: '#121E1A',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 15,
  },
  planTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planPrice: {
    color: '#FFCB9A',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
  },
  planSub: {
    fontSize: 14,
    color: '#D1E8E2',
    fontWeight: 'normal',
  },
  planDesc: {
    color: '#D1E8E2',
    fontSize: 13,
    marginBottom: 24,
    lineHeight: 18,
  },
  featureList: {
    gap: 12,
    marginBottom: 30,
  },
  featureItem: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: '#116466',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  outlineButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  solidButton: {
    backgroundColor: '#FFCB9A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', border: 'none' } : {}),
  },
  solidButtonText: {
    color: '#121E1A',
    fontSize: 14,
    fontWeight: '800',
  },
});
