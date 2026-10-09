import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, Loader2, Volume2 } from 'lucide-react';
import { audioManager } from '../utils/audio';

interface VoiceInputBarProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onMicStateChange?: (isListening: boolean) => void;
}

export const VoiceInputBar: React.FC<VoiceInputBarProps> = ({
  onSendMessage,
  isLoading,
  onMicStateChange,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA'; // Arabic

      recognition.onstart = () => {
        setIsRecording(true);
        onMicStateChange?.(true);
        audioManager.playChime('pop');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        setInputText(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        onMicStateChange?.(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        onMicStateChange?.(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition setup failed:', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onMicStateChange]);

  const toggleRecording = () => {
    if (!speechSupported) {
      alert('التعرف على الصوت غير مدعوم في هذا المتصفح، يمكنك استخدام الكتابة المباشرة.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      onMicStateChange?.(false);
      if (inputText.trim()) {
        handleSubmit();
      }
    } else {
      setInputText('');
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch {
        // already started
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      onMicStateChange?.(false);
    }

    onSendMessage(inputText.trim());
    setInputText('');
    setTranscript('');
  };

  const handleQuickPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  const quickPrompts = [
    { text: 'اتصلي بـ أحمد بسرعة', icon: '📞', category: 'call' },
    { text: 'ابعتي رسالة لسارة: أنا بالطريق', icon: '💬', category: 'sms' },
    { text: 'شغلي فيروز على سبوتيفاي', icon: '🎵', category: 'media' },
    { text: 'افتحي تطبيق الكاميرا', icon: '📷', category: 'app' },
    { text: 'اضبطي منبه الساعة 7 صباحاً', icon: '⏰', category: 'alarm' },
    { text: 'كيف حالك اليوم يا مشمش؟', icon: '🧡', category: 'chat' },
    { text: 'اسمي علاء وأحب القهوة بالهيل', icon: '🧠', category: 'memory' },
    { text: 'ماذا تعرفين عني يا مشمش؟', icon: '✨', category: 'recall' },
    { text: 'ابعث رسالة', icon: '❓', category: 'clarify' },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin select-none">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPrompt(p.text)}
            disabled={isLoading}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 hover:bg-slate-800 text-slate-300 hover:text-orange-200 text-xs transition duration-200 disabled:opacity-50 active:scale-95 shadow-sm"
          >
            <span>{p.icon}</span>
            <span>{p.text}</span>
          </button>
        ))}
      </div>

      {/* Main Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2 bg-slate-900/95 border border-slate-800 focus-within:border-orange-500/50 rounded-2xl p-1.5 shadow-xl backdrop-blur-md transition-all"
      >
        {/* Voice Microphone Button */}
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isLoading}
          className={`relative p-3 rounded-xl transition-all flex items-center justify-center flex-shrink-0 ${
            isRecording
              ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
              : 'bg-slate-800/80 text-orange-400 hover:bg-orange-500/20 active:scale-95'
          }`}
          title={isRecording ? 'إيقاف التسجيل الصوتي والإرسال' : 'تحدث بالصوت مع مشمش'}
        >
          {isRecording ? (
            <>
              <div className="absolute -inset-1 rounded-xl border border-rose-400 animate-ping pointer-events-none" />
              <MicOff className="w-5 h-5" />
            </>
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Text Input Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isRecording
                ? 'استمع إليك الآن... تحدث بطبيعية...'
                : 'اكتب أمراً أو تحدث صوتياً مع مشمش...'
            }
            disabled={isLoading}
            className="w-full bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white transition-all flex items-center justify-center flex-shrink-0 active:scale-95 shadow-md shadow-orange-600/20"
          title="إرسال الطلب"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 rtl-flip" />
          )}
        </button>
      </form>
    </div>
  );
};
