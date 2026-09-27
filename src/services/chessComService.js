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
