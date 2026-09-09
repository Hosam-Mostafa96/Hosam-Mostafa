
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  PenLine, 
  Timer as TimerIcon,
  NotebookPen,
  UserCircle,
  Medal,
  Sparkles,
  Bell,
  Info,
  Loader2,
  BarChart3,
  Library,
  Orbit,
  BookOpen,
  Send,
  Calendar,
  BookMarked,
  Lightbulb,
  Heart,
  ChevronLeft,
  ScrollText,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA as ar } from 'date-fns/locale';

import { DailyLog, PrayerName, TranquilityLevel, JihadFactor, AppWeights, User, Book } from './types';
import { calculateTotalScore } from './utils/scoring';
import { DEFAULT_WEIGHTS, GOOGLE_STATS_API } from './constants';
import Dashboard from './components/Dashboard';
import DailyEntry from './DailyEntry';
import WorshipHistory from './components/WorshipHistory';
import WorshipGuide from './components/WorshipGuide';
import WorshipTimer from './components/WorshipTimer';
import Reflections from './components/Reflections';
import UserProfile from './components/UserProfile';
import Leaderboard from './components/Leaderboard';
import ContactUs from './components/ContactUs';
import Onboarding from './components/Onboarding';
import Statistics from './components/Statistics';
import BookLibrary from './components/BookLibrary';
import Subha from './components/Subha';
import QuranPage from './components/QuranPage';
import Notifications from './components/Notifications';
import HeartTazkiya from './components/HeartTazkiya';
import AthkarRead from './components/AthkarRead';
import FortyChallenge from './components/FortyChallenge';

const INITIAL_LOG = (date: string): DailyLog => ({
  date,
  prayers: {
    [PrayerName.FAJR]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'excellent', surroundingSunnahIds: [] },
    [PrayerName.DHUHR]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'excellent', surroundingSunnahIds: [] },
    [PrayerName.ASR]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'excellent', surroundingSunnahIds: [] },
    [PrayerName.MAGHRIB]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'excellent', surroundingSunnahIds: [] },
    [PrayerName.ISHA]: { performed: false, inCongregation: false, tranquility: TranquilityLevel.MINIMUM, internalSunnahPackage: 'excellent', surroundingSunnahIds: [] },
  },
  quran: { hifzRub: 0, revisionRub: 0, todayPortion: '', tasksCompleted: [], khatmaNumber: 1, surahName: '' },
  knowledge: { shariDuration: 0, readingDuration: 0, readingPages: 0 },
  athkar: {
    checklists: { morning: false, evening: false, sleep: false, travel: false },
    counters: { salawat: 0, hawqalah: 0, tahlil: 0, baqiyat: 0, istighfar: 0 }
  },
  nawafil: {
    duhaDuration: 0, witrDuration: 0, qiyamDuration: 0, fasting: false, custom: []
  },
  sleep: { sessions: [] },
  heartStates: {
    deeds: { sincerity: [], reliance: [], patience: [], gratitude: [], love: [] },
    diseases: { pride: [], envy: [], showingOff: [], malice: [] }
  },
  mood: 3,
  customSunnahIds: [],
  duaIdsCompleted: [],
  jihadFactor: JihadFactor.NORMAL,
  hasBurden: false,
  isRepented: true,
  isSupplicatingAloud: false,
  notes: '',
  reflections: [],
  tadabburNotes: []
});

