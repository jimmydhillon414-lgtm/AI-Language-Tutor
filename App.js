import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#05070B" />
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070B',
    ...(Platform.OS === 'web' ? {
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
    } : {}),
  },
});
