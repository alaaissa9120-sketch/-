import React, { useEffect, useRef } from 'react';

interface Drop {
  x: number;
  y: number;
  speed: number;
  radius: number;
  length: number;
  opacity: number;
  isStream: boolean;
  trail: { x: number; y: number; r: number; alpha: number }[];
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export const WaterDropsCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const drops: Drop[] = [];
    const ripples: Ripple[] = [];

    // Initialize initial ambient water drops
    const dropCount = Math.floor(Math.min(width, 600) / 18);
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 2 + Math.random() * 4.5,
        radius: 1.5 + Math.random() * 2.8,
        length: 4 + Math.random() * 14,
        opacity: 0.4 + Math.random() * 0.5,
        isStream: Math.random() > 0.85,
        trail: [],
      });
    }

    // Main central drip stream matching the wallpaper
    const spawnCentralDrip = () => {
      const centerX = width / 2 + (Math.random() * 30 - 15);
      drops.push({
        x: centerX,
        y: -20,
        speed: 6.5 + Math.random() * 3,
        radius: 3.5 + Math.random() * 2.5,
        length: 18 + Math.random() * 16,
        opacity: 0.85,
        isStream: true,
        trail: [],
      });
    };

    let dripTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      dripTimer++;
      if (dripTimer % 35 === 0) {
        spawnCentralDrip();
      }

      // Draw and update ripples at bottom
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += 1.2;
        rip.opacity -= 0.015;

        if (rip.opacity <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.ellipse(rip.x, rip.y, rip.radius, rip.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(220, 240, 255, ${rip.opacity * 0.7})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Draw and update falling water droplets
      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];

        // Leave subtle trail on glass occasionally
        if (drop.isStream && Math.random() > 0.4) {
          drop.trail.push({
            x: drop.x + (Math.random() - 0.5),
            y: drop.y,
            r: drop.radius * 0.45,
            alpha: 0.4,
          });
          if (drop.trail.length > 12) {
            drop.trail.shift();
          }
        }

        // Render water trail
        for (let t = 0; t < drop.trail.length; t++) {
          const pt = drop.trail[t];
          pt.alpha -= 0.012;
          if (pt.alpha > 0) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 240, 255, ${pt.alpha * 0.35})`;
            ctx.fill();
          }
        }

        // Move drop downwards
        drop.y += drop.speed;

        // Draw falling water droplet body (teardrop / pill)
        const gradient = ctx.createLinearGradient(
          drop.x,
          drop.y - drop.length,
          drop.x,
          drop.y + drop.radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(0.6, `rgba(220, 240, 255, ${drop.opacity * 0.7})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${drop.opacity * 0.95})`);

        ctx.beginPath();
        // Teardrop shape
        ctx.ellipse(
          drop.x,
          drop.y,
          drop.radius,
          drop.radius + drop.length * 0.4,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = gradient;
        ctx.fill();

        // Glistening highlight specular dot
        ctx.beginPath();
        ctx.arc(drop.x - drop.radius * 0.3, drop.y - drop.radius * 0.2, drop.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${drop.opacity * 0.9})`;
        ctx.fill();

        // When drop hits bottom
        if (drop.y > height - 30) {
          // create splash ripple
          if (Math.random() > 0.4) {
            ripples.push({
              x: drop.x,
              y: height - 20,
              radius: 2,
              maxRadius: 20 + Math.random() * 15,
              opacity: 0.6,
            });
          }

          // Reset drop to top
          drop.y = -10 - Math.random() * 40;
          drop.x = drop.isStream ? width / 2 + (Math.random() * 40 - 20) : Math.random() * width;
          drop.speed = 2.5 + Math.random() * 5.5;
          drop.trail = [];
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${className}`}
    />
  );
};
