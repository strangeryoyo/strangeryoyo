interface LeaderboardEntry {
  playerName: string;
  score: number;
  timestamp: number;
}

interface AllResponse {
  success: boolean;
  leaderboards: Record<string, LeaderboardEntry[]>;
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
  'whale': { emoji: '🐋', label: 'Whale' },
};

const MEDALS = ['🥇', '🥈', '🥉'];

function formatScore(game: string, score: number): string {
  if (GAME_INFO[game]?.lowerIsBetter) {
    return (score / 1000).toFixed(2) + 's';
  }
  return score.toLocaleString();
}

function getWeekStart(): number {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

let currentMode: 'week' | 'all' = 'week';

function renderCards(leaderboards: Record<string, LeaderboardEntry[]>) {
  const container = document.getElementById('champions-container');
  if (!container) return;

  const html = Object.entries(GAME_INFO).map(([game, info]) => {
    const entries = leaderboards[game] || [];
    const hasEntries = entries.length > 0;

    const playersHtml = hasEntries
      ? entries.map((entry, i) =>
          `<div class="card-player-row">
            <span class="card-medal">${MEDALS[i]}</span>
            <span class="card-player-name">${entry.playerName}</span>
            <span class="card-player-score">${formatScore(game, entry.score)}</span>
          </div>`
        ).join('')
      : '<div class="card-empty">No scores yet...</div>';

    return `
      <a href="/games/${game}/" class="champion-card ${hasEntries ? 'has-champion' : ''}" style="text-decoration:none;color:inherit;">
        <span class="card-emoji">${info.emoji}</span>
        <div class="card-info">
          <div class="card-game">${info.label}</div>
          ${playersHtml}
        </div>
      </a>`;
  }).join('');

  container.innerHTML = `<div class="champions-grid">${html}</div>`;
}

async function loadLeaderboards() {
  const container = document.getElementById('champions-container');
  if (!container) return;

  container.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const since = currentMode === 'week' ? getWeekStart() : undefined;
    const url = since
      ? `/api/leaderboard/all?top=3&since=${since}`
      : '/api/leaderboard/all?top=3';
    const res = await fetch(url);
    const data: AllResponse = await res.json();

    if (!data.success) {
      container.innerHTML = '<div class="loading">Failed to load leaderboards</div>';
      return;
    }

    renderCards(data.leaderboards);
  } catch {
    container.innerHTML = '<div class="loading">Failed to load leaderboards</div>';
  }
}

function initToggle() {
  const weekBtn = document.getElementById('btn-week');
  const allBtn = document.getElementById('btn-all');
  if (!weekBtn || !allBtn) return;

  function updateButtons() {
    weekBtn!.className = `toggle-btn ${currentMode === 'week' ? 'active' : ''}`;
    allBtn!.className = `toggle-btn ${currentMode === 'all' ? 'active' : ''}`;
  }

  weekBtn.addEventListener('click', () => {
    currentMode = 'week';
    updateButtons();
    loadLeaderboards();
  });

  allBtn.addEventListener('click', () => {
    currentMode = 'all';
    updateButtons();
    loadLeaderboards();
  });

  updateButtons();
}

initToggle();
loadLeaderboards();
