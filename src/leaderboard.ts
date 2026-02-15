interface LeaderboardEntry {
  playerName: string;
  score: number;
  timestamp: number;
}

interface ChampionsResponse {
  success: boolean;
  champions: Record<string, LeaderboardEntry>;
}

const GAME_INFO: Record<string, { emoji: string; label: string; lowerIsBetter?: boolean }> = {
  'shark': { emoji: '🦈', label: 'Shark' },
  'turtle': { emoji: '🐢', label: 'Turtle' },
  'elephant': { emoji: '🐘', label: 'Elephant' },
  'rhino': { emoji: '🦏', label: 'Rhino', lowerIsBetter: true },
  'snow-leopard': { emoji: '🐆', label: 'Snow Leopard' },
  'pangolin': { emoji: '🦔', label: 'Pangolin' },
  'gorilla': { emoji: '🦍', label: 'Gorilla' },
  'manta': { emoji: '🐟', label: 'Manta' },
  'seastar': { emoji: '⭐', label: 'Seastar' },
  'tamarin': { emoji: '🐵', label: 'Tamarin' },
  'arctic-seal': { emoji: '🦭', label: 'Arctic Seal' },
};

function formatScore(game: string, score: number): string {
  if (GAME_INFO[game]?.lowerIsBetter) {
    return (score / 1000).toFixed(2) + 's';
  }
  return score.toLocaleString();
}

async function loadChampions() {
  const container = document.getElementById('champions-container');
  if (!container) return;

  try {
    const res = await fetch('/api/leaderboard/all');
    const data: ChampionsResponse = await res.json();

    if (!data.success) {
      container.innerHTML = '<div class="loading">Failed to load champions</div>';
      return;
    }

    const html = Object.entries(GAME_INFO).map(([game, info]) => {
      const champion = data.champions[game];
      if (champion) {
        return `
          <a href="/games/${game}/" class="champion-card has-champion" style="text-decoration:none;color:inherit;">
            <span class="card-emoji">${info.emoji}</span>
            <div class="card-info">
              <div class="card-game">${info.label}</div>
              <div class="card-player">👑 ${champion.playerName}</div>
              <div class="card-score">${formatScore(game, champion.score)}</div>
            </div>
          </a>`;
      } else {
        return `
          <a href="/games/${game}/" class="champion-card" style="text-decoration:none;color:inherit;">
            <span class="card-emoji">${info.emoji}</span>
            <div class="card-info">
              <div class="card-game">${info.label}</div>
              <div class="card-empty">No champion yet...</div>
            </div>
          </a>`;
      }
    }).join('');

    container.innerHTML = `<div class="champions-grid">${html}</div>`;
  } catch {
    container.innerHTML = '<div class="loading">Failed to load champions</div>';
  }
}

loadChampions();
