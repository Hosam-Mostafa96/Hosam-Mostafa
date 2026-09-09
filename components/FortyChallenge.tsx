import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  Flame, 
  Award, 
  CheckCircle2, 
  Calendar, 
  RotateCcw, 
  Sparkles, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck, 
  Heart, 
  BookOpen, 
  Sun, 
  Moon, 
  Clock, 
  TrendingUp, 
  Check, 
  Trophy, 
  AlertCircle,
  Share2,
  Trash2,
  Edit3
} from 'lucide-react';
import { FortyDayChallenge } from '../types';
import { format, addDays, differenceInDays } from 'date-fns';
import { arSA as ar } from 'date-fns/locale';

interface PresetHabit {
  id: string;
  title: string;
  category: string;
  description: string;
  virtue: string;
  icon: 'prayer' | 'quran' | 'athkar' | 'fasting' | 'heart' | 'knowledge' | 'night';
}

const PRESET_HABITS: PresetHabit[] = [
  {
    id: 'takbeerat_ihram',
    title: 'إدراك تكبيرة الإحرام في جماعة',
    category: 'الصلاة',
    description: 'المحافظة على صلاة الجماعة من أولها مع الإمام دون تفويت تكبيرة الإحرام.',
    virtue: 'قال ﷺ: «من صلى لله أربعين يوماً في جماعة يدرك التكبيرة الأولى كتبت له براءتان: براءة من النار، وبراءة من النفاق» (الترمذي).',
    icon: 'prayer'
  },
  {
    id: 'fajr_jamaah',
    title: 'صلاة الفجر في جماعة بالمسجد',
    category: 'الصلاة',
    description: 'الاستيقاظ المبكر وشهود صلاة الصبح في بيت من بيوت الله.',
    virtue: 'قال ﷺ: «بشر المشائين في الظلم إلى المساجد بالنور التام يوم القيامة» و«من صلى الصبح فهو في ذمة الله».',
    icon: 'prayer'
  },
  {
    id: 'qiyam_layl',
    title: 'قيام الليل وركعة الوتر',
    category: 'النوافل',
    description: 'المواظبة على قيام الليل ولو بركعتين مع الوتر قبل النوم أو في السحر.',
    virtue: 'قال ﷺ: «عليكم بقيام الليل فإنه دأب الصالحين قبلكم، وقربة إلى ربكم، ومكفرة للسيئات».',
    icon: 'night'
  },
  {
    id: 'quran_juz',
    title: 'ورد القرآن اليومي (جزء كامل)',
    category: 'القرآن',
    description: 'تلاوة جزء كامل من كتاب الله يومياً بتدبر وتأنٍ.',
    virtue: 'ختم القرآن كل شهر وزيادة، وشفاعة يوم القيامة: «اقرؤوا القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه».',
    icon: 'quran'
  },
  {
    id: 'athkar_daily',
    title: 'أذكار الصباح والمساء في وقتها',
    category: 'الأذكار',
    description: 'الالتزام بحصن المسلم كاملاً بعد الفجر وبعد العصر.',
    virtue: 'حفظ ووقاية تامة من الشرور ودوام صلة بالله: «مثل الذي يذكر ربه والذي لا يذكر ربه مثل الحي والميت».',
    icon: 'athkar'
  },
  {
    id: 'salawat_100',
    title: 'الصلاة على النبي ﷺ (١٠٠ مرة)',
    category: 'الأذكار',
    description: 'تعطير اللسان بالصلاة على الحبيب المصطفى ﷺ مائة مرة كل يوم.',
    virtue: 'كفاية الهم وغفران الذنب واستحقاق شفاعته ﷺ: «إذاً تُكفى همَّك ويُغفر ذنبُك».',
    icon: 'athkar'
  },
  {
    id: 'istighfar_100',
    title: 'ورد الاستغفار والتوبة (١٠٠ مرة)',
    category: 'الأذكار',
    description: 'ملازمة الاستغفار والتضرع إلى الله لمحو الذنوب وتفريج الكروب.',
    virtue: '«من لزم الاستغفار جعل الله له من كل هم فرجاً، ومن كل ضيق مخرجاً، ورزقه من حيث لا يحتسب».',
    icon: 'athkar'
  },
  {
    id: 'duha_prayer',
    title: 'المواظبة على صلاة الضحى',
    category: 'النوافل',
    description: 'أداء ركعتين إلى أربع ركعات في وقت الضحى.',
    virtue: 'أداء صدقة ٣٦٠ مفصلاً في البدن: «ويجزئ من ذلك ركعتان يركعهما من الضحى».',
    icon: 'prayer'
  },
  {
    id: 'fasting_sunnah',
    title: 'صيام الإثنين والخميس',
    category: 'الصيام',
    description: 'صيام يومي الإثنين والخميس من كل أسبوع طوال مدة الأربعين.',
    virtue: '«تُعرض الأعمال يوم الإثنين والخميس فأحب أن يعرض عملي وأنا صائم».',
    icon: 'fasting'
  },
  {
    id: 'tazkiya_lisan',
    title: 'حفظ اللسان وصيانة الغيبة',
    category: 'التزكية',
    description: 'تطهير القول من الغيبة والنميمة وفاحش الكلام والمراء.',
    virtue: 'قال ﷺ: «من يضمن لي ما بين لحييه وما بين رجليه أضمن له الجنة».',
    icon: 'heart'
  },
  {
    id: 'ilm_talab',
    title: 'طلب العلم الشرعي (٣٠ دقيقة)',
    category: 'العلم',
    description: 'سماع درس تأصيلي أو قراءة كتاب نافع في الفقه أو العقيدة أو التفسير.',
    virtue: '«من سلك طريقاً يلتمس فيه علماً سهل الله له به طريقاً إلى الجنة».',
    icon: 'knowledge'
  }
];

