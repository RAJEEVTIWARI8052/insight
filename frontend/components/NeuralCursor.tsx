import React, { useEffect, useState, useRef } from 'react';

const NeuralCursor: React.FC = () => {
    const [points, setPoints] = useState<{ x: number; y: number; time: number }[]>([]);
    const mousePos = useRef({ x: -100, y: -100 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
            setPoints((prev) => {
                // Limit points for performance, keep only last 300ms
                const now = Date.now();
                return [...prev, { x: e.clientX, y: e.clientY, time: now }].filter(p => now - p.time < 300);
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        const cleanup = setInterval(() => {
            const now = Date.now();
            setPoints((prev) => prev.filter(p => now - p.time < 300));
        }, 50);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearInterval(cleanup);
        };
    }, []);

    const pathData = points.length > 1
        ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
        : '';

    return (
        <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
            {/* Laser Point */}
            <div
                className="absolute w-2 h-2 -ml-1 -mt-1 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6] z-10"
                style={{ left: `${mousePos.current.x}px`, top: `${mousePos.current.y}px` }}
            />

            <svg className="w-full h-full">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Shadow/Glow path */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.1)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                />

                {/* Core path */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};

export default NeuralCursor;
