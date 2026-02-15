
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getStingrayFact(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Tell me one short, interesting, and fun fact about stingrays. Keep it under 150 characters.",
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });
    return response.text?.trim() || "Stingrays are cartilaginous fish, related to sharks!";
  } catch (error) {
    console.error("Error fetching stingray fact:", error);
    return "Stingrays are beautiful masters of the ocean floor.";
  }
}

export async function getGameOverMessage(score: number): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The player just finished a stingray game with a score of ${score}. Give them a brief, punny, ocean-themed encouragement. Keep it under 100 characters.`,
      config: {
        temperature: 0.9,
      }
    });
    return response.text?.trim() || "Don't let it get you down, you're doing swimmingly!";
  } catch (error) {
    return "Nice effort! Swim again?";
  }
}
