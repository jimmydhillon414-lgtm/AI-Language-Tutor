export const getTutorResponse = async (userMessage, targetLanguage = 'English', level = 'Beginner') => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_AI_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is missing.');
    }

    const systemPrompt = `You are a friendly, encouraging AI Language Tutor teaching ${targetLanguage} to a ${level} level student. 
    Rules:
    1. Keep responses concise, clear, and conversational.
    2. If the student makes a grammar or vocabulary mistake, politely correct it first in brackets like [Correction: ...].
    3. Always end with a short question to keep the practice going.`;

    const promptText = `${systemPrompt}\n\nStudent: "${userMessage}"`;

    // Direct fetch use kar rahe hain taaki AQ. token / Bearer token properly pass ho sake
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to communicate with AI service.');
    }

    // Gemini API response structure se text extract karna
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return aiText || 'No response generated.';

  } catch (error) {
    console.error('Gemini API Error:', error);
    return `Sorry, I am having trouble connecting right now. (${error.message})`;
  }
};
