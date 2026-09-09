
export enum PrayerName {
  FAJR = 'الفجر',
  DHUHR = 'الظهر',
  ASR = 'العصر',
  MAGHRIB = 'المغرب',
  ISHA = 'العشاء'
}

export enum TranquilityLevel {
  NONE = 0,
  VERY_LOW = 1,
  MINIMUM = 2,
  GOOD = 3,
  CLEAR = 4,
  HIGH = 5
}

export enum JihadFactor {
  NORMAL = 1.0,
  STRUGGLE = 1.05,
  HIGH_STRUGGLE = 1.1
}

export interface User {
  name: string;
  email: string;
  age: string;
  country: string;
  city: string;
  qualification: string;
  method: 'google' | 'email';
}

export interface Book {
  id: string;
  title: string;
  totalPages: number;
  currentPages: number;
  startDate: string;
  finishDate?: string;
  isFinished: boolean;
}

export interface CustomSunnah {
  id: string;
  name: string;
  points: number;
}

export interface SurroundingSunnah {
  id: string;
  label: string;
}

export interface ReflectionNote {
  id: string;
  text: string;
  timestamp: number;
}

export interface TadabburNote {
  id: string;
  date: string; // YYYY-MM-DD
  surahNumber: number;
  surahName: string;
  ayahNumber: string; // e.g. "152" or "152-153"
  ayahText?: string;
  reflection: string; // الخاطرة والتأمل الإيماني
  practicalApplication?: string; // العمل بالآية والتطبيق السلوكي
  duaFromAyah?: string; // دعاء ومناجاة مستنبطة من الآية
  theme: string; // تصنيف الموضوع
  isFavorite?: boolean;
  timestamp: number;
}

export interface SleepSession {
  id: string;
  start: string;
  end: string;
}

export interface AppWeights {
  fardCongregation: number;
  fardSolo: number;
  sunnahRawatib: number;
  surroundingSunnahs: Record<string, number>;
  quranHifz: number;
  quranRevision: number;
  quranPageRepetition: number;
  quranRubRepetition: number;
  knowledgeShari: number;
  knowledgeGeneral: number;
  athkarChecklist: number;
  athkarCounter: number;
  nawafilPerMin: number;
  fastingDay: number;
  burdenDeduction: number;
  customSunnahs: CustomSunnah[];
  pointsPerPage: number;
  heartDeedPoint: number; 
  pointsPerDua: number;
}

export interface DailyLog {
  date: string;
  prayers: Record<string, PrayerEntry>;
  quran: { 
    hifzRub: number; 
    revisionRub: number;
    todayPortion?: string; 
    todayReps?: number; 
    tasksCompleted?: string[];
    khatmaNumber?: number; // حقل جديد
    surahName?: string;    // حقل جديد
    readPages?: number[];   // الصفحات المقروءة اليوم من المصحف التفاعلي
  };
  knowledge: { shariDuration: number; readingDuration: number; readingPages?: number };
  athkar: {
    checklists: { morning: boolean; evening: boolean; sleep: boolean; travel: boolean };
    counters: Record<string, number>;
    completedDetailedAthkar?: Record<string, number>;
  };
  nawafil: { duhaDuration: number; witrDuration: number; qiyamDuration: number; fasting: boolean; custom: Array<{ id: string; value: number }> };
  sleep: { sessions: SleepSession[] };
  heartStates: {
    deeds: Record<string, string[]>; 
    diseases: Record<string, string[]>; 
  };
  mood?: number; // 1 to 5
  customSunnahIds: string[];
  duaIdsCompleted: string[];
  jihadFactor: number;
  hasBurden: boolean;
  isRepented: boolean;
  isSupplicatingAloud: boolean;
  notes?: string;
  reflections: ReflectionNote[];
  tadabburNotes?: TadabburNote[];
}

export interface PrayerEntry {
  performed: boolean;
  inCongregation: boolean;
  tranquility: TranquilityLevel;
  internalSunnahPackage: 'none' | 'basic' | 'good' | 'excellent';
  surroundingSunnahIds: string[];
}

export interface FortyDayChallenge {
  id: string;
  habitTitle: string;
  habitCategory?: string;
  habitDescription?: string;
  startDate: string; // YYYY-MM-DD
  completedDays: string[]; // dates of completed days (YYYY-MM-DD)
  targetDays: number; // 40
  isCompleted?: boolean;
  notes?: string;
  createdAt: number;
}

