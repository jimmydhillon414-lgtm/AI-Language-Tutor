import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';

export default function AppBackground({ children }) {
  return (
    <View style={styles.mainWrapper}>
      {/* Global Background Image Layer for Web */}
      {Platform.OS === 'web' && (
        <div style={styles.bgImageWrapper}>
          <img 
            src={require('../../assets/tutor_girl.png.png')} 
            style={styles.bgImageStyle} 
            alt="Background" 
          />
          <div style={styles.bgOverlay} />
        </div>
      )}

      {/* Main Content Container */}
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    position: 'relative',
    width: '100%',
    backgroundColor: '#0F1715',
    ...(Platform.OS === 'web' ? {
      height: 'calc(100vh - 56px)', // Header height adjust karne ke liye
      maxHeight: 'calc(100vh - 56px)',
      overflow: 'hidden', // Extra scrolling rokne ke liye
    } : {
      flex: 1,
    }),
  },
  bgImageWrapper: {
    position: 'fixed',
    top: 56, // Header ke theek neeche se shuru hoga
    left: 0,
    width: '100vw',
    height: 'calc(100vh - 56px)',
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
    backgroundColor: 'rgba(15, 23, 21, 0.85)',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
});
