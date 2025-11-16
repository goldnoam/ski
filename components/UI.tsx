import React from 'react';
import { GameStatus } from '../types';

interface UIProps {
  score: number;
  level: number;
  timeLeft: number;
  gameStatus: GameStatus;
  lives: number;
  onStart: () => void;
}

const UI: React.FC<UIProps> = ({ score, level, timeLeft, gameStatus, lives, onStart }) => {
  return (
    <div className="absolute inset-0 pointer-events-none text-white font-bold select-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between text-xl md:text-2xl p-2 bg-black/30 rounded-lg">
        <div>Score: {score}</div>
        <div>Level: {level}</div>
        <div>Lives: {'❤️'.repeat(lives)}</div>
        <div>Time: {timeLeft}</div>
      </div>

      {/* Center Screen Messages */}
      {gameStatus !== 'playing' && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 pointer-events-auto">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-shadow-lg">SKI SHOOTER</h1>
          {gameStatus === 'gameOver' && <p className="text-3xl mt-4">Game Over! Final Score: {score}</p>}
          <button
            onClick={onStart}
            className="mt-8 px-8 py-4 bg-yellow-400 text-slate-900 text-2xl rounded-lg shadow-lg hover:bg-yellow-300 transition-all transform hover:scale-105"
          >
            {gameStatus === 'idle' ? 'Start Game' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UI;