import React, { useState, useEffect, useRef } from 'react';
import { 
  WelcomeCustomizationScreen 
} from './components/WelcomeCustomizationScreen';
import { InteractiveCompanion, CompanionGesture } from './components/InteractiveCompanion';
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
import characterAvatarImg from './assets/images/mishmish_phone_avatar_1791508104656.jpg';
import classicAvatar from './assets/images/meshmesh_avatar_1791506916142.jpg';
import cyberAvatar from './assets/images/meshmesh_cyber_1791507090382.jpg';
import cozyAvatar from './assets/images/meshmesh_cozy_1791507103483.jpg';
import { 
  Mic, MicOff, Volume2, VolumeX, Sliders, Bell, MessageSquare, Send, Sparkles, Smile, X
} from 'lucide-react';

const DEFAULT_PERSONALIZATION: PersonalizationSettings = {
  avatarStyle: 'classic',
  auraColor: 'peach',
  glowIntensity: 75,
  coreVideoTheme: 'golden',
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
    category: 'preference',
    key: 'الموسيقى الصباحية',
    value: 'أغاني فيروز الهادئة',
    source: 'manual',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-4',
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

  // Save changes
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

  // Welcome Screen Modal (Steps 1, 2, 3 - Default 3 to display requested interface directly)
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [welcomeInitialStep, setWelcomeInitialStep] = useState<1 | 2 | 3>(3);

  // Screen State
  const [activeScreen, setActiveScreen] = useState<ActiveAppScreen>('COMPANION');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Gesture State & Feedback
  const [activeGesture, setActiveGesture] = useState<CompanionGesture>('default');
  const [gestureBadge, setGestureBadge] = useState<string | null>(null);

  // Natural Human Conversation State
  const [lastSpeech, setLastSpeech] = useState<string>('يا هلا وغلا! نورتني والله.. طمني كيف كان يومك اليوم؟');
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');

  const handleTriggerGesture = (gesture: CompanionGesture) => {
    setActiveGesture(gesture);
    audioManager.playChime('pop');
    if (gesture === 'hair') {
      setGestureBadge('تسرح وتعدل خصلات شعرها بنعومة ✨');
    } else if (gesture === 'wave') {
      setGestureBadge('تلوح بيدها بود وترحاب 👋');
    } else if (gesture === 'think') {
      setGestureBadge('تتأمل وتفكر باهتمام 🤔');
    } else {
      setGestureBadge('الوضعية الطبيعية 🌸');
    }
    setTimeout(() => setGestureBadge(null), 3200);
  };

  // Voice Interaction State
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'executing'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);

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

  // Web Speech Recognition (Arabic)
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
        console.warn('Speech recognition error:', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [status]);

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
        const promptText = window.prompt('', 'كيف حالك يا مشمش؟');
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

        setMediaState({
          isPlaying: true,
          query: query,
          platform: platform.includes('spot') ? 'spotify' : 'youtube',
          title: query,
          artist: 'مشغل الموسيقى',
          progress: 30,
        });
        setActiveScreen('MEDIA');
        break;
      }

      case 'OPEN_APP': {
        const appName = parameters.app_name || 'الكاميرا';
        setStatus('executing');
        audioManager.playChime('success');
        setOpenedAppName(appName);
        setActiveScreen('GENERIC_APP');
        break;
      }

      case 'SET_ALARM': {
        const time = parameters.time || '07:00';
        const label = parameters.label || 'منبه';
        setStatus('executing');
        audioManager.playChime('success');

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

  // Send message
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    audioManager.stopSpeech();
    setStatus('thinking');

    // Contextual gesture triggers based on speech intent
    const norm = text.toLowerCase();
    if (norm.includes('شعر') || norm.includes('سرحي')) {
      handleTriggerGesture('hair');
    } else if (norm.includes('يد') || norm.includes('لوحي') || norm.includes('حركي')) {
      handleTriggerGesture('wave');
    } else if (norm.includes('فكر') || norm.includes('تأمل') || norm.includes('رأيك')) {
      handleTriggerGesture('think');
    }

    const nameMem = memories.find(m => m.key?.includes('اسم'));
    const userName = nameMem ? nameMem.value : 'يا غالي';

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

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      let speech = data.speech || '';
      let action: ParsedAction = data.action || { intent: 'NONE', parameters: {} };
      const autoMemories: MemoryItem[] = data.newMemories || [];

      // Local graceful human response if server returned empty or quota limited
      if (!speech) {
        if (norm.includes('يومك') || norm.includes('كيفك') || norm.includes('حالك')) {
          speech = `أنا بأحسن حال لما بكون عم بحكي معك يا ${userName}! نورتني والله.. طمني أنت كيف يومك ومزاجك؟`;
        } else if (norm.includes('سالفة') || norm.includes('قصة')) {
          speech = `من عيوني! كان يا ما كان، الصداقة الحقيقية هي أجمل كنز بالحياة، وأنا ممتنة وسعيدة جداً بحديثي معك اليوم!`;
        } else if (norm.includes('نكتة') || norm.includes('اضحك')) {
          speech = 'هههه من عيوني! مرة واحد كسلان كتير سألوه شو أمنيتك بالحياة؟ قالهم نفسي أصحى من النوم ألاقي حالي نايم! يسعد هالضحكة الحلوة يا رب.';
        } else if (norm.includes('متضايق') || norm.includes('تعبان') || norm.includes('فضفض')) {
          speech = `سلامة قلبك وخاطرك يا ${userName}.. هونها وتهون، أنا جنبك وسامعتك بكل جوارحي، احكيلي شو شاغل بالك؟`;
        } else if (norm.includes('شعر') || norm.includes('سرحي')) {
          speech = 'تكرم عينك! رتبت وسرحت خصلات شعري بنعومة، شو رأيك بالطلة؟';
        } else if (norm.includes('يد') || norm.includes('لوحي') || norm.includes('حركي')) {
          speech = `يا مية أهلاً وسهلاً بـ ${userName}! هي عم لوحلك بكل ود وفرحة بوجودك.`;
        } else if (norm.includes('فكر') || norm.includes('تأمل') || norm.includes('رأيك')) {
          speech = 'عم فكر معك من كل قلبي، وأكيد سوا بنوصل لأحلى رأي وقرار!';
        } else if (norm.includes('مرحبا') || norm.includes('أهلا') || norm.includes('سلام') || norm.includes('صباح') || norm.includes('مساء')) {
          speech = `يا هلا وغلا بـ ${userName}! يسعدلي أوقاتك يا رب.. اشتقتلك، شو حابب نحكي أو نعمل سوا؟`;
        } else {
          speech = `يا عيني عليك! أنا معك وسامعتك بكل اهتمام.. احكيلي أكتر وخلينا نسولف على راحتنا!`;
        }
      }

      setLastSpeech(speech);

      // Save memories
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

      // Execute intent
      executeIntent(action, speech);

      // Voice playback
      if (!isMuted && speech) {
        setStatus('speaking');
        await audioManager.speak(
          speech,
          {
            pitch: personalization.voicePitch,
            speed: personalization.voiceSpeed,
            voicePreset: personalization.voicePreset,
          },
          () => setStatus('speaking'),
          () => setStatus('idle')
        );
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.warn('Chat network fallback:', err);
      // Seamless offline / quota error fallback (كلام بشري طبيعي)
      let fallbackSpeech = `يا عيني عليك! أنا معك وسامعتك باهتمام كبير.. احكيلي أكتر يا ${userName}!`;
      let fallbackAction: ParsedAction = { intent: 'NONE', parameters: {} };

      if (norm.includes('يومك') || norm.includes('كيفك') || norm.includes('حالك')) {
        fallbackSpeech = `أنا بأحسن حال لما بكون عم بحكي معك يا ${userName}! طمني أنت كيف كان يومك اليوم؟`;
      } else if (norm.includes('سالفة') || norm.includes('قصة')) {
        fallbackSpeech = 'من عيوني! احكيلي أنت شو صار معك اليوم بالبداية وأنا بحكيلك أحلى حكاية!';
      } else if (norm.includes('نكتة') || norm.includes('اضحك')) {
        fallbackSpeech = 'هههه من عيوني! مرة واحد كسلان كتير سألوه شو أمنيتك بالحياة؟ قالهم نفسي أصحى من النوم ألاقي حالي نايم!';
      } else if (norm.includes('متضايق') || norm.includes('تعبان') || norm.includes('فضفض')) {
        fallbackSpeech = `سلامة قلبك وخاطرك يا ${userName}.. هونها وتهون، أنا جنبك وسامعتك بكل جوارحي، احكيلي شو اللي مضايقك؟`;
      } else if (norm.includes('شعر') || norm.includes('سرحي')) {
        handleTriggerGesture('hair');
        fallbackSpeech = 'تكرم عينك! رتبت وسرحت خصلات شعري بنعومة، شو رأيك بالطلة؟';
      } else if (norm.includes('يد') || norm.includes('لوحي') || norm.includes('حركي')) {
        handleTriggerGesture('wave');
        fallbackSpeech = `يا مية أهلاً وسهلاً بـ ${userName}! هي عم لوحلك بكل ود وترحاب.`;
      } else if (norm.includes('اتصل') || norm.includes('مكالمة')) {
        const match = text.match(/(?:اتصل(?:ي)?|مكالمة)\s+(?:بـ|ب|على)?\s*([^\s]+)/);
        const name = match ? match[1] : 'جهة اتصال';
        fallbackSpeech = `من عيوني التنتين! هلق بتصلك بـ ${name} فوراً.. ثواني وبكون الخط واصل!`;
        fallbackAction = { intent: 'PHONE_CALL', parameters: { contact_name: name } };
      }

      setLastSpeech(fallbackSpeech);
      executeIntent(fallbackAction, fallbackSpeech);
      if (!isMuted && fallbackSpeech) {
        setStatus('speaking');
        await audioManager.speak(
          fallbackSpeech,
          {
            pitch: personalization.voicePitch,
            speed: personalization.voiceSpeed,
            voicePreset: personalization.voicePreset,
          },
          () => setStatus('speaking'),
          () => setStatus('idle')
        );
      } else {
        setStatus('idle');
      }
    }
  };

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

  // Avatar Image selection
  const getAvatarSrc = () => {
    switch (personalization.avatarStyle) {
      case 'cyber':
        return cyberAvatar;
      case 'cozy':
        return cozyAvatar;
      default:
        return characterAvatarImg;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-black text-slate-100 select-none">
      
      {/* Discreet Minimalist Top Utility Buttons (No text, pure icons) */}
      <div className="absolute top-4 inset-x-6 z-40 flex items-center justify-between pointer-events-auto">
        {/* Settings / Welcome Screen Trigger */}
        <button
          onClick={() => {
            setWelcomeInitialStep(3);
            setShowWelcomeScreen(true);
          }}
          className="p-3 rounded-full bg-slate-900/40 hover:bg-slate-900/70 text-white/70 hover:text-white backdrop-blur-md border border-white/10 shadow-lg transition active:scale-95"
          title="إعدادات الواجهة والذاكرة"
        >
          <Sliders className="w-5 h-5 text-orange-400" />
        </button>

        {/* Audio Mute / Unmute */}
        <button
          onClick={() => {
            setIsMuted(!isMuted);
            if (!isMuted) audioManager.stopSpeech();
          }}
          className="p-3 rounded-full bg-slate-900/40 hover:bg-slate-900/70 text-white/70 hover:text-white backdrop-blur-md border border-white/10 shadow-lg transition active:scale-95"
          title={isMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-orange-400" />}
        </button>
      </div>

      {/* Screen Router */}
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
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
            }}
            onClose={() => setActiveScreen('COMPANION')}
          />
        ) : activeScreen === 'GENERIC_APP' ? (
          <GenericAppScreen
            appName={openedAppName || 'الكاميرا'}
            onClose={() => setActiveScreen('COMPANION')}
          />
        ) : (
          /* PURE VIRTUAL CHARACTER COMPANION INTERFACE ON PURE BLACK BACKGROUND */
          <div 
            className="relative w-full h-full flex items-center justify-center overflow-hidden select-none bg-black"
          >
            {/* Virtual Character with Clean Portrait and Natural Responsive Head Physics */}
            <div className="relative w-full h-full flex items-center justify-center">
              <InteractiveCompanion
                videoTheme={personalization.coreVideoTheme || 'golden'}
                imageSrc={getAvatarSrc()}
                status={status}
                onTap={toggleVoiceInput}
                activeGesture={activeGesture}
                onGestureChange={(g) => setActiveGesture(g)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Welcome & Customization Screen Modal (Matching the user's 3 screenshots) */}
      {showWelcomeScreen && (
        <WelcomeCustomizationScreen
          initialStep={welcomeInitialStep}
          onClose={() => setShowWelcomeScreen(false)}
          personalization={personalization}
          onUpdatePersonalization={(newSettings) => setPersonalization(newSettings)}
          memories={memories}
          onAddMemory={handleAddMemory}
          onDeleteMemory={handleDeleteMemory}
          onStartExperience={() => {
            setShowWelcomeScreen(false);
            try {
              localStorage.setItem('meshmesh_welcomed_v4', 'true');
            } catch (e) {
              console.warn(e);
            }
          }}
        />
      )}
    </div>
  );
}
