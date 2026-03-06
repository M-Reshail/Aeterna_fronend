import React, { useEffect, useRef } from 'react';

/**
 * AnimatedTradingBackground - Creates a dynamic trading-themed background
 * with animated candlesticks and floating particles
 * 
 * Features:
 * - Animated candlestick patterns (green/red candles)
 * - Floating particle dots with depth effect
 * - Emerald gradient at bottom
 * - Smooth continuous animations
 * - Responsive and performant (uses canvas for particles)
 */
export const AnimatedTradingBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particles = [];
    const particleCount = 80;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.maxOpacity = this.opacity;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Keep particles within bounds
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Pulsing opacity
        this.opacity =
          this.maxOpacity +
          Math.sin(Date.now() * 0.005 + this.x) * (this.maxOpacity * 0.5);
      }

      draw() {
        ctx.fillStyle = `rgba(16, 185, 129, ${this.opacity})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      // Clear canvas with transparency (let body background show through)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{
        background: 'transparent',
      }}
    />
  );
};

/**
 * Alternative: CSS-based animated background (lighter weight)
 * Use this if Canvas version is too heavy on performance
 */
export const AnimatedTradingBackgroundCSS = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black-oled">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, #111111 0%, #000000 100%)',
        }}
      />

      {/* Animated candles SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="candleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Animated candle pattern */}
        {Array.from({ length: 15 }).map((_, i) => (
          <g key={i} style={{ animation: `float 6s ease-in-out infinite ${i * 0.2}s` }}>
            {/* Wick */}
            <line
              x1={`${(i / 15) * 100}%`}
              y1="20%"
              x2={`${(i / 15) * 100}%`}
              y2="60%"
              stroke="#10b981"
              strokeWidth="1"
              opacity="0.4"
            />
            {/* Body */}
            <rect
              x={`${(i / 15) * 100 - 1}%`}
              y="35%"
              width="2.5%"
              height="20%"
              fill="url(#candleGradient)"
            />
          </g>
        ))}
      </svg>

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-emerald-500"
          style={{
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.2,
            animation: `float ${5 + Math.random() * 5}s ease-in-out infinite ${
              Math.random() * 5
            }s`,
          }}
        />
      ))}

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(16, 185, 129, 0) 0%, rgba(16, 185, 129, 0.1) 100%)',
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedTradingBackground;
