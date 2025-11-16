
import React, { useEffect } from 'react';
import { GameEntity, EntityType } from '../types';
import { HORIZON_Y, MAX_Z } from '../constants';

interface GameEntityProps {
  entity: GameEntity;
}

const GameEntityComponent: React.FC<GameEntityProps> = ({ entity }) => {
  const perspectiveScale = (entity.z / MAX_Z) * 2;
  const yPos = HORIZON_Y + (entity.z / MAX_Z) * (100 - HORIZON_Y);

  useEffect(() => {
    const styleId = 'entity-animations';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes pulse-trail {
        0%, 100% { opacity: 0.75; transform: scaleY(1); }
        50% { opacity: 0.4; transform: scaleY(1.05); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const renderEntity = () => {
    switch (entity.type) {
      case EntityType.Snowman:
        return <div className="text-4xl md:text-5xl" style={{ transform: `scale(${perspectiveScale})` }}>⛄</div>;
      case EntityType.Husky:
        return <div className="text-4xl md:text-5xl" style={{ transform: `scale(${perspectiveScale})` }}>🐺</div>;
      case EntityType.Cat:
        return <div className="text-4xl md:text-5xl" style={{ transform: `scale(${perspectiveScale})` }}>🐈</div>;
       case EntityType.Fox:
        return <div className="text-4xl md:text-5xl" style={{ transform: `scale(${perspectiveScale})` }}>🦊</div>;
      case EntityType.PolarBear:
        return <div className="text-4xl md:text-5xl" style={{ transform: `scale(${perspectiveScale})` }}>🐻‍❄️</div>;
      case EntityType.Carrot:
        return <div className="text-3xl md:text-4xl" style={{ transform: `scale(${perspectiveScale})` }}>🥕</div>;
      case EntityType.PowerUp:
        return <div className="text-3xl md:text-4xl animate-pulse" style={{ transform: `scale(${perspectiveScale})` }}>⚡</div>;
      case EntityType.Bullet:
        return (
          <div 
            className="w-2 h-5 bg-yellow-300 rounded-full shadow-[0_0_15px_5px_rgba(253,249,168,0.7)]" 
            style={{ transform: `scale(${perspectiveScale})` }}>
              <div className="absolute bottom-[50%] left-1/2 -translate-x-1/2 w-1 h-12 bg-gradient-to-t from-yellow-300/60 to-transparent"
                style={{ animation: 'pulse-trail 0.3s ease-in-out infinite' }}
              ></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="absolute"
      style={{
        top: `${yPos}%`,
        left: `${50 + entity.x}%`,
        transform: `translateX(-50%) translateY(-50%) translateY(${entity.y}px)`,
        willChange: 'transform, top, left',
      }}
    >
      {renderEntity()}
    </div>
  );
};

export default GameEntityComponent;