import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  ImageBackground,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  const plans = [
    { language: 'English', level: 'Beginner to Advanced', price: 'Free / Pro', desc: 'Master conversational fluency, grammar correction, and accent training.' },
    { language: 'Spanish', level: 'All Levels', price: '$9.99/mo', desc: 'Interactive roleplays and real-time corrections for Spanish learners.' },
    { language: 'French', level: 'Intermediate', price: '$9.99/mo', desc: 'Focus on complex phrasing, pronunciation, and vocabulary building.' },
    { language: 'German', level: 'Beginner', price: '$9.99/mo', desc: 'Structured grammar paths and precise vocabulary coaching.' },
  ];

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop' }} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        
        {/* Single Consolidated Header */}
        <View style={styles.topHeaderBar}>
          <Text style={styles.topHeaderTitle}>hellow</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={() => alert('Login modal/screen coming soon')}
            >
              <Text style={styles.navButtonText}>hiiii</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.navButton, styles.signUpButton]} 
              onPress={() => alert('Sign Up modal/screen coming soon')}
            >
              <Text style={[styles.navButtonText, styles.signUpText]}></Text>
            </TouchableOpacity>
          </View>
        </View>

       <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroBadge}>✨ AI-Powered Language Mastery</Text>
            <Text style={styles.heroTitle}>Learn Any Language with Your Personal AI Tutor</Text>
            <Text style={styles.heroSubtitle}>
              Experience real-time voice conversations, instant grammar corrections, and tailored lesson plans built specifically for your learning pace.
            </Text>
            
            <TouchableOpacity 
              style={styles.primaryCta} 
              onPress={() => navigation.navigate('TutorChat')}
            >
              <Text style={styles.primaryCtaText}>Start Practicing Now 🚀</Text>
            </TouchableOpacity>
          </View>

          {/* Recommended Plans Section */}
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>Recommended Language Plans</Text>
            <Text style={styles.sectionSubtitle}>Choose your target language and unlock specialized AI coaching modules.</Text>
          </View>

          <View style={styles.plansGrid}>
            {plans.map((plan, index) => (
              <View key={index} style={styles.planCard}>
                <View style={styles.planCardHeader}>
                  <Text style={styles.planLanguage}>{plan.language}</Text>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                </View>
                <Text style={styles.planLevel}>Level: {plan.level}</Text>
                <Text style={styles.planDesc}>{plan.desc}</Text>
                
                <TouchableOpacity 
                  style={styles.selectPlanBtn}
                  onPress={() => navigation.navigate('TutorChat', { selectedLanguage: plan.language })}
                >
                  <Text style={styles.selectPlanText}>Select & Practice</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>AI Language Tutor Platform • Powered by Gemini AI & Supabase</Text>
          </View>

        </ScrollView>
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
      minHeight: '100vh',
    } : {}),
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 14, 0.85)',
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
    width: '100%',
  },
  topHeaderTitle: {
    color: '#E8B486',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 10,
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
    backgroundColor: 'rgba(23, 33, 30, 0.9)',
  },
  navButtonText: {
    color: '#E1F2EC',
    fontSize: 14,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: '#C29B72',
    borderColor: '#C29B72',
  },
  signUpText: {
    color: '#111715',
    fontWeight: 'bold',
  },
  scrollContainer: {
    padding: 24,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    padding: 24,
    backgroundColor: 'rgba(17, 23, 21, 0.85)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
  },
  heroBadge: {
    color: '#E8B486',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: '#E1F2EC',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  heroSubtitle: {
    color: '#8FA39D',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    maxWidth: 700,
  },
  primaryCta: {
    backgroundColor: '#C29B72',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  primaryCtaText: {
    color: '#111715',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeaderContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: '#E8B486',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: '#8FA39D',
    fontSize: 14,
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 40,
  },
  planCard: {
    backgroundColor: 'rgba(17, 23, 21, 0.9)',
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
    borderRadius: 16,
    padding: 20,
    width: Platform.OS === 'web' ? '48%' : '100%',
    marginBottom: 16,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planLanguage: {
    color: '#E1F2EC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  planPrice: {
    color: '#E8B486',
    fontSize: 15,
    fontWeight: '700',
  },
  planLevel: {
    color: '#8FA39D',
    fontSize: 13,
    marginBottom: 10,
    fontWeight: '500',
  },
  planDesc: {
    color: '#E1F2EC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.9,
  },
  selectPlanBtn: {
    backgroundColor: 'rgba(10, 59, 61, 0.85)',
    borderWidth: 1.5,
    borderColor: '#8C6E52',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectPlanText: {
    color: '#E8B486',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#0A3B3D',
  },
  footerText: {
    color: '#8FA39D',
    fontSize: 13,
  },
});
