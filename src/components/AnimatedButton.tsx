'use client';

import { useState, useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import buttonAnimation from '../../public/button-animation.json';

interface AnimatedButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export default function AnimatedButton({
    children,
    onClick,
    className = ''
}: AnimatedButtonProps) {
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [pressDepth, setPressDepth] = useState(0);
    const [currentPressDuration, setCurrentPressDuration] = useState(0);
    const [pressSeconds, setPressSeconds] = useState(1);
    const pressStartTime = useRef<number | null>(null);
    const animationRef = useRef<any>(null);
    const animationFrameRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Handle mouse down
    const handleMouseDown = () => {
        setIsPressed(true);
        pressStartTime.current = Date.now();
        setCurrentPressDuration(0);
        setPressSeconds(0);
        console.log('Mouse down - starting press');

        // Start press animation
        if (animationRef.current) {
            animationRef.current.play();
        }

        // Start timer that updates every 50ms for millisecond precision
        timerRef.current = setInterval(() => {
            if (pressStartTime.current) {
                const duration = Date.now() - pressStartTime.current;
                const seconds = Math.floor(duration / 1000);
                setCurrentPressDuration(duration);
                setPressSeconds(seconds);
                console.log(`Press duration: ${seconds} seconds (${duration}ms)`);
            }
        }, 50);

        // Also start animation frame for smooth visual updates
        const updatePressDuration = () => {
            if (pressStartTime.current && isPressed) {
                const duration = Date.now() - pressStartTime.current;
                setCurrentPressDuration(duration);
                console.log(`Animation Frame: ${animationFrameRef.current}ms`)
                animationFrameRef.current = requestAnimationFrame(updatePressDuration);
            }
        };
        animationFrameRef.current = requestAnimationFrame(updatePressDuration);
    };

    // Handle mouse up
    const handleMouseUp = () => {
        setIsPressed(false);

        // Cancel animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Clear timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (pressStartTime.current) {
            const pressDuration = Date.now() - pressStartTime.current;
            const depth = Math.min(pressDuration / 1000, 1); // Max 1 second for full depth
            setPressDepth(depth);
            console.log('Mouse up - press duration:', pressDuration, 'depth:', depth, 'seconds:', pressSeconds);
        }

        pressStartTime.current = null;
        setCurrentPressDuration(0);
        setPressSeconds(0);

        // Stop animation and reset
        if (animationRef.current) {
            animationRef.current.stop();
        }

        // Call onClick after a short delay
        if (onClick) {
            setTimeout(() => onClick(), 100);
        }
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
        setIsPressed(false);
        setIsHovered(false);
        pressStartTime.current = null;
        setCurrentPressDuration(0);
        setPressSeconds(0);

        // Cancel animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Clear timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (animationRef.current) {
            animationRef.current.stop();
        }
    };

    // Handle mouse enter
    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    // Reset press depth after animation
    useEffect(() => {
        if (pressDepth > 0) {
            const timer = setTimeout(() => {
                setPressDepth(0);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [pressDepth]);

    // Cleanup animation frame and timer on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Force re-render when press duration changes
    useEffect(() => {
        if (isPressed && currentPressDuration > 0) {
            // This will trigger a re-render and recalculate the transform
            console.log('Press duration updated:', currentPressDuration);
        }
    }, [currentPressDuration, isPressed]);

    // Calculate transform based on press state and depth
    const getTransform = () => {
        const baseScale = isHovered ? 1.05 : 1;

        // Use millisecond-based expansion for precise control
        const maxDuration = 10000; // 10 seconds in milliseconds
        const expansionRatio = Math.min(currentPressDuration / maxDuration, 1);
        console.log('Expansion ratio:', expansionRatio, 'Duration:', currentPressDuration, 'Max:', maxDuration);

        // Allow expansion up to 10x the original size
        const pressScale = isPressed ? 1 + (expansionRatio * 9) : 1;
        const translateY = isPressed ? expansionRatio * 21 : 0;

        const finalScale = baseScale * pressScale;
        console.log('Transform:', {
            isPressed,
            pressSeconds,
            expansionRatio,
            finalScale,
            pressScale,
            // pulseScale,
            // finalPressScale
        });

        return {
            transform: `scale(${finalScale}) translateY(${translateY}px)`,
            transition: isPressed ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: isPressed ? 1000 : 'auto'
        };
    };

    return (
        <div className="relative inline-block" style={{
            transform: 'translateZ(0)', // Force hardware acceleration
            willChange: 'transform' // Optimize for animations
        }}>
            {/* Lottie Animation Background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    opacity: isPressed ? 0.8 : 0,
                    transition: 'opacity 0.3s ease',
                    transform: 'scale(1.2)', // Make animation area larger
                    transformOrigin: 'center'
                }}
            >
                <Lottie
                    lottieRef={animationRef}
                    animationData={buttonAnimation}
                    loop={false}
                    autoplay={false}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {/* Button */}
            <button
                className={`
          relative z-10 w-20 h-20 rounded-full font-semibold text-white
          shadow-lg hover:shadow-xl
          active:shadow-md
          focus:outline-none focus:ring-4 focus:ring-blue-300
          select-none cursor-pointer
          flex items-center justify-center
          border-2 border-white/20
          ${className}
        `}
                style={{
                    ...getTransform(),
                    background: isPressed
                        ? `linear-gradient(135deg, #ff6b35, #f7931e)`
                        : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    transformOrigin: 'center',
                    willChange: 'transform',
                    boxShadow: isPressed
                        ? `0 0 ${20 + (currentPressDuration / 10)}px rgba(255, 107, 53, 0.8), 0 0 ${40 + (currentPressDuration / 5)}px rgba(255, 107, 53, 0.4)`
                        : '0 4px 15px rgba(0, 0, 0, 0.2)',
                }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
            >
                {children}

                {/* Press effect overlay */}
                {isPressed && (
                    <div
                        className="absolute inset-0 bg-black rounded-xl"
                        style={{
                            opacity: pressDepth * 0.3,
                            transition: 'opacity 0.1s ease'
                        }}
                    />
                )}
            </button>
        </div>
    );
}
