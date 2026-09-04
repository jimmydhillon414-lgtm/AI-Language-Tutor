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

      {/* Multilingual Floating Words */}
      <View style={styles.floatingWordsContainer} pointerEvents="none">
        <Text style={[styles.floatWord, { top: '10%', left: '8%', transform: [{ rotate: '-12deg' }] }]}>Hello</Text>
        <Text style={[styles.floatWord, { top: '22%', right: '10%', transform: [{ rotate: '15deg' }] }]}>सत ਸ੍ਰੀ ਅਕਾਲ</Text>
        <Text style={[styles.floatWord, { top: '40%', left: '5%', transform: [{ rotate: '8deg' }] }]}>Bonjour</Text>
        <Text style={[styles.floatWord, { top: '60%', right: '12%', transform: [{ rotate: '-8deg' }] }]}>Hola</Text>
        <Text style={[styles.floatWord, { top: '78%', left: '12%', transform: [{ rotate: '18deg' }] }]}>Guten Tag</Text>
        <Text style={[styles.floatWord, { top: '88%', right: '10%', transform: [{ rotate: '-5deg' }] }]}>Ciao</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Welcome Dashboard Header */}
        <View style={styles.heroWelcome}>
          <h1>Welcome to AI Grammar Tutor</h1>
          <p style={{color: '#D1E8E2', fontSize: '15px', marginBottom: '15px'}}>Experience real-time AI conversations, instant smart grammar corrections, and immersive voice tuition.</p>
          <TouchableOpacity 
            style={styles.resumeBtn}
            onPress={() => navigation.navigate('TutorChat')}
            activeOpacity={0.8}
          >
            <Text style={styles.resumeBtnText}>Resume My Last Lesson / Free Trial</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Grid: Stats & Features matching image layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', marginBottom: '25px' }}>
          
          {/* Left Stats Column */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            <div className="glass-card stat-box" style={styles.glassCard}>
              <h4 style={{fontSize: '12px', color: '#a0aec0', marginBottom: '10px'}}>Lessons Completed</h4>
              <div style={{fontSize: '18px', color: '#fff', fontWeight: 'bold'}}>35/50</div>
              <div style={{width: '100%', background: 'rgba(255, 255, 255, 0.1)', height: '6px', borderRadius: '3px', marginTop: '10px', overflow: 'hidden'}}>
                <div style={{width: '70%', background: '#FFCB9A', height: '100%'}}></div>
              </div>
            </div>
            
            <div className="glass-card stat-box" style={styles.glassCard}>
              <h4 style={{fontSize: '12px', color: '#a0aec0', marginBottom: '10px'}}>Current Streak</h4>
              <div style={{fontSize: '18px', color: '#fff', fontWeight: 'bold'}}>🔥 7 Days</div>
            </div>

            <div className="glass-card stat-box" style={styles.glassCard}>
              <h4 style={{fontSize: '12px', color: '#a0aec0', marginBottom: '10px'}}>Accuracy Score</h4>
              <div style={{fontSize: '18px', color: '#fff', fontWeight: 'bold'}}>92%</div>
            </div>
          </div>

          {/* Right Features Subgrid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate('TutorChat')} activeOpacity={0.8}>
              <h5 style={{color: '#FFCB9A', fontSize: '14px', marginBottom: '6px'}}>✏️ 24/7 AI Grammar Tutor</h5>
              <p style={{fontSize: '11px', color: '#a0aec0', margin: 0}}>Instant feedback on your writing.</p>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
              <h5 style={{color: '#FFCB9A', fontSize: '14px', marginBottom: '6px'}}>🧠 Vocabulary Builder</h5>
              <p style={{fontSize: '11px', color: '#a0aec0', margin: 0}}>Expand your word bank.</p>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate('History')} activeOpacity={0.8}>
              <h5 style={{color: '#FFCB9A', fontSize: '14px', marginBottom: '6px'}}>📈 Writing History</h5>
              <p style={{fontSize: '11px', color: '#a0aec0', margin: 0}}>Track your progress over time.</p>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate('TutorChat')} activeOpacity={0.8}>
              <h5 style={{color: '#FFCB9A', fontSize: '14px', marginBottom: '6px'}}>🌍 Contextual Examples</h5>
              <p style={{fontSize: '11px', color: '#a0aec0', margin: 0}}>Learn grammar in real context.</p>
            </TouchableOpacity>
          </div>

        </div>

        {/* Bottom Section: Activity Feed & Quick Start */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '25px', marginBottom: '30px' }}>
          
          <div style={styles.glassCard}>
            <h3 style={{fontSize: '15px', color: '#FFCB9A', marginBottom: '15px', fontWeight: '500'}}>Recent Activity Feed</h3>
            <div style={styles.activityItem}>
              <span>1. The sare your team is essied to grammar exercises.</span>
              <span style={{color: '#718096'}}>1 days ago</span>
            </div>
            <div style={styles.activityItem}>
              <span>2. You use the tsit grammer exercises.</span>
              <span style={{color: '#718096'}}>1 days ago</span>
            </div>
            <div style={styles.activityItem}>
              <span>3. Fhe wihy sransories don't head et .utoor exerclo this.</span>
              <span style={{color: '#718096'}}>1 days ago</span>
            </div>
          </div>

          <div style={styles.glassCard}>
            <h3 style={{fontSize: '15px', color: '#FFCB9A', marginBottom: '15px', fontWeight: '500'}}>Quick Start Tutor</h3>
            <div style={{fontSize: '13px', color: '#cbd5e0', marginTop: '10px'}}>
              Start a quick grammar check instantly with your Pro trial or session workspace.
            </div>
          </div>

        </div>

        {/* Footer info matching image style */}
        <View style={styles.footerInfo}>
          <Text style={{fontSize: '12px', color: '#718096'}}>App version: info</Text>
          <Text style={{fontSize: '12px', color: '#718096'}}>Upgrade to Pro</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: '#0F1A18',
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
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  heroWelcome: {
    marginBottom: 30,
  },
  resumeBtn: {
    backgroundColor: 'rgba(217, 176, 140, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(217, 176, 140, 0.4)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  resumeBtnText: {
    color: '#FFCB9A',
    fontWeight: '600',
    fontSize: 14,
  },
  glassCard: {
    backgroundColor: 'rgba(17, 30, 27, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.15)',
    borderRadius: 14,
    padding: 20,
  },
  featureItem: {
    backgroundColor: 'rgba(17, 30, 27, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.15)',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    color: '#cbd5e0',
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 5,
  }
});
