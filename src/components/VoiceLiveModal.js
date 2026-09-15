import React, { useState, useEffect, useRef } from 'react';
import { GeminiLiveClient } from '../services/GeminiLiveClient';

export default function VoiceLiveModal({ apiKey, onClose }) {
  const [status, setStatus] = useState('connecting'); // connecting, connected, error, disconnected
  const [conversation, setConversation] = useState([
    { sender: 'system', text: 'Initializing live voice session...' }
  ]);
  const [tick, setTick] = useState(0); // For animating waveform bars
  const clientRef = useRef(null);

  useEffect(() => {
    // Animation ticker for waveform visualizer
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 100);

    // Initialize Gemini Live Client
    const client = new GeminiLiveClient(apiKey, {
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
        if (newStatus === 'connected') {
          setConversation(prev => [...prev, { sender: 'system', text: 'Connected! Speak freely with your AI tutor.' }]);
        } else if (newStatus === 'connecting') {
          setConversation(prev => [...prev, { sender: 'system', text: 'Connecting to Gemini Live...' }]);
        } else if (newStatus === 'error') {
          setConversation(prev => [...prev, { sender: 'system', text: 'Connection error. Please try reconnecting.' }]);
        }
      },
      onTranscription: (text, sender = 'ai') => {
        setConversation(prev => [...prev, { sender, text }]);
      }
    });

    clientRef.current = client;
    client.connect();

    return () => {
      clearInterval(interval);
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, [apiKey]);

  const handleEndSession = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContainer}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>AI Voice Tutor (Live Mode)</h3>
          <span style={{ ...styles.badge, backgroundColor: status === 'connected' ? '#10B981' : '#F59E0B' }}>
            {status.toUpperCase()}
          </span>
        </div>

        {/* Dynamic Purple Waveform Visualizer Bars */}
        <div style={styles.visualizerContainer}>
          <div style={styles.waveformWrapper}>
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.waveBar,
                  height: status === 'connected' ? `${Math.max(15, Math.sin(i + tick * 0.5) * 45 + 30)}px` : '10px',
                  backgroundColor: status === 'connected' ? '#A78BFA' : '#4B5563',
                }}
              />
            ))}
          </div>
          <div style={styles.micIconCircle}>
            🎙️
          </div>
        </div>

        {/* Continuous Chat / Transcription Stream */}
        <div style={styles.transcriptBox}>
          {conversation.slice(-3).map((item, index) => (
            <p key={index} style={{
              ...styles.transcriptText,
              color: item.sender === 'ai' ? '#C4B5FD' : item.sender === 'user' ? '#34D399' : '#94A3B8'
            }}>
              <strong>{item.sender === 'ai' ? 'Tutor: ' : item.sender === 'user' ? 'You: ' : ''}</strong>
              {item.text}
            </p>
          ))}
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <button onClick={handleEndSession} style={styles.endButton}>
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}

// Updated Styles with absolute root layering to avoid clipping
const styles = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    width: '90%',
    maxWidth: '400px',
    backgroundColor: '#1E1B4B',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1.5px solid rgba(255, 255, 255, 0.2)',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
  },
  badge: {
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: '12px',
  },
  visualizerContainer: {
    position: 'relative',
    height: '110px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
  },
  waveformWrapper: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    height: '60px',
    zIndex: 1,
  },
  waveBar: {
    width: '4px',
    borderRadius: '4px',
    transition: 'height 0.1s ease-in-out',
  },
  micIconCircle: {
    width: '55px',
    height: '55px',
    backgroundColor: '#4338CA',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '22px',
    zIndex: 2,
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
  },
  transcriptBox: {
    width: '100%',
    minHeight: '90px',
    maxHeight: '120px',
    overflowY: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    justifyContent: 'flex-start',
  },
  transcriptText: {
    fontSize: '13px',
    margin: 0,
    lineHeight: '1.4',
  },
  controls: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  endButton: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '30px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
  },
};
