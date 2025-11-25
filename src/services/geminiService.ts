import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Language } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const askOpticsExpert = async (
  query: string,
  history: ChatMessage[],
  language: Language
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const langInstruction = language === 'zh' 
      ? "Reply in Simplified Chinese. Explain concepts using standard Machine Vision terminology in Chinese." 
      : "Reply in English.";

    const systemInstruction = `
      You are an expert Professor of Machine Vision and Optics. 
      Your goal is to explain lighting techniques to students simply and clearly.
      
      Current Topic: Bright Field vs. Dark Field Lighting.
      
      Rules:
      1. ${langInstruction}
      2. Keep answers concise (under 150 words) unless asked for detail.
      3. Use analogies (e.g., "like a mirror" or "like driving in fog").
      4. Focus on the physics of reflection (Angle of Incidence = Angle of Reflection).
      5. Formatting: Use bullet points for clarity.
    `;

    const contents = [
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      })),
      {
        role: 'user',
        parts: [{ text: query }]
      }
    ];

    const response = await ai.models.generateContent({
      model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || (language === 'zh' ? "抱歉，我现在无法回答光学问题。" : "I couldn't generate a response regarding optics at the moment.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'zh' 
      ? "连接 AI 导师失败，请检查 API 密钥。" 
      : "Error connecting to the Optics AI Tutor. Please check your API key.";
  }
};