
const GEMINI_API_KEY = 'AIzaSyDOj-ZoB3LEFn_xG-MwktycHCvHY1NG4Qk';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_INSTRUCTION = `You are AgriBot, a friendly and expert agricultural AI assistant for Indian farmers.
Help with: crop diseases, soil health, irrigation, fertilizers, weather impacts, market prices, and farming techniques.
Keep answers short, practical and easy to understand. Use bullet points when listing steps.
Always respond in English but be warm and use "Namaste" or friendly greetings where appropriate.
If a question is not about farming/agriculture, gently redirect to farming topics.`;

export async function askGemini(userMessage, history = []) {
  const contents = [];

  history.forEach(h => {
    contents.push({
      // Fallback: If your app uses 'assistant', convert it to 'model' for Gemini
      role: h.role === 'assistant' ? 'model' : h.role,
      parts: [{ text: h.text }],
    });
  });

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const body = {
    systemInstruction: { 
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    },
  };

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || `HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');

    return text;

  } catch (error) {
    console.error("AgriBot API Error:", error);
    throw error;
  }
}
