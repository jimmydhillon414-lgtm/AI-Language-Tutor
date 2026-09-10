import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Platform,
} from 'react-native';
import { supabase } from '../api/supabase';

export default function HomeScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState({
    target_language: 'English',
    proficiency_level: 'Beginner',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.log('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop' }} 
      style={styles.backgroundImage}
    >
      <div style={styles.darkOverlay} />
      
      {/* Top Floating Navbar */}
      <nav style={styles.navBar}>
        <div style={styles.logoContainer}>
          <span style={{ fontSize: '20px' }}>⚡</span>
          <span style={styles.logoText}>SOLARIN AI</span>
        </div>
        <div style={styles.navLinks}>
          <button style={styles.navLinkBtn} onClick={() => navigation.navigate('History')}>Analytics</button>
          <button style={styles.navLinkBtn} onClick={() => navigation.navigate('Profile')}>Settings</button>
        </div>
      </nav>

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Hero Section with Glowing Neon Border */}
        <div style={styles.heroCard}>
          <div style={styles.aiBadge}>
            <span style={{ fontSize: '12px' }}>⚡</span>
            <span style={styles.aiBadgeText}>NEXT-GEN NEURAL LANGUAGE COACH</span>
          </div>
          
          <h1 style={styles.heroTitle}>
            Master <span style={{ color: '#FFCB9A' }}>{userProfile.target_language || 'English'}</span> with Real-Time AI
          </h1>
          <p style={styles.heroSubtitle}>
            Experience immersive voice interaction, instant grammar corrections, and custom adaptive paths engineered for rapid fluency at a <span style={{ color: '#FFCB9A', fontWeight: 'bold' }}>{userProfile.proficiency_level || 'Beginner'}</span> level.
          </p>

          <div style={styles.heroBtnGroup}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('TutorChat')}
            >
              <Text style={styles.primaryButtonText}>Launch Live AI Session 🎙️</Text>
            </TouchableOpacity>
          </div>
        </div>

        {/* Trendy AI Avatar / Video Showcase Section (Fixed & Working MP4 Stream) */}
        <div style={styles.videoSectionCard}>
          <div style={styles.videoHeaderRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🤖</span>
              <span style={styles.videoBadgeTitle}>LIVE AI TUTOR DEMONSTRATION</span>
            </div>
            <div style={styles.liveBadgeContainer}>
              <span style={styles.liveDot}>●</span>
              <span style={styles.liveIndicator}>AI ACTIVE</span>
            </div>
          </div>
          
          <div style={styles.videoWrapper}>
            {Platform.OS === 'web' ? (
              <video 
                style={styles.videoPlayer}
                controls
                autoPlay
                muted
                loop
                playsInline
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <View style={styles.videoPlaceholder}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>▶️</Text>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Interactive AI Preview</Text>
              </View>
            )}
          </div>
          <p style={styles.videoDescription}>
            Watch how Solarin listens to your voice input, detects pronunciation accents, and replies instantly with natural neural synthesis.
          </p>
        </div>

        {/* Dynamic Metric Grid */}
        <div style={styles.gridContainer}>
          <div style={styles.statCard} onClick={() => navigation.navigate('Profile')}>
            <span style={styles.statIcon}>🎯</span>
            <span style={styles.statTitle}>Target Language</span>
            <span style={styles.statValue}>{userProfile.target_language || 'English'}</span>
          </div>

          <div style={styles.statCard} onClick={() => navigation.navigate('Profile')}>
            <span style={styles.statIcon}>📈</span>
            <span style={styles.statTitle}>Proficiency Level</span>
            <span style={styles.statValue}>{userProfile.proficiency_level || 'Beginner'}</span>
          </div>
        </div>

        {/* Quick Action Navigation Deck */}
        <div style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.secondaryButtonText}>📊 View Detailed Progress & Session Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.secondaryButtonText}>⚙️ Configure Learning Preferences & Goals</Text>
          </TouchableOpacity>
        </div>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#121E1A',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18, 30, 26, 0.93)',
    zIndex: 0,
  },
  navBar: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 32px',
    borderBottom: '1px solid rgba(17, 100, 102, 0.3)',
    backgroundColor: 'rgba(24, 44, 37, 0.7)',
    backdropFilter: 'blur(10px)',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: '900',
    letterSpacing: '1.5px',
  },
  navLinks: {
    display: 'flex',
    gap: '12px',
  },
  navLinkBtn: {
    backgroundColor: 'transparent',
    color: '#D1E8E2',
    border: '1.5px solid #116466',
    padding: '6px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  container: {
    padding: '24px 16px',
    alignItems: 'center',
    zIndex: 1,
    position: 'relative',
  },
  heroCard: {
    width: '100%',
    maxWidth: '720px',
    backgroundColor: '#182C25',
    borderRadius: '24px',
    padding: '36px 30px',
    border: '2px solid #116466',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7), 0 0 20px rgba(17, 100, 102, 0.2)',
    alignItems: 'center',
    marginBottom: '24px',
    textAlign: 'center',
  },
  aiBadge: {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#116466',
    padding: '6px 14px',
    borderRadius: '14px',
    border: '1px solid #FFCB9A',
    marginBottom: '18px',
  },
  aiBadgeText: {
    color: '#FFCB9A',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1.5px',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: '32px',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: '12px',
    lineHeight: '1.2',
  },
  heroSubtitle: {
    color: '#D1E8E2',
    fontSize: '15px',
    textAlign: 'center',
    lineHeight: '22px',
    marginBottom: '28px',
    maxWidth: '600px',
  },
  heroBtnGroup: {
    width: '100%',
    maxWidth: '380px',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#FFCB9A',
    paddingVertical: '16px',
    borderRadius: '14px',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFCB9A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    cursor: 'pointer',
    border: 'none',
  },
  primaryButtonText: {
    color: '#121E1A',
    fontSize: '16px',
    fontWeight: '800',
    letterSpacing: '0.5px',
  },
  videoSectionCard: {
    width: '100%',
    maxWidth: '720px',
    backgroundColor: '#182C25',
    borderRadius: '24px',
    padding: '24px',
    border: '2px solid #116466',
    marginBottom: '24px',
    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
  },
  videoHeaderRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  videoBadgeTitle: {
    color: '#FFCB9A',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1.2px',
  },
  liveBadgeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    padding: '4px 10px',
    borderRadius: '8px',
    border: '1px solid rgba(74, 222, 128, 0.3)',
  },
  liveDot: {
    color: '#4ADE80',
    fontSize: '10px',
  },
  liveIndicator: {
    color: '#4ADE80',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  videoWrapper: {
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#0A1411',
    border: '1.5px solid #116466',
  },
  videoPlayer: {
    width: '100%',
    height: '280px',
    objectFit: 'cover',
    display: 'block',
  },
  videoPlaceholder: {
    height: '240px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDescription: {
    color: '#D1E8E2',
    fontSize: '13px',
    marginTop: '12px',
    textAlign: 'center',
    lineHeight: '18px',
  },
  gridContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    maxWidth: '720px',
    gap: '16px',
    marginBottom: '20px',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#182C25',
    borderRadius: '18px',
    padding: '20px',
    border: '1.5px solid #116466',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
  },
  statIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  statTitle: {
    color: '#94A3B8',
    fontSize: '12px',
    marginBottom: '4px',
    fontWeight: '500',
  },
  statValue: {
    color: '#FFCB9A',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  actionSection: {
    width: '100%',
    maxWidth: '720px',
  },
  secondaryButton: {
    backgroundColor: '#182C25',
    paddingVertical: '16px',
    paddingHorizontal: '20px',
    borderRadius: '16px',
    border: '1.5px solid #116466',
    alignItems: 'center',
    marginBottom: '14px',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
  },
  secondaryButtonText: {
    color: '#D1E8E2',
    fontSize: '14px',
    fontWeight: '600',
  },
});
