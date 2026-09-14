import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../api/supabase';

const LANGUAGES = [
  { id: 'English', name: 'English', flag: 'ENG' },
  { id: 'Hindi', name: 'Hindi', flag: '🇮🇳' },
  { id: 'Spanish', name: 'Spanish', flag: 'SP' },
  { id: 'French', name: 'French', flag: 'FH' },
  { id: 'German', name: 'German', flag: 'GM' },
  { id: 'Japanese', name: 'Japanese', flag: '🇯🇵' },
  { id: 'Mandarin', name: 'Mandarin', flag: 'MD' },
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// Pre-defined Professions & Matching Avatar Emojis
const PROFESSIONS = [
  { id: 'Student', name: 'Student', emoji: '🎓' },
  { id: 'Software Engineer', name: 'Software Engineer', emoji: '💻' },
  { id: 'Doctor / Medical', name: 'Doctor / Medical', emoji: '🩺' },
  { id: 'Business / Entrepreneur', name: 'Business / Entrepreneur', emoji: '💼' },
  { id: 'Teacher / Educator', name: 'Teacher / Educator', emoji: '📚' },
  { id: 'Artist / Designer', name: 'Artist / Designer', emoji: '🎨' },
  { id: 'Other', name: 'Other', emoji:
    },
];

export default function ProfileScreen() {
  const [fullName, setFullName] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [proficiencyLevel, setProficiencyLevel] = useState('Beginner');
  const [professionCategory, setProfessionCategory] = useState('Student');
  const [avatarType, setAvatarType] = useState('🎓');
  
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

      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        if (data.full_name) setFullName(data.full_name);
        if (data.target_language) setTargetLanguage(data.target_language);
        if (data.proficiency_level) setProficiencyLevel(data.proficiency_level);
        if (data.profession_category) setProfessionCategory(data.profession_category);
        if (data.avatar_type) setAvatarType(data.avatar_type);
      }
    } catch (err) {
      console.log('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle profession selection and auto-assign matching avatar emoji
  function handleSelectProfession(prof) {
    setProfessionCategory(prof.name);
    setAvatarType(prof.emoji);
  }

  async function handleSavePreferences() {
    setSaving(true);
    setMessage('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates = {
        id: user.id,
        full_name: fullName,
        target_language: targetLanguage,
        proficiency_level: proficiencyLevel,
        profession_category: professionCategory,
        avatar_type: avatarType,
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
    <View style={styles.mainWrapper}>
      {Platform.OS === 'web' && (
        <div style={styles.bgImageWrapper}>
          <img src={require('../../assets/tutor_girl.png.png')} style={styles.bgImageStyle} alt="Background" />
          <div style={styles.bgOverlay} />
        </div>
      )}

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.headerIcon}>⚙️</Text>
            <Text style={styles.headerTitle}>TUTOR PREFERENCES & GOALS</Text>
          </View>

          {/* Profile Circle Avatar & Name Preview */}
          <View style={styles.profilePreviewContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>{avatarType || '🎓'}</Text>
            </View>
            <Text style={styles.profilePreviewName}>
              {fullName.trim() !== '' ? fullName : 'Your Name'}
            </Text>
            <Text style={styles.profilePreviewProfession}>
              {professionCategory}
            </Text>
          </View>

          <Text style={styles.sectionSubtitle}>
            Update your profile name, profession, avatar, and language preferences to personalize your AI sessions.
          </Text>

          {/* Profile Name Input */}
          <Text style={styles.label}>Profile Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#888888"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Profession & Avatar Selection */}
          <Text style={styles.label}>Select Profession & Avatar</Text>
          <View style={styles.gridContainer}>
            {PROFESSIONS.map((prof) => {
              const isSelected = professionCategory === prof.name;
              
              return (
                <TouchableOpacity
                  key={prof.id}
                  style={[
                    styles.optionCard,
                    isOther && styles.fullWidthCard,
                    isSelected && styles.selectedOptionCard,
                  ]}
                  onPress={() => handleSelectProfession(prof)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.flagEmoji}>{prof.emoji}</Text>
                  <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                    {prof.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Target Languages Grid */}
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
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    overflow: 'hidden',
  },
  bgImageStyle: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'none',
    transform: 'scale(1)',
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 21, 0.45)',
  },
  centerLoader: {
    flex: 1,
    backgroundColor: '#0F1715',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: '24px 16px',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: 'rgba(24, 44, 37, 0.95)',
    borderRadius: 24,
    padding: 30,
    borderWidth: 2,
    borderColor: '#116466',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7), 0 0 20px rgba(17, 100, 102, 0.2)',
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
  profilePreviewContainer: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: 'rgba(10, 20, 17, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#116466',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0A1411',
    borderWidth: 2.5,
    borderColor: '#FFCB9A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#FFCB9A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  avatarEmoji: {
    fontSize: 34,
  },
  profilePreviewName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profilePreviewProfession: {
    color: '#FFCB9A',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionSubtitle: {
    color: '#D1E8E2',
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18,
    textAlign: 'center',
  },
  label: {
    color: '#FFCB9A',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0A1411',
    borderWidth: 1.5,
    borderColor: '#116466',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 24,
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
    zIndex: 2,
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } : {}),
  },
  fullWidthCard: {
    flexBasis: '100%',
    width: '100%',
  },
  selectedOptionCard: {
    backgroundColor: 'rgba(255, 203, 154, 0.2)',
    borderColor: '#FFCB9A',
  },
  flagEmoji: {
    fontSize: 22,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
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
    zIndex: 2,
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } : {}),
  },
  selectedLevelCard: {
    backgroundColor: 'rgba(255, 203, 154, 0.2)',
    borderColor: '#FFCB9A50',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    ...(Platform.OS === 'web' ? { cursor: 'pointer', border: 'none' } : {}),
  },
  saveButtonText: {
    color: '#121E1A',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
