
import { GoogleGenAI, Type } from "@google/genai";
import { MarineFact } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchMarineFact(score: number): Promise<MarineFact> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The player just scored ${score} in a sea turtle crossing game. Provide a short, interesting, and educational fact about sea turtles or marine conservation. Focus on threats like plastic pollution, habitat loss, or shark predation if applicable. Keep it under 150 characters.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fact: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["fact", "category"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as MarineFact;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      fact: "Sea turtles can live for over 50 years and travel thousands of miles across oceans.",
      category: "General"
    };
  }
}
