import React, { useEffect, useState } from 'react';

const NeuralCursor: React.FC = () => {
    const [position, setPosition] = useState({ x: -100, y: -100 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
            {/* Horizontal Scanning Line */}
            <div
                className="absolute left-0 w-full h-[1px] bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-transform duration-75 ease-out"
                style={{ transform: `translateY(${position.y}px)` }}
            />

            {/* Vertical Scanning Line */}
            <div
                className="absolute top-0 w-[1px] h-full bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-transform duration-75 ease-out"
                style={{ transform: `translateX(${position.x}px)` }}
            />

            {/* Origin Crosshair */}
            <div
                className="absolute w-4 h-4 -ml-2 -mt-2 border border-blue-500/40 rounded-full transition-transform duration-100 ease-out flex items-center justify-center"
                style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
            >
                <div className="w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_white]"></div>

                {/* Decorative Corner Brackets */}
                <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-blue-400"></div>
                <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-blue-400"></div>
            </div>

            <style>{`
        @keyframes scan-glow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        .neural-lines {
          animation: scan-glow 4s infinite ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default NeuralCursor;
