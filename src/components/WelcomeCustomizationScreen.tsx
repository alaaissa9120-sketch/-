import React, { useState } from 'react';
import { 
  Sparkles, Brain, Sliders, Volume2, Heart, Smile, MessageCircle, 
  User, Check, Play, Trash2, ArrowLeft, Calendar, Coffee, ShieldCheck, Zap, Bot, Mic, Cpu, Phone
} from 'lucide-react';
import { PersonalizationSettings, MemoryItem } from '../types';
import phoneAvatarImg from '../assets/images/meshmesh_avatar_1791506916142.jpg';
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

  // Memory toggles for screen 2
  const [memoryMorningActive, setMemoryMorningActive] = useState(true);
  const [memoryAndroidActive, setMemoryAndroidActive] = useState(true);
  const [memoryGeneralActive, setMemoryGeneralActive] = useState(false);
  const [memoryPersonalActive, setMemoryPersonalActive] = useState(false);

  // Quick user inputs (Step 1 only)
  const [userName, setUserName] = useState(() => {
    const nameMem = memories.find((m) => m.key.includes('الاسم') || m.key.includes('اسم'));
    return nameMem ? nameMem.value : 'علاء';
  });

  const [userPhone, setUserPhone] = useState(() => {
    const phoneMem = memories.find((m) => m.key.includes('جوال') || m.key.includes('هاتف') || m.key.includes('رقم'));
    return phoneMem ? phoneMem.value : '+963 912 345 678';
  });

  const handleTestVoice = async () => {
    if (testingVoice) return;
    setTestingVoice(true);
    await audioManager.speak(
      `أهلاً بك يا ${userName || 'صديقي'}! أنا مشمش، رفيقتك الذكية على أندرويد.`,
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
    if (userPhone.trim()) {
      onAddMemory({
        category: 'profile',
        key: 'رقم الجوال',
        value: userPhone.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none font-['Cairo',sans-serif] bg-slate-950">
      {/* Background Gradient Orbs matching reference images */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/60 via-slate-950/90 to-black" />
      </div>

      {/* Main Glassmorphic Container Window (Matching reference images) */}
      <div className="relative z-20 bg-slate-900/85 border border-white/10 backdrop-blur-3xl rounded-[32px] w-full max-w-4xl p-6 sm:p-8 flex flex-col shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_50px_rgba(249,115,22,0.12)] ring-1 ring-white/10">
        
        {/* Top Header & Step Indicator (Matching images) */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            {/* Step 3 */}
            <button
              onClick={() => setActiveStep('personality')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition ${
                activeStep === 'personality'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
                  : 'hover:text-white'
              }`}
            >
              <span>الشخصية</span>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeStep === 'personality' ? 'bg-orange-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>3</span>
            </button>
            <span className="text-slate-700">—</span>

            {/* Step 2 */}
            <button
              onClick={() => setActiveStep('memory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition ${
                activeStep === 'memory'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
                  : 'hover:text-white'
              }`}
            >
              <span>الذاكرة</span>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeStep === 'memory' ? 'bg-orange-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>2</span>
            </button>
            <span className="text-slate-700">—</span>

            {/* Step 1 */}
            <button
              onClick={() => setActiveStep('welcome')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition ${
                activeStep === 'welcome'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
                  : 'hover:text-white'
              }`}
            >
              <span>الترحيب</span>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeStep === 'welcome' ? 'bg-orange-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>1</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">WelcomeCustomizationScreen.tsx</div>
        </div>

        {/* ================= STEP 1: WELCOME (Matching Image 1) ================= */}
        {activeStep === 'welcome' && (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Side: 3D Robot Avatar */}
              <div className="flex justify-center items-center relative">
                <div className="absolute w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="relative w-56 h-56 rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-slate-950/80 flex items-center justify-center">
                  <img
                    src={phoneAvatarImg}
                    alt="مشمش"
                    className="w-full h-full object-cover object-center scale-110"
                  />
                </div>
              </div>

              {/* Right Side: Title & Feature Badges */}
              <div className="space-y-6 text-right">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
                  أهلاً بك في عالمك
                </h1>

                {/* Badges */}
                <div className="flex flex-wrap gap-2.5 justify-end">
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-slate-200">
                    <span>تحكم أندرويد حي</span>
                    <Bot className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-slate-200">
                    <span>ذاكرة متطورة</span>
                    <Brain className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-slate-200">
                    <span>تفاعل صوتي</span>
                    <Mic className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Inputs (Name + Phone Number) & Next Button */}
            <div className="space-y-4 pt-4 border-t border-white/10 text-right">
              <label className="text-sm font-bold text-slate-300 block">
                كيف يمكنني مناداتك والتعرف عليك؟
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">اسم المستخدم:</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="اسم المستخدم"
                    className="w-full bg-slate-950/90 border border-orange-500/40 focus:border-orange-500 rounded-2xl px-5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none shadow-inner transition"
                  />
                </div>

                <div className="relative">
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">رقم الجوال:</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="رقم الجوال (مثال: +963...)"
                    className="w-full bg-slate-950/90 border border-orange-500/40 focus:border-orange-500 rounded-2xl px-5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none shadow-inner transition"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStep('memory')}
                  className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-[0_0_30px_rgba(249,115,22,0.4)] active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <span>التالي</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: MEMORY (Matching Image 3) ================= */}
        {activeStep === 'memory' && (
          <div className="space-y-6 py-2 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-orange-400">
                <Brain className="w-6 h-6" />
                <h2 className="text-xl font-bold text-white">تكوين الذاكرة</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left Side: Sphere Avatar & Connection node */}
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-200 shadow-[0_0_40px_rgba(249,115,22,0.5)] flex items-center justify-center">
                  <div className="absolute top-8 right-8 w-3 h-3 bg-black rounded-full" />
                  <div className="absolute top-8 left-8 w-3 h-3 bg-black rounded-full" />
                  <div className="absolute bottom-7 w-6 h-3 bg-black rounded-full" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  هنا يتم التحكم بذاكرة مشمش وكيفية وصوله للمعلومات. حدد ما يمكن تذكره.
                </p>
              </div>

              {/* Right Side: Memory Toggles / Cards */}
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-orange-500/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-300">اختيار الذاكرة النشطة</span>
                  <Cpu className="w-4 h-4 text-orange-400" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMemoryMorningActive(!memoryMorningActive)}
                    className={`p-4 rounded-2xl border text-right transition flex flex-col justify-between h-24 ${
                      memoryMorningActive
                        ? 'bg-slate-800/90 border-orange-500/50 shadow-lg shadow-orange-500/10'
                        : 'bg-slate-950/50 border-white/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-white">الذاكرة الصباحية</span>
                      <span className="text-lg">💾</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full w-max ${memoryMorningActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                      {memoryMorningActive ? 'نشطة ✓' : 'معطلة ✕'}
                    </span>
                  </button>

                  <button
                    onClick={() => setMemoryAndroidActive(!memoryAndroidActive)}
                    className={`p-4 rounded-2xl border text-right transition flex flex-col justify-between h-24 ${
                      memoryAndroidActive
                        ? 'bg-slate-800/90 border-orange-500/50 shadow-lg shadow-orange-500/10'
                        : 'bg-slate-950/50 border-white/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-white">الذاكرة الأندرويدية</span>
                      <span className="text-lg">💾</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full w-max ${memoryAndroidActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                      {memoryAndroidActive ? 'نشطة ✓' : 'معطلة ✕'}
                    </span>
                  </button>

                  <button
                    onClick={() => setMemoryGeneralActive(!memoryGeneralActive)}
                    className={`p-4 rounded-2xl border text-right transition flex flex-col justify-between h-24 ${
                      memoryGeneralActive
                        ? 'bg-slate-800/90 border-orange-500/50 shadow-lg shadow-orange-500/10'
                        : 'bg-slate-950/50 border-white/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-white">الذاكرة العامة</span>
                      <span className="text-lg">🗄️</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full w-max ${memoryGeneralActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                      {memoryGeneralActive ? 'نشطة ✓' : 'معطلة ✕'}
                    </span>
                  </button>

                  <button
                    onClick={() => setMemoryPersonalActive(!memoryPersonalActive)}
                    className={`p-4 rounded-2xl border text-right transition flex flex-col justify-between h-24 ${
                      memoryPersonalActive
                        ? 'bg-slate-800/90 border-orange-500/50 shadow-lg shadow-orange-500/10'
                        : 'bg-slate-950/50 border-white/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-white">الذاكرة الشخصية</span>
                      <span className="text-lg">🗄️</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full w-max ${memoryPersonalActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                      {memoryPersonalActive ? 'نشطة ✓' : 'معطلة ✕'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Nav Row (Name input removed as requested) */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button
                onClick={() => setActiveStep('welcome')}
                className="px-5 py-3 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-semibold transition"
              >
                السابق
              </button>
              <button
                onClick={() => setActiveStep('personality')}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-[0_0_30px_rgba(249,115,22,0.4)] active:scale-95 transition"
              >
                <span>التالي (التخصيص)</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PERSONALITY (Matching Image 2) ================= */}
        {activeStep === 'personality' && (
          <div className="space-y-6 py-2 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">إعداد الشخصية</h2>
              <Sliders className="w-5 h-5 text-orange-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Humor & Voice test floating circle */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Smile className="w-4 h-4 text-amber-400" />
                      <span>خفة الظل والمزاج</span>
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{currentSettings.humor}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={currentSettings.humor / 10}
                    onChange={(e) => setCurrentSettings({ ...currentSettings, humor: Number(e.target.value) * 10 })}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Floating Circular Audio Test Button matching Image 2 */}
                <div className="relative p-6 rounded-2xl bg-slate-950/90 border border-white/10 flex items-center justify-between overflow-hidden">
                  <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 p-1 shadow-[0_0_35px_rgba(249,115,22,0.5)] flex items-center justify-center cursor-pointer active:scale-95 transition"
                    onClick={handleTestVoice}
                  >
                    <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-orange-500/30 group-hover:opacity-100 transition" />
                      <Play className="w-6 h-6 text-amber-400 fill-amber-400 z-10" />
                      <span className="text-[9px] text-orange-300 font-bold mt-1 z-10">استماع تجريبي</span>
                    </div>
                  </div>

                  <div className="mr-28 space-y-1">
                    <span className="text-xs font-bold text-white block">استمع إلى نبرة الصوت وسرعة الإلقاء</span>
                    <button
                      onClick={handleTestVoice}
                      disabled={testingVoice}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-300 text-[11px] font-semibold border border-white/10 transition"
                    >
                      {testingVoice ? 'جارِ التشغيل...' : 'استماع تجريبي'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Empathy, Chattiness, Speech Speed */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span>التعاطف والدعم</span>
                    </span>
                    <span className="font-mono text-rose-400 font-bold">3.5</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={3.5}
                    onChange={() => {}}
                    className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                      <span>الاستفاضة والتفصيل</span>
                    </span>
                    <span className="font-mono text-blue-400 font-bold">2</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={2}
                    onChange={() => {}}
                    className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-orange-400" />
                      <span>سرعة الإلقاء</span>
                    </span>
                    <span className="font-mono text-orange-400 font-bold">5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={currentSettings.voiceSpeed * 3}
                    onChange={(e) => setCurrentSettings({ ...currentSettings, voiceSpeed: Number(e.target.value) / 3 })}
                    className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Nav Row (Name input removed as requested) */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button
                onClick={() => setActiveStep('memory')}
                className="px-5 py-3 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-semibold transition"
              >
                السابق
              </button>
              <button
                onClick={handleFinish}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-[0_0_30px_rgba(249,115,22,0.4)] active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>بدء التجربة والحديث مع مشمش</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
