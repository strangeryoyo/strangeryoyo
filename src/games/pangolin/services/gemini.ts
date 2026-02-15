import { GoogleGenAI, Type } from "@google/genai";
import { FactResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelId = "gemini-2.5-flash";

export const generatePangolinFact = async (context: string): Promise<FactResponse> => {
  if (!apiKey) {
    return {
      fact: "The Sunda pangolin (Manis javanica) is critically endangered due to poaching.",
      topic: "Conservation"
    };
  }

  try {
    const prompt = `Generate a unique, short, and educational fact about the Sunda Pangolin. 
    Context: The player just lost the game by hitting a "${context}".
    If the context is "predator", mention natural predators or defense mechanisms.
    If "trap", mention poaching/trafficking.
    If "log", mention habitat loss.
    Otherwise, general biology.
    Keep it under 2 sentences. 
    Return strictly JSON.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fact: { type: Type.STRING },
            topic: { type: Type.STRING }
          },
          required: ["fact", "topic"]
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as FactResponse;
    }
    throw new Error("No response text");

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      fact: "Pangolins are the only mammals wholly-covered in scales and they use them to protect themselves from predators in the wild.",
      topic: "Biology"
    };
  }
};
