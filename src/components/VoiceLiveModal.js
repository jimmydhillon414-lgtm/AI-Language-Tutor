import React, { useState, useEffect, useRef } from 'react';

export default function VoiceLiveModal({ apiKey, onClose }) {
  const [status, setStatus] = useState('connecting'); // connecting, connected, error, disconnected
  const [conversation, setConversation] = useState([
    { sender: 'system', text: 'Initializing live voice session...' }
  ]);
  const [tick, setTick] = useState(0);
  
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const processorRef = useRef(null);
  const nextPlayTimeRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 100);

    startGeminiLiveSession();

    return () => {
      clearInterval(interval);
      cleanupSession();
    };
  }, [apiKey]);

  const cleanupSession = () => {
    if (processorRef.current) {
      try { processorRef.current.disconnect(); } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
    }
    if (wsRef.current) {
      try { wsRef.current.close(); } catch (e) {}
    }
  };

  const startGeminiLiveSession = async () => {
    try {
      setStatus('connecting');
      setConversation(prev => [...prev, { sender: 'system', text: 'Connecting to Gemini Live WebSocket...' }]);

      // 1. Setup Audio Recording Context (16kHz mono required by Gemini Live API)
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 16000 } });
      mediaStreamRef.current = stream;

      // 2. Connect to Gemini Multimodal Live WebSocket endpoint
      const host = "generativelanguage.googleapis.com";
      const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      
      const ws = new WebSocket(uri);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        setConversation(prev => [...prev, { sender: 'system', text: 'Connected! Speak freely with your AI tutor.' }]);

        // Send initial setup message to Gemini
        const setupMessage = {
          setup: {
            model: "models/gemini-2.0-flash-exp",
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Puck" }
                }
              }
            },
            systemInstruction: {
              parts: [{ text: "You are an expert, friendly interactive AI language tutor. Speak naturally, listen to the user, keep conversation flowing, and correct them if needed." }]
            }
          }
        };
        ws.send(JSON.stringify(setupMessage));

        // Start streaming mic audio
        startMicStream(audioCtx, stream, ws);
      };

      ws.onmessage = async (event) => {
        try {
          let responseText = event.data;
          if (event.data instanceof Blob) {
            responseText = await event.data.text();
          }
          const data = JSON.parse(responseText);

          // Handle incoming audio from Gemini
          if (data.serverContent?.modelTurn?.parts) {
            for (const part of data.serverContent.modelTurn.parts) {
              if (part.inlineData && part.inlineData.mimeType.startsWith("audio/")) {
                playAudioChunk(part.inlineData.data);
              }
              if (part.text) {
                setConversation(prev => [...prev, { sender: 'ai', text: part.text }]);
              }
            }
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setStatus('error');
        setConversation(prev => [...prev, { sender: 'system', text: 'Connection error with Gemini Live.' }]);
      };

      ws.onclose = () => {
        setStatus('disconnected');
        setConversation(prev => [...prev, { sender: 'system', text: 'Live session ended.' }]);
      };

    } catch (err) {
      console.error("Microphone or Connection error:", err);
      setStatus('error');
      setConversation(prev => [...prev, { sender: 'system', text: 'Microphone permission denied or connection failed.' }]);
    }
  };

  const startMicStream = (audioCtx, stream, ws) => {
    const source = audioCtx.createMediaStreamSource(stream);
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Convert Float32Array audio samples to PCM 16-bit
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        let s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      // Convert to Base64
      const base64Audio = btoa(String.fromCharCode.apply(null, new Uint8Array(pcm16.buffer)));

      const realTimeMsg = {
        realtimeInput: {
          mediaChunks: [
            {
              mimeType: "audio/pcm;rate=16000",
              data: base64Audio
            }
          ]
        }
      };
      ws.send(JSON.stringify(realTimeMsg));
    };

    source.connect(processor);
    processor.connect(audioCtx.destination);
  };

  const playAudioChunk = async (base64Audio) => {
    try {
      const audioCtx = audioContextRef.current;
      if (!audioCtx) return;

      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7FFF);
      }

      const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += audioBuffer.duration;
    } catch (e) {
      console.error("Error playing audio chunk:", e);
    }
  };

  const handleEndSession = () => {
    cleanupSession();
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
