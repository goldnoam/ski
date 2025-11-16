
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameEntity, EntityType, PlayerState, GameStatus } from './types';
import * as C from './constants';
import Player from './components/Player';
import GameEntityComponent from './components/GameEntityComponent';
import UI from './components/UI';
import SnowParticles from './components/SnowParticles';
import Clouds from './components/Clouds';

const soundUrls = {
    start: 'https://actions.google.com/sounds/v1/games/level_up.ogg',
    collect: 'https://actions.google.com/sounds/v1/coins/coin_gain.ogg',
    shoot: 'https://actions.google.com/sounds/v1/weapons/laser_shoot.ogg',
    hit: 'https://actions.google.com/sounds/v1/impacts/hit_by_projectile.ogg',
    gameOver: 'https://actions.google.com/sounds/v1/games/game_over_lose.ogg',
    jump: 'https://actions.google.com/sounds/v1/impacts/jump_land.ogg',
    powerUp: 'https://actions.google.com/sounds/v1/power_ups/power_up_1.ogg',
};


const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(C.LEVEL_DURATION);
  const [lives, setLives] = useState(C.INITIAL_LIVES);
  const [isShooting, setIsShooting] = useState(false);
  const [isTurboActive, setIsTurboActive] = useState(false);
  const [highScores, setHighScores] = useState<number[]>([]);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(() => {
    try {
        const storedSoundPref = localStorage.getItem('skiShooterSoundOn');
        return storedSoundPref !== null ? JSON.parse(storedSoundPref) : true;
    } catch {
        return true;
    }
  });
  
  const playerState = useRef<PlayerState>({ y: 0, isJumping: false, jumpVelocity: 0, x: 0 });
  const entities = useRef<GameEntity[]>([]);
  const moveState = useRef({ left: false, right: false });
  const fireState = useRef({ active: false });
  const gameSpeed = useRef(C.INITIAL_SPEED);
  const animationFrameId = useRef<number>();
  const lastTime = useRef<number>(0);
  const timeSinceLastSpawn = useRef(0);
  const timeSinceLastShot = useRef(0);
  const turboTimeoutRef = useRef<number>();
  const failedSounds = useRef(new Set<keyof typeof soundUrls>());
  
  const playSound = useCallback((sound: keyof typeof soundUrls) => {
    if (!isSoundOn || failedSounds.current.has(sound)) return;

    const audio = new Audio(soundUrls[sound]);
    audio.play().catch(e => {
      // NotAllowedError is common if user hasn't interacted with page yet.
      // We don't want to disable sound for that.
      if (e.name === 'NotSupportedError' || e.name === 'AbortError') {
        failedSounds.current.add(sound);
        console.warn(`Sound "${sound}" failed to load and has been disabled for this session. Error: ${e.message}`);
      } else if (e.name !== 'NotAllowedError') {
        console.error(`Audio play failed for sound "${sound}":`, e);
      }
    });
  }, [isSoundOn]);

  const updateHighScores = useCallback((newScore: number) => {
    const scores = [...highScores, newScore];
    scores.sort((a, b) => b - a);
    const newHighScores = scores.slice(0, 5); // Keep top 5
    setHighScores(newHighScores);
    localStorage.setItem('skiShooterHighScores', JSON.stringify(newHighScores));
  }, [highScores]);


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

  const togglePause = useCallback(() => {
    if (gameStatus === 'playing' || gameStatus === 'paused') {
        setGameStatus(s => s === 'playing' ? 'paused' : 'playing');
    }
  }, [gameStatus]);

  const toggleSound = useCallback(() => {
    setIsSoundOn(prev => !prev);
  }, []);

  const handleJump = useCallback(() => {
    if (!playerState.current.isJumping && gameStatus === 'playing') {
      playerState.current.isJumping = true;
      playerState.current.jumpVelocity = C.JUMP_FORCE;
      playSound('jump');
    }
  }, [playSound, gameStatus]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (gameStatus !== 'playing') return;
    const screenWidth = window.innerWidth;
    const newX = ((e.clientX / screenWidth) - 0.5) * 100; // -50 to 50
    playerState.current.x = Math.max(-45, Math.min(45, newX));
  }, [gameStatus]);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameStatus !== 'playing') {
        animationFrameId.current = requestAnimationFrame(gameLoop);
        return;
    };
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
        const zIncrement = e.type === EntityType.Bullet ? -gameSpeed.current * 5 * deltaTime : gameSpeed.current * deltaTime;
        let newX = e.x;
        if (e.type === EntityType.Fox && e.vx) {
            newX += e.vx * (deltaTime / 16); // Frame-rate independent movement
            if ((newX > 45 && e.vx > 0) || (newX < -45 && e.vx < 0)) {
                e.vx *= -1;
            }
        }
        return {...e, z: e.z + zIncrement, x: newX};
    }).filter(e => e.z > -5 && e.z < C.MAX_Z);
    
    // Turbo fire
    timeSinceLastShot.current += deltaTime;
    const currentFireRate = isTurboActive ? C.SUPER_TURBO_FIRE_RATE : C.TURBO_FIRE_RATE;
    if (fireState.current.active && timeSinceLastShot.current > currentFireRate) {
        timeSinceLastShot.current = 0;
        entities.current.push({
            id: Date.now(),
            type: EntityType.Bullet,
            x: playerState.current.x,
            y: C.PLAYER_HEIGHT / 2,
            z: C.PLAYER_Z_POSITION - 1,
        });
        playSound('shoot');
        setIsShooting(true);
        setTimeout(() => setIsShooting(false), 100);
    }

    // Collision detection
    let scoreUpdate = 0;
    const idsToRemove = new Set<number>();
    
    const enemyTypes = [EntityType.Snowman, EntityType.Husky, EntityType.Cat, EntityType.Fox, EntityType.PolarBear];

    // Player-entity collision
    entities.current.forEach(entity => {
        if (entity.z > C.PLAYER_Z_POSITION - 5 && entity.z < C.PLAYER_Z_POSITION + 5) {
            const getEntityWidth = (type: EntityType) => {
                if (type === EntityType.Snowman) return C.SNOWMAN_WIDTH;
                if (type === EntityType.Husky) return C.HUSKY_WIDTH;
                if (type === EntityType.Cat) return C.CAT_WIDTH;
                if (type === EntityType.Fox) return C.FOX_WIDTH;
                if (type === EntityType.PolarBear) return C.POLAR_BEAR_WIDTH;
                if (type === EntityType.Carrot) return C.CARROT_WIDTH;
                if (type === EntityType.PowerUp) return C.POWERUP_WIDTH;
                return 0;
            }
            const isCollidingX = Math.abs(entity.x - playerState.current.x) < (C.PLAYER_WIDTH + getEntityWidth(entity.type)) / 2;
            
            if (isCollidingX) {
                if (enemyTypes.includes(entity.type) && playerState.current.y < C.PLAYER_HEIGHT) {
                    playSound('hit');
                    setScore(s => Math.max(0, s - C.ENEMY_COLLISION_PENALTY));
                    setLives(l => {
                        const newLives = l - 1;
                        if (newLives <= 0) {
                            setGameStatus('gameOver');
                            updateHighScores(score);
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
                 if (entity.type === EntityType.PowerUp) {
                    playSound('powerUp');
                    idsToRemove.add(entity.id);
                    if (!isTurboActive) setIsTurboActive(true);
                    
                    if (turboTimeoutRef.current) clearTimeout(turboTimeoutRef.current);
                    turboTimeoutRef.current = window.setTimeout(() => setIsTurboActive(false), C.TURBO_DURATION);
                }
            }
        }
    });

    // Bullet-enemy collision
    const bullets = entities.current.filter(e => e.type === EntityType.Bullet);
    const enemies = entities.current.filter(e => enemyTypes.includes(e.type));
    bullets.forEach(bullet => {
        if(idsToRemove.has(bullet.id)) return;
        enemies.forEach(enemy => {
            if(idsToRemove.has(enemy.id)) return;
            const zClose = Math.abs(bullet.z - enemy.z) < 5;
            const xClose = Math.abs(bullet.x - enemy.x) < (C.BULLET_WIDTH + (
                enemy.type === EntityType.Snowman ? C.SNOWMAN_WIDTH :
                enemy.type === EntityType.Husky ? C.HUSKY_WIDTH :
                enemy.type === EntityType.Cat ? C.CAT_WIDTH :
                enemy.type === EntityType.Fox ? C.FOX_WIDTH : C.POLAR_BEAR_WIDTH
            )) / 2;
            if(zClose && xClose) {
                if (enemy.type === EntityType.Snowman) scoreUpdate += C.SNOWMAN_SCORE;
                if (enemy.type === EntityType.Husky) scoreUpdate += C.HUSKY_SCORE;
                if (enemy.type === EntityType.Cat) scoreUpdate += C.CAT_SCORE;
                if (enemy.type === EntityType.Fox) scoreUpdate += C.FOX_SCORE;
                if (enemy.type === EntityType.PolarBear) scoreUpdate += C.POLAR_BEAR_SCORE;
                
                playSound('hit');
                idsToRemove.add(bullet.id);
                idsToRemove.add(enemy.id);
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

      if (entityType < 0.20) { // Snowman 20%
        entities.current.push({ id: Date.now(), type: EntityType.Snowman, x: xPos, y: 0, z: 0 });
      } else if (entityType < 0.30) { // Husky 10%
        entities.current.push({ id: Date.now(), type: EntityType.Husky, x: xPos, y: 0, z: 0 });
      } else if (entityType < 0.35) { // Cat 5%
        entities.current.push({ id: Date.now(), type: EntityType.Cat, x: xPos, y: 0, z: 0 });
      } else if (entityType < 0.45) { // Fox 10%
        const foxSpeed = 0.2 + Math.random() * 0.2;
        entities.current.push({ id: Date.now(), type: EntityType.Fox, x: xPos, y: 0, z: 0, vx: Math.random() > 0.5 ? foxSpeed : -foxSpeed });
      } else if (entityType < 0.50) { // Polar Bear 5%
        entities.current.push({ id: Date.now(), type: EntityType.PolarBear, x: xPos, y: 0, z: 0 });
      } else if (entityType < 0.55 && !isTurboActive) { // PowerUp 5%, only if not already active
        entities.current.push({ id: Date.now(), type: EntityType.PowerUp, x: xPos, y: 0, z: 0 });
      } else { // Carrot ~45%
        entities.current.push({ id: Date.now(), type: EntityType.Carrot, x: xPos, y: 0, z: 0 });
      }
    }

    forceUpdate();
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameStatus, level, playSound, score, updateHighScores, isTurboActive]);
  
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(tick => tick + 1), []);
  
  useEffect(() => {
    try {
        const storedScores = localStorage.getItem('skiShooterHighScores');
        if (storedScores) {
            setHighScores(JSON.parse(storedScores));
        }
    } catch (error) {
        console.error("Failed to load high scores:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('skiShooterSoundOn', JSON.stringify(isSoundOn));
  }, [isSoundOn]);
  
  useEffect(() => {
    if (gameStatus !== 'playing') {
      if (turboTimeoutRef.current) clearTimeout(turboTimeoutRef.current);
      setIsTurboActive(false);
    }
  }, [gameStatus]);

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
    if (gameStatus !== 'playing') return;
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
  }, [gameStatus, level, playSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      // Global pause key
      if (e.code === 'KeyP') {
        togglePause();
        return;
      }

      // State-specific key handling
      if (gameStatus === 'paused') {
        if (e.code === 'Space' || e.code === 'Enter') {
          togglePause();
        }
        return; // Block game input while paused
      }
      
      if (gameStatus === 'idle' || gameStatus === 'gameOver') {
        if (e.code === 'Space' || e.code === 'Enter') {
          startGame();
        }
        return; // Block game input in these states
      }

      // Game is 'playing'
      if (e.code === 'Space') handleJump();
      if (e.code === 'KeyF') fireState.current.active = true;
      if (e.code === 'ArrowLeft') moveState.current.left = true;
      if (e.code === 'ArrowRight') moveState.current.right = true;
    };
     const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') fireState.current.active = false;
      if (e.code === 'ArrowLeft') moveState.current.left = false;
      if (e.code === 'ArrowRight') moveState.current.right = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      if (turboTimeoutRef.current) clearTimeout(turboTimeoutRef.current);
    };
  }, [handleJump, handleMouseMove, gameStatus, togglePause, startGame]);

    // Mobile controls handlers
    const handleMoveStart = (direction: 'left' | 'right', e: React.TouchEvent) => {
        e.preventDefault();
        moveState.current[direction] = true;
    };
    const handleMoveEnd = (direction: 'left' | 'right', e: React.TouchEvent) => {
        e.preventDefault();
        moveState.current[direction] = false;
    };
    const handleActionStart = (action: 'jump' | 'shoot', e: React.TouchEvent) => {
        e.preventDefault();
        if (action === 'jump') handleJump();
        if (action === 'shoot') fireState.current.active = true;
    }
    const handleActionEnd = (action: 'shoot', e: React.TouchEvent) => {
        e.preventDefault();
        if (action === 'shoot') fireState.current.active = false;
    }
  
  const currentColors = C.LEVEL_COLORS[(level - 1) % C.LEVEL_COLORS.length];

  return (
    <main className="h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center overflow-hidden font-mono select-none">
      <div className="w-full max-w-4xl aspect-[4/3] relative overflow-hidden border-4 border-slate-700 shadow-2xl" 
        style={{ 
          perspective: '800px',
          background: `linear-gradient(to bottom, ${currentColors.from}, ${currentColors.to})`
        }}
      >
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            <Clouds />
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
        <UI 
          score={score} 
          level={level} 
          timeLeft={timeLeft} 
          gameStatus={gameStatus} 
          lives={lives} 
          highScores={highScores} 
          isSoundOn={isSoundOn}
          isTurboActive={isTurboActive}
          onStart={startGame} 
          onTogglePause={togglePause}
          onToggleSound={toggleSound}
        />
      </div>

       {gameStatus === 'playing' && (
        <div className="absolute bottom-5 left-5 right-5 h-24 flex justify-between items-center md:hidden z-20 pointer-events-none">
            {/* D-Pad */}
            <div className="flex gap-2 pointer-events-auto">
                <button onTouchStart={(e) => handleMoveStart('left', e)} onTouchEnd={(e) => handleMoveEnd('left', e)} className="w-16 h-16 bg-white/20 active:bg-white/40 rounded-full text-4xl flex justify-center items-center">‹</button>
                <button onTouchStart={(e) => handleMoveStart('right', e)} onTouchEnd={(e) => handleMoveEnd('right', e)} className="w-16 h-16 bg-white/20 active:bg-white/40 rounded-full text-4xl flex justify-center items-center">›</button>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 pointer-events-auto">
                <button onTouchStart={(e) => handleActionStart('shoot', e)} onTouchEnd={(e) => handleActionEnd('shoot', e)} className="w-16 h-16 bg-red-500/50 active:bg-red-500/70 rounded-full font-bold text-xl">SHOOT</button>
                <button onTouchStart={(e) => handleActionStart('jump', e)} className="w-16 h-16 bg-blue-500/50 active:bg-blue-500/70 rounded-full font-bold text-xl">JUMP</button>
            </div>
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