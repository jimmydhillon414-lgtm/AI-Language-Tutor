import React from 'react';
import { StyleSheet, View, Platform, ImageBackground } from 'react-native';

export default function AppBackground({ children }) {
  if (Platform.OS === 'web') {
    return (
      <div style={{
        height: 'calc(100vh - 56px)', // Top navigation bar ko minus karke exact fit karega
        width: '100%',
        backgroundImage: `linear-gradient(rgba(15, 23, 21, 0.75), rgba(15, 23, 21, 0.75)), url(${require('../../assets/tutor_girl.png.png')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
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
    backgroundColor: 'rgba(15, 23, 21, 0.75)',
  },
});
