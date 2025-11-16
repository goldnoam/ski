import React, { useState, useEffect, useRef } from 'react';

const PARTICLE_COUNT = 150;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

const SnowParticles: React.FC = () => {
  const particlesRef = useRef<Particle[]>([]);
  const [, setTick] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    let animationFrameId: number;

    const setup = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * clientWidth,
        y: Math.random() * clientHeight,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      }));
    };
    
    setup();

    const animate = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;

      particlesRef.current = particlesRef.current.map(p => {
        let newY = p.y + p.speed;
        let newX = p.x;
        if (newY > clientHeight) {
          newY = -p.size; // Start just above the screen
          newX = Math.random() * clientWidth;
        }
        return { ...p, y: newY, x: newX };
      });
      setTick(t => t + 1);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => setup();
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particlesRef.current.map(p => (
        <div
          key={p.id}
          className="absolute bg-white/70 rounded-full"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            willChange: 'top',
          }}
        />
      ))}
    </div>
  );
};

export default SnowParticles;