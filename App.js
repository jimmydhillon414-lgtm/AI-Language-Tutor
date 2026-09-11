import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { supabase } from './src/supabaseClient'; // Apna supabase client path check kar lena

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check existing session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for sign-in / sign-out events automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Jab tak session check ho raha hai, loading screen dikhao taaki flicker na ho
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FFCB9A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#121E1A" />
        <AppNavigator session={session} />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121E1A',
    ...(Platform.OS === 'web' ? {
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
    } : {}),
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
