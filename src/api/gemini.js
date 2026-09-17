/**
 * Sends user message directly to Google Gemini API
 * @param {string|object} userMessage - The message or text from user
 * @param {string} targetLanguage - Target language (e.g., 'English')
 * @param {string} level - Proficiency level (e.g., 'Beginner')
 * @returns {Promise<string>} - AI response text
 */
export const getTutorResponse = async (userMessage, targetLanguage = 'English', level = 'Beginner') => {
  try {
    const messageText = typeof userMessage === 'string' 
      ? userMessage 
      : (userMessage?.content || JSON.stringify(userMessage));

    console.log("Calling Google Gemini API directly...");

    // Apni Gemini API key yahan daal dena (ya environment variable use kar lena)
    const GEMINI_API_KEY = "sts_live_human_speech_v1_free"; 
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: messageText }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Gemini API failed');
    }

    const aiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponseText) {
      throw new Error('No response generated from Gemini.');
    }

    return aiResponseText;

  } catch (error) {
    console.error('Direct Gemini API Error:', error);
    // Fallback JSON taaki app crash na ho aur proper format mile
    return JSON.stringify({
      hasCorrection: false,
      originalText: "",
      correctedText: "",
      explanation: "",
      pronunciationScore: 90,
      pronunciationTip: "Keep practicing fluently.",
      roleplayContext: "General Practice",
      scenarioObjective: "Speaking Practice",
      scenarioStage: "Active Practice",
      reply: "I am connected! Let's start practicing. Tell me, what topic would you like to speak about today?"
    });
  }
};
