
import React from 'react';
import { 
  Star, Heart, Book, GraduationCap, Zap, 
  Target, Info, ArrowUpRight, ShieldAlert,
  Users, Sparkles, Clock, Sun, Flame,
  Award, Home, Coins, Key, CloudMoon, MapPin,
  ListChecks, Activity, ScrollText, Tags,
  BookOpen, CheckCircle2, Skull
} from 'lucide-react';
import { DEFAULT_WEIGHTS } from '../constants';

const WorshipGuide: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* هيدر الدليل */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 header-font">الدليل الشامل لتطبيق أوراد</h2>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed header-font">
          تطبيق أوراد هو أداة رقمية لمحاسبة النفس، تعتمد على متابعة الطاعات وبناء الأوراد اليومية لتعكس الجهد المبذول والوقت المستثمر في التقرب إلى الله.
        </p>
      </div>

      {/* قسم الأوسمة والكرامات */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-800 header-font text-lg">دليل الأوسمة والكرامات</h3>
        </div>
        <p className="text-[11px] text-slate-400 font-bold mb-6 header-font">تُمنح هذه الأوسمة يومياً بناءً على إنجاز أوراد محددة، وهي حوافز معنوية تذكرك بفضل العمل:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
             <div className="p-2 bg-white rounded-xl h-fit shadow-sm"><Sun className="w-5 h-5 text-amber-500" /></div>
             <div>
               <h4 className="text-xs font-black text-slate-800 header-font mb-1">بشرى الرؤية</h4>
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed">يُستحق عند تسجيل أداء <span className="text-amber-600">صلاة الفجر</span> في وقتها.</p>
             </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
             <div className="p-2 bg-white rounded-xl h-fit shadow-sm"><Home className="w-5 h-5 text-emerald-600" /></div>
             <div>
               <h4 className="text-xs font-black text-slate-800 header-font mb-1">بيت في الجنة</h4>
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed">يُستحق عند إتمام <span className="text-emerald-600">١٢ ركعة راتبة</span> (فجر، ظهر، مغرب، عشاء).</p>
             </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-4">
             <div className="p-2 bg-white rounded-xl h-fit shadow-sm"><Flame className="w-5 h-5 text-orange-500" /></div>
             <div>
               <h4 className="text-xs font-black text-slate-800 header-font mb-1">بعيد عن النار</h4>
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed">يُستحق عند تفعيل خيار <span className="text-orange-600">الصيام</span> لهذا اليوم.</p>
             </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
             <div className="p-2 bg-white rounded-xl h-fit shadow-sm"><CloudMoon className="w-5 h-5 text-indigo-900" /></div>
             <div>
               <h4 className="text-xs font-black text-slate-800 header-font mb-1">محبوب الرحمن</h4>
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed">يُستحق عند تسجيل أي مدة زمنية في <span className="text-indigo-900">صلاة الوتر</span>.</p>
             </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
             <div className="p-2 bg-white rounded-xl h-fit shadow-sm"><Coins className="w-5 h-5 text-blue-600" /></div>
             <div>
               <h4 className="text-xs font-black text-slate-800 header-font mb-1">مفتاح الرزق</h4>
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed">يُستحق عند تسجيل أي عدد في عداد <span className="text-blue-600">الاستغفار</span>.</p>
             </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-4">
             <div className="p-2 bg-white rounded-xl h-fit shadow-sm"><Key className="w-5 h-5 text-indigo-600" /></div>
             <div>
               <h4 className="text-xs font-black text-slate-800 header-font mb-1">مفتاح النجاح</h4>
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed">يُستحق عند تسجيل أي عدد في عداد <span className="text-indigo-600">الحوقلة</span>.</p>
             </div>
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex gap-4">
             <div className="p-2 bg-white rounded-xl h-fit shadow-sm"><Heart className="w-5 h-5 text-rose-500" /></div>
             <div>
               <h4 className="text-xs font-black text-slate-800 header-font mb-1">مفتاح القرب</h4>
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed">يُستحق عند تسجيل أي عدد في عداد <span className="text-rose-500">الصلاة على النبي</span>.</p>
             </div>
          </div>
        </div>
      </div>

      {/* قسم الصلوات والخشوع */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 header-font text-lg">الصلوات والخشوع</h3>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-700 header-font">صلاة الجماعة (في المسجد)</span>
              <span className="text-lg font-black text-emerald-600 font-mono">+{DEFAULT_WEIGHTS.fardCongregation}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700 header-font">صلاة المنفرد (أو بغير جماعة)</span>
              <span className="text-lg font-black text-slate-400 font-mono">+{DEFAULT_WEIGHTS.fardSolo}</span>
            </div>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <h4 className="text-[10px] font-black text-amber-800 uppercase mb-2 header-font tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> مضاعف الخشوع (التأثير الأكبر)
            </h4>
            <p className="text-[11px] text-amber-700 leading-relaxed font-bold header-font">
              الخشوع ليس رقماً ثابتاً بل نسبة تضاعف الأجر الأساسي للصلاة:
              <br/>• حضور أدنى: <span className="text-emerald-600">0%</span> مضاعفة.
              <br/>• خاشع جداً: <span className="text-emerald-600">+10%</span> زيادة.
              <br/>• إحسان (كأنك تراه): <span className="text-emerald-600">+20%</span> زيادة على إجمالي الصلاة.
            </p>
          </div>
        </div>
      </div>

      {/* ورد القرآن الكريم */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Book className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 header-font text-lg"> ورد القرآن الكريم </h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 header-font"> ورد السماع</h4>
                <p className="text-[10px] text-emerald-600 font-bold">لكل ربع حزب</p>
              </div>
            </div>
            <span className="text-xl font-black text-emerald-600 font-mono">+{DEFAULT_WEIGHTS.quranHifz}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-slate-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 header-font"> ورد القراءة</h4>
                <p className="text-[10px] text-slate-400 font-bold">لكل ربع حزب</p>
              </div>
            </div>
            <span className="text-xl font-black text-slate-600 font-mono">+{DEFAULT_WEIGHTS.quranRevision}</span>
          </div>
        </div>
      </div>

      {/* الأذكار والتحصين */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <ScrollText className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 header-font text-lg">الأذكار والتحصين</h3>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-slate-700 header-font">قوائم الأذكار الكاملة</span>
              </div>
              <span className="text-lg font-black text-emerald-600 font-mono">+{DEFAULT_WEIGHTS.athkarChecklist}</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold mr-6">(صباح، مساء، نوم، سفر)</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-slate-700 header-font">عدادات الأذكار (لكل ١٠)</span>
              </div>
              <span className="text-lg font-black text-emerald-600 font-mono">+{DEFAULT_WEIGHTS.athkarCounter * 10}</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold mr-6">(استغفار، صلاة على النبي، حوقلة، تهليل..)</p>
          </div>
        </div>
      </div>

      {/* النوافل وطلب العلم */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 header-font text-lg">النوافل والزمن</h3>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-slate-800 header-font">النوافل (قيام، ضحى، وتر)</span>
              </div>
              <span className="text-lg font-black text-emerald-600 font-mono">+{DEFAULT_WEIGHTS.nawafilPerMin}/د</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-bold">كل دقيقة تقضيها في صلاة النفل تمنحك ٥ نقاط. العبرة بطول الوقوف.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-center">
              <GraduationCap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <h4 className="text-[10px] font-black text-slate-700 header-font">العلم الشرعي</h4>
              <span className="text-lg font-black text-purple-700 font-mono">+{DEFAULT_WEIGHTS.knowledgeShari}/د</span>
              <p className="text-[8px] text-purple-500 font-bold mt-1">(أي دقيقة = 10 نقاط)</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
              <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h4 className="text-[10px] font-black text-slate-700 header-font">القراءة العامة</h4>
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-xs font-black text-blue-700 font-mono">+{DEFAULT_WEIGHTS.knowledgeGeneral}/د</span>
                <span className="text-[9px] text-blue-500">+{DEFAULT_WEIGHTS.pointsPerPage}/صفحة</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-100 flex justify-between items-center">
             <div className="flex items-center gap-2">
               <span className="text-sm font-bold header-font">صيام يوم كامل</span>
             </div>
             <span className="text-lg font-black font-mono">+{DEFAULT_WEIGHTS.fastingDay}</span>
          </div>
        </div>
      </div>

      <div className="text-center p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <Sparkles className="w-full h-full" />
        </div>
        <p className="text-xs font-bold header-font leading-relaxed relative z-10">
          "إنما الأعمال بالنيات، وهذا الميزان هو أداة لمساعدتك على رؤية تقدمك، لكن القبول والمضاعفة هما من فضل الله الواسع سبحانه."
        </p>
      </div>
    </div>
  );
};

export default WorshipGuide;
