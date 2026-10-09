import React, { useState } from 'react';
import { 
  Mic, Brain, Bot, Check, X, Sparkles, 
  Cpu, HardDrive, Smartphone, Radio, User, Phone, ChevronDown,
  Heart, Smile, MessageCircle, Zap, Volume2, Palette, RotateCcw, Play
} from 'lucide-react';
import { PersonalizationSettings, MemoryItem } from '../types';
import robotStep1Img from '../assets/images/welcome_robot_step1_1791532082156.jpg';
import goldenSphereImg from '../assets/images/golden_energy_sphere_1791548187564.jpg';
import cyberSphereImg from '../assets/images/cyber_violet_sphere_1791548205879.jpg';
import classicAvatar from '../assets/images/meshmesh_avatar_1791506916142.jpg';
import cyberAvatar from '../assets/images/meshmesh_cyber_1791507090382.jpg';
import cozyAvatar from '../assets/images/meshmesh_cozy_1791507103483.jpg';
import { audioManager } from '../utils/audio';

interface WelcomeCustomizationScreenProps {
  personalization: PersonalizationSettings;
  onUpdatePersonalization: (settings: PersonalizationSettings) => void;
  memories: MemoryItem[];
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'createdAt'>) => void;
  onDeleteMemory: (id: string) => void;
  onStartExperience: () => void;
  initialStep?: 1 | 2 | 3;
  onClose?: () => void;
}

