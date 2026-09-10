import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';

export default function AppBackground({ children }) {
  return (
    <View style={styles.mainWrapper}>
      {/* Global Background Image Layer (Fixed for Web) */}
      {Platform.OS === 'web' ? (
        <div style={styles.bgImageWrapperWeb}>
          <img 
            // Aapki local image ka path, ensure path is correct relative to this file
            src={require('../../assets/tutor_girl.png.png')} 
            style={styles.bgImageStyleWeb} 
            alt="Background" 
          />
          <div style={styles.bgOverlayWeb} />
        </div>
      ) : (
        /* Mobile ke liye hum standard View use karenge, BG image screens ke andar handle ho sakti hai ya yahan wrap kar sakte hain */
        <View style={styles.bgWrapperMobile}>
            <div style={styles.bgOverlayWeb} /> 
        </View>
      )}

      {/* Content Container - Header iske upar render hoga */}
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
    // Web pe height calc include ki hai pichle code se
    ...(Platform.OS === 'web' ? {
        height: 'calc(100vh - 56px)',
        maxHeight: 'calc(100vh - 56px)',
    } : {
        height: '100%', // Mobile full screen
    }),
    width: '100%',
    backgroundColor: '#0A0F0E', // Fallback from overlay
  },
  bgImageWrapperWeb: {
    position: 'fixed', // Keeps background fixed while scrolling content
    top: 56px, // Offset for web header
    left: 0,
    width: '100vw',
    height: 'calc(100vh - 56px)',
    zIndex: -1, // Content stays above background
    overflow: 'hidden',
  },
  bgImageStyleWeb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'blur(3px)', // Cinematic blur
    transform: 'scale(1.05)',
  },
  bgOverlayWeb: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    // Aapki specified semi-transparent color
    backgroundColor: 'rgba(10, 15, 14, 0.72)', 
  },
  bgWrapperMobile: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
    width: '100%',
    flexDirection: 'column',
  },
});
