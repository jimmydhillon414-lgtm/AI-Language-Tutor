export const getTutorResponse = async (userMessage, targetLanguage = 'English', level = 'Beginner') => {
  try {
    const messageText = typeof userMessage === 'string' ? userMessage : (userMessage?.content || JSON.stringify(userMessage));

    // Dashboard wala poora sahi URL yahan paste kar
    const API_URL = "sts_live_human_speech_v1_free"; 
    const API_KEY = "sts_live_human_speech_v1_free"; // Apni sts_live wali key

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
    return data.response || data.reply || JSON.stringify(data);
  } catch (error) {
    console.error('API Error:', error);
    // Fallback taaki app crash na ho
    return JSON.stringify({
      hasCorrection: false,
      originalText: "",
      correctedText: "",
      explanation: "",
      pronunciationScore: 90,
      pronunciationTip: "Keep speaking clearly.",
      roleplayContext: "General Practice",
      scenarioObjective: "Speaking Practice",
      scenarioStage: "Active Practice",
      reply: "Hello! Let's continue practicing. Tell me what you would like to say next."
    });
  }
};
