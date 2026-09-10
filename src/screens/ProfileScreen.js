import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
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
      source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop' }} 
      style={styles.backgroundImage}
    >
      <View style={styles.darkOverlay} />
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Top AI Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.aiBadge}>
            <Text style={{ fontSize: 12 }}>⚡</Text>
            <Text style={styles.aiBadgeText}>SOLARIN NEURAL TUTOR</Text>
          </View>
          
          <Text style={styles.heroTitle}>Master {userProfile.target_language || 'Languages'} with AI</Text>
          <Text style={styles.heroSubtitle}>
            Your personal 1-on-1 voice & chat coach designed for rapid fluency at a {userProfile.proficiency_level || 'Beginner'} level.
          </Text>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('TutorChat')}
          >
            <Text style={styles.primaryButtonText}>Start Live AI Session 🎙️</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stat Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statTitle}>Target Language</Text>
            <Text style={styles.statValue}>{userProfile.target_language || 'English'}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statTitle}>Current Level</Text>
            <Text style={styles.statValue}>{userProfile.proficiency_level || 'Beginner'}</Text>
          </View>
        </View>

        {/* Action Navigation */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.secondaryButtonText}>📊 View Learning History</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.secondaryButtonText}>⚙️ Update Tutor Preferences</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#121E1A',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 30, 26, 0.90)',
  },
  container: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
    zIndex: 1,
  },
  heroCard: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#182C25',
    borderRadius: 20,
    padding: 28,
    borderWidth: 2,
    borderColor: '#116466',
    shadowColor: '#FFCB9A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#116466',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCB9A',
    marginBottom: 16,
  },
  aiBadgeText: {
    color: '#FFCB9A',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    color: '#D1E8E2',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#FFCB9A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#FFCB9A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#121E1A',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  gridContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 600,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#182C25',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 6,
    borderWidth: 1.5,
    borderColor: '#116466',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statTitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFCB9A',
    fontSize: 15,
    fontWeight: 'bold',
  },
  actionSection: {
    width: '100%',
    maxWidth: 600,
  },
  secondaryButton: {
    backgroundColor: '#182C25',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#116466',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#D1E8E2',
    fontSize: 14,
    fontWeight: '600',
  },
});