const App: React.FC = () => {
  type Tab = 'dashboard' | 'entry' | 'athkar' | 'forty' | 'heart' | 'leaderboard' | 'timer' | 'subha' | 'quran' | 'library' | 'stats' | 'notes' | 'profile' | 'history' | 'contact' | 'guide' | 'notifications';
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [books, setBooks] = useState<Book[]>([]);
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [targetScore, setTargetScore] = useState(13500);
  const [user, setUser] = useState<User | null>(null);
  const [weights, setWeights] = useState<AppWeights>(DEFAULT_WEIGHTS);
  const [isGlobalSyncEnabled, setIsGlobalSyncEnabled] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [lastCloudSync, setLastCloudSync] = useState<string | null>(localStorage.getItem('last_cloud_sync_time'));

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('shariDuration');
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [pomodoroGoal, setPomodoroGoal] = useState(1500);

  const syncTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: number | null = null;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  useEffect(() => {
    const safeLoad = (key: string, fallback: any) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (e) { return fallback; }
    };
    setLogs(safeLoad('worship_logs', {}));
    setBooks(safeLoad('worship_books', []));
    setTargetScore(safeLoad('worship_target', 13500));
    setUser(safeLoad('worship_user', null));
    setIsGlobalSyncEnabled(safeLoad('worship_global_sync', true));
    setWeights(safeLoad('worship_weights', DEFAULT_WEIGHTS));
    setIsAppReady(true);
  }, []);

  const syncToCloud = async (currentLogs: any, currentBooks: any, force = false, activityLabel?: string, activityType?: string) => {
    if (!user?.email || !navigator.onLine || !isGlobalSyncEnabled) return;
    try {
      const email = user.email.toLowerCase().trim();
      const payload = { 
        action: 'syncLogs', 
        email, 
        name: user.name,
        logs: JSON.stringify(currentLogs),
        books: JSON.stringify(currentBooks),
        activityLabel,
        activityType,
        timestamp: new Date().toLocaleString('ar-EG'),
        forceUpdate: force
      };
      const res = await fetch(GOOGLE_STATS_API, { 
        method: 'POST', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload) 
      });
      if (res.ok) {
        const now = new Date().toISOString();
        setLastCloudSync(now);
        localStorage.setItem('last_cloud_sync_time', now);
      }
    } catch (e) { console.error("Sync failed", e); }
  };

  const updateLog = (updated: DailyLog, activityLabel?: string, activityType?: string) => {
    const newLogs = { ...logs, [updated.date]: updated };
    setLogs(newLogs);
    localStorage.setItem('worship_logs', JSON.stringify(newLogs));
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = window.setTimeout(() => syncToCloud(newLogs, books, false, activityLabel, activityType), 2000);
  };

  const handleAddBook = (title: string, totalPages: number) => {
    const newBook: Book = {
      id: 'book_' + Date.now(),
      title,
      totalPages,
      currentPages: 0,
      startDate: new Date().toISOString(),
      isFinished: false
    };
    const newBooks = [...books, newBook];
    setBooks(newBooks);
    localStorage.setItem('worship_books', JSON.stringify(newBooks));
    syncToCloud(logs, newBooks, false, `بدأ قراءة كتاب جديد: ${title}`, 'knowledge');
  };

  const handleDeleteBook = (id: string) => {
    const newBooks = books.filter(b => b.id !== id);
    setBooks(newBooks);
    localStorage.setItem('worship_books', JSON.stringify(newBooks));
    syncToCloud(logs, newBooks);
  };

  const handleUpdateBookProgress = (book: Book, pagesReadToday: number) => {
    const newBooks = books.map(b => {
      if (b.id === book.id) {
        const nextPages = Math.min(b.totalPages, b.currentPages + pagesReadToday);
        const isFinished = nextPages === b.totalPages;
        return { 
          ...b, 
          currentPages: nextPages, 
          isFinished, 
          finishDate: isFinished ? new Date().toISOString() : b.finishDate 
        };
      }
      return b;
    });
    setBooks(newBooks);
    localStorage.setItem('worship_books', JSON.stringify(newBooks));

    const logDate = format(new Date(), 'yyyy-MM-dd');
    const currentLog = logs[logDate] || INITIAL_LOG(logDate);
    const updatedLog = {
      ...currentLog,
      knowledge: {
        ...currentLog.knowledge,
        readingPages: (currentLog.knowledge.readingPages || 0) + pagesReadToday
      }
    };
    updateLog(updatedLog, `قرأ ${pagesReadToday} صفحة من كتاب: ${book.title}`, 'knowledge');
  };

  const currentLog = logs[currentDate] || INITIAL_LOG(currentDate);
  const todayScore = calculateTotalScore(currentLog, weights);

  const hijriDate = useMemo(() => {
    try {
      const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' });
      const parts = formatter.formatToParts(new Date());
      let d = '', m = '';
      parts.forEach(p => { if(p.type === 'day') d = p.value; if(p.type === 'month') m = p.value; });
      return `${d} ${m} 1448هـ`;
    } catch (e) {
      return '1448هـ';
    }
  }, []);


  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard log={currentLog} logs={logs} weights={weights} user={user} onDateChange={setCurrentDate} targetScore={targetScore} onTargetChange={(val) => { setTargetScore(val); localStorage.setItem('worship_target', val.toString()); }} onOpenSettings={() => setActiveTab('profile')} books={books} onUpdateBook={handleUpdateBookProgress} onSwitchTab={setActiveTab} installPrompt={deferredPrompt} onClearInstallPrompt={() => setDeferredPrompt(null)} onUpdateLog={updateLog} />;
      case 'entry': return <DailyEntry log={currentLog} onUpdate={updateLog} weights={weights} onUpdateWeights={setWeights} currentDate={currentDate} onDateChange={setCurrentDate} onSwitchTab={setActiveTab} />;
      case 'heart': return <HeartTazkiya log={currentLog} onUpdate={updateLog} />;
      case 'leaderboard': return <Leaderboard user={user} currentScore={todayScore} isSync={isGlobalSyncEnabled} />;
      case 'timer': return (
        <WorshipTimer 
          isSync={isGlobalSyncEnabled} 
          seconds={timerSeconds} 
          isRunning={isTimerRunning} 
          selectedActivity={selectedActivity} 
          onToggle={() => setIsTimerRunning(!isTimerRunning)} 
          onReset={() => { setTimerSeconds(0); setIsTimerRunning(false); }} 
          onActivityChange={setSelectedActivity} 
          onApplyTime={(field, mins) => { 
            const updated = { 
              ...currentLog, 
              knowledge: { 
                ...currentLog.knowledge, 
                [field]: ((currentLog.knowledge as any)[field] || 0) + mins 
              } 
            }; 
            updateLog(updated, `أتمَّ ${mins} دقيقة في ${field === 'shariDuration' ? 'طلب العلم الشرعي' : field === 'readingDuration' ? 'القراءة العامة' : 'العبادة'}`, 'knowledge'); 
          }} 
          userEmail={user?.email} 
          userName={user?.name} 
          currentScore={todayScore} 
          timerMode={timerMode} 
          onTimerModeChange={setTimerMode} 
          pomodoroGoal={pomodoroGoal} 
          onPomodoroGoalChange={setPomodoroGoal} 
        />
      );
      case 'subha': return <Subha log={currentLog} onUpdateLog={updateLog} />;
      case 'athkar': return <AthkarRead log={currentLog} onUpdateLog={updateLog} />;
      case 'forty': return <FortyChallenge />;
      case 'quran': return <QuranPage log={currentLog} logs={logs} plan="new_1" onUpdatePlan={() => {}} onUpdateLog={updateLog} />;
      case 'library': return <BookLibrary books={books} onAddBook={handleAddBook} onDeleteBook={handleDeleteBook} onUpdateProgress={(id, pages) => { const b = books.find(x => x.id === id); if(b) handleUpdateBookProgress(b, pages); }} />;
      case 'stats': return <Statistics user={user} logs={logs} weights={weights} books={books} lastSyncTime={lastCloudSync} onManualSync={(f) => syncToCloud(logs, books, f)} />;
      case 'notes': return <Reflections log={currentLog} onUpdate={updateLog} />;
      case 'profile': return <UserProfile user={user} weights={weights} isGlobalSync={isGlobalSyncEnabled} onToggleSync={setIsGlobalSyncEnabled} onUpdateUser={setUser} onUpdateWeights={setWeights} installPrompt={deferredPrompt} onClearInstallPrompt={() => setDeferredPrompt(null)} />;
      case 'history': return <WorshipHistory logs={logs} weights={weights} />;
      case 'guide': return <WorshipGuide />;
      case 'contact': return <ContactUs />;
      case 'notifications': return <Notifications onBack={() => setActiveTab('dashboard')} />;
      default: return null;
    }
  };

  if (!isAppReady) return <div className="min-h-screen bg-emerald-900 flex items-center justify-center"><Loader2 className="w-10 h-10 text-emerald-400 animate-spin" /></div>;
  if (!user) return <Onboarding installPrompt={deferredPrompt} onComplete={(u, restoredLogs, restoredBooks) => { setUser(u); localStorage.setItem('worship_user', JSON.stringify(u)); if (restoredLogs) { const parsedLogs = JSON.parse(restoredLogs); setLogs(parsedLogs); localStorage.setItem('worship_logs', JSON.stringify(parsedLogs)); } if (restoredBooks) { const parsedBooks = JSON.parse(restoredBooks); setBooks(parsedBooks); localStorage.setItem('worship_books', JSON.stringify(parsedBooks)); } }} />;

  return (
    <div className="min-h-screen pb-32 bg-slate-50 text-right" dir="rtl">
      <header className="bg-emerald-800 text-white p-4 pb-20 rounded-b-[3rem] shadow-xl relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-700 rounded-full -translate-y-16 translate-x-16 opacity-30 blur-2xl"></div>
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 w-full">
            <button onClick={() => setActiveTab('profile')} className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-95 shrink-0"><UserCircle className="w-8 h-8 text-white" /></button>
            <div className="flex-1 flex flex-col items-center justify-center min-w-0"><h1 className="text-sm sm:text-base md:text-xl font-black header-font text-center leading-tight whitespace-normal">إدارة العبادات والأوراد</h1><span className="text-[10px] sm:text-xs text-emerald-200 header-font font-bold truncate mt-0.5 opacity-80">مرحباً، {user.name}</span></div>
            <div className="flex items-center gap-1 shrink-0"><button onClick={() => setActiveTab('guide')} className={`p-2.5 rounded-full transition-all border ${activeTab === 'guide' ? 'bg-amber-400 text-emerald-900 border-white' : 'bg-white/10 text-white/70 border-white/20'}`}><Lightbulb className="w-5 h-5" /></button><button onClick={() => { setActiveTab('notifications'); setHasNewNotifications(false); }} className={`p-2.5 rounded-full transition-all border relative ${activeTab === 'notifications' ? 'bg-yellow-400 text-emerald-900 border-white' : 'bg-white/10 text-white/70 border-white/20'}`}><Bell className="w-5 h-5" />{hasNewNotifications && (<span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white animate-pulse"></span>)}</button></div>
          </div>
          <div className="flex flex-col items-center gap-1.5"><div className="flex items-center gap-1.5 text-[11px] font-black text-white bg-white/10 px-4 py-1.5 rounded-full border border-white/10 shadow-sm backdrop-blur-sm"><Calendar className="w-3.5 h-3.5 text-yellow-400" />{hijriDate}</div></div>
          <div className="mt-2 bg-white/10 backdrop-blur-xl rounded-3xl p-4 w-full flex items-center justify-between border border-white/20 shadow-2xl"><div className="flex items-center gap-3"><div className="bg-yellow-400/20 p-2.5 rounded-2xl"><Sparkles className="w-6 h-6 text-yellow-400" /></div><div className="text-right"><p className="text-[10px] text-emerald-200 uppercase font-black header-font leading-none mb-1">الرصيد الروحي</p><span className="text-2xl font-black font-mono tabular-nums leading-none">{todayScore.toLocaleString()}</span></div></div><button onClick={() => setActiveTab('history')} className="text-right flex flex-col items-end hover:bg-white/20 p-2 px-3 rounded-2xl transition-all"><p className="text-[10px] text-emerald-200 font-bold header-font leading-none mb-0.5">{format(new Date(currentDate.replace(/-/g, '/')), 'eeee', { locale: ar })}</p><p className="text-sm font-black header-font">{format(new Date(currentDate.replace(/-/g, '/')), 'dd MMMM', { locale: ar })}</p></button></div>
        </div>
      </header>
      <main className="px-4 -mt-8 relative z-20 max-w-2xl mx-auto">{renderContent()}</main>
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[98vw] pointer-events-none flex justify-center">
        <div className="relative w-fit pointer-events-auto">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/80 to-transparent rounded-l-full pointer-events-none z-10"></div>
          <nav className="bg-white/95 shadow-2xl rounded-full px-6 py-3 flex items-center gap-1 border border-slate-200 backdrop-blur-lg overflow-x-auto no-scrollbar max-w-[92vw]">
            {[
              {id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية'},
              {id: 'entry', icon: PenLine, label: 'تسجيل'},
              {id: 'athkar', icon: ScrollText, label: 'الأذكار'},
              {id: 'forty', icon: Target, label: 'تحدي الأربعين'},
              {id: 'leaderboard', icon: Medal, label: 'المنافسة'},
              {id: 'timer', icon: TimerIcon, label: 'المؤقت'},
              {id: 'subha', icon: Orbit, label: 'السبحة'},
              {id: 'quran', icon: BookOpen, label: 'القرآن'},
              {id: 'heart', icon: Heart, label: 'التزكية'},
              {id: 'library', icon: Library, label: 'المكتبة'},
              {id: 'stats', icon: BarChart3, label: 'إحصائيات'},
              {id: 'notes', icon: NotebookPen, label: 'اليوميات'},
              {id: 'contact', icon: Send, label: 'تواصل'},
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`flex flex-col items-center min-w-[3.8rem] px-1 transition-all duration-300 ${activeTab === tab.id ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}><tab.icon className="w-5 h-5" /><span className="text-[8px] mt-1 font-bold header-font whitespace-nowrap">{tab.label}</span></button>
            ))}
          </nav>
          <div className="absolute left-1 top-1/2 -translate-y-1/2 p-1 bg-emerald-500 rounded-full text-white shadow-lg animate-pulse z-20"><ChevronLeft className="w-3 h-3" /></div>
        </div>
      </div>
    </div>
  );
};

export default App;
