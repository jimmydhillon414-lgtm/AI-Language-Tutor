import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.backgroundImage}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <Text style={styles.logoText}>SIRIN LABS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.navLink}>
            <Text style={styles.navLinkTextActive}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('TutorChat')} style={styles.navLink}>
            <Text style={styles.navLinkText}>AI Tutor</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.navLink}>
            <Text style={styles.navLinkText}>Grammar History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.navLink}>
            <Text style={styles.navLinkText}>Profile Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navRight}>
          <TouchableOpacity 
            style={styles.btnLogin}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.btnLoginText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.btnSignup}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.btnSignupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Glow & Sphere Background Elements */}
      <View style={styles.glowOrb1} />
      <View style={styles.glowOrb2} />
      <View style={styles.centerSphereContainer}>
        <View style={styles.sphereOuterRing}>
          <View style={styles.sphereInnerCore} />
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Welcome Section */}
        <View style={styles.heroWelcome}>
          <Text style={styles.welcomeTitle}>Welcome Back, Creatorstack9@gmail.com!</Text>
          <TouchableOpacity 
            style={styles.resumeBtn}
            onPress={() => navigation.navigate('TutorChat')}
            activeOpacity={0.8}
          >
            <Text style={styles.resumeBtnText}>Resume My Last Lesson</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Grid: Stats & Features */}
        <View style={styles.dashboardGrid}>
          
          {/* Left Stats Row */}
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

          {/* Right Features Grid */}
          <View style={styles.featuresSubgrid}>
            <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate('TutorChat')}>
              <Text style={styles.featureTitle}>✏️ 24/7 AI Grammar Tutor</Text>
              <Text style={styles.featureDesc}>Instant feedback on your writing.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.featureTitle}>🧠 Vocabulary Builder</Text>
              <Text style={styles.featureDesc}>Expand your word bank.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate('History')}>
              <Text style={styles.featureTitle}>📈 Writing History & Analysis</Text>
              <Text style={styles.featureDesc}>Track your progress over time.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate('TutorChat')}>
              <Text style={styles.featureTitle}>🌍 Contextual Examples</Text>
              <Text style={styles.featureDesc}>Learn in real context.</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Bottom Section */}
        <View style={styles.bottomGrid}>
          <View style={styles.glassCard}>
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

          <View style={styles.glassCard}>
            <Text style={styles.sectionHeading}>Quick Start Tutor</Text>
            <Text style={styles.quickStartText}>Start a quick grammar check.</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>App version: info</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
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
    backgroundColor: '#121a17',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: 'rgba(18, 26, 23, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(219, 176, 140, 0.15)',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
  logoText: {
    color: '#FFCB9A',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 2,
    marginRight: 10,
  },
  navLink: {
    paddingVertical: 5,
  },
  navLinkText: {
    color: '#D1E8E2',
    fontSize: 14,
  },
  navLinkTextActive: {
    color: '#FFCB9A',
    fontSize: 14,
    fontWeight: '600',
  },
  navRight: {
    flexDirection: 'row',
    gap: 12,
  },
  btnLogin: {
    borderWidth: 1,
    borderColor: '#116466',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnLoginText: {
    color: '#D1E8E2',
    fontSize: 14,
  },
  btnSignup: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnSignupText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  glowOrb1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(18, 102, 102, 0.15)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(217, 176, 140, 0.05)',
  },
  centerSphereContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
    opacity: 0.3,
  },
  sphereOuterRing: {
    width: 400,
    height: 400,
    borderRadius: 200,
    borderWidth: 2,
    borderColor: '#116466',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 100, 102, 0.05)',
  },
  sphereInnerCore: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#0A2E2C',
    borderWidth: 1.5,
    borderColor: '#D9B08C',
  },
  container: {
    flex: 1,
    zIndex: 2,
  },
  content: {
    padding: 30,
    maxWidth: 1200,
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
    backgroundColor: 'rgba(219, 176, 140, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.4)',
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
    backgroundColor: 'rgba(17, 30, 27, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.15)',
    borderRadius: 12,
    padding: 16,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1),',
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
    backgroundColor: 'rgba(17, 30, 27, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.15)',
    borderRadius: 12,
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
    paddingVertical: 6,
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
