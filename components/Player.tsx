import React, { useEffect } from 'react';
import { GameStatus } from '../types';

interface PlayerProps {
  playerY: number;
  playerX: number;
  isJumping: boolean;
  isShooting: boolean;
  gameStatus: GameStatus;
}

const Player: React.FC<PlayerProps> = ({ playerY, playerX, isJumping, isShooting, gameStatus }) => {
  useEffect(() => {
    const styleId = 'player-animations';
    if (document.getElementById(styleId)) return; 

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes ski-left {
        0%, 100% { transform: rotate(5deg) translateX(-5%); }
        50% { transform: rotate(-5deg) translateX(5%); }
      }
      @keyframes ski-right {
        0%, 100% { transform: rotate(-5deg) translateX(5%); }
        50% { transform: rotate(5deg) translateX(-5%); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const skiingLeftAnimation = gameStatus === 'playing' && !isJumping ? 'ski-left 1s ease-in-out infinite' : 'none';
  const skiingRightAnimation = gameStatus === 'playing' && !isJumping ? 'ski-right 1s ease-in-out infinite' : 'none';

  return (
    <div
      className="absolute bottom-[10%] left-1/2 w-16 h-16 transition-transform duration-100"
      style={{
        transform: `translateX(-50%) translateX(${playerX}vw) translateY(${-playerY}px)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Body */}
      <div 
        className="absolute w-6 h-10 bg-red-500 rounded-t-lg bottom-0 left-1/2 transition-transform duration-100 ease-in-out"
        style={{ transform: `translateX(-50%) scale(${isShooting ? 0.95 : 1})` }}
      ></div>
      {/* Head */}
      <div className="absolute w-6 h-6 bg-yellow-300 rounded-full bottom-10 left-1/2 -translate-x-1/2"></div>
       {/* Skis */}
       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-2">
            <div
                className={`absolute w-10 h-full bg-blue-500 rounded transition-transform duration-200 ease-in-out`}
                style={{
                    right: '50%',
                    transform: isJumping ? 'rotate(-20deg)' : 'none',
                    transformOrigin: 'right center',
                    animation: skiingLeftAnimation,
                }}
            ></div>
            <div
                className={`absolute w-10 h-full bg-blue-500 rounded transition-transform duration-200 ease-in-out`}
                style={{
                    left: '50%',
                    transform: isJumping ? 'rotate(20deg)' : 'none',
                    transformOrigin: 'left center',
                    animation: skiingRightAnimation,
                }}
            ></div>
        </div>
    </div>
  );
};

export default Player;