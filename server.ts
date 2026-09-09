import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // Initialize server-side Gemini client
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "AIzaSyAiDu8oD5cquUJXTqyyKafHLlZ4UGA9Dl0";
  const ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint for voice/text parsing
  app.post('/api/parse-voice', async (req, res) => {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      res.status(400).json({ error: 'لم يتم توفير نص صالح للتحليل.' });
      return;
    }

    try {
      const prompt = `
        أنت مساعد الذكاء الاصطناعي لتطبيق "أوراد" لإدارة العبادات. مهمتك هي قراءة نص منطوق بالذكاء الاصطناعي باللغة العربية يصف العبادات اليومية للمستخدم، وتحويلها إلى كائن JSON يحتوي على الحقول والعبادات المكتملة فقط لإنشاء تحديثات يتم دمجها مع DailyLog الحالي.

        هيكل كائن DailyLog الحالي هو كالتالي:
        {
          prayers: {
            "الفجر": { performed: boolean, inCongregation: boolean, surroundingSunnahIds: string[] },
            "الظهر": { performed: boolean, inCongregation: boolean, surroundingSunnahIds: string[] },
            "العصر": { performed: boolean, inCongregation: boolean, surroundingSunnahIds: string[] },
            "المغرب": { performed: boolean, inCongregation: boolean, surroundingSunnahIds: string[] },
            "العشاء": { performed: boolean, inCongregation: boolean, surroundingSunnahIds: string[] }
          },
          quran: {
            hifzRub: number (عدد أرباع السماع/الحفظ),
            revisionRub: number (عدد أرباع القراءة/المراجعة),
            surahName: string (من السورة وموضعها)
          },
          knowledge: {
            shariDuration: number (طلب علم شرعي بالدقائق),
            readingDuration: number (قراءة عامة بالدقائق),
            readingPages: number (عدد صفحة)
          },
          athkar: {
            checklists: {
              morning: boolean,
              evening: boolean,
              sleep: boolean,
              travel: boolean
            }
          },
          nawafil: {
            duhaDuration: number (صلاة الضحى بالدقائق، مثلاً لو قال صليت الضحى ضع 10),
            witrDuration: number (الوتر بالدقائق مثل 10),
            qiyamDuration: number (قيام الليل بالدقائق مثل 30),
            fasting: boolean (لو قال صائم ضع true)
          },
          jihadFactor: number (معامل المجاهدة: 1.0 أو 1.05 أو 1.1)
        }

        شروط الاستخراج والمنطق:
        1. قم باستخراج العبادات المذكورة في النص فقط. لا تقم بإدراج أي عبادة لم يذكرها المستخدم في الـ JSON.
        2. بالنسبة للصلوات:
           - "صليت الفجر جماعة": { prayers: { "الفجر": { performed: true, inCongregation: true } } }
           - "صليت الظهر": { prayers: { "الظهر": { performed: true } } }
        3. بالنسبة للقرآن:
           - الجزء الواحد يساوى 8 أرباع (revisionRub: 8).
           - نصف جزء يساوى 4 أرباع (revisionRub: 4).
           - ربعين يساوى 2 ربع (revisionRub: 2).
           - إذا قال "قرأت سورة البقرة" أو موضع محدد، ضعه في quran.surahName.
        4. بالنسبة للأذكار:
           - "أذكار الصباح": { athkar: { checklists: { morning: true } } }
           - "أذكار المساء": { athkar: { checklists: { evening: true } } }
           - "أذكار النوم": { athkar: { checklists: { sleep: true } } }
        5. بالنسبة السنن والنوافل:
           - "صليت الضحى": { nawafil: { duhaDuration: 10 } }
           - "صليت الوتر": { nawafil: { witrDuration: 10 } }
           - "صليت قيام الليل": { nawafil: { qiyamDuration: 30 } }
           - "أنا صايم اليوم" أو "صمت": { nawafil: { fasting: true } }

        قم بإرجاع كائن JSON خالص يحتوي على التحديثات المستخرجة فقط بدون كتابة أي كود ماركداون خارجي أو تفسير. فقط كائن JSON صالح.

        نص المستخدم: "${transcript}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '';
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const updates = JSON.parse(cleanJsonStr);

      res.json({ updates });
    } catch (error) {
      console.error('Gemini processing error on server:', error);
      res.status(500).json({ error: 'حدث خطأ غير متوقع أثناء معالجة العبارة على الخادم.' });
    }
  });

  // Vite development vs production asset-serving middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully operational on http://localhost:${PORT}`);
  });
}

startServer();
