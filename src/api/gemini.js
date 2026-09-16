export const getTutorResponse = async (userMessage, targetLanguage = 'English', level = 'Beginner') => {
  try {
    // Fetching the custom SpeakToSpeak backend API key from environment variables
    const apiKey = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY || "").trim();
    
    console.log("API Key Status:", apiKey ? "Loaded Successfully" : "MISSING!");

    if (!apiKey) {
      throw new Error('API key is missing in environment variables.');
    }

    const systemPrompt = `You are a friendly, encouraging AI Language Tutor teaching ${targetLanguage} to a ${level} level student. 
    Rules:
    1. Keep responses concise, clear, and conversational.
    2. If the student makes a grammar or vocabulary mistake, politely correct it first in brackets like [Correction: ...].
    3. Always end with a short question to keep the practice going.`;

    // Routing strictly through your custom Cloud Run backend where this AQ. key is validated
    const API_ENDPOINT = `https://ais-dev-pa7vdb7vpc7uuazieliwsu-669284669137.asia-southeast1.run.app/api/speak-to-speak`;

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey // Supporting both auth header conventions used by Cloud Run services
      },
      body: JSON.stringify({
        prompt: `${systemPrompt}\n\nStudent: "${userMessage}"`,
        message: userMessage,
        targetLanguage,
        level
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || data.message || `Backend API failed with status ${response.status}`);
    }

    // Safely extracting response fields based on standard Cloud Run backend response schemas
    const aiText = data?.response || data?.text || data?.output || data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return aiText || 'No response generated.';

  } catch (error) {
    console.error('SpeakToSpeak Backend Error:', error);
    return `Sorry, I am having trouble connecting right now. (${error.message})`;
  }
};
