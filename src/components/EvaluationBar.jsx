import { useState, useEffect } from 'react';
import './EvaluationBar.css';

const API_URL = 'https://abdussamiakanda.pythonanywhere.com/chessbot/eval';

function EvaluationBar({ fen, flipped = false }) {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previousFillHeight, setPreviousFillHeight] = useState(50);
  const [previousFillFromTop, setPreviousFillFromTop] = useState(false);

  useEffect(() => {
    if (!fen) {
      setEvaluation(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Don't clear previous evaluation immediately - keep it visible during transition
    // Only set loading state
    setLoading(true);
    setError(null);

    // Debounce API calls
    const timeoutId = setTimeout(() => {
      fetchEvaluation(fen);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fen]);

  // Update previous fill height and orientation when evaluation changes
  useEffect(() => {
    if (evaluation && !loading) {
      let whitePercent;
      
      const isMate = evaluation.display && /^M[\+\-]?\d*$/.test(evaluation.display);
      
      if (isMate) {
        const mateForWhite = evaluation.display && (evaluation.display.startsWith('M+') || 
                       (evaluation.eval_pawns !== undefined && evaluation.eval_pawns > 0));
        whitePercent = mateForWhite ? 100 : 0;
      } else if (evaluation.bar) {
        whitePercent = (evaluation.bar.white || 0.5) * 100;
      } else if (evaluation.eval_pawns !== undefined) {
        whitePercent = evaluation.eval_pawns > 0 
          ? Math.min(95, 50 + evaluation.eval_pawns * 10) 
          : Math.max(5, 50 + evaluation.eval_pawns * 10);
      } else {
        whitePercent = 50;
      }
      
      const whiteAtBottom = !flipped;
      const fillFromTop = !whiteAtBottom;
      
      setPreviousFillHeight(whitePercent);
      setPreviousFillFromTop(fillFromTop);
    }
  }, [evaluation, loading, flipped]);

  const fetchEvaluation = async (position) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fen: position }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch evaluation');
      }

      const data = await response.json();
      
      // Always set evaluation data if we got a response
      // Even if game_over, we still want to show the evaluation
      if (data && (data.eval_pawns !== undefined || data.bar)) {
        setEvaluation(data);
        setError(null);
      } else {
        console.warn('Invalid evaluation response - missing eval_pawns or bar:', data);
        setError(true);
        setEvaluation(null);
      }
    } catch (err) {
      console.error('Error fetching evaluation:', err);
      setError(true);
      setEvaluation(null);
    } finally {
      setLoading(false);
    }
  };

  // Always show the bar, even during loading
  // Use default/loading values if evaluation not available
  const isLoading = loading;
  const hasError = error && !evaluation;
  
  // Default values for loading/error states
  // Use previous fill height and orientation during loading to prevent bar jumping/flipping
  let fillHeight = previousFillHeight;
  let displayValue = '...';
  let fillFromTop = previousFillFromTop;
  let useDefaultFill = true;
  let scoreOnWhite = false; // Determines if score text should be dark or light
  let isShowingLoading = false;
  
  if (evaluation && !isLoading) {
    // Use display field from API if available, otherwise calculate from eval_pawns
    let isMate = false;
    let mateForWhite = false;
    
    if (evaluation.display !== undefined) {
      const displayStr = evaluation.display;
      // Check for mate notation (M, M+, M-, M1, M0, M8, etc.)
      isMate = /^M[\+\-]?\d*$/.test(displayStr);
      
      if (isMate) {
        // Remove minus sign from mate notation (M-8 -> M8)
        displayValue = displayStr.replace('M-', 'M');
        // Determine if mate is for white or black
        // M+ means white wins, M- or just M with negative eval means black wins
        mateForWhite = displayStr.startsWith('M+') || 
                       (evaluation.eval_pawns !== undefined && evaluation.eval_pawns > 0);
      } else {
        displayValue = displayStr;
      }
    } else if (evaluation.eval_pawns !== undefined) {
      // Check if eval_pawns indicates mate (very large absolute value)
      const absEval = Math.abs(evaluation.eval_pawns);
      isMate = absEval > 50; // Mate positions typically have very high eval
      if (isMate) {
        displayValue = 'M';
        mateForWhite = evaluation.eval_pawns > 0;
      } else {
        displayValue = absEval.toFixed(1);
      }
    }
    
    // Calculate actual values from evaluation
    // Handle mate positions - show at extreme ends (0% or 100%)
    let whitePercent;
    
    if (isMate) {
      // Mate positions: white wins = 100%, black wins = 0%
      whitePercent = mateForWhite ? 100 : 0;
    } else if (evaluation.bar) {
      whitePercent = (evaluation.bar.white || 0.5) * 100;
    } else if (evaluation.eval_pawns !== undefined) {
      whitePercent = evaluation.eval_pawns > 0 
        ? Math.min(95, 50 + evaluation.eval_pawns * 10) 
        : Math.max(5, 50 + evaluation.eval_pawns * 10);
    } else {
      whitePercent = 50;
    }
    
    const whiteAtBottom = !flipped;
    
    fillHeight = whitePercent;
    fillFromTop = !whiteAtBottom;
    
    // Score is always positioned at the edge of the white fill
    // If fill is large enough (>15%), score will be on white background
    // For mate, always show on the fill side
    scoreOnWhite = isMate ? whitePercent > 50 : fillHeight > 15;
    useDefaultFill = false;
  } else if (hasError) {
    displayValue = '—';
    scoreOnWhite = fillHeight > 15;
  } else {
    isShowingLoading = true;
    scoreOnWhite = fillHeight > 15;
  }
  
  // If we have no previous evaluation at all (first load), calculate orientation from flipped prop
  if (useDefaultFill && !evaluation) {
    const whiteAtBottom = !flipped;
    fillFromTop = !whiteAtBottom;
  }

  return (
    <div className="evaluation-bar-container">
      <div className="evaluation-bar-bar">
        <div 
          className={`evaluation-bar-fill ${fillFromTop ? 'evaluation-bar-fill-top' : ''} ${useDefaultFill ? 'evaluation-bar-fill-default' : ''}`}
          style={{ height: `${fillHeight}%` }}
        >
          <span className={`evaluation-bar-score ${scoreOnWhite ? 'evaluation-bar-score-on-white' : 'evaluation-bar-score-on-dark'} ${isShowingLoading ? 'evaluation-bar-score-loading' : ''}`}>
            {displayValue}
          </span>
        </div>
      </div>
    </div>
  );
}

export default EvaluationBar;