const STORAGE_KEY = 'worship_forty_challenges_v1';

export const FortyChallenge: React.FC = () => {
  const [challenges, setChallenges] = useState<FortyDayChallenge[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetHabit | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCategory, setCustomCategory] = useState('عبادة');
  const [customStartDate, setCustomStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [copiedNotification, setCopiedNotification] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // تحميل التحديات من الذاكرة المحلية
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setChallenges(parsed);
        if (parsed.length > 0) {
          const active = parsed.find((c: FortyDayChallenge) => !c.isCompleted) || parsed[0];
          setActiveChallengeId(active.id);
        }
      }
    } catch (e) {
      console.error('Error loading forty challenges', e);
    }
  }, []);

  const saveChallenges = (updated: FortyDayChallenge[]) => {
    setChallenges(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving challenges', e);
    }
  };

  const activeChallenge = useMemo(() => {
    return challenges.find(c => c.id === activeChallengeId) || null;
  }, [challenges, activeChallengeId]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    if (!activeChallenge) return { completedCount: 0, percent: 0, isTodayDone: false, remaining: 40, streak: 0 };
    const completedCount = activeChallenge.completedDays.length;
    const percent = Math.min(100, Math.round((completedCount / activeChallenge.targetDays) * 100));
    const isTodayDone = activeChallenge.completedDays.includes(todayStr);
    const remaining = Math.max(0, activeChallenge.targetDays - completedCount);

    // حساب السلسلة المتصلة (Streak)
    let streak = 0;
    const sorted = [...activeChallenge.completedDays].sort().reverse();
    if (sorted.length > 0) {
      // فحص إذا كان اليوم أو الأمس مسجلاً
      const checkDate = new Date();
      if (!isTodayDone) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      let currentCheck = format(checkDate, 'yyyy-MM-dd');
      for (const d of sorted) {
        if (d === currentCheck) {
          streak++;
          const prev = new Date(currentCheck.replace(/-/g, '/'));
          prev.setDate(prev.getDate() - 1);
          currentCheck = format(prev, 'yyyy-MM-dd');
        }
      }
    }

    return { completedCount, percent, isTodayDone, remaining, streak };
  }, [activeChallenge, todayStr]);

  // تسجيل إنجاز اليوم
  const handleToggleToday = () => {
    if (!activeChallenge) return;
    let nextCompleted = [...activeChallenge.completedDays];
    if (nextCompleted.includes(todayStr)) {
      nextCompleted = nextCompleted.filter(d => d !== todayStr);
    } else {
      nextCompleted.push(todayStr);
    }

    const isNowFinished = nextCompleted.length >= activeChallenge.targetDays;

    const updated = challenges.map(c => {
      if (c.id === activeChallenge.id) {
        return {
          ...c,
          completedDays: nextCompleted,
          isCompleted: isNowFinished
        };
      }
      return c;
    });

    saveChallenges(updated);
  };

  // تبديل يوم محدد من شبكة الـ 40 يوماً
  const handleToggleSpecificDay = (dayIndex: number) => {
    if (!activeChallenge) return;
    
    // حساب تاريخ هذا اليوم بناءً على تاريخ البدء
    const start = new Date(activeChallenge.startDate.replace(/-/g, '/'));
    const targetDate = addDays(start, dayIndex);
    const targetDateStr = format(targetDate, 'yyyy-MM-dd');

    let nextCompleted = [...activeChallenge.completedDays];
    if (nextCompleted.includes(targetDateStr)) {
      nextCompleted = nextCompleted.filter(d => d !== targetDateStr);
    } else {
      nextCompleted.push(targetDateStr);
    }

    const isNowFinished = nextCompleted.length >= activeChallenge.targetDays;

    const updated = challenges.map(c => {
      if (c.id === activeChallenge.id) {
        return {
          ...c,
          completedDays: nextCompleted,
          isCompleted: isNowFinished
        };
      }
      return c;
    });

    saveChallenges(updated);
  };

  // إنشاء تحدي جديد
  const handleCreateChallenge = (habit: PresetHabit | null) => {
    const title = habit ? habit.title : customTitle.trim();
    if (!title) return;

    const newChallenge: FortyDayChallenge = {
      id: 'challenge_' + Date.now(),
      habitTitle: title,
      habitCategory: habit ? habit.category : customCategory,
      habitDescription: habit ? habit.description : customDesc.trim(),
      startDate: customStartDate || todayStr,
      completedDays: [],
      targetDays: 40,
      isCompleted: false,
      notes: habit ? habit.virtue : '',
      createdAt: Date.now()
    };

    const updated = [newChallenge, ...challenges];
    saveChallenges(updated);
    setActiveChallengeId(newChallenge.id);
    setIsCreating(false);
    setSelectedPreset(null);
    setCustomTitle('');
    setCustomDesc('');
  };

  // حذف تحدي
  const handleDeleteChallenge = (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التحدي؟')) return;
    const updated = challenges.filter(c => c.id !== id);
    saveChallenges(updated);
    if (activeChallengeId === id) {
      setActiveChallengeId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // إعادة ضبط الأيام
  const handleResetChallenge = (id: string) => {
    if (!window.confirm('هل تريد إعادة تصفير أيام هذا التحدي والبدء من اليوم الأول؟')) return;
    const updated = challenges.map(c => {
      if (c.id === id) {
        return {
          ...c,
          startDate: todayStr,
          completedDays: [],
          isCompleted: false
        };
      }
      return c;
    });
    saveChallenges(updated);
  };

  // مشاركة الإنجاز
  const handleShare = () => {
    if (!activeChallenge) return;
    const text = `بفضل الله، أحرزت تقدماً في «تحدي الأربعين»:
✨ العادة: ${activeChallenge.habitTitle}
📊 الإنجاز: ${stats.completedCount} من 40 يوماً (${stats.percent}%)
🔥 التتابع: ${stats.streak} يوم متتالٍ
نسأل الله الثبات والإخلاص والقبول!`;
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const getCategoryBadgeClass = (category?: string) => {
    switch (category) {
      case 'الصلاة': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'القرآن': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'النوافل': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'الأذكار': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'التزكية': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* الهيدر التعريفي الفاخر لتحدي الأربعين */}
      <div className="bg-gradient-to-l from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-20 -translate-y-20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 px-3.5 py-1 rounded-full text-xs font-black header-font backdrop-blur-md border border-yellow-400/30">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>مدرسة الاستقامة وترسيخ الطاعة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black header-font tracking-tight">تحدي الأربعين يوماً</h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl font-medium leading-relaxed">
              «كتبت له براءتان: براءة من النار، وبراءة من النفاق» — خصص عادة إيمانية والزمها أربعين يوماً متوالية حتى تصبح لك سجية وطبيعة ثابتة.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs header-font shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>بدء تحدٍ جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* قائمة التحديات المسجلة إذا وجد أكثر من واحد */}
      {challenges.length > 1 && (
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-black text-slate-400 header-font shrink-0 px-2">تحدياتك:</span>
          {challenges.map(c => {
            const isCur = c.id === activeChallengeId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveChallengeId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black header-font transition-all shrink-0 flex items-center gap-2 ${
                  isCur 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{c.habitTitle}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${isCur ? 'bg-white/20' : 'bg-slate-200'}`}>
                  {c.completedDays.length}/40
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* المحتوى الرئيسي */}
      {activeChallenge ? (
        <div className="space-y-6">
          {/* البطاقة الرئيسية للتحدي النشط */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100 shrink-0">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getCategoryBadgeClass(activeChallenge.habitCategory)}`}>
                      {activeChallenge.habitCategory || 'عبادة'}
                    </span>
                    {activeChallenge.isCompleted ? (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> تم الإتمام بنجاح 🏆
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500 animate-bounce" /> جاري التحدي
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 header-font">{activeChallenge.habitTitle}</h2>
                  {activeChallenge.habitDescription && (
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {activeChallenge.habitDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* أدوات التحكم السريع */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={handleShare}
                  title="مشاركة الإنجاز"
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleResetChallenge(activeChallenge.id)}
                  title="إعادة التصفير والبدء من جديد"
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteChallenge(activeChallenge.id)}
                  title="حذف التحدي"
                  className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* إشعار النسخ عند المشاركة */}
            {copiedNotification && (
              <div className="my-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تم نسخ نص التقرير الإيماني لمشاركته وتحفيز الإخوان!</span>
              </div>
            )}

            {/* شريط التقدم البصري الفاخر (Visual Progress Bar) */}
            <div className="py-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-700 header-font">شريط التقدم الإيماني:</span>
                  <span className="text-xs font-black text-emerald-600 font-mono bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                    {stats.completedCount} / 40 يوماً
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-slate-900 font-mono">{stats.percent}%</span>
                </div>
              </div>

              {/* شريط التقدم البصري المتدرج */}
              <div className="relative w-full h-6 bg-slate-100 rounded-2xl overflow-hidden p-1 border border-slate-200 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-l from-emerald-500 via-teal-500 to-amber-400 rounded-xl transition-all duration-700 relative flex items-center justify-end px-2"
                  style={{ width: `${Math.max(5, stats.percent)}%` }}
                >
                  <div className="w-2.5 h-2.5 bg-white rounded-full shadow-md animate-ping absolute left-1"></div>
                </div>
              </div>

              {/* معالم الطريق (Milestones) */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[
                  { day: 10, label: 'البداية (10 أيام)', desc: 'تخطي صعوبة الانطلاق' },
                  { day: 20, label: 'الانتصاف (20 يوماً)', desc: 'بداية استقرار العادة' },
                  { day: 30, label: 'الرسوخ (30 يوماً)', desc: 'ألفة العبادة والراحة' },
                  { day: 40, label: 'التمام (40 يوماً)', desc: 'البراءة والتمكين التام' },
                ].map((m) => {
                  const isReached = stats.completedCount >= m.day;
                  return (
                    <div 
                      key={m.day} 
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isReached 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <p className="text-[10px] font-black header-font">{m.label}</p>
                      <p className="text-[8px] font-medium mt-0.5 opacity-80">{m.desc}</p>
                      {isReached && <Check className="w-3 h-3 text-emerald-600 mx-auto mt-1" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* شبكة الإحصائيات الأربعة */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-bold mb-1">الأيام المنجزة</p>
                <p className="text-xl font-black text-emerald-600 font-mono">{stats.completedCount}</p>
                <span className="text-[9px] text-slate-400">يوماً مباركاً</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-bold mb-1">المتبقي للهدف</p>
                <p className="text-xl font-black text-amber-600 font-mono">{stats.remaining}</p>
                <span className="text-[9px] text-slate-400">يوماً للتمام</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-bold mb-1">أيام التتابع المتصل</p>
                <div className="flex items-center justify-center gap-1">
                  <Flame className={`w-4 h-4 ${stats.streak > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
                  <p className="text-xl font-black text-slate-800 font-mono">{stats.streak}</p>
                </div>
                <span className="text-[9px] text-slate-400">أيام دون انقطاع</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-bold mb-1">تاريخ البدء</p>
                <p className="text-xs font-black text-slate-700 header-font mt-1">{activeChallenge.startDate}</p>
                <span className="text-[9px] text-slate-400">انطلاقة مباركة</span>
              </div>
            </div>

            {/* الزر الضخم التفاعلي لتسجيل إنجاز ورد اليوم */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <button
                onClick={handleToggleToday}
                className={`w-full py-4 px-6 rounded-2xl font-black header-font text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-md active:scale-98 ${
                  stats.isTodayDone
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-200'
                }`}
              >
                {stats.isTodayDone ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                    <span>أحسنت! سُجِّل إنجاز اليوم ({todayStr}) في هذا التحدي ✓ (اضغط للإلغاء)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-slate-900" />
                    <span>سجّل إتمامك لورد اليوم بنجاح ✨ (+يوم إلى رصيد الأربعين)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* شبكة الأربعين يوماً التفاعلية (40-Day Visual Grid) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 header-font flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>شبكة الأربعين يوماً</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  انقر على أي يوم لتبديل حالته أو تدارك الأيام السابقة.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-700"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> منجز</span>
                <span className="flex items-center gap-1 text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span> متبقٍ</span>
              </div>
            </div>

            {/* شبكة المربعات الأربعين */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-2.5 pt-2">
              {Array.from({ length: 40 }, (_, idx) => {
                const dayNum = idx + 1;
                // تاريخ هذا اليوم
                const start = new Date(activeChallenge.startDate.replace(/-/g, '/'));
                const cellDate = addDays(start, idx);
                const cellDateStr = format(cellDate, 'yyyy-MM-dd');
                const isCompleted = activeChallenge.completedDays.includes(cellDateStr);
                const isToday = cellDateStr === todayStr;

                return (
                  <button
                    key={dayNum}
                    onClick={() => handleToggleSpecificDay(idx)}
                    title={`اليوم ${dayNum} (${cellDateStr})`}
                    className={`h-14 rounded-2xl flex flex-col items-center justify-center relative transition-all border font-mono text-xs ${
                      isCompleted 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm hover:bg-emerald-700' 
                        : isToday 
                        ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400 shadow-sm' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold header-font opacity-70">يوم</span>
                    <span className="font-black text-sm">{dayNum}</span>
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 text-white mt-0.5" />
                    ) : isToday ? (
                      <span className="text-[8px] font-black text-amber-700 header-font mt-0.5">اليوم</span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* رسالة فضل العبادة المختارة */}
            {activeChallenge.notes && (
              <div className="mt-6 p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-right">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-amber-950 header-font mb-1">فضل هذه العادة وثمرتها الإيمانية:</h4>
                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                      {activeChallenge.notes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* في حال عدم وجود تحدٍ نشط */
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
            <Target className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-black text-slate-800 header-font">لم تبدأ تحدي الأربعين بعد!</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              اختر إحدى العادات الإيمانية الجليلة من القائمة النبوية المقترحة أدناه أو ابتكر عادتك الخاصة، وابدأ رحلة الأربعين يوماً نحو التثبيت والقبول.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl text-xs header-font shadow-md transition-all"
          >
            اختر عادة وابدأ الآن
          </button>
        </div>
      )}

      {/* نافذة أو واجهة اختيار عادة وبدء التحدي */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 my-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-800 header-font">اختر عادة لتحدي الأربعين يوماً</h3>
              </div>
              <button
                onClick={() => { setIsCreating(false); setSelectedPreset(null); }}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* قائمة العادات النبوية الجاهزة */}
            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              <p className="text-xs font-black text-slate-400 header-font">عادات إيمانية مقترحة من السنة والآثار:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_HABITS.map(h => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setSelectedPreset(h);
                      setCustomTitle(h.title);
                      setCustomDesc(h.description);
                      setCustomCategory(h.category);
                    }}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                      selectedPreset?.id === h.id 
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20' 
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          {h.category}
                        </span>
                        {selectedPreset?.id === h.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <h4 className="text-xs font-black text-slate-800 header-font leading-snug">{h.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">{h.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* حقول العادة المخصصة أو تعديل المختارة */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <p className="text-xs font-black text-slate-400 header-font">أو خصص تفاصيل عادتك:</p>
              <div>
                <label className="block text-[11px] font-black text-slate-600 mb-1 header-font">عنوان العادة:</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="مثال: قراءة صفحتين من التفسير يومياً..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-1 header-font">التصنيف:</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                  >
                    <option value="الصلاة">الصلاة</option>
                    <option value="القرآن">القرآن</option>
                    <option value="النوافل">النوافل</option>
                    <option value="الأذكار">الأذكار</option>
                    <option value="التزكية">التزكية والأخلاق</option>
                    <option value="الصيام">الصيام</option>
                    <option value="العلم">طلب العلم</option>
                    <option value="عادة عامة">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 mb-1 header-font">تاريخ البدء:</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* أزرار الحفظ والإلغاء */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => { setIsCreating(false); setSelectedPreset(null); }}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleCreateChallenge(selectedPreset)}
                disabled={!customTitle.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black px-6 py-2.5 rounded-xl text-xs header-font shadow-md transition-all"
              >
                انطلاق في التحدي (40 يوماً)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* بطاقة الحكمة الإيمانية حول سر الأربعين يوماً */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-3 text-emerald-800">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-black header-font">لماذا أربعون يوماً؟</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          للأربعين يوماً خصوصية ظاهرة في شريعة الإسلام وفي الفطرة البشرية؛ فبها ميقات موسى عليه السلام ﴿وَوَاعَدْنَا مُوسَىٰ ثَلَاثِينَ لَيْلَةً وَأَتْمَمْنَاهَا بِعَشْرٍ فَتَمَّ مِيقَاتُ رَبِّهِ أَرْبَعِينَ لَيْلَةً﴾، وبها ثبوت تكبيرة الإحرام لبراءة النفاق، كما أثبتت الدراسات التربوية والسلوكية أن الالتزام المتصل لـ 40 يوماً كفيل بإعادة بناء المسارات العصبية وجعل الطاعة جزءاً لا يتجزأ من هوية المؤمن اليومية.
        </p>
      </div>
    </div>
  );
};

export default FortyChallenge;
