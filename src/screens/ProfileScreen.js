import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../api/supabase';

const LANGUAGES = [
  { id: 'English', name: 'English', flag: '🇬🇧' },
  { id: 'Hindi', name: 'Hindi', flag: '🇮🇳' },
  { id: 'Spanish', name: 'Spanish', flag: '🇪🇸' },
  { id: 'French', name: 'French', flag: '🇫🇷' },
  { id: 'German', name: 'German', flag: '🇩🇪' },
  { id: 'Japanese', name: 'Japanese', flag: '🇯🇵' },
  { id: 'Mandarin', name: 'Mandarin', flag: '🇨🇳' },
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function ProfileScreen() {
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [proficiencyLevel, setProficiencyLevel] = useState('Beginner');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function fetchUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        if (data.target_language) setTargetLanguage(data.target_language);
        if (data.proficiency_level) setProficiencyLevel(data.proficiency_level);
      }
    } catch (err) {
      console.log('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePreferences() {
    setSaving(true);
    setMessage('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates = {
        id: user.id,
        target_language: targetLanguage,
        proficiency_level: proficiencyLevel,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(updates);

      if (error) throw error;
      setMessage('Preferences saved successfully! 🎉');
    } catch (err) {
      console.log('Error saving profile:', err);
      setMessage('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color="#FFCB9A" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.headerIcon}>⚙️</Text>
          <Text style={styles.headerTitle}>TUTOR PREFERENCES & GOALS</Text>
        </View>

        <Text style={styles.sectionSubtitle}>
          Choose the language you want to master and your current proficiency level to personalize your AI sessions.
        </Text>

        {/* Target Languages Grid (7 Languages) */}
        <Text style={styles.label}>Select Target Language</Text>
        <View style={styles.gridContainer}>
          {LANGUAGES.map((lang) => {
            const isSelected = targetLanguage === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
                onPress={() => setTargetLanguage(lang.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.flagEmoji}>{lang.flag}</Text>
                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Proficiency Levels */}
        <Text style={styles.label}>Select Proficiency Level</Text>
        <View style={styles.levelRow}>
          {LEVELS.map((lvl) => {
            const isSelected = proficiencyLevel === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                style={[styles.levelCard, isSelected && styles.selectedLevelCard]}
                onPress={() => setProficiencyLevel(lvl)}
                activeOpacity={0.8}
              >
                <Text style={[styles.levelText, isSelected && styles.selectedLevelText]}>
                  {lvl}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {message ? (
          <Text style={styles.messageText}>{message}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePreferences}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Preferences 🚀'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerLoader: {
    flex: 1,
    backgroundColor: '#0F1715',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#0F1715',
    minHeight: '100vh',
  },
  card: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#182C25',
    borderRadius: 24,
    padding: 30,
    borderWidth: 2,
    borderColor: '#116466',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    color: '#FFCB9A',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  sectionSubtitle: {
    color: '#D1E8E2',
    fontSize: 13,
    marginBottom: 24,
    lineHeight: 18,
  },
  label: {
    color: '#FFCB9A',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    flexBasis: '30%',
    flexGrow: 1,
    backgroundColor: '#0A1411',
    borderWidth: 1.5,
    borderColor: '#116466',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } : {}),
  },
  selectedOptionCard: {
    backgroundColor: 'rgba(255, 203, 154, 0.15)',
    borderColor: '#FFCB9A',
  },
  flagEmoji: {
    fontSize: 22,
  },
  optionText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#FFCB9A',
    fontWeight: 'bold',
  },
  levelRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  levelCard: {
    flex: 1,
    backgroundColor: '#0A1411',
    borderWidth: 1.5,
    borderColor: '#116466',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } : {}),
  },
  selectedLevelCard: {
    backgroundColor: 'rgba(255, 203, 154, 0.15)',
    borderColor: '#FFCB9A',
  },
  levelText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedLevelText: {
    color: '#FFCB9A',
    fontWeight: 'bold',
  },
  messageText: {
    color: '#4ADE80',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FFCB9A',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFCB9A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  saveButtonText: {
    color: '#121E1A',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
