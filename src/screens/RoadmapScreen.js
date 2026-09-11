import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function RoadmapScreen({ onSelectDay }) {
  const daysList = Array.from({ length: 60 }, (_, i) => ({
    day: i + 1,
    title: i === 0 ? 'Introduction & Basic Greetings' : i === 1 ? 'Daily Conversational Phrases' : `Masterclass Module ${i + 1}`,
    unlocked: i < 5, // First 5 days preview unlocked
  }));

  return (
    <div style={styles.pageWrapper}>
      {/* Background Image Layer matching the rest of the project */}
      <div style={styles.bgImageLayer} />
      <div style={styles.darkOverlay} />

      <ScrollView contentContainerStyle={styles.container}>
        <div style={styles.headerBox}>
          <span style={styles.badge}>🎯 YOUR 60-DAY FLUENCY ROADMAP</span>
          <h1 style={styles.title}>Your Daily Masterclass Curriculum</h1>
          <p style={styles.subtitle}>Complete each daily session with your AI Tutor to unlock rapid conversational fluency.</p>
        </div>

        <div style={styles.grid}>
          {daysList.map((item) => (
            <div 
              key={item.day} 
              style={{ 
                ...styles.dayCard, 
                opacity: item.unlocked ? 1 : 0.6,
                borderColor: item.unlocked ? '#116466' : 'rgba(255,255,255,0.05)' 
              }}
              onClick={() => item.unlocked && onSelectDay(item.day)}
            >
              <div style={styles.dayBadge}>Day {item.day}</div>
              <div style={styles.dayTitle}>{item.title}</div>
              <div style={styles.statusText}>
                {item.unlocked ? '🟢 Start Session' : '🔒 Locked'}
              </div>
            </div>
          ))}
        </div>
      </ScrollView>
    </div>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    overflow: 'hidden',
  },
  bgImageLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url(/assets/tutor_girl.png.png)', // Project's main background image
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(4px)',
    transform: 'scale(1.05)',
    zIndex: 0,
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 13, 16, 0.88)', // Deep immersive tint
    zIndex: 1,
  },
  container: {
    position: 'relative',
    zIndex: 2,
    padding: '40px 20px',
    alignItems: 'center',
    minHeight: '100vh',
  },
  headerBox: {
    textAlign: 'center',
    marginBottom: '30px',
    maxWidth: '700px',
  },
  badge: {
    color: '#FFCB9A',
    backgroundColor: 'rgba(255, 203, 154, 0.1)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    border: '1px solid rgba(255, 203, 154, 0.3)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: '28px',
    fontWeight: '900',
    marginTop: '16px',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#8FA39D',
    fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
    maxWidth: '1000px',
    width: '100%',
  },
  dayCard: {
    backgroundColor: 'rgba(24, 44, 37, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    padding: '20px',
    border: '1.5px solid #116466',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  dayBadge: {
    color: '#FFCB9A',
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '6px',
  },
  dayTitle: {
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: 'bold',
    marginBottom: '14px',
    lineHeight: '20px',
  },
  statusText: {
    color: '#D1E8E2',
    fontSize: '12px',
    fontWeight: '600',
  },
});
