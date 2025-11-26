import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import SimpleChessboard from './SimpleChessboard';
import EvaluationBar from './EvaluationBar';
import { 
  getRecentGames, 
  parsePGN, 
  formatGameResult,
  formatGameResultFull, 
  formatGameDate
} from '../services/chessComService';
import './ChessMatchViewer.css';

function ChessMatchViewer({ username = 'abdussamiakanda' }) {
  const [games, setGames] = useState([]);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Move navigation states
  const [viewingMoveIndex, setViewingMoveIndex] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameHeaders, setGameHeaders] = useState({});
  const [lastMove, setLastMove] = useState(null);

  // Fetch games on component mount
  useEffect(() => {
    fetchGames();
  }, [username]);

  // Initialize selected game
  useEffect(() => {
    if (games.length > 0 && games[selectedGameIndex]) {
      initializeGame(games[selectedGameIndex]);
    }
  }, [selectedGameIndex, games]);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const recentGames = await getRecentGames(username, 2); // Fetch last 2 months
      // Limit to last 50 matches
      const limitedGames = recentGames.slice(0, 50);
      setGames(limitedGames);
      if (limitedGames.length > 0) {
        setSelectedGameIndex(0);
      }
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to load games. Please check the username or try again later.');
    } finally {
      setLoading(false);
    }
  };

  const initializeGame = (game) => {
    try {
      const { moves, headers } = parsePGN(game.pgn);
      
      if (moves.length === 0) {
        console.warn('No moves parsed from PGN');
        setError('Failed to parse game moves.');
        return;
      }
      
      setGameHeaders(headers);
      setMoveHistory(moves);
      setViewingMoveIndex(moves.length); // Start at the end
      
      // Calculate final position
      const chess = new Chess();
      const validMoves = [];
      
      moves.forEach((move, index) => {
        try {
          chess.move(move);
          validMoves.push(move);
        } catch (e) {
          console.warn(`Invalid move at index ${index}:`, move);
        }
      });
      
      setMoveHistory(validMoves); // Only keep valid moves
      setViewingMoveIndex(validMoves.length);
      setCurrentPosition(chess.fen());
      setLastMove(null);
    } catch (err) {
      console.error('Error initializing game:', err);
      setError('Failed to load game data.');
    }
  };

  const calculatePosition = (moveIndex) => {
    const chess = new Chess();
    let lastMoveObj = null;
    
    for (let i = 0; i < moveIndex; i++) {
      try {
        lastMoveObj = chess.move(moveHistory[i]);
      } catch (e) {
        console.warn('Invalid move at index', i, ':', moveHistory[i]);
        break;
      }
    }
    
    return { fen: chess.fen(), lastMove: lastMoveObj };
  };

  // Navigation functions
  const goToFirstMove = () => {
    setViewingMoveIndex(0);
    setCurrentPosition(new Chess().fen());
    setLastMove(null);
  };

  const goToPreviousMove = () => {
    if (viewingMoveIndex > 0) {
      const newIndex = viewingMoveIndex - 1;
      setViewingMoveIndex(newIndex);
      const result = calculatePosition(newIndex);
      setCurrentPosition(result.fen);
      setLastMove(result.lastMove);
    }
  };

  const goToNextMove = () => {
    if (viewingMoveIndex < moveHistory.length) {
      const newIndex = viewingMoveIndex + 1;
      setViewingMoveIndex(newIndex);
      const result = calculatePosition(newIndex);
      setCurrentPosition(result.fen);
      setLastMove(result.lastMove);
    }
  };

  const goToLastMove = () => {
    const newIndex = moveHistory.length;
    setViewingMoveIndex(newIndex);
    const result = calculatePosition(newIndex);
    setCurrentPosition(result.fen);
    setLastMove(result.lastMove);
  };

  const goToMove = (index) => {
    setViewingMoveIndex(index);
    const result = calculatePosition(index);
    setCurrentPosition(result.fen);
    setLastMove(result.lastMove);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousMove();
      } else if (e.key === 'ArrowRight') {
        goToNextMove();
      } else if (e.key === 'Home') {
        goToFirstMove();
      } else if (e.key === 'End') {
        goToLastMove();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [viewingMoveIndex, moveHistory]);

  const handleGameSelect = (index) => {
    setSelectedGameIndex(index);
  };

  const getPlayerColor = (game) => {
    return game.white.username.toLowerCase() === username.toLowerCase() ? 'white' : 'black';
  };

  const getOpponentName = (game) => {
    const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
    return isWhite ? game.black.username : game.white.username;
  };


  // Generate custom square styles for last move highlighting
  const getCustomSquareStyles = () => {
    if (!lastMove) return {};
    
    return {
      [lastMove.from]: {
        backgroundColor: 'rgba(255, 238, 88, 0.35)'
      },
      [lastMove.to]: {
        backgroundColor: 'rgba(255, 238, 88, 0.35)'
      }
    };
  };

  // Calculate game result indicators (crowns/icons above kings)
  const getGameResultIndicators = () => {
    const indicators = {};
    
    // Only show indicators when viewing the final position
    if (viewingMoveIndex === moveHistory.length && selectedGame && currentPosition) {
      const userResult = selectedGame[getPlayerColor(selectedGame)].result;
      const isWhiteUser = getPlayerColor(selectedGame) === 'white';
      
      // Find king positions from current position
      try {
        const chess = new Chess(currentPosition);
        const board = chess.board();
        let whiteKingSquare = null;
        let blackKingSquare = null;
        
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.type === 'k') {
              const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
              const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
              const squareName = files[col] + ranks[row];
              if (piece.color === 'w') {
                whiteKingSquare = squareName;
              } else {
                blackKingSquare = squareName;
              }
            }
          }
        }
        
        // Determine indicators based on game result
        if (userResult === 'win') {
          // User won
          if (isWhiteUser && whiteKingSquare) indicators[whiteKingSquare] = 'win';
          if (isWhiteUser && blackKingSquare) indicators[blackKingSquare] = 'loss';
          if (!isWhiteUser && blackKingSquare) indicators[blackKingSquare] = 'win';
          if (!isWhiteUser && whiteKingSquare) indicators[whiteKingSquare] = 'loss';
        } else if (userResult === 'checkmated' || userResult === 'resigned' || userResult === 'timeout') {
          // User lost (checkmated, resigned, or timed out)
          if (isWhiteUser && whiteKingSquare) indicators[whiteKingSquare] = 'loss';
          if (isWhiteUser && blackKingSquare) indicators[blackKingSquare] = 'win';
          if (!isWhiteUser && blackKingSquare) indicators[blackKingSquare] = 'loss';
          if (!isWhiteUser && whiteKingSquare) indicators[whiteKingSquare] = 'win';
        } else if (['agreed', 'stalemate', 'repetition', 'insufficient', '50move', 'timevsinsufficient'].includes(userResult)) {
          // Draw
          if (whiteKingSquare) indicators[whiteKingSquare] = 'draw';
          if (blackKingSquare) indicators[blackKingSquare] = 'draw';
        }
      } catch (err) {
        // If position is invalid, don't show indicators
        console.warn('Error parsing position for indicators:', err);
      }
    }
    
    return indicators;
  };

  if (loading) {
    return (
      <div className="chess-match-viewer-container">
        <div className="match-viewer-loading">
          <div className="loader"></div>
          <p>Loading Chess.com games...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chess-match-viewer-container">
        <div className="match-viewer-error">
          <p>{'⚠\uFE0E'} {error}</p>
          <button onClick={fetchGames} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="chess-match-viewer-container">
        <div className="match-viewer-empty">
          <p>No recent games found for {username}</p>
        </div>
      </div>
    );
  }

  const selectedGame = games[selectedGameIndex];
  const playerColor = getPlayerColor(selectedGame);

  return (
    <div className="chess-match-viewer-container">
      <div className="match-viewer-header">
        <h2 className="match-viewer-title">
          My Chess.com Games
        </h2>
        <div className="match-viewer-stats">
          <span>{games.length} recent games</span>
        </div>
      </div>

      <div className="match-viewer-layout">
        {/* Games List */}
        <div className="games-list-section">
          <h3 className="games-list-title">Recent Matches</h3>
          <div className="games-list">
            {games.map((game, index) => {
              const isSelected = index === selectedGameIndex;
              const opponent = getOpponentName(game);
              const result = formatGameResult(game, username);
              const date = formatGameDate(game.end_time);

              return (
                <div
                  key={`${game.url}-${index}`}
                  className={`game-list-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleGameSelect(index)}
                >
                  <div className="game-item-header">
                    <span className="game-opponent">{opponent}</span>
                    <span className={`game-result ${result.includes('W') ? 'win' : result.includes('L') ? 'loss' : 'draw'}`}>
                      {result}
                    </span>
                  </div>
                  <div className="game-item-date">{date}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Viewer */}
        <div className="game-viewer-section">
          <div className="game-viewer-info">
            <div className="game-info-header">
              <div className="game-players">
                <div className="player-name-display white-player">
                  <span className="player-name">{selectedGame.white.username}</span>
                  <span className="player-rating">({selectedGame.white.rating})</span>
                </div>
                <span className="vs-text">vs</span>
                <div className="player-name-display black-player">
                  <span className="player-name">{selectedGame.black.username}</span>
                  <span className="player-rating">({selectedGame.black.rating})</span>
                </div>
              </div>
              <div className="game-meta">
                <span className="game-date-display">{formatGameDate(selectedGame.end_time)}</span>
                <span className="game-result-display">
                  Result: {formatGameResultFull(selectedGame, username)}
                </span>
              </div>
            </div>
          </div>

          <div className="game-board-wrapper">
            <EvaluationBar 
              fen={currentPosition || new Chess().fen()} 
              flipped={playerColor === 'black'} 
            />
            <div className="game-board-container">
              <SimpleChessboard
                position={currentPosition || new Chess().fen()}
                flipped={playerColor === 'black'}
                onSquareClick={null}
                customSquareStyles={getCustomSquareStyles()}
                gameResultIndicators={getGameResultIndicators()}
              />
            </div>
          </div>

          {/* Move Navigation */}
          <div className="move-navigation-panel">
            <div className="move-navigation-controls">
              <button 
                onClick={goToFirstMove} 
                disabled={viewingMoveIndex === 0}
                className="nav-btn"
                title="First move (Home)"
              >
                {'⏮\uFE0E'}
              </button>
              <button 
                onClick={goToPreviousMove} 
                disabled={viewingMoveIndex === 0}
                className="nav-btn"
                title="Previous move (←)"
              >
                {'◀\uFE0E'}
              </button>
              <button 
                onClick={goToNextMove} 
                disabled={viewingMoveIndex === moveHistory.length}
                className="nav-btn"
                title="Next move (→)"
              >
                {'▶\uFE0E'}
              </button>
              <button 
                onClick={goToLastMove} 
                disabled={viewingMoveIndex === moveHistory.length}
                className="nav-btn"
                title="Last move (End)"
              >
                {'⏭\uFE0E'}
              </button>
            </div>

            {/* Move History */}
            <div className="move-history-viewer">
              <div className="move-history-list">
                {moveHistory.map((move, index) => {
                  const moveNumber = Math.floor(index / 2) + 1;
                  const isWhiteMove = index % 2 === 0;

                  if (isWhiteMove) {
                    const isWhiteActive = index === viewingMoveIndex - 1;
                    const isBlackActive = index + 1 < moveHistory.length && index + 1 === viewingMoveIndex - 1;

                    return (
                      <div key={index} className="move-pair">
                        <span className="move-number">{moveNumber}.</span>
                        <span
                          className={`move-text move-white ${isWhiteActive ? 'active-move' : ''}`}
                          onClick={() => goToMove(index + 1)}
                        >
                          {move}
                        </span>
                        {moveHistory[index + 1] && (
                          <span
                            className={`move-text move-black ${isBlackActive ? 'active-move' : ''}`}
                            onClick={() => goToMove(index + 2)}
                          >
                            {moveHistory[index + 1]}
                          </span>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>

          <div className="game-link">
            <a 
              href={selectedGame.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-view-on-chess-com"
            >
              View on Chess.com →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChessMatchViewer;

