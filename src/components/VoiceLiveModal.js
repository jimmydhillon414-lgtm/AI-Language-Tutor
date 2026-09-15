
import React, { useState, useEffect, useRef } from 'react';
import { GeminiLiveClient } from '../services/GeminiLiveClient';

export default function VoiceLiveModal({ apiKey, onClose }) {
  const [status, setStatus] = useState('connecting'); // connecting, connected, error, disconnected
  const [transcription, setTranscription] = useState('Initializing voice session...');
  const clientRef = useRef(null);

  useEffect(() => {
    // Initialize Gemini Live Client
    const client = new GeminiLiveClient(apiKey, {
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
        if (newStatus === 'connected') {
          setTranscription('Listening... Speak now to your AI tutor.');
        } else if (newStatus === 'connecting') {
          setTranscription('Connecting to Gemini Live...');
        } else if (newStatus === 'error') {
          setTranscription('Connection error. Please try again.');
        }
      },
      onTranscription: (text) => {
        setTranscription(text);
      }
    });

    clientRef.current = client;
    client.connect();

    // Cleanup on unmount
    return () => {
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

        {/* Visualizer / Status Area */}
        <div style={styles.visualizerContainer}>
          <div className="pulse-ring" style={styles.pulseRing}></div>
          <div style={styles.micIconCircle}>
            🎙️
          </div>
        </div>

        {/* Live Transcription / Chat Bubble */}
        <div style={styles.transcriptBox}>
          <p style={styles.transcriptText}>{transcription}</p>
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

// Inline Styles for clean modular rendering
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: '400px',
    backgroundColor: '#1E1B4B',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
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
    height: '120px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
  },
  micIconCircle: {
    width: '70px',
    height: '70px',
    backgroundColor: '#4338CA',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '28px',
    zIndex: 2,
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
  },
  transcriptBox: {
    width: '100%',
    minHeight: '80px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  transcriptText: {
    color: '#E2E8F0',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.5',
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
