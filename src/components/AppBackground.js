import React from 'react';
import { StyleSheet, View, Platform, ImageBackground } from 'react-native';

export default function AppBackground({ children }) {
  if (Platform.OS === 'web') {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        backgroundImage: `linear-gradient(rgba(15, 23, 21, 0.85), rgba(15, 23, 21, 0.85)), url(${require('../../assets/tutor_girl.png.png')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </div>
    );
  }

  return (
    <ImageBackground 
      source={require('../../assets/tutor_girl.png.png')} 
      style={styles.container}
    >
      <View style={styles.overlay}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 21, 0.85)',
  },
});
