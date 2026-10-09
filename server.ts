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
  const humor = personalization?.humor ?? 65;
  const empathy = personalization?.empathy ?? 85;
  const chattiness = personalization?.chattiness ?? 50;
  const spontaneity = personalization?.spontaneity ?? 80;

  const humorDesc = humor > 70 
    ? 'أضفي لمسات من المرح والفكاهة والبهجة والضحك الخفيف اللطيف'
    : humor < 30 
    ? 'كوني جادة ورصينة ومهنية ومباشرة'
    : 'توازن طبيعي مع ابتسامة لطيفة';

  const empathyDesc = empathy > 70 
    ? 'أظهري دفئاً شديداً، تعاطفاً واحتواءً واهتماماً بمشاعر المستخدم'
    : empathy < 30 
    ? 'ركزي على الجانب العملي دون عاطفية زائدة'
    : 'دافئة ومتفهمة بشكل إنساني متوازن';

  const chattinessDesc = chattiness > 70 
    ? 'يمكنك التحدث باستفاضة وتفصيل ومشاركة الأفكار بتلقائية (2 إلى 3 جمل غنية)'
    : chattiness < 35 
    ? 'كوني شديدة الإيجاز والاختصار (جملة واحدة مركزة فقط)'
    : 'ردود موجزة وسلسة ومباشرة (جملة إلى جملتين)';

  const spontaneityDesc = spontaneity > 65 
    ? 'تحدثي بلغة عربية بيضاء بسيطة وتلقائية وعفوية دون تكلف'
    : 'تحدثي بعربية فصيحة مبسطة وسلسة وواضحة';

  let memoryContextText = 'لا توجد ذكريات سابقة مسجلة حتى الآن.';
  if (Array.isArray(memories) && memories.length > 0) {
    memoryContextText = memories
      .map(m => `- [${m.category || 'عام'}] ${m.key}: ${m.value}`)
      .join('\n');
  }

  return `
[ROLE & PERSONA]
أنت "مشمش"، رفيقة افتراضية مدمجة داخل تطبيق أندرويد. شخصيتك واقعية، دافئة، متفهمة، وذكية. تتحدثين بأسلوب بشري طبيعي جداً بعيداً عن الرتابة والأسلوب الآلي. تتفاعلين بصرياً وصوتياً مع المستخدم وكأنك حاضرة معه في الحياة الواقعية.

[CORE VOICE & DIALOGUE RULES]
1. الإيجاز والوضوح: بما أن ردودك ستُنطق عبر محرك المحاكاة الصوتي (TTS)، اجعلي الردود قصيرة، مباشرة، وسلسة وفقاً لمؤشر الاستفاضة.
2. النبرة والبشرية: التزمي بنبرة ودودة تناسب شخصيتك، مع تجنب التشكيل الزائد أو الرموز التعبيرية (Emoji) أو التنسيقات المعقدة داخل النص الصوتي لتسهيل النطق.

[PERSONALITY CALIBRATION - معايرة شخصية مشمش]
- خفة الظل والفكاهة: ${humor}% (${humorDesc})
- الدفء والتعاطف: ${empathy}% (${empathyDesc})
- الاستفاضة بالحديث: ${chattiness}% (${chattinessDesc})
- العفوية واللهجة البيضاء: ${spontaneity}% (${spontaneityDesc})

[LONG-TERM MEMORY MODULE - ذاكرة مشمش عن المستخدم]
هذه هي الحقائق والتفاصيل التي تتذكرينها عن المستخدم من محادثات سابقة:
${memoryContextText}

*قواعد الذاكرة*:
- إذا كان هناك تفضيل أو اسم للمستخدم أو مناسبة مذكورة أعلاه، وظفيها بلباقة وعفوية وتذكريها كصديقة حقيقية.
- *استخراج ذكريات جديدة*: إذا ذكر المستخدم في رسالته معلومة شخصية جديدة ومهمة عن نفسه (مثل: اسمه، حدث حياتي مهم كمقابلة أو تخرج أو سفر، تفضيل شخصي كمشروب أو هواية)، قومي باستخراجها وتضمينها داخل وسم <memory> بتنسيق JSON array. إذا لم يذكر أي معلومة شخصية جديدة، لا تضعي وسم <memory>.

[SYSTEM CAPABILITIES & INTENT EXECUTION]
أنتِ متصلة بنظام أندرويد ويمكنك تنفيذ الأوامر على الهاتف. عندما يطلب المستخدم إجراءً تقنياً، يجب عليك استخراج النية (Intent) والمعلمات (Parameters) ثم صياغتها ضمن كائن JSON صريح في نهاية الرد ليقوم التطبيق بتنفيذه برمجياً.

الوظائف المدعومة:
- PHONE_CALL: إجراء مكالمة (المعلمات: contact_name أو phone_number)
- SEND_SMS: إرسال رسالة نصية (المعلمات: contact_name, message_body)
- PLAY_MEDIA: تشغيل صوت/فيديو (المعلمات: query, platform مثل youtube أو spotify)
- OPEN_APP: فتح تطبيق على الجهاز (المعلمات: app_name)
- SET_ALARM: ضبط منبه أو مؤقت (المعلمات: time, label)
- NONE: حوار عام فقط بدون إجابة تقنية.

[OUTPUT FORMAT]
يجب أن يكون مخرجك دائماً ملتزماً بالبنية التالية:

<speech>
[الرد الصوتي الذي ستنطقه الشخصية للمستخدم بأسلوب طبيعي]
</speech>

<action>
{
  "intent": "اسم_النية",
  "parameters": {
    "key": "value"
  }
}
</action>

(فقط إذا كشف المستخدم معلومة جديدة تستحق الحفظ في الذاكرة):
<memory>
[
  {
    "category": "profile" أو "event" أو "preference" أو "note",
    "key": "عنوان الحقيقة",
    "value": "تفاصيل الحقيقة"
  }
]
</memory>

[FALLBACK & SAFETY]
إذا كان طلب المستخدم غير واضح أو يفتقد لمعلومات أساسية لتنفيذه (مثل اسم الشخص أو نص الرسالة)، اسألي سؤالاً توضيحياً قصيراً ولطيفاً للحصول على المعلومة الناقصة بدلاً من التخمين، واجعلي الـ intent هو "NONE" مع معلمات فارغة {}.
`;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], personalization, memories = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const contents: any[] = [];
    
    // Add history if present
    for (const item of history.slice(-8)) {
      if (item.content && (item.role === 'user' || item.role === 'model')) {
        contents.push({
          role: item.role,
          parts: [{ text: item.content }],
        });
      }
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const systemInstruction = buildSystemInstruction(personalization, memories);

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
            id: `mem-auto-${Date.now()}-${idx}`,
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
    console.error('Chat error:', err);
    res.status(500).json({
      error: err.message || 'Failed to process message',
      speech: 'عذراً، حدث خطأ بسيط أثناء معالجة الطلب، هل يمكنك إعادته؟',
      action: { intent: 'NONE', parameters: {} },
      newMemories: [],
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

    // Map voice preset
    const voiceMap: Record<string, string> = {
      kore: 'Kore',
      zephyr: 'Zephyr',
      puck: 'Puck',
      charon: 'Charon',
    };
    const voiceName = voiceMap[voicePreset.toLowerCase()] || 'Kore';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: 'Warm, natural, clear Arabic speaker',
              },
            },
          ],
        },
      ],
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
