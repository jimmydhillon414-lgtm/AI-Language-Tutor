export const getTutorResponse = async (userMessage, targetLanguage = 'English', level = 'Beginner') => {
  try {
    const systemPrompt = `You are a friendly, encouraging AI Language Tutor teaching ${targetLanguage} to a ${level} level student. 
    Rules:
    1. Keep responses concise, clear, and conversational.
    2. If the student makes a grammar or vocabulary mistake, politely correct it first in brackets like [Correction: ...].
    3. Always end with a short question to keep the practice going.`;

    // Direct Supabase Edge Function AI Proxy Endpoint
    const PROXY_URL = 'https://ytdfynurvqvfmuxuyuxm.supabase.co/functions/v1/ai-proxy';
    
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

    console.log("Calling Supabase AI Proxy from gemini.js...");

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(supabaseAnonKey ? { 'Authorization': `Bearer ${supabaseAnonKey}` } : {})
      },
      body: JSON.stringify({
        prompt:typeof userMessage === 'string' ? `${systemPrompt}\n\n${userMessage}` : `${systemPrompt}\n\nStudent: "${JSON.stringify(userMessage)}"`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `Proxy failed with status ${response.status}`);
    }

    const aiText = data.response || data.text || data.output || data.result || JSON.stringify(data);
    return aiText || 'No response generated.';

  } catch (error) {
    console.error('AI Proxy Error:', error);
    return `Sorry, I am having trouble connecting right now. (${error.message})`;
  }
};
