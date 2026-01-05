
import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Simulate loading time (2.5 seconds)
    const duration = 2500; 
    const intervalTime = 30; // Update every 30ms
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsFinished(true);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isFinished) {
      // Wait for the slide-up animation to complete before unmounting
      const timer = setTimeout(() => {
        onComplete();
      }, 1000); // 1s matches the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isFinished, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-[#013328] flex flex-col items-center justify-center transition-transform duration-1000 cubic-bezier(0.77, 0, 0.175, 1) ${
        isFinished ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
        {/* Main Content Container */}
        <div className="relative z-10 text-center px-4">
            
            {/* Logo/Name Reveal */}
            <div className="overflow-hidden mb-6">
                <h1 className="text-5xl md:text-8xl font-bold text-[#ede9d6] animate-reveal-up">
                    PAWLOS<span className="text-[#f4a261]">.M</span>
                </h1>
            </div>

            {/* Subtitle with lines */}
            <div className="flex items-center justify-center gap-4 md:gap-6 opacity-0 animate-fade-in delay-500">
                 <div className="h-[1px] w-8 md:w-16 bg-[#ede9d6]/30"></div>
                 <p className="text-xs md:text-sm tracking-[0.4em] text-[#f4a261] uppercase font-medium">
                    Architect & Developer
                 </p>
                 <div className="h-[1px] w-8 md:w-16 bg-[#ede9d6]/30"></div>
            </div>
        </div>

        {/* Large Background Percentage (Decorative) */}
        <div className="absolute bottom-0 right-0 p-8 md:p-12 overflow-hidden pointer-events-none">
             <div className="text-[120px] md:text-[200px] leading-none font-bold text-[#ede9d6] opacity-5 select-none font-sans translate-y-10">
                {Math.floor(count)}
             </div>
        </div>
        
        {/* Bottom Loading Bar */}
        <div className="absolute bottom-0 left-0 w-full">
            <div className="h-1 bg-[#021a15] w-full">
                <div 
                    className="h-full bg-[#f4a261] transition-all duration-100 ease-out shadow-[0_0_10px_#f4a261]" 
                    style={{ width: `${count}%` }}
                ></div>
            </div>
        </div>

        <style>{`
            @keyframes reveal-up {
                0% { transform: translateY(100%); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            .animate-reveal-up {
                animation: reveal-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes fade-in {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
            .animate-fade-in {
                animation: fade-in 1s ease-out 0.5s forwards;
            }
            .delay-500 {
                animation-delay: 0.5s;
            }
        `}</style>
    </div>
  );
};

export default Preloader;
