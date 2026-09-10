import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Sparkles, 
  Crown, 
  Sun, 
  Moon, 
  Flame, 
  BookOpen, 
  Heart, 
  Info, 
  Share2, 
  Download, 
  ChevronLeft, 
  CheckCircle2, 
  Lock, 
  Eye, 
  RotateCcw,
  Maximize2,
  Minimize2,
  Compass,
  Layers,
  Award,
  TowerControl,
  Waves,
  Palette,
  Users
} from 'lucide-react';
import { DailyLog, User, PrayerName, PrayerEntry } from '../types';
import confetti from 'canvas-confetti';

interface FortressOfFaithProps {
  log: DailyLog;
  onSwitchTab?: (tab: any) => void;
  user?: User | null;
  onClose?: () => void;
  onUpdateLog?: (log: DailyLog, activityLabel?: string, activityType?: string) => void;
}

export type FortressSection = 
  | 'fajr' 
  | 'dhuhr' 
  | 'asr' 
  | 'maghrib' 
  | 'isha' 
  | 'main_curtain_wall' 
  | 'outer_athkar_wall' 
  | 'athkar_shield' 
  | 'qiyam_spire' 
  | 'duha_dome' 
  | 'rawatib' 
  | 'quran_light' 
  | 'quran_sunrays' 
  | 'fasting_gate' 
  | 'tazkiya_gardens'
  | 'remembrance_moat';

