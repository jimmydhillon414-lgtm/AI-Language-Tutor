import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';

export default function RoadmapScreen({ selectedPlan, onSelectDay, onBack }) {
  const totalDays = selectedPlan === 'Free Demo' ? 1 : selectedPlan === 'Base Starter' ? 30 : 60;

  const daysList = Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    title: i === 0 ? 'Introduction & Basic Greetings' : i === 1 ? 'Daily Conversational Phrases' : `Masterclass Module ${i + 1}`,
    unlocked: true,
  }));

  return (
    <View style={styles.mainWrapper}>
      {/* Background Image Layer with Blur & Dark Overlay */}
      {Platform.OS === 'web' && (
        <div style={styles.bgImageWrapper}>
          <img src="/assets/tutor_girl.png.png" style={styles.bgImageStyle} alt="Background" />
          <div style={styles.bgOverlay} />
        </div>
      )}

      {/* Modern Floating Top Bar */}
      <View style={styles.topBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
            <Text style={styles.backButtonText}>← Back to Plans</Text>
          </TouchableOpacity>
        )}
        <View style={styles.planPill}>
          <Text style={styles.planLabel}>Active Plan:</Text>
          <Text style={styles.planValue}>{selectedPlan || '60-Day Pro Master'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <View style={styles.glowBadge}>
            <Text style={styles.badgeText}>⚡ YOUR FLUENCY ROADMAP ({totalDays} {totalDays === 1 ? 'Day' : 'Days'})</Text>
          </View>
          <Text style={styles.title}>Your Daily Masterclass Curriculum</Text>
          <Text style={styles.subtitle}>Complete each daily session with your AI Tutor to unlock rapid conversational fluency.</Text>
        </View>

        <View style={styles.grid}>
          {daysList.map((item) => (
            <TouchableOpacity 
              key={item.day} 
              style={styles.dayCard}
              onPress={() => onSelectDay(item.day)}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.dayBadge}>DAY {item.day}</Text>
                <View style={styles.liveIndicator} />
              </View>
              <Text style={styles.dayTitle}>{item.title}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.statusText}>Start Session</Text>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
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
    filter: 'blur(8px)',
    transform: 'scale(1.06)',
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(7, 13, 16, 0.82)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 18,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(7, 13, 16, 0.6)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } : {}),
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  planPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 100, 102, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#116466',
  },
  planLabel: {
    color: '#D1E8E2',
    fontSize: 12,
    marginRight: 6,
  },
  planValue: {
    color: '#FFCB9A',
    fontSize: 12,
    fontWeight: '700',
  },
  container: {
    padding: '40px 20px',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 35,
    maxWidth: 750,
  },
  glowBadge: {
    backgroundColor: 'rgba(255, 203, 154, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 203, 154, 0.35)',
    marginBottom: 16,
    ...(Platform.OS === 'web' ? { boxShadow: '0 0 20px rgba(255,203,154,0.15)' } : {}),
  },
  badgeText: {
    color: '#FFCB9A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#D1E8E2',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    maxWidth: 1100,
    width: '100%',
    justifyContent: 'center',
  },
  dayCard: {
    width: 240,
    backgroundColor: 'rgba(18, 35, 30, 0.85)',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#116466',
    justifyContent: 'space-between',
    minHeight: 150,
    ...(Platform.OS === 'web' ? { 
      cursor: 'pointer', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      transition: 'transform 0.2s ease, borderColor 0.2s ease',
      ':hover': { transform: 'translateY(-4px)', borderColor: '#FFCB9A' }
    } : {}),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayBadge: {
    color: '#FFCB9A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
    ...(Platform.OS === 'web' ? { boxShadow: '0 0 8px #2ECC71' } : {}),
  },
  dayTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
  },
  statusText: {
    color: '#D1E8E2',
    fontSize: 12,
    fontWeight: '600',
  },
  arrowIcon: {
    color: '#FFCB9A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
