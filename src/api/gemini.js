import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual API key inside quotes
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export const getTutorResponse = async (userMessage, targetLanguage = 'English', level = 'Beginner') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are a friendly, encouraging AI Language Tutor teaching ${targetLanguage} to a ${level} level student. 
    Rules:
    1. Keep responses concise, clear, and conversational.
    2. If the student makes a grammar or vocabulary mistake, politely correct it first in brackets like [Correction: ...].
    3. Always end with a short question to keep the practice going.`;

    const prompt = `${systemPrompt}\n\nStudent: "${userMessage}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Sorry, I am having trouble connecting right now. Please check your API key.';
  }
};
