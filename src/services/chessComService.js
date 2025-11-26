/**
 * Chess.com Public API Service
 * API Documentation: https://www.chess.com/news/view/published-data-api
 */

const CHESS_COM_API_BASE = 'https://api.chess.com/pub';

/**
 * Fetch all available game archives for a player
 * @param {string} username - Chess.com username
 * @returns {Promise<string[]>} - Array of archive URLs
 */
export async function getPlayerArchives(username) {
  try {
    const response = await fetch(`${CHESS_COM_API_BASE}/player/${username}/games/archives`);
    if (!response.ok) {
      throw new Error(`Failed to fetch archives: ${response.status}`);
    }
    const data = await response.json();
    return data.archives || [];
  } catch (error) {
    console.error('Error fetching player archives:', error);
    throw error;
  }
}

/**
 * Fetch games from a specific archive URL
 * @param {string} archiveUrl - Full archive URL from getPlayerArchives
 * @returns {Promise<Object[]>} - Array of game objects
 */
export async function getGamesFromArchive(archiveUrl) {
  try {
    const response = await fetch(archiveUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.status}`);
    }
    const data = await response.json();
    return data.games || [];
  } catch (error) {
    console.error('Error fetching games from archive:', error);
    throw error;
  }
}

/**
 * Fetch recent games for a player
 * @param {string} username - Chess.com username
 * @param {number} monthsToFetch - Number of recent months to fetch (default: 3)
 * @returns {Promise<Object[]>} - Array of game objects, sorted by date (newest first)
 */
export async function getRecentGames(username, monthsToFetch = 3) {
  try {
    const archives = await getPlayerArchives(username);
    
    if (!archives || archives.length === 0) {
      return [];
    }

    // Get the most recent N months
    const recentArchives = archives.slice(-monthsToFetch);
    
    // Fetch games from all recent archives in parallel
    const gamesPromises = recentArchives.map(archiveUrl => getGamesFromArchive(archiveUrl));
    const gamesArrays = await Promise.all(gamesPromises);
    
    // Flatten the array of arrays and sort by end_time (newest first)
    const allGames = gamesArrays.flat();
    allGames.sort((a, b) => b.end_time - a.end_time);
    
    return allGames;
  } catch (error) {
    console.error('Error fetching recent games:', error);
    throw error;
  }
}

/**
 * Parse PGN string to extract moves
 * @param {string} pgn - PGN string
 * @returns {Object} - { moves: string[], headers: Object }
 */
export function parsePGN(pgn) {
  if (!pgn) {
    return { moves: [], headers: {} };
  }

  const lines = pgn.split('\n');
  const headers = {};
  let movesText = '';

  // Parse headers and moves
  for (const line of lines) {
    if (line.startsWith('[')) {
      // Parse header line: [Key "Value"]
      const match = line.match(/\[(\w+)\s+"([^"]+)"\]/);
      if (match) {
        headers[match[1]] = match[2];
      }
    } else if (line.trim() && !line.startsWith('[')) {
      movesText += line + ' ';
    }
  }

  // Remove comments in braces and parentheses
  movesText = movesText.replace(/\{[^}]*\}/g, '');
  movesText = movesText.replace(/\([^)]*\)/g, '');
  
  // Remove annotations like ?!, !!, ?, !, etc.
  movesText = movesText.replace(/[?!]+/g, '');
  
  // Remove game result
  movesText = movesText.replace(/\s*(1-0|0-1|1\/2-1\/2|\*)\s*$/, '');
  
  // Extract moves using improved regex for Standard Algebraic Notation
  // Matches: piece moves (Nf3), pawn moves (e4), captures (exd5), castling (O-O, O-O-O), promotions (e8=Q)
  const movePattern = /\b([NBRQK][a-h]?[1-8]?x?[a-h][1-8]|[a-h][1-8]|[a-h]x[a-h][1-8]|[a-h][1-8]=[NBRQ]|O-O(?:-O)?)[+#]?/g;
  const moves = [];
  let match;

  while ((match = movePattern.exec(movesText)) !== null) {
    moves.push(match[1]);
  }

  return { moves, headers };
}

/**
 * Format game result for display
 * @param {Object} game - Game object from Chess.com API
 * @param {string} username - Current user's username
 * @returns {string} - Formatted result string
 */
export function formatGameResult(game, username) {
  const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
  const userColor = isWhite ? 'white' : 'black';
  const userResult = game[userColor].result;

  if (userResult === 'win') return '✓\uFE0E W';
  if (userResult === 'checkmated') return '✗\uFE0E L';
  if (userResult === 'agreed') return '½\uFE0E D';
  if (userResult === 'stalemate') return '½\uFE0E D';
  if (userResult === 'timeout') return '⏱\uFE0E T';
  if (userResult === 'resigned') return '🏳\uFE0E R';
  if (userResult === 'abandoned') return '⚠\uFE0E A';
  if (userResult === 'repetition') return '½\uFE0E R';
  if (userResult === 'insufficient') return '½\uFE0E I';
  if (userResult === '50move') return '½\uFE0E D';
  if (userResult === 'timevsinsufficient') return '½\uFE0E D';

  return userResult || 'Unknown';
}

/**
 * Format game result for display (full text)
 * @param {Object} game - Game object from Chess.com API
 * @param {string} username - Current user's username
 * @returns {string} - Formatted result string with full text
 */
export function formatGameResultFull(game, username) {
  const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
  const userColor = isWhite ? 'white' : 'black';
  const userResult = game[userColor].result;

  if (userResult === 'win') return 'Victory';
  if (userResult === 'checkmated') return 'Checkmate';
  if (userResult === 'agreed') return 'Draw by Agreement';
  if (userResult === 'stalemate') return 'Stalemate';
  if (userResult === 'timeout') return 'Time Out';
  if (userResult === 'resigned') return 'Resignation';
  if (userResult === 'abandoned') return 'Abandoned';
  if (userResult === 'repetition') return 'Draw by Repetition';
  if (userResult === 'insufficient') return 'Insufficient Material';
  if (userResult === '50move') return 'Draw by 50-Move Rule';
  if (userResult === 'timevsinsufficient') return 'Draw - Time vs Insufficient';

  return userResult || 'Unknown';
}

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - Formatted date string
 */
export function formatGameDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

