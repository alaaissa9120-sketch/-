import React from 'react';
import classicAvatar from '../assets/images/meshmesh_avatar_1791506916142.jpg';
import cyberAvatar from '../assets/images/meshmesh_cyber_1791507090382.jpg';
import cozyAvatar from '../assets/images/meshmesh_cozy_1791507103483.jpg';
import { Volume2, VolumeX, Mic, Sliders, Brain, Sparkles } from 'lucide-react';
import { PersonalizationSettings } from '../types';

interface MeshmeshAvatarProps {
  status: 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing';
  isMuted: boolean;
  onToggleMute: () => void;
  lastSpeech?: string;
  onMicClick?: () => void;
  personalization: PersonalizationSettings;
  memoriesCount: number;
  onOpenPersonalization: () => void;
  onOpenMemory: () => void;
}

export const MeshmeshAvatar: React.FC<MeshmeshAvatarProps> = ({
  status,
  isMuted,
  onToggleMute,
  lastSpeech,
  onMicClick,
  personalization,
  memoriesCount,
  onOpenPersonalization,
  onOpenMemory,
}) => {
  // Select active image based on avatarStyle
  const getAvatarImage = () => {
    switch (personalization.avatarStyle) {
      case 'cyber':
        return cyberAvatar;
      case 'cozy':
        return cozyAvatar;
      case 'classic':
      default:
        return classicAvatar;
    }
  };

  // Determine aura glow gradients
  const getAuraGradient = () => {
    switch (personalization.auraColor) {
      case 'cyan':
        return 'from-cyan-500/80 via-blue-500/60 to-indigo-500/80';
      case 'violet':
        return 'from-purple-500/80 via-fuchsia-500/60 to-pink-500/80';
      case 'emerald':
        return 'from-emerald-500/80 via-teal-500/60 to-cyan-500/80';
      case 'amber':
        return 'from-amber-400/80 via-yellow-500/60 to-orange-500/80';
      case 'peach':
      default:
        return 'from-orange-500/80 via-amber-400/60 to-rose-400/80';
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'listening':
        return {
          text: 'مُنصتة إليك بعناية...',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400 animate-ping',
        };
      case 'thinking':
        return {
          text: 'أفكر وأحلل طلبك والذاكرة...',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400 animate-spin',
        };
      case 'speaking':
        return {
          text: 'مشمش تتحدث الآن...',
          color: 'bg-orange-500/20 text-orange-200 border-orange-500/40',
          dot: 'bg-orange-400 animate-pulse',
        };
      case 'executing':
        return {
          text: 'تنفيذ الإجراء على الهاتف...',
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          dot: 'bg-cyan-400 animate-bounce',
        };
      default:
        return {
          text: 'حاضرة معك وودودة',
          color: 'bg-orange-950/40 text-orange-300/90 border-orange-800/30',
          dot: 'bg-orange-400',
        };
    }
  };

  const badge = getStatusBadge();
  const avatarSrc = getAvatarImage();
  const auraGradient = getAuraGradient();
  const glowOpacity = (personalization.glowIntensity / 100).toFixed(2);

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-4 text-center select-none">
      {/* Top Quick Actions: Personalization & Memory Badges */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={onOpenPersonalization}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-orange-500/50 hover:bg-slate-800 transition text-xs font-medium shadow-sm active:scale-95"
          title="تخصيص المظهر، الصوت، وطباع الشخصية"
        >
          <Sliders className="w-3.5 h-3.5 text-orange-400" />
          <span>تخصيص مشمش</span>
        </button>

        <button
          onClick={onOpenMemory}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-purple-300 hover:text-purple-100 hover:border-purple-500/50 hover:bg-slate-800 transition text-xs font-medium shadow-sm active:scale-95"
          title="عرض وإدارة ذكريات مشمش عنك"
        >
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span>الذاكرة ({memoriesCount})</span>
        </button>
      </div>

      {/* Avatar Container with Animated Halos */}
      <div className="relative group my-2">
        {/* Dynamic Aura Glow based on user preference */}
        <div
          style={{ opacity: Number(glowOpacity) }}
          className={`absolute -inset-4 rounded-full blur-2xl transition-all duration-700 pointer-events-none bg-gradient-to-tr ${auraGradient} ${
            status === 'speaking'
              ? 'scale-115'
              : status === 'listening'
              ? 'scale-110'
              : status === 'thinking'
              ? 'scale-105'
              : 'scale-95'
          }`}
        />

        {/* Pulsing Ripple Circle for Audio */}
        {(status === 'speaking' || status === 'listening') && (
          <div className="absolute -inset-3 rounded-full border-2 border-orange-400/40 animate-ping pointer-events-none" />
        )}

        {/* Avatar Image Frame */}
        <div 
          onClick={onMicClick}
          className="relative w-28 h-28 sm:w-34 sm:h-34 rounded-full overflow-hidden border-2 border-orange-300/40 shadow-2xl bg-slate-900 cursor-pointer transform transition-transform duration-300 hover:scale-105 active:scale-95"
          title="اضغط للتحدث مع مشمش بالصوت"
        >
          <img
            src={avatarSrc}
            alt="مشمش - رفيقتك الافتراضية"
            className={`w-full h-full object-cover object-center transition-transform duration-700 ${
              status === 'speaking' ? 'scale-105' : 'scale-100'
            }`}
          />

          {/* Quick mic overlay on hover */}
          <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Mic className="w-8 h-8 text-orange-200 drop-shadow-md animate-pulse" />
          </div>
        </div>

        {/* Bottom Audio Waveform Pill when speaking */}
        {status === 'speaking' && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-orange-500/40 shadow-lg flex items-center gap-1">
            <div className="w-1 bg-orange-400 rounded-full animate-soundwave-1" />
            <div className="w-1 bg-amber-300 rounded-full animate-soundwave-2" />
            <div className="w-1 bg-orange-400 rounded-full animate-soundwave-3" />
            <div className="w-1 bg-amber-300 rounded-full animate-soundwave-4" />
            <div className="w-1 bg-orange-400 rounded-full animate-soundwave-5" />
          </div>
        )}

        {/* Status Toggle Button: Mute / Unmute */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="absolute -top-1 -right-1 p-2 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-md"
          title={isMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-orange-400" />
          )}
        </button>
      </div>

      {/* Companion Title & Warm Subtitle */}
      <div className="mt-1 flex flex-col items-center">
        <div className="flex items-center gap-1.5">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-200 via-amber-200 to-orange-400 bg-clip-text text-transparent">
            مشمش
          </h2>
          <span className="text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/20">
            {personalization.avatarStyle === 'cyber' ? 'سايبر AI' : personalization.avatarStyle === 'cozy' ? 'كوزي AI' : 'أندرويد AI'}
          </span>
        </div>

        {/* State Pill */}
        <div
          className={`mt-2 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm transition-all duration-300 ${badge.color}`}
        >
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          <span>{badge.text}</span>
        </div>
      </div>

      {/* Real-time speech transcript bubble */}
      {lastSpeech && (
        <div className="mt-3 max-w-sm px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-orange-500/20 text-slate-200 text-sm leading-relaxed shadow-lg backdrop-blur-md transition-all">
          <p className="font-medium text-amber-100/95 font-['Tajawal',sans-serif]">
            "{lastSpeech}"
          </p>
        </div>
      )}
    </div>
  );
};
