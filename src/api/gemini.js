export const getTutorResponse = async (userMessage, targetLanguage = 'English', level = 'Beginner') => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_AI_KEY;
    
    // Debug log to confirm key loading status safely
    console.log("API Key Status:", apiKey ? "Loaded Successfully" : "MISSING!");

    if (!apiKey) {
      throw new Error('API key is missing in environment variables.');
    }

    const systemPrompt = `You are a friendly, encouraging AI Language Tutor teaching ${targetLanguage} to a ${level} level student. 
    Rules:
    1. Keep responses concise, clear, and conversational.
    2. If the student makes a grammar or vocabulary mistake, politely correct it first in brackets like [Correction: ...].
    3. Always end with a short question to keep the practice going.`;

    const promptText = `${systemPrompt}\n\nStudent: "${userMessage}"`;

    // Official SpeakToSpeak Platform API Endpoint
    const API_ENDPOINT = 'https://ais-dev-pa7vdb7vpc7uuazieliwsu-669284669137.asia-southeast1.run.app/api/speak-to-speak';

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        text: promptText,
        language: targetLanguage.toLowerCase() === 'punjabi' ? 'pa' : 'en',
        accentStyle: 'Majhi Desi (ਅੰਮ੍ਰਿਤਸਰੀ ਲਹਿਜਾ - ਹਾਂਜੀ ਭਾਊ)',
        voiceName: 'Puck',
        humanMannerisms: true,
        speakingPace: 'normal'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Platform API failed with status ${response.status}`);
    }

    // Extract response safely based on potential payload structures
    const aiText = data?.response || data?.text || data?.choices?.[0]?.message?.content || data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return aiText || 'No response generated.';

  } catch (error) {
    console.error('SpeakToSpeak API Error:', error);
    return `Sorry, I am having trouble connecting right now. (${error.message})`;
  }
};
