
import { GoogleGenAI, Type } from "@google/genai";
import { LeopardQuote } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function getLeopardCommentary(score: number, movesLeft: number): Promise<LeopardQuote> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The player is playing "Leopard Leap", a snow leopard themed match-3 game. 
      Current score: ${score}. Moves left: ${movesLeft}. 
      Give a short, pithy comment as a wise Snow Leopard mentor. 
      The comment should be mountain/snow themed.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            mood: { type: Type.STRING, enum: ['happy', 'neutral', 'encouraging'] }
          },
          required: ['text', 'mood']
        }
      }
    });

    return JSON.parse(response.text.trim()) as LeopardQuote;
  } catch (error) {
    console.error("Gemini failed, using fallback:", error);
    return {
      text: "The mountain path is long, but every match is a leap forward!",
      mood: 'neutral'
    };
  }
}
