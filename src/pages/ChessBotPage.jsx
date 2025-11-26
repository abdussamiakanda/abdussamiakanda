import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chess } from 'chess.js';
import SimpleChessboard from '../components/SimpleChessboard';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { seoConfig } from '../utils/seoConfig';
import './ChessPage.css';
import './ChessBotPage.css';

const API_URL = 'https://abdussamiakanda.pythonanywhere.com/chessbot/move';

async function getBotMove(moves) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model: 'sami',        // Use your style model
        moves, 
        topk: 0, 
        temperature: 0,
        depth: 6,             // Force deeper search
        max_ms: 500,          // More thinking time (was 300)
        limit_moves: 8        // Focus on best moves
      })
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error getting bot move:', error);
    throw error;
  }
}

function ChessBotPage() {
  const [game, setGame] = useState(() => new Chess());
  const [gamePosition, setGamePosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [playerColor, setPlayerColor] = useState('w');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [moveHistoryUci, setMoveHistoryUci] = useState([]);
  const [moveTimes, setMoveTimes] = useState([]); // Track time taken for each move
  const [timeElapsed, setTimeElapsed] = useState({ w: 600, b: 600 });
  const [moveStartTime, setMoveStartTime] = useState(null); // Track when current move started
  const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] }); // Captured pieces by white and black
  const [apiError, setApiError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [boardKey, setBoardKey] = useState(0);
  const [lastMove, setLastMove] = useState(null); // { from: 'e2', to: 'e4' }
  const [viewingMoveIndex, setViewingMoveIndex] = useState(null); // null means viewing current position
  const [showGameOverOverlay, setShowGameOverOverlay] = useState(true); // Track overlay visibility

  // Reset overlay visibility when game ends
  useEffect(() => {
    const currentGame = new Chess(gamePosition);
    const gameIsOver = currentGame.isGameOver() || timeElapsed.w <= 0 || timeElapsed.b <= 0;
    if (gameIsOver && gameStarted) {
      setShowGameOverOverlay(true);
    }
  }, [gamePosition, timeElapsed, gameStarted]);

  // Keyboard navigation for moves
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (moveHistory.length === 0) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousMove();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextMove();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToFirstMove();
      } else if (e.key === 'End') {
        e.preventDefault();
        goToLastMove();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveHistory.length, viewingMoveIndex]);

  // Timer
  useEffect(() => {
    if (!gameStarted || moveHistory.length === 0) return;

    // Set move start time when turn changes
    if (moveStartTime === null) {
      setMoveStartTime(Date.now());
    }

    const timer = setInterval(() => {
      const currentGame = new Chess(gamePosition);
      if (currentGame.isGameOver()) return;
      
      setTimeElapsed(prev => {
        const currentTurn = currentGame.turn();
        const newTime = prev[currentTurn] - 1;
        
        // Check for timeout
        if (newTime <= 0) {
          clearInterval(timer);
          return { ...prev, [currentTurn]: 0 };
        }
        
        return { ...prev, [currentTurn]: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePosition, gameStarted, moveHistory.length]);

  // Bot move effect
  useEffect(() => {
    if (!gameStarted) {
      return;
    }
    
    // Don't make bot moves while user is viewing history
    if (viewingMoveIndex !== null) {
      return;
    }
    
    const currentGame = new Chess(gamePosition);
    const isOver = currentGame.isGameOver() || timeElapsed.w <= 0 || timeElapsed.b <= 0;
    
    if (isOver) {
      setIsBotThinking(false);
      return;
    }
    
    const botColor = playerColor === 'w' ? 'b' : 'w';
    const currentTurn = currentGame.turn();
    
    if (currentTurn === botColor && !isBotThinking) {
      const timer = setTimeout(() => makeBotMove(), 300);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [gamePosition, gameStarted, playerColor, isBotThinking, timeElapsed, viewingMoveIndex]);

  const makeBotMove = async () => {
    const currentGame = new Chess(gamePosition);
    
    // Check for all game over conditions including timeout
    if (currentGame.isGameOver() || timeElapsed.w <= 0 || timeElapsed.b <= 0 || currentGame.turn() === playerColor || isBotThinking) {
      return;
    }

    setIsBotThinking(true);
    setApiError(null);

    const startTime = moveStartTime || Date.now();

    // Random delay between 5-10 seconds to simulate thinking
    const thinkingTime = 2000 + Math.random() * 3000; // 2-5 seconds
    await new Promise(resolve => setTimeout(resolve, thinkingTime));

    try {
      const response = await getBotMove(moveHistoryUci);
            
      if (response.best && response.best.uci) {
        const uciMove = response.best.uci;
        
        const from = uciMove.substring(0, 2);
        const to = uciMove.substring(2, 4);
        const promotion = uciMove.length > 4 ? uciMove[4] : null;

        const gameCopy = new Chess(gamePosition);
        const move = gameCopy.move({ from, to, promotion: promotion || 'q' });
        
        if (move) {
          const newFen = gameCopy.fen();
          
          // Calculate time taken for this move
          const endTime = Date.now();
          const timeTaken = Math.floor((endTime - startTime) / 1000); // in seconds
          
          // Track captured pieces
          if (move.captured) {
            const botColor = playerColor === 'w' ? 'b' : 'w';
            setCapturedPieces(prev => ({
              ...prev,
              [botColor]: [...prev[botColor], move.captured]
            }));
          }
          
          setLastMove({ from, to });
          setGame(gameCopy);
          setGamePosition(newFen);
          setBoardKey(prev => prev + 1);
          setMoveHistory(prev => [...prev, move.san]);
          setMoveHistoryUci(prev => [...prev, uciMove]);
          setMoveTimes(prev => [...prev, timeTaken]);
          setMoveStartTime(null); // Reset for next move
        }
      }
    } catch (error) {
      console.error('Error making bot move:', error);
      setApiError('Failed to get bot move. Please try again.');
    } finally {
      setIsBotThinking(false);
    }
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const handleSquareClick = (square) => {
    // If viewing history, clicking should do nothing (already disabled via null callback, but double-check)
    if (viewingMoveIndex !== null) {
      return;
    }
    
    if (isBotThinking) {
      return;
    }
    
    const currentGame = new Chess(gamePosition);
    
    // Check if game is over (checkmate, stalemate, draw, or timeout)
    if (currentGame.isGameOver() || timeElapsed.w <= 0 || timeElapsed.b <= 0) {
      return;
    }
    
    if (currentGame.turn() !== playerColor) {
      return;
    }

    // If no square selected, try to select this square
    if (!selectedSquare) {
      const piece = currentGame.get(square);
      
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        const moves = currentGame.moves({ square, verbose: true });
        setPossibleMoves(moves.map(m => m.to));
      }
      return;
    }

    // If same square clicked, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // Check if clicked square has player's piece (switch selection)
    const targetPiece = currentGame.get(square);
    if (targetPiece && targetPiece.color === playerColor) {
      setSelectedSquare(square);
      const moves = currentGame.moves({ square, verbose: true });
      setPossibleMoves(moves.map(m => m.to));
      return;
    }

    // Try to make a move
    const gameCopy = new Chess(gamePosition);
    const move = gameCopy.move({
      from: selectedSquare,
      to: square,
      promotion: 'q'
    });

    if (move) {
      // Start game on first move
      if (!gameStarted) {
        setGameStarted(true);
        setMoveStartTime(Date.now()); // Start timer for first move
      }
      
      const newFen = gameCopy.fen();
      const uciMove = selectedSquare + square + (move.promotion || '');
      
      // Calculate time taken for this move
      const endTime = Date.now();
      const startTime = moveStartTime || endTime;
      const timeTaken = Math.floor((endTime - startTime) / 1000); // in seconds
      
      // Track captured pieces
      if (move.captured) {
        setCapturedPieces(prev => ({
          ...prev,
          [playerColor]: [...prev[playerColor], move.captured]
        }));
      }
      
      setLastMove({ from: selectedSquare, to: square });
      setGame(gameCopy);
      setGamePosition(newFen);
      setBoardKey(prev => prev + 1);
      setMoveHistory(prev => [...prev, move.san]);
      setMoveHistoryUci(prev => [...prev, uciMove]);
      setMoveTimes(prev => [...prev, timeTaken]);
      setMoveStartTime(null); // Reset for next move
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      // Try selecting the clicked square instead
      const piece = currentGame.get(square);
      
      // Check game over again before selecting new piece
      if (currentGame.isGameOver() || timeElapsed.w <= 0 || timeElapsed.b <= 0) {
        return;
      }
      
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        const moves = currentGame.moves({ square, verbose: true });
        setPossibleMoves(moves.map(m => m.to));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setGamePosition(newGame.fen());
    setBoardKey(prev => prev + 1);
    setMoveHistory([]);
    setMoveHistoryUci([]);
    setMoveTimes([]);
    setMoveStartTime(null);
    setCapturedPieces({ w: [], b: [] });
    setTimeElapsed({ w: 600, b: 600 });
    setApiError(null);
    setGameStarted(false);
    setIsBotThinking(false);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setViewingMoveIndex(null);
    setShowGameOverOverlay(true); // Reset overlay visibility for new game
  };

  // Move navigation functions
  const goToFirstMove = () => {
    if (moveHistoryUci.length === 0) return;
    setViewingMoveIndex(0);
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  const goToPreviousMove = () => {
    if (viewingMoveIndex === null) {
      // Currently at latest, go to last move
      if (moveHistoryUci.length > 0) {
        setViewingMoveIndex(moveHistoryUci.length - 1);
      }
    } else if (viewingMoveIndex > 0) {
      setViewingMoveIndex(viewingMoveIndex - 1);
    }
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  const goToNextMove = () => {
    if (viewingMoveIndex === null) return;
    
    if (viewingMoveIndex < moveHistoryUci.length - 1) {
      setViewingMoveIndex(viewingMoveIndex + 1);
    } else {
      // At last move, go to current position
      setViewingMoveIndex(null);
    }
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  const goToLastMove = () => {
    setViewingMoveIndex(null);
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  const goToMove = (index) => {
    if (index >= 0 && index < moveHistoryUci.length) {
      setViewingMoveIndex(index);
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const flipBoard = () => {
    if (!gameStarted) {
      setPlayerColor(prev => prev === 'w' ? 'b' : 'w');
    }
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Piece symbols for display with text presentation selector to prevent emoji rendering on mobile
  const getPieceSymbol = (piece, color) => {
    const symbols = {
      p: '♙\uFE0E',
      n: '♘\uFE0E',
      b: '♗\uFE0E',
      r: '♖\uFE0E',
      q: '♕\uFE0E',
      k: '♔\uFE0E'
    };
    return symbols[piece] || piece;
  };

  // Group captured pieces for stacking display
  const getCapturedPiecesDisplay = (pieces, opponentColor) => {
    const groups = {};
    pieces.forEach(piece => {
      if (!groups[piece]) {
        groups[piece] = [];
      }
      groups[piece].push(getPieceSymbol(piece, opponentColor));
    });
    
    // Order: pawn, knight, bishop, rook, queen
    const order = ['p', 'n', 'b', 'r', 'q'];
    return order.map(piece => {
      if (groups[piece]) {
        return { type: piece, pieces: groups[piece] };
      }
      return null;
    }).filter(Boolean);
  };

  // Calculate displayed position based on viewing mode
  const isViewingHistory = viewingMoveIndex !== null;
  let displayedPosition = gamePosition;
  let displayedLastMove = lastMove;
  
  if (isViewingHistory) {
    // Replay moves up to viewingMoveIndex
    const tempGame = new Chess();
    for (let i = 0; i <= viewingMoveIndex; i++) {
      const uciMove = moveHistoryUci[i];
      const from = uciMove.substring(0, 2);
      const to = uciMove.substring(2, 4);
      const promotion = uciMove.length > 4 ? uciMove[4] : undefined;
      tempGame.move({ from, to, promotion });
    }
    displayedPosition = tempGame.fen();
    
    // Set last move for highlighting
    if (viewingMoveIndex >= 0) {
      const uciMove = moveHistoryUci[viewingMoveIndex];
      displayedLastMove = {
        from: uciMove.substring(0, 2),
        to: uciMove.substring(2, 4)
      };
    }
  }

  // Game status
  const currentGame = new Chess(gamePosition);
  let gameOverMessage = null;
  let isGameOver = false;
  
  // Check for checkmate
  if (currentGame.isCheckmate()) {
    const winner = currentGame.turn() === 'w' ? 'Black' : 'White';
    gameOverMessage = `${winner} wins by checkmate!`;
    isGameOver = true;
  }
  // Check for stalemate
  else if (currentGame.isStalemate()) {
    gameOverMessage = 'Draw by stalemate!';
    isGameOver = true;
  }
  // Check for insufficient material
  else if (currentGame.isInsufficientMaterial()) {
    gameOverMessage = 'Draw by insufficient material!';
    isGameOver = true;
  }
  // Check for threefold repetition
  else if (currentGame.isThreefoldRepetition()) {
    gameOverMessage = 'Draw by threefold repetition!';
    isGameOver = true;
  }
  // Check for other draws (50-move rule, etc.)
  else if (currentGame.isDraw()) {
    gameOverMessage = 'Draw!';
    isGameOver = true;
  }
  // Check for timeout
  else if (timeElapsed.w <= 0) {
    const hasWhiteMaterial = currentGame.board().flat().some(piece => 
      piece && piece.color === 'b' && (piece.type !== 'k')
    );
    if (!hasWhiteMaterial) {
      gameOverMessage = 'Draw - timeout vs insufficient material!';
    } else {
      gameOverMessage = 'Black wins on time!';
    }
    isGameOver = true;
  }
  else if (timeElapsed.b <= 0) {
    const hasBlackMaterial = currentGame.board().flat().some(piece => 
      piece && piece.color === 'w' && (piece.type !== 'k')
    );
    if (!hasBlackMaterial) {
      gameOverMessage = 'Draw - timeout vs insufficient material!';
    } else {
      gameOverMessage = 'White wins on time!';
    }
    isGameOver = true;
  }
  
  const currentTurn = isGameOver ? null : currentGame.turn();
  const isWhiteTurn = currentTurn === 'w';
  const isBlackTurn = currentTurn === 'b';

  // Find king square if in check
  let kingInCheckSquare = null;
  if (currentGame.inCheck()) {
    const board = currentGame.board();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'k' && piece.color === currentTurn) {
          const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
          const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
          kingInCheckSquare = files[col] + ranks[row];
          break;
        }
      }
      if (kingInCheckSquare) break;
    }
  }

  // Custom square styles
  const customSquareStyles = {};
  
  // King in check (red highlight)
  if (kingInCheckSquare) {
    customSquareStyles[kingInCheckSquare] = {
      background: 'radial-gradient(circle, rgba(227, 112, 112, 0.38) 0%, rgba(230, 129, 129, 0.2) 100%)',
      boxShadow: 'inset 0 0 15px rgba(229, 121, 121, 0.36), 0 0 10px rgba(255, 0, 0, 0.17)',
      animation: 'check-pulse 1.5s ease-in-out infinite'
    };
  }
  
  // Last move highlighting (warm golden amber)
  if (displayedLastMove && !kingInCheckSquare) {
    customSquareStyles[displayedLastMove.from] = {
      background: 'rgba(255, 238, 88, 0.35)'
    };
    customSquareStyles[displayedLastMove.to] = {
      background: 'rgba(255, 238, 88, 0.35)'
    };
  } else if (displayedLastMove) {
    // If king is in check, show last move but don't override check highlight
    if (displayedLastMove.from !== kingInCheckSquare) {
      customSquareStyles[displayedLastMove.from] = {
        background: 'rgba(255, 238, 88, 0.35)'
      };
    }
    if (displayedLastMove.to !== kingInCheckSquare) {
      customSquareStyles[displayedLastMove.to] = {
        background: 'rgba(255, 238, 88, 0.35)'
      };
    }
  }
  
  // Selected square (Chess.com style green)
  if (selectedSquare && selectedSquare !== kingInCheckSquare) {
    customSquareStyles[selectedSquare] = {
      background: 'rgba(186, 202, 68, 0.45)'
    };
  }
  
  // Possible moves (subtle indicator)
  possibleMoves.forEach(square => {
    const isCapture = game.get(square) !== null;
    customSquareStyles[square] = {
      position: 'relative',
      zIndex: '1',
      '--is-capture': isCapture ? '1' : '0'
    };
  });

  // Calculate game result indicators (crowns/icons above kings)
  const gameResultIndicators = {};
  if (isGameOver && viewingMoveIndex === null) { // Only show on final position
    const board = currentGame.board();
    let whiteKingSquare = null;
    let blackKingSquare = null;
    
    // Find both king positions
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
    
    // Determine result based on gameOverMessage
    if (gameOverMessage) {
      const isDraw = gameOverMessage.toLowerCase().includes('draw');
      const whiteWins = gameOverMessage.toLowerCase().includes('white wins');
      const blackWins = gameOverMessage.toLowerCase().includes('black wins');
      
      if (isDraw) {
        if (whiteKingSquare) gameResultIndicators[whiteKingSquare] = 'draw';
        if (blackKingSquare) gameResultIndicators[blackKingSquare] = 'draw';
      } else if (whiteWins) {
        if (whiteKingSquare) gameResultIndicators[whiteKingSquare] = 'win';
        if (blackKingSquare) gameResultIndicators[blackKingSquare] = 'loss';
      } else if (blackWins) {
        if (whiteKingSquare) gameResultIndicators[whiteKingSquare] = 'loss';
        if (blackKingSquare) gameResultIndicators[blackKingSquare] = 'win';
      }
    }
  }

  return (
    <div className="app">
      <SEO 
        title={seoConfig.chessBot.title}
        description={seoConfig.chessBot.description}
        keywords={seoConfig.chessBot.keywords}
      />
      <Header />
      <main className="chess-bot-page-main">
        <div className="chess-bot-page-container">
          <Link to="/hobbies/chess" className="back-link">Back to Chess</Link>
          <div style={{ clear: 'both' }}></div>
          
          <h1 className="chess-bot-page-title">Play Against My Chess Bot</h1>
          <p className="chess-bot-page-description">
            Try this chess bot and try to beat it!
          </p>

          {apiError && (
            <div className="chess-bot-error">{apiError}</div>
          )}

          <div className="chess-bot-controls">
            {!gameStarted ? (
              <>
                <button 
                  onClick={flipBoard} 
                  className="chess-btn chess-btn-secondary"
                >
                  Play as {playerColor === 'w' ? 'Black' : 'White'}
                </button>
                <button onClick={startGame} className="chess-btn chess-btn-primary">
                  Start Game
                </button>
              </>
            ) : (
              <button onClick={resetGame} className="chess-btn chess-btn-primary">
                New Game
              </button>
            )}
          </div>

          <div className="chess-bot-game-layout">
            <div className="chess-bot-board-section">
              <div className="chess-bot-board-wrapper">
                <SimpleChessboard
                  position={displayedPosition}
                  onSquareClick={isViewingHistory ? null : handleSquareClick}
                  flipped={playerColor === 'b'}
                  customSquareStyles={customSquareStyles}
                  gameResultIndicators={gameResultIndicators}
                />
                {gameOverMessage && showGameOverOverlay && (
                  <div className="chess-bot-game-over-overlay">
                    <div className="chess-bot-game-over-message">
                      <button 
                        className="chess-bot-game-over-close"
                        onClick={() => setShowGameOverOverlay(false)}
                        title="Hide overlay"
                        aria-label="Hide overlay"
                      >
                        {'×\uFE0E'}
                      </button>
                      <h2>{gameOverMessage}</h2>
                      <button onClick={resetGame} className="chess-btn chess-btn-primary">
                        Play Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="chess-bot-info-section">
              <div className="chess-bot-players">
                {playerColor === 'w' ? (
                  <>
                    <div className={`chess-bot-player white ${isWhiteTurn ? 'active' : ''}`}>
                      <span className="player-label">You (White)</span>
                      <div className="player-captured">
                        {getCapturedPiecesDisplay(capturedPieces.w, 'b').length > 0 ? (
                          getCapturedPiecesDisplay(capturedPieces.w, 'b').map((group, groupIndex) => (
                            <div 
                              key={groupIndex} 
                              className="captured-piece-stack"
                              style={{ '--piece-count': group.pieces.length }}
                            >
                              {group.pieces.map((piece, pieceIndex) => (
                                <span 
                                  key={pieceIndex} 
                                  className="captured-piece-stacked captured-black"
                                  style={{ '--stack-index': pieceIndex }}
                                >
                                  {piece}
                                </span>
                              ))}
                            </div>
                          ))
                        ) : (
                          <span className="no-captures-inline">—</span>
                        )}
                      </div>
                      <span className={`player-time ${timeElapsed.w < 60 ? 'low-time' : ''}`}>{formatTime(timeElapsed.w)}</span>
                    </div>
                    <div className={`chess-bot-player black ${isBlackTurn ? 'active' : ''}`}>
                      <span className="player-label">Bot (Black)</span>
                      <div className="player-captured">
                        {getCapturedPiecesDisplay(capturedPieces.b, 'w').length > 0 ? (
                          getCapturedPiecesDisplay(capturedPieces.b, 'w').map((group, groupIndex) => (
                            <div 
                              key={groupIndex} 
                              className="captured-piece-stack"
                              style={{ '--piece-count': group.pieces.length }}
                            >
                              {group.pieces.map((piece, pieceIndex) => (
                                <span 
                                  key={pieceIndex} 
                                  className="captured-piece-stacked captured-white"
                                  style={{ '--stack-index': pieceIndex }}
                                >
                                  {piece}
                                </span>
                              ))}
                            </div>
                          ))
                        ) : (
                          <span className="no-captures-inline">—</span>
                        )}
                      </div>
                      <span className={`player-time ${timeElapsed.b < 60 ? 'low-time' : ''}`}>{formatTime(timeElapsed.b)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`chess-bot-player white ${isWhiteTurn ? 'active' : ''}`}>
                      <span className="player-label">Bot (White)</span>
                      <div className="player-captured">
                        {getCapturedPiecesDisplay(capturedPieces.w, 'b').length > 0 ? (
                          getCapturedPiecesDisplay(capturedPieces.w, 'b').map((group, groupIndex) => (
                            <div 
                              key={groupIndex} 
                              className="captured-piece-stack"
                              style={{ '--piece-count': group.pieces.length }}
                            >
                              {group.pieces.map((piece, pieceIndex) => (
                                <span 
                                  key={pieceIndex} 
                                  className="captured-piece-stacked captured-black"
                                  style={{ '--stack-index': pieceIndex }}
                                >
                                  {piece}
                                </span>
                              ))}
                            </div>
                          ))
                        ) : (
                          <span className="no-captures-inline">—</span>
                        )}
                      </div>
                      <span className={`player-time ${timeElapsed.w < 60 ? 'low-time' : ''}`}>{formatTime(timeElapsed.w)}</span>
                    </div>
                    <div className={`chess-bot-player black ${isBlackTurn ? 'active' : ''}`}>
                      <span className="player-label">You (Black)</span>
                      <div className="player-captured">
                        {getCapturedPiecesDisplay(capturedPieces.b, 'w').length > 0 ? (
                          getCapturedPiecesDisplay(capturedPieces.b, 'w').map((group, groupIndex) => (
                            <div 
                              key={groupIndex} 
                              className="captured-piece-stack"
                              style={{ '--piece-count': group.pieces.length }}
                            >
                              {group.pieces.map((piece, pieceIndex) => (
                                <span 
                                  key={pieceIndex} 
                                  className="captured-piece-stacked captured-white"
                                  style={{ '--stack-index': pieceIndex }}
                                >
                                  {piece}
                                </span>
                              ))}
                            </div>
                          ))
                        ) : (
                          <span className="no-captures-inline">—</span>
                        )}
                      </div>
                      <span className={`player-time ${timeElapsed.b < 60 ? 'low-time' : ''}`}>{formatTime(timeElapsed.b)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="chess-bot-moves-section">
                <div className="move-history-header">
                  <h3>Move History</h3>
                  {moveHistory.length > 0 && (
                    <div className="move-navigation">
                      <button
                        onClick={goToFirstMove}
                        disabled={viewingMoveIndex === 0}
                        className="nav-btn"
                        title="First move"
                      >
                        {'⏮\uFE0E'}
                      </button>
                      <button
                        onClick={goToPreviousMove}
                        disabled={viewingMoveIndex === 0}
                        className="nav-btn"
                        title="Previous move"
                      >
                        {'◀\uFE0E'}
                      </button>
                      <button
                        onClick={goToNextMove}
                        disabled={viewingMoveIndex === null}
                        className="nav-btn"
                        title="Next move"
                      >
                        {'▶\uFE0E'}
                      </button>
                      <button
                        onClick={goToLastMove}
                        disabled={viewingMoveIndex === null}
                        className="nav-btn"
                        title="Current position"
                      >
                        {'⏭\uFE0E'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="chess-bot-moves-list">
                  {moveHistory.length === 0 ? (
                    <div className="no-moves">No moves yet</div>
                  ) : (
                    <div className="moves-container">
                      {moveHistory.map((move, index) => {
                        const moveNumber = Math.floor(index / 2) + 1;
                        const isWhiteMove = index % 2 === 0;
                        
                        if (isWhiteMove) {
                          const whiteTime = moveTimes[index];
                          const blackTime = moveTimes[index + 1];
                          
                          const formatTime = (seconds) => {
                            if (seconds === undefined) return '';
                            const mins = Math.floor(seconds / 60);
                            const secs = seconds % 60;
                            return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
                          };
                          
                          const isWhiteActive = viewingMoveIndex === index;
                          const isBlackActive = viewingMoveIndex === index + 1;
                          
                          return (
                            <div key={index} className="move-pair">
                              <span className="move-number">{moveNumber}.</span>
                              <span 
                                className={`move-white ${isWhiteActive ? 'active-move' : ''}`}
                                onClick={() => goToMove(index)}
                              >
                                {move}
                                {whiteTime !== undefined && (
                                  <span className="move-time"> ({formatTime(whiteTime)})</span>
                                )}
                              </span>
                              <span 
                                className={`move-black ${isBlackActive ? 'active-move' : ''}`}
                                onClick={() => moveHistory[index + 1] && goToMove(index + 1)}
                              >
                                {moveHistory[index + 1] || ''}
                                {blackTime !== undefined && moveHistory[index + 1] && (
                                  <span className="move-time"> ({formatTime(blackTime)})</span>
                                )}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ChessBotPage;
