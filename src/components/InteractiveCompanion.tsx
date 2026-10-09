import React, { useRef, useEffect } from 'react';
import goldenImg from '../assets/images/golden_energy_sphere_1791548187564.jpg';
import cyberVioletImg from '../assets/images/cyber_violet_sphere_1791548205879.jpg';

export type CompanionGesture = 'default' | 'hair' | 'wave' | 'think';
export type VideoTheme = 'golden' | 'cyber_violet';

interface InteractiveCompanionProps {
  videoTheme?: VideoTheme;
  imageSrc?: string;
  status: 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing';
  onTap: () => void;
  activeGesture?: CompanionGesture;
  onGestureChange?: (gesture: CompanionGesture) => void;
  className?: string;
}

export const InteractiveCompanion: React.FC<InteractiveCompanionProps> = ({
  videoTheme = 'golden',
  status,
  onTap,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSrc = videoTheme === 'golden' 
    ? '/golden_energy_sphere.mp4' 
    : '/cyber_violet_sphere.mp4';

  const posterImg = videoTheme === 'golden' ? goldenImg : cyberVioletImg;

  // Ensure video keeps playing smoothly across re-renders or visibility change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy handled gracefully
      });
    }
  }, [videoSrc]);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
      className={`relative w-full h-full flex items-center justify-center cursor-pointer select-none bg-black overflow-hidden ${className}`}
      title="اضغط للتحدث مع مشمش"
    >
      {/* High-Definition Looping Video Playing across the Entire Full Screen */}
      <video
        ref={videoRef}
        key={videoSrc}
        src={videoSrc}
        poster={posterImg}
        autoPlay
        loop
        muted
        playsInline
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />

      {/* Subtle responsive interactive glow when speaking or listening */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 z-10 ${
          status === 'speaking' 
            ? 'opacity-30' 
            : status === 'listening' 
            ? 'opacity-25' 
            : 'opacity-0'
        }`}
        style={{
          background: videoTheme === 'golden'
            ? 'radial-gradient(circle at center, rgba(245,158,11,0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(168,85,247,0.2) 0%, transparent 70%)'
        }}
      />
    </div>
  );
};
