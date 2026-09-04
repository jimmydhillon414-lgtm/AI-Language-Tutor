import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { supabase } from '../api/supabase';

import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import TutorChatScreen from '../screens/TutorChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GrammarHistoryScreen from '../screens/GrammarHistoryScreen';

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

function MainTabs() {
  return (
    <View style={styles.tabWrapper}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: 'rgba(17, 23, 21, 0.92)', // Modern translucent dark look matching your chat page
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1.5,
            borderBottomColor: '#0A3B3D',
            height: 64, // Increased height for a prominent, modern navbar feel
            paddingTop: 4,
          },
          tabBarIndicatorStyle: {
            backgroundColor: '#8C6E52', // Matching your warm accent line
            height: 4,
            borderRadius: 4,
          },
          tabBarActiveTintColor: '#E8B486', // Glowing active text color
          tabBarInactiveTintColor: '#8FA39D', // Clean readable inactive text color
          tabBarLabelStyle: {
            fontSize: 16, // Significantly increased font size for tabs (Home, AI Tutor, etc.)
            fontWeight: '700',
            textTransform: 'none',
            letterSpacing: 0.5,
          },
          tabBarItemStyle: {
            width: 'auto',
            paddingHorizontal: 20, // Increased spacing/padding inside tabs for a bigger touch area
            height: 60,
            justifyContent: 'center',
          },
          tabBarScrollEnabled: true,
          sceneContainerStyle: {
            backgroundColor: 'transparent',
          },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="TutorChat" component={TutorChatScreen} options={{ title: 'AI Tutor' }} />
        <Tab.Screen name="History" component={GrammarHistoryScreen} options={{ title: 'Grammar History' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile Settings' }} />
      </Tab.Navigator>
    </View>
  );
}

export default function AppNavigator() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0F0E', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8C6E52" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session && session.user ? (
        <Stack.Screen name="MainApp" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? {
      height: '100vh',
      maxHeight: '100vh',
    } : {}),
  },
  navbarContainer: {
    height: 64,
    backgroundColor: 'rgba(17, 23, 21, 0.92)',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0A3B3D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});