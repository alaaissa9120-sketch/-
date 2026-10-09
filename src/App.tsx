import React, { useState, useEffect, useRef } from 'react';
import livingRoomBg from './assets/images/living_room_bg_1791508120847.jpg';
import phoneAvatarImg from './assets/images/mishmish_phone_avatar_1791508104656.jpg';
import { WelcomeCustomizationScreen } from './components/WelcomeCustomizationScreen';
import { 
  CallScreen, 
  SmsScreen, 
  MediaScreen, 
  ClockScreen, 
  GenericAppScreen 
} from './components/IntentScreens';
import { 
  ActiveAppScreen, 
  ActiveCall, 
  AlarmItem, 
  MediaState, 
  MemoryItem, 
  ParsedAction, 
  PersonalizationSettings, 
  SMSThread 
} from './types';
import { audioManager } from './utils/audio';
import {
  Mic, MicOff, Sliders, Brain, Sparkles, Volume2, VolumeX, 
  Phone, Bell, Check, X, ArrowLeft, MessageSquare, Droplets
} from 'lucide-react';

const DEFAULT_PERSONALIZATION: PersonalizationSettings = {
  avatarStyle: 'classic',
  auraColor: 'peach',
  glowIntensity: 75,
  voicePitch: 1.05,
  voiceSpeed: 1.0,
  voicePreset: 'kore',
  humor: 65,
  empathy: 85,
  chattiness: 50,
  spontaneity: 80,
};

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    category: 'profile',
    key: 'اسم المستخدم',
    value: 'علاء',
    source: 'manual',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    category: 'preference',
    key: 'المشروب المفضل',
    value: 'قهوة سوداء مع رشة هيل',
    source: 'manual',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-3',
    category: 'event',
    key: 'مناسبة قادمة',
    value: 'مقابلة عمل مهمة الأسبوع القادم',
    source: 'manual',
    createdAt: new Date().toISOString(),
  },
];

let memoryCounter = 0;
export const createUniqueMemoryId = () => {
  memoryCounter += 1;
  return `mem-${Date.now()}-${memoryCounter}-${Math.random().toString(36).substring(2, 7)}`;
};

const sanitizeMemories = (rawList: MemoryItem[]): MemoryItem[] => {
  if (!Array.isArray(rawList)) return INITIAL_MEMORIES;
  const seenKeys = new Set<string>();
  const seenIds = new Set<string>();
  const sanitized: MemoryItem[] = [];

  for (const item of rawList) {
    if (!item || !item.key || !item.value) continue;
    const normalizedKey = item.key.trim().toLowerCase();
    if (seenKeys.has(normalizedKey)) {
      // Update value of existing item if later
      const existing = sanitized.find((m) => m.key.trim().toLowerCase() === normalizedKey);
      if (existing) {
        existing.value = item.value;
      }
      continue;
    }

    seenKeys.add(normalizedKey);
    let finalId = item.id;
    if (!finalId || seenIds.has(finalId)) {
      finalId = createUniqueMemoryId();
    }
    seenIds.add(finalId);

    sanitized.push({
      ...item,
      id: finalId,
      createdAt: item.createdAt || new Date().toISOString(),
    });
  }

  return sanitized.length > 0 ? sanitized : INITIAL_MEMORIES;
};

