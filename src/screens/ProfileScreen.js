import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Italian'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [targetLang, setTargetLang] = useState('English');
  const [level, setLevel] = useState('Beginner');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // .single() ki jagah .maybeSingle() use karein taaki row na hone par 406 error na aaye
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTargetLang(data.target_language || 'English');
        setLevel(data.proficiency_level || 'Beginner');
      }
    } catch (err) {
      console.log('Error loading profile:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          target_language: targetLang,
          proficiency_level: level,
          updated_at: new Date(),
        });

      if (error) throw error;
      alert('Preferences saved!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner} />
      </div>
    );
  }

  return (
    <div style={styles.backgroundImage}>
      <div style={styles.darkOverlay} />

      <div style={styles.container}>
        <h1 style={styles.heading}>Language Tutor Preferences</h1>

        <label style={styles.label}>Target Language:</label>
        <div style={styles.row}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              style={{
                ...styles.chip,
                ...(targetLang === lang && styles.activeChip)
              }}
              onClick={() => setTargetLang(lang)}
            >
              <span style={{
                ...styles.chipText,
                ...(targetLang === lang && styles.activeChipText)
              }}>
                {lang}
              </span>
            </button>
          ))}
        </div>

        <label style={styles.label}>Proficiency Level:</label>
        <div style={styles.row}>
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              style={{
                ...styles.chip,
                ...(level === lvl && styles.activeChip)
              }}
              onClick={() => setLevel(lvl)}
            >
              <span style={{
                ...styles.chipText,
                ...(level === lvl && styles.activeChipText)
              }}>
                {lvl}
              </span>
            </button>
          ))}
        </div>

        <button 
          style={styles.saveBtn} 
          onClick={saveProfile} 
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  backgroundImage: {
    minHeight: '100vh',
    backgroundImage: 'url("https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1920&auto=format&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: '#121619',
    position: 'relative',
    overflowX: 'hidden',
    padding: '24px 16px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(14, 18, 22, 0.86)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  loaderContainer: {
    minHeight: '100vh',
    backgroundColor: '#121619',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(224, 180, 134, 0.2)',
    borderTop: '4px solid #E0B486',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'rgba(15, 23, 26, 0.92)',
    borderRadius: '16px',
    padding: '24px',
    border: '1.5px solid #1a3536',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  heading: { 
    color: '#ffffff', 
    fontSize: '24px', 
    fontWeight: '800', 
    marginBottom: '20px', 
    marginTop: '10px' 
  },
  label: { 
    color: '#E0B486', 
    fontSize: '15px', 
    fontWeight: '700',
    marginTop: '20px', 
    marginBottom: '10px',
    display: 'block' 
  },
  row: { 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: '10px',
    marginBottom: '10px'
  },
  chip: { 
    backgroundColor: 'rgba(15, 23, 26, 0.9)', 
    padding: '10px 18px', 
    borderRadius: '12px',
    border: '1.5px solid #1a3536',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeChip: { 
    backgroundColor: '#163838',
    borderColor: '#225d5f',
  },
  chipText: { 
    color: '#9fb4ad', 
    fontSize: '14px',
    fontWeight: '600'
  },
  activeChipText: { 
    color: '#ffffff', 
    fontWeight: 'bold' 
  },
  saveBtn: { 
    backgroundColor: '#E0B486', 
    color: '#121619',
    padding: '14px', 
    borderRadius: '12px', 
    border: 'none',
    fontWeight: '700', 
    fontSize: '16px',
    cursor: 'pointer', 
    width: '100%',
    marginTop: '30px',
    transition: 'opacity 0.2s',
  },
};