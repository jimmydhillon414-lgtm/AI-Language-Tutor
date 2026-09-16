import { supabase } from './supabase'; // Apne project ka supabase client import karo

export const getTutorResponse = async (userMessage, targetLanguage = 'English', level = 'Beginner') => {
  try {
    const messageText = typeof userMessage === 'string' 
      ? userMessage 
      : (userMessage?.content || JSON.stringify(userMessage));

    console.log("Calling Supabase Edge Function via SDK...");

    // Using Supabase functions.invoke instead of raw fetch URL
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { 
        prompt: messageText 
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
