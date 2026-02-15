#!/bin/bash

# Games that use Gemini API and their folder names
declare -A GAMES=(
  ["zen-panda_-path-of-growth"]="zen-panda_-path-of-growth"
  ["gorilla-grove_-canopy-jumper"]="gorilla-grove_-canopy-jumper"
  ["leopard-leap_-snowy-scramble"]="leopard-leap_-snowy-scramble"
  ["manta-marauder"]="manta-marauder"
  ["ocean-odyssey_-turtle-cross"]="ocean-odyssey_-turtle-cross"
  ["sunda-roll_-pangolin-protector"]="sunda-roll_-pangolin-protector"
  ["sunflower-seastar-merge"]="sunflower-seastar-merge"
  ["tamarin-trek_-canopy-climb"]="tamarin-trek_-canopy-climb"
  ["the-pale-odyssey_-legend-of-the-white-whale"]="the-pale-odyssey_-legend-of-the-white-whale"
  ["trunk-shot-3d"]="trunk-shot-3d"
  ["gemini-aether-maze"]="white-tiger"
)

DOWNLOADS_DIR="$HOME/Downloads"
GAMES_DIR="/Users/mfucci/git/strangeryoyo/public/games"

for zipname in "${!GAMES[@]}"; do
  gamedir="${GAMES[$zipname]}"
  zipfile="$DOWNLOADS_DIR/$zipname.zip"

  if [ ! -f "$zipfile" ]; then
    echo "Skipping $zipname - zip not found"
    continue
  fi

  echo "Processing: $zipname -> $gamedir"

  # Create temp directory
  tmpdir=$(mktemp -d)

  # Extract
  unzip -q "$zipfile" -d "$tmpdir"
  cd "$tmpdir"

  # Check if geminiService exists
  if [ -f "services/geminiService.ts" ]; then
    # Get the function names from the existing service
    funcs=$(grep "^export async function" services/geminiService.ts | sed 's/export async function \([a-zA-Z_]*\).*/\1/')

    # Create Claude service replacement
    cat > services/geminiService.ts << 'CLAUDESERVICE'
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
    return data.quote || data.text || "The journey continues...";
  } catch (error) {
    console.error("Claude API error:", error);
    return "The journey continues...";
  }
}

CLAUDESERVICE

    # Re-add the exported functions with Claude API calls
    for func in $funcs; do
      # Get original function signature and prompt content
      original=$(grep -A20 "export async function $func" "$zipfile" 2>/dev/null || echo "")

      # Add a generic wrapper
      echo "" >> services/geminiService.ts
      echo "export async function $func(...args: any[]): Promise<string> {" >> services/geminiService.ts
      echo "  const prompt = \`Generate a short, inspiring quote for a game. Context: \${JSON.stringify(args)}\`;" >> services/geminiService.ts
      echo "  return callClaudeAPI(prompt);" >> services/geminiService.ts
      echo "}" >> services/geminiService.ts
    done

    echo "  Updated geminiService.ts"
  fi

  # Remove @google/genai from import map in index.html
  if [ -f "index.html" ]; then
    sed -i.bak '/"@google\/genai"/d' index.html
    rm -f index.html.bak
    echo "  Removed @google/genai import"
  fi

  # Install and build
  npm install --silent 2>/dev/null
  npm run build -- --base="./" 2>/dev/null

  if [ -d "dist" ]; then
    rm -rf "$GAMES_DIR/$gamedir"
    cp -r dist "$GAMES_DIR/$gamedir"
    echo "  Built and installed to games/$gamedir"
  else
    echo "  FAILED to build"
  fi

  cd /Users/mfucci/git/strangeryoyo
  rm -rf "$tmpdir"
done

echo "Done!"
