export const getTutorResponse = async (userMessage, targetLanguage = 'English', level = 'Beginner') => {
  try {
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

    // For AQ. format keys, pass as Authorization Bearer header to Vertex AI / Gemini endpoint if query param fails, 
    // or use the standard model endpoint. Let's use Bearer authorization which handles AQ. keys correctly.
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemPrompt}\n\nStudent: "${userMessage}"` }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Gemini API failed with status ${response.status}`);
    }

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return aiText || 'No response generated.';

  } catch (error) {
    console.error('Gemini API Error:', error);
    return `Sorry, I am having trouble connecting right now. (${error.message})`;
  }
};
