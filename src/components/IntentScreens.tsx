import React, { useState, useEffect } from 'react';
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, Grid, User, MessageSquare, 
  Send, Play, Pause, SkipBack, SkipForward, Music2, Youtube, 
  Clock, Bell, Plus, Check, Camera, RefreshCw, Compass, Settings, 
  Share2, ArrowLeft, X, ExternalLink
} from 'lucide-react';
import { ActiveCall, SMSThread, MediaState, AlarmItem } from '../types';

/* -------------------------------------------------------------
 * 1. PHONE_CALL: Simulated In-Call Screen
 * ----------------------------------------------------------- */
interface CallScreenProps {
  call: ActiveCall;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
}

export const CallScreen: React.FC<CallScreenProps> = ({
  call,
  onEndCall,
  onToggleMute,
  onToggleSpeaker,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 text-white select-none">
      {/* Top Caller Header */}
      <div className="flex flex-col items-center mt-6">
        <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-orange-500/30 flex items-center justify-center shadow-xl mb-4 relative">
          <User className="w-12 h-12 text-slate-300" />
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow">
            <Phone className="w-3.5 h-3.5" />
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          {call.contact_name}
        </h2>
        {call.phone_number && (
          <p className="text-sm text-slate-400 mb-1 font-mono">{call.phone_number}</p>
        )}

        <div className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {call.status === 'dialing' ? 'جارِ الاتصال...' : `متصل • ${formatTime(call.durationSeconds)}`}
        </div>
      </div>

      {/* Center in-call actions */}
      <div className="grid grid-cols-3 gap-6 my-auto px-4">
        <button
          onClick={onToggleMute}
          className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition ${
            call.isMuted ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {call.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          <span className="text-xs">{call.isMuted ? 'مكتوم' : 'كتم'}</span>
        </button>

        <button
          onClick={onToggleSpeaker}
          className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition ${
            call.isSpeaker ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Volume2 className="w-6 h-6" />
          <span className="text-xs">{call.isSpeaker ? 'مكبر الصوت (مشغل)' : 'مكبر الصوت'}</span>
        </button>

        <button className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-800/60 text-slate-300 hover:bg-slate-800 transition">
          <Grid className="w-6 h-6" />
          <span className="text-xs">لوحة الأرقام</span>
        </button>
      </div>

      {/* End Call Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={onEndCall}
          className="w-18 h-18 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-xl flex items-center justify-center text-white"
          title="إنهاء المكالمة"
        >
          <PhoneOff className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 2. SEND_SMS: Simulated Google Messages / SMS Thread
 * ----------------------------------------------------------- */
interface SmsScreenProps {
  thread: SMSThread;
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

export const SmsScreen: React.FC<SmsScreenProps> = ({
  thread,
  onSendMessage,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 rtl-flip" />
          </button>
          <div className="w-9 h-9 rounded-full bg-orange-600/30 text-orange-400 font-bold flex items-center justify-center text-sm border border-orange-500/30">
            {thread.contact_name[0] || '؟'}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100">{thread.contact_name}</h3>
            <span className="text-[11px] text-emerald-400">رسائل SMS القصيرة</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-center my-2">
          <span className="text-[11px] bg-slate-800/80 px-2.5 py-1 rounded-full text-slate-400">
            اليوم • مشفر بين طرفين
          </span>
        </div>

        {thread.messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-orange-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
                }`}
              >
                <p>{msg.text}</p>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                <span>{msg.timestamp}</span>
                {isUser && <Check className="w-3 h-3 text-orange-400" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`الرد على ${thread.contact_name}...`}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
        />
        <button
          type="submit"
          className="p-2.5 rounded-full bg-orange-600 text-white hover:bg-orange-500 active:scale-95 transition"
        >
          <Send className="w-4 h-4 rtl-flip" />
        </button>
      </form>
    </div>
  );
};

/* -------------------------------------------------------------
 * 3. PLAY_MEDIA: Simulated Spotify / YouTube Media Player
 * ----------------------------------------------------------- */
interface MediaScreenProps {
  media: MediaState;
  onTogglePlay: () => void;
  onClose: () => void;
}

export const MediaScreen: React.FC<MediaScreenProps> = ({
  media,
  onTogglePlay,
  onClose,
}) => {
  const isSpotify = media.platform.toLowerCase().includes('spot');

  return (
    <div className="h-full flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 text-white select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/60">
          <ArrowLeft className="w-5 h-5 rtl-flip" />
        </button>
        <div className="flex items-center gap-2">
          {isSpotify ? (
            <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Music2 className="w-3.5 h-3.5" />
              <span>Spotify</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube</span>
            </div>
          )}
        </div>
        <div className="w-8" />
      </div>

      {/* Album Art with Animated Equalizer */}
      <div className="flex flex-col items-center my-auto">
        <div className="relative w-56 h-56 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/30 via-orange-600/20 to-purple-600/30" />
          <Music2 className="w-20 h-20 text-orange-300/60 drop-shadow-md" />

          {/* Equalizer animation when playing */}
          {media.isPlaying && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1.5 px-4 py-2 bg-slate-950/80 backdrop-blur-md rounded-full border border-orange-500/30">
              <div className="w-1.5 bg-orange-400 rounded-full animate-soundwave-1" />
              <div className="w-1.5 bg-amber-300 rounded-full animate-soundwave-2" />
              <div className="w-1.5 bg-orange-500 rounded-full animate-soundwave-3" />
              <div className="w-1.5 bg-amber-400 rounded-full animate-soundwave-4" />
              <div className="w-1.5 bg-orange-300 rounded-full animate-soundwave-5" />
            </div>
          )}
        </div>

        {/* Track Metadata */}
        <div className="text-center mt-6 max-w-xs">
          <h2 className="text-xl font-bold text-white truncate">{media.title || media.query}</h2>
          <p className="text-sm text-slate-400 mt-1">{media.artist || 'مشغل الوسائط'}</p>
        </div>
      </div>

      {/* Progress Bar & Controls */}
      <div className="w-full space-y-4 mb-4">
        <div className="space-y-1">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${media.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>01:42</span>
            <span>03:50</span>
          </div>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center justify-center gap-6">
          <button className="p-2 text-slate-400 hover:text-white transition">
            <SkipBack className="w-6 h-6 rtl-flip" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-400 text-slate-950 flex items-center justify-center shadow-lg transition active:scale-95"
          >
            {media.isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current mr-0.5" />
            )}
          </button>

          <button className="p-2 text-slate-400 hover:text-white transition">
            <SkipForward className="w-6 h-6 rtl-flip" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 4. SET_ALARM: Simulated Android Clock / Alarms
 * ----------------------------------------------------------- */
interface ClockScreenProps {
  alarms: AlarmItem[];
  onToggleAlarm: (id: string) => void;
  onTriggerAlarmPreview: (alarm: AlarmItem) => void;
  onClose: () => void;
}

export const ClockScreen: React.FC<ClockScreenProps> = ({
  alarms,
  onToggleAlarm,
  onTriggerAlarmPreview,
  onClose,
}) => {
  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 rtl-flip" />
          </button>
          <div className="flex items-center gap-2 text-orange-400 font-bold">
            <Clock className="w-5 h-5" />
            <span>المنبهات والساعة</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Alarm list */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className={`p-4 rounded-2xl border transition-all ${
              alarm.enabled
                ? 'bg-slate-900/90 border-orange-500/40 shadow-md'
                : 'bg-slate-900/40 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold font-mono tracking-tight text-white">
                  {alarm.time}
                </span>
                <p className="text-xs text-orange-300/80 mt-1">{alarm.label}</p>
                <div className="flex gap-1 mt-2 text-[10px] text-slate-400">
                  {alarm.days.map((d, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Toggle switch */}
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => onToggleAlarm(alarm.id)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    alarm.enabled ? 'bg-orange-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      alarm.enabled ? 'translate-x-0' : '-translate-x-5'
                    }`}
                  />
                </button>

                {alarm.enabled && (
                  <button
                    onClick={() => onTriggerAlarmPreview(alarm)}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Bell className="w-3 h-3" />
                    <span>اختبار الرنين</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 5. OPEN_APP: Native Simulated Apps (Camera, WhatsApp, Maps, Settings)
 * ----------------------------------------------------------- */
interface AppScreenProps {
  appName: string;
  onClose: () => void;
}

export const GenericAppScreen: React.FC<AppScreenProps> = ({ appName, onClose }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const normalized = appName.toLowerCase();

  const isCamera = normalized.includes('كاميرا') || normalized.includes('camera');
  const isWhatsApp = normalized.includes('واتس') || normalized.includes('whatsapp');
  const isMaps = normalized.includes('خرائط') || normalized.includes('maps');
  const isSettings = normalized.includes('إعدادات') || normalized.includes('settings');

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 rtl-flip" />
          </button>
          <span className="font-semibold text-sm text-slate-200">{appName}</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Screen Body according to app */}
      <div className="flex-1 flex flex-col">
        {isCamera ? (
          <div className="flex-1 bg-black flex flex-col justify-between p-6">
            <div className="flex justify-between text-white text-xs">
              <span className="px-2 py-1 rounded bg-black/60">HDR تلقائي</span>
              <span className="px-2 py-1 rounded bg-black/60">4K • 60fps</span>
            </div>

            {/* Viewfinder Mockup */}
            <div className="relative aspect-[3/4] border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center overflow-hidden bg-slate-900/60">
              <div className="text-center p-4">
                <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-slate-300">محدد المشهد جاهز للالتقاط</p>
                <p className="text-[10px] text-slate-500 mt-1">تم تشغيل الكاميرا عبر مشمش بنجاح</p>
              </div>
            </div>

            {/* Shutter Button */}
            <div className="flex justify-center items-center gap-8 mb-2">
              <button className="p-3 rounded-full bg-slate-800 text-white">
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="w-18 h-18 rounded-full border-4 border-white p-1">
                <div className="w-full h-full bg-white rounded-full active:scale-90 transition" />
              </div>
              <div className="w-11 h-11" />
            </div>
          </div>
        ) : isWhatsApp ? (
          <div className="flex-1 p-4 space-y-3 bg-slate-950">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold">
                أ
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">أحمد الشامي</h4>
                <p className="text-xs text-slate-400">تمام، بشوفك هناك إن شاء الله</p>
              </div>
              <span className="text-[10px] text-slate-500">10:45 ص</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-600/30 text-orange-400 flex items-center justify-center font-bold">
                س
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">سارة</h4>
                <p className="text-xs text-slate-400">أنا بالطريق</p>
              </div>
              <span className="text-[10px] text-slate-500">منذ دقيقة</span>
            </div>
          </div>
        ) : isMaps ? (
          <div className="flex-1 bg-slate-900 p-6 flex flex-col items-center justify-center text-center">
            <Compass className="w-16 h-16 text-orange-400 mb-3 animate-pulse" />
            <h3 className="font-bold text-lg">خرائط الملاحة والتوجيه</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              جاهز لتحديد المسارات وحركة المرور المباشرة
            </p>
          </div>
        ) : isSettings ? (
          <div className="flex-1 p-4 space-y-2">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium">الشبكة واللاسلكي</span>
              </div>
              <span className="text-xs text-emerald-400">متصل (Wi-Fi)</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-sm font-medium">المساعد الافتراضي</span>
              <span className="text-xs text-orange-400 font-bold">مشمش (الافتراضي)</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-2xl mb-3 border border-orange-500/30">
              {appName[0]}
            </div>
            <h3 className="font-bold text-lg text-white">تطبيق {appName}</h3>
            <p className="text-xs text-slate-400 mt-1">تم فتح وتشغيل التطبيق في المقدمة</p>
          </div>
        )}
      </div>
    </div>
  );
};
