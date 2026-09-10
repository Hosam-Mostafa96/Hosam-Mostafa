
import React, { useState, useEffect } from 'react';
import { 
  Star, Users, Clock, Book, GraduationCap, Plus, Minus, Heart, ShieldAlert,
  Moon, Sun, Zap, Coffee, ScrollText, Sparkle, MessageSquare, 
  MapPin, CheckCircle2, Droplets, Flame, Tags, ToggleRight, ToggleLeft,
  ChevronRight, ChevronLeft, FileText, Check, BookOpen, Trash2, X, PlusCircle,
  MessageCircle, Hash, BookMarked
} from 'lucide-react';
import { DailyLog, PrayerName, TranquilityLevel, CustomSunnah, AppWeights } from './types';
import { SURROUNDING_SUNNAH_LIST } from './constants';
import { format, addDays } from 'date-fns';
import { arSA as ar } from 'date-fns/locale';

interface DailyEntryProps {
  log: DailyLog;
  onUpdate: (log: DailyLog, label?: string, type?: string) => void;
  weights: AppWeights;
  onUpdateWeights: (weights: AppWeights) => void;
  currentDate: string;
  onDateChange: (date: string) => void;
  onSwitchTab?: (tab: any) => void;
}

const PRAYER_SUNNAHS: Record<string, {id: string, label: string}[]> = {
  [PrayerName.FAJR]: [{id: 'fajr_pre', label: 'سنة الفجر (ركعتان قبلية)'}],
  [PrayerName.DHUHR]: [
    {id: 'dhuhr_pre', label: 'سنة الظهر (4 ركعات قبلية)'},
    {id: 'dhuhr_post', label: 'سنة الظهر (ركعتان بعدية)'}
  ],
  [PrayerName.ASR]: [{id: 'asr_pre', label: 'سنة العصر (4 ركعات قبلية)'}],
  [PrayerName.MAGHRIB]: [{id: 'maghrib_post', label: 'سنة المغرب (ركعتان بعدية)'}],
  [PrayerName.ISHA]: [{id: 'isha_post', label: 'سنة العشاء (ركعتان بعدية)'}]
};

const DEFAULT_DHIKR_LIST = [
  { id: 'salawat', label: 'الصلاة على النبي' },
  { id: 'hawqalah', label: 'الحوقلة' },
  { id: 'tahlil', label: 'لا إله إلا الله' },
  { id: 'baqiyat', label: 'الباقيات الصالحات' },
  { id: 'istighfar', label: 'الاستغفار' }
];

