// Audio utilities for Meshmesh virtual companion

export interface SpeakOptions {
  pitch?: number;       // 0.6 to 1.4 (default: 1.05)
  speed?: number;       // 0.8 to 1.3 (default: 1.0)
  voicePreset?: 'kore' | 'zephyr' | 'puck' | 'charon';
}

class AudioManager {
  private audioCtx: AudioContext | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play gentle notification chime when an Android command is recognized
  playChime(type: 'success' | 'alert' | 'pop' = 'success') {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      if (type === 'success') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, now + 0.08); // A5
        osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25); // D6

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.06);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
      } else if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch {
      // AudioContext might be blocked until first user interaction
    }
  }

  // Simulated phone dialing sound
  playDialTone() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.setValueAtTime(0, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } catch {
      // ignore
    }
  }

  // Stop currently playing speech
  stopSpeech() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Play text speech: tries Gemini server TTS first, with Web Speech API fallback
  async speak(
    text: string, 
    options: SpeakOptions = {}, 
    onStart?: () => void, 
    onEnd?: () => void
  ): Promise<void> {
    this.stopSpeech();
    
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      onEnd?.();
      return;
    }

    const { pitch = 1.05, speed = 1.0, voicePreset = 'kore' } = options;

    try {
      onStart?.();

      // First attempt: Gemini TTS endpoint with selected voice preset
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: cleanText,
          voicePreset,
        }),
      });

      const data = await response.json();

      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        this.currentAudioElement = audio;
        if (speed && speed !== 1.0) {
          audio.playbackRate = speed;
        }

        audio.onended = () => {
          this.currentAudioElement = null;
          onEnd?.();
        };

        audio.onerror = () => {
          this.fallbackBrowserSpeech(cleanText, pitch, speed, onEnd);
        };

        await audio.play();
        return;
      }
    } catch {
      // Fallback
    }

    // Fallback: Browser Web Speech API
    this.fallbackBrowserSpeech(cleanText, pitch, speed, onEnd);
  }

  private fallbackBrowserSpeech(text: string, pitch = 1.05, speed = 1.0, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = speed;
    utterance.pitch = pitch;

    // Pick best Arabic voice available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar') || v.name.includes('Arabic'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = () => {
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const audioManager = new AudioManager();
