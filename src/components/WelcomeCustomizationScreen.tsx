import React, { useState } from 'react';
import { 
  Sparkles, Brain, Sliders, Volume2, Heart, Smile, MessageCircle, 
  User, Check, Play, Trash2, ArrowLeft, Calendar, Coffee, Droplets 
} from 'lucide-react';
import { PersonalizationSettings, MemoryItem, MemoryCategory } from '../types';
import phoneAvatarImg from '../assets/images/mishmish_phone_avatar_1791508104656.jpg';
import waterDropBg from '../assets/images/water_drop_bg_1791511826201.jpg';
import { WaterDropsCanvas } from './WaterDropsCanvas';
import { audioManager } from '../utils/audio';

interface WelcomeCustomizationScreenProps {
  personalization: PersonalizationSettings;
  onUpdatePersonalization: (settings: PersonalizationSettings) => void;
  memories: MemoryItem[];
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'createdAt'>) => void;
  onDeleteMemory: (id: string) => void;
  onStartExperience: () => void;
}

export const WelcomeCustomizationScreen: React.FC<WelcomeCustomizationScreenProps> = ({
  personalization,
  onUpdatePersonalization,
  memories,
  onAddMemory,
  onDeleteMemory,
  onStartExperience,
}) => {
  const [currentSettings, setCurrentSettings] = useState<PersonalizationSettings>(personalization);
  const [activeStep, setActiveStep] = useState<'welcome' | 'memory' | 'personality'>('welcome');
  const [testingVoice, setTestingVoice] = useState(false);

  // Quick inputs for user memory
  const [userName, setUserName] = useState(() => {
    const nameMem = memories.find((m) => m.key.includes('الاسم') || m.key.includes('اسم'));
    return nameMem ? nameMem.value : 'علاء';
  });
  const [favoriteDrink, setFavoriteDrink] = useState(() => {
    const drinkMem = memories.find((m) => m.key.includes('المشروب') || m.key.includes('قهوة'));
    return drinkMem ? drinkMem.value : 'قهوة سوداء مع رشة هيل';
  });
  const [upcomingEvent, setUpcomingEvent] = useState(() => {
    const eventMem = memories.find((m) => m.category === 'event');
    return eventMem ? eventMem.value : 'مقابلة عمل مهمة الأسبوع القادم';
  });

  const handleTestVoice = async () => {
    if (testingVoice) return;
    setTestingVoice(true);
    await audioManager.speak(
      `أهلاً بك يا ${userName || 'صديقي'}! أنا مشمش، جاهزة لأكون معك في كل لحظة.`,
      {
        pitch: currentSettings.voicePitch,
        speed: currentSettings.voiceSpeed,
        voicePreset: currentSettings.voicePreset,
      },
      undefined,
      () => setTestingVoice(false)
    );
  };

  const handleSaveMemoryQuick = () => {
    if (userName.trim()) {
      onAddMemory({
        category: 'profile',
        key: 'اسم المستخدم',
        value: userName.trim(),
        source: 'manual',
      });
    }
    if (favoriteDrink.trim()) {
      onAddMemory({
        category: 'preference',
        key: 'المشروب المفضل',
        value: favoriteDrink.trim(),
        source: 'manual',
      });
    }
    if (upcomingEvent.trim()) {
      onAddMemory({
        category: 'event',
        key: 'مناسبة قادمة',
        value: upcomingEvent.trim(),
        source: 'manual',
      });
    }
  };

  const handleFinish = () => {
    handleSaveMemoryQuick();
    onUpdatePersonalization(currentSettings);
    onStartExperience();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none font-['Cairo',sans-serif] bg-black">
      {/* 1. Realistic Ultra-HD Water Drops Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={waterDropBg}
          alt="Water Drops Background"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-110"
        />
        {/* Real-time Falling Water Droplets Animation (Physics Canvas) */}
        <WaterDropsCanvas />

        {/* Ambient Dark Gradient Overlay for optimal card readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-slate-950/40 to-black/80 pointer-events-none z-10" />
      </div>

      {/* 2. Glassmorphic Onboarding Container */}
      <div className="relative z-20 bg-slate-950/75 border border-white/15 backdrop-blur-2xl rounded-[36px] w-full max-w-2xl max-h-[92vh] flex flex-col shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(255,255,255,0.05)] overflow-hidden my-auto ring-1 ring-white/10">
        
        {/* Top Header & Step Indicator */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30 shadow-inner">
              <Droplets className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                <span>مرحباً بك مع مشمش</span>
              </h2>
              <p className="text-xs text-slate-300">إعداد الرفيقة الافتراضية، الذاكرة، وطباع الشخصية</p>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveStep('welcome')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                activeStep === 'welcome'
                  ? 'bg-orange-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الترحيب
            </button>
            <button
              onClick={() => setActiveStep('memory')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                activeStep === 'memory'
                  ? 'bg-orange-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الذاكرة
            </button>
            <button
              onClick={() => setActiveStep('personality')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                activeStep === 'personality'
                  ? 'bg-orange-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              التخصيص
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: WELCOME */}
          {activeStep === 'welcome' && (
            <div className="flex flex-col items-center text-center space-y-5">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-tr from-orange-500/40 via-amber-400/30 to-cyan-400/30 rounded-3xl blur-xl" />
                <div className="relative w-36 h-48 rounded-2xl overflow-hidden border-2 border-orange-400/40 shadow-2xl bg-slate-950">
                  <img
                    src={phoneAvatarImg}
                    alt="مشمش"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-200 via-amber-200 to-orange-400 bg-clip-text text-transparent">
                  أنا مشمش، رفيقتك الافتراضية
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed font-['Tajawal',sans-serif]">
                  أعيش داخل هاتفك بحضور واقعي دافئ وصوت بشري طبيعي. يمكنني التحدث معك، تذكر تفاصيلك، ومساعدتك في المكالمات، الرسائل، الوسائط، والمنبهات.
                </p>
              </div>

              {/* Quick Profile Input */}
              <div className="w-full max-w-sm bg-black/50 p-4 rounded-2xl border border-white/10 space-y-3 text-right">
                <label className="text-xs font-semibold text-orange-300 block">
                  ما هو اسمك أو اللقب الذي تحب أن أناديك به؟
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="مثال: علاء، أحمد، سارة..."
                    className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveStep('memory')}
                  className="px-8 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-sm shadow-xl shadow-orange-600/30 flex items-center gap-2 transition"
                >
                  <span>التالي: إعداد ذاكرة مشمش</span>
                  <ArrowLeft className="w-4 h-4 rtl-flip" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MEMORY MODULE */}
          {activeStep === 'memory' && (
            <div className="space-y-5 text-right">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <Brain className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-bold text-white text-base">ذاكرة مشمش (ماذا تريد أن تتذكر عنك؟)</h3>
                  <p className="text-xs text-slate-400">تحفظ مشمش هذه التفاصيل لتوظيفها بعفوية في المحادثات القادمة</p>
                </div>
              </div>

              {/* Quick Memory Setup Fields */}
              <div className="space-y-3">
                <div className="bg-black/50 p-3.5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-purple-300">
                    <User className="w-4 h-4" />
                    <span>اسم المستخدم:</span>
                  </div>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="bg-black/50 p-3.5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-amber-300">
                    <Coffee className="w-4 h-4" />
                    <span>مشروبك أو طقسك الصباحي المفضل:</span>
                  </div>
                  <input
                    type="text"
                    value={favoriteDrink}
                    onChange={(e) => setFavoriteDrink(e.target.value)}
                    placeholder="مثال: قهوة سوداء مع رشة هيل، شاي بالنعناع..."
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="bg-black/50 p-3.5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-emerald-300">
                    <Calendar className="w-4 h-4" />
                    <span>حدث أو مناسبة مهمة قادمة:</span>
                  </div>
                  <input
                    type="text"
                    value={upcomingEvent}
                    onChange={(e) => setUpcomingEvent(e.target.value)}
                    placeholder="مثال: مقابلة عمل الأسبوع القادم، سفر يوم الجمعة..."
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Existing Memories List with 100% Unique Keys */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  الحقائق المسجلة حالياً ({memories.length}):
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {memories.map((mem, index) => (
                    <div
                      key={`welcome-mem-${mem.id}-${mem.key}-${index}`}
                      className="p-2.5 bg-black/60 rounded-xl border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-purple-300 ml-1.5">{mem.key}:</span>
                        <span className="text-slate-200">{mem.value}</span>
                      </div>
                      <button
                        onClick={() => onDeleteMemory(mem.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep('welcome')}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
                >
                  السابق
                </button>
                <button
                  onClick={() => setActiveStep('personality')}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <span>التالي: تخصيص النبرة والطباع</span>
                  <ArrowLeft className="w-4 h-4 rtl-flip" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PERSONALITY & VOICE */}
          {activeStep === 'personality' && (
            <div className="space-y-5 text-right">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <Sliders className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-bold text-white text-base">طباع شخصية مشمش ونبرة صوتها</h3>
                  <p className="text-xs text-slate-400">اضبط خفة الظل، التعاطف، والاستفاضة ونبرة الصوت كما تحب</p>
                </div>
              </div>

              {/* Personality Sliders */}
              <div className="space-y-3">
                {/* Humor */}
                <div className="bg-black/50 p-3.5 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Smile className="w-4 h-4 text-amber-400" />
                      <span>خفة الظل والفكاهة:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400">{currentSettings.humor}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentSettings.humor}
                    onChange={(e) => setCurrentSettings({ ...currentSettings, humor: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>جادة ومهنية</span>
                    <span>مرحة وفكاهية</span>
                  </div>
                </div>

                {/* Empathy */}
                <div className="bg-black/50 p-3.5 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span>الدفء والتعاطف:</span>
                    </span>
                    <span className="font-mono font-bold text-rose-400">{currentSettings.empathy}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentSettings.empathy}
                    onChange={(e) => setCurrentSettings({ ...currentSettings, empathy: Number(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>عملية ومباشرة</span>
                    <span>احتواء وحنان فائق</span>
                  </div>
                </div>

                {/* Chattiness */}
                <div className="bg-black/50 p-3.5 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                      <span>الاستفاضة بالحديث:</span>
                    </span>
                    <span className="font-mono font-bold text-blue-400">{currentSettings.chattiness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentSettings.chattiness}
                    onChange={(e) => setCurrentSettings({ ...currentSettings, chattiness: Number(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>موجزة جداً</span>
                    <span>مفصلة وودودة</span>
                  </div>
                </div>
              </div>

              {/* Voice Tuning */}
              <div className="bg-black/50 p-3.5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-orange-400" />
                    <span>نبرة الصوت وسرعة الإلقاء</span>
                  </span>
                  <button
                    onClick={handleTestVoice}
                    disabled={testingVoice}
                    className="text-[11px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{testingVoice ? 'جارِ النطق...' : 'استماع تجريبي'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">طبقة الصوت (Pitch):</span>
                    <input
                      type="range"
                      min="0.7"
                      max="1.3"
                      step="0.05"
                      value={currentSettings.voicePitch}
                      onChange={(e) => setCurrentSettings({ ...currentSettings, voicePitch: Number(e.target.value) })}
                      className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">السرعة (Speed):</span>
                    <input
                      type="range"
                      min="0.8"
                      max="1.2"
                      step="0.05"
                      value={currentSettings.voiceSpeed}
                      onChange={(e) => setCurrentSettings({ ...currentSettings, voiceSpeed: Number(e.target.value) })}
                      className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep('memory')}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
                >
                  السابق
                </button>
                <button
                  onClick={handleFinish}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 active:scale-95 text-white text-sm font-bold shadow-xl shadow-orange-600/30 flex items-center gap-2 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>بدء التجربة والحديث مع مشمش</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
