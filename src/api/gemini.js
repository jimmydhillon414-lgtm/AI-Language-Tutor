export const getTutorResponse = async (userMessage, targetLanguage = 'English', level = 'Beginner') => {
  try {
    const messageText = typeof userMessage === 'string' 
      ? userMessage 
      : (userMessage?.content || JSON.stringify(userMessage));

    console.log("Calling Internal Vercel Proxy API...");

    const response = await fetch('/api/tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    console.error('Frontend Fetch Error:', error);
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
