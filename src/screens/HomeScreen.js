import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.backgroundImage}>
      {/* Exact Tech Sphere & Glow Background Elements */}
      <View style={styles.glowOrb1} />
      <View style={styles.glowOrb2} />
      <View style={styles.centerSphereContainer}>
        <View style={styles.sphereOuterRing}>
          <View style={styles.sphereInnerCore} />
        </View>
      </View>

      {/* Multilingual Floating Words (No Hindi) */}
      <View style={styles.floatingWordsContainer} pointerEvents="none">
        <Text style={[styles.floatWord, { top: '10%', left: '8%', transform: [{ rotate: '-12deg' }] }]}>Hello</Text>
        <Text style={[styles.floatWord, { top: '22%', right: '10%', transform: [{ rotate: '15deg' }] }]}>सत ਸ੍ਰੀ ਅਕਾਲ</Text>
        <Text style={[styles.floatWord, { top: '40%', left: '5%', transform: [{ rotate: '8deg' }] }]}>Bonjour</Text>
        <Text style={[styles.floatWord, { top: '60%', right: '12%', transform: [{ rotate: '-8deg' }] }]}>Hola</Text>
        <Text style={[styles.floatWord, { top: '78%', left: '12%', transform: [{ rotate: '18deg' }] }]}>Guten Tag</Text>
        <Text style={[styles.floatWord, { top: '88%', right: '10%', transform: [{ rotate: '-5deg' }] }]}>Ciao</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="brain" size={16} color="#E8B486" style={{ marginRight: 6 }} />
            <Text style={styles.badgeText}>AI Language Studio</Text>
          </View>
          <Text style={styles.heroTitle}>Master Languages with Intelligence</Text>
          <Text style={styles.heroSubtitle}>
            Experience real-time AI conversations, instant smart grammar corrections, and immersive voice tuition.
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('TutorChat')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Start Interactive Session</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#0A0F0E" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Platform Modules</Text>
        
        <View style={styles.gridContainer}>
          <TouchableOpacity 
            style={styles.moduleCard}
            onPress={() => navigation.navigate('TutorChat')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(232, 180, 134, 0.15)' }]}>
              <MaterialCommunityIcons name="robot-excited" size={24} color="#E8B486" />
            </View>
            <Text style={styles.moduleTitle}>AI Tutor Chat</Text>
            <Text style={styles.moduleDesc}>Practice natural conversations with instant sentence correction and voice support.</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.moduleCard}
            onPress={() => navigation.navigate('History')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(142, 202, 230, 0.15)' }]}>
              <MaterialCommunityIcons name="chart-box" size={24} color="#8ECAE6" />
            </View>
            <Text style={styles.moduleTitle}>Grammar History</Text>
            <Text style={styles.moduleDesc}>Review all your past mistakes, explanations, and improved translations in one place.</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.moduleCard}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(181, 238, 236, 0.15)' }]}>
              <MaterialCommunityIcons name="account-cog" size={24} color="#B5EEEC" />
            </View>
            <Text style={styles.moduleTitle}>Learning Settings</Text>
            <Text style={styles.moduleDesc}>Customize your target language (English, Punjabi, Spanish) and proficiency level.</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: '#0F1A18', // Exact dark teal-charcoal shade from image
    position: 'relative',
    overflow: 'hidden',
  },
  glowOrb1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(18, 102, 102, 0.18)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(217, 176, 140, 0.08)',
  },
  centerSphereContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
    opacity: 0.35,
  },
  sphereOuterRing: {
    width: 450,
    height: 450,
    borderRadius: 225,
    borderWidth: 2,
    borderColor: '#116466',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 100, 102, 0.05)',
  },
  sphereInnerCore: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#0A2E2C',
    borderWidth: 1.5,
    borderColor: '#D9B08C',
  },
  floatingWordsContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 1,
  },
  floatWord: {
    position: 'absolute',
    fontSize: 40,
    fontWeight: '900',
    color: 'rgba(181, 238, 236, 0.1)',
    letterSpacing: 2,
  },
  container: {
    flex: 1,
    zIndex: 2,
  },
  content: {
    padding: 24,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  heroCard: {
    backgroundColor: 'rgba(17, 23, 21, 0.88)',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1.5,
    borderColor: '#116466',
    marginBottom: 32,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(217, 176, 140, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 176, 140, 0.2)',
  },
  badgeText: {
    color: '#D9B08C',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#D1E8E2',
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 600,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9B08C',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  primaryButtonText: {
    color: '#0A0F0E',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  moduleCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: 'rgba(17, 23, 21, 0.88)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#116466',
    margin: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  moduleDesc: {
    fontSize: 14,
    color: '#D1E8E2',
    lineHeight: 20,
  },
});