const DailyEntry: React.FC<DailyEntryProps> = ({ log, onUpdate, weights, onUpdateWeights, currentDate, onDateChange, onSwitchTab }) => {
  const [activePrayer, setActivePrayer] = useState<PrayerName>(PrayerName.FAJR);
  
  // States for adding custom items
  const [isAddingSunnah, setIsAddingSunnah] = useState(false);
  const [newSunnahName, setNewSunnahName] = useState('');
  const [newSunnahPoints, setNewSunnahPoints] = useState('50');

  const [isAddingDhikr, setIsAddingDhikr] = useState(false);
  const [newDhikrName, setNewDhikrName] = useState('');
  const [customDhikrs, setCustomDhikrs] = useState<{id: string, label: string, key: string}[]>([]);

  //ورد الدعاء
  const [isAddingDua, setIsAddingDua] = useState(false);
  const [newDuaText, setNewDuaText] = useState('');
  const [myDuas, setMyDuas] = useState<{id: string, text: string}[]>([]);

  useEffect(() => {
    const savedDhikrs = localStorage.getItem('worship_custom_dhikrs');
    if (savedDhikrs) setCustomDhikrs(JSON.parse(savedDhikrs));

    const savedDuas = localStorage.getItem('worship_my_duas');
    if (savedDuas) setMyDuas(JSON.parse(savedDuas));
  }, []);

  const updateSection = (section: keyof DailyLog, data: any, label?: string, type?: string) => {
    onUpdate({ ...log, [section]: { ...(log[section] as any), ...data } }, label, type);
  };

  const updatePrayer = (name: PrayerName, data: any, label?: string) => {
    onUpdate({ ...log, prayers: { ...log.prayers, [name]: { ...log.prayers[name], ...data } } }, label, 'prayer');
  };

  const toggleSunnahInPrayer = (prayerName: PrayerName, sunnahId: string, sunnahLabel: string) => {
    const current = log.prayers[prayerName].surroundingSunnahIds || [];
    const isAdding = !current.includes(sunnahId);
    const newIds = isAdding ? [...current, sunnahId] : current.filter(id => id !== sunnahId);
    updatePrayer(prayerName, { surroundingSunnahIds: newIds }, isAdding ? `أتمَّ ${sunnahLabel}` : undefined);
  };

  const handleAddCustomSunnah = () => {
    if (!newSunnahName.trim()) return;
    const newSunnah: CustomSunnah = {
      id: 'custom_' + Date.now(),
      name: newSunnahName.trim(),
      points: parseInt(newSunnahPoints) || 50
    };
    const updatedWeights = {
      ...weights,
      customSunnahs: [...(weights.customSunnahs || []), newSunnah]
    };
    onUpdateWeights(updatedWeights);
    localStorage.setItem('worship_weights', JSON.stringify(updatedWeights));
    setNewSunnahName('');
    setIsAddingSunnah(false);
  };

  const handleRemoveCustomSunnah = (id: string) => {
    const updatedWeights = {
      ...weights,
      customSunnahs: (weights.customSunnahs || []).filter(s => s.id !== id)
    };
    onUpdateWeights(updatedWeights);
    localStorage.setItem('worship_weights', JSON.stringify(updatedWeights));
    if (log.customSunnahIds.includes(id)) {
      onUpdate({ ...log, customSunnahIds: log.customSunnahIds.filter(cid => cid !== id) });
    }
  };

  const handleAddCustomDhikr = () => {
    if (!newDhikrName.trim()) return;
    const key = 'c_' + Date.now();
    const newList = [...customDhikrs, { id: key, label: newDhikrName.trim(), key }];
    setCustomDhikrs(newList);
    localStorage.setItem('worship_custom_dhikrs', JSON.stringify(newList));
    setNewDhikrName('');
    setIsAddingDhikr(false);
  };

  const handleRemoveCustomDhikr = (id: string) => {
    const newList = customDhikrs.filter(d => d.id !== id);
    setCustomDhikrs(newList);
    localStorage.setItem('worship_custom_dhikrs', JSON.stringify(newList));
  };

  const handleAddDua = () => {
    if (!newDuaText.trim()) return;
    const newDua = { id: 'dua_' + Date.now(), text: newDuaText.trim() };
    const newList = [...myDuas, newDua];
    setMyDuas(newList);
    localStorage.setItem('worship_my_duas', JSON.stringify(newList));
    setNewDuaText('');
    setIsAddingDua(false);
  };

  const handleRemoveDua = (id: string) => {
    const newList = myDuas.filter(d => d.id !== id);
    setMyDuas(newList);
    localStorage.setItem('worship_my_duas', JSON.stringify(newList));
    if (log.duaIdsCompleted?.includes(id)) {
      onUpdate({ ...log, duaIdsCompleted: log.duaIdsCompleted.filter(did => did !== id) });
    }
  };

  const toggleDuaSelection = (id: string) => {
    const current = log.duaIdsCompleted || [];
    const isAdding = !current.includes(id);
    const newIds = isAdding ? [...current, id] : current.filter(did => did !== id);
    onUpdate({ ...log, duaIdsCompleted: newIds }, isAdding ? 'ابتهل بالدعاء' : undefined, 'dua');
  };

  const toggleCustomSunnahSelection = (id: string, name: string) => {
    const isAdding = !log.customSunnahIds.includes(id);
    const newIds = isAdding ? [...log.customSunnahIds, id] : log.customSunnahIds.filter(cid => cid !== id);
    onUpdate({ ...log, customSunnahIds: newIds }, isAdding ? `أتم عمل مخصص: ${name}` : undefined, 'sunnah');
  };

  const counterItem = (label: string, field: string, icon: any, onRemove?: () => void) => (
    <div key={field} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-emerald-600">{icon}</span>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700 header-font truncate">{label}</span>
          {onRemove && <button onClick={onRemove} className="text-[8px] text-rose-400 font-bold hover:text-rose-600 text-right">حذف الذكر</button>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => updateSection('athkar', { counters: { ...log.athkar.counters, [field]: Math.max(0, (log.athkar.counters[field] || 0) - 10) } })} 
          className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm active:scale-90 transition-all"
        >
          <Minus className="w-4 h-4 text-slate-500" />
        </button>
        <div className="bg-emerald-100/50 border border-emerald-200/50 rounded-xl px-3 py-1 min-w-[3.5rem] flex items-center justify-center">
          <span className="text-lg font-black text-emerald-800 header-font tabular-nums">{log.athkar.counters[field] || 0}</span>
        </div>
        <button 
          onClick={() => updateSection('athkar', { counters: { ...log.athkar.counters, [field]: (log.athkar.counters[field] || 0) + 10 } }, `عطّر لسانه بـ ${label}`, 'athkar')} 
          className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm active:scale-90 transition-all"
        >
          <Plus className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );

  const isPerformed = log.prayers[activePrayer].performed;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* 0. Date Switcher */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <button onClick={() => onDateChange(format(addDays(new Date(currentDate.replace(/-/g, '/')), -1), 'yyyy-MM-dd'))} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronRight className="w-5 h-5" /></button>
        <div className="text-center">
          <span className="text-sm font-bold text-emerald-700 header-font bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-100 block">
            {format(new Date(currentDate.replace(/-/g, '/')), 'dd MMMM yyyy', { locale: ar })}
          </span>
        </div>
        <button onClick={() => onDateChange(format(addDays(new Date(currentDate.replace(/-/g, '/')), 1), 'yyyy-MM-dd'))} disabled={currentDate === format(new Date(), 'yyyy-MM-dd')} className="p-2 rounded-xl text-slate-400 disabled:opacity-20"><ChevronLeft className="w-5 h-5" /></button>
      </div>

      {/* 1. الصلوات والفرائض */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><Star className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">الصلوات</h3></div>
          <button onClick={() => updatePrayer(activePrayer, { performed: !isPerformed }, !isPerformed ? `أدى صلاة ${activePrayer}` : undefined)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all font-bold text-xs ${isPerformed ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>{isPerformed ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}{isPerformed ? 'تمت الصلاة' : 'تفعيل'}</button>
        </div>
        <div className="flex justify-between gap-1 mb-8 bg-slate-50 p-1.5 rounded-2xl">
          {Object.values(PrayerName).map((p) => (
            <button key={p} onClick={() => setActivePrayer(p)} className={`flex-1 py-3 rounded-xl transition-all flex flex-col items-center gap-1 ${activePrayer === p ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}>
              <span className="text-[10px] font-bold header-font">{p}</span>
              {log.prayers[p].performed && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
            </button>
          ))}
        </div>
        <div className={`space-y-6 ${isPerformed ? '' : 'opacity-40 grayscale pointer-events-none'}`}>
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3"><Users className={`w-5 h-5 ${log.prayers[activePrayer].inCongregation ? 'text-emerald-600' : 'text-slate-300'}`} /><h4 className="font-bold text-slate-800 text-sm">صلاة الجماعة</h4></div>
            <button onClick={() => updatePrayer(activePrayer, { inCongregation: !log.prayers[activePrayer].inCongregation }, !log.prayers[activePrayer].inCongregation ? `صلى ${activePrayer} جماعة` : undefined)} className={`w-12 h-6 rounded-full relative transition-all ${log.prayers[activePrayer].inCongregation ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${log.prayers[activePrayer].inCongregation ? 'left-1' : 'left-7'}`}></div></button>
          </div>
          <div className="grid grid-cols-1 gap-2">{(PRAYER_SUNNAHS[activePrayer] || []).map((s) => (<button key={s.id} onClick={() => toggleSunnahInPrayer(activePrayer, s.id, s.label)} className={`p-3 rounded-xl border text-xs font-bold transition-all ${log.prayers[activePrayer].surroundingSunnahIds?.includes(s.id) ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-500 border-slate-100'}`}>{s.label}</button>))}</div>
          <div className="pt-4 border-t border-slate-100"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">السنن المحيطة بالصلاة</h4><div className="flex flex-wrap gap-2">{SURROUNDING_SUNNAH_LIST.map((s) => (<button key={s.id} onClick={() => toggleSunnahInPrayer(activePrayer, s.id, s.label)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold transition-all ${log.prayers[activePrayer].surroundingSunnahIds?.includes(s.id) ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-slate-50 text-slate-400'}`}><Sparkle className="w-3 h-3" /> {s.label}</button>))}</div></div>
        </div>
      </div>

      {/* 2. نوافل الصلاة والقيام */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><Clock className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">نوافل الصلاة</h3></div>
        <div className="space-y-4">
          {[{ label: 'صلاة الضحى (دقيقة)', field: 'duhaDuration' as const }, { label: 'الوتر (دقيقة)', field: 'witrDuration' as const }, { label: 'قيام الليل (دقيقة)', field: 'qiyamDuration' as const }].map(field => (
            <div key={field.field} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-xs font-bold text-slate-700 header-font">{field.label}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => updateSection('nawafil', { [field.field]: Math.max(0, log.nawafil[field.field] - 5) })} className="p-1.5 bg-white border border-slate-200 rounded-xl"><Minus className="w-4 h-4 text-slate-400" /></button>
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-1 min-w-[3.2rem] flex items-center justify-center"><span className="text-base font-black text-slate-800 tabular-nums">{log.nawafil[field.field]}</span></div>
                <button onClick={() => updateSection('nawafil', { [field.field]: log.nawafil[field.field] + 5 }, `أطال في ${field.label.split(' ')[0]}`, 'prayer')} className="p-1.5 bg-white border border-slate-200 rounded-xl"><Plus className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          ))}
          <button onClick={() => updateSection('nawafil', { fasting: !log.nawafil.fasting }, !log.nawafil.fasting ? 'صائم محتسب' : undefined, 'sunnah')} className={`w-full p-4 rounded-3xl border flex items-center justify-between transition-all ${log.nawafil.fasting ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500'}`}><span className="font-bold text-sm">صيام يوم كامل</span>{log.nawafil.fasting ? <span className="text-xs font-black">+1500 نقطة</span> : <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />}</button>
        </div>
      </div>

      {/* 3. ورد القرآن الكريم */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><Book className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">ورد القرآن</h3></div>
        
        {/* حقول الختمة والسورة الجديدة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-black text-emerald-800 header-font">رقم الختمة الحالية</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateSection('quran', { khatmaNumber: Math.max(1, (log.quran.khatmaNumber || 1) - 1) })} className="p-1.5 bg-white rounded-lg border border-emerald-200 shadow-sm"><Minus className="w-3.5 h-3.5 text-emerald-600" /></button>
              <span className="text-lg font-black font-mono text-emerald-900 flex-1 text-center">{log.quran.khatmaNumber || 1}</span>
              <button onClick={() => updateSection('quran', { khatmaNumber: (log.quran.khatmaNumber || 1) + 1 })} className="p-1.5 bg-white rounded-lg border border-emerald-200 shadow-sm"><Plus className="w-3.5 h-3.5 text-emerald-600" /></button>
            </div>
          </div>
          
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <BookMarked className="w-4 h-4 text-amber-600" />
              <span className="text-[11px] font-black text-amber-800 header-font">اسم السورة / الموضع</span>
            </div>
            <textarea 
              rows={1}
              value={log.quran.surahName || ''}
              onChange={(e) => updateSection('quran', { surahName: e.target.value })}
              placeholder="مثال: البقرة، من آية ١ إلى ٥٠.."
              className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-amber-400 transition-all resize-none leading-relaxed"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          {[{ label: 'ورد السماع (أرباع)', field: 'hifzRub' as const }, { label: 'ورد القراءة (أرباع)', field: 'revisionRub' as const }].map(q => (
            <div key={q.field} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm font-bold text-slate-700 header-font">{q.label}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => updateSection('quran', { [q.field]: Math.max(0, (log.quran as any)[q.field] - 1) })} className="p-2 bg-white border border-slate-200 rounded-xl"><Minus className="w-4 h-4 text-slate-400" /></button>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-1.5 min-w-[3.5rem] flex items-center justify-center"><span className="text-xl font-black text-slate-800 tabular-nums">{(log.quran as any)[q.field]}</span></div>
                <button onClick={() => updateSection('quran', { [q.field]: (log.quran as any)[q.field] + 1 }, `أتمَّ ربعاً في ${q.label}`, 'quran')} className="p-2 bg-white border border-slate-200 rounded-xl"><Plus className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. الأذكار والتحصين */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2"><ScrollText className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">الأذكار</h3></div>
          <button onClick={() => setIsAddingDhikr(!isAddingDhikr)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            {isAddingDhikr ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          </button>
        </div>

        {isAddingDhikr && (
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-emerald-100 space-y-3 animate-in slide-in-from-top duration-300">
            <input type="text" placeholder="اسم الذكر (مثال: سبحان الله وبحمده)" value={newDhikrName} onChange={(e) => setNewDhikrName(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-emerald-500" />
            <button onClick={handleAddCustomDhikr} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs">إضافة الذكر للعدادات</button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {(['morning', 'evening', 'sleep'] as const).map(id => {
            const label = id === 'morning' ? 'أذكار الصباح' : id === 'evening' ? 'أذكار المساء' : 'أذكار النوم';
            return (
              <button 
                key={id} 
                onClick={() => updateSection('athkar', { checklists: { ...log.athkar.checklists, [id]: !log.athkar.checklists[id] } }, !log.athkar.checklists[id] ? `أتمَّ ${label}` : undefined, 'athkar')} 
                className={`flex items-center justify-center p-3 rounded-2xl border transition-all ${log.athkar.checklists[id] ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black' : 'bg-slate-50 text-slate-400 border-slate-100 font-bold'}`}
              >
                <span className="text-xs">{label.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>

        {onSwitchTab && (
          <div className="mb-6 p-4 bg-emerald-50/40 rounded-2xl border border-dashed border-emerald-200/60 text-center text-slate-700">
            <p className="text-[11px] font-bold leading-normal mb-2.5">
              ✨ تفضل قراءة وحساب أورادك بلمسات تفاعليّة تصفيرية؟
            </p>
            <button 
              onClick={() => onSwitchTab('athkar')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black header-font shadow-md transition-all active:scale-95 inline-flex items-center gap-1"
            >
              افتح شاشة الأذكار التفاعلية 🌅
            </button>
          </div>
        )}

        <div className="space-y-3">
          {DEFAULT_DHIKR_LIST.map(d => counterItem(d.label, d.id, <Zap className="w-4 h-4" />))}
          {customDhikrs.map(d => counterItem(d.label, d.key, <Sparkle className="w-4 h-4" />, () => handleRemoveCustomDhikr(d.id)))}
        </div>
      </div>

      {/* 5. طلب العلم والقراءة */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6"><GraduationCap className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-lg">طلب العلم والقراءة</h3></div>
        <div className="space-y-4">
          {[
            { label: 'علم شرعي (دقيقة)', field: 'shariDuration' as const },
            { label: 'قراءة عامة (دقيقة)', field: 'readingDuration' as const },
            { label: 'عدد الصفحات المقروءة', field: 'readingPages' as const }
          ].map(k => (
            <div key={k.field} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-xs font-bold text-slate-700 header-font">{k.label}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => updateSection('knowledge', { [k.field]: Math.max(0, (log.knowledge[k.field] || 0) - (k.field === 'readingPages' ? 1 : 5)) })} className="p-1.5 bg-white border border-slate-200 rounded-xl"><Minus className="w-4 h-4 text-slate-400" /></button>
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-1 min-w-[3.2rem] flex items-center justify-center"><span className="text-base font-black text-slate-800 tabular-nums">{log.knowledge[k.field] || 0}</span></div>
                <button onClick={() => updateSection('knowledge', { [k.field]: (log.knowledge[k.field] || 0) + (k.field === 'readingPages' ? 1 : 5) }, `اجتهد في ${k.label}`, 'knowledge')} className="p-1.5 bg-white border border-slate-200 rounded-xl"><Plus className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. ورد الدعاء */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 header-font text-lg">ورد الدعاء</h3>
          </div>
          <button onClick={() => setIsAddingDua(!isAddingDua)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all">
            {isAddingDua ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          </button>
        </div>

        {isAddingDua && (
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-emerald-100 space-y-3 animate-in slide-in-from-top duration-300">
            <textarea 
              rows={2}
              placeholder="اكتب دعاءك هنا (سيتم حفظه في قائمة أدعيتك الخاصة).." 
              value={newDuaText} 
              onChange={(e) => setNewDuaText(e.target.value)} 
              className="w-full p-4 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-emerald-500 resize-none leading-relaxed"
            />
            <button 
              onClick={handleAddDua} 
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              حفظ الدعاء في الورد
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {myDuas.map(dua => (
            <div key={dua.id} className="flex items-start gap-2 group">
              <button 
                onClick={() => toggleDuaSelection(dua.id)} 
                className={`flex-1 flex items-start gap-3 p-4 rounded-2xl border transition-all text-right ${log.duaIdsCompleted?.includes(dua.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white'}`}
              >
                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${log.duaIdsCompleted?.includes(dua.id) ? 'bg-white/20 border-white/40' : 'bg-white border-slate-300'}`}>
                  {log.duaIdsCompleted?.includes(dua.id) && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-[11px] font-bold header-font leading-relaxed break-words whitespace-pre-wrap flex-1">
                  {dua.text}
                </span>
              </button>
              <button 
                onClick={() => handleRemoveDua(dua.id)} 
                className="p-3 mt-1 text-rose-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {myDuas.length === 0 && !isAddingDua && (
            <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-[10px] text-slate-400 font-bold header-font">أضف أدعيتك المأثورة أو الخاصة لتلهج بها في يومك.</p>
            </div>
          )}
        </div>
      </div>

      {/* 7. الأعمال المخصصة والسنن */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Tags className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 header-font text-lg">أعمال مخصصة</h3>
          </div>
          <button onClick={() => setIsAddingSunnah(!isAddingSunnah)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all">
            {isAddingSunnah ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          </button>
        </div>

        {isAddingSunnah && (
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-emerald-100 space-y-3 animate-in slide-in-from-top duration-300">
            <input type="text" placeholder="اسم العمل (مثال: صلة رحم)" value={newSunnahName} onChange={(e) => setNewSunnahName(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-emerald-500" />
            <div className="flex gap-2">
              <input type="number" placeholder="النقاط" value={newSunnahPoints} onChange={(e) => setNewSunnahPoints(e.target.value)} className="w-24 p-3 rounded-xl border border-slate-200 text-xs font-bold outline-none text-center" />
              <button onClick={handleAddCustomSunnah} className="flex-1 bg-emerald-600 text-white rounded-xl font-bold text-xs">إضافة العمل</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          {(weights.customSunnahs || []).map(s => (
            <div key={s.id} className="flex items-center gap-2">
              <button 
                onClick={() => toggleCustomSunnahSelection(s.id, s.name)} 
                className={`flex-1 flex items-center justify-between p-4 rounded-2xl border transition-all ${log.customSunnahIds.includes(s.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
              >
                <div className="flex items-center gap-3">
                  {log.customSunnahIds.includes(s.id) ? <CheckCircle2 className="w-4 h-4" /> : <Sparkle className="w-4 h-4 text-emerald-500" />}
                  <span className="text-xs font-bold">{s.name}</span>
                </div>
                <span className="text-[10px] font-black font-mono">+{s.points}</span>
              </button>
              <button onClick={() => handleRemoveCustomSunnah(s.id)} className="p-4 text-rose-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {(!weights.customSunnahs || weights.customSunnahs.length === 0) && !isAddingSunnah && (
            <p className="text-center text-[10px] text-slate-400 font-bold py-4">أضف أعمالك الخاصة (صدقة، صلة رحم، بر..) لترصد تقدمك فيها.</p>
          )}
        </div>
      </div>

      {/* 8. المجاهدة والعبء الروحي */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest header-font">المجاهدة</span>
            <Heart className={`w-3.5 h-3.5 ${log.jihadFactor > 1 ? 'text-rose-500 fill-rose-500' : 'text-slate-200'}`} />
          </div>
          <div className="flex gap-1.5">
            {[1.0, 1.05, 1.1].map(f => (
              <button key={f} onClick={() => onUpdate({ ...log, jihadFactor: f })} className={`flex-1 py-1.5 rounded-xl text-[9px] font-black transition-all header-font ${log.jihadFactor === f ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-50 text-slate-400 border border-transparent'}`}>
                {f === 1.0 ? 'عادي' : f === 1.05 ? 'مجاهدة' : 'شديدة'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => onUpdate({ ...log, hasBurden: !log.hasBurden }, !log.hasBurden ? 'فترة عبء روحي' : undefined, 'status')} className={`flex-1 p-4 rounded-[2rem] shadow-sm border transition-all flex flex-col items-center justify-center gap-1 ${log.hasBurden ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-inner' : 'bg-white border-slate-100 text-slate-400'}`}>
          <ShieldAlert className={`w-5 h-5 ${log.hasBurden ? 'text-amber-500' : 'text-slate-200'}`} />
          <span className="text-[10px] font-black header-font">العبء الروحي</span>
        </button>
      </div>

    </div>
  );
};

export default DailyEntry;
