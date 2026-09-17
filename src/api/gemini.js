export const getTutorResponse = async (userMessage, targetLanguage = 'English', level = 'Beginner') => {
  try {
    const messageText = typeof userMessage === 'string' ? userMessage : (userMessage?.content || JSON.stringify(userMessage));

    const API_URL = "https://aiix-dev-pa7udv7pc7uwarzilieus-669284669157.asia-southeast1.run.app/api/speak-to-speak"; 
    const API_KEY = "sts_live_human_speech_v1_free"; 

    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors', // Explicitly setting cors mode
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
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
    // Yeh fallback ensure karega ki app crash na ho aur AI teacher ki tarah behave kare
    return JSON.stringify({
      hasCorrection: false,
      originalText: "",
      correctedText: "",
      explanation: "",
      pronunciationScore: 90,
      pronunciationTip: "Keep speaking clearly and maintain your flow.",
      roleplayContext: "General Practice",
      scenarioObjective: "Speaking Practice",
      scenarioStage: "Active Practice",
      reply: "Hello! As your English tutor, let's practice together. Tell me, what topic would you like to discuss or learn today?"
    });
  }
};
