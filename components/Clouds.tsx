import React, { useEffect } from 'react';

const Clouds: React.FC = () => {
    useEffect(() => {
        const styleId = 'cloud-animations';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            @keyframes drift-1 {
                from { transform: translateX(-200%); }
                to { transform: translateX(200%); }
            }
            @keyframes drift-2 {
                from { transform: translateX(-250%); }
                to { transform: translateX(250%); }
            }
            @keyframes drift-3 {
                from { transform: translateX(-180%); }
                to { transform: translateX(180%); }
            }
            .cloud {
                position: absolute;
                background: white;
                border-radius: 50%;
                opacity: 0.2;
                filter: blur(8px);
            }
        `;
        document.head.appendChild(style);
    }, []);

    const cloudBaseStyle = "cloud";

    return (
        <div className="absolute inset-0 top-[5%] h-[30%] overflow-hidden pointer-events-none z-0">
            {/* Cloud Group 1 */}
            <div style={{ position: 'absolute', top: '10%', left: '0', width: '100%', height: '100px', animation: 'drift-1 90s linear infinite' }}>
                <div className={cloudBaseStyle} style={{ width: '150px', height: '40px', top: 0, left: '15%' }}></div>
                <div className={cloudBaseStyle} style={{ width: '60px', height: '60px', top: '-30px', left: '17%' }}></div>
                <div className={cloudBaseStyle} style={{ width: '80px', height: '80px', top: '-40px', left: '22%' }}></div>
            </div>
             {/* Cloud Group 2 */}
            <div style={{ position: 'absolute', top: '40%', left: '0', width: '100%', height: '120px', animation: 'drift-2 120s linear infinite 15s' }}>
                <div className={cloudBaseStyle} style={{ width: '200px', height: '60px', top: 0, right: '10%' }}></div>
                <div className={cloudBaseStyle} style={{ width: '80px', height: '80px', top: '-40px', right: '18%' }}></div>
                <div className={cloudBaseStyle} style={{ width: '100px', height: '100px', top: '-50px', right: '12%' }}></div>
            </div>
             {/* Cloud Group 3 */}
            <div style={{ position: 'absolute', top: '65%', left: '0', width: '100%', height: '80px', animation: 'drift-3 70s linear infinite 5s' }}>
                <div className={cloudBaseStyle} style={{ width: '120px', height: '30px', top: 0, left: '40%' }}></div>
                 <div className={cloudBaseStyle} style={{ width: '50px', height: '50px', top: '-25px', left: '42%' }}></div>
                <div className={cloudBaseStyle} style={{ width: '70px', height: '70px', top: '-35px', left: '48%' }}></div>
            </div>
        </div>
    );
};

export default Clouds;
