import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ImageBackground,
} from 'react-native';

export default function HomeScreen({ onOpenLogin, onOpenSignup }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! How can I help you practice English today?' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg = { sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'ai', text: 'That is correct! Let us try another sentence.' }]);
    }, 1000);
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop' }} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        
        {/* Top Header Bar */}
        <View style={styles.header}>
          <Text style={styles.logoText}>SIRIN</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.authBtn} onPress={onOpenLogin}>
              <Text style={styles.authBtnText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.authBtn, styles.signUpBtn]} onPress={onOpenSignup}>
              <Text style={[styles.authBtnText, styles.signUpText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages Area */}
        <ScrollView contentContainerStyle={styles.chatScroll} style={styles.chatContainer}>
          {messages.map((msg, index) => (
            <View 
              key={index} 
              style={[
                styles.messageBubble, 
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble
              ]}
            >
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Chat Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Practice English with your tutor..."
            placeholderTextColor="#888"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {}),
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 14, 0.88)',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: '#111715',
    borderBottomWidth: 1,
    borderBottomColor: '#0A3B3D',
  },
  logoText: {
    color: '#E8B486',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0A3B3D',
    backgroundColor: '#17211E',
  },
  authBtnText: {
    color: '#E1F2EC',
    fontSize: 13,
    fontWeight: '600',
  },
  signUpBtn: {
    backgroundColor: '#E8B486',
    borderColor: '#E8B486',
  },
  signUpText: {
    color: '#111715',
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 28,
  },
  chatScroll: {
    paddingVertical: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    maxWidth: '75%',
  },
  aiBubble: {
    backgroundColor: 'rgba(10, 59, 61, 0.6)',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#0A3B3D',
  },
  userBubble: {
    backgroundColor: '#E8B486',
    alignSelf: 'flex-end',
  },
  messageText: {
    color: '#E1F2EC',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(17, 23, 21, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#0A3B3D',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#111715',
    borderWidth: 1,
    borderColor: '#0A3B3D',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#E1F2EC',
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#E8B486',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  sendButtonText: {
    color: '#111715',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
