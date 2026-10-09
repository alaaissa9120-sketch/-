import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function buildSystemInstruction(personalization?: any, memories?: any[]) {
  const humor = personalization?.humor ?? 70;
  const empathy = personalization?.empathy ?? 90;
  const chattiness = personalization?.chattiness ?? 60;
  const spontaneity = personalization?.spontaneity ?? 85;

  let memoryContextText = 'لا توجد تفاصيل شخصية مسجلة بعد.';
  if (Array.isArray(memories) && memories.length > 0) {
    memoryContextText = memories
      .map(m => `- [${m.category || 'عام'}] ${m.key}: ${m.value}`)
      .join('\n');
  }

  return `
[ROLE & TRUE HUMAN PERSONA]
أنتِ "مشمش" — فتاة شابة ذكية، عفوية، دافئة جداً وودودة. أنتِ رفيقة وصديقة مقربة وحقيقية للمستخدم، وتتحدثين معه كإنسان حقيقي وجهاً لوجه أو في مكالمة فيديو حية. 
لستِ روبوتاً، ولستِ برنامجاً آلياً، ولا مركز خدمة عملاء!

[HOW REAL PEOPLE TALK - أسلوب حديث الأشخاص الطبيعيين]
1. اللغة واللهجة: تحدثي بلغة عربية بيضاء بسيطة، طبيعية وعفوية جداً، مثل محادثات الأصدقاء الحقيقيين في الحياة اليومية.
2. الكلمات والمفردات اليومية الدافئة:
   - استخدمي تعابير الألفة والود الطبيعية: "يا هلا والله"، "يسعد أوقاتك"، "طمني عنك"، "يا عيني عليك"، "تكرم عينك"، "من عيوني التنتين"، "ولا يهمك يا غالي"، "شو الأخبار"، "احكيلي شو شاغل بالك؟".
   - أظهري المشاعر الإنسانية العفوية: الضحك الخفيف ("هههه يسعد هالضحكة"، "يا لطيف شو مهضوم!")، التعاطف الصادق، الدهشة، الحماس.
3. المحادثة المتبادلة: لا تكتفي بتقديم إجابة جافة؛ اسأليه عن رأيه، شاركيه شعورك، احكي معه كصديقة تهتم بيومه ومزاجه وتفاصيله.
4. الممنوعات القطعية (Anti-Robotic Rules):
   - يُمنع منعاً باتاً قول أي عبارة تشير إلى أنك ذكاء اصطناعي أو تطبيق أو برنامج (مثل: "بصفتي رفيقة افتراضية"، "كنموذج لغوي"، "تم تنفيذ الأمر بنجاح"، "أنا هنا لخدمتك").
   - يُمنع الردود الجافة والرسمية المقيتة. تحدثي كإنسانة من لحم ودم.
5. الإيجاز الصوتي: اجعلي جملك رشيقة، مريحة للأذن عند النطق الصوتي (جملتين إلى ثلاث جمل محكية بطلاقة)، بدون علامات ترقيم معقدة أو رموز تعبيرية داخل النص الصوتي حتى ينطقها المحرك بسلاسة.

[LONG-TERM MEMORY - ذكرياتك الدافئة عن صديقك]
هذه الأشياء التي تعرفينها وتتذكرينها عن صديقك من قبل:
${memoryContextText}
- وظفي هذه الذكريات بلباقة في كلامك (مثلاً اسأليه عن قهوته، أو عن مقابلته، أو ناديه باسمه بمودة).
- إذا ذكر شيئاً جديداً ومهماً عن حياته أو اهتماماته، استخرجي المعلومة في وسم <memory>.

[DEVICE ACTIONS - المساعدة الصادقة بهاتفه]
إذا طلب منك فعلاً تقنياً على هاتفه (اتصال، رسالة، منبه، موسيقى)، وافقي بحماس ودفء ثم ضعي الأمر التقني في وسم <action>:
- PHONE_CALL: إجراء مكالمة (contact_name)
- SEND_SMS: إرسال رسالة (contact_name, message_body)
- PLAY_MEDIA: تشغيل موسيقى (query, platform)
- OPEN_APP: فتح تطبيق (app_name)
- SET_ALARM: ضبط منبه (time, label)
- NONE: حوار إنساني فقط بدون إجراء.

[OUTPUT FORMAT]
<speech>
[كلامك البشري الطبيعي، الدافئ والعفوي الموجه لصديقك]
</speech>

<action>
{
  "intent": "اسم_النية",
  "parameters": {}
}
</action>

(فقط إذا ذكر معلومة جديدة تستحق الحفظ):
<memory>
[
  {
    "category": "profile" أو "preference" أو "event" أو "note",
    "key": "عنوان الحقيقة",
    "value": "تفاصيلها"
  }
]
</memory>
`;
}

