
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchRainforestFact(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Tell me a short, fascinating fact (under 20 words) about the Golden Lion Tamarin and its habitat in the Brazilian Atlantic Forest. Make it encouraging for someone who just finished playing a game.",
      config: {
        temperature: 0.8,
      },
    });

    return response.text?.trim() || "The Golden Lion Tamarin is a symbol of Brazil's Atlantic Forest conservation!";
  } catch (error) {
    console.error("Failed to fetch fact:", error);
    return "Golden Lion Tamarins use their long fingers to find insects in tree bark!";
  }
}
