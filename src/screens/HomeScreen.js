import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
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
    <View style={styles.mainWrapper}>
      {/* Background Image Layer */}
      {Platform.OS === 'web' && (
        <div style={styles.bgImageWrapper}>
          <img src={require('../../assets/tutor_girl.png.png')} style={styles.bgImageStyle} alt="Background" />
          <div style={styles.bgOverlay} />
        </div>
      )}

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={true}>
        {/* Play Store Style Trust & Rating Header Banner */}
        <div style={styles.trustBanner}>
          <div style={styles.trustBadgeItem}>
            <span style={styles.trustValue}></span>
            <span style={styles.trustLabel}></span>
          </div>
          <div style={styles.trustDivider} />
          <div style={styles.trustBadgeItem}>
            <span style={styles.trustValue}>24/7</span>
            <span style={styles.trustValue}>★Personal AI Tutor ★</span>
          </div>
          <div style={styles.trustDivider} />
          <div style={styles.trustBadgeItem}>
            <span style={styles.trustValue}></span>
            <span style={styles.trustLabel}></span>
          </div>
        </div>

        {/* Main Hero Card */}
        <div style={styles.heroCard}>
          <div style={styles.aiIllustrationContainer}>
            <Image 
              source={require('../../assets/tutor_girl.png.png')} 
              style={styles.tutorHDImage} 
            />
          </div>

          <div style={styles.aiBadge}>
            <span style={{ fontSize: '12px' }}>⚡</span>
            <span style={styles.aiBadgeText}>INDIA'S NO.1 SPOKEN AI COACH</span>
          </div>
          
          <h1 style={styles.heroTitle}>
            Master <span style={{ color: '#FFCB9A' }}>{userProfile.target_language || 'English'}</span> Fast with AI
          </h1>
          
          <View style={styles.heroCenteredContainer}>
            <Text style={styles.heroSubtitleStylish}>
              Your personal 1-on-1 voice & chat companion engineered for rapid fluency at a{' '}
              <Text style={styles.highlightBadge}>
                {userProfile.proficiency_level || 'Beginner'}
              </Text>{' '}
              level.
            </Text>
          </View>
        </div>

        {/* Interactive AI Tutor Video Demonstration */}
        <div style={styles.videoSectionCard}>
          <div style={styles.videoHeaderRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🤖</span>
              <span style={styles.videoBadgeTitle}>LIVE AI TUTOR PREVIEW</span>
            </div>
            <div style={styles.liveBadgeContainer}>
              <span style={styles.liveDot}>●</span>
              <span style={styles.liveIndicator}>READY</span>
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
                preload="auto"
              >
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
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
            Watch how Solarin analyzes your accent, gives instant grammar feedback, and adapts daily lessons to your pace.
          </p>
        </div>

        {/* 🌟 4 Horizontal Advantage Boxes in a Single Row */}
        <div style={styles.advantagesSection}>
          <div style={styles.advantagesHeader}>
            <span style={{ fontSize: '16px' }}>💎</span>
            <span style={styles.advantagesHeaderText}>WHY LEARN WITH SOLARIN AI</span>
          </div>

          <div style={styles.horizontalRow}>
            <div style={styles.horizontalSquareCard}>
              <span style={styles.cardEmoji}>🎯</span>
              <h3 style={styles.cardTitle}>Instant Correction</h3>
              <p style={styles.cardText}>Real-time feedback on your pronunciation & grammar.</p>
            </div>

            <div style={styles.horizontalSquareCard}>
              <span style={styles.cardEmoji}>🛡️</span>
              <h3 style={styles.cardTitle}>Zero Judgement</h3>
              <p style={styles.cardText}>Practice stress-free without any hesitation.</p>
            </div>

            <div style={styles.horizontalSquareCard}>
              <span style={styles.cardEmoji}>📈</span>
              <h3 style={styles.cardTitle}>Adaptive Pace</h3>
              <p style={styles.cardText}>Lessons automatically scale to your speed.</p>
            </div>

            <div style={styles.horizontalSquareCard}>
              <span style={styles.cardEmoji}>⚡</span>
              <h3 style={styles.cardTitle}>Rapid Fluency</h3>
              <p style={styles.cardText}>Focus entirely on real-world spoken vocabulary.</p>
            </div>
          </div>
        </div>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: '#0F1715',
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
    filter: 'blur(3px)', 
    transform: 'scale(1.05)',
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 21, 0.82)',
  },
  container: {
    padding: '24px 16px 60px 16px',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  trustBanner: {
    width: '100%',
    maxWidth: '820px',
    backgroundColor: '#182C25',
    borderRadius: '16px',
    padding: '14px 20px',
    border: '1.5px solid #116466',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: '20px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  trustBadgeItem: {
    alignItems: 'center',
  },
  trustValue: {
    color: '#FFCB9A',
    fontSize: '16px',
    fontWeight: '900',
    marginBottom: '2px',
  },
  trustLabel: {
    color: '#94A3B8',
    fontSize: '11px',
    fontWeight: '500',
  },
  trustDivider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#116466',
  },
  heroCard: {
    width: '100%',
    maxWidth: '820px',
    backgroundColor: '#182C25',
    borderRadius: '24px',
    padding: '36px 30px',
    border: '2px solid #116466',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7), 0 0 20px rgba(17, 100, 102, 0.2)',
    alignItems: 'center',
    marginBottom: '24px',
    textAlign: 'center',
  },
  aiIllustrationContainer: {
    width: '100%',
    height: '320px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    overflow: 'hidden',
    borderRadius: '16px',
    backgroundColor: '#0A1411',
  },
  tutorHDImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: '16px',
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
  heroCenteredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  heroSubtitleStylish: {
    fontSize: 15,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.3,
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  highlightBadge: {
    color: '#FFCB9A',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 203, 154, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  videoSectionCard: {
    width: '100%',
    maxWidth: '820px',
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
    outlineStyle: 'none',
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
  /* 🌟 4 Horizontal Square Cards in a Single Row */
  advantagesSection: {
    width: '100%',
    maxWidth: '820px',
  },
  advantagesHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
    paddingLeft: '4px',
  },
  advantagesHeaderText: {
    color: '#FFCB9A',
    fontSize: '12px',
    fontWeight: '900',
    letterSpacing: '1.2px',
  },
  horizontalRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    width: '100%',
  },
  horizontalSquareCard: {
    flex: 1,
    backgroundColor: '#182C25',
    borderRadius: '18px',
    padding: '16px 12px',
    border: '1.5px solid #116466',
    boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minHeight: '150px',
  },
  cardEmoji: {
    fontSize: '22px',
    marginBottom: '10px',
    backgroundColor: 'rgba(17, 100, 102, 0.3)',
    padding: '8px',
    borderRadius: '10px',
    border: '1px solid #116466',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '800',
    marginBottom: '4px',
  },
  cardText: {
    color: '#94A3B8',
    fontSize: '11px',
    lineHeight: '15px',
  },
});
