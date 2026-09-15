
/**
 * GeminiLiveClient - Manages WebSocket connection, Real-time audio streaming (Mic -> Gemini),
 * and audio playback queue (Gemini -> Speaker) for Gemini Multimodal Live API.
 */
export class GeminiLiveClient {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.ws = null;
    this.audioContext = null;
    this.mediaStream = null;
    this.processor = null;
    this.audioInputSource = null;
    
    // Callbacks for UI updates
    this.onTranscription = options.onTranscription || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});
    
    // Audio playback queue management
    this.nextPlayTime = 0;
    this.isPlaying = false;
  }

  async connect() {
    try {
      this.onStatusChange('connecting');
      
      // Gemini Multimodal Live WebSocket endpoint (v1alpha protocol)
      const wssUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
      
      this.ws = new WebSocket(wssUrl);

      this.ws.onopen = () => {
        console.log("Gemini Live WebSocket Connected successfully.");
        this.sendInitialSetup();
        this.startMicrophoneStreaming();
        this.onStatusChange('connected');
      };

      this.ws.onmessage = async (event) => {
        await this.handleServerMessage(event);
      };

      this.ws.onerror = (error) => {
        console.error("Gemini Live WebSocket Error:", error);
        this.onStatusChange('error');
      };

      this.ws.onclose = (event) => {
        console.log("Gemini Live WebSocket Closed:", event.reason);
        this.disconnect();
        this.onStatusChange('disconnected');
      };

    } catch (err) {
      console.error("Failed to connect to Gemini Live API:", err);
      this.onStatusChange('error');
    }
  }

  sendInitialSetup() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Send session configuration instruction
    const setupMessage = {
      setup: {
        model: "models/gemini-2.5-flash", // Valid multimodal live model
        generationConfig: {
          responseModalities: ["AUDIO"], // Direct native audio generation
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Puck" } // Options: Puck, Charon, Kore, Fenrir, Aoede
            }
          }
        },
        systemInstruction: {
          parts: [{
            text: "You are an expert, highly adaptive AI language tutor and coach. Have a natural, friendly, and fluid voice conversation with the user. Help them improve their language skills dynamically."
          }]
        }
      }
    };

    this.ws.send(JSON.stringify(setupMessage));
  }

  async startMicrophoneStreaming() {
    try {
      // Initialize AudioContext at 16kHz sample rate required by Live API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { channelCount: 1, sampleRate: 16000 } 
      });

      this.audioInputSource = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Using ScriptProcessor for capturing raw PCM chunks (Buffer size: 4096)
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const base64PCM = this.floatToPCM16Base64(inputData);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const clientContent = {
            realtimeInput: {
              mediaChunks: [{
                mimeType: "audio/pcm;rate=16000",
                data: base64PCM
              }]
            }
          };
          this.ws.send(JSON.stringify(clientContent));
        }
      };

      this.audioInputSource.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

    } catch (err) {
      console.error("Microphone access denied or error:", err);
      this.onStatusChange('mic_error');
    }
  }

  floatToPCM16Base64(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const output = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async handleServerMessage(event) {
    try {
      let responseData;
      if (event.data instanceof Blob) {
        const textData = await event.data.text();
        responseData = JSON.parse(textData);
      } else {
        responseData = JSON.parse(event.data);
      }

      // Handle Model Audio Output
      if (responseData.serverContent?.modelTurn?.parts) {
        for (const part of responseData.serverContent.modelTurn.parts) {
          if (part.inlineData && part.inlineData.mimeType.startsWith("audio/")) {
            this.playAudioChunk(part.inlineData.data);
          }
          if (part.text) {
            this.onTranscription(part.text);
          }
        }
      }
    } catch (err) {
      console.error("Error parsing server WebSocket message:", err);
    }
  }

  async playAudioChunk(base64Audio) {
    try {
      if (!this.audioContext) return;

      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert PCM 16-bit to AudioBuffer
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const audioBuffer = this.audioContext.createBuffer(1, float32.length, 16000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      const currentTime = this.audioContext.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;

    } catch (err) {
      console.error("Error playing audio chunk:", err);
    }
  }

  disconnect() {
    if (this.processor && this.audioInputSource) {
      this.processor.disconnect();
      this.audioInputSource.disconnect();
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    this.ws = null;
    console.log("GeminiLiveClient session terminated cleanly.");
  }
}
