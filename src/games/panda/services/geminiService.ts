
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateGrowthComment(size: number) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The player is a red panda in a growth game. They are currently size ${size.toFixed(1)}. 
      Write a short, poetic, and slightly funny one-sentence comment about their growing size. 
      Use a 'Zen Master' or 'Nature Spirit' tone. Max 15 words.`,
    });
    return response.text?.trim() || "The forest welcomes its new mountain.";
  } catch (error) {
    return "Growth is the only constant.";
  }
}
