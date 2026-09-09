
import React, { useMemo } from 'react';
import { 
  Zap,
  Activity,
  Sparkles,
  TrendingUp,
  Scale,
  BrainCircuit,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  Cell,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { DailyLog, AppWeights } from '../types';
import { calculateTotalScore } from '../utils/scoring';

interface WorshipPatternsProps {
  logs: Record<string, DailyLog>;
  weights: AppWeights;
}

const WorshipPatterns: React.FC<WorshipPatternsProps> = ({ logs, weights }) => {
  const scatterData = useMemo(() => {
    return (Object.values(logs) as DailyLog[]).map(log => {
      const totalMinutes = 
        log.knowledge.shariDuration + 
        log.knowledge.readingDuration + 
        log.nawafil.duhaDuration + 
        log.nawafil.witrDuration + 
        log.nawafil.qiyamDuration;
      
      const score = calculateTotalScore(log, weights);
      
      return {
        minutes: totalMinutes,
        score: score,
        jihad: log.jihadFactor,
        date: log.date,
        density: totalMinutes > 0 ? (score / totalMinutes).toFixed(1) : 0
      };
    }).filter(d => d.minutes > 0 || d.score > 0);
  }, [logs, weights]);

  const spiritualDensity = useMemo(() => {
    const totalMins = scatterData.reduce((acc, curr) => acc + curr.minutes, 0);
    const totalScore = scatterData.reduce((acc, curr) => acc + curr.score, 0);
    return totalMins > 0 ? Math.round(totalScore / totalMins) : 0;
  }, [scatterData]);

  const jihadImpactData = useMemo(() => {
    const groups = {
      normal: [] as number[],
      struggle: [] as number[],
      high: [] as number[]
    };

    (Object.values(logs) as DailyLog[]).forEach(log => {
      const score = calculateTotalScore(log, weights);
      if (log.jihadFactor === 1.0) groups.normal.push(score);
      else if (log.jihadFactor === 1.05) groups.struggle.push(score);
      else if (log.jihadFactor === 1.1) groups.high.push(score);
    });

    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    return [
      { name: 'جهد عادي', score: avg(groups.normal), fill: '#10b981', label: '1.0x' },
      { name: 'مجاهدة', score: avg(groups.struggle), fill: '#f59e0b', label: '1.05x' },
      { name: 'مجاهدة شديدة', score: avg(groups.high), fill: '#ef4444', label: '1.1x' }
    ];
  }, [logs, weights]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-emerald-100 rounded-2xl">
          <BrainCircuit className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 header-font leading-none mb-1">تحليل القيمة المضافة</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase header-font tracking-widest">فهم نمط عبادتك وعائد المجهود</p>
        </div>
      </div>

      {/* Spiritual ROI Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:scale-110 transition-transform"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">كثافة الاتصال الروحي (Average)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-mono tracking-tighter">{spiritualDensity}</span>
                <span className="text-xs opacity-60 header-font font-bold">نقطة / دقيقة</span>
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div className="h-px bg-white/10 w-full mb-4" />
          <p className="text-xs leading-relaxed text-slate-300 font-medium header-font italic">
            "هذا المؤشر يخبرك بمدى 'تركيز' مجهودك؛ كلما ارتفع الرقم، دل ذلك على أنك تحقق عائداً إيمانياً أكبر في زمن أقل بفضل المجاهدة والخشوع."
          </p>
        </div>
      </div>

      {/* Jihad Impact Visualization */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-slate-800 header-font text-sm">أثر المجاهدة على رصيد الإيمان</h3>
          </div>
          <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[9px] font-black header-font">مضاعفة الأجر</div>
        </div>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jihadImpactData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700, fontFamily: 'Cairo' }} 
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Cairo' }}
              />
              <Bar dataKey="score" radius={[12, 12, 0, 0]}>
                {jihadImpactData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed text-center header-font">
            نحن نكافئ "المجاهدة" في أوقات الضيق؛ لاحظ كيف يرتفع متوسط نقاطك عندما تقرر ألا تترك وردك رغم الضغوط.
          </p>
        </div>
      </div>

      {/* Efficiency Scatter Plot */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Scale className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 header-font text-sm">توزيع الجودة (النقاط مقابل الزمن)</h3>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                type="number" 
                dataKey="minutes" 
                name="الزمن" 
                unit=" د" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
              />
              <YAxis 
                type="number" 
                dataKey="score" 
                name="الرصيد" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
              />
              <ZAxis type="number" dataKey="density" range={[50, 400]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Cairo' }}
              />
              <Scatter name="الأيام" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.jihad > 1.0 ? '#f59e0b' : '#10b981'} 
                    fillOpacity={0.7}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-[10px] font-bold text-slate-500 header-font">أيام المجاهدة (مستوى إيمان أعلى بمجهود مركز)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-bold text-slate-500 header-font">أيام الاستقرار (توازن بين الزمن والنتيجة)</span>
          </div>
        </div>
      </div>

      {/* Conclusion */}
      <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100 flex gap-4">
        <Activity className="w-8 h-8 text-emerald-600 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-emerald-800 mb-1 header-font">العبادة استثمار وليست عبئاً</h4>
          <p className="text-xs text-emerald-700 leading-relaxed font-bold header-font">
            تطبيق أوراد يهدف لتغيير نظرتك للعمل الصالح؛ لتراه كمشروع ينمو وتزداد "جودته" مع الوقت، وليس مجرد مهام تنتهي منها.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorshipPatterns;
