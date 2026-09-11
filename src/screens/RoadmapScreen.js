import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';

export default function RoadmapScreen({ selectedPlan, onSelectDay, onBack }) {
  // Ensure we show an appropriate number of days based on the selected plan
  const totalDays = selectedPlan === 'Free Demo' ? 5 : selectedPlan === 'Base Starter' ? 30 : 60;

  const daysList = Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    title: i === 0 ? 'Introduction & Basic Greetings' : i === 1 ? 'Daily Conversational Phrases' : `Masterclass Module ${i + 1}`,
    unlocked: true,
  }));

  return (
    <View style={styles.mainWrapper}>
      {/* Modern Sleek Top Bar */}
      <View style={styles.topBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
            <Text style={styles.backButtonText}>← Back to Plans</Text>
          </TouchableOpacity>
        )}
        <View style={styles.planPill}>
          <Text style={styles.planLabel}>Active Plan:</Text>
          <Text style={styles.planValue}>{selectedPlan || 'Free Demo'}</Text>
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
    backgroundColor: '#070D10',
    width: '100%',
    minHeight: '100vh',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 35,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#116466',
    backgroundColor: '#0B1917',
  },
  backButton: {
    backgroundColor: '#116466',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFCB9A',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  backButtonText: {
    color: '#FFCB9A',
    fontSize: 13,
    fontWeight: '700',
  },
  planPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122322',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFCB9A',
  },
  planLabel: {
    color: '#D1E8E2',
    fontSize: 13,
    marginRight: 6,
  },
  planValue: {
    color: '#FFCB9A',
    fontSize: 13,
    fontWeight: '800',
  },
  container: {
    padding: 30,
    alignItems: 'center',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 35,
    maxWidth: 750,
  },
  glowBadge: {
    backgroundColor: 'rgba(255, 203, 154, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FFCB9A',
    marginBottom: 16,
  },
  badgeText: {
    color: '#FFCB9A',
    fontSize: 12,
    fontWeight: '900',
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
    backgroundColor: '#0F2522',
    borderRadius: 16,
    padding: 22,
    borderWidth: 2,
    borderColor: '#116466',
    justifyContent: 'space-between',
    minHeight: 150,
    ...(Platform.OS === 'web' ? { 
      cursor: 'pointer', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
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
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  liveIndicator: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#2ECC71',
  },
  dayTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 12,
  },
  statusText: {
    color: '#FFCB9A',
    fontSize: 13,
    fontWeight: '700',
  },
  arrowIcon: {
    color: '#FFCB9A',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
