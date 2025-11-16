
import React from 'react';
import { GameStatus } from '../types';

interface UIProps {
  score: number;
  level: number;
  timeLeft: number;
  gameStatus: GameStatus;
  lives: number;
  highScores: number[];
  isSoundOn: boolean;
  isTurboActive: boolean;
  onStart: () => void;
  onTogglePause: () => void;
  onToggleSound: () => void;
}

const UI: React.FC<UIProps> = ({ score, level, timeLeft, gameStatus, lives, highScores, isSoundOn, isTurboActive, onStart, onTogglePause, onToggleSound }) => {
  return (
    <div className="absolute inset-0 pointer-events-none text-white font-bold select-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-xl md:text-2xl p-2 bg-black/30 rounded-lg">
        <div className="flex-1 flex items-center gap-3">
          <span>Score: {score}</span>
           {isTurboActive && <span className="text-yellow-300 text-sm font-black animate-pulse">TURBO!</span>}
           <button onClick={onToggleSound} className="pointer-events-auto text-2xl leading-none" aria-label={isSoundOn ? 'Mute sound' : 'Unmute sound'}>
            {isSoundOn ? '🔊' : '🔇'}
          </button>
        </div>
        <div className="flex-1 text-center">Level: {level}</div>
        <div className="flex-1 text-center">Lives: {'❤️'.repeat(lives)}</div>
        <div className="flex-1 text-right">Time: {timeLeft}</div>
         {gameStatus === 'playing' && (
          <button onClick={onTogglePause} className="absolute right-[-50px] md:right-[-70px] top-1/2 -translate-y-1/2 pointer-events-auto px-3 py-1 bg-slate-600/80 rounded text-lg">PAUSE</button>
        )}
      </div>

      {/* Center Screen Messages */}
      {gameStatus !== 'playing' && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 pointer-events-auto">
          {gameStatus === 'paused' && (
            <>
              <h2 className="text-6xl font-black tracking-tighter">PAUSED</h2>
              <button
                onClick={onTogglePause}
                className="mt-8 px-8 py-4 bg-yellow-400 text-slate-900 text-2xl rounded-lg shadow-lg hover:bg-yellow-300 transition-all transform hover:scale-105"
              >
                Resume
              </button>
              <p className="mt-4 text-slate-300 text-lg">or press SPACE / ENTER</p>
            </>
          )}
          {(gameStatus === 'idle' || gameStatus === 'gameOver') && (
            <>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-shadow-lg">SKI SHOOTER</h1>
              {gameStatus === 'gameOver' && <p className="text-3xl mt-4">Game Over! Final Score: {score}</p>}
              
              <div className="flex flex-col md:flex-row gap-8 md:gap-16 mt-6 bg-black/30 p-6 rounded-lg text-lg">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl text-yellow-400 mb-2 font-bold">HIGH SCORES</h2>
                    <ol className="list-decimal list-inside">
                        {highScores.length > 0 ? highScores.map((s, i) => (
                            <li key={i}><span className="font-normal">{s}</span></li>
                        )) : <li>No scores yet!</li>}
                    </ol>
                </div>
                 <div className="text-center md:text-left">
                    <h2 className="text-2xl text-yellow-400 mb-2 font-bold">CONTROLS</h2>
                    <p><span className="inline-block w-20">[←][→]</span> Move</p>
                    <p><span className="inline-block w-20">[SPACE]</span> Jump</p>
                    <p><span className="inline-block w-20">[F]</span> Shoot</p>
                    <p><span className="inline-block w-20">[P]</span> Pause</p>
                </div>
              </div>

              <button
                onClick={onStart}
                className="mt-8 px-8 py-4 bg-yellow-400 text-slate-900 text-2xl rounded-lg shadow-lg hover:bg-yellow-300 transition-all transform hover:scale-105"
              >
                {gameStatus === 'idle' ? 'Start Game' : 'Play Again'}
              </button>
              <p className="mt-4 text-slate-300 text-lg">or press SPACE / ENTER</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UI;