import { useState } from 'react';
import './SimpleChessboard.css';

// Unicode chess pieces with text presentation selector (U+FE0E) to prevent emoji rendering on mobile
const PIECE_SYMBOLS = {
  'wP': '♟\uFE0E', 'wN': '♞\uFE0E', 'wB': '♝\uFE0E', 'wR': '♜\uFE0E', 'wQ': '♛\uFE0E', 'wK': '♚\uFE0E',
  'bP': '♟\uFE0E', 'bN': '♞\uFE0E', 'bB': '♝\uFE0E', 'bR': '♜\uFE0E', 'bQ': '♛\uFE0E', 'bK': '♚\uFE0E'
};

function SimpleChessboard({ position, onSquareClick, flipped = false, customSquareStyles = {}, gameResultIndicators = {} }) {
  // Parse FEN to get board
  const fenParts = position.split(' ');
  const boardFen = fenParts[0];
  
  const parseBoard = () => {
    const board = [];
    const rows = boardFen.split('/');
    
    for (let row of rows) {
      const boardRow = [];
      for (let char of row) {
        if (isNaN(char)) {
          // It's a piece
          const color = char === char.toUpperCase() ? 'w' : 'b';
          const piece = char.toUpperCase();
          boardRow.push({ color, piece, symbol: PIECE_SYMBOLS[color + piece] });
        } else {
          // It's a number of empty squares
          for (let i = 0; i < parseInt(char); i++) {
            boardRow.push(null);
          }
        }
      }
      board.push(boardRow);
    }
    
    return board;
  };

  const board = parseBoard();
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const getSquareName = (rowIndex, colIndex) => {
    const file = files[colIndex];
    const rank = ranks[rowIndex];
    return file + rank;
  };

  const isLightSquare = (rowIndex, colIndex) => {
    return (rowIndex + colIndex) % 2 !== 0;
  };

  const handleClick = (rowIndex, colIndex) => {
    const square = getSquareName(rowIndex, colIndex);
    if (onSquareClick) {
      onSquareClick(square);
    }
  };

  const displayBoard = flipped ? [...board].reverse().map(row => [...row].reverse()) : board;
  const displayFiles = flipped ? [...files].reverse() : files;
  const displayRanks = flipped ? [...ranks].reverse() : ranks;

  return (
    <div className="simple-chessboard">
      {displayBoard.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((piece, colIndex) => {
            const actualRow = flipped ? 7 - rowIndex : rowIndex;
            const actualCol = flipped ? 7 - colIndex : colIndex;
            const square = getSquareName(actualRow, actualCol);
            const isLight = isLightSquare(actualRow, actualCol);
            const customStyle = customSquareStyles[square] || {};
            
            const showRankLabel = flipped ? actualCol === 7 : actualCol === 0;
            const showFileLabel = flipped ? actualRow === 0 : actualRow === 7;
            
            return (
              <div
                key={colIndex}
                className={`board-square ${isLight ? 'light' : 'dark'}`}
                style={customStyle}
                onClick={() => handleClick(actualRow, actualCol)}
              >
                {/* Rank labels */}
                {showRankLabel && (
                  <span className="rank-label">{displayRanks[rowIndex]}</span>
                )}
                {/* File labels */}
                {showFileLabel && (
                  <span className="file-label">{displayFiles[colIndex]}</span>
                )}
                {/* Piece */}
                {piece && (
                  <span className={`piece ${piece.color === 'w' ? 'white' : 'black'}`}>
                    {piece.symbol}
                  </span>
                )}
                {/* Game Result Indicator (crown/icon above king) */}
                {piece && piece.piece.toUpperCase() === 'K' && gameResultIndicators[square] && (
                  <div className={`game-result-indicator ${gameResultIndicators[square]}`}>
                    {gameResultIndicators[square] === 'win' && <span className="crown-icon">{'♔\uFE0E'}</span>}
                    {gameResultIndicators[square] === 'loss' && <span className="x-icon">{'✗\uFE0E'}</span>}
                    {gameResultIndicators[square] === 'draw' && <span className="draw-icon">{'½\uFE0E'}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default SimpleChessboard;

