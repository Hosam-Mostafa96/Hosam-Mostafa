import React, { useState, useRef, useMemo } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Flame, 
  Heart, 
  Award, 
  BookOpen, 
  Moon, 
  Sun, 
  Timer, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Palette,
  Compass,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { format, subDays, addDays } from 'date-fns';
import { arSA as ar } from 'date-fns/locale';
import { DailyLog, AppWeights, User, PrayerEntry } from '../types';
import { calculateTotalScore } from '../utils/scoring';
import confetti from 'canvas-confetti';

interface WeeklyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
  user: User | null;
  targetScore: number;
}

export const WeeklyCardModal: React.FC<WeeklyCardModalProps> = ({
  isOpen,
  onClose,
  logs,
  weights,
  user,
  targetScore
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'emerald' | 'midnight' | 'ivory'>('emerald');
  const [showName, setShowName] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // حساب إحصائيات الأيام السبعة الأخيرة
  const stats = useMemo(() => {
    const today = new Date();
    const days: { date: Date; dateStr: string; log?: DailyLog; score: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const dStr = format(d, 'yyyy-MM-dd');
      const log = logs[dStr];
      const score = log ? calculateTotalScore(log, weights) : 0;
      days.push({ date: d, dateStr: dStr, log, score });
    }

    const startDate = days[0].date;
    const endDate = days[6].date;
    const dateRangeStr = `${format(startDate, 'd MMM', { locale: ar })} - ${format(endDate, 'd MMM yyyy', { locale: ar })}`;

    let totalScore = 0;
    let prayersPerformed = 0;
    let congregationPrayers = 0;
    let fajrPrayers = 0;
    let quranRubs = 0;
    let quranPages = 0;
    let qiyamMins = 0;
    let duhaMins = 0;
    let fastingDays = 0;
    let totalDhikr = 0;
    let morningAthkarCount = 0;
    let eveningAthkarCount = 0;
    let knowledgeMins = 0;
    let streakDays = 0;

    days.forEach(({ log, score }) => {
      totalScore += score;
      if (score > 0) streakDays++;

      if (log) {
        // الصلوات
        const prayersList = Object.values(log.prayers || {}) as PrayerEntry[];
        prayersList.forEach(p => {
          if (p.performed) {
            prayersPerformed++;
            if (p.inCongregation) congregationPrayers++;
          }
        });

        if (log.prayers?.fajr?.performed) fajrPrayers++;

        // القرآن
        quranRubs += (log.quran?.hifzRub || 0) + (log.quran?.revisionRub || 0);
        quranPages += log.quran?.readPages?.length || 0;

        // النوافل
        qiyamMins += (log.nawafil?.qiyamDuration || 0) + (log.nawafil?.witrDuration || 0);
        duhaMins += log.nawafil?.duhaDuration || 0;
        if (log.nawafil?.fasting) fastingDays++;

        // الأذكار
        const counters = Object.values(log.athkar?.counters || {}) as number[];
        totalDhikr += counters.reduce((a, b) => a + b, 0);
        if (log.athkar?.checklists?.morning) morningAthkarCount++;
        if (log.athkar?.checklists?.evening) eveningAthkarCount++;

        // العلم
        knowledgeMins += (log.knowledge?.shariDuration || 0) + (log.knowledge?.readingDuration || 0);
      }
    });

    // رتبة الأسبوع
    const targetWeekly = targetScore * 7;
    const progressRate = targetWeekly > 0 ? Math.min(100, Math.round((totalScore / targetWeekly) * 100)) : 0;
    
    let rankTitle = 'عابد مجاهد 🌿';
    let rankBadge = 'بداية طيبة وخطى ثابتة';
    if (progressRate >= 90 || totalScore >= 20000) {
      rankTitle = 'من السابقين بالخيرات 👑';
      rankBadge = 'همّة تعانق الثريا وثبات رباني';
    } else if (progressRate >= 70 || totalScore >= 12000) {
      rankTitle = 'أهل المحافظة والإحسان 🌟';
      rankBadge = 'استقامة مباركة ونور مستمر';
    } else if (progressRate >= 45 || totalScore >= 7000) {
      rankTitle = 'صاحب الإقبال والهمّة 🌙';
      rankBadge = 'سعي متواصل في دروب الطاعة';
    }

    return {
      dateRangeStr,
      totalScore,
      progressRate,
      prayersPerformed,
      congregationPrayers,
      fajrPrayers,
      quranRubs,
      quranPages,
      qiyamMins,
      duhaMins,
      fastingDays,
      totalDhikr,
      morningAthkarCount,
      eveningAthkarCount,
      knowledgeMins,
      streakDays,
      rankTitle,
      rankBadge
    };
  }, [logs, weights, targetScore]);

  if (!isOpen) return null;

  // تنزيل كصورة
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: theme === 'ivory' ? '#fdfbf7' : '#030712'
      });
      const link = document.createElement('a');
      link.download = `mizan-weekly-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = dataUrl;
      link.click();
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 }
      });
    } catch (err) {
      console.error('Error generating image', err);
    } finally {
      setIsExporting(false);
    }
  };

  // مشاركة عبر Web Share API
  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: theme === 'ivory' ? '#fdfbf7' : '#030712'
      });

      // تحويل dataUrl إلى Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `mizan-weekly.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'حصادي الإيماني الأسبوعي - تطبيق ميزان',
          text: `«وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ» ✨ حصيلة عبادتي للأسبوع عبر تطبيق ميزان.`
        });
      } else {
        // Fallback: تحميل الصورة مباشرة مع إشعار
        handleDownload();
      }
    } catch (err) {
      console.error('Share error:', err);
      handleDownload();
    } finally {
      setIsExporting(false);
    }
  };

  // نسخ النص للمحادثات
  const handleCopyText = () => {
    const nameStr = showName && user?.name ? `أخوكم: ${user.name}` : 'عبدٌ من عباد الله';
    const text = `📊 *حصادي الإيماني الأسبوعي* (${stats.dateRangeStr})
🕊️ *${nameStr}*
───────────────
🏆 *الرتبة الإيمانية:* ${stats.rankTitle} (${stats.rankBadge})
💎 *مجموع النقاط:* ${stats.totalScore.toLocaleString('ar-SA')} نقطة (${stats.progressRate}٪ من الهدف)

🕌 *الفرائض والسنن:*
• الصلوات الخمس: ${stats.prayersPerformed} من ٣٥ فريضة (${stats.congregationPrayers} جماعة)
• صلاة الفجر: ${stats.fajrPrayers} أيام في موعدها

📖 *القرآن والعلم:*
• القرآن الكريم: ${stats.quranPages > 0 ? `${stats.quranPages} صفحة` : `${stats.quranRubs} رُبعاً`}
• طلب العلم والقراءة: ${stats.knowledgeMins} دقيقة

🌙 *النوافل والأذكار:*
• قيام الليل والوتر: ${stats.qiyamMins} دقيقة
• الاستغفار والتسبيح: ${stats.totalDhikr.toLocaleString('ar-SA')} ذكراً
• أذكار الصباح والمساء: ${stats.morningAthkarCount + stats.eveningAthkarCount} وِرداً
${stats.fastingDays > 0 ? `• الصيام: ${stats.fastingDays} أيام لله تعالى\n` : ''}
🔥 *التتابع الإيماني:* ${stats.streakDays} من ٧ أيام بفضل الله
───────────────
«وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ»
📱 تم التوليد عبر تطبيق *ميزان العابدين*`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-4 sm:p-6 my-auto text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black header-font text-white">بطاقة الإنجاز الأسبوعي للمشاركة</h2>
              <p className="text-[10px] text-slate-400 font-bold">شارك إنجازك للتشجيع والتنافس في الخير</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Options Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 mb-4 text-xs font-bold">
          {/* Themes */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              السمة:
            </span>
            <button
              onClick={() => setTheme('emerald')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                theme === 'emerald' 
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              الزمردي 🌿
            </button>
            <button
              onClick={() => setTheme('midnight')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                theme === 'midnight' 
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              الليلي 🌌
            </button>
            <button
              onClick={() => setTheme('ivory')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                theme === 'ivory' 
                  ? 'bg-amber-100 text-amber-950 shadow-sm ring-1 ring-amber-300' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              العاجي 📜
            </button>
          </div>

          {/* Privacy Toggle */}
          <button
            onClick={() => setShowName(!showName)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] transition-colors"
            title="إخفاء الاسم لإخلاص النية وحفظ الخصوصية"
          >
            {showName ? (
              <>
                <Eye className="w-3 h-3 text-emerald-400" />
                <span>إظهار الاسم</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3 text-amber-400" />
                <span>إخفاء الاسم (ستر)</span>
              </>
            )}
          </button>
        </div>

        {/* The Shareable Visual Card Container */}
        <div className="overflow-x-auto flex justify-center py-1">
          <div
            ref={cardRef}
            className={`w-full max-w-[420px] rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden border transition-all duration-300 select-none ${
              theme === 'emerald'
                ? 'bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-950 text-white border-emerald-500/30'
                : theme === 'midnight'
                  ? 'bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white border-indigo-500/30'
                  : 'bg-gradient-to-b from-amber-50/90 via-white to-emerald-50/90 text-slate-900 border-amber-300/60 shadow-amber-900/10'
            }`}
            style={{ minHeight: '520px' }}
          >
            {/* Subtle Islamic Geometry Decorative Background */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Decorative Glows */}
            <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-20 ${
              theme === 'emerald' ? 'bg-emerald-400' : theme === 'midnight' ? 'bg-indigo-400' : 'bg-amber-400'
            }`}></div>
            <div className={`absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-20 ${
              theme === 'emerald' ? 'bg-amber-400' : theme === 'midnight' ? 'bg-purple-400' : 'bg-emerald-400'
            }`}></div>

            {/* Card Header: App Name & Dates */}
            <div className="relative z-10 flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-2xl border ${
                  theme === 'ivory' 
                    ? 'bg-emerald-600 text-white border-emerald-500' 
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-black header-font ${theme === 'ivory' ? 'text-slate-900' : 'text-white'}`}>
                    مِيزَانُ العَابِدِين
                  </h3>
                  <p className={`text-[9px] font-bold ${theme === 'ivory' ? 'text-slate-500' : 'text-slate-400'}`}>
                    حصاد الأسبوع الإيماني
                  </p>
                </div>
              </div>

              <div className="text-left">
                <div className={`inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border ${
                  theme === 'ivory'
                    ? 'bg-amber-100/80 text-amber-900 border-amber-200'
                    : 'bg-white/10 text-amber-300 border-white/10'
                }`}>
                  <Calendar className="w-3 h-3" />
                  <span>{stats.dateRangeStr}</span>
                </div>
                {showName && user?.name && (
                  <p className={`text-[10px] font-black mt-1 ${theme === 'ivory' ? 'text-emerald-800' : 'text-emerald-300'}`}>
                    {user.name}
                  </p>
                )}
              </div>
            </div>

            {/* Spiritual Rank Banner */}
            <div className={`relative z-10 p-3.5 rounded-2xl border mb-4 text-center ${
              theme === 'emerald'
                ? 'bg-gradient-to-r from-emerald-900/60 to-amber-900/60 border-amber-500/30'
                : theme === 'midnight'
                  ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-indigo-500/30'
                  : 'bg-gradient-to-r from-amber-100 to-emerald-100 border-amber-300/80 text-slate-800'
            }`}>
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  theme === 'ivory' ? 'text-amber-800' : 'text-amber-300'
                }`}>
                  الرتبة الإيمانية للأسبوع
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h4 className={`text-base font-black header-font ${theme === 'ivory' ? 'text-slate-900' : 'text-white'}`}>
                {stats.rankTitle}
              </h4>
              <p className={`text-[9px] font-bold mt-0.5 ${theme === 'ivory' ? 'text-slate-600' : 'text-slate-300'}`}>
                {stats.rankBadge}
              </p>
            </div>

            {/* Main Score & Streak Overview */}
            <div className="relative z-10 grid grid-cols-2 gap-2.5 mb-4">
              <div className={`p-3.5 rounded-2xl border text-center ${
                theme === 'ivory' 
                  ? 'bg-white border-slate-200' 
                  : 'bg-white/5 border-white/10'
              }`}>
                <span className={`text-[10px] font-bold block ${theme === 'ivory' ? 'text-slate-500' : 'text-slate-400'}`}>
                  الرصيد الإيماني الأسبوعي
                </span>
                <span className={`text-2xl font-black font-mono block my-0.5 ${
                  theme === 'ivory' ? 'text-emerald-700' : 'text-emerald-400'
                }`}>
                  {stats.totalScore.toLocaleString('ar-SA')}
                </span>
                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full inline-block ${
                  theme === 'ivory' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {stats.progressRate}٪ من المستهدف
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center ${
                theme === 'ivory' 
                  ? 'bg-white border-slate-200' 
                  : 'bg-white/5 border-white/10'
              }`}>
                <span className={`text-[10px] font-bold block ${theme === 'ivory' ? 'text-slate-500' : 'text-slate-400'}`}>
                  التتابع الإيماني المتصل
                </span>
                <div className="flex items-center justify-center gap-1 my-0.5">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span className={`text-2xl font-black font-mono ${theme === 'ivory' ? 'text-amber-700' : 'text-amber-400'}`}>
                    {stats.streakDays} / ٧
                  </span>
                </div>
                <span className={`text-[9px] font-bold block ${theme === 'ivory' ? 'text-slate-500' : 'text-slate-400'}`}>
                  أيام معمورة بالطاعة
                </span>
              </div>
            </div>

            {/* Detailed Spiritual Metrics Grid */}
            <div className="relative z-10 grid grid-cols-2 gap-2 mb-4 text-xs font-bold">
              {/* Prayers */}
              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                theme === 'ivory' ? 'bg-white/80 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <div className={`p-2 rounded-xl ${theme === 'ivory' ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400'}`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-[9px] block ${theme === 'ivory' ? 'text-slate-500' : 'text-slate-400'}`}>الصلوات الخمس</span>
                  <span className={`text-xs font-black font-mono ${theme === 'ivory' ? 'text-slate-800' : 'text-white'}`}>
                    {stats.prayersPerformed} / ٣٥ صلاة
                  </span>
                  <span className={`text-[8px] block ${theme === 'ivory' ? 'text-blue-700' : 'text-blue-300'}`}>
                    ({stats.congregationPrayers} جماعة)
                  </span>
                </div>
              </div>

              {/* Quran */}
              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                theme === 'ivory' ? 'bg-white/80 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <div className={`p-2 rounded-xl ${theme === 'ivory' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-[9px] block ${theme === 'ivory' ? 'text-slate-500' : 'text-slate-400'}`}>القرآن الكريم</span>
                  <span className={`text-xs font-black font-mono ${theme === 'ivory' ? 'text-slate-800' : 'text-white'}`}>
                    {stats.quranPages > 0 ? `${stats.quranPages} صفحة` : `${stats.quranRubs} رُبعاً`}
                  </span>
                  <span className={`text-[8px] block ${theme === 'ivory' ? 'text-emerald-700' : 'text-emerald-300'}`}>
                    تلاوة وتدبر
                  </span>
                </div>
              </div>

              {/* Qiyam & Nawafil */}
              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                theme === 'ivory' ? 'bg-white/80 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <div className={`p-2 rounded-xl ${theme === 'ivory' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-[9px] block ${theme === 'ivory' ? 'text-slate-500' : 'text-slate-400'}`}>القيام والوتر</span>
                  <span className={`text-xs font-black font-mono ${theme === 'ivory' ? 'text-slate-800' : 'text-white'}`}>
                    {stats.qiyamMins} دقيقة
                  </span>
                  <span className={`text-[8px] block ${theme === 'ivory' ? 'text-indigo-700' : 'text-indigo-300'}`}>
                    سحر واستغفار
                  </span>
                </div>
              </div>

              {/* Dhikr */}
              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                theme === 'ivory' ? 'bg-white/80 border-slate-200' : 'bg-white/5 border-white/10'
              }`}>
                <div className={`p-2 rounded-xl ${theme === 'ivory' ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-400'}`}>
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-[9px] block ${theme === 'ivory' ? 'text-slate-500' : 'text-slate-400'}`}>الأذكار والتسبيح</span>
                  <span className={`text-xs font-black font-mono ${theme === 'ivory' ? 'text-slate-800' : 'text-white'}`}>
                    {stats.totalDhikr.toLocaleString('ar-SA')} ذكراً
                  </span>
                  <span className={`text-[8px] block ${theme === 'ivory' ? 'text-amber-700' : 'text-amber-300'}`}>
                    +{stats.morningAthkarCount + stats.eveningAthkarCount} وِرد تحصين
                  </span>
                </div>
              </div>
            </div>

            {/* Motivational Quranic Ayah */}
            <div className={`relative z-10 p-3 rounded-2xl text-center border ${
              theme === 'ivory' 
                ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
                : 'bg-white/5 border-white/5 text-amber-200/90'
            }`}>
              <p className="text-[10px] leading-relaxed font-bold font-serif">
                «وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ»
              </p>
              <span className="text-[8px] opacity-70 block mt-0.5">
                تطبيق ميزان العابدين — تثبيت الطاعة وترقية الإيمان
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-2">
          {/* Download Image */}
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs header-font shadow-lg shadow-emerald-950/40 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'جاري التوليد...' : 'تحميل كصورة (PNG)'}</span>
          </button>

          {/* Share Directly */}
          <button
            onClick={handleShare}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-bold text-xs header-font shadow-lg shadow-amber-950/40 transition-all active:scale-95 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة البطاقة</span>
          </button>

          {/* Copy Text Summary */}
          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold text-xs header-font border border-slate-700 transition-all active:scale-95"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">تم نسخ النص!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>نسخ ملخص للأهل</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