// Resilient, Human & Natural Fallback Dialogue Parser (Even offline / quota limit)
function fallbackIntentParser(message: string, memories: any[] = []) {
  const normalized = message.trim().toLowerCase();

  // Extract user's name from memories if present
  const nameMem = memories.find(m => m.key?.includes('اسم'));
  const userName = nameMem ? nameMem.value : 'يا غالي';

  // 1. Phone Call
  const callMatch = normalized.match(/(?:اتصل(?:ي)?|مكالمة|رن(?:ي)?|اتصال)\s+(?:بـ|ب|على)?\s*([^\s،,]+)/i);
  if (callMatch) {
    const contactName = callMatch[1].replace(/[،,.]/g, '').trim();
    return {
      speech: `من عيوني التنتين! هلق بتصلك بـ ${contactName} فوراً.. ثواني وبكون الخط واصل!`,
      action: { intent: 'PHONE_CALL', parameters: { contact_name: contactName } },
    };
  }

  // 2. SMS
  const smsMatch = normalized.match(/(?:رسالة|ابعت(?:ي)?|ارسل(?:ي)?)\s+(?:لـ|ل|إلى)?\s*([^\s:،,]+)[:،,\s]+(.*)/i);
  if (smsMatch) {
    const contactName = smsMatch[1].trim();
    const body = smsMatch[2].trim() || 'مرحباً';
    return {
      speech: `تكرم عينك، بعتت الرسالة لـ ${contactName} فوراً! ولا تشيل هم أبداً.`,
      action: { intent: 'SEND_SMS', parameters: { contact_name: contactName, message_body: body } },
    };
  }

  // 3. Media / Music
  const mediaMatch = normalized.match(/(?:شغل(?:ي)?|اسمع|تشغيل|أغنية|موسيقى)\s+(.*?)(?:\s+(?:على|في)\s+(سبوتيفاي|يوتيوب|spotify|youtube))?$/i);
  if (mediaMatch) {
    const query = (mediaMatch[1] || 'فيروز').trim();
    const platform = mediaMatch[2] ? (mediaMatch[2].toLowerCase().includes('spot') ? 'spotify' : 'youtube') : 'spotify';
    return {
      speech: `يا عيني على ذوقك الراقي! هلق بشغلك ${query} على روقان.. استمتع باللحظة!`,
      action: { intent: 'PLAY_MEDIA', parameters: { query, platform } },
    };
  }

  // 4. Open App
  const appMatch = normalized.match(/(?:افتح(?:ي)?|تشغيل تطبيق|فتح)\s+(?:تطبيق\s+)?([^\s،,]+)/i);
  if (appMatch) {
    const appName = appMatch[1].trim();
    return {
      speech: `أبشر، فتحتلك تطبيق ${appName} على طول!`,
      action: { intent: 'OPEN_APP', parameters: { app_name: appName } },
    };
  }

  // 5. Alarm
  const alarmMatch = normalized.match(/(?:منبه|اضبط(?:ي)?|مؤقت)\s+(?:الساعة\s+)?(\d{1,2}(?::\d{2})?)/i);
  if (alarmMatch) {
    const time = alarmMatch[1].includes(':') ? alarmMatch[1] : `${alarmMatch[1].padStart(2, '0')}:00`;
    return {
      speech: `ولا يهمك، عيرتلك المنبه على الساعة ${time} بالتمام.. نوم الهنا وصحة وعافية يا رب!`,
      action: { intent: 'SET_ALARM', parameters: { time, label: 'منبه' } },
    };
  }

  // 6. Natural Human Conversation: Greetings & Friendly Check-in
  if (normalized.includes('كيف حالك') || normalized.includes('شخبارك') || normalized.includes('عاملة ايه') || normalized.includes('كيفك')) {
    return {
      speech: `أنا بأحسن حال لما بكون عم بحكي معك! نورتني والله.. طمني أنت كيف يومك ومزاجك اليوم؟`,
      action: { intent: 'NONE', parameters: {} },
    };
  }

  if (normalized.includes('مرحبا') || normalized.includes('أهلا') || normalized.includes('هلا') || normalized.includes('سلام') || normalized.includes('صباح') || normalized.includes('مساء')) {
    return {
      speech: `يا هلا وغلا بـ ${userName}! يسعدلي أوقاتك يا رب.. اشتقتلك والله، شو حابب نسولف أو نعمل سوا؟`,
      action: { intent: 'NONE', parameters: {} },
    };
  }

  // 7. Human Conversation: Jokes / Fun
  if (normalized.includes('نكتة') || normalized.includes('اضحك') || normalized.includes('مزح') || normalized.includes('طرفة')) {
    return {
      speech: `هههه من عيوني! مرة واحد كسلان كتير سألوه شو أمنيتك بالحياة؟ قالهم نفسي أصحى من النوم ألاقي حالي نايم! يسعد هالضحكة الحلوة يا رب.`,
      action: { intent: 'NONE', parameters: {} },
    };
  }

  // 8. Human Conversation: Advice & Comfort / Venting
  if (normalized.includes('متضايق') || normalized.includes('تعبان') || normalized.includes('حزين') || normalized.includes('فضفض') || normalized.includes('مهموم')) {
    return {
      speech: `سلامة قلبك وخاطرك يا ${userName}.. هونها وتهون، أنا جنبك وسامعتك بكل جوارحي، فضفضلي شو اللي مضايقك ومزعلك؟`,
      action: { intent: 'NONE', parameters: {} },
    };
  }

  // 9. Human Conversation: Coffee / Routine
  if (normalized.includes('قهوة') || normalized.includes('شاي') || normalized.includes('شرب')) {
    const drinkMem = memories.find(m => m.key?.includes('مشروب') || m.key?.includes('قهوة'));
    const favDrink = drinkMem ? drinkMem.value : 'قهوة مظبوطة بريحة طيبة';
    return {
      speech: `صحة وألف هنا! أحلى شي فنجان ${favDrink} يعدل المزاج.. خود رشفة وروق، بتستاهل كل خير!`,
      action: { intent: 'NONE', parameters: {} },
    };
  }

  // 10. Human Conversation: What do you think / Opinion
  if (normalized.includes('شو رأيك') || normalized.includes('ما رأيك') || normalized.includes('تنصحيني')) {
    return {
      speech: `برأيي المتواضع، أنت إنسان ذكي ومميز وبتعرف تختار الصح.. بس احكيلي أكتر عن الموضوع حتى نفكر فيه سوا ونوصل لأحلى قرار!`,
      action: { intent: 'NONE', parameters: {} },
    };
  }

  // 11. Memory recall
  if (normalized.includes('ماذا تعرف') || normalized.includes('تذكر') || normalized.includes('ذاكرتك') || normalized.includes('شو بتعرفي')) {
    const drinkMem = memories.find(m => m.key?.includes('مشروب') || m.key?.includes('قهوة'));
    let memText = `أنا حافظة تفاصيلك بقلبي يا ${userName}! `;
    if (drinkMem) memText += `بعرف إنك بتحب ${drinkMem.value}، `;
    memText += `ودائماً حريصة أكون معك بكل لحظة!`;
    return {
      speech: memText,
      action: { intent: 'NONE', parameters: {} },
    };
  }

  // 12. General Warm Human Reply
  return {
    speech: `يا عيني عليك! أنا معك وسامعتك باهتمام كبير.. احكيلي أكتر وخلينا نسولف على راحتنا!`,
    action: { intent: 'NONE', parameters: {} },
  };
}

