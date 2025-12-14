
import React, { useMemo } from 'react';

interface SplashScreenProps {
  opacity?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ opacity = 'opacity-100' }) => {
  // Generate stars with random positions and animation properties
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1 + 'px',
      animationDuration: Math.random() * 3 + 2 + 's',
      animationDelay: Math.random() * 5 + 's',
    }));
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0F172A] text-white transition-opacity duration-500 ease-in-out ${opacity} overflow-hidden`}>
      <style>{`
        @keyframes sunRise {
            0% { bottom: -160px; transform: scale(0.8); }
            100% { bottom: 50%; transform: translateY(50%) scale(1); }
        }

        @keyframes reflectionRise {
            0% { bottom: -250px; }
            100% { bottom: 10%; }
        }

        @keyframes gridFadeIn {
            0% { opacity: 0; }
            100% { opacity: 0.3; }
        }

        @keyframes gridMove {
            0% { background-position: 0 0; }
            100% { background-position: 0 1000px; }
        }

        @keyframes textReveal {
            0% { 
                opacity: 0; 
                transform: translateY(20px); 
                letter-spacing: 30px; 
                filter: blur(10px);
            }
            100% { 
                opacity: 1; 
                transform: translateY(0); 
                letter-spacing: 10px; 
                filter: blur(0);
            }
        }

        @keyframes starMove {
            0% { opacity: 0; transform: translateY(0) scale(0.5); }
            50% { opacity: 0.8; transform: translateY(-20px) scale(1); }
            100% { opacity: 0; transform: translateY(-40px) scale(0.5); }
        }
      `}</style>

      <div className="relative w-full h-full flex justify-center items-center overflow-hidden bg-[radial-gradient(circle_at_center_bottom,#1e3a8a_0%,#0F172A_70%)]">
        
        {/* Moving Stars Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute bg-white rounded-full opacity-0"
                    style={{
                        left: star.left,
                        top: star.top,
                        width: star.size,
                        height: star.size,
                        animation: `starMove ${star.animationDuration} ease-in-out infinite`,
                        animationDelay: star.animationDelay
                    }}
                />
            ))}
        </div>

        {/* Blue Animated Grid */}
        <div 
            className="absolute bottom-[-50%] w-[200%] h-full bg-[linear-gradient(transparent_0%,#1e3a8a_2%,transparent_3%),linear-gradient(90deg,transparent_0%,#1e3a8a_2%,transparent_3%)] bg-[length:100px_100px] opacity-0"
            style={{
                transform: 'perspective(500px) rotateX(60deg)',
                animation: 'gridFadeIn 2s ease-out 1s forwards, gridMove 20s linear infinite'
            }}
        ></div>

        {/* Red Sun */}
        <div 
            className="absolute w-[150px] h-[150px] rounded-full bg-[linear-gradient(180deg,#FF4D4D,#ff2a2a)] shadow-[0_0_40px_#FF4D4D,0_0_80px_#FF4D4D] z-10"
            style={{
                bottom: '-160px',
                animation: 'sunRise 3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
            }}
        ></div>

        {/* Reflection */}
        <div 
            className="absolute w-[150px] h-[150px] rounded-full bg-[linear-gradient(180deg,#FF4D4D,transparent)] z-0 blur-xl opacity-60"
            style={{
                bottom: '-250px',
                transform: 'scaleY(-0.5)',
                animation: 'reflectionRise 3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
            }}
        ></div>

        {/* Text Content */}
        <div 
            className="absolute z-20 text-center opacity-0"
            style={{
                animation: 'textReveal 1.5s ease-out 2.5s forwards'
            }}
        >
            <h1 className="text-6xl md:text-8xl font-extrabold text-white uppercase tracking-tighter m-0 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] font-sans">
                STAR LIGHT
            </h1>
            <p className="text-[#7dd3fc] tracking-[5px] mt-4 text-xl md:text-2xl font-light uppercase font-sans">
                Create, Watch, Discover
            </p>
        </div>

      </div>
    </div>
  );
};
