
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Target, 
  Sparkles, 
  Edit2, 
  Check, 
  X, 
  Activity, 
  History, 
  Award, 
  Sun, 
  Lock, 
  Home, 
  Key, 
  Coins, 
  Heart, 
  CloudMoon, 
  CheckCircle2,
  BookMarked,
  ChevronLeft,
  Smartphone,
  Download,
  Share,
  Info,
  Smile,
  Meh,
  Frown,
  Ghost,
  CloudSun,
  BookOpen,
  Shield
} from 'lucide-react';
import { XAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine, YAxis } from 'recharts';
import { format, addDays } from 'date-fns';
// Fix: Use arSA instead of ar to avoid export errors in some date-fns environments
import { arSA as ar } from 'date-fns/locale';
import { DailyLog, AppWeights, PrayerName, PrayerEntry, Book, User } from '../types';
import { calculateTotalScore } from '../utils/scoring';
import confetti from 'canvas-confetti';
import { NextPrayerWidget } from './NextPrayerWidget';
import { WeeklyCardModal } from './WeeklyCardModal';
import { DAILY_TADABBUR_SEEDS } from '../utils/quranData';

interface DashboardProps {
  log: DailyLog;
  logs: Record<string, DailyLog>;
  weights: AppWeights;
  onDateChange: (date: string) => void;
  targetScore: number;
  onTargetChange: (score: number) => void;
  onOpenSettings: () => void;
  books: Book[];
  onUpdateBook: (book: Book, pagesReadToday: number) => void;
  onSwitchTab: (tab: any) => void;
  installPrompt: any;
  onClearInstallPrompt: () => void;
  onUpdateLog: (log: DailyLog) => void;
  user?: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  log, logs, weights, onDateChange, targetScore, onTargetChange, onOpenSettings,
  books, onUpdateBook, onSwitchTab, installPrompt, onClearInstallPrompt, onUpdateLog, user
}) => {
  const [showWeeklyCard, setShowWeeklyCard] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetScore.toString());
  const [readingInput, setReadingInput] = useState('');
  const [showiOSInstructions, setShowiOSInstructions] = useState(false);
  
  // حفظ ومزامنة ساعات تسجيل العبادات لتقديم جراف إيماني ديناميكي معبر
  const [worshipHours, setWorshipHours] = useState<Record<string, Record<string, number>>>(() => {
    try {
      const saved = localStorage.getItem('worship_log_times');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const activeFortyChallenge = useMemo(() => {
    try {
      const saved = localStorage.getItem('worship_forty_challenges_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.find((c: any) => !c.isCompleted) || parsed[0] || null;
      }
    } catch (e) {}
    return null;
  }, []);

  const todayTadabburSeed = useMemo(() => {
    const day = new Date().getDate();
    return DAILY_TADABBUR_SEEDS[day % DAILY_TADABBUR_SEEDS.length];
  }, []);

  const fortressOverview = useMemo(() => {
    const prayers = log?.prayers || {};
    const fardCount = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter(k => prayers[k]?.performed).length;
    
    const athkar = log?.athkar || { checklists: { morning: false, evening: false, sleep: false, travel: false }, counters: {} };
    let athkarScore = 0;
    if (athkar.checklists?.morning) athkarScore += 35;
    if (athkar.checklists?.evening) athkarScore += 35;
    if (athkar.checklists?.sleep) athkarScore += 20;
    const counters = Object.values(athkar.counters || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    if (counters > 0) athkarScore += 10;
    const athkarPercent = Math.min(100, athkarScore);

    const nawafil = log?.nawafil || { duhaDuration: 0, qiyamDuration: 0, witrDuration: 0, fasting: false };
    const hasNawafil = (nawafil.duhaDuration || 0) > 0 || (nawafil.qiyamDuration || 0) > 0 || (log?.customSunnahIds?.length || 0) > 0 || !!nawafil.fasting;

    const hasQuran = (log?.quran?.readPages?.length || 0) > 0 || (log?.quran?.hifzRub || 0) > 0 || (log?.tadabburNotes?.length || 0) > 0;

    let totalScore = Math.round((fardCount / 5) * 50 + (athkarPercent / 100) * 25 + (hasNawafil ? 15 : 0) + (hasQuran ? 10 : 0));
    totalScore = Math.min(100, totalScore);

    let rank = 'بنيان في طور التأسيس';
    if (totalScore >= 90) rank = 'حصن الصدّيقين المنيع 🏰';
    else if (totalScore >= 70) rank = 'قلعة الأبرار المحصّنة 🛡️';
    else if (totalScore >= 45) rank = 'صرح المجاهدة والارتقاء 🏛️';

    return { fardCount, athkarPercent, hasNawafil, hasQuran, totalScore, rank };
  }, [log]);

  // مراقبة وحفظ توقيت تسجيل العبادات التفاعلية المخصصة لرفع الايمان بدقة في ساعة التسجيل الفعلي
  useEffect(() => {
    if (!log) return;
    const dateStr = log.date;
    const now = new Date();
    const isToday = dateStr === format(now, 'yyyy-MM-dd');
    const currentHour = now.getHours();

    let updated = false;
    const times = { ...worshipHours };
    if (!times[dateStr]) {
      times[dateStr] = {};
    }

    const dayTimes = { ...times[dateStr] };

    // 1. ورد القرآن الكريم
    const hasQuranVal = (log.quran.revisionRub || 0) > 0 || (log.quran.hifzRub || 0) > 0;
    if (hasQuranVal && dayTimes['quran'] === undefined) {
      dayTimes['quran'] = isToday ? currentHour : 15;
      updated = true;
    } else if (!hasQuranVal && dayTimes['quran'] !== undefined) {
      delete dayTimes['quran'];
      updated = true;
    }

    // 2. الأذكار المطلقة العدادات
    const hasAbsoluteAthkarVal = Object.values(log.athkar.counters || {}).some(val => val > 0);
    if (hasAbsoluteAthkarVal && dayTimes['absolute_athkar'] === undefined) {
      dayTimes['absolute_athkar'] = isToday ? currentHour : 11;
      updated = true;
    } else if (!hasAbsoluteAthkarVal && dayTimes['absolute_athkar'] !== undefined) {
      delete dayTimes['absolute_athkar'];
      updated = true;
    }

    // 3. أوراد طلب العلم والقراءة
    const hasKnowledgeVal = (log.knowledge.shariDuration || 0) > 0 || (log.knowledge.readingDuration || 0) > 0;
    if (hasKnowledgeVal && dayTimes['knowledge'] === undefined) {
      dayTimes['knowledge'] = isToday ? currentHour : 16;
      updated = true;
    } else if (!hasKnowledgeVal && dayTimes['knowledge'] !== undefined) {
      delete dayTimes['knowledge'];
      updated = true;
    }

    // 4. الأعمال والسنن المخصصة
    const hasCustomActionsVal = (log.customSunnahIds || []).length > 0 || (log.nawafil.custom || []).some(c => c.value > 0);
    if (hasCustomActionsVal && dayTimes['custom'] === undefined) {
      dayTimes['custom'] = isToday ? currentHour : 10;
      updated = true;
    } else if (!hasCustomActionsVal && dayTimes['custom'] !== undefined) {
      delete dayTimes['custom'];
      updated = true;
    }

    if (updated) {
      times[dateStr] = dayTimes;
      setWorshipHours(times);
      localStorage.setItem('worship_log_times', JSON.stringify(times));
    }
  }, [log, worshipHours]);
  
  const isFirstRender = useRef(true);
  const prevBadgesActiveState = useRef<Record<string, boolean>>({});

  const currentTotalScore = calculateTotalScore(log, weights);
  const progressPercent = (currentTotalScore / targetScore) * 100;

  const activeBook = useMemo(() => books.find(b => !b.isFinished), [books]);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
  
  const handleUpdateReading = () => {
    if (!activeBook || !readingInput) return;
    const pages = parseInt(readingInput);
    if (isNaN(pages) || pages <= 0) return;
    onUpdateBook(activeBook, pages);
    setReadingInput('');
    confetti({ 
      particleCount: 100, 
      spread: 70, 
      origin: { y: 0.8 },
      colors: ['#10b981', '#34d399']
    });
  };

  const handleUpdateMood = (mood: number) => {
    onUpdateLog({ ...log, mood });
    if (mood >= 4) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.9 } });
    }
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowiOSInstructions(true);
      return;
    }
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      onClearInstallPrompt();
      confetti({ particleCount: 150, spread: 90 });
    }
  };

  const handleSaveTarget = () => {
    const val = parseInt(tempTarget);
    if (!isNaN(val) && val > 0) {
      onTargetChange(val);
      setIsEditingTarget(false);
    }
  };

  const badges = useMemo(() => {
    const rawatibIds = ['fajr_pre', 'dhuhr_pre', 'dhuhr_post', 'maghrib_post', 'isha_post'];
    const allUserSunnahs = (Object.values(log.prayers) as PrayerEntry[]).flatMap(p => p.surroundingSunnahIds || []);
    const fullRawatibDone = rawatibIds.every(id => allUserSunnahs.includes(id));
    
    return [
      { id: 'rawatib', title: 'بيت في الجنة', desc: 'من صلى ثنتي عشرة ركعة..', icon: <Home className="w-6 h-6" />, active: fullRawatibDone, color: 'from-emerald-400 to-emerald-600' },
      { id: 'fajr', title: 'بشرى الرؤية', desc: 'تستحق رؤية الله في الآخرة', icon: <Sun className="w-6 h-6" />, active: log.prayers[PrayerName.FAJR]?.performed, color: 'from-orange-400 to-orange-500' },
      { id: 'istighfar', title: 'مفتاح الرزق', desc: 'فقلت استغفروا ربكم.. يرسل السماء', icon: <Coins className="w-6 h-6" />, active: log.athkar.counters.istighfar > 0, color: 'from-blue-400 to-blue-600' },
      { id: 'fasting', title: 'بعيد عن النار', desc: 'باعد الله وجهه عن النار ٧٠ خريفاً', icon: <Flame className="w-6 h-6" />, active: log.nawafil.fasting, color: 'from-rose-400 to-rose-600' },
      { id: 'hawqalah', title: 'مفتاح النجاح', desc: 'لا حول ولا قوة إلا بالله كنز الجنة', icon: <Key className="w-6 h-6" />, active: log.athkar.counters.hawqalah > 0, color: 'from-indigo-400 to-indigo-600' },
      { id: 'salawat', title: 'مفتاح القرب', desc: 'أقربكم مني مجلساً أكثركم صلاة علي', icon: <Heart className="w-6 h-6" />, active: log.athkar.counters.salawat > 0, color: 'from-pink-400 to-pink-600' },
    ];
  }, [log]);

  useEffect(() => {
    if (isFirstRender.current) {
      badges.forEach(badge => { prevBadgesActiveState.current[badge.id] = !!badge.active; });
      isFirstRender.current = false;
      return;
    }
    let triggered = false;
    badges.forEach(badge => {
      if (badge.active && !prevBadgesActiveState.current[badge.id]) triggered = true;
      prevBadgesActiveState.current[badge.id] = !!badge.active;
    });
    if (triggered) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#fbbf24', '#3b82f6', '#f43f5e', '#a855f7'], zIndex: 9999 });
    }
  }, [badges]);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dateObj = addDays(new Date(), -i);
      const d = format(dateObj, 'yyyy-MM-dd');
      const l = logs[d];
      return { 
        date: format(dateObj, 'EEE', { locale: ar }), 
        score: l ? calculateTotalScore(l, weights) : 0,
        target: targetScore
      };
    }).reverse();
  }, [logs, weights, targetScore]);

  // دالة حساب منحنى الإيمان التفاعلي على مدار اليوم (24 ساعة) ساعة بساعة تبدأ من 5 صباحاً
  const intradayFaithData = useMemo(() => {
    const prayers = log.prayers;
    const athkar = log.athkar;
    const quran = log.quran;
    const nawafil = log.nawafil;
    const mood = log.mood || 3;

    const isFajr = prayers[PrayerName.FAJR]?.performed;
    const isFajrCong = prayers[PrayerName.FAJR]?.inCongregation;
    const isDhuhr = prayers[PrayerName.DHUHR]?.performed;
    const isDhuhrCong = prayers[PrayerName.DHUHR]?.inCongregation;
    const isAsr = prayers[PrayerName.ASR]?.performed;
    const isAsrCong = prayers[PrayerName.ASR]?.inCongregation;
    const isMaghrib = prayers[PrayerName.MAGHRIB]?.performed;
    const isMaghribCong = prayers[PrayerName.MAGHRIB]?.inCongregation;
    const isIsha = prayers[PrayerName.ISHA]?.performed;
    const isIshaCong = prayers[PrayerName.ISHA]?.inCongregation;

    const isMorningAthkar = athkar.checklists.morning;
    const isEveningAthkar = athkar.checklists.evening;
    const isSleepAthkar = athkar.checklists.sleep;

    const hasQuran = (quran.revisionRub || 0) > 0 || (quran.hifzRub || 0) > 0;
    const hasDuha = (nawafil.duhaDuration || 0) > 0;
    const hasQiyam = (nawafil.qiyamDuration || 0) > 0;
    const hasWitr = (nawafil.witrDuration || 0) > 0;

    const detailedData = athkar.completedDetailedAthkar || {};

    // جلب أوقات التسجيل الفعلية لكل عبادة عبر سجل الساعات المسجلة محلياً
    const dayTimes = worshipHours[log.date] || {};
    const quranHour = dayTimes['quran'] !== undefined ? dayTimes['quran'] : (log.date === format(new Date(), 'yyyy-MM-dd') ? new Date().getHours() : 15);
    const athkarHour = dayTimes['absolute_athkar'] !== undefined ? dayTimes['absolute_athkar'] : (log.date === format(new Date(), 'yyyy-MM-dd') ? new Date().getHours() : 11);
    const knowledgeHour = dayTimes['knowledge'] !== undefined ? dayTimes['knowledge'] : (log.date === format(new Date(), 'yyyy-MM-dd') ? new Date().getHours() : 16);
    const customHour = dayTimes['custom'] !== undefined ? dayTimes['custom'] : (log.date === format(new Date(), 'yyyy-MM-dd') ? new Date().getHours() : 10);

    // دالة تحديد ترتيب الساعات في اليوم بحيث تبدأ من 5 صباحاً كأول ساعة (index 0)
    const getHourOrder = (h: number) => {
      return (h - 5 + 24) % 24;
    };

    // نحدد العبادات المنجزة والوقت الفعلي أو التقديري لأدائها والوزن المضاف لكل منها
    interface FaithActivity {
      id: string;
      hour: number;
      weight: number;
    }

    const activities: FaithActivity[] = [];

    // 1. صلاة الفجر
    if (isFajr) {
      activities.push({ id: 'fajr', hour: 5, weight: isFajrCong ? 20 : 15 });
    }
    // 2. أذكار الصباح
    const hasMorningAthkar = isMorningAthkar || Object.keys(detailedData).some(k => k.startsWith('m_') && detailedData[k] > 0);
    if (hasMorningAthkar) {
      activities.push({ id: 'morning_athkar', hour: Math.min(6, athkarHour), weight: 10 });
    }
    // 3. صلاة الضحى
    if (hasDuha) {
      activities.push({ id: 'duha', hour: 9, weight: 8 });
    }
    // 4. أوراد الأذكار المطلقة والعدادات
    const hasDhikrCounters = Object.values(athkar.counters || {}).some(val => val > 0);
    if (hasDhikrCounters) {
      activities.push({ id: 'dhikr', hour: customHour, weight: 8 });
    }
    // 5. صلاة الظهر
    if (isDhuhr) {
      activities.push({ id: 'dhuhr', hour: 12, weight: isDhuhrCong ? 15 : 12 });
    }
    // 6. ورد القرآن الكريم
    if (hasQuran) {
      activities.push({ id: 'quran', hour: quranHour, weight: 15 });
    }
    // 7. صلاة العصر
    if (isAsr) {
      activities.push({ id: 'asr', hour: 15, weight: isAsrCong ? 15 : 12 });
    }
    // 8. أوراد العلم والقراءة
    const hasKnowledge = (log.knowledge.shariDuration || 0) > 0 || (log.knowledge.readingDuration || 0) > 0;
    if (hasKnowledge) {
      activities.push({ id: 'knowledge', hour: knowledgeHour, weight: 10 });
    }
    // 9. أذكار المساء
    const hasEveningAthkar = isEveningAthkar || Object.keys(detailedData).some(k => k.startsWith('e_') && detailedData[k] > 0);
    if (hasEveningAthkar) {
      activities.push({ id: 'evening_athkar', hour: Math.max(17, athkarHour), weight: 10 });
    }
    // 10. صلاة المغرب
    if (isMaghrib) {
      activities.push({ id: 'maghrib', hour: 18, weight: isMaghribCong ? 15 : 12 });
    }
    // 11. صلاة العشاء
    if (isIsha) {
      activities.push({ id: 'isha', hour: 20, weight: isIshaCong ? 15 : 12 });
    }
    // 12. صلاة الوتر
    if (hasWitr) {
      activities.push({ id: 'witr', hour: 21, weight: 8 });
    }
    // 13. قيام الليل
    if (hasQiyam) {
      activities.push({ id: 'qiyam', hour: 22, weight: 12 });
    }
    // 14. أذكار النوم
    if (isSleepAthkar) {
      activities.push({ id: 'sleep', hour: 23, weight: 5 });
    }

    // بناء مصفوفة الساعات الـ 24 ساعة بساعة بدءاً من 5 صباحاً
    const hoursToMap = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4];

    return hoursToMap.map((hour) => {
      // الاسكور التلقائي يبدأ من صفر
      let level = 0;

      // حساب مجموع الأوزان للعبادات التي تم إنهاؤها عند أو قبل هذه الساعة (بناءً على ترتيب اليوم من 5 صباحاً)
      const currentHourOrder = getHourOrder(hour);
      activities.forEach((act) => {
        if (getHourOrder(act.hour) <= currentHourOrder) {
          level += act.weight;
        }
      });

      // إضافة أثر الحالة القلبية (التعديل المزاجي على السكينة)
      level += (mood - 3) * 4;

      // ضبط الحدود الدنيا والقصوى (0 إلى 100) بدقة
      level = Math.max(0, Math.min(100, level));

      // صياغة اللفظ الإرشادي للقلب
      let description = 'حالة قلبية في طور الاستعداد وشحذ الهمة للذكر والتعبد.';
      
      const formatHourLabel = (h: number) => {
        if (h === 0) return '12:00 ص';
        if (h === 12) return '12:00 م';
        return h > 12 ? `${h - 12}:00 م` : `${h}:00 ص`;
      };

      if (level >= 85) {
        description = 'إيمان مشعّ غامر بالسكينة والخشوع المتصل 🌟';
      } else if (level >= 70) {
        description = 'طاعة حاضرة ونور قلبي منشرح بحمد الله 🌿';
      } else if (level >= 50) {
        description = 'سعي صالح ونشاط قلبي معتدل مفعم بالحيوية ✨';
      } else if (level >= 30) {
        description = 'بداية تذوق حلاوة العبادة وإشراق بوارق السلام 💪';
      } else if (level > 0) {
        description = 'خطوات أولى مباركة، استمر لتشعر بتدفق الطمأنينة الكاملة 🚀';
      }

      return {
        hour: formatHourLabel(hour),
        level,
        description
      };
    });
  }, [log, worshipHours]);

  // مكوّن مخصص لعرض البيانات داخل نافذة منبثقة عند التفاعل مع الرسم البياني لليوم
  const CustomFaithTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-white/10 shadow-2xl space-y-1.5 font-sans text-right max-w-xs" dir="rtl">
          <p className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">الساعة {data.hour}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-300">مستوى الإيمان والسكينة:</span>
            <span className="text-xs font-black text-white font-mono">{data.level}%</span>
          </div>
          <p className="text-[10px] font-bold text-emerald-50 leading-relaxed bg-white/5 p-2 rounded-xl border border-white/5">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  const moodConfig = [
    { value: 1, label: 'ضيق', icon: <Ghost className="w-5 h-5" />, color: 'text-slate-400', bg: 'bg-slate-50' },
    { value: 2, label: 'قلق', icon: <Frown className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-50' },
    { value: 3, label: 'عادي', icon: <Meh className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: 4, label: 'منشرح', icon: <Smile className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { value: 5, label: 'سكينة', icon: <CloudSun className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      
      {/* بطاقة تثبيت التطبيق */}
      {(installPrompt || (isIOS && !isStandalone)) && (
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-5 shadow-sm animate-bounce-slow flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-200 rounded-2xl"><Smartphone className="w-6 h-6 text-amber-700" /></div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 header-font leading-tight">ثبّت التطبيق الآن</h4>
              <p className="text-[10px] text-amber-700 font-bold header-font">لسهولة الوصول وتجربة أسرع 🌙</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleInstallClick} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-black text-xs header-font shadow-md active:scale-95 transition-all">{isIOS ? 'كيفية التثبيت' : 'تثبيت'} <Download className="w-3.5 h-3.5" /></button>
            <button onClick={onClearInstallPrompt} className="p-1 text-amber-400 hover:text-amber-600"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* 1. مواقيت الصلاة القادمة والعد التنازلي */}
      <NextPrayerWidget />

      {/* قلعة الإيمان وبنيان اليوم الحي */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden border border-emerald-500/30">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-amber-400 shadow-inner">
                <Shield className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    بنيان الإيمان الحي
                  </span>
                  <span className="text-[11px] font-bold text-amber-300 font-mono">
                    {fortressOverview.totalScore}% اكتمال
                  </span>
                </div>
                <h3 className="text-base font-black header-font leading-tight text-white mt-1">
                  {fortressOverview.rank}
                </h3>
              </div>
            </div>

            <button
              onClick={() => onSwitchTab('fortress')}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl font-black text-xs header-font shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <span>محراب القلعة</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* شريط التحصين المصغر والعناصر الأربعة */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <p className="text-[9px] text-slate-300 font-bold">أبراج الفرائض</p>
              <p className="text-xs font-black text-amber-300 font-mono mt-0.5">
                {fortressOverview.fardCount} / 5
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <p className="text-[9px] text-slate-300 font-bold">درع الأذكار</p>
              <p className="text-xs font-black text-emerald-300 font-mono mt-0.5">
                {fortressOverview.athkarPercent}%
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <p className="text-[9px] text-slate-300 font-bold">شرفة النوافل</p>
              <p className="text-xs font-black text-sky-300 font-mono mt-0.5">
                {fortressOverview.hasNawafil ? 'مضاءة ✨' : 'بانتظارك'}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <p className="text-[9px] text-slate-300 font-bold">مشكاة القرآن</p>
              <p className="text-xs font-black text-purple-300 font-mono mt-0.5">
                {fortressOverview.hasQuran ? 'عامرة 📖' : 'بانتظارك'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 1.1. بطاقة أذكار اليوم التفاعلية */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 text-white rounded-[2rem] p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full opacity-30 translate-x-12 -translate-y-12 blur-2xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shrink-0">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black header-font leading-tight">الأذكار والتحصين التفاعلي 🌅 🌃 🛌</h3>
              <p className="text-[10px] text-emerald-200 mt-1 font-bold leading-relaxed">
                اضغط لقراءة أذكار الصباح والمساء والنوم. تحكّم بالعداد بلمسة مع تغذية ونقاط فوريّة للرصيد الروحي!
              </p>
            </div>
          </div>
          <button 
            onClick={() => onSwitchTab('athkar')} 
            className="w-full sm:w-auto px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 rounded-xl font-black text-xs header-font shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            ابدأ القراءة
          </button>
        </div>
      </div>

      {/* تحدي الأربعين يوماً */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-emerald-900 text-white rounded-[2rem] p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full opacity-30 -translate-x-12 -translate-y-12 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shrink-0">
              <Target className="w-6 h-6 text-amber-300" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  تحدي الأربعين
                </span>
                {activeFortyChallenge && (
                  <span className="text-[10px] font-bold text-amber-200 font-mono">
                    {activeFortyChallenge.completedDays?.length || 0} / 40 يوماً
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black header-font leading-tight">
                {activeFortyChallenge ? activeFortyChallenge.habitTitle : 'التزم بعادة 40 يوماً متواصلة'}
              </h3>
              <p className="text-[10px] text-amber-100/80 font-bold leading-relaxed">
                {activeFortyChallenge 
                  ? `أنجزت ${Math.min(100, Math.round(((activeFortyChallenge.completedDays?.length || 0) / 40) * 100))}% من التحدي. اضغط لمتابعة الأيام وتسجيل إنجاز اليوم!`
                  : '«كتبت له براءتان: براءة من النار، وبراءة من النفاق» — رسخ طاعتك لتصبح سجية.'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onSwitchTab('forty')} 
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs header-font shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            {activeFortyChallenge ? 'متابعة التحدي' : 'ابدأ التحدي الآن'}
          </button>
        </div>
      </div>

      {/* قبس وتدبر اليوم القرآني */}
      {todayTadabburSeed && (
        <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white rounded-[2rem] p-5 sm:p-6 shadow-md border border-emerald-500/20 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-black text-emerald-300 uppercase block tracking-wider">
                  Quran Tadabbur • قبس اليوم
                </span>
                <h4 className="text-xs font-black header-font text-white">
                  سورة {todayTadabburSeed.surahName} [الآية {todayTadabburSeed.ayahNumber}]
                </h4>
              </div>
            </div>

            <button 
              onClick={() => onSwitchTab('quran')}
              className="flex items-center gap-1.5 text-amber-300 hover:text-white font-bold text-xs header-font bg-white/10 hover:bg-emerald-600/60 px-3.5 py-1.5 rounded-xl border border-white/10 transition-all self-start sm:self-auto active:scale-95"
            >
              <span>محراب التدبر والتدوين</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 sm:p-4 border border-white/5 my-2">
            <p className="quran-font text-sm sm:text-base text-center leading-loose text-amber-100/95">
              ﴿ {todayTadabburSeed.ayahText} ﴾
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-emerald-200/80 pt-2 border-t border-white/10">
            <span className="font-bold text-slate-300 leading-relaxed">
              💡 {todayTadabburSeed.inspiration}
            </span>
            <span className="text-amber-300 font-bold shrink-0">
              🎯 {todayTadabburSeed.suggestedAction}
            </span>
          </div>
        </div>
      )}

      {/* 2. الهدف اليومي */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl"><Target className="w-5 h-5 text-emerald-500" /></div>
            <h3 className="font-bold text-slate-800 header-font text-sm">هدف اليوم</h3>
          </div>
          <div className="flex items-center gap-2">
            {isEditingTarget ? (
              <div className="flex items-center gap-1">
                <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)} className="w-20 px-2 py-1 bg-slate-50 border border-emerald-200 rounded-lg text-xs font-black text-center outline-none" autoFocus />
                <button onClick={handleSaveTarget} className="p-1.5 bg-emerald-500 text-white rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={() => setIsEditingTarget(false)} className="p-1.5 bg-slate-100 text-slate-400 rounded-lg"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <button onClick={() => { setIsEditingTarget(true); setTempTarget(targetScore.toString()); }} className="flex items-center gap-1.5 hover:bg-slate-50 p-1 px-2 rounded-lg transition-colors">
                <span className="text-xs font-black text-emerald-600 font-mono">{currentTotalScore.toLocaleString()} / {targetScore.toLocaleString()}</span>
                <Edit2 className="w-3 h-3 text-slate-300" />
              </button>
            )}
          </div>
        </div>
        <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden mb-2">
          <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
        </div>
        <p className="text-[10px] text-slate-400 font-bold text-center">لقد أنجزت {Math.round(progressPercent)}% من هدفك الروحي</p>
      </div>

      {/* 3. متابعة القراءة اليومية (تم تصغير المربع) */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl"><BookMarked className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 header-font leading-tight">متابعة القراءة</h3>
              <p className="text-[9px] text-slate-400 font-bold header-font">دوّن صفحاتك المقروءة</p>
            </div>
          </div>
          <button onClick={() => onSwitchTab('library')} className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] header-font hover:underline">المكتبة <ChevronLeft className="w-3 h-3" /></button>
        </div>
        {activeBook ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <h4 className="text-[11px] font-bold text-slate-700 truncate max-w-[150px]">{activeBook.title}</h4>
                <span className="text-[10px] font-black text-emerald-600 header-font">{Math.round((activeBook.currentPages / activeBook.totalPages) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(activeBook.currentPages / activeBook.totalPages) * 100}%` }}></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 rounded-xl p-1 border border-transparent focus-within:bg-white focus-within:border-emerald-100 transition-all">
                <input 
                  type="number" 
                  value={readingInput} 
                  onChange={(e) => setReadingInput(e.target.value)} 
                  placeholder="عدد الصفحات" 
                  className="w-full bg-transparent px-3 py-2 text-xs font-bold header-font outline-none text-center placeholder:text-slate-300" 
                />
              </div>
              <button onClick={handleUpdateReading} className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all shrink-0"><Check className="w-5 h-5 stroke-[3]" /></button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-2xl"><p className="text-[10px] text-slate-400 font-bold header-font">أضف كتاباً من المكتبة للبدء</p></div>
        )}
      </div>

      {/* 4. أوسمة الأبرار اليوم */}
      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6"><Award className="w-6 h-6 text-amber-500" /><h3 className="text-xl font-bold text-slate-800 header-font">أوسمة الأبرار اليوم</h3></div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {badges.map((badge) => (
            <div key={badge.id} className={`relative flex flex-col items-center text-center p-5 rounded-[1.8rem] transition-all duration-300 border ${badge.active ? `bg-gradient-to-br ${badge.color} text-white border-transparent shadow-md` : 'bg-white border-slate-50 grayscale opacity-40'}`}>
              {badge.active && <div className="absolute top-2 left-2 bg-white/20 p-1 rounded-full backdrop-blur-md"><CheckCircle2 className="w-3 h-3 text-white" /></div>}
              <div className={`p-3 rounded-2xl mb-3 ${badge.active ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-300'}`}>{badge.active ? badge.icon : <Lock className="w-5 h-5" />}</div>
              <h4 className="text-[12px] font-bold header-font mb-1 leading-tight">{badge.title}</h4>
              <p className={`text-[8px] font-bold leading-relaxed px-1 opacity-80`}>{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. مؤشر الطمأنينة القلبية (Mood Tracker) */}
      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-50 rounded-2xl"><CloudSun className="w-6 h-6 text-amber-600" /></div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 header-font">مؤشر الطمأنينة القلبية</h3>
            <p className="text-[10px] text-slate-400 font-bold header-font">كيف وجدت قلبك اليوم بعد أورادك؟</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center gap-2">
          {moodConfig.map((m) => (
            <button
              key={m.value}
              onClick={() => handleUpdateMood(m.value)}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${log.mood === m.value ? `${m.bg} border-${m.color.split('-')[1]}-200 shadow-sm scale-110` : 'bg-white border-slate-50 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
            >
              <div className={`${m.color} transition-transform duration-300 ${log.mood === m.value ? 'scale-125' : ''}`}>
                {m.icon}
              </div>
              <span className={`text-[9px] font-black header-font ${log.mood === m.value ? m.color : 'text-slate-400'}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* مخطط الحالة الإيمانية على مدار ساعات اليوم */}
      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 header-font">نبض طمأنينة الإيمان والسكينة</h3>
              <p className="text-[10px] text-slate-400 font-bold header-font">منحنًى بياني تفاعلي يمثل صعود وهبوط نشاط قلبك الإيماني على مدار اليوم</p>
            </div>
          </div>
          <div className="text-[9px] font-black text-emerald-600 bg-emerald-50/50 px-2.5 py-1.5 rounded-lg border border-emerald-100/50 self-start md:self-auto">
            تلقائي بنسبة 100٪ بناءً على توقيت عباداتك المسجلة
          </div>
        </div>

        <p className="text-[10px] text-emerald-600 bg-emerald-50/40 p-2.5 rounded-xl border border-dashed border-emerald-200/50 mb-3 font-bold leading-normal">
          👈 مرّر المخطط يميناً ويساراً لمتابعة خط التطور ساعة بساعة على مدار اليوم بالكامل!
        </p>

        <div className="overflow-x-auto w-full pb-2 select-none" dir="rtl">
          <div className="h-56 min-w-[850px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={intradayFaithData}>
              <defs>
                <linearGradient id="faithGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="hour" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700, fontFamily: 'Cairo' }} 
              />
              <YAxis domain={[0, 100]} hide />
              <Tooltip content={<CustomFaithTooltip />} />
              <Area 
                type="monotone" 
                dataKey="level" 
                stroke="#10b981" 
                fill="url(#faithGradient)" 
                strokeWidth={3} 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
        
        {/* دليل سريع لشرح المؤشر ودفع الهمّة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 border-t border-slate-50 pt-4">
          <div className="flex gap-2.5 items-start p-2.5 rounded-xl hover:bg-slate-50/60 transition-colors">
            <span className="text-emerald-500 font-bold text-sm">💡</span>
            <p className="text-[10px] text-slate-500 leading-normal font-bold">
              <span className="text-emerald-700 font-black">غذاء الروح:</span> صلاتك الحاضرة بالمسجد تمنح قلبك نبضاً مشرقاً يمتد طوال اليوم، بينما الخمول عن الأوراد يسبب فتوراً في مؤشرك.
            </p>
          </div>
          <div className="flex gap-2.5 items-start p-2.5 rounded-xl hover:bg-slate-50/60 transition-colors">
            <span className="text-emerald-500 font-bold text-sm">🕰️</span>
            <p className="text-[10px] text-slate-500 leading-normal font-bold">
              <span className="text-amber-600 font-black">استثمار الأوقات:</span> تفاعُل المؤشر ذكي جداً ويعرف التوقيت الفعلي والمستهدف للفرائض، الأذكار، قيام الليل، والضحى لتجديد حيويتك.
            </p>
          </div>
        </div>
      </div>

      {/* 6. مخطط التطور الأسبوعي (في النهاية) */}
      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><History className="w-5 h-5" /></div>
             <div>
               <h3 className="text-sm font-bold text-slate-800 header-font leading-tight">مخطط التطور الأسبوعي</h3>
               <p className="text-[10px] text-slate-400 font-bold">تتبع رصيدك الإيماني على مدار الأسبوع</p>
             </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setShowWeeklyCard(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white rounded-xl text-xs font-black header-font shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
            >
              <Share className="w-3.5 h-3.5 text-amber-300" />
              <span>بطاقة حصاد الأسبوع 🖼️</span>
            </button>
            <div className="text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-2 rounded-lg border border-amber-100 hidden sm:block">
              الخط يمثل هدفك اليومي
            </div>
          </div>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700, fontFamily: 'Cairo' }} 
              />
              <YAxis hide domain={[0, (dataMax: number) => Math.max(dataMax, targetScore) + 2000]} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Cairo' }} 
                formatter={(value: any) => [value.toLocaleString(), 'النقاط']}
                labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                fill="url(#scoreGradient)" 
                strokeWidth={3} 
                animationDuration={1500}
              />
              <ReferenceLine 
                y={targetScore} 
                stroke="#f59e0b" 
                strokeDasharray="5 5" 
                strokeWidth={2}
                label={{ position: 'right', value: 'الهدف', fill: '#d97706', fontSize: 9, fontWeight: 'bold' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* مودال بطاقة الإنجاز الأسبوعي القابلة للمشاركة */}
      <WeeklyCardModal
        isOpen={showWeeklyCard}
        onClose={() => setShowWeeklyCard(false)}
        logs={logs}
        weights={weights}
        user={user || null}
        targetScore={targetScore}
      />

    </div>
  );
};

export default Dashboard;