export const FortressOfFaith: React.FC<FortressOfFaithProps> = ({ log, onSwitchTab, user, onClose, onUpdateLog }) => {
  const [activeSection, setActiveSection] = useState<FortressSection | null>(null);
  const [hoveredSection, setHoveredSection] = useState<FortressSection | null>(null);
  const [isSimulation, setIsSimulation] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 1. استخراج معطيات العبادة اليومية من الـ log
  const prayers = log?.prayers || {};
  const athkar = log?.athkar || { checklists: { morning: false, evening: false, sleep: false }, counters: {} };
  const nawafil = log?.nawafil || { duhaDuration: 0, qiyamDuration: 0, witrDuration: 0, fasting: false, custom: [] };
  const quran = log?.quran || { readPages: [], hifzRub: 0, revisionRub: 0 };
  const tadabburCount = log?.tadabburNotes?.length || 0;
  const heartDeedsCount = Object.values(log?.heartStates?.deeds || {}).flat().length;

  // 2. الحالات الفعلية أو المحاكاة (الصرح المكتمل التام)
  const fardData = useMemo(() => {
    if (isSimulation) {
      return {
        fajr: { performed: true, inCongregation: true },
        dhuhr: { performed: true, inCongregation: true },
        asr: { performed: true, inCongregation: true },
        maghrib: { performed: true, inCongregation: true },
        isha: { performed: true, inCongregation: true },
      };
    }
    const getPrayer = (arKey: string, enKey: string) => {
      const p = prayers[arKey] || prayers[enKey] || prayers[enKey.toLowerCase()] || prayers[enKey.toUpperCase()] || {};
      return {
        performed: Boolean(p.performed),
        inCongregation: Boolean(p.inCongregation)
      };
    };
    return {
      fajr: getPrayer(PrayerName.FAJR, 'fajr'),
      dhuhr: getPrayer(PrayerName.DHUHR, 'dhuhr'),
      asr: getPrayer(PrayerName.ASR, 'asr'),
      maghrib: getPrayer(PrayerName.MAGHRIB, 'maghrib'),
      isha: getPrayer(PrayerName.ISHA, 'isha'),
    };
  }, [isSimulation, prayers]);

  const fardDoneCount = [
    fardData.fajr.performed,
    fardData.dhuhr.performed,
    fardData.asr.performed,
    fardData.maghrib.performed,
    fardData.isha.performed
  ].filter(Boolean).length;

  const fardCongregationCount = [
    fardData.fajr.inCongregation,
    fardData.dhuhr.inCongregation,
    fardData.asr.inCongregation,
    fardData.maghrib.inCongregation,
    fardData.isha.inCongregation
  ].filter(Boolean).length;

  // 3. حالة الأذكار والتحصين
  const athkarShield = useMemo(() => {
    if (isSimulation) {
      return { morning: true, evening: true, sleep: true, counters: 500, totalPercent: 100 };
    }
    const morning = Boolean(athkar.checklists?.morning);
    const evening = Boolean(athkar.checklists?.evening);
    const sleep = Boolean(athkar.checklists?.sleep);
    const countersSum = Object.values(athkar.counters || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const detailedSum = Object.values(athkar.completedDetailedAthkar || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const totalCounters = countersSum + detailedSum;
    
    let score = 0;
    if (morning) score += 35;
    if (evening) score += 35;
    if (sleep) score += 20;
    if (totalCounters >= 100) score += 10;
    else if (totalCounters > 0) score += 5;

    return { morning, evening, sleep, counters: totalCounters, totalPercent: Math.min(100, score) };
  }, [isSimulation, athkar]);

  // 4. حالة النوافل
  const nawafilData = useMemo(() => {
    if (isSimulation) {
      return { duha: true, qiyam: true, rawatib: true, fasting: true };
    }
    const duha = (nawafil.duhaDuration || 0) > 0;
    const qiyam = (nawafil.qiyamDuration || 0) > 0 || (nawafil.witrDuration || 0) > 0;
    const rawatibIds = ['fajr_pre', 'dhuhr_pre', 'dhuhr_post', 'maghrib_post', 'isha_post'];
    const surroundingList = (Object.values(prayers) as PrayerEntry[]).flatMap(p => p?.surroundingSunnahIds || []);
    const hasRawatibFromPrayers = surroundingList.some((id: string) => rawatibIds.includes(id));
    const rawatib = hasRawatibFromPrayers || (log?.customSunnahIds?.length || 0) > 0 || surroundingList.length > 0;
    const fasting = Boolean(nawafil.fasting);
    return { duha, qiyam, rawatib, fasting };
  }, [isSimulation, nawafil, log?.customSunnahIds, prayers]);

  // 5. حالة القرآن الكريم وأشعة شمس الوحي
  const quranData = useMemo(() => {
    if (isSimulation) {
      return {
        hasRead: true,
        hasTadabbur: true,
        pagesCount: 15,
        readingRub: 4,
        listeningRub: 4,
        hifzTasksCount: 5,
        hifzReps: 40,
        tadabburCount: 3,
        percent: 100,
        summary: 'تلاوة ١٥ صفحة + سماع ٤ أرباع + إتمام ورد الحفظ والتكرار'
      };
    }
    const pagesCount = quran.readPages?.length || 0;
    const readingRub = quran.revisionRub || 0;
    const listeningRub = quran.hifzRub || 0;
    const hifzTasksCount = quran.tasksCompleted?.length || 0;
    const hifzReps = quran.todayReps || 0;
    const hasTadabbur = tadabburCount > 0;
    const hasListenTask = quran.tasksCompleted?.includes('listen') || false;
    const hasSurah = Boolean(quran.surahName && quran.surahName.trim().length > 0);
    const hasPortion = Boolean(quran.todayPortion && quran.todayPortion.trim().length > 0);

    // حساب النسبة المئوية لقوة أشعة القرآن (من 0 إلى 100%)
    // 1. التلاوة والقراءة (تصل إلى 40%)
    let recitationScore = 0;
    if (pagesCount > 0) recitationScore += Math.min(40, pagesCount * 8); // كل صفحة 8% (5 صفحات تلاوة = 40%)
    if (readingRub > 0) recitationScore = Math.max(recitationScore, Math.min(40, readingRub * 10)); // كل ربع قراءة 10%
    if (hasSurah || hasPortion) recitationScore = Math.max(recitationScore, 20);

    // 2. الاستماع والسماع (تصل إلى 30%)
    let listeningScore = 0;
    if (listeningRub > 0) listeningScore += Math.min(30, listeningRub * 15);
    if (hasListenTask) listeningScore = Math.max(listeningScore, 20);

    // 3. الحفظ والتكرار والمراجعة (تصل إلى 30%)
    let hifzScore = 0;
    if (quran.todayPortion) hifzScore += 10;
    if (hifzReps > 0) hifzScore += Math.min(15, Math.round((hifzReps / 40) * 15));
    if (hifzTasksCount > 0) hifzScore += Math.min(15, hifzTasksCount * 5);

    // 4. التدبر الإيماني (إضافة بونص حتى 15%)
    let tadabburScore = Math.min(15, tadabburCount * 5);

    const totalRaw = recitationScore + listeningScore + hifzScore + tadabburScore;
    const percent = Math.min(100, Math.max(0, Math.round(totalRaw)));
    const hasRead = pagesCount > 0 || readingRub > 0 || listeningRub > 0 || hasSurah || percent > 0;

    const summaryParts: string[] = [];
    if (pagesCount > 0) summaryParts.push(`تلاوة ${pagesCount} صفحة`);
    if (readingRub > 0) summaryParts.push(`قراءة ${readingRub} أرباع`);
    if (listeningRub > 0 || hasListenTask) summaryParts.push(`سماع ${listeningRub > 0 ? `${listeningRub} أرباع` : 'مجوّد'}`);
    if (hasSurah) summaryParts.push(`سورة ${quran.surahName}`);
    if (quran.todayPortion || hifzTasksCount > 0) summaryParts.push(`حفظ ومراجعة (${hifzTasksCount} مهام)`);
    if (hasTadabbur) summaryParts.push(`تدبر ${tadabburCount} آيات`);

    return {
      hasRead,
      hasTadabbur,
      pagesCount,
      readingRub,
      listeningRub,
      hifzTasksCount,
      hifzReps,
      tadabburCount,
      percent,
      summary: summaryParts.length > 0 ? summaryParts.join(' • ') : 'لا يوجد ورد مسجل لليوم بعد'
    };
  }, [isSimulation, quran, tadabburCount]);

  // 6. حساب قوة الحصن الكلية
  const fortressScore = useMemo(() => {
    let score = 0;
    score += (fardDoneCount / 5) * 45;
    score += (fardCongregationCount / 5) * 5;
    score += (athkarShield.totalPercent / 100) * 20;
    if (nawafilData.qiyam) score += 6;
    if (nawafilData.duha) score += 4;
    if (nawafilData.rawatib) score += 3;
    if (nawafilData.fasting) score += 2;
    // أثر القرآن وشمس الوحي
    score += (quranData.percent / 100) * 12;
    if (heartDeedsCount > 0 || isSimulation) score += 3;
    return Math.min(100, Math.round(score));
  }, [fardDoneCount, fardCongregationCount, athkarShield, nawafilData, quranData, heartDeedsCount, isSimulation]);

  // 7. الرتبة الإيمانية للبنيان
  const fortressRank = useMemo(() => {
    if (fortressScore >= 90) return { title: 'حصن الصدّيقين المنيع 🏰', desc: 'قلعة شامخة تامة الأركان، امتدت أسوارها واكتملت أبراجها النورانية وحصنتها هالة الأذكار.', color: 'text-amber-300' };
    if (fortressScore >= 70) return { title: 'قلعة الأبرار المحصّنة 🛡️', desc: 'بنيان راسخ الجدران عالي الأسوار، شيدت أبراجه وثبتت قلاعه لصد كيد الغفلة والشياطين.', color: 'text-emerald-300' };
    if (fortressScore >= 45) return { title: 'صرح المجاهدة والارتقاء 🏛️', desc: 'أركان الفروض قيد الإشادة، والأسوار ترتفع مدماكاً إثر مدماك مع كل فريضة وورد.', color: 'text-cyan-300' };
    return { title: 'بنيان في طور التأسيس 🌱', desc: 'القواعد مرسومة والأبراج بانتظار إقامة الصلوات لتنهض أسوار القلعة بحول الله.', color: 'text-slate-300' };
  }, [fortressScore]);

  // تفاصيل العناصر المعمارية عند النقر
  const sectionDetails: Record<FortressSection, {
    title: string;
    subtitle: string;
    statusText: string;
    isBuilt: boolean;
    spiritualMeaning: string;
    hadith: string;
    actionLabel: string;
    tabTarget: string;
    architecturalEffect: string;
  }> = {
    fajr: {
      title: 'الصرح الأعظم: برج صلاة الفجر (منارة النور التام)',
      subtitle: 'العماد الأوسط والقلعة الحصينة الكبرى في قلب الحصن',
      statusText: fardData.fajr.performed 
        ? (fardData.fajr.inCongregation ? 'شامخ في كبد السماء بارتفاع (296م) مع قبة فجرية ملكية وتاج الجماعة ⭐' : 'مشيّد بارتفاع (260م)')
        : 'أساس أرضي فقط (24م) — بانتظار إقامة الفريضة',
      isBuilt: fardData.fajr.performed,
      spiritualMeaning: 'من صلى الصبح فهو في ذمة الله؛ صلاة الفجر تؤسس حجر الأساس لطرد وحشة الظلمة.',
      hadith: '«بَشِّرِ الْمَشَّائِينَ فِي الظُّلَمِ إِلَى الْمَسَاجِدِ بِالنُّورِ التَّامِّ يَوْمَ الْقِيَامَةِ»',
      actionLabel: 'تسجيل صلاة الفجر',
      tabTarget: 'entry',
      architecturalEffect: 'يشيد الصرح المركزي الأعظم وترتفع القبة الفجرية المشعة مع شرفة ونوافذ المشربية الفجرية.'
    },
    dhuhr: {
      title: 'برج صلاة الظهر (عماد منتصف النهار)',
      subtitle: 'البرج الأيمن الداخلي الحامي لقلب القلعة (يليه الظهر)',
      statusText: fardData.dhuhr.performed 
        ? (fardData.dhuhr.inCongregation ? 'مشيّد بارتفاع (256م) وشرفة ذهبية للجماعة ⭐' : 'مشيّد بارتفاع (220م)')
        : 'أساس أرضي فقط — بانتظار إقامة الفريضة',
      isBuilt: fardData.dhuhr.performed,
      spiritualMeaning: 'ساعة تفتح فيها أبواب السماء؛ تثبت بنيان القلعة في أوج مشاغل النهار.',
      hadith: '«إنها ساعة تُفتح فيها أبواب السماء، فأحب أن يصعد لي فيها عمل صالح»',
      actionLabel: 'تسجيل صلاة الظهر',
      tabTarget: 'entry',
      architecturalEffect: 'يرتفع البرج الأيمن الداخلي ويعلو صرحه مع شرفة وقبة إسلامية متوهجة بضياء الظهيرة.'
    },
    asr: {
      title: 'برج صلاة العصر (الصلاة الوسطى)',
      subtitle: 'البرج الأيمن الخارجي المنيع (ثم العصر)',
      statusText: fardData.asr.performed 
        ? (fardData.asr.inCongregation ? 'مشيّد بارتفاع (226م) ومضاء بتاج الجماعة ⭐' : 'مشيّد بارتفاع (190م)')
        : 'أساس أرضي فقط — بانتظار إقامة الفريضة',
      isBuilt: fardData.asr.performed,
      spiritualMeaning: 'حفظ العصر حفظ لتاج العمل؛ من تركها حبط عمله كأنما وُتر أهله وماله.',
      hadith: '«مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ» — (الفجر والعصر)',
      actionLabel: 'تسجيل صلاة العصر',
      tabTarget: 'entry',
      architecturalEffect: 'يشيد البرج الأيمن الخارجي ليحقق التوازن الهيكلي الدفاعي لأسوار القلعة الذهبية.'
    },
    maghrib: {
      title: 'برج صلاة المغرب (أفق الغروب)',
      subtitle: 'البرج الحصين في أقصى الشمال/اليسار',
      statusText: fardData.maghrib.performed 
        ? (fardData.maghrib.inCongregation ? 'مشيّد بارتفاع كامل (226م) مع تاج صلاة الجماعة ⭐' : 'مشيّد بارتفاع (190م)')
        : 'أساس أرضي فقط — بانتظار إقامة الفريضة',
      isBuilt: fardData.maghrib.performed,
      spiritualMeaning: 'وتر النهار؛ ختام ساعات السعي وإعلان الشكر للواحد القهار مع أفول الشفق.',
      hadith: '«لا تزال أمتي بخير ما لم يؤخروا المغرب حتى تشتبك النجوم»',
      actionLabel: 'تسجيل صلاة المغرب',
      tabTarget: 'entry',
      architecturalEffect: 'يرفع البرج الأيسر الخارجي ويتوج بقبة الغروب ذات اللون البرتقالي العنبري الدافئ.'
    },
    isha: {
      title: 'برج صلاة العشاء (سكينة الليل والظلمة)',
      subtitle: 'البرج الداخلي الأيسر على الشمال (تليه العشاء)',
      statusText: fardData.isha.performed 
        ? (fardData.isha.inCongregation ? 'شامخ بارتفاع (256م) وقبة لؤلؤية ملكية ⭐' : 'مشيّد بارتفاع (220م)')
        : 'أساس أرضي فقط — بانتظار إقامة الفريضة',
      isBuilt: fardData.isha.performed,
      spiritualMeaning: 'صلاة العشاء في جماعة تعدل قيام نصف الليل، ونور يضيء حلكة الظلمات.',
      hadith: '«من صلى العشاء في جماعة فكأنما قام نصف الليل»',
      actionLabel: 'تسجيل صلاة العشاء',
      tabTarget: 'entry',
      architecturalEffect: 'يشيد البرج الأيسر الداخلي وترتفع القبة الإسلامية اللؤلؤية مع نوافذ العشاء المضيئة.'
    },
    main_curtain_wall: {
      title: 'السور الحجري الرئيسي وشرفات المداميك',
      subtitle: 'الجدار الدفاعي الرابط بين أبراج الفرائض',
      statusText: `ارتفاع السور: ${24 + (fardDoneCount * 21)} متراً (${fardDoneCount} من 5 فرائض)`,
      isBuilt: fardDoneCount > 0,
      spiritualMeaning: 'كل فريضة تضيف مدماكاً حجرياً صلباً يعلي السور ويمنع اختراق الشبهات والشهوات.',
      hadith: '«المؤمن للمؤمن كالبنيان يشد بعضه بعضاً.. وبُني الإسلام على خمس»',
      actionLabel: 'تسجيل الصلوات لرفع السور',
      tabTarget: 'entry',
      architecturalEffect: 'يرتفع جدار السور رأسياً وتزداد خطوط المداميك الحجرية وشرفات الرمي المسننة مع كل فريضة.'
    },
    outer_athkar_wall: {
      title: 'السور الخارجي المتقدم (سور التحصين)',
      subtitle: 'خط الدفاع المتقدم المحيط بالقلعة',
      statusText: athkarShield.totalPercent >= 35 
        ? `قائم ومحصن بارتفاع ${18 + Math.round((athkarShield.totalPercent / 100) * 28)} متراً (حصانة ${athkarShield.totalPercent}%)`
        : 'غير مشيّد بعد — يستلزم إنجاز 35% فأكثر من أذكار اليوم',
      isBuilt: athkarShield.totalPercent >= 35,
      spiritualMeaning: 'أذكار الصباح والمساء تشيد سداً منيعاً متقدماً يصد سهام العدو قبل اقترابها من القلعة.',
      hadith: '«مثل الذي يذكر ربه والذي لا يذكر ربه مثل الحي والميت»',
      actionLabel: 'قراءة الأذكار لتشييد السور',
      tabTarget: 'athkar',
      architecturalEffect: 'يضيف سوراً أمامياً إضافياً بشرفات حجرية يضاعف حماية القلعة ويزيد عمقها المعماري.'
    },
    athkar_shield: {
      title: 'الدرع الأثيري والطاقة النورانية (حرز الأذكار)',
      subtitle: 'الهالة الحامية الشاملة المحيطة بالحصن',
      statusText: `قوة الدرع: ${athkarShield.totalPercent}% (نصف قطر التغطية المتسع: ${280 + Math.round((athkarShield.totalPercent / 100) * 120)}م)`,
      isBuilt: athkarShield.totalPercent > 20,
      spiritualMeaning: 'الذكر درع طاقي وسور محكم يمنع سهام الشياطين ووساوسهم من اختراق قلبك وجوارحك.',
      hadith: '«كذلك العبد لا يحرز نفسه من الشيطان إلا بذكر الله»',
      actionLabel: 'قراءة الأذكار الآن',
      tabTarget: 'athkar',
      architecturalEffect: 'يتسع نصف قطر الهالة الضوئية وتزداد سماكة الدرع المشع وتتوزع عليه أختام الصباح والمساء والنوم.'
    },
    qiyam_spire: {
      title: 'منارة قيام الليل والتهجد السامقة (شعلة السحر)',
      subtitle: 'برج إضافي نحيل يعانق عنان السماء',
      statusText: nawafilData.qiyam 
        ? 'مشيدة وتطلق حزمة ضوئية زرقاء تخترق السماوات العلا ✨'
        : 'قيد الانتظار — صَلِّ ركعتين في جوف الليل أو وتراً لتنهض المنارة',
      isBuilt: nawafilData.qiyam,
      spiritualMeaning: 'شرف المؤمن قيامه بالليل؛ هو دأب الصالحين ومطردة للداء عن الجسد ونور في الوجه.',
      hadith: '«عليكم بقيام الليل فإنه دأب الصالحين قبلكم، وقربة إلى الله، ومنهاة عن الإثم»',
      actionLabel: 'تسجيل قيام الليل والوتر',
      tabTarget: 'entry',
      architecturalEffect: 'يضيف منارة رشيقة أعلى القلعة تطلق شعاعاً نورانياً مستمراً نحو كبد السماء والنجوم.'
    },
    duha_dome: {
      title: 'قبة صلاة الضحى الذهبية (صلاة الأوّابين)',
      subtitle: 'قبة متألقة بأشعة الشمس في بهو القلعة',
      statusText: nawafilData.duha 
        ? 'مشيدة وتشع بأشعة شمسية ذهبية دافئة ☀️' 
        : 'غير متفعلة — صلاة الضحى صدقة عن كل مَفْصِل وعظم',
      isBuilt: nawafilData.duha,
      spiritualMeaning: 'ركعتا الضحى تجزئ عن ثلاثمائة وستين صدقة مفروضة على كل مفصل في جسدك يومياً.',
      hadith: '«يصبح على كل سلامى من أحدكم صدقة.. ويجزئ من ذلك ركعتان يركعهما من الضحى»',
      actionLabel: 'تسجيل صلاة الضحى',
      tabTarget: 'entry',
      architecturalEffect: 'يضيف قبة ذهبية ملكية مشعة في البهو العلوي مع أشعة ضوئية منبثقة.'
    },
    rawatib: {
      title: 'شرفات السنن الرواتب والرايات (بيت الجنة)',
      subtitle: 'أروقة علوية من الرخام وأعلام إسلامية خفاقة',
      statusText: nawafilData.rawatib 
        ? 'مشيدة وتزدان بأعلام خضراء وذهبية ترفرف في الأعالي 🏛️' 
        : 'غير مضافة — ابنِ بيتاً في الجنة بالمحافظة على 12 ركعة راتبة',
      isBuilt: nawafilData.rawatib,
      spiritualMeaning: 'السنن تجبر نقص الفرائض، وترفع درجات القصر الإيماني شرفة فوق شرفة.',
      hadith: '«ما من عبد مسلم يصلي لله كل يوم ثنتي عشرة ركعة تطوعاً غير فريضة إلا بنى الله له بيتاً في الجنة»',
      actionLabel: 'تسجيل السنن الرواتب',
      tabTarget: 'entry',
      architecturalEffect: 'يضيف ممشى علوياً بأقواس رخامية أندلسية ورايات إيمانية ترفرف فوق الأسوار.'
    },
    quran_light: {
      title: 'مشكاة القرآن والتدبر (نوافذ النور الإلهي)',
      subtitle: 'الضياء المتدفق من أروقة ونوافذ المشربية',
      statusText: quranData.hasRead 
        ? `مضاءة بأنوار التلاوة (${quranData.pagesCount} صفحة) والتدبر 📖`
        : 'نوافذ مظلمة — رتّل آيات من كتاب الله لتشع جنبات القلعة',
      isBuilt: quranData.hasRead,
      spiritualMeaning: 'البيت الذي يُقرأ فيه القرآن يتسع بأهله ويكثر خيره وتحضره الملائكة وتفر منه الشياطين.',
      hadith: '«اقرأوا القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه.. اقرأ وارتقِ»',
      actionLabel: 'فتح المصحف والتدبر',
      tabTarget: 'quran',
      architecturalEffect: 'يملأ نوافذ الأبراج والقصر بضياء ذهبي متوهج وخطوط مشربية إسلامية دقيقة.'
    },
    quran_sunrays: {
      title: 'أشعة شمس الوحي والقرآن الكريم (النور الشامل)',
      subtitle: 'أشعة ذهبية شمسية تغمر أرجاء القلعة بحسب التلاوة والسماع والحفظ',
      statusText: quranData.percent > 0 
        ? `قوة الأشعة: ${quranData.percent}% سطوعاً تغمر سماء وصرح القلعة (${quranData.summary}) ☀️`
        : 'أشعة كامنة — رتّل أو استمع أو احفظ آيات لتنبثق أشعة الشمس وتغطي القلعة',
      isBuilt: quranData.percent > 0,
      spiritualMeaning: 'القرآن نور يقذفه الله في القلب والبنيان؛ البيت الذي يُقرأ فيه القرآن يتراءى لأهل السماء بالضياء كما تتراءى النجوم لأهل الأرض.',
      hadith: '«عَلَيْكَ بِتِلَاوَةِ الْقُرْآنِ، فَإِنَّهُ نُورٌ لَكَ فِي الْأَرْضِ، وَذُخْرٌ لَكَ فِي السَّمَاءِ»',
      actionLabel: 'فتح محراب القرآن (تلاوة • سماع • حفظ)',
      tabTarget: 'quran',
      architecturalEffect: 'تنبثق حزم أشعة شمسية ذهبية تغطي كافة أرجاء القلعة وأبراجها وأسوارها، وتتصاعد قوتها وكثافتها وذرات نورها العائمة مع زيادة نسبة الورد.'
    },
    fasting_gate: {
      title: 'بوابة الريّان وحصن الصيام (الجُنّة البلورية)',
      subtitle: 'بوابة كريستالية حصينة تصد لفحات الشهوة',
      statusText: nawafilData.fasting 
        ? 'مشيدة ومتوهجة ببركة الصيام البلورية ❄️' 
        : 'غير متفعلة — الصيام جُنّة ووقاية من النار',
      isBuilt: nawafilData.fasting,
      spiritualMeaning: 'الصوم جُنّة يستجن بها العبد من الشهوات، وللصائمين باب الريان في الجنة لا يدخله غيرهم.',
      hadith: '«الصِّيَامُ جُنَّةٌ، فَلَا يَرْفُثْ وَلَا يَجْهَلْ.. إِنَّ فِي الجَنَّةِ بَابًا يُقَالُ لَهُ الرَّيَّانُ»',
      actionLabel: 'تسجيل صيام اليوم',
      tabTarget: 'entry',
      architecturalEffect: 'يشيد بوابة حصينة بأقواس حديدية وبلورية ونقش ذهبي لباب الريان.'
    },
    tazkiya_gardens: {
      title: 'رياض التزكية والقلب السليم (واحة النخيل)',
      subtitle: 'نخيل باسق وثمار يانعة تروي جنبات القلعة',
      statusText: `مزهرة بنخيل يانع وأعمال قلوب صالحة 🌴`,
      isBuilt: heartDeedsCount > 0 || isSimulation,
      spiritualMeaning: 'إذا صلح القلب صلح الجسد كله، وأعمال القلوب كالإخلاص والصبر هي البستان الذي يحيي القلعة.',
      hadith: '«إِنَّ اللَّهَ لا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ»',
      actionLabel: 'تزكية ومحاسبة القلب',
      tabTarget: 'heart',
      architecturalEffect: 'تنمو وتتكاثر أشجار النخيل في فناء القلعة بحسب عدد مقامات وأعمال القلوب المسجلة.'
    },
    remembrance_moat: {
      title: 'خندق الاستغفار والتسبيح الرقراق (حاجز الغفلة)',
      subtitle: 'قناة مائية رقراقة تحيط بأسوار القلعة السفلية',
      statusText: athkarShield.counters > 0 
        ? `ممتلئ بالماء بنسبة ${Math.min(100, Math.round((athkarShield.counters / 500) * 100))}% (${athkarShield.counters.toLocaleString()} ذكراً من ٥٠٠) 🌊`
        : 'خندق جاف — أدر السبحة ليفيض الخندق بالماء العذب (يمتلئ عند ٥٠٠ تسبيحة)',
      isBuilt: athkarShield.counters > 0,
      spiritualMeaning: 'الاستغفار والتسبيح يطهر النفس ويشكل خندقاً يعجز إبليس وجنده عن اجتيازه.',
      hadith: '«كلمتان خفيفتان على اللسان ثقيلتان في الميزان حبيبتان إلى الرحمن: سبحان الله وبحمده سبحان الله العظيم»',
      actionLabel: 'فتح السبحة الإلكترونية',
      tabTarget: 'subha',
      architecturalEffect: 'يرتفع منسوب المياه الزرقاء الرقراقة المتلألئة في الخندق المحيط مع كل تسبيحة حتى يمتلئ تماماً عند ٥٠٠ تسبيحة.'
    }
  };

  // =========================================================================
  // محرك الرسم الهندسي والتفاعلي بالـ HTML5 Canvas 2D Engine
  // =========================================================================
  const renderFortress = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    // 0. تهيئة وتفريغ اللوحة
    ctx.clearRect(0, 0, width, height);

    const groundY = 470;
    const mainWallHeight = 24 + (fardDoneCount * 21);
    const mainWallTopY = groundY - mainWallHeight;
    const hasOuterWall = athkarShield.totalPercent >= 35;
    const outerWallHeight = hasOuterWall ? 18 + Math.round((athkarShield.totalPercent / 100) * 28) : 0;
    const outerWallTopY = groundY - outerWallHeight;

    const shieldRx = 280 + Math.round((athkarShield.totalPercent / 100) * 120);
    const shieldRy = 145 + Math.round((athkarShield.totalPercent / 100) * 75);

    // 1. خلفية السماء الليلية التدرجية الفاخرة
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(0.55, '#064e3b');
    skyGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. النجوم المتلألئة المنيرة في السماء
    const stars = [
      { x: 80, y: 60, r: 1.5 },
      { x: 150, y: 40, r: 2 },
      { x: 230, y: 75, r: 1.5 },
      { x: 320, y: 35, r: 1.2 },
      { x: 480, y: 45, r: 2 },
      { x: 580, y: 65, r: 1.5 },
      { x: 700, y: 40, r: 2 },
      { x: 770, y: 80, r: 1.2 },
      { x: 110, y: 120, r: 1.5 },
      { x: 720, y: 110, r: 1.8 }
    ];

    stars.forEach((star, idx) => {
      const twinkle = 0.5 + 0.5 * Math.sin(time * 3 + idx * 1.5);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(254, 240, 138, ${twinkle * (fortressScore > 40 ? 0.95 : 0.4)})`;
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = twinkle > 0.7 ? 8 : 2;
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // 3. هلال السماء الذهبي
    ctx.save();
    ctx.translate(730, 45);
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(20, 20, 18, 0.2 * Math.PI, 1.8 * Math.PI, false);
    ctx.arc(26, 20, 14, 1.7 * Math.PI, 0.3 * Math.PI, true);
    ctx.closePath();
    ctx.fill();
    // نجمة بجانب الهلال
    ctx.beginPath();
    ctx.arc(10, 8, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();

    // 3.5. أشعة شمس الوحي والقرآن الكريم (تغطي أرجاء القلعة بحسب نسبة الإنجاز في التلاوة والسماع والحفظ)
    const quranPercent = quranData.percent;
    const isSunHovered = hoveredSection === 'quran_sunrays' || activeSection === 'quran_sunrays';
    const sunX = 430;
    const sunY = 32;

    if (quranPercent > 0 || isSunHovered || isSimulation) {
      ctx.save();
      const intensity = quranPercent / 100;
      const pulse = 1 + 0.04 * Math.sin(time * 2.2);

      // (أ) هالة النور الشمسية الكبرى (Solar Corona Bloom)
      const bloomRadius = (170 + intensity * 260) * pulse;
      const bloomGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, bloomRadius);
      bloomGrad.addColorStop(0, `rgba(254, 240, 138, ${0.45 * intensity})`);
      bloomGrad.addColorStop(0.35, `rgba(251, 191, 36, ${0.28 * intensity})`);
      bloomGrad.addColorStop(0.7, `rgba(245, 158, 11, ${0.12 * intensity})`);
      bloomGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = bloomGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, bloomRadius, 0, Math.PI * 2);
      ctx.fill();

      // (ب) حزم أشعة الشمس الممتدة التفاعلية (Volumetric Sunrays Covering the Entire Place)
      // عدد الحزم وقوتها واتساعها يتصاعد مع نسبة الإنجاز
      const rayCount = Math.max(12, Math.round(14 + intensity * 18)); // من 14 إلى 32 شعاعاً
      const maxRayDist = Math.hypot(width, height); // يمتد ليغطي كافة أرجاء اللوحة وزواياها (أكثر من 1000px)

      for (let i = 0; i < rayCount; i++) {
        // توزيع زوايا الأشعة لتغطي نصف القطر السفلي والأجناب (من أقصى اليسار لليمين وللأرض)
        const baseAngle = -0.15 * Math.PI + (i / (rayCount - 1)) * (1.3 * Math.PI);
        // تموج حي انسيابي ناعم مع حركة الزمن
        const shimmer = Math.sin(time * 1.6 + i * 0.75);
        const rayAngle = baseAngle + shimmer * 0.025;
        // اتساع الشعاع يتناسب طردياً مع النسبة
        const raySpread = (0.038 + 0.045 * intensity) * (1 + 0.15 * shimmer);

        const a1 = rayAngle - raySpread / 2;
        const a2 = rayAngle + raySpread / 2;

        const rayGrad = ctx.createLinearGradient(
          sunX, 
          sunY, 
          sunX + Math.cos(rayAngle) * maxRayDist * 0.85, 
          sunY + Math.sin(rayAngle) * maxRayDist * 0.85
        );

        // قوة وشفافية الشعاع بحسب النسبة
        const alphaPeak = (0.28 * intensity + 0.06 * Math.sin(time * 2 + i)) * (isSunHovered ? 1.4 : 1.0);
        rayGrad.addColorStop(0, `rgba(254, 240, 138, ${Math.min(0.9, alphaPeak * 1.5)})`);
        rayGrad.addColorStop(0.25, `rgba(253, 224, 71, ${alphaPeak})`);
        rayGrad.addColorStop(0.55, `rgba(251, 191, 36, ${alphaPeak * 0.6})`);
        rayGrad.addColorStop(0.85, `rgba(245, 158, 11, ${alphaPeak * 0.2})`);
        rayGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(sunX + Math.cos(a1) * maxRayDist, sunY + Math.sin(a1) * maxRayDist);
        ctx.lineTo(sunX + Math.cos(a2) * maxRayDist, sunY + Math.sin(a2) * maxRayDist);
        ctx.closePath();
        ctx.fill();
      }

      // (ج) قرص شمس الوحي والقرآن الكريم (Celestial Sun Disc)
      const coreRadius = 22 + intensity * 6;
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = isSunHovered ? 25 : (15 + intensity * 10);

      // هالة إشعاع شمسية دائرية ذهبية
      const coreGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, coreRadius);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.35, '#fef08a');
      coreGrad.addColorStop(0.75, '#f59e0b');
      coreGrad.addColorStop(1, '#b45309');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // خاتم وزخرفة إسلامية ثمانية الأضلاع لشمس الوحي
      ctx.strokeStyle = isSunHovered ? '#ffffff' : '#fef08a';
      ctx.lineWidth = 2;
      const starPoints = 8;
      const outerR = coreRadius + 7;
      const innerR = coreRadius + 2;
      ctx.beginPath();
      for (let s = 0; s < starPoints * 2; s++) {
        const rad = (s * Math.PI) / starPoints + time * 0.2;
        const r = s % 2 === 0 ? outerR : innerR;
        const sx = sunX + Math.cos(rad) * r;
        const sy = sunY + Math.sin(rad) * r;
        if (s === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.stroke();

      // أيقونة المصحف الشريف في قلب شمس الوحي
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(sunX, sunY + 6);
      ctx.quadraticCurveTo(sunX - 7, sunY - 2, sunX - 11, sunY - 6);
      ctx.lineTo(sunX - 11, sunY + 2);
      ctx.quadraticCurveTo(sunX - 7, sunY + 5, sunX, sunY + 9);
      ctx.quadraticCurveTo(sunX + 7, sunY + 5, sunX + 11, sunY + 2);
      ctx.lineTo(sunX + 11, sunY - 6);
      ctx.quadraticCurveTo(sunX + 7, sunY - 2, sunX, sunY + 6);
      ctx.fill();

      // صفحات المصحف البيضاء المنيرة
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sunX, sunY + 5);
      ctx.quadraticCurveTo(sunX - 6, sunY - 1, sunX - 10, sunY - 5);
      ctx.lineTo(sunX - 10, sunY + 1);
      ctx.quadraticCurveTo(sunX - 6, sunY + 4, sunX, sunY + 8);
      ctx.quadraticCurveTo(sunX + 6, sunY + 4, sunX + 10, sunY + 1);
      ctx.lineTo(sunX + 10, sunY - 5);
      ctx.quadraticCurveTo(sunX + 6, sunY - 1, sunX, sunY + 5);
      ctx.fill();

      // نسبة ضياء القرآن تحت الشمس
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 9.5px Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${quranPercent}% شمس القرآن`, sunX, sunY + coreRadius + 14);

      ctx.restore();
    } else {
      // شمس الوحي في طور البزوغ الهادئ بانتظار تلاوة الورد
      ctx.save();
      ctx.strokeStyle = isSunHovered ? '#fde047' : '#334155';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isSunHovered ? '#fde047' : '#64748b';
      ctx.font = 'bold 8.5px Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('شمس الوحي (رتّل لتشرق)', sunX, sunY + 34);
      ctx.restore();
    }

    // 4. شعاع ومنارة قيام الليل والتهجد (إذا تحققت)
    if (nawafilData.qiyam) {
      ctx.save();
      // عمود النور الخارق للسماء
      const beamGrad = ctx.createLinearGradient(352, 180, 352, 0);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
      beamGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.6)');
      beamGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(340, 180);
      ctx.lineTo(365, 180);
      ctx.lineTo(395, 0);
      ctx.lineTo(310, 0);
      ctx.closePath();
      ctx.fill();

      // خط نور مستقيم نابض
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(352, 180);
      ctx.lineTo(352, 0);
      ctx.stroke();
      ctx.setLineDash([]);

      // نجمة التهجد في كبد السماء
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(352, 22, 6, 0, Math.PI * 2);
      ctx.fill();

      // منارة القيام الرشيقة
      const isQiyamHovered = hoveredSection === 'qiyam_spire' || activeSection === 'qiyam_spire';
      ctx.fillStyle = isQiyamHovered ? '#10b981' : '#047857';
      ctx.strokeStyle = isQiyamHovered ? '#fde047' : '#10b981';
      ctx.lineWidth = isQiyamHovered ? 3 : 2;
      ctx.fillRect(338, 105, 28, 235);
      ctx.strokeRect(338, 105, 28, 235);

      // شرفة المنارة
      ctx.fillStyle = '#065f46';
      ctx.strokeStyle = '#fbbf24';
      ctx.fillRect(332, 98, 40, 12);
      ctx.strokeRect(332, 98, 40, 12);

      // قبة المنارة
      ctx.beginPath();
      ctx.moveTo(338, 98);
      ctx.quadraticCurveTo(352, 75, 366, 98);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // نوافذ المنارة المتلألئة
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(348, 125, 8, 16);
      ctx.fillRect(348, 160, 8, 16);
      ctx.fillRect(348, 195, 8, 16);
      ctx.restore();
    }

    // 5. درع وهالة الأذكار النورانية الأثيرية
    if (athkarShield.totalPercent > 0) {
      ctx.save();
      const pulse = 1 + 0.03 * Math.sin(time * 2);
      const isShieldHovered = hoveredSection === 'athkar_shield' || activeSection === 'athkar_shield';

      ctx.beginPath();
      ctx.ellipse(430, 310, shieldRx * pulse, shieldRy * pulse, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isShieldHovered ? '#fde047' : (athkarShield.totalPercent > 40 ? '#34d399' : '#334155');
      ctx.lineWidth = athkarShield.totalPercent >= 80 ? 5 : (athkarShield.totalPercent >= 40 ? 3 : 1.5);
      if (athkarShield.totalPercent < 100) {
        ctx.setLineDash([12, 8]);
      }
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = athkarShield.totalPercent > 50 ? 16 : 4;
      ctx.stroke();
      ctx.setLineDash([]);

      // هالة إشعاع خفيفة داخلية
      if (athkarShield.totalPercent >= 60) {
        ctx.fillStyle = 'rgba(52, 211, 153, 0.08)';
        ctx.fill();
      }

      // أختام التحصين على المحيط
      const drawShieldSeal = (x: number, y: number, text: string, color: string) => {
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#065f46';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Tahoma, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
      };

      if (athkarShield.morning) {
        drawShieldSeal(430 - shieldRx + 25, 310, 'صباح', '#fef08a');
      }
      if (athkarShield.evening) {
        drawShieldSeal(430 + shieldRx - 25, 310, 'مساء', '#38bdf8');
      }
      if (athkarShield.sleep) {
        drawShieldSeal(430, 310 - shieldRy + 15, 'نوم', '#fbbf24');
      }
      ctx.restore();
    }

    // 6. خندق التسبيح والاستغفار المائي السفلي
    ctx.save();
    const isMoatHovered = hoveredSection === 'remembrance_moat' || activeSection === 'remembrance_moat';
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(60, 490);
    ctx.quadraticCurveTo(430, 525, 800, 490);
    ctx.lineTo(810, 550);
    ctx.lineTo(50, 550);
    ctx.closePath();
    ctx.fill();

    const moatFillRatio = Math.min(1, athkarShield.counters / 500);
    if (moatFillRatio > 0) {
      const waterY = 515 - Math.round(moatFillRatio * 18);
      const waterGrad = ctx.createLinearGradient(0, waterY, 0, 550);
      waterGrad.addColorStop(0, '#38bdf8');
      waterGrad.addColorStop(0.5, '#0284c7');
      waterGrad.addColorStop(1, '#0369a1');

      ctx.fillStyle = waterGrad;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = isMoatHovered ? 15 : 6;
      ctx.beginPath();
      ctx.moveTo(70, waterY);
      // أمواج جيبية متحركة في الماء
      for (let wx = 70; wx <= 790; wx += 20) {
        const waveY = waterY + 3 * Math.sin(time * 3 + wx * 0.03);
        ctx.lineTo(wx, waveY);
      }
      ctx.lineTo(805, 545);
      ctx.lineTo(55, 545);
      ctx.closePath();
      ctx.fill();

      // لمعان سطح الماء
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let wx = 90; wx <= 770; wx += 25) {
        const waveY = waterY + 2.5 * Math.sin(time * 3 + wx * 0.03);
        if (wx === 90) ctx.moveTo(wx, waveY);
        else ctx.lineTo(wx, waveY);
      }
      ctx.stroke();
    }

    // جسر العبور الحجري المؤدي للباب الرئيسي
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(390, 470);
    ctx.lineTo(470, 470);
    ctx.lineTo(485, 525);
    ctx.lineTo(375, 525);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 7. بساتين التزكية وأشجار النخيل
    const drawPalm = (px: number, py: number, flip: boolean) => {
      ctx.save();
      ctx.translate(px, py);
      if (flip) ctx.scale(-1, 1);

      // جذع النخلة
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(15, 50);
      ctx.quadraticCurveTo(22 + Math.sin(time * 1.5) * 2, 20, 15, 0);
      ctx.stroke();

      // سعف النخل المتمايل بالنسيم
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      const sway = Math.sin(time * 2) * 3;

      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.quadraticCurveTo(38 + sway, -15, 45 + sway, 10);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.quadraticCurveTo(-10 - sway, -15, -18 - sway, 10);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.quadraticCurveTo(20, -25, 32 + sway, -20);
      ctx.stroke();

      // بلح وتمر يانع
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(15, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawPalm(75, 420, false);
    drawPalm(775, 420, true);
    if (heartDeedsCount >= 1 || isSimulation) {
      drawPalm(50, 435, false);
      drawPalm(805, 435, true);
    }

    // 8. السور الحجري الرئيسي (Main Curtain Wall)
    ctx.save();
    const isMainWallHovered = hoveredSection === 'main_curtain_wall' || activeSection === 'main_curtain_wall';
    const wallGrad = ctx.createLinearGradient(0, mainWallTopY, 0, groundY);
    wallGrad.addColorStop(0, isMainWallHovered ? '#059669' : (fardDoneCount > 0 ? '#047857' : '#1e293b'));
    wallGrad.addColorStop(1, fardDoneCount > 0 ? '#064e3b' : '#0f172a');

    ctx.fillStyle = wallGrad;
    ctx.strokeStyle = isMainWallHovered ? '#fde047' : (fardDoneCount > 0 ? '#059669' : '#334155');
    ctx.lineWidth = isMainWallHovered ? 3.5 : 2;

    ctx.beginPath();
    ctx.moveTo(140, groundY);
    ctx.lineTo(720, groundY);
    ctx.lineTo(710, mainWallTopY);
    ctx.lineTo(150, mainWallTopY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // خطوط المداميك الحجرية (Stone Masonry Courses)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= fardDoneCount; i++) {
      const yPos = groundY - (i * 20) - 10;
      if (yPos > mainWallTopY) {
        ctx.beginPath();
        ctx.moveTo(150, yPos);
        ctx.lineTo(710, yPos);
        ctx.stroke();
      }
    }

    // شرفات مسننة أعلى الجدار الرئيسي
    if (fardDoneCount > 0) {
      ctx.fillStyle = '#065f46';
      ctx.strokeStyle = '#10b981';
      [160, 185, 210, 310, 335, 515, 540, 640, 665, 690].forEach(mx => {
        ctx.fillRect(mx, mainWallTopY - 10, 15, 10);
        ctx.strokeRect(mx, mainWallTopY - 10, 15, 10);
      });
    }
    ctx.restore();

    // 9. السور الخارجي المتقدم (Outer Athkar Wall)
    if (hasOuterWall) {
      ctx.save();
      const isOuterWallHovered = hoveredSection === 'outer_athkar_wall' || activeSection === 'outer_athkar_wall';
      const outerGrad = ctx.createLinearGradient(0, outerWallTopY, 0, groundY);
      outerGrad.addColorStop(0, '#0d9488');
      outerGrad.addColorStop(1, '#115e59');

      ctx.fillStyle = outerGrad;
      ctx.strokeStyle = isOuterWallHovered ? '#fde047' : '#14b8a6';
      ctx.lineWidth = isOuterWallHovered ? 3 : 2;

      ctx.beginPath();
      ctx.moveTo(170, groundY);
      ctx.lineTo(690, groundY);
      ctx.lineTo(680, outerWallTopY);
      ctx.lineTo(180, outerWallTopY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // شرفات السور الخارجي
      ctx.fillStyle = '#115e59';
      ctx.strokeStyle = '#2dd4bf';
      [190, 215, 300, 325, 535, 560, 645, 670].forEach(mx => {
        ctx.fillRect(mx, outerWallTopY - 8, 14, 8);
        ctx.strokeRect(mx, outerWallTopY - 8, 14, 8);
      });
      ctx.restore();
    }

    // 10. شرفات السنن الرواتب والرايات (Rawatib Loggia & Flags)
    if (nawafilData.rawatib) {
      ctx.save();
      const isRawatibHovered = hoveredSection === 'rawatib' || activeSection === 'rawatib';
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = isRawatibHovered ? '#fff' : '#b45309';
      ctx.lineWidth = 1.5;
      ctx.fillRect(295, mainWallTopY - 18, 55, 14);
      ctx.strokeRect(295, mainWallTopY - 18, 55, 14);
      ctx.fillRect(510, mainWallTopY - 18, 55, 14);
      ctx.strokeRect(510, mainWallTopY - 18, 55, 14);

      // رايات إسلامية خضراء ترفرف
      const wave = Math.sin(time * 4) * 3;
      // راية اليسار
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(144, 250);
      ctx.lineTo(144, 226);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(144, 226);
      ctx.lineTo(162 + wave, 232);
      ctx.lineTo(144, 238);
      ctx.closePath();
      ctx.fill();

      // راية اليمين
      ctx.beginPath();
      ctx.moveTo(716, 250);
      ctx.lineTo(716, 226);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(716, 226);
      ctx.lineTo(734 + wave, 232);
      ctx.lineTo(716, 238);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 11. بوابة الريّان والصيام الحصينة (Fasting Gate)
    ctx.save();
    const isGateHovered = hoveredSection === 'fasting_gate' || activeSection === 'fasting_gate';
    ctx.fillStyle = nawafilData.fasting ? '#0369a1' : '#0f172a';
    ctx.strokeStyle = isGateHovered ? '#fde047' : (nawafilData.fasting ? '#38bdf8' : '#334155');
    ctx.lineWidth = isGateHovered ? 4 : 3;
    if (nawafilData.fasting) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
    }

    ctx.beginPath();
    ctx.moveTo(385, 470);
    ctx.lineTo(385, 385);
    ctx.quadraticCurveTo(430, 350, 475, 385);
    ctx.lineTo(475, 470);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // مصراعا الباب
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(430, 365);
    ctx.lineTo(430, 470);
    ctx.stroke();

    if (nawafilData.fasting) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('بَابُ الرَّيَّان', 430, 405);
    }
    ctx.restore();

    // 12. نوافذ مشكاة القرآن (Quran Windows)
    ctx.save();
    const isQuranHovered = hoveredSection === 'quran_light' || activeSection === 'quran_light';
    const drawWindow = (wx: number, wy: number) => {
      ctx.fillStyle = quranData.hasRead ? '#fef08a' : '#1e293b';
      ctx.strokeStyle = isQuranHovered ? '#fff' : '#f59e0b';
      ctx.lineWidth = quranData.hasRead ? 2 : 1;
      if (quranData.hasRead) {
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 12;
      }

      ctx.beginPath();
      ctx.moveTo(wx, wy + 30);
      ctx.lineTo(wx, wy);
      ctx.quadraticCurveTo(wx + 15, wy - 10, wx + 30, wy);
      ctx.lineTo(wx + 30, wy + 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (quranData.hasRead) {
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx + 15, wy - 5);
        ctx.lineTo(wx + 15, wy + 30);
        ctx.moveTo(wx, wy + 15);
        ctx.lineTo(wx + 30, wy + 15);
        ctx.stroke();
      }
    };

    drawWindow(270, 380);
    drawWindow(560, 380);
    ctx.restore();

    // 13. قبة صلاة الضحى الذهبية (Duha Dome)
    if (nawafilData.duha) {
      ctx.save();
      const isDuhaHovered = hoveredSection === 'duha_dome' || activeSection === 'duha_dome';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = isDuhaHovered ? 20 : 12;

      // أشعة الشمس
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(495, 210);
      ctx.lineTo(475, 175);
      ctx.moveTo(510, 200);
      ctx.lineTo(510, 160);
      ctx.moveTo(525, 210);
      ctx.lineTo(545, 175);
      ctx.stroke();

      // القبة الذهبية
      const domeGrad = ctx.createLinearGradient(485, 185, 535, 240);
      domeGrad.addColorStop(0, '#fef08a');
      domeGrad.addColorStop(0.5, '#f59e0b');
      domeGrad.addColorStop(1, '#b45309');

      ctx.fillStyle = domeGrad;
      ctx.strokeStyle = isDuhaHovered ? '#fff' : '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(485, 240);
      ctx.quadraticCurveTo(510, 185, 535, 240);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(510, 188, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 14. رسم أبراج الفرائض الخمس (Tower Drawer Function)
    const drawTower = (
      sectionId: FortressSection,
      tx: number,
      tWidth: number,
      tHeight: number,
      isBuilt: boolean,
      isCongregation: boolean,
      name: string,
      accentColor: string,
      isCentralKeep: boolean = false
    ) => {
      ctx.save();
      const isHovered = hoveredSection === sectionId || activeSection === sectionId;
      const topY = groundY - tHeight;

      if (isBuilt) {
        // تدرج بدن البرج
        const towerGrad = ctx.createLinearGradient(tx, topY, tx + tWidth, groundY);
        towerGrad.addColorStop(0, isCentralKeep ? '#34d399' : '#10b981');
        towerGrad.addColorStop(0.5, isHovered ? '#059669' : '#047857');
        towerGrad.addColorStop(1, '#022c22');

        ctx.fillStyle = towerGrad;
        ctx.strokeStyle = isHovered ? '#fde047' : (isCentralKeep ? '#fbbf24' : '#059669');
        ctx.lineWidth = isHovered ? 4 : (isCentralKeep ? 3 : 2.5);
        if (isHovered) {
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 18;
        }

        ctx.beginPath();
        ctx.roundRect(tx, topY, tWidth, tHeight, [6, 6, 0, 0]);
        ctx.fill();
        ctx.stroke();

        // شرفة البرج العلوية
        const bMargin = isCentralKeep ? 12 : 6;
        ctx.fillStyle = '#065f46';
        ctx.strokeStyle = isHovered ? '#fde047' : '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(tx - bMargin, topY - (isCentralKeep ? 18 : 12), tWidth + bMargin * 2, isCentralKeep ? 20 : 14, 3);
        ctx.fill();
        ctx.stroke();

        // قبة البرج
        const domeHeight = isCongregation ? 42 : 32;
        const domePeakY = topY - (isCentralKeep ? 18 : 12) - domeHeight;
        const domeGrad = ctx.createLinearGradient(tx, domePeakY, tx + tWidth, topY);
        domeGrad.addColorStop(0, isCentralKeep ? '#fef08a' : accentColor);
        domeGrad.addColorStop(1, '#065f46');

        ctx.fillStyle = domeGrad;
        ctx.beginPath();
        ctx.moveTo(tx, topY - (isCentralKeep ? 18 : 12));
        ctx.quadraticCurveTo(tx + tWidth / 2, domePeakY, tx + tWidth, topY - (isCentralKeep ? 18 : 12));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // قمة القبة
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(tx + tWidth / 2, domePeakY, isCentralKeep ? 5.5 : 4, 0, Math.PI * 2);
        ctx.fill();

        // نافذة البرج المضيئة
        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 10;
        const winW = isCentralKeep ? 24 : 16;
        const winH = isCentralKeep ? 36 : 28;
        ctx.beginPath();
        ctx.roundRect(tx + (tWidth - winW) / 2, topY + 30, winW, winH, [8, 8, 4, 4]);
        ctx.fill();

        // تاج صلاة الجماعة إن وُجد
        if (isCongregation) {
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(tx + tWidth / 2, domePeakY - 14, 7, 0, Math.PI * 2);
          ctx.fill();
        }

        // تسمية البرج
        ctx.shadowBlur = 0;
        ctx.fillStyle = isCentralKeep ? '#fef08a' : '#fff';
        ctx.font = `bold ${isCentralKeep ? '13px' : '11px'} Tahoma, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(name, tx + tWidth / 2, topY + (isCentralKeep ? 110 : 80));

        // قياس الارتفاع بالأمتار
        ctx.fillStyle = '#a7f3d0';
        ctx.font = 'bold 9px Tahoma, sans-serif';
        ctx.fillText(`${tHeight}م`, tx + tWidth / 2, topY + (isCentralKeep ? 126 : 95));
      } else {
        // البرج غير المشيد — يظهر كأساس أرضي ممهد مع خطوط منقطة
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = isHovered ? '#fde047' : '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(tx, groundY - 22, tWidth, 22, 3);
        ctx.fill();
        ctx.stroke();

        // خطوط الأساس التخطيطية للأعلى
        ctx.strokeStyle = isHovered ? '#64748b' : '#334155';
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(tx, topY, tWidth, tHeight);
        ctx.setLineDash([]);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 9px Tahoma, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${name} (قيد الإقامة)`, tx + tWidth / 2, groundY - 7);
      }
      ctx.restore();
    };

    // رسم الأبراج الخمسة بحسب الترتيب المطلوب:
    // الفجر فى المنتصف يليه الظهر ثم العصر، وعلى الشمال المغرب تليه العشاء

    // 1. المغرب (أقصى الشمال/اليسار: x = 110, w = 68)
    drawTower(
      'maghrib',
      110,
      68,
      fardData.maghrib.performed ? (fardData.maghrib.inCongregation ? 226 : 190) : 190,
      fardData.maghrib.performed,
      fardData.maghrib.inCongregation,
      'المغرب',
      '#fb923c'
    );

    // 2. العشاء (شمال/يسار الوسط تليه العشاء: x = 235, w = 72)
    drawTower(
      'isha',
      235,
      72,
      fardData.isha.performed ? (fardData.isha.inCongregation ? 256 : 220) : 220,
      fardData.isha.performed,
      fardData.isha.inCongregation,
      'العشاء',
      '#fef08a'
    );

    // 3. الفجر — الصرح المركزي الأكبر (في المنتصف: x = 365, w = 130)
    drawTower(
      'fajr',
      365,
      130,
      fardData.fajr.performed ? (fardData.fajr.inCongregation ? 296 : 260) : 260,
      fardData.fajr.performed,
      fardData.fajr.inCongregation,
      'الفجر',
      '#38bdf8',
      true
    );

    // 4. الظهر (يمين الوسط يليه الظهر: x = 553, w = 72)
    drawTower(
      'dhuhr',
      553,
      72,
      fardData.dhuhr.performed ? (fardData.dhuhr.inCongregation ? 256 : 220) : 220,
      fardData.dhuhr.performed,
      fardData.dhuhr.inCongregation,
      'الظهر',
      '#fde047'
    );

    // 5. العصر (أقصى اليمين ثم العصر: x = 682, w = 68)
    drawTower(
      'asr',
      682,
      68,
      fardData.asr.performed ? (fardData.asr.inCongregation ? 226 : 190) : 190,
      fardData.asr.performed,
      fardData.asr.inCongregation,
      'العصر',
      '#fbbf24'
    );

    // 6. ذرات النور والبركة العائمة والضياء الشامل لأشعة شمس القرآن (تغمر كامل البنيان)
    if (quranData.percent > 0 || isSimulation) {
      ctx.save();
      const intensity = quranData.percent / 100;

      // غشاوة ضوء ذهبي رقيقة تغمر المكان كله
      const ambientGrad = ctx.createRadialGradient(430, 32, 80, 430, 280, 520);
      ambientGrad.addColorStop(0, `rgba(254, 240, 138, ${0.14 * intensity})`);
      ambientGrad.addColorStop(0.5, `rgba(251, 191, 36, ${0.08 * intensity})`);
      ambientGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      // ذرات نور وبركة متلألئة تتطاير فوق القلعة كالشهب الصغيرة
      const motesCount = Math.round(14 + intensity * 26);
      for (let m = 0; m < motesCount; m++) {
        const seed = m * 47.13;
        const mx = (seed * 19.3 + time * 16 * (1 + (m % 3) * 0.35)) % (width + 60) - 30;
        const my = (seed * 31.7 + time * 24 * (0.7 + (m % 4) * 0.25)) % (height - 30);
        const mRadius = 1.2 + 1.6 * Math.sin(time * 3 + seed);
        const mAlpha = (0.35 + 0.45 * Math.sin(time * 2.5 + seed)) * intensity;

        ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0, mAlpha)})`;
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(mx, my, Math.max(0.8, mRadius), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }, [
    fardData,
    fardDoneCount,
    athkarShield,
    nawafilData,
    quranData,
    heartDeedsCount,
    fortressScore,
    hoveredSection,
    activeSection,
    isSimulation
  ]);

  // حلقة الرسوم المتحركة المستمرة (60fps Animation Loop)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      renderFortress(ctx, canvas.width, canvas.height, elapsed);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderFortress]);

  // استكشاف العنصر عند تحريك الفأرة أو النقر (Hit Testing)
  const getSectionFromCoords = (x: number, y: number): FortressSection | null => {
    // قرص شمس الوحي وأشعة القرآن الكريم العلوية
    if (x >= 370 && x <= 490 && y >= 0 && y <= 68) return 'quran_sunrays';
    if ((quranData.percent > 0 || isSimulation) && y <= 95 && Math.abs(x - 430) < 160 && !(nawafilData.qiyam && x >= 330 && x <= 370)) return 'quran_sunrays';

    // خندق التسبيح
    if (y >= 490 && y <= 550) return 'remembrance_moat';
    // بوابة الريان
    if (x >= 385 && x <= 475 && y >= 360 && y <= 470) return 'fasting_gate';
    // برج الفجر (المركزي في المنتصف)
    if (x >= 365 && x <= 495 && y >= 170 && y <= 470) return 'fajr';
    // منارة القيام
    if (nawafilData.qiyam && x >= 330 && x <= 370 && y >= 75 && y <= 340) return 'qiyam_spire';
    // قبة الضحى
    if (nawafilData.duha && x >= 485 && x <= 535 && y >= 180 && y <= 245) return 'duha_dome';
    // برج العشاء (شمال/يسار الوسط تلي المغرب)
    if (x >= 235 && x <= 307 && y >= 210 && y <= 470) return 'isha';
    // برج الظهر (يمين الوسط يلي الفجر)
    if (x >= 553 && x <= 625 && y >= 210 && y <= 470) return 'dhuhr';
    // برج المغرب (أقصى الشمال/اليسار)
    if (x >= 110 && x <= 178 && y >= 240 && y <= 470) return 'maghrib';
    // برج العصر (أقصى اليمين ثم العصر)
    if (x >= 682 && x <= 750 && y >= 240 && y <= 470) return 'asr';
    // نوافذ القرآن
    if ((x >= 270 && x <= 300 && y >= 370 && y <= 420) || (x >= 560 && x <= 590 && y >= 370 && y <= 420)) return 'quran_light';
    // السور الخارجي للأذكار
    if (athkarShield.totalPercent >= 35 && y >= 430 && y <= 470) return 'outer_athkar_wall';
    // السور الرئيسي
    if (y >= 340 && y <= 470) return 'main_curtain_wall';
    // بساتين التزكية
    if ((x <= 110 && y >= 400) || (x >= 750 && y >= 400)) return 'tazkiya_gardens';
    // درع الأذكار الأثيري
    return 'athkar_shield';
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const section = getSectionFromCoords(x, y);
    setHoveredSection(section);
  };

  const handleCanvasMouseLeave = () => {
    setHoveredSection(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const section = getSectionFromCoords(x, y);
    if (section) {
      setActiveSection(section);
    }
  };

  const prayerKeyMap: Record<string, { key: PrayerName; label: string }> = {
    fajr: { key: PrayerName.FAJR, label: 'صلاة الفجر' },
    dhuhr: { key: PrayerName.DHUHR, label: 'صلاة الظهر' },
    asr: { key: PrayerName.ASR, label: 'صلاة العصر' },
    maghrib: { key: PrayerName.MAGHRIB, label: 'صلاة المغرب' },
    isha: { key: PrayerName.ISHA, label: 'صلاة العشاء' },
  };

  const handleQuickTogglePrayer = (prayerKey: PrayerName, inCongregation: boolean) => {
    if (!onUpdateLog) return;
    const currentEntry = prayers[prayerKey] || (prayers as any)[prayerKey] || {};
    const isCurrentlyPerformed = Boolean(currentEntry.performed);
    const isSameCong = Boolean(currentEntry.inCongregation) === inCongregation;

    let updatedEntry: PrayerEntry;
    if (isCurrentlyPerformed && isSameCong) {
      // إلغاء التحديد
      updatedEntry = {
        ...currentEntry,
        performed: false,
        inCongregation: false
      };
    } else {
      updatedEntry = {
        ...currentEntry,
        performed: true,
        inCongregation
      };
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.7 }
      });
    }

    const updatedLog: DailyLog = {
      ...log,
      prayers: {
        ...log.prayers,
        [prayerKey]: updatedEntry
      }
    };

    onUpdateLog(
      updatedLog,
      updatedEntry.performed ? `أتمَّ ${prayerKey}${inCongregation ? ' (جماعة)' : ''}` : undefined,
      'prayer'
    );
  };

  // تصدير كصورة PNG مباشرة وفورية من الـ Canvas
  const handleExportCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isDownloading) return;
    setIsDownloading(true);

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `awrad-fortress-canvas-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3500);
    } catch (err) {
      console.error('Error generating image from canvas', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* الرأس التوضيحي وشريط التحكم العلوي */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white rounded-[2.5rem] p-6 sm:p-7 shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                محرك قلعة الإيمان التفاعلي الحي (Canvas 2D Engine)
              </span>
              {isSimulation && (
                <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-400/30 animate-pulse">
                  نمط المحاكاة التامة ✨
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black header-font text-white leading-tight">
              {fortressRank.title}
            </h2>
            <p className="text-xs text-emerald-200/80 font-bold max-w-xl leading-relaxed">
              {fortressRank.desc}
            </p>
          </div>

          {/* أزرار الإجراءات والتحكم */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            <button
              onClick={() => {
                setIsSimulation(!isSimulation);
                if (!isSimulation) {
                  confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black header-font flex items-center gap-1.5 transition-all active:scale-95 border ${
                isSimulation 
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20' 
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
              }`}
              title="معاينة شكل القلعة وتمدد أسوارها وأبراجها إذا أتممت جميع العبادات"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isSimulation ? 'إنهاء المحاكاة' : 'عاين الصرح المكتمل'}</span>
            </button>

            <button
              onClick={handleExportCanvasImage}
              disabled={isDownloading}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black header-font flex items-center gap-1.5 transition-all shadow-md active:scale-95 border border-emerald-400/30 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'جاري التصدير...' : 'حفظ اللوحة عالية الدقة'}</span>
            </button>
          </div>
        </div>

        {/* ملخص الإنجاز المعماري ونسبة التحصين */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div 
            onClick={() => setActiveSection('main_curtain_wall')} 
            className="bg-white/5 hover:bg-white/10 cursor-pointer transition-all rounded-2xl p-3 border border-white/5"
          >
            <span className="text-[10px] text-slate-400 font-bold block mb-0.5">أبراج الفرائض الخمس</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-amber-300 font-mono">{fardDoneCount}/5</span>
              <span className="text-[9px] text-emerald-300 font-bold">
                {fardDoneCount === 5 ? 'مكتملة الأركان 🏛️' : 'ترتفع تدريجياً'}
              </span>
            </div>
          </div>

          <div 
            onClick={() => setActiveSection('athkar_shield')} 
            className="bg-white/5 hover:bg-white/10 cursor-pointer transition-all rounded-2xl p-3 border border-white/5"
          >
            <span className="text-[10px] text-slate-400 font-bold block mb-0.5">درع وسور الأذكار</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-cyan-300 font-mono">{athkarShield.totalPercent}%</span>
              <span className="text-[9px] text-cyan-200 font-bold">
                {athkarShield.totalPercent >= 35 ? 'سور متقدم + درع' : 'درع أولي'}
              </span>
            </div>
          </div>

          <div 
            onClick={() => setActiveSection('qiyam_spire')} 
            className="bg-white/5 hover:bg-white/10 cursor-pointer transition-all rounded-2xl p-3 border border-white/5"
          >
            <span className="text-[10px] text-slate-400 font-bold block mb-0.5">صروح ونوافل السحر</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-emerald-300 font-mono">
                {[nawafilData.qiyam, nawafilData.duha, nawafilData.rawatib, nawafilData.fasting].filter(Boolean).length}/4
              </span>
              <span className="text-[9px] text-emerald-200 font-bold">
                {nawafilData.qiyam ? 'المنارة مشيدة ✨' : 'بانتظار التهجد'}
              </span>
            </div>
          </div>

          <div 
            onClick={() => setActiveSection('quran_sunrays')} 
            className="bg-white/5 hover:bg-white/10 cursor-pointer transition-all rounded-2xl p-3 border border-white/5"
          >
            <span className="text-[10px] text-slate-400 font-bold block mb-0.5">أشعة شمس القرآن</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-amber-300 font-mono">{quranData.percent}%</span>
              <span className="text-[9px] text-amber-200 font-bold truncate">
                {quranData.percent >= 80 ? 'تغمر القلعة ☀️' : (quranData.percent > 0 ? 'أشعة متوهجة ✨' : 'بانتظار الورد')}
              </span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[10px] text-slate-400 font-bold block mb-0.5">قوة الحصن الكلية</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-yellow-300 font-mono">{fortressScore}%</span>
              <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-amber-300 h-full transition-all duration-700 rounded-full" 
                  style={{ width: `${fortressScore}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* لوحة القلعة التفاعلية الحية بتقنية الـ Canvas 2D */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 rounded-[2.5rem] p-4 sm:p-6 shadow-2xl border border-slate-800 relative overflow-hidden flex flex-col items-center">
        <div className="w-full flex justify-between items-center px-2 py-1 mb-2 text-white/60 text-[10px] font-bold border-b border-white/5">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-amber-400" />
            بنيان قلعة الإيمان الحي — لوحة تفاعلية متجاوبة 60 FPS
          </span>
          <span className="font-mono">
            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* الكانفاس التفاعلي */}
        <div className="w-full max-w-3xl relative aspect-[4/3] sm:aspect-[16/10.5] rounded-2xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer">
          <canvas
            ref={canvasRef}
            width={860}
            height={560}
            className="w-full h-full object-contain block select-none"
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
            onClick={handleCanvasClick}
          />
        </div>

        {/* دليل الخريطة المعمارية */}
        <div className="w-full mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              أبراج مشيدة
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-dashed border-slate-400 inline-block"></span>
              قيد الإقامة
            </span>
            <span className="flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400 inline-block" />
              جماعة (+36م ارتفاع وتاج ذهبي)
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-cyan-400 inline-block" />
              سور الأذكار
            </span>
            <span className="flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-300 inline-block" />
              أشعة شمس القرآن ({quranData.percent}%)
            </span>
          </div>

          <span className="text-emerald-300 font-bold">
            💡 حرّك المؤشر أو انقر على أي برج أو سور لاستكشاف فضله وأثره المعماري المباشر
          </span>
        </div>
      </div>

      {/* بطاقة تفاصيل الركن المختار */}
      {activeSection && sectionDetails[activeSection] && (
        <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex justify-between items-start gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${sectionDetails[activeSection].isBuilt ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {sectionDetails[activeSection].isBuilt ? <CheckCircle2 className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-black header-font text-slate-900">
                  {sectionDetails[activeSection].title}
                </h3>
                <span className="text-xs font-bold text-slate-400 block">
                  {sectionDetails[activeSection].subtitle}
                </span>
              </div>
            </div>

            <button 
              onClick={() => setActiveSection(null)} 
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">حالة الركن اليوم:</span>
              <span className={`font-black ${sectionDetails[activeSection].isBuilt ? 'text-emerald-600' : 'text-amber-600'}`}>
                {sectionDetails[activeSection].statusText}
              </span>
            </div>

            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100/60 flex items-start gap-2">
              <Compass className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-emerald-900 block text-[11px]">الأثر المعماري في بنيان القلعة:</span>
                <p className="text-emerald-800 text-[11px] font-bold mt-0.5">
                  {sectionDetails[activeSection].architecturalEffect}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200/60 pt-2">
              <p className="text-slate-700 leading-relaxed font-bold">
                {sectionDetails[activeSection].spiritualMeaning}
              </p>
            </div>

            <div className="bg-white rounded-xl p-3 border border-emerald-100 text-emerald-900">
              <p className="quran-font text-xs sm:text-sm text-center leading-relaxed">
                {sectionDetails[activeSection].hadith}
              </p>
            </div>

            {/* أزرار التسجيل السريع المباشر لبرج الصلاة إذا كان فريضة */}
            {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(activeSection) && prayerKeyMap[activeSection] && onUpdateLog && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5 rounded-2xl border border-emerald-200/80 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-emerald-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    تسجيل فوري لرفع البرج في القلعة:
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    {fardData[activeSection as keyof typeof fardData]?.performed ? '✓ مشيّد الآن' : 'غير مشيّد بعد'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleQuickTogglePrayer(prayerKeyMap[activeSection].key, false)}
                    className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                      fardData[activeSection as keyof typeof fardData]?.performed && !fardData[activeSection as keyof typeof fardData]?.inCongregation
                        ? 'bg-emerald-600 text-white font-black ring-2 ring-emerald-400'
                        : 'bg-white text-slate-700 border border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>أديتها (منفرد)</span>
                  </button>

                  <button
                    onClick={() => handleQuickTogglePrayer(prayerKeyMap[activeSection].key, true)}
                    className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                      fardData[activeSection as keyof typeof fardData]?.performed && fardData[activeSection as keyof typeof fardData]?.inCongregation
                        ? 'bg-amber-500 text-white font-black ring-2 ring-amber-300'
                        : 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>أديتها (جماعة 👑)</span>
                  </button>

                  {fardData[activeSection as keyof typeof fardData]?.performed && (
                    <button
                      onClick={() => handleQuickTogglePrayer(prayerKeyMap[activeSection].key, fardData[activeSection as keyof typeof fardData]?.inCongregation)}
                      className="py-2 px-2.5 rounded-xl text-[11px] font-bold bg-white text-rose-500 border border-rose-200 hover:bg-rose-50 transition-all"
                      title="إلغاء تسجيل الصلاة"
                    >
                      إلغاء التحديد
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (onSwitchTab && sectionDetails[activeSection].tabTarget) {
                  onSwitchTab(sectionDetails[activeSection].tabTarget);
                  if (onClose) onClose();
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>{sectionDetails[activeSection].actionLabel}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveSection(null)}
              className="px-4 py-2.5 text-xs text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* مطوية أسرار البنيان المعماري للإيمان */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-7 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 header-font">
              أسرار البنيان المعماري للإيمان
            </h3>
            <p className="text-[11px] text-slate-400 font-bold">
              كيف تتغير أبعاد القلعة وتُضاف أسوارها وأبراجها مع أعمال يومك؟
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[
            {
              id: 'main_curtain_wall' as FortressSection,
              title: 'الأسوار الحجرية (ترتفع رأسياً مع الفروض)',
              desc: 'الجدار الحجري يبدأ كقاعدة أولية بارتفاع 24م، ويرتفع مع كل صلاة فريضة تُؤدى حتى يبلغ 130م بكامل شرفاته ومداميكه الدفاعية.',
              icon: TowerControl,
              color: 'text-amber-600 bg-amber-50'
            },
            {
              id: 'outer_athkar_wall' as FortressSection,
              title: 'سور التحصين الخارجي (يُضاف مع الأذكار)',
              desc: 'عند بلوغ 35% من أذكار الصباح والمساء، يُضاف خط دفاع خارجي متقدم بشرفات حجرية خاصة، متصلاً بهالة الدرع الأثيري.',
              icon: Shield,
              color: 'text-cyan-600 bg-cyan-50'
            },
            {
              id: 'qiyam_spire' as FortressSection,
              title: 'منارة التهجد السامقة (تُضاف مع قيام الليل)',
              desc: 'برج إضافي رشيق ينطلق إلى عنان السماء (395م) يطلق حزمة ضوئية زرقاء تخترق السماوات العلا في جوف السحر.',
              icon: Sparkles,
              color: 'text-emerald-600 bg-emerald-50'
            },
            {
              id: 'quran_sunrays' as FortressSection,
              title: 'أشعة شمس الوحي والقرآن الكريم (تغطي المكان كله)',
              desc: 'حزم أشعة ذهبية شمسية تنبثق من كبد السماء وتغمر كامل أرجاء القلعة وأبراجها؛ ترتفع قوتها واتساعها وبريقها بحسب نسبة إنجاز ورد التلاوة، وسماع المجود، والحفظ والمراجعة.',
              icon: Sun,
              color: 'text-amber-600 bg-amber-50'
            },
            {
              id: 'remembrance_moat' as FortressSection,
              title: 'خندق التسبيح الرقراق (يفيض مع السبحة)',
              desc: 'قناة مائية رقراقة تحيط بالقلعة؛ يتصاعد منسوب مائها المتلألئ مع عدد التسبيحات والاستغفار في الـ log ليمنع دبيب الغفلة.',
              icon: Waves,
              color: 'text-blue-600 bg-blue-50'
            }
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/20 cursor-pointer transition-all flex items-start gap-3"
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black header-font text-slate-800">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* إشعار الحفظ والتصدير */}
      {showShareToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 text-xs font-black header-font flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>تم تصدير لوحة قلعة الإيمان بجودة عالية مباشرة من محرك الـ Canvas بنجاح!</span>
        </div>
      )}
    </div>
  );
};
