import { GoogleGenAI, Type } from "@google/genai";
import { JungleWisdom } from '../types';

// Initialize the client. The key is expected to be in process.env.API_KEY
// If it's missing, the service handles it gracefully by returning mock data.
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateJungleWisdom = async (score: number, bananas: number): Promise<JungleWisdom> => {
  if (!ai) {
    return {
      title: "Elder Gorilla Says...",
      content: "Deep in the jungle, silence is the loudest sound. (Add API Key for real wisdom!)"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, funny, or philosophical piece of "Jungle Wisdom" for a player who just finished a game as a mountain gorilla.
      They scored ${score} points and collected ${bananas} bananas.
      If the score is high (>1000), praise them as "King of the Canopy".
      If low, encourage them to "stop slipping on peels".
      Keep it under 30 words.
      Return JSON with 'title' and 'content' fields.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["title", "content"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text response");
    
    return JSON.parse(text) as JungleWisdom;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      title: "The Wind Whispers...",
      content: "Even the mightiest gorilla misses a branch sometimes. Try again!"
    };
  }
};

export const generateGorillaFact = async (): Promise<string> => {
    if (!ai) return "Mountain gorillas live in the Virunga Mountains.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Tell me one interesting, scientific, yet surprising fact about Mountain Gorillas. Keep it to one sentence.",
        });
        return response.text || "Gorillas are generally gentle giants.";
    } catch (e) {
        return "Gorillas share 98% of their DNA with humans.";
    }
}
