import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import SimpleChessboard from './SimpleChessboard';
import EvaluationBar from './EvaluationBar';
import './ChessJournalBoard.css';

function ChessJournalBoard({ pgn }) {
  const [chess, setChess] = useState(new Chess());
  const [moves, setMoves] = useState([]);
  const [headers, setHeaders] = useState({});
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(chess.fen());
  const [lastMove, setLastMove] = useState(null);

  useEffect(() => {
    if (!pgn) return;
    
    try {
      const game = new Chess();
      
      // Parse headers from PGN
      const headerLines = pgn.match(/\[(\w+)\s+"([^"]+)"\]/g) || [];
      const parsedHeaders = {};
      headerLines.forEach(line => {
        const match = line.match(/\[(\w+)\s+"([^"]+)"\]/);
        if (match) {
          parsedHeaders[match[1]] = match[2];
        }
      });
      setHeaders(parsedHeaders);
      
      // Try to load PGN with chess.js
      let loaded = false;
      
      // First attempt: try direct load
      try {
        loaded = game.loadPgn(pgn, { strict: false });
      } catch (e) {
        // Ignore error, will try fallback
      }
      
      // Fallback: clean and reconstruct PGN
      if (!loaded) {
        // Extract moves section (after headers)
        const parts = pgn.split('\n\n');
        let movesText = parts.length > 1 ? parts.slice(1).join('\n') : parts[0];
        
        // Remove comments in braces
        movesText = movesText.replace(/\{[^}]*\}/g, '');
        
        // Remove variations in parentheses (recursive handling)
        let prevText = '';
        while (prevText !== movesText) {
          prevText = movesText;
          movesText = movesText.replace(/\([^()]*\)/g, '');
        }
        
        // Remove annotations
        movesText = movesText.replace(/[?!]+/g, '');
        
        // Remove game result
        movesText = movesText.replace(/\s*(1-0|0-1|1\/2-1\/2|\*)\s*$/g, '');
        
        // Clean up extra whitespace
        movesText = movesText.replace(/\s+/g, ' ').trim();
        
        // Reconstruct minimal PGN with just Event header
        const cleanPgn = `[Event "Game"]\n\n${movesText}`;
        
        try {
          loaded = game.loadPgn(cleanPgn, { strict: false });
        } catch (e) {
          // Silently continue to next fallback
        }
      }
      
      // If still not loaded, try parsing moves manually
      if (!loaded) {
        // Last resort: extract moves with regex and apply one by one
        const movesPattern = /\b(\d+\.\s+)?([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?|O-O(?:-O)?)[+#]?/g;
        const moveMatches = [];
        let match;
        while ((match = movesPattern.exec(pgn)) !== null) {
          if (match[2]) {
            moveMatches.push(match[2]);
          }
        }
        
        // Try to apply moves
        const validMoves = [];
        const tempGame = new Chess();
        for (const moveSan of moveMatches) {
          try {
            const move = tempGame.move(moveSan);
            if (move) {
              validMoves.push(move);
            }
          } catch (e) {
            // Skip invalid moves
          }
        }
        
        if (validMoves.length > 0) {
          // Replay moves in fresh game
          game.reset();
          validMoves.forEach(m => game.move(m));
          loaded = true;
        }
      }
      
      // Get all moves from the loaded game
      const history = game.history({ verbose: true });
      
      if (history.length === 0) {
        console.warn('No moves found in PGN');
        return;
      }
      
      setMoves(history);
      setCurrentMoveIndex(history.length);
      setChess(game);
      setCurrentPosition(game.fen());
      setLastMove(history.length > 0 ? history[history.length - 1] : null);
    } catch (error) {
      console.error('Error parsing PGN:', error);
    }
  }, [pgn]);

  const goToPosition = (moveIndex) => {
    const game = new Chess();
    let lastMoveObj = null;
    
    for (let i = 0; i < moveIndex && i < moves.length; i++) {
      try {
        // moves[i] is a verbose move object with 'san' property
        const moveResult = game.move(moves[i].san);
        if (moveResult) {
          lastMoveObj = moveResult;
        }
      } catch (e) {
        console.warn('Invalid move at index', i, moves[i]?.san);
        break;
      }
    }
    
    setCurrentPosition(game.fen());
    setLastMove(lastMoveObj);
    setCurrentMoveIndex(moveIndex);
  };

  const goToFirst = () => goToPosition(0);
  const goToPrevious = () => {
    if (currentMoveIndex > 0) {
      goToPosition(currentMoveIndex - 1);
    }
  };
  const goToNext = () => {
    if (currentMoveIndex < moves.length) {
      goToPosition(currentMoveIndex + 1);
    }
  };
  const goToLast = () => goToPosition(moves.length);

  const customSquareStyles = {};
  if (lastMove) {
    customSquareStyles[lastMove.from] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)'
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)'
    };
  }

  return (
    <div className="chess-journal-board-container">
      {Object.keys(headers).length > 0 && (
        <div className="chess-journal-headers">
          {headers.Event && <span><strong>Event:</strong> {headers.Event}</span>}
          {headers.White && <span><strong>White:</strong> {headers.White}</span>}
          {headers.Black && <span><strong>Black:</strong> {headers.Black}</span>}
          {headers.Result && <span><strong>Result:</strong> {headers.Result}</span>}
          {headers.Date && (
            <span>
              <strong>Date:</strong> {
                (() => {
                  try {
                    // PGN dates are typically in format "YYYY.MM.DD"
                    const dateStr = headers.Date;
                    // Try to parse the date
                    if (dateStr.includes('.')) {
                      const [year, month, day] = dateStr.split('.');
                      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                      }
                    }
                    // If parsing fails, just return the original string
                    return dateStr;
                  } catch (e) {
                    return headers.Date;
                  }
                })()
              }
            </span>
          )}
        </div>
      )}
      <div className="chess-journal-board-layout">
        <EvaluationBar 
          fen={currentPosition} 
          flipped={false}
        />
        <div className="chess-journal-board-wrapper">
          <SimpleChessboard
            position={currentPosition}
            customSquareStyles={customSquareStyles}
          />
        </div>
        {moves.length > 0 && (
          <div className="chess-journal-navigation">
            <div className="chess-journal-navigation-controls">
              <button 
                className="nav-btn" 
                onClick={goToFirst}
                disabled={currentMoveIndex === 0}
                title="First move"
              >
                ⏮{'\uFE0E'}
              </button>
              <button 
                className="nav-btn" 
                onClick={goToPrevious}
                disabled={currentMoveIndex === 0}
                title="Previous move"
              >
                ◀{'\uFE0E'}
              </button>
              <button 
                className="nav-btn" 
                onClick={goToNext}
                disabled={currentMoveIndex >= moves.length}
                title="Next move"
              >
                ▶{'\uFE0E'}
              </button>
              <button 
                className="nav-btn" 
                onClick={goToLast}
                disabled={currentMoveIndex >= moves.length}
                title="Last move"
              >
                ⏭{'\uFE0E'}
              </button>
            </div>
            <div className="chess-journal-moves">
              <div className="chess-journal-moves-list">
                {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, pairIndex) => {
                  const whiteMoveIndex = pairIndex * 2;
                  const blackMoveIndex = pairIndex * 2 + 1;
                  const whiteMove = moves[whiteMoveIndex];
                  const blackMove = moves[blackMoveIndex];
                  
                  return (
                    <div key={pairIndex} className="chess-journal-move-pair">
                      <span className="move-number">{pairIndex + 1}.</span>
                      <button
                        className={`move-btn ${currentMoveIndex === whiteMoveIndex + 1 ? 'active' : ''}`}
                        onClick={() => goToPosition(whiteMoveIndex + 1)}
                      >
                        <span className="move-text move-white">
                          {whiteMove.san}
                        </span>
                      </button>
                      {blackMove && (
                        <button
                          className={`move-btn ${currentMoveIndex === blackMoveIndex + 1 ? 'active' : ''}`}
                          onClick={() => goToPosition(blackMoveIndex + 1)}
                        >
                          <span className="move-text move-black">
                            {blackMove.san}
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChessJournalBoard;

