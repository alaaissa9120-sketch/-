import React, { useEffect, useRef } from 'react';

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
  wind: number;
}

interface WindowDrop {
  x: number;
  y: number;
  radius: number;
  speed: number;
  stuckTimer: number;
  opacity: number;
  trail: { x: number; y: number; r: number }[];
}

interface Splash {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

export const RainCanvas: React.FC<{ 
  intensity?: 'light' | 'moderate' | 'heavy';
  windAngle?: number;
  showGlassDroplets?: boolean;
  className?: string;
}> = ({ 
  intensity = 'moderate', 
  windAngle = 0.12, 
  showGlassDroplets = true,
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Raindrop density based on intensity
    const count = intensity === 'light' ? 90 : intensity === 'heavy' ? 240 : 160;

    const rainDrops: RainDrop[] = [];
    const windowDrops: WindowDrop[] = [];
    const splashes: Splash[] = [];

    // Create falling raindrops with 3 depth layers
    for (let i = 0; i < count; i++) {
      const layer = Math.random(); // 0 (far) to 1 (near)
      rainDrops.push({
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * height,
        length: 12 + layer * 22,
        speed: 12 + layer * 14,
        opacity: 0.15 + layer * 0.45,
        width: 0.8 + layer * 1.2,
        wind: windAngle * (12 + layer * 14),
      });
    }

    // Create glass pane droplets that slide down slowly
    if (showGlassDroplets) {
      const glassCount = Math.floor(Math.min(width, 1000) / 35);
      for (let i = 0; i < glassCount; i++) {
        windowDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 1.5 + Math.random() * 2.5,
          speed: 0.3 + Math.random() * 1.2,
          stuckTimer: Math.floor(Math.random() * 120),
          opacity: 0.35 + Math.random() * 0.45,
          trail: [],
        });
      }
    }

    const spawnSplash = (x: number, y: number) => {
      if (splashes.length > 50) return;
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
        const spd = 1.5 + Math.random() * 3;
        splashes.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: 1 + Math.random() * 1.2,
          alpha: 0.6,
        });
      }
    };

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Render Window Glass Drops (resting & sliding on the pane)
      if (showGlassDroplets) {
        for (let i = 0; i < windowDrops.length; i++) {
          const wd = windowDrops[i];

          // Stuck with surface tension or sliding
          if (wd.stuckTimer > 0) {
            wd.stuckTimer--;
          } else {
            wd.y += wd.speed;
            if (Math.random() > 0.6) {
              wd.trail.push({ x: wd.x, y: wd.y, r: wd.radius * 0.6 });
              if (wd.trail.length > 10) wd.trail.shift();
            }

            // Randomly pause again (natural glass droplet behavior)
            if (Math.random() < 0.015) {
              wd.stuckTimer = 40 + Math.floor(Math.random() * 80);
            }
          }

          // Draw trail
          for (let t = 0; t < wd.trail.length; t++) {
            const pt = wd.trail[t];
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 240, 255, ${wd.opacity * 0.25})`;
            ctx.fill();
          }

          // Draw glass droplet with highlight
          ctx.beginPath();
          ctx.arc(wd.x, wd.y, wd.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 230, 255, ${wd.opacity * 0.65})`;
          ctx.fill();

          // Specular shine
          ctx.beginPath();
          ctx.arc(wd.x - wd.radius * 0.35, wd.y - wd.radius * 0.35, wd.radius * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${wd.opacity * 0.95})`;
          ctx.fill();

          // Reset when reaching bottom
          if (wd.y > height + 10) {
            wd.y = -10 - Math.random() * 20;
            wd.x = Math.random() * width;
            wd.stuckTimer = Math.floor(Math.random() * 80);
            wd.trail = [];
          }
        }
      }

      // 2. Render Fast Falling Rain Streaks
      ctx.lineCap = 'round';
      for (let i = 0; i < rainDrops.length; i++) {
        const drop = rainDrops[i];

        drop.x += drop.wind;
        drop.y += drop.speed;

        // Draw streak gradient
        const endX = drop.x - drop.wind * (drop.length / drop.speed);
        const endY = drop.y - drop.length;

        const grad = ctx.createLinearGradient(endX, endY, drop.x, drop.y);
        grad.addColorStop(0, 'rgba(210, 230, 255, 0)');
        grad.addColorStop(0.8, `rgba(230, 245, 255, ${drop.opacity * 0.7})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${drop.opacity})`);

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(drop.x, drop.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = drop.width;
        ctx.stroke();

        // Hit bottom boundary
        if (drop.y > height - 15) {
          if (drop.opacity > 0.4 && Math.random() > 0.65) {
            spawnSplash(drop.x, height - 10);
          }

          // Recycle drop back to top
          drop.y = -20 - Math.random() * 40;
          drop.x = Math.random() * (width + 200) - 100;
        }

        // Horizontal wrap
        if (drop.x > width + 100) {
          drop.x = -50;
        }
      }

      // 3. Render Micro Splashes
      for (let i = splashes.length - 1; i >= 0; i--) {
        const sp = splashes[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.25; // gravity
        sp.alpha -= 0.04;

        if (sp.alpha <= 0) {
          splashes.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 245, 255, ${sp.alpha * 0.8})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animId);
    };
  }, [intensity, windAngle, showGlassDroplets]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};
