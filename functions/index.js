import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Anthropic from "@anthropic-ai/sdk";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Define the secret - will be stored in Firebase Secret Manager
const claudeApiKey = defineSecret("CLAUDE_API_KEY");

const VALID_GAMES = [
  'shark', 'turtle', 'elephant', 'rhino', 'snow-leopard',
  'pangolin', 'gorilla', 'manta', 'seastar', 'tamarin', 'arctic-seal', 'whale'
];
const LOWER_IS_BETTER = ['rhino'];
const MAX_LEADERBOARD_SIZE = 10;

export const api = onRequest(
  {
    cors: true,
    secrets: [claudeApiKey]
  },
  async (req, res) => {
    // Get the path after /api/
    const path = req.path.replace(/^\/api\/?/, "");

    if (path === "generate-quote" || path === "generate") {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }
      await handleGenerateQuote(req, res);
    } else if (path === "leaderboard/submit") {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }
      await handleLeaderboardSubmit(req, res);
    } else if (path === "leaderboard/all") {
      if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }
      await handleLeaderboardAll(req, res);
    } else if (path.startsWith("leaderboard/")) {
      if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }
      const gameName = path.replace("leaderboard/", "");
      await handleLeaderboardGet(gameName, req, res);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  }
);

async function handleLeaderboardSubmit(req, res) {
  try {
    const { game, playerName, score } = req.body;

    if (!game || !playerName || score === undefined || score === null) {
      res.status(400).json({ error: "Missing game, playerName, or score" });
      return;
    }

    if (!VALID_GAMES.includes(game)) {
      res.status(400).json({ error: "Invalid game name" });
      return;
    }

    if (typeof playerName !== 'string' || playerName.trim().length === 0 || playerName.trim().length > 20) {
      res.status(400).json({ error: "playerName must be 1-20 characters" });
      return;
    }

    if (typeof score !== 'number' || !isFinite(score)) {
      res.status(400).json({ error: "score must be a finite number" });
      return;
    }

    const scoresRef = db.collection('leaderboard').doc(game).collection('scores');
    const lowerIsBetter = LOWER_IS_BETTER.includes(game);
    const sortDirection = lowerIsBetter ? 'asc' : 'desc';

    // Always save the score
    await scoresRef.add({
      playerName: playerName.trim(),
      score,
      timestamp: Date.now()
    });

    // Check if it qualifies for all-time top 10
    const snapshot = await scoresRef.orderBy('score', sortDirection).limit(MAX_LEADERBOARD_SIZE).get();
    const topScores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const topIds = new Set(topScores.map(s => s.id));

    let qualified = topScores.some(s => s.playerName === playerName.trim() && s.score === score);

    // Clean up: delete scores older than 30 days that aren't in the all-time top 10
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const allDocs = await scoresRef.get();
    const deletePromises = [];
    for (const doc of allDocs.docs) {
      const data = doc.data();
      if (!topIds.has(doc.id) && data.timestamp < thirtyDaysAgo) {
        deletePromises.push(doc.ref.delete());
      }
    }
    await Promise.all(deletePromises);

    res.json({ success: true, qualified });
  } catch (error) {
    console.error("Error submitting score:", error);
    res.status(500).json({ error: "Failed to submit score", message: error.message });
  }
}

async function handleLeaderboardGet(gameName, req, res) {
  try {
    if (!VALID_GAMES.includes(gameName)) {
      res.status(400).json({ error: "Invalid game name" });
      return;
    }

    const lowerIsBetter = LOWER_IS_BETTER.includes(gameName);
    const sortDirection = lowerIsBetter ? 'asc' : 'desc';

    const snapshot = await db
      .collection('leaderboard').doc(gameName).collection('scores')
      .orderBy('score', sortDirection)
      .get();

    let leaderboard = snapshot.docs.map(doc => {
      const data = doc.data();
      return { playerName: data.playerName, score: data.score, timestamp: data.timestamp };
    });

    // Optional time filter
    const since = req.query.since ? Number(req.query.since) : null;
    if (since && Number.isFinite(since)) {
      leaderboard = leaderboard.filter(entry => entry.timestamp >= since);
    }

    leaderboard = leaderboard.slice(0, MAX_LEADERBOARD_SIZE);

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard", message: error.message });
  }
}

async function handleLeaderboardAll(req, res) {
  try {
    const champions = {};

    await Promise.all(VALID_GAMES.map(async (game) => {
      const lowerIsBetter = LOWER_IS_BETTER.includes(game);
      const sortDirection = lowerIsBetter ? 'asc' : 'desc';

      const snapshot = await db
        .collection('leaderboard').doc(game).collection('scores')
        .orderBy('score', sortDirection)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        champions[game] = { playerName: data.playerName, score: data.score, timestamp: data.timestamp };
      }
    }));

    res.json({ success: true, champions });
  } catch (error) {
    console.error("Error fetching all leaderboards:", error);
    res.status(500).json({ error: "Failed to fetch leaderboards", message: error.message });
  }
}

async function handleGenerateQuote(req, res) {
  try {
    const { prompt, animal, context } = req.body;

    if (!prompt && !animal) {
      res.status(400).json({ error: "Missing prompt or animal parameter" });
      return;
    }

    const client = new Anthropic({
      apiKey: claudeApiKey.value(),
    });

    // Build the prompt based on what was provided
    let systemPrompt = "You are a wise and playful assistant that generates short, inspiring quotes about endangered animals and nature conservation. Keep responses to 1-2 sentences.";

    let userPrompt = prompt;
    if (!userPrompt && animal) {
      userPrompt = `Generate an inspiring or fun quote about the ${animal}. The quote should be suitable for a video game and relate to conservation or the animal's unique characteristics.`;
    }
    if (context) {
      userPrompt += ` Context: ${context}`;
    }

    const message = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const quote = message.content[0].type === "text"
      ? message.content[0].text
      : "";

    res.json({ quote, success: true });
  } catch (error) {
    console.error("Error generating quote:", error);
    res.status(500).json({
      error: "Failed to generate quote",
      message: error.message
    });
  }
}
