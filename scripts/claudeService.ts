// Claude API service - calls Firebase function
const API_ENDPOINT = "/api/generate-quote";

async function callClaudeAPI(prompt: string): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    return data.quote || "The journey continues...";
  } catch (error) {
    console.error("Claude API error:", error);
    return "The journey continues...";
  }
}

// Generic function that can be used by games
export async function generateQuote(context: string): Promise<string> {
  return callClaudeAPI(context);
}

// Zen Panda specific
export async function generateGrowthComment(size: number): Promise<string> {
  const prompt = `The player is a red panda in a growth game. They are currently size ${size.toFixed(1)}. Write a short, poetic, and slightly funny one-sentence comment about their growing size. Use a 'Zen Master' or 'Nature Spirit' tone. Max 15 words.`;
  return callClaudeAPI(prompt);
}

// Generic game quote
export async function generateGameQuote(animal: string, context: string): Promise<string> {
  const prompt = `Generate a short inspiring quote for a ${animal} game. Context: ${context}. Max 15 words.`;
  return callClaudeAPI(prompt);
}
