import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export default function PricingScreen({ onSelectPlan }) {
  return (
    <div style={styles.pageWrapper}>
      {/* Background Image Layer matching the rest of the project */}
      <div style={styles.bgImageLayer} />
      <div style={styles.darkOverlay} />

      <ScrollView contentContainerStyle={styles.container}>
        <div style={styles.headerBox}>
          <span style={styles.badge}>⚡ CHOOSE YOUR MASTERY PATH</span>
          <h1 style={styles.title}>Unlock Your Fluent Future with AI</h1>
          <p style={styles.subtitle}>Select a plan tailored to your goals. Master English with 60 days of structured daily AI coaching.</p>
        </div>

        <div style={styles.cardsGrid}>
          {/* Free Demo Plan */}
          <div style={styles.card}>
            <div style={styles.planName}>Free Demo</div>
            <div style={styles.price}>₹0 <span style={styles.duration}>/ trial</span></div>
            <p style={styles.planDesc}>Perfect for testing out our AI voice intelligence.</p>
            <ul style={styles.featureList}>
              <li>✨ 1 Interactive Demo Class</li>
              <li>🤖 Basic AI Accent Analysis</li>
              <li>💬 Community Support</li>
            </ul>
            <TouchableOpacity style={styles.outlineButton} onPress={() => onSelectPlan('Free')}>
              <Text style={styles.outlineButtonText}>Start Free Demo</Text>
            </TouchableOpacity>
          </div>

          {/* Base Plan - 30 Days */}
          <div style={styles.card}>
            <div style={styles.planName}>Base Starter</div>
            <div style={styles.price}>₹999 <span style={styles.duration}>/ 30 days</span></div>
            <p style={styles.planDesc}>Ideal for casual learners building daily habits.</p>
            <ul style={styles.featureList}>
              <li>📚 30 Days Structured Lessons</li>
              <li>🎙️ Real-time Voice Correction</li>
              <li>📊 Basic Progress Dashboard</li>
            </ul>
            <TouchableOpacity style={styles.primaryButton} onPress={() => onSelectPlan('Base')}>
              <Text style={styles.primaryButtonText}>Get Base Plan</Text>
            </TouchableOpacity>
          </div>

          {/* Advance Plan - 60 Days (Flagship) */}
          <div style={{ ...styles.card, ...styles.featuredCard }}>
            <div style={styles.popularBadge}>MOST POPULAR 🔥</div>
            <div style={styles.planName}>Advance 60-Day Pro</div>
            <div style={styles.price}>₹1,999 <span style={styles.duration}>/ 60 days</span></div>
            <p style={styles.planDesc}>Complete transformation path for career & fluency.</p>
            <ul style={styles.featureList}>
              <li>🚀 Full 60-Day Masterclass Roadmap</li>
              <li>🧠 Advanced Grammar & Vocabulary AI</li>
              <li>📈 Detailed Analytics & Certification</li>
              <li>⚡ Priority 24/7 Voice Companion</li>
            </ul>
            <TouchableOpacity style={styles.primaryButton} onPress={() => onSelectPlan('Advance')}>
              <Text style={styles.primaryButtonText}>Unlock 60-Day Pro</Text>
            </TouchableOpacity>
          </div>
        </div>
      </ScrollView>
    </div>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    overflow: 'hidden',
  },
  bgImageLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url(/assets/tutor_girl.png.png)', // Project's main background image
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(4px)',
    transform: 'scale(1.05)',
    zIndex: 0,
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 13, 16, 0.88)', // Deep immersive tint
    zIndex: 1,
  },
  container: {
    position: 'relative',
    zIndex: 2,
    padding: '40px 20px',
    alignItems: 'center',
    minHeight: '100vh',
  },
  headerBox: {
    textAlign: 'center',
    marginBottom: '40px',
    maxWidth: '700px',
  },
  badge: {
    color: '#FFCB9A',
    backgroundColor: 'rgba(255, 203, 154, 0.1)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    border: '1px solid rgba(255, 203, 154, 0.3)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: '32px',
    fontWeight: '900',
    marginTop: '16px',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#8FA39D',
    fontSize: '15px',
    lineHeight: '22px',
  },
  cardsGrid: {
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '1100px',
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(24, 44, 37, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: '20px',
    padding: '30px',
    width: '320px',
    border: '1.5px solid #116466',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  featuredCard: {
    borderColor: '#FFCB9A',
    backgroundColor: 'rgba(19, 36, 31, 0.9)',
    boxShadow: '0 15px 40px rgba(255, 203, 154, 0.2)',
  },
  popularBadge: {
    position: 'absolute',
    top: '-12px',
    right: '24px',
    backgroundColor: '#FFCB9A',
    color: '#0F1715',
    fontSize: '10px',
    fontWeight: '900',
    padding: '4px 10px',
    borderRadius: '6px',
    letterSpacing: '0.5px',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  price: {
    color: '#FFCB9A',
    fontSize: '28px',
    fontWeight: '900',
    marginBottom: '12px',
  },
  duration: {
    fontSize: '13px',
    color: '#8FA39D',
    fontWeight: 'normal',
  },
  planDesc: {
    color: '#D1E8E2',
    fontSize: '13px',
    marginBottom: '20px',
    lineHeight: '18px',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 24px 0',
    color: '#D1E8E2',
    fontSize: '13px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  primaryButton: {
    backgroundColor: '#FFCB9A',
    paddingVertical: '14px',
    borderRadius: '12px',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginTop: 'auto',
    border: 'none',
  },
  primaryButtonText: {
    color: '#0F1715',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    paddingVertical: '14px',
    borderRadius: '12px',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginTop: 'auto',
    border: '1.5px solid #116466',
  },
  outlineButtonText: {
    color: '#FFCB9A',
    fontSize: '14px',
    fontWeight: 'bold',
  },
});