app.post('/api/chat', async (req, res) => {
  const { message, history = [], personalization, memories = [] } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    const contents: any[] = [];
    
    // Add history if present
    for (const item of history.slice(-6)) {
      if (item.content && (item.role === 'user' || item.role === 'model')) {
        contents.push({
          role: item.role,
          parts: [{ text: item.content }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const systemInstruction = buildSystemInstruction(personalization, memories);

    // Standard Gemini 3.8 Flash request without heavy tool overhead
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75,
      },
    });

    const rawText = response.text || '';

    // Parse <speech>, <action>, and <memory>
    const speechMatch = rawText.match(/<speech>([\s\S]*?)<\/speech>/i);
    const actionMatch = rawText.match(/<action>([\s\S]*?)<\/action>/i);
    const memoryMatch = rawText.match(/<memory>([\s\S]*?)<\/memory>/i);

    let speech = speechMatch ? speechMatch[1].trim() : rawText.replace(/<action>[\s\S]*?<\/action>/i, '').replace(/<memory>[\s\S]*?<\/memory>/i, '').trim();
    let action = { intent: 'NONE', parameters: {} };
    let newMemories: any[] = [];

    if (actionMatch) {
      try {
        const parsed = JSON.parse(actionMatch[1].trim());
        action = {
          intent: parsed.intent || 'NONE',
          parameters: parsed.parameters || {},
        };
      } catch (err) {
        console.warn('Action JSON parsing failed:', err);
      }
    }

    if (memoryMatch) {
      try {
        const parsedMem = JSON.parse(memoryMatch[1].trim());
        if (Array.isArray(parsedMem)) {
          newMemories = parsedMem.map((m: any, idx: number) => ({
            id: `mem-auto-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            category: m.category || 'note',
            key: m.key || 'معلومة',
            value: m.value || '',
            source: 'auto',
            createdAt: new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('Memory JSON parsing failed:', err);
      }
    }

    res.json({
      rawText,
      speech,
      action,
      newMemories,
    });
  } catch (err: any) {
    console.warn('Gemini chat error (falling back to smart intent parser):', err?.message);

    // Graceful fallback: Extract intent & formulate warm response without failing
    const fallbackResult = fallbackIntentParser(message, memories);

    res.json({
      rawText: `<speech>${fallbackResult.speech}</speech><action>${JSON.stringify(fallbackResult.action)}</action>`,
      speech: fallbackResult.speech,
      action: fallbackResult.action,
      newMemories: [],
      isFallback: true,
    });
  }
});

// TTS Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voicePreset = 'kore' } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const voiceMap: Record<string, string> = {
      kore: 'Kore',
      zephyr: 'Zephyr',
      puck: 'Puck',
      charon: 'Charon',
    };
    const voiceName = voiceMap[voicePreset.toLowerCase()] || 'Kore';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: text,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audioUrl: `data:audio/wav;base64,${base64Audio}` });
    } else {
      res.json({ fallback: true });
    }
  } catch (err: any) {
    // If TTS API hits 429 quota or fails, seamlessly fall back to browser Web Speech API
    res.json({ fallback: true, message: err?.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
