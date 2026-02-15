import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getElephantWisdom = async (score: number, causeOfDeath: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Great job! (Add API Key for elephant wisdom)";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a wise old elephant. A young elephant just finished a training game where they shot down ${score} pesky birds with water but eventually stopped because "${causeOfDeath}". 
      
      Give a very short (max 2 sentences), funny, or encouraging remark about elephants, water physics, or bird annoyance. Be witty.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Failed to get wisdom:", error);
    return "The herd is proud of your water-shooting skills!";
  }
};
