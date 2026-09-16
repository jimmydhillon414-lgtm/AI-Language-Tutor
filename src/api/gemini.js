import { supabase } from './supabase'; // Apne project ka supabase client import karo

/**
 * Sends user message to the Supabase Edge Function (ai-proxy) for AI Voice/Text Tutor
 * @param {string|object} userMessage - The message or text from user
 * @param {string} targetLanguage - Target language (e.g., 'English', 'Punjabi')
 * @param {string} level - Proficiency level (e.g., 'Beginner')
 * @returns {Promise<string>} - AI response text
 */
export const getTutorResponse = async (userMessage, targetLanguage = 'English', level = 'Beginner') => {
  try {
    const messageText = typeof userMessage === 'string' 
      ? userMessage 
      : (userMessage?.content || JSON.stringify(userMessage));

    console.log("Calling Supabase Edge Function via SDK for Voice/Text Tutor...");

    // Using Supabase functions.invoke to securely trigger backend
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { 
        prompt: messageText,
        targetLanguage: targetLanguage,
        level: level,
        mode: 'voice-tutor'
      }
    });

    if (error) {
      throw new Error(error.message || 'Edge function invocation failed');
    }

    if (!data || data.success === false) {
      throw new Error(data?.error || 'Unknown error from proxy');
    }

    return data.response || data?.choices?.[0]?.message?.content || 'No response generated.';

  } catch (error) {
    console.error('AI Proxy Error:', error);
    return `Sorry, I am having trouble connecting right now. (${error.message})`;
  }
};
