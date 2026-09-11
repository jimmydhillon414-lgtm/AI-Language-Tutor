import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';

export default function RoadmapScreen({ selectedPlan, onSelectDay, onBack }) {
  // Determine total days based on the selected plan
  const totalDays = selectedPlan === 'Free Demo' ? 1 : selectedPlan === 'Base Starter' ? 30 : 60;

  const daysList = Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    title: i === 0 ? 'Introduction & Basic Greetings' : i === 1 ? 'Daily Conversational Phrases' : `Masterclass Module ${i + 1}`,
    unlocked: true, // All days under the purchased/selected plan are unlocked
  }));

  return (
    <View style={styles.mainWrapper}>
      {/* Background Image Layer */}
      {Platform.OS === 'web' && (
        <div style={styles.bgImageWrapper}>
          <img src="/assets/tutor_girl.png.png" style={styles.bgImageStyle} alt="Background" />
          <div style={styles.bgOverlay} />
        </div>
      )}

      {/* Top Navigation Bar with Back Button */}
      <View style={styles.topBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
            <Text style={styles.backButtonText}>← Back to Plans</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.planIndicator}>Active Plan: <Text style={{color: '#FFCB9A'}}>{selectedPlan || '60-Day Pro Master'}</Text></Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.badge}>🎯 YOUR FLUENCY ROADMAP ({totalDays} Days)</Text>
          <Text style={styles.title}>Your Daily Masterclass Curriculum</Text>
          <Text style={styles.subtitle}>Complete each daily session with your AI Tutor to unlock rapid conversational fluency.</Text>
        </View>

        <View style={styles.grid}>
          {daysList.map((item) => (
            <TouchableOpacity 
              key={item.day} 
              style={[
                styles.dayCard, 
                { 
                  opacity: item.unlocked ? 1 : 0.6,
                  borderColor: item.unlocked ? '#116466' : 'rgba(255,255,255,0.05)',
                }
              ]}
              disabled={!item.unlocked}
              onPress={() => item.unlocked && onSelectDay(item.day)}
              activeOpacity={0.8}
            >
              <Text style={styles.dayBadge}>Day {item.day}</Text>
              <Text style={styles.dayTitle}>{item.title}</Text>
              <Text style={styles.statusText}>
                {item.unlocked ? '🟢 Start Session' : '🔒 Locked'}
              </Text>
            </TouchableOpacity>
          ))}
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
    backgroundColor: '#070D10',
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
    filter: 'blur(6px)',
    transform: 'scale(1.05)',
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(7, 13, 16, 0.75)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    zIndex: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  planIndicator: {
    color: '#D1E8E2',
    fontSize: 13,
    fontWeight: '600',
  },
  container: {
    padding: '30px 20px',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 30,
    maxWidth: 700,
  },
  badge: {
    color: '#FFCB9A',
    backgroundColor: 'rgba(255, 203, 154, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 203, 154, 0.3)',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#D1E8E2',
    fontSize: 14,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    maxWidth: 1000,
    width: '100%',
    justifyContent: 'center',
  },
  dayCard: {
    width: 220,
    backgroundColor: 'rgba(24, 44, 37, 0.88)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#116466',
    boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  dayBadge: {
    color: '#FFCB9A',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  dayTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 14,
    lineHeight: 20,
  },
  statusText: {
    color: '#D1E8E2',
    fontSize: 12,
    fontWeight: '600',
  },
});
