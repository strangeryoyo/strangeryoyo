
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMarineFact = async (itemName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Give me a very short, fun, and surprising one-sentence fact about the ${itemName} in the ocean. Keep it under 20 words. Focus on ecology or cool abilities.`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text?.trim() || "The ocean is full of mysteries!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The Sunflower Seastar can have up to 24 arms!";
  }
};
