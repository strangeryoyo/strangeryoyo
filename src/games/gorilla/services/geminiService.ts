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

const GORILLA_FACTS = [
    "Mountain gorillas live in the Virunga Mountains of Central Africa, at elevations up to 4,300 meters.",
    "Gorillas share about 98.3% of their DNA with humans, making them one of our closest relatives.",
    "A male silverback gorilla can weigh over 180 kg (400 lbs) and is about 10 times stronger than an adult human.",
    "Mountain gorillas live in family groups of 5-30 members, led by a dominant silverback.",
    "Gorillas are herbivores and eat about 18 kg (40 lbs) of vegetation every day.",
    "Baby gorillas ride on their mothers' backs until they are about 3 years old.",
    "Gorillas build new sleeping nests every evening from leaves and branches — they never reuse one.",
    "There are only about 1,000 mountain gorillas left in the wild, but their numbers are slowly increasing.",
    "Gorillas can catch human diseases like the cold and flu, which makes ecotourism a careful balance.",
    "Each gorilla has a unique nose print, just like human fingerprints, which researchers use for identification.",
    "Silverback gorillas rarely need to fight — they usually settle disputes with intimidating chest-beating displays.",
    "Gorillas laugh when tickled, and young gorillas play tag and wrestle just like human children.",
    "A gorilla's arm span can reach up to 2.6 meters (8.5 feet) — wider than most humans are tall.",
    "Mountain gorillas spend about 30% of their day eating, 30% traveling, and 40% resting.",
    "Gorillas communicate using over 25 distinct vocalizations, from grunts to barks to screams.",
    "Female gorillas give birth to one baby every 4-6 years, so population recovery is very slow.",
    "Dian Fossey's pioneering research in Rwanda helped save mountain gorillas from extinction.",
    "Gorillas can use simple tools — they've been observed using sticks to test water depth before crossing streams.",
    "A silverback's gray hair appears around age 12 and signals maturity, not old age.",
    "Gorillas are shy and peaceful animals — they only become aggressive when their family is threatened.",
    "Mountain gorillas have thicker fur than lowland gorillas, helping them survive cold mountain temperatures.",
    "Gorillas have been observed mourning their dead, staying close to deceased family members for days.",
    "The mountain gorilla was not discovered by Western scientists until 1902.",
    "Gorillas can live up to 40-50 years in the wild.",
    "Poaching, habitat loss, and disease are the three biggest threats to mountain gorilla survival.",
];

let factIndex = Math.floor(Math.random() * GORILLA_FACTS.length);

export const generateGorillaFact = async (): Promise<string> => {
    if (!ai) {
        const fact = GORILLA_FACTS[factIndex % GORILLA_FACTS.length];
        factIndex++;
        return fact;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Tell me one interesting, scientific, yet surprising fact about Mountain Gorillas. Keep it to one sentence.",
        });
        return response.text || GORILLA_FACTS[factIndex++ % GORILLA_FACTS.length];
    } catch (e) {
        return GORILLA_FACTS[factIndex++ % GORILLA_FACTS.length];
    }
}