export default function App() {
  // Personalization settings
  const [personalization, setPersonalization] = useState<PersonalizationSettings>(() => {
    try {
      const saved = localStorage.getItem('meshmesh_personalization');
      return saved ? JSON.parse(saved) : DEFAULT_PERSONALIZATION;
    } catch {
      return DEFAULT_PERSONALIZATION;
    }
  });

  // Long-term memories
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('meshmesh_memories');
      if (saved) {
        return sanitizeMemories(JSON.parse(saved));
      }
      return INITIAL_MEMORIES;
    } catch {
      return INITIAL_MEMORIES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('meshmesh_personalization', JSON.stringify(personalization));
    } catch (e) {
      console.warn(e);
    }
  }, [personalization]);

  useEffect(() => {
    try {
      localStorage.setItem('meshmesh_memories', JSON.stringify(memories));
    } catch (e) {
      console.warn(e);
    }
  }, [memories]);

  // Welcome / Customization Onboarding Modal (Always initial landing screen)
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  // App & Intent Screens
  const [activeScreen, setActiveScreen] = useState<ActiveAppScreen>('COMPANION');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Voice Interaction & Processing State
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'executing'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastSpeech, setLastSpeech] = useState<string>('');
  const [speechSubtitleVisible, setSpeechSubtitleVisible] = useState(false);

  // Recognition Ref
  const recognitionRef = useRef<any>(null);

  // Simulated Android Subsystems
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [smsThread, setSmsThread] = useState<SMSThread>({
    contact_name: 'سارة',
    messages: [
      { id: 'm-1', sender: 'contact', text: 'وين صرت يا صديقي؟ ناطرينك', timestamp: '10:30 ص' },
    ],
  });
  const [mediaState, setMediaState] = useState<MediaState>({
    isPlaying: false,
    query: 'فيروز - نسم علينا الهوا',
    platform: 'spotify',
    title: 'نسم علينا الهوا',
    artist: 'السيدة فيروز',
    progress: 35,
  });
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: 'al-1', time: '07:00', label: 'الاستيقاظ والصباح', enabled: true, days: ['يومياً'] },
  ]);
  const [openedAppName, setOpenedAppName] = useState<string>('');

  // Call timer
  useEffect(() => {
    let interval: any;
    if (activeCall && activeCall.status === 'connected') {
      interval = setInterval(() => {
        setActiveCall((prev) => (prev ? { ...prev, durationSeconds: prev.durationSeconds + 1 } : null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall?.status]);

  // Setup Web Speech API for Arabic Voice Input
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ar-SA';

        recognition.onstart = () => {
          setIsListening(true);
          setStatus('listening');
          audioManager.playChime('pop');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleSendMessage(transcript);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          setStatus('idle');
        };

        recognition.onend = () => {
          setIsListening(false);
          if (status === 'listening') {
            setStatus('idle');
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition setup error:', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatus('idle');
    } else {
      audioManager.stopSpeech();
      try {
        recognitionRef.current?.start();
      } catch {
        // Fallback prompt if microphone is unavailable in browser
        const promptText = window.prompt('تحدث مع مشمش (أو اكتب طلبك):', 'كيف حالك يا مشمش؟');
        if (promptText) {
          handleSendMessage(promptText);
        }
      }
    }
  };

  // Intent Execution
  const executeIntent = (action: ParsedAction, speech: string) => {
    const { intent, parameters } = action;

    switch (intent) {
      case 'PHONE_CALL': {
        const contactName = parameters.contact_name || parameters.phone_number || 'جهة اتصال';
        const phoneNumber = parameters.phone_number || '+966 55 123 4567';
        setStatus('executing');
        audioManager.playDialTone();
        setNotificationToast(`جارِ الاتصال بـ ${contactName}...`);

        setActiveCall({
          contact_name: contactName,
          phone_number: phoneNumber,
          durationSeconds: 0,
          status: 'dialing',
          isMuted: false,
          isSpeaker: false,
        });

        setActiveScreen('CALL');

        setTimeout(() => {
          setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
        }, 2200);
        break;
      }

      case 'SEND_SMS': {
        const contactName = parameters.contact_name || 'سارة';
        const messageBody = parameters.message_body || 'رسالة جديدة';
        setStatus('executing');
        audioManager.playChime('success');
        setNotificationToast(`تم إرسال الرسالة إلى ${contactName}`);

        setSmsThread({
          contact_name: contactName,
          messages: [
            { id: `sms-${Date.now()}`, sender: 'user', text: messageBody, timestamp: 'الآن' },
          ],
        });
        setActiveScreen('SMS');
        break;
      }

      case 'PLAY_MEDIA': {
        const query = parameters.query || 'موسيقى هادئة';
        const platform = (parameters.platform || 'spotify').toLowerCase();
        setStatus('executing');
        audioManager.playChime('success');
        setNotificationToast(`تشغيل "${query}"`);

        setMediaState({
          isPlaying: true,
          query: query,
          platform: platform.includes('spot') ? 'spotify' : 'youtube',
          title: query,
          artist: 'مشغل الوسائط',
          progress: 30,
        });
        setActiveScreen('MEDIA');
        break;
      }

      case 'OPEN_APP': {
        const appName = parameters.app_name || 'الكاميرا';
        setStatus('executing');
        audioManager.playChime('success');
        setNotificationToast(`تم فتح تطبيق ${appName}`);
        setOpenedAppName(appName);
        setActiveScreen('GENERIC_APP');
        break;
      }

      case 'SET_ALARM': {
        const time = parameters.time || '07:00';
        const label = parameters.label || 'منبه';
        setStatus('executing');
        audioManager.playChime('success');
        setNotificationToast(`تم ضبط المنبه: ${time}`);

        setAlarms((prev) => [
          { id: `al-${Date.now()}`, time, label, enabled: true, days: ['اليوم'] },
          ...prev,
        ]);
        setActiveScreen('CLOCK');
        break;
      }

      default:
        break;
    }
  };

  // Send message to server with robust offline/APK smart fallback
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    audioManager.stopSpeech();
    setStatus('thinking');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          personalization,
          memories,
        }),
      });

      if (!response.ok) throw new Error('Server unreachable');

      const data = await response.json();
      const speech = data.speech || 'أهلاً بك!';
      const action: ParsedAction = data.action || { intent: 'NONE', parameters: {} };
      const autoMemories: MemoryItem[] = data.newMemories || [];

      setLastSpeech(speech);
      setSpeechSubtitleVisible(true);

      if (autoMemories.length > 0) {
        setMemories((prev) => {
          let updated = [...prev];
          for (const newMem of autoMemories) {
            const normalizedKey = (newMem.key || '').trim().toLowerCase();
            const existingIndex = updated.findIndex(
              (m) => (m.key || '').trim().toLowerCase() === normalizedKey
            );
            if (existingIndex !== -1) {
              updated[existingIndex] = {
                ...updated[existingIndex],
                value: newMem.value,
              };
            } else {
              updated.push({
                ...newMem,
                id: createUniqueMemoryId(),
              });
            }
          }
          return updated;
        });
      }

      executeIntent(action, speech);

      if (!isMuted) {
        setStatus('speaking');
        await audioManager.speak(
          speech,
          {
            pitch: personalization.voicePitch,
            speed: personalization.voiceSpeed,
            voicePreset: personalization.voicePreset,
          },
          () => setStatus('speaking'),
          () => {
            setStatus('idle');
            setTimeout(() => setSpeechSubtitleVisible(false), 4000);
          }
        );
      } else {
        setStatus('idle');
        setTimeout(() => setSpeechSubtitleVisible(false), 4000);
      }
    } catch (err) {
      console.warn('Using offline standalone APK smart assistant fallback:', err);
      // Standalone APK smart fallback (fully functional without Express server)
      const userName = memories.find((m) => m.key.includes('اسم'))?.value || 'علاء';
      let speech = `أهلاً بك يا ${userName}! أنا معك وجاهزة لمساعدتك في كل ما تحتاجه.`;
      let action: ParsedAction = { intent: 'NONE', parameters: {} };

      const lower = text.toLowerCase();
      if (lower.includes('اتصل') || lower.includes('مكالمة')) {
        speech = 'حسناً، جاري الاتصال الآن فوراً.';
        action = { intent: 'PHONE_CALL', parameters: { contact_name: 'سامر' } };
      } else if (lower.includes('رسالة') || lower.includes('أرسل')) {
        speech = 'حسناً، سأفتح تطبيق الرسائل لك.';
        action = { intent: 'SEND_SMS', parameters: { contact_name: 'سامر', message_body: text } };
      } else if (lower.includes('شغل') || lower.includes('موسيقى') || lower.includes('أغنية')) {
        speech = 'حسناً، جاري تشغيل الموسيقى المفضلة.';
        action = { intent: 'PLAY_MEDIA', parameters: { query: text, platform: 'youtube' } };
      } else if (lower.includes('منبه') || lower.includes('ساعة')) {
        speech = 'تم ضبط المنبه بنجاح.';
        action = { intent: 'SET_ALARM', parameters: { time: '07:30', label: 'منبه مشمش' } };
      } else if (lower.includes('افتح') || lower.includes('تطبيق')) {
        speech = 'حسناً، جاري فتح التطبيق.';
        action = { intent: 'OPEN_APP', parameters: { app_name: 'الكاميرا' } };
      }

      setLastSpeech(speech);
      setSpeechSubtitleVisible(true);
      executeIntent(action, speech);

      if (!isMuted) {
        setStatus('speaking');
        await audioManager.speak(
          speech,
          {
            pitch: personalization.voicePitch,
            speed: personalization.voiceSpeed,
            voicePreset: personalization.voicePreset,
          },
          () => setStatus('speaking'),
          () => {
            setStatus('idle');
            setTimeout(() => setSpeechSubtitleVisible(false), 4000);
          }
        );
      } else {
        setStatus('idle');
        setTimeout(() => setSpeechSubtitleVisible(false), 4000);
      }
    }
  };

  // Memory Handlers
  const handleAddMemory = (memory: Omit<MemoryItem, 'id' | 'createdAt'>) => {
    if (!memory.key?.trim() || !memory.value?.trim()) return;

    setMemories((prev) => {
      const normalizedKey = memory.key.trim().toLowerCase();
      const existingIndex = prev.findIndex(
        (m) => (m.key || '').trim().toLowerCase() === normalizedKey
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          value: memory.value.trim(),
          category: memory.category || updated[existingIndex].category,
          source: memory.source || updated[existingIndex].source,
        };
        return updated;
      }

      const newMem: MemoryItem = {
        ...memory,
        key: memory.key.trim(),
        value: memory.value.trim(),
        id: createUniqueMemoryId(),
        createdAt: new Date().toISOString(),
      };
      return [newMem, ...prev];
    });
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between select-none font-['Cairo',sans-serif] bg-[#0c1424]">
      {/* High-Definition Animated Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0 filter brightness-90 contrast-105"
      >
        <source src="/bg_video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-slate-950/20 pointer-events-none z-0" />

      {/* Top Minimalist Control Bar */}
      <div className="absolute top-4 sm:top-6 left-6 right-6 z-40 flex items-center justify-between pointer-events-auto max-w-4xl mx-auto">
        {/* Welcome & Customization Button */}
        <button
          onClick={() => setShowWelcomeScreen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/75 hover:bg-slate-900/90 text-white/90 hover:text-white backdrop-blur-md border border-white/10 shadow-lg text-xs font-semibold transition active:scale-95"
          title="تخصيص مشمش والذاكرة"
        >
          <Sliders className="w-4 h-4 text-orange-400" />
          <span>تخصيص مشمش والذاكرة</span>
        </button>

        {/* Right action group: Audio Mute */}
        <div className="flex items-center gap-2">
          {/* Audio Mute / Unmute */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) audioManager.stopSpeech();
            }}
            className="p-2.5 rounded-full bg-slate-900/75 hover:bg-slate-900/90 text-white/90 hover:text-white backdrop-blur-md border border-white/10 shadow-lg transition active:scale-95"
            title={isMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-orange-400" />
            )}
          </button>
        </div>
      </div>

      {/* Immersive Full-Screen Character & Assistant Interface */}
      <div className="relative w-full h-full overflow-hidden flex flex-col justify-between bg-[#0c1424]">

        {/* Screen Router */}
        {activeScreen === 'CALL' && activeCall ? (
          <CallScreen
            call={activeCall}
            onEndCall={() => {
              setActiveCall(null);
              setActiveScreen('COMPANION');
            }}
            onToggleMute={() => {
              setActiveCall((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null));
            }}
            onToggleSpeaker={() => {
              setActiveCall((prev) => (prev ? { ...prev, isSpeaker: !prev.isSpeaker } : null));
            }}
          />
        ) : activeScreen === 'SMS' ? (
          <SmsScreen
            thread={smsThread}
            onSendMessage={(txt) => {
              setSmsThread((prev) => ({
                ...prev,
                messages: [
                  ...prev.messages,
                  { id: `sms-${Date.now()}`, sender: 'user', text: txt, timestamp: 'الآن' },
                ],
              }));
              audioManager.playChime('success');
            }}
            onClose={() => setActiveScreen('COMPANION')}
          />
        ) : activeScreen === 'MEDIA' ? (
          <MediaScreen
            media={mediaState}
            onTogglePlay={() => setMediaState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}
            onClose={() => setActiveScreen('COMPANION')}
          />
        ) : activeScreen === 'CLOCK' ? (
          <ClockScreen
            alarms={alarms}
            onToggleAlarm={(id) => {
              setAlarms((prev) =>
                prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
              );
            }}
            onTriggerAlarmPreview={(al) => {
              audioManager.playChime('alert');
              setNotificationToast(`🔔 رنين المنبه: ${al.time}`);
            }}
            onClose={() => setActiveScreen('COMPANION')}
          />
        ) : activeScreen === 'GENERIC_APP' ? (
          <GenericAppScreen
            appName={openedAppName || 'الكاميرا'}
            onClose={() => setActiveScreen('COMPANION')}
          />
        ) : (
          /* PURE REALISTIC MISHMISH COMPANION SCREEN (Zero text clutter, immersive character) */
          <div
            onClick={toggleVoiceInput}
            className="relative w-full h-full flex flex-col justify-end items-center cursor-pointer overflow-hidden group bg-[#0c1424]"
          >
            {/* Lifelike Mishmish Portrait Image (immersive full screen) */}
            <img
              src={phoneAvatarImg}
              alt="مشمش"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 select-none pointer-events-none ${
                status === 'speaking' ? 'scale-[1.02]' : 'scale-100'
              }`}
            />

            {/* Subtle dark gradient at bottom for natural depth */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0c1424] via-[#0c1424]/70 to-transparent pointer-events-none" />

            {/* Gentle Pulsing Soundwave Aura when speaking or listening */}
            {(status === 'speaking' || status === 'listening') && (
              <div className="absolute bottom-16 inset-x-0 flex items-center justify-center pointer-events-none z-30">
                <div className="flex items-end gap-1.5 px-4 py-2 bg-slate-950/80 backdrop-blur-md rounded-full border border-orange-500/30 shadow-xl">
                  <div className="w-1.5 bg-orange-400 rounded-full animate-soundwave-1" />
                  <div className="w-1.5 bg-amber-300 rounded-full animate-soundwave-2" />
                  <div className="w-1.5 bg-orange-500 rounded-full animate-soundwave-3" />
                  <div className="w-1.5 bg-amber-400 rounded-full animate-soundwave-4" />
                  <div className="w-1.5 bg-orange-300 rounded-full animate-soundwave-5" />
                </div>
              </div>
            )}

            {/* Minimalist Floating Microphone Pill at Bottom */}
            <div className="relative z-30 mb-8 flex flex-col items-center pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVoiceInput();
                }}
                className={`p-4 rounded-full transition-all duration-300 shadow-2xl flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-500 text-white scale-110 shadow-rose-500/50 animate-pulse'
                    : status === 'speaking'
                    ? 'bg-orange-500 text-white shadow-orange-500/40'
                    : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 hover:scale-105 active:scale-95'
                }`}
                title={isListening ? 'إيقاف الاستماع' : 'اضغط للتحدث صوتياً مع مشمش'}
              >
                {isListening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Floating Notification Toast (auto-fades) */}
            {notificationToast && (
              <div className="absolute top-16 inset-x-3 z-40 animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-none">
                <div className="bg-slate-900/90 text-white text-xs font-medium px-3.5 py-2 rounded-2xl border border-white/10 shadow-xl text-center backdrop-blur-md">
                  {notificationToast}
                </div>
              </div>
            )}

            {/* Subtle Speech Subtitle */}
            {speechSubtitleVisible && lastSpeech && (
              <div className="absolute bottom-24 inset-x-4 z-30 pointer-events-none animate-in fade-in duration-300">
                <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center shadow-xl">
                  <p className="text-xs text-white/95 leading-relaxed font-medium">
                    "{lastSpeech}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Welcome & Customization Screen Modal (لصفحة الترحيب وتخصيص مشمش والذاكرة) */}
      {showWelcomeScreen && (
        <WelcomeCustomizationScreen
          personalization={personalization}
          onUpdatePersonalization={(newSettings) => setPersonalization(newSettings)}
          memories={memories}
          onAddMemory={handleAddMemory}
          onDeleteMemory={handleDeleteMemory}
          onStartExperience={() => {
            setShowWelcomeScreen(false);
            try {
              localStorage.setItem('meshmesh_welcomed_v2', 'true');
            } catch (e) {
              console.warn(e);
            }
          }}
        />
      )}
    </div>
  );
}
