import React, { useState, useEffect } from 'react';
import { 
  Wifi, Battery, Signal, Maximize2, Minimize2, Circle, Square, 
  Triangle, Bell, Smartphone, Sparkles, ExternalLink, Sliders, Brain 
} from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeScreenName: string;
  onNavigateHome: () => void;
  onNavigateBack: () => void;
  notificationMessage?: string | null;
  onDismissNotification?: () => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeScreenName,
  onNavigateHome,
  onNavigateBack,
  notificationMessage,
  onDismissNotification,
  isFullScreen,
  onToggleFullScreen,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('ar-SA', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative flex items-center justify-center w-full transition-all duration-300 ${isFullScreen ? 'h-screen p-0' : 'min-h-screen py-4 px-2 sm:px-4'}`}>
      {/* Device Shell (when not fullscreen) */}
      <div
        className={`relative flex flex-col overflow-hidden bg-slate-950 transition-all duration-300 ${
          isFullScreen
            ? 'w-full h-full rounded-none border-0'
            : 'w-full max-w-[430px] h-[870px] max-h-[95vh] rounded-[48px] border-[8px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(249,115,22,0.15)] ring-1 ring-slate-700/80'
        }`}
      >
        {/* Android Punch Hole Camera & Speaker Ear Piece (visible in device frame) */}
        {!isFullScreen && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 pointer-events-none">
            <div className="w-12 h-1 bg-slate-800 rounded-full" />
            <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-700/60" />
          </div>
        )}

        {/* Realistic Android Status Bar */}
        <div className="h-10 px-6 pt-1 flex items-center justify-between text-xs text-slate-300 bg-slate-950/90 z-30 select-none border-b border-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold font-mono tracking-wider">{timeStr || '12:00'}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" title="مشمش نشطة" />
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <button
              onClick={onToggleFullScreen}
              className="p-1 rounded hover:text-white transition"
              title={isFullScreen ? 'تصغير إلى إطار الهاتف' : 'تكبير ملء الشاشة'}
            >
              {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5 font-mono text-[10px]">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span>94%</span>
            </div>
          </div>
        </div>

        {/* Dynamic Android Notification Banner */}
        {notificationMessage && (
          <div className="absolute top-12 left-3 right-3 z-40 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-900/95 border border-orange-500/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 flex-shrink-0">
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] text-orange-300/80 font-bold block">نظام أندرويد • مشمش</span>
                  <p className="text-xs text-slate-100 font-medium">{notificationMessage}</p>
                </div>
              </div>
              {onDismissNotification && (
                <button
                  onClick={onDismissNotification}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800"
                >
                  إغلاق
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-950">
          {children}
        </div>

        {/* Android 3-Button Navigation Bar */}
        <div className="h-11 bg-slate-950 border-t border-slate-900 flex items-center justify-around px-8 z-30 select-none">
          {/* Back Button */}
          <button
            onClick={onNavigateBack}
            className="p-2 text-slate-400 hover:text-white active:scale-90 transition rounded-full"
            title="رجوع"
          >
            <Triangle className="w-4 h-4 -rotate-90 fill-current" />
          </button>

          {/* Home Button */}
          <button
            onClick={onNavigateHome}
            className="p-2 text-slate-400 hover:text-white active:scale-90 transition rounded-full"
            title="الرئيسية"
          >
            <Circle className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Recents Button */}
          <button
            onClick={onNavigateHome}
            className="p-2 text-slate-400 hover:text-white active:scale-90 transition rounded-full"
            title="التطبيقات الحديثة"
          >
            <Square className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
