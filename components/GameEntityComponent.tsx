
import React from 'react';
import { GameEntity, EntityType } from '../types';
import { HORIZON_Y, MAX_Z } from '../constants';

interface GameEntityProps {
  entity: GameEntity;
}

const GameEntityComponent: React.FC<GameEntityProps> = ({ entity }) => {
  const perspectiveScale = (entity.z / MAX_Z) * 2;
  const yPos = HORIZON_Y + (entity.z / MAX_Z) * (100 - HORIZON_Y);

  const renderEntity = () => {
    switch (entity.type) {
      case EntityType.Snowman:
        return <div className="text-4xl md:text-5xl" style={{ transform: `scale(${perspectiveScale})` }}>⛄</div>;
      case EntityType.Carrot:
        return <div className="text-3xl md:text-4xl" style={{ transform: `scale(${perspectiveScale})` }}>🥕</div>;
      case EntityType.Hill:
        return (
          <div
            className="bg-slate-300 rounded-full opacity-80"
            style={{
              width: `${15 * perspectiveScale}vw`,
              height: `${5 * perspectiveScale}vw`,
              transform: `scale(${perspectiveScale})`,
            }}
          ></div>
        );
      case EntityType.Bullet:
        return (
          <div 
            className="w-2 h-5 bg-yellow-300 rounded-full shadow-[0_0_15px_5px_rgba(253,249,168,0.7)]" 
            style={{ transform: `scale(${perspectiveScale})` }}>
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