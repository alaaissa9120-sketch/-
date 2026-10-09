import React, { useState } from 'react';
import { 
  Sliders, Palette, Sparkles, Volume2, UserCheck, Play, 
  RotateCcw, X, Check, Heart, Smile, MessageCircle, Zap 
} from 'lucide-react';
import { PersonalizationSettings } from '../types';
import classicAvatar from '../assets/images/meshmesh_avatar_1791506916142.jpg';
import cyberAvatar from '../assets/images/meshmesh_cyber_1791507090382.jpg';
import cozyAvatar from '../assets/images/meshmesh_cozy_1791507103483.jpg';
import { audioManager } from '../utils/audio';

interface PersonalizationModalProps {
  settings: PersonalizationSettings;
  onUpdateSettings: (newSettings: PersonalizationSettings) => void;
  onClose: () => void;
}

export const PersonalizationModal: React.FC<PersonalizationModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [current, setCurrent] = useState<PersonalizationSettings>(settings);
  const [activeTab, setActiveTab] = useState<'appearance' | 'voice' | 'personality'>('personality');
  const [testingVoice, setTestingVoice] = useState(false);

  const handleSave = () => {
    onUpdateSettings(current);
    onClose();
  };

  const handleTestVoice = async () => {
    if (testingVoice) return;
    setTestingVoice(true);
    await audioManager.speak(
      'أهلاً بك! هذه نبرة صوتي الحالية، كيف تبدو لك؟',
      {
        pitch: current.voicePitch,
        speed: current.voiceSpeed,
        voicePreset: current.voicePreset,
      },
      undefined,
      () => setTestingVoice(false)
    );
  };

  const handleResetDefaults = () => {
    setCurrent({
      avatarStyle: 'classic',
      auraColor: 'peach',
      glowIntensity: 70,
      voicePitch: 1.05,
      voiceSpeed: 1.0,
      voicePreset: 'kore',
      humor: 65,
      empathy: 85,
      chattiness: 55,
      spontaneity: 80,
    });
  };

  // Quick personality presets
  const applyPreset = (preset: 'warm' | 'efficient' | 'playful') => {
    if (preset === 'warm') {
      setCurrent(prev => ({
        ...prev,
        humor: 65,
        empathy: 95,
        chattiness: 60,
        spontaneity: 85,
      }));
    } else if (preset === 'efficient') {
      setCurrent(prev => ({
        ...prev,
        humor: 20,
        empathy: 50,
        chattiness: 25,
        spontaneity: 40,
      }));
    } else if (preset === 'playful') {
      setCurrent(prev => ({
        ...prev,
        humor: 95,
        empathy: 75,
        chattiness: 85,
        spontaneity: 90,
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">تخصيص الرفيقة "مشمش"</h3>
              <p className="text-xs text-slate-400">تعديل المظهر، الصوت، وطباع الشخصية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('personality')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'personality'
                ? 'bg-orange-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>طباع الشخصية</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'voice'
                ? 'bg-orange-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>نبرة الصوت</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'appearance'
                ? 'bg-orange-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>المظهر والهالة</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. PERSONALITY SLIDERS */}
          {activeTab === 'personality' && (
            <div className="space-y-5">
              {/* Quick Presets */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  أنماط شخصية جاهزة:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => applyPreset('warm')}
                    className="p-2.5 rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-200 text-xs font-medium hover:bg-orange-500/20 transition flex flex-col items-center gap-1 text-center"
                  >
                    <Heart className="w-4 h-4 text-orange-400" />
                    <span>رفيقة دافئة</span>
                  </button>
                  <button
                    onClick={() => applyPreset('playful')}
                    className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs font-medium hover:bg-amber-500/20 transition flex flex-col items-center gap-1 text-center"
                  >
                    <Smile className="w-4 h-4 text-amber-400" />
                    <span>مرحة وفكاهية</span>
                  </button>
                  <button
                    onClick={() => applyPreset('efficient')}
                    className="p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 text-xs font-medium hover:bg-cyan-500/20 transition flex flex-col items-center gap-1 text-center"
                  >
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>عملية ومختصرة</span>
                  </button>
                </div>
              </div>

              {/* Slider 1: Humor */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-amber-400" />
                    <span>خفة الظل والفكاهة (Humor)</span>
                  </span>
                  <span className="font-mono font-bold text-amber-400">{current.humor}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={current.humor}
                  onChange={(e) => setCurrent({ ...current, humor: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>جادة ومهنية</span>
                  <span>نكات ومرح دائم</span>
                </div>
              </div>

              {/* Slider 2: Empathy */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>الدفء والتعاطف (Empathy)</span>
                  </span>
                  <span className="font-mono font-bold text-rose-400">{current.empathy}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={current.empathy}
                  onChange={(e) => setCurrent({ ...current, empathy: Number(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>مباشرة بدون عاطفة</span>
                  <span>احتواء وحنان فائق</span>
                </div>
              </div>

              {/* Slider 3: Chattiness */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span>الاستفاضة بالحديث (Chattiness)</span>
                  </span>
                  <span className="font-mono font-bold text-blue-400">{current.chattiness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={current.chattiness}
                  onChange={(e) => setCurrent({ ...current, chattiness: Number(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>موجزة جداً (جملة واحدة)</span>
                  <span>مفصلة وودودة (عدة جمل)</span>
                </div>
              </div>

              {/* Slider 4: Spontaneity */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>العفوية واللهجة البيضاء</span>
                  </span>
                  <span className="font-mono font-bold text-orange-400">{current.spontaneity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={current.spontaneity}
                  onChange={(e) => setCurrent({ ...current, spontaneity: Number(e.target.value) })}
                  className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>فصحى رسمية منضبطة</span>
                  <span>بيضاء عفوية شعبية</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. VOICE CUSTOMIZATION */}
          {activeTab === 'voice' && (
            <div className="space-y-5">
              {/* Voice Preset Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  خامة الصوت (Voice Preset):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'kore', name: 'كوري (Kore)', desc: 'دافئ، أنثوي، رقيق' },
                    { id: 'zephyr', name: 'زفير (Zephyr)', desc: 'عصري، حيوي، واثق' },
                    { id: 'puck', name: 'باك (Puck)', desc: 'مرح، عفوي، شبابي' },
                    { id: 'charon', name: 'شارون (Charon)', desc: 'عميق، هادئ، رزين' },
                  ].map((vp) => (
                    <button
                      key={vp.id}
                      onClick={() => setCurrent({ ...current, voicePreset: vp.id as any })}
                      className={`p-3 rounded-2xl border text-right transition ${
                        current.voicePreset === vp.id
                          ? 'border-orange-500 bg-orange-500/15 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white">{vp.name}</span>
                        {current.voicePreset === vp.id && (
                          <Check className="w-3.5 h-3.5 text-orange-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{vp.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Pitch Slider */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">درجة حدة الصوت (Pitch)</span>
                  <span className="font-mono font-bold text-orange-400">
                    {current.voicePitch.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.4"
                  step="0.05"
                  value={current.voicePitch}
                  onChange={(e) => setCurrent({ ...current, voicePitch: Number(e.target.value) })}
                  className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>صوت عميق / رخيم</span>
                  <span>طبيعي</span>
                  <span>صوت رقيق / حاد</span>
                </div>
              </div>

              {/* Voice Speed Slider */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">سرعة الإلقاء (Speed)</span>
                  <span className="font-mono font-bold text-orange-400">
                    {current.voiceSpeed.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={current.voiceSpeed}
                  onChange={(e) => setCurrent({ ...current, voiceSpeed: Number(e.target.value) })}
                  className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>هادئ وبطيء</span>
                  <span>طبيعي</span>
                  <span>سريع وديناميكي</span>
                </div>
              </div>

              {/* Test Voice Button */}
              <div className="pt-2">
                <button
                  onClick={handleTestVoice}
                  disabled={testingVoice}
                  className="w-full py-3 px-4 rounded-2xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-200 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-98"
                >
                  <Play className={`w-4 h-4 fill-current ${testingVoice ? 'animate-spin' : ''}`} />
                  <span>{testingVoice ? 'جارِ تشغيل العينة الصوتية...' : 'اختبار نبرة الصوت المحددة'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. APPEARANCE & AURA */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Avatar Style Choice */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  الشخصية والمظهر الافتراضي:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'classic', name: 'الدافئة الكلاسيكية', img: classicAvatar, badge: 'بشري دافئ' },
                    { id: 'cyber', name: 'السايبر المستقبلية', img: cyberAvatar, badge: 'هولوغرام نيون' },
                    { id: 'cozy', name: 'الأليف المحبوب', img: cozyAvatar, badge: 'كوزي لطيف' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setCurrent({ ...current, avatarStyle: style.id as any })}
                      className={`group relative rounded-2xl overflow-hidden border-2 p-1.5 transition text-center ${
                        current.avatarStyle === style.id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                      }`}
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden relative mb-2">
                        <img
                          src={style.img}
                          alt={style.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        {current.avatarStyle === style.id && (
                          <div className="absolute top-1 right-1 p-1 rounded-full bg-orange-500 text-white shadow">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-white block truncate">{style.name}</span>
                      <span className="text-[10px] text-slate-400 block">{style.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aura / Glow Theme Color */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  لون الهالة الضوئية (Aura Glow):
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'peach', name: 'خوخي', color: 'from-orange-500 to-amber-400', border: 'border-orange-500' },
                    { id: 'cyan', name: 'سايبر', color: 'from-cyan-400 to-blue-500', border: 'border-cyan-500' },
                    { id: 'violet', name: 'بنفسجي', color: 'from-purple-500 to-fuchsia-500', border: 'border-purple-500' },
                    { id: 'emerald', name: 'زمردي', color: 'from-emerald-400 to-teal-500', border: 'border-emerald-500' },
                    { id: 'amber', name: 'ذهبي', color: 'from-amber-400 to-yellow-500', border: 'border-amber-500' },
                  ].map((aura) => (
                    <button
                      key={aura.id}
                      onClick={() => setCurrent({ ...current, auraColor: aura.id as any })}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                        current.auraColor === aura.id
                          ? `${aura.border} bg-slate-800 text-white shadow-lg`
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${aura.color} shadow-sm`} />
                      <span className="text-[11px] font-medium">{aura.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Glow Intensity */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">شدة التوهج الحيوي</span>
                  <span className="font-mono font-bold text-orange-400">{current.glowIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={current.glowIntensity}
                  onChange={(e) => setCurrent({ ...current, glowIntensity: Number(e.target.value) })}
                  className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            onClick={handleResetDefaults}
            className="py-2.5 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضي</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="py-2.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-bold transition shadow-lg flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ التخصيص</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
