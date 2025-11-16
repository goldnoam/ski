
import React, { useEffect, useMemo } from 'react';

const CLOUD_COUNT = 12;

interface CloudPart {
  width: string;
  height: string;
  top: string;
  left: string;
}

interface Cloud {
  id: number;
  top: string;
  left: string;
  scale: number;
  opacity: number;
  blur: number;
  animationName: string;
  animationDuration: string;
  animationDelay: string;
  parts: CloudPart[];
}

const cloudShapes: CloudPart[][] = [
  // Shape 1: Puffy
  [
    { width: '150px', height: '40px', top: '20px', left: '0px' },
    { width: '60px', height: '60px', top: '-10px', left: '20px' },
    { width: '80px', height: '80px', top: '-20px', left: '60px' },
  ],
  // Shape 2: Long & flat
  [
    { width: '200px', height: '50px', top: '0px', left: '0px' },
    { width: '90px', height: '30px', top: '-15px', left: '50px' },
  ],
  // Shape 3: Tall
  [
    { width: '100px', height: '100px', top: '0px', left: '30px' },
    { width: '50px', height: '50px', top: '-25px', left: '20px' },
    { width: '70px', height: '70px', top: '20px', left: '0px' },
  ],
   // Shape 4: Small & round
  [
    { width: '80px', height: '80px', top: '0px', left: '0px' },
    { width: '60px', height: '60px', top: '-20px', left: '30px' },
  ],
];

const Clouds: React.FC = () => {
    useEffect(() => {
        const styleId = 'cloud-animations';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            @keyframes drift-ltr {
                from { transform: translateX(-250%); }
                to { transform: translateX(250%); }
            }
            @keyframes drift-rtl {
                from { transform: translateX(250%); }
                to { transform: translateX(-250%); }
            }
            .cloud-base {
                position: absolute;
                will-change: transform;
            }
            .cloud-part {
                position: absolute;
                background: white;
                border-radius: 50%;
            }
        `;
        document.head.appendChild(style);
    }, []);

    const clouds = useMemo<Cloud[]>(() => {
        return Array.from({ length: CLOUD_COUNT }, (_, i) => {
            const direction = Math.random() > 0.5;
            return {
                id: i,
                top: `${5 + Math.random() * 60}%`,
                left: `-50%`, // Start off-screen
                scale: 0.5 + Math.random() * 1.0,
                opacity: 0.1 + Math.random() * 0.2,
                blur: 6 + Math.random() * 10,
                animationName: direction ? 'drift-ltr' : 'drift-rtl',
                animationDuration: `${60 + Math.random() * 120}s`,
                animationDelay: `-${Math.random() * 180}s`,
                parts: cloudShapes[i % cloudShapes.length],
            };
        });
    }, []);

    return (
        <div className="absolute inset-0 top-[5%] h-[30%] overflow-hidden pointer-events-none z-0">
            {clouds.map(cloud => (
                <div 
                    key={cloud.id} 
                    className="cloud-base"
                    style={{
                        top: cloud.top,
                        left: cloud.left,
                        transform: `scale(${cloud.scale})`,
                        animationName: cloud.animationName,
                        animationDuration: cloud.animationDuration,
                        animationDelay: cloud.animationDelay,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                    }}
                >
                    <div style={{ position: 'relative', width: '200px', height: '100px' }}>
                        {cloud.parts.map((part, index) => (
                             <div 
                                key={index}
                                className="cloud-part"
                                style={{
                                    ...part,
                                    opacity: cloud.opacity,
                                    filter: `blur(${cloud.blur}px)`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Clouds;
