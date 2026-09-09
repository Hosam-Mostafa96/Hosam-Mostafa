
import { DailyLog, PrayerEntry, TranquilityLevel, AppWeights } from '../types';
import { 
  TRANQUILITY_MULTIPLIERS,
  DEFAULT_WEIGHTS
} from '../constants';
import { MORNING_ATHKAR, EVENING_ATHKAR, SLEEP_ATHKAR } from '../components/AthkarRead';

export const calculatePrayerScore = (entry: PrayerEntry, hasBurden: boolean, weights: AppWeights = DEFAULT_WEIGHTS) => {
  if (!entry.performed) return 0;
  
  const base = entry.inCongregation ? weights.fardCongregation : weights.fardSolo;
  let tranqMult = TRANQUILITY_MULTIPLIERS[entry.tranquility as TranquilityLevel];
  if (hasBurden && tranqMult > 0) tranqMult = 0;
  
  const fardScore = base * (1 + tranqMult);
  
  const sunnahScore = (entry.surroundingSunnahIds || []).reduce((acc, id) => {
    const weight = weights.surroundingSunnahs[id] || weights.sunnahRawatib;
    return acc + weight;
  }, 0);
  
  return fardScore + sunnahScore;
};

export const calculateTotalScore = (log: DailyLog, weights: AppWeights = DEFAULT_WEIGHTS) => {
  const prayers = Object.values(log.prayers).reduce((sum, p) => sum + calculatePrayerScore(p as PrayerEntry, log.hasBurden, weights), 0);
  
  const quranHifzPoints = (log.quran.hifzRub || 0) * weights.quranHifz;
  const repsPoints = (log.quran.todayReps || 0) * (weights.quranPageRepetition || 5);
  const manualRevisionPoints = (log.quran.tasksCompleted || [])
    .filter(id => id.startsWith('rabt_') || id.startsWith('mur_'))
    .length * weights.quranRevision;
  const revisionRubPoints = (log.quran.revisionRub || 0) * weights.quranRevision;
  const quranTasksPoints = (log.quran.tasksCompleted || []).filter(id => !id.startsWith('rabt_') && !id.startsWith('mur_')).length * 50; 
  const quranReadPagesPoints = (log.quran.readPages || []).length * 15; // 15 نقطة لكل صفحة مقروءة من المصحف التفاعلي
  
  const knowledge = (log.knowledge.shariDuration * weights.knowledgeShari) + 
                    (log.knowledge.readingDuration * weights.knowledgeGeneral) +
                    ((log.knowledge.readingPages || 0) * (weights.pointsPerPage || 0));
  
  const athkarCheck = Object.values(log.athkar.checklists).filter(Boolean).length * weights.athkarChecklist;
  const athkarCount = Object.values(log.athkar.counters || {}).reduce((sum, count) => sum + ((count as number) * weights.athkarCounter), 0);
  
  // نقاط الأذكار التفصيلية المقروءة من الشاشة التفاعلية (بحد أقصى 100 لصباح كامل، و100 لمساء كامل، و100 لأذكار نوم كاملة)
  let detailedAthkarPoints = 0;
  const detailedData = log.athkar.completedDetailedAthkar || {};
  
  if (MORNING_ATHKAR.length > 0) {
    const morningDoneCount = MORNING_ATHKAR.filter(item => (detailedData[item.id] || 0) >= item.count).length;
    detailedAthkarPoints += Math.round((morningDoneCount / MORNING_ATHKAR.length) * 100);
  }
  
  if (EVENING_ATHKAR.length > 0) {
    const eveningDoneCount = EVENING_ATHKAR.filter(item => (detailedData[item.id] || 0) >= item.count).length;
    detailedAthkarPoints += Math.round((eveningDoneCount / EVENING_ATHKAR.length) * 100);
  }

  if (SLEEP_ATHKAR.length > 0) {
    const sleepDoneCount = SLEEP_ATHKAR.filter(item => (detailedData[item.id] || 0) >= item.count).length;
    detailedAthkarPoints += Math.round((sleepDoneCount / SLEEP_ATHKAR.length) * 100);
  }
  
  const nawafilPrayers = (log.nawafil.duhaDuration + log.nawafil.witrDuration + log.nawafil.qiyamDuration) * weights.nawafilPerMin;
  const fasting = log.nawafil.fasting ? weights.fastingDay : 0;
  
  // نقاط ورد الدعاء
  const duasPoints = (log.duaIdsCompleted || []).length * (weights.pointsPerDua || 10);

  // نقاط أعمال القلوب وتزكية النفس بناءً على المهام العملية
  let heartPoints = 0;
  if (log.heartStates) {
    // كل مهمة عملية منجزة تعطي نقاطاً ثابتة
    Object.values(log.heartStates.deeds).forEach(tasks => {
      heartPoints += (tasks?.length || 0) * (weights.heartDeedPoint || 200);
    });
    Object.values(log.heartStates.diseases).forEach(tasks => {
      heartPoints += (tasks?.length || 0) * (weights.heartDeedPoint || 200);
    });
  }

  const customSunnahPoints = (log.customSunnahIds || []).reduce((sum, id) => {
    const sunnah = (weights.customSunnahs || []).find(s => s.id === id);
    return sum + (sunnah ? sunnah.points : 0);
  }, 0);

  // نقاط التدبر القرآني (150 نقطة لكل وقفة تدبر موثقة مع نية عمل)
  const tadabburPoints = (log.tadabburNotes || []).length * 150;
  
  const deductionMultiplier = 1 - (weights.burdenDeduction / 100);
  
  const total = (prayers + quranHifzPoints + repsPoints + manualRevisionPoints + revisionRubPoints + quranTasksPoints + quranReadPagesPoints + knowledge + athkarCheck + athkarCount + detailedAthkarPoints + nawafilPrayers + fasting + customSunnahPoints + heartPoints + duasPoints + tadabburPoints) * (log.hasBurden ? deductionMultiplier : log.jihadFactor);

  return Math.round(total);
};
