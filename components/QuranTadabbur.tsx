import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  Share2, 
  Heart, 
  Star, 
  Search, 
  Filter, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Quote, 
  Edit3, 
  X, 
  Bookmark, 
  ChevronDown, 
  ArrowRight, 
  Target, 
  Download, 
  Copy, 
  Check, 
  RefreshCw,
  Lightbulb,
  FileText
} from 'lucide-react';
import { DailyLog, TadabburNote } from '../types';
import { 
  QURAN_114_SURAHS, 
  TADABBUR_CATEGORIES, 
  DAILY_TADABBUR_SEEDS, 
  DailyTadabburSeed,
  SurahMeta,
  TadabburCategory
} from '../utils/quranData';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';
import { arSA as ar } from 'date-fns/locale';

interface QuranTadabburProps {
  log: DailyLog;
  onUpdateLog: (log: DailyLog, activityLabel?: string, activityType?: string) => void;
  currentDate?: string;
  onNavigateToQuran?: () => void;
}

export const QuranTadabbur: React.FC<QuranTadabburProps> = ({ 
  log, 
  onUpdateLog, 
  currentDate, 
  onNavigateToQuran 
}) => {
  // All notes across history
  const [allNotes, setAllNotes] = useState<TadabburNote[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'favorites'>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedSurahFilter, setSelectedSurahFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(2); // البقرة default
  const [ayahNumber, setAyahNumber] = useState<string>('');
  const [ayahText, setAyahText] = useState<string>('');
  const [theme, setTheme] = useState<string>('aqidah');
  const [reflectionText, setReflectionText] = useState<string>('');
  const [practicalAction, setPracticalAction] = useState<string>('');
  const [duaFromAyah, setDuaFromAyah] = useState<string>('');
  
  // Surah dropdown search inside editor
  const [surahSearch, setSurahSearch] = useState('');
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState(false);

  // Daily Seed state
  const [currentSeedIndex, setCurrentSeedIndex] = useState<number>(() => {
    const day = new Date().getDate();
    return day % DAILY_TADABBUR_SEEDS.length;
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeDate = currentDate || log.date || format(new Date(), 'yyyy-MM-dd');

  // Load all notes from localStorage and current log
  useEffect(() => {
    try {
      const stored = localStorage.getItem('worship_tadabbur_all_notes');
      let notes: TadabburNote[] = stored ? JSON.parse(stored) : [];
      
      // Merge with current log's notes if missing
      if (log.tadabburNotes && log.tadabburNotes.length > 0) {
        const existingIds = new Set(notes.map(n => n.id));
        let changed = false;
        log.tadabburNotes.forEach(n => {
          if (!existingIds.has(n.id)) {
            notes.push(n);
            changed = true;
          }
        });
        if (changed) {
          notes.sort((a, b) => b.timestamp - a.timestamp);
          localStorage.setItem('worship_tadabbur_all_notes', JSON.stringify(notes));
        }
      }
      setAllNotes(notes);
    } catch (e) {
      console.error("Error loading tadabbur notes", e);
    }
  }, [log.tadabburNotes]);

  // Current selected surah metadata
  const currentSurahMeta = useMemo(() => {
    return QURAN_114_SURAHS.find(s => s.id === selectedSurahNumber) || QURAN_114_SURAHS[1];
  }, [selectedSurahNumber]);

  // Filtered surahs for the dropdown picker
  const filteredSurahs = useMemo(() => {
    if (!surahSearch.trim()) return QURAN_114_SURAHS;
    const q = surahSearch.trim().toLowerCase();
    return QURAN_114_SURAHS.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.id.toString() === q
    );
  }, [surahSearch]);

  // Save/Update note
  const handleSaveNote = () => {
    if (!reflectionText.trim()) return;

    const surah = QURAN_114_SURAHS.find(s => s.id === selectedSurahNumber) || QURAN_114_SURAHS[1];

    if (editingNoteId) {
      // Editing existing note
      const updatedNotes = allNotes.map(n => {
        if (n.id === editingNoteId) {
          return {
            ...n,
            surahNumber: surah.id,
            surahName: surah.name,
            ayahNumber: ayahNumber.trim() || '١',
            ayahText: ayahText.trim() || undefined,
            theme,
            reflection: reflectionText.trim(),
            practicalApplication: practicalAction.trim() || undefined,
            duaFromAyah: duaFromAyah.trim() || undefined,
          };
        }
        return n;
      });

      setAllNotes(updatedNotes);
      localStorage.setItem('worship_tadabbur_all_notes', JSON.stringify(updatedNotes));

      // Update log if the note belongs to today's log
      const updatedLogNotes = (log.tadabburNotes || []).map(n => 
        n.id === editingNoteId ? updatedNotes.find(un => un.id === editingNoteId)! : n
      );
      onUpdateLog({ ...log, tadabburNotes: updatedLogNotes });
    } else {
      // Creating new note
      const newNote: TadabburNote = {
        id: `tadabbur_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: activeDate,
        surahNumber: surah.id,
        surahName: surah.name,
        ayahNumber: ayahNumber.trim() || '١',
        ayahText: ayahText.trim() || undefined,
        theme,
        reflection: reflectionText.trim(),
        practicalApplication: practicalAction.trim() || undefined,
        duaFromAyah: duaFromAyah.trim() || undefined,
        isFavorite: false,
        timestamp: Date.now()
      };

      const updatedAll = [newNote, ...allNotes];
      setAllNotes(updatedAll);
      localStorage.setItem('worship_tadabbur_all_notes', JSON.stringify(updatedAll));

      // Update today's DailyLog
      const todayLogNotes = [newNote, ...(log.tadabburNotes || [])];
      
      // Also add to reflections array for backward compatibility
      const reflectionEntry = {
        id: newNote.id,
        text: `[تدبر: سورة ${newNote.surahName} آية ${newNote.ayahNumber}]\n${newNote.reflection}${newNote.practicalApplication ? `\n- العمل بالآية: ${newNote.practicalApplication}` : ''}`,
        timestamp: newNote.timestamp
      };
      const updatedReflections = [reflectionEntry, ...(log.reflections || [])];

      onUpdateLog(
        { 
          ...log, 
          tadabburNotes: todayLogNotes,
          reflections: updatedReflections
        },
        `دوّن تدبراً قرآنياً لسورة ${surah.name} الآية ${newNote.ayahNumber}`,
        'quran'
      );

      // Celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#fbbf24', '#059669', '#34d399']
      });
    }

    // Reset form
    resetEditorForm();
  };

  const resetEditorForm = () => {
    setEditingNoteId(null);
    setAyahNumber('');
    setAyahText('');
    setReflectionText('');
    setPracticalAction('');
    setDuaFromAyah('');
    setIsEditorOpen(false);
    setIsSurahDropdownOpen(false);
  };

  // Open editor prefilled with daily seed
  const handleApplySeed = (seed: DailyTadabburSeed) => {
    setSelectedSurahNumber(seed.surahNumber);
    setAyahNumber(seed.ayahNumber);
    setAyahText(seed.ayahText);
    setTheme(seed.theme);
    setReflectionText(`- وقفة تأملية: ${seed.inspiration}\n- ${seed.scholarQuote}`);
    setPracticalAction(seed.suggestedAction);
    setDuaFromAyah('');
    setEditingNoteId(null);
    setIsEditorOpen(true);

    // Scroll smoothly to editor
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Edit existing note
  const handleEditNote = (note: TadabburNote) => {
    setEditingNoteId(note.id);
    setSelectedSurahNumber(note.surahNumber);
    setAyahNumber(note.ayahNumber);
    setAyahText(note.ayahText || '');
    setTheme(note.theme || 'aqidah');
    setReflectionText(note.reflection);
    setPracticalAction(note.practicalApplication || '');
    setDuaFromAyah(note.duaFromAyah || '');
    setIsEditorOpen(true);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = allNotes.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n);
    setAllNotes(updated);
    localStorage.setItem('worship_tadabbur_all_notes', JSON.stringify(updated));

    if (log.tadabburNotes) {
      const updatedLogNotes = log.tadabburNotes.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n);
      onUpdateLog({ ...log, tadabburNotes: updatedLogNotes });
    }
  };

  // Delete note
  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من حذف هذه الخاطرة الإيمانية من السجل؟')) return;

    const updated = allNotes.filter(n => n.id !== id);
    setAllNotes(updated);
    localStorage.setItem('worship_tadabbur_all_notes', JSON.stringify(updated));

    const updatedLogNotes = (log.tadabburNotes || []).filter(n => n.id !== id);
    const updatedReflections = (log.reflections || []).filter(r => r.id !== id);
    onUpdateLog({ ...log, tadabburNotes: updatedLogNotes, reflections: updatedReflections });
  };

  // Share note
  const handleShareNote = async (note: TadabburNote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const category = TADABBUR_CATEGORIES.find(c => c.id === note.theme);
    const shareText = `📖 قبس من محراب التدبر القرآني:
سورة ${note.surahName} [الآية: ${note.ayahNumber}]
${note.ayahText ? `\n﴿ ${note.ayahText} ﴾\n` : ''}
💎 التأمل الإيماني:
${note.reflection}
${note.practicalApplication ? `\n🎯 النية والعمل بالآية:\n${note.practicalApplication}` : ''}
${note.duaFromAyah ? `\n🤲 دعاء من وحي الآية:\n${note.duaFromAyah}` : ''}

- من سجل التدبر في تطبيق إدارة العبادات والأوراد`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `تدبر سورة ${note.surahName}`,
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopiedId(note.id);
        setTimeout(() => setCopiedId(null), 2500);
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopiedId(note.id);
        setTimeout(() => setCopiedId(null), 2500);
      } catch (clipboardErr) {
        console.error("Copy failed", clipboardErr);
      }
    }
  };

  // Export all notes as a formatted markdown/text file
  const handleExportJournal = () => {
    if (allNotes.length === 0) {
      alert('لا توجد خواطر مسجلة لتصديرها بعد.');
      return;
    }

    let content = `# 📖 دفتر التدبر القرآني والخواطر الإيمانية\n`;
    content += `تاريخ التصدير: ${format(new Date(), 'dd MMMM yyyy', { locale: ar })}\n`;
    content += `إجمالي الوقفات المسجلة: ${allNotes.length} وقفة\n\n`;
    content += ` قال تعالى: ﴿كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ وَلِيَتَذَكَّرَ أُولُو الْأَلْبَابِ﴾ [ص: 29]\n\n`;
    content += `---\n\n`;

    allNotes.forEach((n, idx) => {
      const cat = TADABBUR_CATEGORIES.find(c => c.id === n.theme);
      content += `### ${idx + 1}. سورة ${n.surahName} - الآية (${n.ayahNumber})\n`;
      content += `- التاريخ: ${n.date} | المحور: ${cat ? cat.label : 'عام'}\n`;
      if (n.ayahText) {
        content += `> ﴿ ${n.ayahText} ﴾\n\n`;
      }
      content += `**التأمل والخواطر الإيمانية:**\n${n.reflection}\n\n`;
      if (n.practicalApplication) {
        content += `**العمل بالآية والتطبيق السلوكي:**\n${n.practicalApplication}\n\n`;
      }
      if (n.duaFromAyah) {
        content += `**الدعاء والمناجاة:**\n${n.duaFromAyah}\n\n`;
      }
      content += `---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quran_Tadabbur_Journal_${format(new Date(), 'yyyy-MM-dd')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered notes list
  const displayedNotes = useMemo(() => {
    return allNotes.filter(note => {
      // Tab filter
      if (activeFilter === 'today' && note.date !== activeDate) return false;
      if (activeFilter === 'favorites' && !note.isFavorite) return false;

      // Theme filter
      if (selectedTheme !== 'all' && note.theme !== selectedTheme) return false;

      // Surah filter
      if (selectedSurahFilter !== 'all' && note.surahName !== selectedSurahFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchSurah = note.surahName.toLowerCase().includes(q);
        const matchAyah = note.ayahNumber.includes(q);
        const matchAyahText = note.ayahText?.toLowerCase().includes(q) || false;
        const matchRef = note.reflection.toLowerCase().includes(q);
        const matchAction = note.practicalApplication?.toLowerCase().includes(q) || false;
        const matchDua = note.duaFromAyah?.toLowerCase().includes(q) || false;
        if (!matchSurah && !matchAyah && !matchAyahText && !matchRef && !matchAction && !matchDua) {
          return false;
        }
      }

      return true;
    });
  }, [allNotes, activeFilter, activeDate, selectedTheme, selectedSurahFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = allNotes.length;
    const uniqueSurahs = new Set(allNotes.map(n => n.surahNumber)).size;
    const actionsCount = allNotes.filter(n => !!n.practicalApplication?.trim()).length;
    const favCount = allNotes.filter(n => n.isFavorite).length;
    const todayCount = allNotes.filter(n => n.date === activeDate).length;
    return { totalCount, uniqueSurahs, actionsCount, favCount, todayCount };
  }, [allNotes, activeDate]);

  const currentSeed = DAILY_TADABBUR_SEEDS[currentSeedIndex];

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-300" dir="rtl">
      
      {/* 1. الترويسة الفاخرة مع الإحصائيات الروحية */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-[2.5rem] p-6 sm:p-7 shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-20 translate-x-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl translate-y-20 -translate-x-20 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-400/20 text-amber-300 rounded-2xl border border-amber-400/30 shrink-0">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase bg-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                    Quran Tadabbur Notes
                  </span>
                  <span className="text-[10px] font-bold text-amber-300/90 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> حياة القلب
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black header-font text-white leading-tight">
                  سجل التدبر القرآني
                </h2>
                <p className="text-xs text-emerald-200/80 font-bold mt-0.5 quran-font leading-relaxed">
                  ﴿ كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ ﴾
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetEditorForm();
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-2xl font-black text-xs header-font shadow-lg shadow-amber-950/40 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>تدوين وقفة جديدة</span>
              </button>

              {allNotes.length > 0 && (
                <button
                  onClick={handleExportJournal}
                  title="تصدير دفتر التدبر كملف"
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-emerald-200 rounded-2xl border border-white/10 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* بطاقات الإحصائيات الأربع */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/10">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <span className="text-[10px] text-emerald-300/80 font-bold block mb-1">إجمالي الوقفات</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-mono text-white">{stats.totalCount}</span>
                <span className="text-[9px] text-slate-300 font-bold">آية متدبرة</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <span className="text-[10px] text-amber-300/80 font-bold block mb-1">السور الكريمة</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-mono text-amber-300">{stats.uniqueSurahs}</span>
                <span className="text-[9px] text-slate-300 font-bold">من 114 سورة</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <span className="text-[10px] text-teal-300/80 font-bold block mb-1">خطوات العمل بالآية</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-mono text-teal-300">{stats.actionsCount}</span>
                <span className="text-[9px] text-slate-300 font-bold">نية تطبيقية 🎯</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <span className="text-[10px] text-rose-300/80 font-bold block mb-1">تدوينات اليوم</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-mono text-rose-300">{stats.todayCount}</span>
                <span className="text-[9px] text-slate-300 font-bold">اليوم</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ويدجت قبس اليوم للتدبر والتأمل */}
      {currentSeed && (
        <div className="bg-gradient-to-r from-amber-50/90 via-emerald-50/70 to-teal-50/90 border border-amber-200/80 rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-400 text-slate-950 rounded-xl">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-800 header-font">قبس اليوم للتدبر والتأمل</h3>
                <span className="text-[10px] font-bold text-slate-500">
                  سورة {currentSeed.surahName} - الآية ({currentSeed.ayahNumber})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSeedIndex((prev) => (prev + 1) % DAILY_TADABBUR_SEEDS.length)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-[10px] font-bold border border-slate-200 shadow-sm transition-all"
              >
                <RefreshCw className="w-3 h-3 text-emerald-600" />
                <span>قبس آخر</span>
              </button>

              <button
                onClick={() => handleApplySeed(currentSeed)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font shadow-sm shadow-emerald-700/20 active:scale-95 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تدبر هذه الآية ✍️</span>
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-amber-200/50 mb-3 shadow-inner">
            <p className="text-slate-900 quran-font text-base sm:text-lg leading-loose text-center">
              ﴿ {currentSeed.ayahText} ﴾
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/60 rounded-xl p-3 border border-slate-100">
              <span className="text-[10px] font-black text-amber-800 block mb-1 header-font">💡 اللطيفة التدبرية:</span>
              <p className="text-slate-700 font-bold leading-relaxed">{currentSeed.inspiration}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1.5 italic">{currentSeed.scholarQuote}</p>
            </div>
            <div className="bg-white/60 rounded-xl p-3 border border-slate-100">
              <span className="text-[10px] font-black text-emerald-800 block mb-1 header-font">🎯 العمل بالآية المقترح:</span>
              <p className="text-slate-700 font-bold leading-relaxed">{currentSeed.suggestedAction}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. محرر إضافة وتعديل وقفة التدبر */}
      {isEditorOpen && (
        <div className="bg-white rounded-[2rem] p-6 shadow-md border-2 border-emerald-500/30 animate-in zoom-in-95 duration-200 relative">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 header-font">
                  {editingNoteId ? 'تعديل وقفة التدبر' : 'تدوين وقفة تدبرية جديدة'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold">
                  اربط الآية بقلبك وسلوكك لتنال هدايات القرآن وبركاته
                </p>
              </div>
            </div>
            <button
              onClick={resetEditorForm}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* اختيار السورة والآية */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* السورة مع Dropdown ذكي */}
              <div className="sm:col-span-2 relative">
                <label className="block text-[11px] font-black text-slate-600 mb-1.5 header-font">
                  اختر السورة الكريمة:
                </label>
                <div 
                  onClick={() => setIsSurahDropdownOpen(!isSurahDropdownOpen)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-mono font-black flex items-center justify-center">
                      {currentSurahMeta.id}
                    </span>
                    <span className="text-xs font-black text-slate-800 header-font">
                      سورة {currentSurahMeta.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      ({currentSurahMeta.totalAyahs} آية • {currentSurahMeta.type})
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>

                {isSurahDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 max-h-64 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-white border-b border-slate-100 mb-1">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={surahSearch}
                          onChange={(e) => setSurahSearch(e.target.value)}
                          placeholder="ابحث باسم السورة أو رقمها..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pr-8 pl-3 text-xs font-bold outline-none focus:border-emerald-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {filteredSurahs.map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSelectedSurahNumber(s.id);
                            setIsSurahDropdownOpen(false);
                            setSurahSearch('');
                          }}
                          className={`p-2.5 rounded-xl text-right text-xs font-bold flex items-center justify-between transition-all ${
                            s.id === selectedSurahNumber ? 'bg-emerald-600 text-white' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{s.id}. {s.name}</span>
                          <span className={`text-[9px] ${s.id === selectedSurahNumber ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {s.totalAyahs}آ
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* رقم الآية */}
              <div>
                <label className="block text-[11px] font-black text-slate-600 mb-1.5 header-font">
                  رقم الآية (أو النطاق):
                </label>
                <input
                  type="text"
                  value={ayahNumber}
                  onChange={(e) => setAyahNumber(e.target.value)}
                  placeholder={`مثال: 152 أو 1-5 (من ${currentSurahMeta.totalAyahs})`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-emerald-500 text-slate-800"
                />
              </div>
            </div>

            {/* نص الآية الشريفة */}
            <div>
              <label className="block text-[11px] font-black text-slate-600 mb-1.5 header-font">
                نص الآية الكريمة (اختياري للتوثيق والاستحضار):
              </label>
              <textarea
                value={ayahText}
                onChange={(e) => setAyahText(e.target.value)}
                placeholder="اكتب أو الصق نص الآية الكريمة هنا إن أحببت..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold quran-font text-slate-800 outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* اختيار المحور الإيماني للتدبر */}
            <div>
              <label className="block text-[11px] font-black text-slate-600 mb-2 header-font">
                المحور الإيماني للتدبر:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TADABBUR_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTheme(cat.id)}
                    className={`p-2.5 rounded-2xl border text-right transition-all flex items-center gap-2 ${
                      theme === cat.id
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm text-emerald-950 font-black'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-bold'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <div className="min-w-0">
                      <span className="text-xs block leading-tight truncate">{cat.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* الركن الأول: وقفة التدبر والتأمل الإيماني */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black text-slate-700 header-font flex items-center gap-1.5">
                  <span className="text-amber-500">❶</span>
                  <span>وقفة التدبر وتأملات القلب: *</span>
                </label>
                <span className="text-[10px] text-slate-400 font-bold">ما الذي لامس شغاف وجدانك؟</span>
              </div>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="اكتب خواطرك الإيمانية، ما تفتحت عليه بصيرتك عند تلاوة هذه الآية، والسر الذي استشعرته..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold leading-relaxed text-slate-800 outline-none focus:border-emerald-500 resize-y"
              />
            </div>

            {/* الركن الثاني: العمل بالآية والتطبيق السلوكي */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black text-slate-700 header-font flex items-center gap-1.5">
                  <span className="text-teal-600">❷</span>
                  <span>العمل بالآية والأثر السلوكي:</span>
                </label>
                <span className="text-[10px] text-teal-600 font-bold">العلم يهتف بالعمل 🎯</span>
              </div>
              <input
                type="text"
                value={practicalAction}
                onChange={(e) => setPracticalAction(e.target.value)}
                placeholder="ما النية العملية التي ستطبق بها هذه الآية اليوم؟ (مثال: سأتصدق سراً، سأعفو عن من ظلمني...)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            {/* الركن الثالث: دعاء الآية والمناجاة */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black text-slate-700 header-font flex items-center gap-1.5">
                  <span className="text-rose-500">❸</span>
                  <span>دعاء ومناجاة مستنبطة:</span>
                </label>
                <span className="text-[10px] text-rose-500 font-bold">تحويل الآية إلى ضراعة 🤲</span>
              </div>
              <input
                type="text"
                value={duaFromAyah}
                onChange={(e) => setDuaFromAyah(e.target.value)}
                placeholder="دعاء تدعو به من هدي هذه الآية (مثال: اللهم اجعلني من الذاكرين لك، الصابرين على بلائك...)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            {/* أزرار الحفظ والإلغاء */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={resetEditorForm}
                className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-xl transition-all"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={!reflectionText.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font shadow-md shadow-emerald-800/20 active:scale-95 disabled:opacity-40 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingNoteId ? 'تحديث الخاطرة' : 'حفظ الخاطرة في السجل (+150 نقطة)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. أدوات البحث والفلترة للسجل */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
        {/* شريط البحث وفلاتر التبويب */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* تبويبات التصفية */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black header-font transition-all ${
                activeFilter === 'all'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              الكل ({allNotes.length})
            </button>
            <button
              onClick={() => setActiveFilter('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black header-font transition-all ${
                activeFilter === 'today'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              تدوينات اليوم ({stats.todayCount})
            </button>
            <button
              onClick={() => setActiveFilter('favorites')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black header-font transition-all flex items-center gap-1 ${
                activeFilter === 'favorites'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>المفضلة ({stats.favCount})</span>
            </button>
          </div>

          {/* شريط البحث */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في السور، الآيات، والتأملات..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 pr-9 pl-4 text-xs font-bold outline-none focus:border-emerald-500 text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* فلاتر المحاور الإيمانية */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedTheme('all')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black header-font shrink-0 transition-all ${
              selectedTheme === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع المحاور
          </button>
          {TADABBUR_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedTheme(cat.id === selectedTheme ? 'all' : cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black header-font shrink-0 flex items-center gap-1.5 transition-all ${
                selectedTheme === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. قائمة بطاقات الخواطر والتدبر */}
      <div className="space-y-4">
        {displayedNotes.length > 0 ? (
          displayedNotes.map(note => {
            const category = TADABBUR_CATEGORIES.find(c => c.id === note.theme) || TADABBUR_CATEGORIES[0];
            const isToday = note.date === activeDate;

            return (
              <div
                key={note.id}
                className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:border-emerald-200 transition-all space-y-4 relative group"
              >
                {/* رأس البطاقة: السورة، الآية، المحور، والتاريخ */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200/60 font-black text-xs header-font flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>سورة {note.surahName}</span>
                      <span className="text-[10px] text-emerald-600 font-mono">[{note.ayahNumber}]</span>
                    </div>

                    <div className={`px-2.5 py-1 rounded-xl text-[10px] font-black header-font flex items-center gap-1 ${category.badgeBg} ${category.badgeText}`}>
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>

                    {isToday && (
                      <span className="text-[9px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md border border-rose-100">
                        اليوم
                      </span>
                    )}
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleToggleFavorite(note.id, e)}
                      title={note.isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                      className={`p-2 rounded-xl transition-all ${
                        note.isFavorite
                          ? 'text-amber-500 bg-amber-50'
                          : 'text-slate-300 hover:text-amber-400 hover:bg-slate-50'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => handleShareNote(note, e)}
                      title="مشاركة الخاطرة"
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all relative"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleEditNote(note)}
                      title="تعديل"
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      title="حذف"
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* نص الآية الشريفة إن وُجد */}
                {note.ayahText && (
                  <div className="bg-amber-50/50 rounded-2xl p-3.5 border border-amber-100/70">
                    <p className="text-slate-900 quran-font text-base sm:text-lg leading-loose text-center">
                      ﴿ {note.ayahText} ﴾
                    </p>
                  </div>
                )}

                {/* التأمل والخواطر الإيمانية */}
                <div className="text-slate-800 font-bold text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {note.reflection}
                </div>

                {/* العمل بالآية والدعاء */}
                {(note.practicalApplication || note.duaFromAyah) && (
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {note.practicalApplication && (
                      <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-3">
                        <span className="text-[10px] font-black text-teal-800 header-font flex items-center gap-1 mb-1">
                          <Target className="w-3.5 h-3.5 text-teal-600" /> النية والعمل بالآية:
                        </span>
                        <p className="text-teal-900 font-bold">{note.practicalApplication}</p>
                      </div>
                    )}

                    {note.duaFromAyah && (
                      <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3">
                        <span className="text-[10px] font-black text-rose-800 header-font flex items-center gap-1 mb-1">
                          <Heart className="w-3.5 h-3.5 text-rose-500" /> دعاء من هدي الآية:
                        </span>
                        <p className="text-rose-900 font-bold">{note.duaFromAyah}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* تذييل البطاقة */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>{note.date}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(note.timestamp), 'hh:mm a', { locale: ar })}</span>
                  </div>
                  {copiedId === note.id && (
                    <span className="text-emerald-600 font-black animate-in fade-in duration-200">
                      تم نسخ نص الخاطرة للمشاركة بنجاح ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* في حال عدم وجود نتائج */
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Quote className="w-8 h-8 opacity-60" />
            </div>
            <h4 className="text-sm font-black text-slate-700 header-font mb-1">
              {searchQuery ? 'لم يتم العثور على خواطر تطابق بحثك' : 'محراب التدبر بانتظار أثرك الطيب'}
            </h4>
            <p className="text-xs text-slate-400 font-bold max-w-md mx-auto mb-5 leading-relaxed">
              {searchQuery
                ? 'جرب البحث بكلمات أخرى أو اختر سورة أخرى من القائمة.'
                : 'قال عثمان بن عفان رضي الله عنه: «لو طَهُرَت قلوبكم ما شبعت من كلام ربكم». ابدأ الآن بتدوين أول وقفة تدبرية تلهم قلبك وعملك.'}
            </p>
            <button
              onClick={() => {
                resetEditorForm();
                setIsEditorOpen(true);
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black header-font shadow-md shadow-emerald-800/20 transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>تدوين أول وقفة تدبرية الآن</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default QuranTadabbur;
