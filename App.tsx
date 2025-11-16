import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameEntity, EntityType, PlayerState, GameStatus } from './types';
import * as C from './constants';
import Player from './components/Player';
import GameEntityComponent from './components/GameEntityComponent';
import UI from './components/UI';
import SnowParticles from './components/SnowParticles';

const soundUrls = {
    start: 'https://cdn.pixabay.com/audio/2022/08/04/audio_39254b9d5c.mp3', // Level start
    collect: 'https://cdn.pixabay.com/audio/2022/03/15/audio_732040a1b1.mp3', // Collect carrot
    shoot: 'https://cdn.pixabay.com/audio/2021/08/04/audio_a29cf33159.mp3', // Shoot
    hit: 'https://cdn.pixabay.com/audio/2022/03/10/audio_b4f0b09968.mp3', // Hit snowman
    gameOver: 'https://cdn.pixabay.com/audio/2022/11/10/audio_f5572a129f.mp3', // Game over
    jump: 'https://cdn.pixabay.com/audio/2022/01/23/audio_7172fe6433.mp3' // Jump
};


const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(C.LEVEL_DURATION);
  const [lives, setLives] = useState(C.INITIAL_LIVES);
  const [isShooting, setIsShooting] = useState(false);
  
  const playerState = useRef<PlayerState>({ y: 0, isJumping: false, jumpVelocity: 0, x: 0 });
  const entities = useRef<GameEntity[]>([]);
  const moveState = useRef({ left: false, right: false });
  const gameSpeed = useRef(C.INITIAL_SPEED);
  const animationFrameId = useRef<number>();
  const lastTime = useRef<number>(0);
  const timeSinceLastSpawn = useRef(0);
  
  const playSound = useCallback((sound: keyof typeof soundUrls) => {
    const audio = new Audio(soundUrls[sound]);
    audio.play().catch(e => {
      // Autoplay policy can prevent playback before user interaction.
      // We can safely ignore this specific error.
      if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') {
        console.error(`Audio play failed for sound "${sound}":`, e);
      }
    });
  }, []);

  const startGame = useCallback(() => {
    setLevel(1);
    setScore(0);
    setTimeLeft(C.LEVEL_DURATION);
    setLives(C.INITIAL_LIVES);
    gameSpeed.current = C.INITIAL_SPEED;
    playerState.current = { y: 0, isJumping: false, jumpVelocity: 0, x: 0 };
    entities.current = [];
    setGameStatus('playing');
    playSound('start');
  }, [playSound]);

  const handleJump = useCallback(() => {
    if (!playerState.current.isJumping) {
      playerState.current.isJumping = true;
      playerState.current.jumpVelocity = C.JUMP_FORCE;
      playSound('jump');
    }
  }, [playSound]);

  const handleShoot = useCallback(() => {
    entities.current.push({
      id: Date.now(),
      type: EntityType.Bullet,
      x: playerState.current.x,
      y: C.PLAYER_HEIGHT / 2, // originate from player center
      z: C.PLAYER_Z_POSITION - 1, // Spawn just in front of the player
    });
    playSound('shoot');
    setIsShooting(true);
    setTimeout(() => setIsShooting(false), 200);
  }, [playSound]);

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (gameStatus !== 'playing') return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const screenWidth = window.innerWidth;
    const newX = ((clientX / screenWidth) - 0.5) * 100; // -50 to 50
    playerState.current.x = Math.max(-45, Math.min(45, newX));
  }, [gameStatus]);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameStatus !== 'playing') return;
    if (lastTime.current === 0) {
        lastTime.current = timestamp;
    }
    const deltaTime = timestamp - lastTime.current;
    lastTime.current = timestamp;
    
    // Player physics
    if (playerState.current.isJumping) {
      playerState.current.y += playerState.current.jumpVelocity;
      playerState.current.jumpVelocity -= C.GRAVITY;
      if (playerState.current.y <= 0) {
        playerState.current.y = 0;
        playerState.current.isJumping = false;
        playerState.current.jumpVelocity = 0;
      }
    }
    if (moveState.current.left) playerState.current.x -= C.PLAYER_MOVE_SPEED;
    if (moveState.current.right) playerState.current.x += C.PLAYER_MOVE_SPEED;
    playerState.current.x = Math.max(-45, Math.min(45, playerState.current.x));


    // Update entities
    entities.current = entities.current.map(e => {
        // Bullets move away from the player (decreasing z), other entities move towards (increasing z)
        const zIncrement = e.type === EntityType.Bullet ? -gameSpeed.current * 5 * deltaTime : gameSpeed.current * deltaTime;
        return {...e, z: e.z + zIncrement};
    }).filter(e => e.z > -5 && e.z < C.MAX_Z); // Allow bullet to travel slightly past horizon

    // Collision detection
    let scoreUpdate = 0;
    const idsToRemove = new Set<number>();
    
    // Player-entity collision
    entities.current.forEach(entity => {
        if (entity.z > C.PLAYER_Z_POSITION - 5 && entity.z < C.PLAYER_Z_POSITION + 5) {
            const getEntityWidth = (type: EntityType) => {
                if (type === EntityType.Hill) return C.HILL_WIDTH;
                if (type === EntityType.Snowman) return C.SNOWMAN_WIDTH;
                if (type === EntityType.Carrot) return C.CARROT_WIDTH;
                return 0;
            }
            const isCollidingX = Math.abs(entity.x - playerState.current.x) < (C.PLAYER_WIDTH + getEntityWidth(entity.type)) / 2;
            
            if (isCollidingX) {
                if ((entity.type === EntityType.Hill || entity.type === EntityType.Snowman) && playerState.current.y < C.PLAYER_HEIGHT) {
                    playSound('hit');
                    setScore(s => Math.max(0, s - C.HILL_COLLISION_PENALTY));
                    setLives(l => {
                        const newLives = l - 1;
                        if (newLives <= 0) {
                            setGameStatus('gameOver');
                            playSound('gameOver');
                        }
                        return newLives;
                    });
                    idsToRemove.add(entity.id);
                }
                if (entity.type === EntityType.Carrot) {
                    scoreUpdate += C.CARROT_SCORE;
                    playSound('collect');
                    idsToRemove.add(entity.id);
                }
            }
        }
    });

    // Bullet-snowman collision
    const bullets = entities.current.filter(e => e.type === EntityType.Bullet);
    const snowmen = entities.current.filter(e => e.type === EntityType.Snowman);
    bullets.forEach(bullet => {
        if(idsToRemove.has(bullet.id)) return;
        snowmen.forEach(snowman => {
            if(idsToRemove.has(snowman.id)) return;
            const zClose = Math.abs(bullet.z - snowman.z) < 5;
            const xClose = Math.abs(bullet.x - snowman.x) < (C.BULLET_WIDTH + C.SNOWMAN_WIDTH) / 2;
            if(zClose && xClose) {
                scoreUpdate += C.SNOWMAN_SCORE;
                playSound('hit');
                idsToRemove.add(bullet.id);
                idsToRemove.add(snowman.id);
            }
        });
    });

    if (scoreUpdate > 0) setScore(s => s + scoreUpdate);
    if (idsToRemove.size > 0) {
        entities.current = entities.current.filter(e => !idsToRemove.has(e.id));
    }
    
    // Spawn new entities
    timeSinceLastSpawn.current += deltaTime;
    const spawnInterval = 1500 / level;
    if (timeSinceLastSpawn.current > spawnInterval) {
      timeSinceLastSpawn.current = 0;
      const entityType = Math.random();
      const xPos = Math.random() * 80 - 40;
      if (entityType < 0.3) {
        entities.current.push({ id: Date.now(), type: EntityType.Hill, x: xPos, y: 0, z: 0 });
      } else if (entityType < 0.65) {
        entities.current.push({ id: Date.now(), type: EntityType.Snowman, x: xPos, y: 0, z: 0 });
      } else {
        entities.current.push({ id: Date.now(), type: EntityType.Carrot, x: xPos, y: 0, z: 0 });
      }
    }

    forceUpdate();
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameStatus, level, playSound]);
  
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(tick => tick + 1), []);
  
  useEffect(() => {
    if (gameStatus === 'playing') {
      lastTime.current = 0;
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameStatus, gameLoop]);

  useEffect(() => {
    if (gameStatus !== 'playing' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
            setLevel(l => l + 1);
            setLives(l => l + 1);
            gameSpeed.current += C.SPEED_INCREMENT;
            playSound('start');
            return C.LEVEL_DURATION;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameStatus, level, playSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;
      if (e.code === 'Space') handleJump();
      if (e.code === 'KeyF') handleShoot();
      if (e.code === 'ArrowLeft') moveState.current.left = true;
      if (e.code === 'ArrowRight') moveState.current.right = true;
    };
     const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') moveState.current.left = false;
      if (e.code === 'ArrowRight') moveState.current.right = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    // Add touch handlers for mobile jump/shoot
    const handleTouchStart = (e: TouchEvent) => {
        if (gameStatus !== 'playing') return;
        // prevent default to avoid scrolling/zooming
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const screenWidth = window.innerWidth;
        if (touchX < screenWidth / 2) {
            handleJump();
        } else {
            handleShoot();
        }
    }
    window.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleJump, handleShoot, handleMove, gameStatus]);
  
  return (
    <main className="h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center overflow-hidden font-mono select-none">
      <div className="w-full max-w-4xl aspect-[4/3] relative bg-gradient-to-b from-indigo-900 to-slate-800 overflow-hidden border-4 border-slate-700 shadow-2xl" style={{ perspective: '800px' }}>
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            <SnowParticles />
            <div className="absolute inset-0 bg-slate-400" style={{ transform: 'translateY(40%) rotateX(60deg)' }}></div>

            {entities.current.map(entity => (
                <GameEntityComponent key={entity.id} entity={entity} />
            ))}
            
            <Player 
              playerY={playerState.current.y} 
              playerX={playerState.current.x} 
              isJumping={playerState.current.isJumping}
              isShooting={isShooting}
              gameStatus={gameStatus}
            />
        </div>
        <UI score={score} level={level} timeLeft={timeLeft} gameStatus={gameStatus} lives={lives} onStart={startGame} />
      </div>

       {gameStatus === 'playing' && (
        <div className="absolute bottom-0 left-0 right-0 h-1/4 flex md:hidden z-20">
            <div className="w-1/2 h-full bg-blue-500/30 active:bg-blue-500/50 flex justify-center items-center text-2xl font-bold"><p>JUMP</p></div>
            <div className="w-1/2 h-full bg-red-500/30 active:bg-red-500/50 flex justify-center items-center text-2xl font-bold"><p>SHOOT</p></div>
        </div>
        )}
      
      <footer className="absolute bottom-2 text-center text-xs text-slate-400">
        <p>(C) Noam Gold AI 2025</p>
        <a href="mailto:gold.noam@gmail.com" className="underline hover:text-white">Send Feedback</a>
      </footer>
    </main>
  );
};

export default App;