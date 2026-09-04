// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function HomeScreen({ setActiveTab }) {
  return (
    <View style={styles.backgroundImage}>
      {/* Background Teal & Gold Glow Spheres */}
      <View style={styles.glowOrbCenter} />
      <View style={styles.glowOrbTopLeft} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Welcome Section */}
        <View style={styles.heroWelcome}>
          <Text style={styles.welcomeTitle}>Welcome Back, Creatorstack9@gmail.com!</Text>
          <TouchableOpacity 
            style={styles.resumeBtn}
            onPress={() => setActiveTab('AI Tutor')}
            activeOpacity={0.8}
          >
            <Text style={styles.resumeBtnText}>Resume My Last Lesson</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Grid */}
        <View style={styles.dashboardGrid}>
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.glassCard}>
              <Text style={styles.statLabel}>Lessons Completed</Text>
              <Text style={styles.statValue}>35/50</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressFill} />
              </View>
            </View>

            <View style={styles.glassCard}>
              <Text style={styles.statLabel}>Current Streak</Text>
              <Text style={styles.statValue}>🔥 7 Days</Text>
            </View>

            <View style={styles.glassCard}>
              <Text style={styles.statLabel}>Accuracy Score</Text>
              <Text style={styles.statValue}>92%</Text>
            </View>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresSubgrid}>
            <TouchableOpacity style={styles.featureItem} onPress={() => setActiveTab('AI Tutor')}>
              <Text style={styles.featureTitle}>✏️ 24/7 AI Grammar Tutor</Text>
              <Text style={styles.featureDesc}>Instant feedback on your writing.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => setActiveTab('Profile Settings')}>
              <Text style={styles.featureTitle}>🧠 Vocabulary Builder</Text>
              <Text style={styles.featureDesc}>Expand your word bank.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => setActiveTab('Grammar History')}>
              <Text style={styles.featureTitle}>📈 Writing History & Analysis</Text>
              <Text style={styles.featureDesc}>Track your progress over time.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => setActiveTab('AI Tutor')}>
              <Text style={styles.featureTitle}>🌍 Contextual Examples</Text>
              <Text style={styles.featureDesc}>Learn in real context.</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Bottom Activity & Quick Start */}
        <View style={styles.bottomGrid}>
          <View style={styles.glassCardWide}>
            <Text style={styles.sectionHeading}>Recent Activity Feed</Text>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>1. The sare your team is essied to grammar exercises.</Text>
              <Text style={styles.activityTime}>1 days ago</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>2. You use the tsit grammer exercises.</Text>
              <Text style={styles.activityTime}>1 days ago</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>3. Fhe wihy sransories don't head et .utoor exerclo this.</Text>
              <Text style={styles.activityTime}>1 days ago</Text>
            </View>
          </View>

          <View style={styles.glassCardWide}>
            <Text style={styles.sectionHeading}>Quick Start Tutor</Text>
            <Text style={styles.quickStartText}>Start a quick grammar check instantly with AI.</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>App version: info</Text>
          <TouchableOpacity onPress={() => setActiveTab('Profile Settings')}>
            <Text style={styles.footerTextActive}>Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: '#070D10',
  },
  glowOrbCenter: {
    position: 'absolute',
    top: '20%',
    left: '35%',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(17, 100, 102, 0.18)',
    zIndex: 0,
  },
  glowOrbTopLeft: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(219, 176, 140, 0.06)',
    zIndex: 0,
  },
  container: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    padding: 35,
    maxWidth: 1250,
    alignSelf: 'center',
    width: '100%',
  },
  heroWelcome: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 32,
    color: '#FFCB9A',
    marginBottom: 15,
    fontWeight: '400',
  },
  resumeBtn: {
    backgroundColor: 'rgba(219, 176, 140, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.35)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  resumeBtnText: {
    color: '#FFCB9A',
    fontSize: 14,
    fontWeight: '600',
  },
  dashboardGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  statsRow: {
    flex: 1.2,
    flexDirection: 'row',
    gap: 12,
  },
  featuresSubgrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  glassCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: 'rgba(12, 22, 20, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.18)',
    borderRadius: 14,
    padding: 16,
  },
  glassCardWide: {
    flex: 1,
    backgroundColor: 'rgba(12, 22, 20, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.18)',
    borderRadius: 14,
    padding: 20,
  },
  statLabel: {
    fontSize: 11,
    color: '#a0aec0',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    width: '70%',
    backgroundColor: '#FFCB9A',
    height: '100%',
  },
  featureItem: {
    width: '48%',
    backgroundColor: 'rgba(12, 22, 20, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.18)',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'center',
  },
  featureTitle: {
    color: '#FFCB9A',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 11,
    color: '#a0aec0',
  },
  bottomGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  sectionHeading: {
    fontSize: 14,
    color: '#FFCB9A',
    marginBottom: 12,
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  activityText: {
    fontSize: 11,
    color: '#cbd5e0',
  },
  activityTime: {
    fontSize: 10,
    color: '#718096',
  },
  quickStartText: {
    fontSize: 12,
    color: '#cbd5e0',
    marginTop: 5,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  footerText: {
    fontSize: 12,
    color: '#718096',
  },
  footerTextActive: {
    fontSize: 12,
    color: '#FFCB9A',
    fontWeight: '600',
  },
});
