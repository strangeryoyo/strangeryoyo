
import { GoogleGenAI, Modality } from "@google/genai";
import { decodeBase64, decodeAudioData } from "./audioUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
let audioContext: AudioContext | null = null;

export async function getRhinoCommentary(event: string, speed: number, lap: number) {
  try {
    // 1. Generate text commentary
    const textResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The player (a Black Rhino) just ${event}. They are going ${speed.toFixed(0)} km/h on lap ${lap}. Give a short, 1-sentence aggressive and cool rhino-themed commentary.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 60,
      },
    });
    
    const commentaryText = textResponse.text || "STAMPEDE INCOMING!";

    // 2. Convert to Speech using Gemini TTS
    try {
      if (!audioContext) audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with deep enthusiasm and a powerful, gravelly voice: ${commentaryText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep, powerful voice
            },
          },
        },
      });

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(
          decodeBase64(base64Audio),
          audioContext,
          24000,
          1
        );
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (ttsErr) {
      console.warn("TTS failed, just showing text", ttsErr);
    }

    return commentaryText;
  } catch (error) {
    console.error("Commentary error:", error);
    return "The Rhino rumbles with power!";
  }
}
