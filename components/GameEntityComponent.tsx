
import React, { useEffect, CSSProperties } from 'react';
import { GameEntity, EntityType } from '../types';
import { HORIZON_Y, MAX_Z } from '../constants';

interface GameEntityProps {
  entity: GameEntity;
}

const GameEntityComponent: React.FC<GameEntityProps> = ({ entity }) => {
  const perspectiveScale = (entity.z / MAX_Z) * 2;
  const yPos = HORIZON_Y + (entity.z / MAX_Z) * (100 - HORIZON_Y);

  const renderEntity = () => {
    const baseStyle: CSSProperties = { transform: `scale(${perspectiveScale})` };

    switch (entity.type) {
      case EntityType.Snowman: {
        const variants: CSSProperties[] = [
          {}, // default red scarf
          { filter: 'hue-rotate(120deg)' }, // green scarf
          { filter: 'hue-rotate(240deg)' }, // blue scarf
        ];
        const style = { ...baseStyle, ...variants[(entity.variant || 0) % variants.length] };
        return <div className="text-4xl md:text-5xl" style={style}>⛄</div>;
      }
      case EntityType.Husky: {
        const variants: CSSProperties[] = [
          { filter: 'brightness(1.0) saturate(1.0)' }, // default
          { filter: 'brightness(0.8) saturate(0.8)' }, // darker
          { filter: 'brightness(1.2) contrast(1.1)' }, // lighter
        ];
        const style = { ...baseStyle, ...variants[(entity.variant || 0) % variants.length] };
        return <div className="text-4xl md:text-5xl" style={style}>🐺</div>;
      }
      case EntityType.Cat: {
        const variants: CSSProperties[] = [
          {}, // default orange
          { filter: 'hue-rotate(200deg) saturate(0.5)' }, // grey
          { filter: 'hue-rotate(300deg) saturate(1.5)' }, // reddish
        ];
        const style = { ...baseStyle, ...variants[(entity.variant || 0) % variants.length] };
        return <div className="text-4xl md:text-5xl" style={style}>🐈</div>;
      }
      case EntityType.Fox: {
        const variants: CSSProperties[] = [
          {}, // default
          { filter: 'saturate(1.5) brightness(1.1)' }, // more vibrant
          { filter: 'saturate(0.8) brightness(0.9)' }, // duller
        ];
        const style = { ...baseStyle, ...variants[(entity.variant || 0) % variants.length] };
        return <div className="text-4xl md:text-5xl" style={style}>🦊</div>;
      }
      case EntityType.PolarBear: {
        const variants: CSSProperties[] = [
          {}, // default
          { filter: 'hue-rotate(40deg) saturate(0.7)' }, // more yellowish/ivory
          { filter: 'sepia(0.3) brightness(0.9)' }, // slightly aged/dirty
        ];
        const style = { ...baseStyle, ...variants[(entity.variant || 0) % variants.length] };
        return <div className="text-4xl md:text-5xl" style={style}>🐻‍❄️</div>;
      }
      case EntityType.Carrot:
        return <div className="text-3xl md:text-4xl" style={{ transform: `scale(${perspectiveScale})` }}>🥕</div>;
      case EntityType.PowerUp:
        return <div className="text-3xl md:text-4xl animate-pulse" style={{ transform: `scale(${perspectiveScale})` }}>⚡</div>;
      case EntityType.Bullet:
        return (
          <div 
            className="w-2 h-5 bg-yellow-300 rounded-full shadow-[0_0_15px_5px_rgba(253,249,168,0.7)]" 
            style={{ transform: `scale(${perspectiveScale})` }}>
          </div>
        );
      case EntityType.Trail: {
        const opacity = entity.life ?? 1;
        return (
            <div 
                className="w-1.5 h-1.5 bg-yellow-200 rounded-full shadow-[0_0_10px_3px_rgba(253,249,168,0.5)]"
                style={{ 
                    transform: `scale(${perspectiveScale})`,
                    opacity: opacity,
                }}
            />
        );
      }
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