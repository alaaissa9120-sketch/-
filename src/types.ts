export type IntentType = 
  | 'PHONE_CALL'
  | 'SEND_SMS'
  | 'PLAY_MEDIA'
  | 'OPEN_APP'
  | 'SET_ALARM'
  | 'NONE';

export interface ActionParameters {
  contact_name?: string;
  phone_number?: string;
  message_body?: string;
  query?: string;
  platform?: string;
  app_name?: string;
  time?: string;
  label?: string;
  [key: string]: any;
}

export interface ParsedAction {
  intent: IntentType;
  parameters: ActionParameters;
}

export type MemoryCategory = 'profile' | 'event' | 'preference' | 'note';

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  key: string;       // e.g. "اسم المستخدم", "المناسبة", "التفضيل"
  value: string;     // e.g. "علاء", "مقابلة عمل يوم الأحد", "يحب فيروز"
  source: 'auto' | 'manual';
  createdAt: string;
}

export interface PersonalizationSettings {
  avatarStyle: 'classic' | 'cyber' | 'cozy';
  auraColor: 'peach' | 'cyan' | 'violet' | 'emerald' | 'amber';
  glowIntensity: number; // 20 to 100
  
  // Voice Customization
  voicePitch: number; // 0.6 to 1.4 (default 1.05)
  voiceSpeed: number; // 0.8 to 1.3 (default 1.0)
  voicePreset: 'kore' | 'zephyr' | 'puck' | 'charon';
  
  // Personality Sliders (0 - 100)
  humor: number;        // خفة الظل والمرح (0: جادة، 100: مرحة وفكاهية)
  empathy: number;      // الدفء والتعاطف (0: عملية، 100: فائقة الحنان)
  chattiness: number;   // الاستفاضة بالحديث (0: مقتضبة، 100: مفصلة)
  spontaneity: number;  // العفوية واللهجة البيضاء (0: فصحى رسمية، 100: عفوية دارجة)
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  speech: string;
  action?: ParsedAction;
  rawText?: string;
  newMemories?: MemoryItem[];
  timestamp: string;
}

export interface AlarmItem {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  days: string[];
}

export interface ActiveCall {
  contact_name: string;
  phone_number?: string;
  durationSeconds: number;
  status: 'dialing' | 'connected' | 'ended';
  isMuted: boolean;
  isSpeaker: boolean;
}

export interface MediaState {
  isPlaying: boolean;
  query: string;
  platform: 'youtube' | 'spotify' | 'music' | 'other';
  title: string;
  artist: string;
  progress: number;
}

export interface SMSThread {
  contact_name: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'contact';
    text: string;
    timestamp: string;
  }>;
}

export type ActiveAppScreen = 
  | 'HOME'
  | 'COMPANION'
  | 'CALL'
  | 'SMS'
  | 'MEDIA'
  | 'CLOCK'
  | 'CAMERA'
  | 'WHATSAPP'
  | 'MAPS'
  | 'SETTINGS'
  | 'GENERIC_APP';
