export const getTutorResponse = async (userMessage, targetLanguage = 'English', level = 'Beginner') => {
  try {
    const messageText = typeof userMessage === 'string' ? userMessage : (userMessage?.content || JSON.stringify(userMessage));

    const API_URL = "https://aiix-dev-pa7ud... (jo wahan screenshot mein URL diya hai)";
    const API_KEY = "sts_live_human_speech_v1_free"; // Apni yehi sts_live wali key yahan daal

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        prompt: messageText,
        targetLanguage: targetLanguage,
        level: level
      })
    });

    const data = await response.json();
    return data.response || data.reply || "No response";
  } catch (error) {
    console.error('API Error:', error);
    return "Sorry, connection error.";
  }
};