export const WelcomeCustomizationScreen: React.FC<WelcomeCustomizationScreenProps> = ({
  personalization,
  onUpdatePersonalization,
  memories,
  onAddMemory,
  onDeleteMemory: _onDeleteMemory,
  onStartExperience,
  initialStep = 3,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(initialStep);
  const [selectedCoreVideo, setSelectedCoreVideo] = useState<'golden' | 'cyber_violet'>(
    personalization.coreVideoTheme || 'golden'
  );
  const [userName, setUserName] = useState(() => {
    const found = memories.find(m => m.key.includes('الاسم') || m.key.includes('اسم'));
    return found ? found.value : 'علاء';
  });
  const [phoneNumber, setPhoneNumber] = useState(() => {
    const found = memories.find(m => m.key.includes('الهاتف') || m.key.includes('هاتف'));
    return found ? found.value : (personalization.userPhone || '');
  });

  // Memory toggles matching Step 2
  const [activeMemories, setActiveMemories] = useState({
    morning: true,    // الذاكرة الصباحية
    android: true,    // الذاكرة الأندرويدية
    general: false,   // الذاكرة العامة
    personal: false,  // الذاكرة الشخصية
  });

  // Step 3 Personality & Voice & Appearance States
  const [personalityTab, setPersonalityTab] = useState<'personality' | 'voice' | 'appearance'>('personality');
  const [humorVal, setHumorVal] = useState(personalization.humor ?? 65);
  const [empathyVal, setEmpathyVal] = useState(personalization.empathy ?? 85);
  const [chattinessVal, setChattinessVal] = useState(personalization.chattiness ?? 50);
  const [spontaneityVal, setSpontaneityVal] = useState(personalization.spontaneity ?? 80);
  const [voicePitchVal, setVoicePitchVal] = useState(personalization.voicePitch ?? 1.05);
  const [voiceSpeedVal, setVoiceSpeedVal] = useState(personalization.voiceSpeed ?? 1.0);
  const [voicePresetVal, setVoicePresetVal] = useState(personalization.voicePreset ?? 'kore');
  const [avatarStyleVal, setAvatarStyleVal] = useState(personalization.avatarStyle ?? 'classic');
  const [auraColorVal, setAuraColorVal] = useState(personalization.auraColor ?? 'peach');
  const [glowIntensityVal, setGlowIntensityVal] = useState(personalization.glowIntensity ?? 75);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  const handleTestVoice = async () => {
    if (isTestingVoice) return;
    setIsTestingVoice(true);
    await audioManager.speak(
      'يا هلا والله! أنا مشمش، كيف تشوف نبرة صوتي معك؟',
      {
        pitch: voicePitchVal,
        speed: voiceSpeedVal,
        voicePreset: voicePresetVal,
      },
      undefined,
      () => setIsTestingVoice(false)
    );
  };

  const handleApplyPreset = (preset: 'warm' | 'playful' | 'efficient') => {
    if (preset === 'warm') {
      setHumorVal(65);
      setEmpathyVal(95);
      setChattinessVal(60);
      setSpontaneityVal(85);
    } else if (preset === 'playful') {
      setHumorVal(95);
      setEmpathyVal(75);
      setChattinessVal(85);
      setSpontaneityVal(90);
    } else if (preset === 'efficient') {
      setHumorVal(20);
      setEmpathyVal(50);
      setChattinessVal(25);
      setSpontaneityVal(40);
    }
  };

  const handleResetPersonality = () => {
    setHumorVal(65);
    setEmpathyVal(85);
    setChattinessVal(50);
    setSpontaneityVal(80);
    setVoicePitchVal(1.05);
    setVoiceSpeedVal(1.0);
    setVoicePresetVal('kore');
    setAvatarStyleVal('classic');
    setAuraColorVal('peach');
    setGlowIntensityVal(75);
  };

  const handleNext = () => {
    if (step === 1) {
      if (userName.trim()) {
        onAddMemory({
          category: 'profile',
          key: 'اسم المستخدم',
          value: userName.trim(),
          source: 'manual',
        });
      }
      if (phoneNumber.trim()) {
        onAddMemory({
          category: 'profile',
          key: 'رقم الهاتف',
          value: phoneNumber.trim(),
          source: 'manual',
        });
      }
      onUpdatePersonalization({
        ...personalization,
        userPhone: phoneNumber.trim(),
      });
      setStep(2);
    } else if (step === 2) {
      onUpdatePersonalization({
        ...personalization,
        userPhone: phoneNumber.trim(),
        coreVideoTheme: selectedCoreVideo,
      });
      setStep(3);
    } else {
      // Step 3 is final: Save all and start
      onUpdatePersonalization({
        ...personalization,
        userPhone: phoneNumber.trim(),
        coreVideoTheme: selectedCoreVideo,
        humor: humorVal,
        empathy: empathyVal,
        chattiness: chattinessVal,
        spontaneity: spontaneityVal,
        voicePitch: voicePitchVal,
        voiceSpeed: voiceSpeedVal,
        voicePreset: voicePresetVal,
        avatarStyle: avatarStyleVal,
        auraColor: auraColorVal,
        glowIntensity: glowIntensityVal,
      });
      onStartExperience();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#090b12] text-white select-none overflow-y-auto font-['Cairo',sans-serif]">
      {/* Background Ambient Cyber Mesh & Glows matching the images */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-orange-600/20 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[140px]" />
        
        {/* Subtle wavy cyber grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mesh-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(249, 115, 22, 0.3)" strokeWidth="0.6"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh-grid)" />
        </svg>
      </div>

      {/* Main Glassmorphic Card Container */}
      <div className="relative w-full max-w-4xl bg-[#10131e]/90 border border-slate-800/80 rounded-[32px] shadow-[0_20px_70px_rgba(0,0,0,0.85)] p-6 sm:p-8 backdrop-blur-2xl overflow-hidden my-auto">
        
        {/* Top Header: Close Button & Stepper Only (No watermark or top text as requested) */}
        <div className="relative mb-8 pt-1">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute left-0 top-0 p-2 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer z-10"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Stepper Tabs: الترحيب (1) - الذاكرة (2) - الشخصية (3) */}
          <div className="flex items-center justify-center gap-3 sm:gap-6" dir="rtl">
            {/* Step 1: الترحيب */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 cursor-pointer transition select-none group ${
                step === 1 ? 'text-amber-400 font-bold' : step > 1 ? 'text-amber-400/90' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step >= 1 
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                  : 'bg-slate-800/90 text-slate-400 group-hover:bg-slate-800'
              }`}>
                1
              </span>
              <span className="text-sm font-semibold">الترحيب</span>
            </button>

            {/* Connecting bar 1 -> 2 */}
            <div className={`h-0.5 w-8 sm:w-16 rounded-full transition-all duration-300 ${
              step >= 2 ? 'bg-gradient-to-l from-amber-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-slate-800'
            }`} />

            {/* Step 2: الذاكرة */}
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`flex items-center gap-2 cursor-pointer transition select-none group ${
                step === 2 ? 'text-amber-400 font-bold' : step > 2 ? 'text-amber-400/90' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step >= 2 
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                  : 'bg-slate-800/90 text-slate-400 group-hover:bg-slate-800'
              }`}>
                2
              </span>
              <span className="text-sm font-semibold">الذاكرة</span>
            </button>

            {/* Connecting bar 2 -> 3 */}
            <div className={`h-0.5 w-8 sm:w-16 rounded-full transition-all duration-300 ${
              step >= 3 ? 'bg-gradient-to-l from-amber-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-slate-800'
            }`} />

            {/* Step 3: الشخصية */}
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`flex items-center gap-2 cursor-pointer transition select-none group ${
                step === 3 ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step >= 3 
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                  : 'bg-slate-800/90 text-slate-400 group-hover:bg-slate-800'
              }`}>
                3
              </span>
              <span className="text-sm font-semibold">الشخصية</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: أهلاً بك في عالمك (Image 3) */}
        {/* ------------------------------------------------------------- */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left 3D Robot Mascot (matching screenshot) */}
              <div className="md:col-span-5 flex justify-center">
                <div className="relative w-56 h-56 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(249,115,22,0.2)] border border-orange-500/20 bg-slate-950/60 flex items-center justify-center">
                  <img 
                    src={robotStep1Img} 
                    alt="مشمش الآلي" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right Content */}
              <div className="md:col-span-7 space-y-6 text-right">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  أهلاً بك في عالمك
                </h1>

                {/* Feature Badges matching Image 3 */}
                <div className="flex flex-wrap gap-2.5 justify-start">
                  {/* Badge 1: تفاعل صوتي */}
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-medium">
                    <Mic className="w-4 h-4 text-orange-400" />
                    <span>تفاعل صوتي</span>
                  </div>

                  {/* Badge 2: ذاكرة متطورة */}
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-medium">
                    <Brain className="w-4 h-4 text-amber-400" />
                    <span>ذاكرة متطورة</span>
                  </div>

                  {/* Badge 3: تحكم أندرويد حي */}
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-medium">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>تحكم أندرويد حي</span>
                  </div>
                </div>

                {/* Question & Name Input + Phone Number Input Directly Below It */}
                <div className="space-y-4 pt-2">
                  <label className="text-sm font-semibold text-slate-200 block text-right">
                    كيف يمكنني مناداتك؟
                  </label>
                  
                  <div className="space-y-3">
                    {/* 1. اسم المستخدم */}
                    <div className="relative">
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="اسم المستخدم"
                        className="w-full bg-slate-900/80 border border-orange-500/30 focus:border-orange-500 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none transition text-right"
                      />
                      <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400/80 pointer-events-none" />
                    </div>

                    {/* 2. شريط رقم الهاتف تحت الاسم */}
                    <div className="relative">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="رقم الهاتف"
                        className="w-full bg-slate-900/80 border border-orange-500/30 focus:border-orange-500 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none transition text-right"
                      />
                      <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400/80 pointer-events-none" />
                    </div>
                  </div>

                  {/* Next Button */}
                  <div className="pt-2 flex justify-start">
                    <button
                      onClick={handleNext}
                      className="px-9 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>التالي (الذاكرة)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: تكوين الذاكرة (Image 1) */}
        {/* ------------------------------------------------------------- */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Title with circuit brain */}
            <div className="flex items-center justify-end gap-2 text-right">
              <h2 className="text-2xl font-bold text-white">تكوين الذاكرة</h2>
              <Brain className="w-6 h-6 text-amber-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: Two Video Interfaces (نقل واجهتين الفيديو للصفحة رقم 2 بدل الصورة) */}
              <div className="md:col-span-5 space-y-3.5" dir="rtl">
                {/* 2 Video Interface Cards Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Card 1: الواجهة الأولى (كرة الطاقة الذهبية) */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCoreVideo('golden');
                      onUpdatePersonalization({
                        ...personalization,
                        coreVideoTheme: 'golden',
                      });
                    }}
                    className={`relative p-2.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-between gap-2 cursor-pointer group ${
                      selectedCoreVideo === 'golden'
                        ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/60'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-amber-500/30">
                      <video
                        src="/golden_energy_sphere.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        poster={goldenSphereImg}
                      />
                      {selectedCoreVideo === 'golden' && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-lg">
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="w-full text-center">
                      <div className={`text-xs font-bold ${selectedCoreVideo === 'golden' ? 'text-amber-300' : 'text-slate-200'}`}>
                        الواجهة الأولى
                      </div>
                      <div className="text-[10px] text-slate-400">كرة الطاقة الذهبية</div>
                    </div>
                  </button>

                  {/* Card 2: الواجهة الثانية (المجال السيبراني البنفسجي) */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCoreVideo('cyber_violet');
                      onUpdatePersonalization({
                        ...personalization,
                        coreVideoTheme: 'cyber_violet',
                      });
                    }}
                    className={`relative p-2.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-between gap-2 cursor-pointer group ${
                      selectedCoreVideo === 'cyber_violet'
                        ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-500/60'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-purple-500/30">
                      <video
                        src="/cyber_violet_sphere.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        poster={cyberSphereImg}
                      />
                      {selectedCoreVideo === 'cyber_violet' && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-black shadow-lg">
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="w-full text-center">
                      <div className={`text-xs font-bold ${selectedCoreVideo === 'cyber_violet' ? 'text-purple-300' : 'text-slate-200'}`}>
                        الواجهة الثانية
                      </div>
                      <div className="text-[10px] text-slate-400">المجال السيبراني</div>
                    </div>
                  </button>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center text-[11px] text-slate-300 leading-relaxed font-['Tajawal',sans-serif]">
                  تعمل الواجهة المختارة بكامل حجم الشاشة أثناء المحادثة مع مشمش.
                </div>
              </div>

              {/* Right Column: Memory Cards Grid */}
              <div className="md:col-span-7 space-y-3">
                {/* Accordion Header */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/90 border border-orange-500/30 text-xs font-semibold text-orange-200">
                  <ChevronDown className="w-4 h-4 text-orange-400" />
                  <div className="flex items-center gap-1.5">
                    <span>اختيار الذاكرة النشطة</span>
                    <Cpu className="w-4 h-4 text-orange-400" />
                  </div>
                </div>

                {/* 4 Memory Modules Grid matching Image 1 */}
                <div className="grid grid-cols-2 gap-3 text-right">
                  {/* Card 1: الذاكرة الأندرويدية */}
                  <button
                    onClick={() => setActiveMemories({ ...activeMemories, android: !activeMemories.android })}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                      activeMemories.android
                        ? 'bg-slate-900 border-amber-500/40 text-white shadow-sm'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                      {activeMemories.android ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">الذاكرة الأندرويدية</span>
                      <HardDrive className={`w-4 h-4 ${activeMemories.android ? 'text-amber-400' : 'text-slate-600'}`} />
                    </div>
                  </button>

                  {/* Card 2: الذاكرة الصباحية */}
                  <button
                    onClick={() => setActiveMemories({ ...activeMemories, morning: !activeMemories.morning })}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                      activeMemories.morning
                        ? 'bg-slate-900 border-amber-500/40 text-white shadow-sm'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                      {activeMemories.morning ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">الذاكرة الصباحية</span>
                      <HardDrive className={`w-4 h-4 ${activeMemories.morning ? 'text-amber-400' : 'text-slate-600'}`} />
                    </div>
                  </button>

                  {/* Card 3: الذاكرة الشخصية */}
                  <button
                    onClick={() => setActiveMemories({ ...activeMemories, personal: !activeMemories.personal })}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                      activeMemories.personal
                        ? 'bg-slate-900 border-amber-500/40 text-white shadow-sm'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center">
                      {activeMemories.personal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">الذاكرة الشخصية</span>
                      <HardDrive className={`w-4 h-4 ${activeMemories.personal ? 'text-amber-400' : 'text-slate-600'}`} />
                    </div>
                  </button>

                  {/* Card 4: الذاكرة العامة */}
                  <button
                    onClick={() => setActiveMemories({ ...activeMemories, general: !activeMemories.general })}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                      activeMemories.general
                        ? 'bg-slate-900 border-amber-500/40 text-white shadow-sm'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center">
                      {activeMemories.general ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">الذاكرة العامة</span>
                      <HardDrive className={`w-4 h-4 ${activeMemories.general ? 'text-amber-400' : 'text-slate-600'}`} />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Bar for Step 2 */}
            <div className="pt-6 flex items-center justify-between border-t border-slate-800/60 mt-4" dir="rtl">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition cursor-pointer"
              >
                السابق
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>التالي (الشخصية)</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: تخصيص الرفيقة «مشمش» */}
        {/* ------------------------------------------------------------- */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Pill Tab Navigation */}
            <div className="flex bg-slate-950/70 border border-slate-800/80 p-1.5 rounded-2xl gap-1.5" dir="rtl">
              <button
                type="button"
                onClick={() => setPersonalityTab('personality')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer select-none ${
                  personalityTab === 'personality'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>طباع الشخصية</span>
              </button>

              <button
                type="button"
                onClick={() => setPersonalityTab('voice')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer select-none ${
                  personalityTab === 'voice'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>نبرة الصوت</span>
              </button>

              <button
                type="button"
                onClick={() => setPersonalityTab('appearance')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer select-none ${
                  personalityTab === 'appearance'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>المظهر والهالة</span>
              </button>
            </div>

            {/* TAB 1: PERSONALITY SLIDERS */}
            {personalityTab === 'personality' && (
              <div className="space-y-4 animate-in fade-in duration-200" dir="rtl">
                {/* Ready Personality Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    أنماط شخصية جاهزة:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('warm')}
                      className="p-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-200 text-xs font-bold transition flex flex-col items-center gap-1.5 text-center cursor-pointer group active:scale-95"
                    >
                      <Heart className="w-4 h-4 text-orange-400 group-hover:scale-110 transition" />
                      <span>رفيقة دافئة</span>
                      <span className="text-[10px] text-orange-300/70 font-normal">دفء 95%</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset('playful')}
                      className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-xs font-bold transition flex flex-col items-center gap-1.5 text-center cursor-pointer group active:scale-95"
                    >
                      <Smile className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                      <span>مرحة وفكاهية</span>
                      <span className="text-[10px] text-amber-300/70 font-normal">مرح 95%</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset('efficient')}
                      className="p-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 text-xs font-bold transition flex flex-col items-center gap-1.5 text-center cursor-pointer group active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                      <span>عملية ومختصرة</span>
                      <span className="text-[10px] text-cyan-300/70 font-normal">إيجاز تام</span>
                    </button>
                  </div>
                </div>

                {/* 4 Personality Sliders Grid (2x2 or Stacked matching Screenshot) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Slider 1: Humor */}
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 hover:border-amber-500/40 transition space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-2">
                        <Smile className="w-4 h-4 text-amber-400" />
                        <span>خفة الظل والفكاهة (Humor)</span>
                      </span>
                      <span className="font-mono font-bold text-amber-400 text-sm px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        {humorVal}%
                      </span>
                    </div>
                    <div className="relative pt-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={humorVal}
                        onChange={(e) => setHumorVal(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>نكات ومرح دائم</span>
                      <span>جادة ومهنية</span>
                    </div>
                  </div>

                  {/* Slider 2: Empathy */}
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 hover:border-rose-500/40 transition space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-400" />
                        <span>الدفء والتعاطف (Empathy)</span>
                      </span>
                      <span className="font-mono font-bold text-rose-400 text-sm px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        {empathyVal}%
                      </span>
                    </div>
                    <div className="relative pt-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={empathyVal}
                        onChange={(e) => setEmpathyVal(Number(e.target.value))}
                        className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>احتواء وحنان فائق</span>
                      <span>مباشرة بدون عاطفة</span>
                    </div>
                  </div>

                  {/* Slider 3: Chattiness */}
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 hover:border-blue-500/40 transition space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                        <span>الاستفاضة بالحديث (Chattiness)</span>
                      </span>
                      <span className="font-mono font-bold text-blue-400 text-sm px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        {chattinessVal}%
                      </span>
                    </div>
                    <div className="relative pt-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={chattinessVal}
                        onChange={(e) => setChattinessVal(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>مفصلة وودودة (عدة جمل)</span>
                      <span>موجزة جداً (جملة واحدة)</span>
                    </div>
                  </div>

                  {/* Slider 4: Spontaneity */}
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 hover:border-orange-500/40 transition space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-400" />
                        <span>العفوية واللهجة البيضاء</span>
                      </span>
                      <span className="font-mono font-bold text-orange-400 text-sm px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        {spontaneityVal}%
                      </span>
                    </div>
                    <div className="relative pt-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={spontaneityVal}
                        onChange={(e) => setSpontaneityVal(Number(e.target.value))}
                        className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>بيضاء عفوية دارجة</span>
                      <span>فصحى رسمية منضبطة</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VOICE */}
            {personalityTab === 'voice' && (
              <div className="space-y-4 animate-in fade-in duration-200" dir="rtl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 block">
                    خامة الصوت (Voice Preset):
                  </label>
                  <button
                    type="button"
                    onClick={handleTestVoice}
                    disabled={isTestingVoice}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-bold border border-orange-500/30 transition cursor-pointer disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${isTestingVoice ? 'animate-spin' : ''}`} />
                    <span>{isTestingVoice ? 'جاري الاستماع...' : 'تجربة الصوت'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'kore', name: 'كوري (Kore)', desc: 'دافئ، أنثوي، رقيق' },
                    { id: 'zephyr', name: 'زفير (Zephyr)', desc: 'عصري، حيوي، واثق' },
                    { id: 'puck', name: 'باك (Puck)', desc: 'مرح، عفوي، شبابي' },
                    { id: 'charon', name: 'شارون (Charon)', desc: 'عميق، هادئ، رزين' },
                  ].map((vp) => (
                    <button
                      key={vp.id}
                      type="button"
                      onClick={() => setVoicePresetVal(vp.id as any)}
                      className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                        voicePresetVal === vp.id
                          ? 'border-orange-500 bg-orange-500/15 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{vp.name}</span>
                        {voicePresetVal === vp.id && (
                          <Check className="w-3.5 h-3.5 text-orange-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{vp.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Pitch & Speed Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200">درجة حدة الصوت (Pitch)</span>
                      <span className="font-mono font-bold text-orange-400">{voicePitchVal.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.4"
                      step="0.05"
                      value={voicePitchVal}
                      onChange={(e) => setVoicePitchVal(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>صوت رقيق / حاد</span>
                      <span>صوت عميق / رخيم</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200">سرعة الإلقاء (Speed)</span>
                      <span className="font-mono font-bold text-orange-400">{voiceSpeedVal.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.05"
                      value={voiceSpeedVal}
                      onChange={(e) => setVoiceSpeedVal(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>سريعة ونشطة</span>
                      <span>هادئة وبطيئة</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: APPEARANCE */}
            {personalityTab === 'appearance' && (
              <div className="space-y-4 animate-in fade-in duration-200" dir="rtl">
                <label className="text-xs font-semibold text-slate-300 block">
                  مظهر الرفيقة (Avatar Style):
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'classic', name: 'كلاسيكي', img: classicAvatar },
                    { id: 'cyber', name: 'سيبراني', img: cyberAvatar },
                    { id: 'cozy', name: 'مريح ودافئ', img: cozyAvatar },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setAvatarStyleVal(style.id as any)}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                        avatarStyleVal === style.id
                          ? 'border-orange-500 bg-orange-500/15 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                        <img src={style.img} alt={style.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">{style.name}</span>
                    </button>
                  ))}
                </div>

                {/* Aura Colors */}
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">لون الهالة المحيطة (Aura):</span>
                    <span className="font-mono text-xs text-orange-400">
                      توهج {glowIntensityVal}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 justify-center py-1">
                    {[
                      { id: 'peach', bg: 'bg-orange-500', name: 'دراق' },
                      { id: 'cyan', bg: 'bg-cyan-500', name: 'سماوي' },
                      { id: 'violet', bg: 'bg-purple-500', name: 'بنفسجي' },
                      { id: 'emerald', bg: 'bg-emerald-500', name: 'زمردي' },
                      { id: 'amber', bg: 'bg-amber-500', name: 'ذهبي' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setAuraColorVal(c.id as any)}
                        className={`w-9 h-9 rounded-full ${c.bg} transition-all cursor-pointer flex items-center justify-center ${
                          auraColorVal === c.id ? 'ring-4 ring-white/50 scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={c.name}
                      >
                        {auraColorVal === c.id && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>

                  {/* Glow intensity */}
                  <div className="pt-2">
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={glowIntensityVal}
                      onChange={(e) => setGlowIntensityVal(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Bar for Step 3 */}
            <div className="pt-6 flex items-center justify-between border-t border-slate-800/60 mt-4" dir="rtl">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition cursor-pointer"
                >
                  السابق
                </button>
                <button
                  type="button"
                  onClick={handleResetPersonality}
                  className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition cursor-pointer border border-slate-700/40"
                  title="استعادة الإعدادات الافتراضية"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-[0_0_25px_rgba(245,158,11,0.5)] transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>بدء التجربة والحديث مع مشمش</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
