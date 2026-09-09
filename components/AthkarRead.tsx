import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Heart, 
  Award, 
  Info,
  ChevronLeft,
  Check,
  Bed
} from 'lucide-react';
import { DailyLog } from '../types';

export interface AthkarItem {
  id: string;
  text: string;
  count: number;
  virtue: string;
}

export const MORNING_ATHKAR: AthkarItem[] = [
  {
    id: 'm_1',
    text: 'أعوذ بالله من الشيطان الرجيم: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ..." (آية الكرسي)',
    count: 1,
    virtue: 'من قالها حين يصبح أجير من الجن حتى يمسي.'
  },
  {
    id: 'm_2',
    text: 'بسم الله الرحمن الرحيم: "قُلْ هُوَ اللَّهُ أَحَدٌ..."، "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ..."، "قُلْ أَعُوذُ بِرَبِّ النَّاسِ..."',
    count: 3,
    virtue: 'من قالها ثلاثاً حين يصبح وثلاثاً حين يمسي كفته من كل شيء.'
  },
  {
    id: 'm_3',
    text: 'أصبحتُ أُثني عليكَ حَمْداً، وأشهدُ أن لا إله إلا الله.',
    count: 3,
    virtue: 'اعتراف بالتوحيد والثناء على الله جل وعلا في أول اليوم.'
  },
  {
    id: 'm_4',
    text: 'أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، ربّ أسألك خير ما في هذا اليوم وخير ما بعده، وأعوذ بك من شر ما في هذا اليوم وشر ما بعده.',
    count: 1,
    virtue: 'طلب لخير اليوم واستعاذة من شره وصيانة للعبد.'
  },
  {
    id: 'm_5',
    text: 'اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور.',
    count: 1,
    virtue: 'اعتراف بفضل الله المتجدد في الصباح بالنشور واليقظة.'
  },
  {
    id: 'm_6',
    text: 'اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت. (سيد الاستغفار)',
    count: 1,
    virtue: 'من قالها موقناً بها فمات من يومه قبل أن يمسي دخل الجنة.'
  },
  {
    id: 'm_7',
    text: 'اللهم إني أصبحت أشهدك وأشهد حملة عرشك، وملائكتك وجميع خلقك، أنك أنت الله لا إله إلا أنت وحدك لا شريك لك، وأن محمداً عبدك ورسولك.',
    count: 4,
    virtue: 'من قالها مرة أعتق الله ربعه من النار، فإن قالها أربعاً أعتقه الله بالكامل.'
  },
  {
    id: 'm_8',
    text: 'اللهم ما أصبح بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر.',
    count: 1,
    virtue: 'من قالها حين يصبح فقد أدى شكر يومه.'
  },
  {
    id: 'm_9',
    text: 'حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.',
    count: 7,
    virtue: 'من قالها سبع مرات كفاه الله ما أهمه من أمر الدنيا والآخرة.'
  },
  {
    id: 'm_10',
    text: 'بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.',
    count: 3,
    virtue: 'من قالها ثلاثاً لم يضره شيء في ذلك اليوم.'
  },
  {
    id: 'm_11',
    text: 'اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت. اللهم إني أعوذ بك من الكفر والفقر، وأعوذ بك من عذاب القبر لا إله إلا أنت.',
    count: 3,
    virtue: 'حرز وصحة وسؤال لله بالعافية في الحواس الثلاثة.'
  },
  {
    id: 'm_12',
    text: 'رضيت بالله رباً، وبالإسلام ديناً، وبمحمد صلى الله عليه وسلم نبياً.',
    count: 3,
    virtue: 'من قالها ثلاثاً كان حقاً على الله أن يرضيه يوم القيامة.'
  },
  {
    id: 'm_13',
    text: 'يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين.',
    count: 1,
    virtue: 'دعاء وتفويض كافٍ ومصلح لكل الشئون والأنشطة اليومية.'
  },
  {
    id: 'm_14',
    text: 'أصبحنا على فطرة الإسلام وعلى كلمة الإخلاص، وعلى دين نبينا محمد صلى الله عليه وسلم، وعلى ملة أبينا إبراهيم حنيفاً مسلماً وما كان من المشركين.',
    count: 1,
    virtue: 'تأسيس الصباح على التوحيد الخالص وفطرة الإسلام السليمة.'
  },
  {
    id: 'm_15',
    text: 'سبحان الله وبحمده: عدد خلقه، ورضا نفسه، وزنة عرشه، ومداد كلماته.',
    count: 3,
    virtue: 'أجر عظيم يعادل ساعات طويلة من الذكر والتسبيح المعتاد.'
  },
  {
    id: 'm_16',
    text: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.',
    count: 10,
    virtue: 'من قالها كُتبت له مائة حسنة ومُحيت عنه مائة سيئة وكانت له حرزاً من الشيطان.'
  },
  {
    id: 'm_17',
    text: 'سبحان الله وبحمده.',
    count: 100,
    virtue: 'من قالها مائة مرة حطت خطاياه وإن كانت مثل زبد البحر.'
  },
  {
    id: 'm_18',
    text: 'اللهم صلِّ وسلِّم على نبينا محمد.',
    count: 10,
    virtue: 'استحقاق شفاعة النبي يوم القيامة (قال رسول الله ﷺ: «من صلى علي حين يصبح عشراً وحين يمسي عشراً أدركته شفاعتي يوم القيامة»).'
  }
];

export const EVENING_ATHKAR: AthkarItem[] = [
  {
    id: 'e_1',
    text: 'أعوذ بالله من الشيطان الرجيم: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ..." (آية الكرسي)',
    count: 1,
    virtue: 'من قالها حين يمسي أجير من الجن حتى يصبح.'
  },
  {
    id: 'e_2',
    text: 'بسم الله الرحمن الرحيم: "قُلْ هُوَ اللَّهُ أَحَدٌ..."، "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ..."، "قُلْ أَعُوذُ بِرَبِّ النَّاسِ..."',
    count: 3,
    virtue: 'من قالها ثلاثاً حين يمسي كفته من كل شيء.'
  },
  {
    id: 'e_3',
    text: 'أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، ربّ أسألك خير ما في هذه الليلة وخير ما بعدها، وأعوذ بك من شر ما في هذه الليلة وشر ما بعدها.',
    count: 1,
    virtue: 'طلب لخير الليلة وهدايتها واستعاذة من شرها وظلمها.'
  },
  {
    id: 'e_4',
    text: 'اللهم بك أمسينا، وبك أصبحنا، وبك نحيا، وبك نموت، وإليك المصير.',
    count: 1,
    virtue: 'الحمد لله على إدراك المساء بسلامة بدن وإيمان.'
  },
  {
    id: 'e_5',
    text: 'اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت. (سيد الاستغفار)',
    count: 1,
    virtue: 'من قالها موقناً بها فمات من ليلته قبل أن يصبح دخل الجنة.'
  },
  {
    id: 'e_6',
    text: 'اللهم إني أمسيت أشهدك وأشهد حملة عرشك، وملائكتك وجميع خلقك، أنك أنت الله لا إله إلا أنت وحدك لا شريك لك، وأن محمداً عبدك ورسولك.',
    count: 4,
    virtue: 'من قالها أمسى يحرر رقبته من النار ربعاً بربع حتى يعتقها بالكامل.'
  },
  {
    id: 'e_7',
    text: 'اللهم ما أمسى بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر.',
    count: 1,
    virtue: 'من قالها حين يمسي فقد أدى شكر ليلته.'
  },
  {
    id: 'e_8',
    text: 'حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.',
    count: 7,
    virtue: 'يكفي العبد ما أهمه وبغمه في دنياه وأخراه.'
  },
  {
    id: 'e_9',
    text: 'بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.',
    count: 3,
    virtue: 'حصن عظيم يقيك ويدفع عنك كل مكروه وحادث طارئ.'
  },
  {
    id: 'e_10',
    text: 'اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت. اللهم إني أعوذ بك من الكفر والفقر، وأعوذ بك من عذاب القبر لا إله إلا أنت.',
    count: 3,
    virtue: 'الاستعاذة من الآفات وبلايا الأبدان والقلوب والقبور.'
  },
  {
    id: 'e_11',
    text: 'رضيت بالله رباً، وبالإسلام ديناً، وبمحمد صلى الله عليه وسلم نبياً.',
    count: 3,
    virtue: 'جزاؤها رضا الله المتكامل والكامل للعبد يوم القيامة.'
  },
  {
    id: 'e_12',
    text: 'يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين.',
    count: 1,
    virtue: 'الالتجاء الدائم لواهب الحياة والقيومية.'
  },
  {
    id: 'e_13',
    text: 'أمسينا على فطرة الإسلام وعلى كلمة الإخلاص، وعلى دين نبينا محمد صلى الله عليه وسلم، وعلى ملة أبينا إبراهيم حنيفاً مسلماً وما كان من المشركين.',
    count: 1,
    virtue: 'دوام الاستمساك بالعروة الوثقى ومناهج الأنبياء.'
  },
  {
    id: 'e_14',
    text: 'أعوذ بكلمات الله التامات من شر ما خلق.',
    count: 3,
    virtue: 'من قالها حين يمسي ثلاث مرات لم تضره حمة (سم ولدغة عقرب أو حية) في تلك الليلة.'
  },
  {
    id: 'e_15',
    text: 'سبحان الله وبحمده.',
    count: 100,
    virtue: 'حط ورفع للخطايا والسيئات مهما بلغت كثرتها.'
  },
  {
    id: 'e_16',
    text: 'اللهم صلِّ وسلِّم على نبينا محمد.',
    count: 10,
    virtue: 'استحقاق شفاعة النبي يوم القيامة (قال رسول الله ﷺ: «من صلى علي حين يصبح عشراً وحين يمسي عشراً أدركته شفاعتي يوم القيامة»).'
  }
];

export const SLEEP_ATHKAR: AthkarItem[] = [
  {
    id: 's_1',
    text: 'أعوذ بالله من الشيطان الرجيم: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ..." (آية الكرسي)',
    count: 1,
    virtue: 'من قرأها إذا أوى إلى فراشه لم يزل عليه من الله حافظ ولا يقربه شيطان حتى يصبح.'
  },
  {
    id: 's_2',
    text: 'بسم الله الرحمن الرحيم: "قُلْ هُوَ اللَّهُ أَحَدٌ..."، "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ..."، "قُلْ أَعُوذُ بِرَبِّ النَّاسِ..." (ثم يمسح بهما ما استطاع من جسده)',
    count: 3,
    virtue: 'سنة نبوية تفعل عند النوم لحفظ البدن والروح من الآفات والشرور.'
  },
  {
    id: 's_3',
    text: 'أعوذ بالله من الشيطان الرجيم: "آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ..." (آخر آيتين من سورة البقرة)',
    count: 1,
    virtue: 'من قرأهما في ليلة كفتاه (أي كفتاه شرور ليلته، وقيل كفتاه عن قيام الليل).'
  },
  {
    id: 's_4',
    text: 'باسمِكَ ربِّي وضَعْتُ جَنْبي وبِكَ أَرْفَعُهُ، فإنْ أَمْسَكْتَ نَفْسي فارْحَمْها، وإنْ أَرْسَلْتَها فاحْفَظْها بما تَحْفَظُ به عِبادَكَ الصَّالِحِينَ.',
    count: 1,
    virtue: 'دعاء النوم العظيم وتفويض الروح لله حال النوم الذي هو الموتة الصغرى.'
  },
  {
    id: 's_5',
    text: 'اللَّهُمَّ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا. اللَّهُمَّ إِنِّي أَسْأَلُكَ العَافِيَةَ.',
    count: 1,
    virtue: 'سؤال الله دوام العافية وحفظ النفس في اليقظة والممات.'
  },
  {
    id: 's_6',
    text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.',
    count: 3,
    virtue: 'كان النبي صلى الله عليه وسلم يقولها إذا وضع يده اليمنى تحت خده عند النوم.'
  },
  {
    id: 's_7',
    text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.',
    count: 1,
    virtue: 'إعلان الاستسلام والتوحيد باسم الله عند النوم والاستيقاظ.'
  },
  {
    id: 's_8',
    text: 'التسبيح والتحميد والتكبير عند النوم: سبحان الله (33 مرة)، الحمد لله (33 مرة)، الله أكبر (34 مرة).',
    count: 1,
    virtue: 'من قالها عند النوم كانت خيراً له من خادم، وتمنحه قوة ونشاطاً في اليوم التالي.'
  },
  {
    id: 's_9',
    text: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إلَيْكَ، وَفَوَّضْتُ أَمْرِي إلَيْكَ، وَوَجَّهْتُ وَجْهِي إلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إلَيْكَ، رَغْبَةً وَرَهْبَةً إلَيْكَ، لا مَلْجَأَ وَلا مَنْجَا مِنْكَ إلَّا إلَيْكَ، آمَنْتُ بِكِتَابِكَ الذي أَنْزَلْتَ، وَبِنَبِيِّكَ الذي أَرْسَلْتَ.',
    count: 1,
    virtue: 'من قالها ومات من ليلته مات على الفطرة، واجعلهن آخر ما تقول.'
  }
];

interface AthkarReadProps {
  log: DailyLog;
  onUpdateLog: (log: DailyLog, activityLabel?: string, activityType?: string) => void;
}

const AthkarRead: React.FC<AthkarReadProps> = ({ log, onUpdateLog }) => {
  const [activeTab, setActiveTab] = useState<'morning' | 'evening' | 'sleep'>('morning');
  const [showVirtues, setShowVirtues] = useState<Record<string, boolean>>({});

  const listToUse = activeTab === 'morning' 
    ? MORNING_ATHKAR 
    : activeTab === 'evening' 
      ? EVENING_ATHKAR 
      : SLEEP_ATHKAR;

  const detailedData = log.athkar.completedDetailedAthkar || {};

  const handleThikrTap = (id: string, maxCount: number) => {
    // اهتزاز خفيف للهواتف
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(15); } catch (e) {}
    }

    const currentCount = detailedData[id] || 0;
    let nextCount = currentCount + 1;
    if (nextCount > maxCount) {
      nextCount = 0; // إعادة التصفير عند تجاوز الحد الأقصى ليسهل تكراره غداً
    }

    const updatedDetailed = {
      ...detailedData,
      [id]: nextCount
    };

    // حساب نسبة الإنجاز والمساندة لتعليم قائمة الأذكار المعنية تلقائياً
    const currentList = listToUse;
    const completedCountInList = currentList.filter(item => {
      // إما مكتمل تماماً في التحديث الجديد
      if (item.id === id) return nextCount >= item.count;
      return (updatedDetailed[item.id] || 0) >= item.count;
    }).length;

    const completionRate = completedCountInList / currentList.length;

    // تحديث قائمة الصح التقليدية checklists لو أكمل أكثر من نصف القائمة تسهيلاً عليه ولربط العداد
    const updatedChecklists = { ...log.athkar.checklists };
    if (completionRate >= 0.7) {
      updatedChecklists[activeTab] = true;
    } else if (completionRate < 0.2) {
      updatedChecklists[activeTab] = false;
    }

    const updatedLog: DailyLog = {
      ...log,
      athkar: {
        ...log.athkar,
        checklists: updatedChecklists,
        completedDetailedAthkar: updatedDetailed
      }
    };

    const currentItem = currentList.find(c => c.id === id);
    const label = nextCount === maxCount 
      ? `أتم ذكر: "${currentItem?.text.slice(0, 30)}..."` 
      : undefined;

    onUpdateLog(updatedLog, label, 'athkar');
  };

  const toggleVirtue = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVirtues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetAllInCurrentTab = () => {
    if (window.confirm('هل أنت متأكد من تصفير عداد أذكار هذه القائمة؟')) {
      const updatedDetailed = { ...detailedData };
      listToUse.forEach(item => {
        updatedDetailed[item.id] = 0;
      });

      const updatedChecklists = { ...log.athkar.checklists };
      updatedChecklists[activeTab] = false;

      const updatedLog: DailyLog = {
        ...log,
        athkar: {
          ...log.athkar,
          checklists: updatedChecklists,
          completedDetailedAthkar: updatedDetailed
        }
      };
      
      const tabName = activeTab === 'morning' ? 'الصباح' : (activeTab === 'evening' ? 'المساء' : 'النوم');
      onUpdateLog(updatedLog, `صَفّر عدادات أذكار ${tabName}`, 'athkar');
    }
  };

  const getCompletedCountFor = (list: AthkarItem[]) => {
    return list.filter(item => (detailedData[item.id] || 0) >= item.count).length;
  };

  const getCompletedCount = () => {
    return getCompletedCountFor(listToUse);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-28 max-w-xl mx-auto text-right" dir="rtl">
      
      {/* رأس الشاشة مع خيارات الانتقال */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${
              activeTab === 'morning' 
                ? 'bg-amber-50 text-amber-600' 
                : activeTab === 'evening' 
                  ? 'bg-slate-900 text-slate-100' 
                  : 'bg-indigo-950 text-indigo-300'
            }`}>
              {activeTab === 'morning' ? (
                <Sun className="w-6 h-6" />
              ) : activeTab === 'evening' ? (
                <Moon className="w-6 h-6" />
              ) : (
                <Bed className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 header-font leading-tight">الأذكار والتحصين اليومي</h2>
              <p className="text-[10px] text-slate-400 font-bold header-font">تلاوتك الفردية للأذكار تمنحك درجات وتأثيراً فورياً لعلامة قلبك</p>
            </div>
          </div>
          <button 
            onClick={resetAllInCurrentTab}
            className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl transition-all active:scale-95"
            title="تصفير عدادات القائمة بالكامل"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* أزرار التبديل الفخمة */}
        <div className="grid grid-cols-3 gap-1.5 mt-6 p-1 bg-slate-50 rounded-2xl">
          <button
            onClick={() => setActiveTab('morning')}
            className={`py-4.5 rounded-xl font-bold header-font text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'morning'
                ? 'bg-white text-amber-600 shadow-md transform scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sun className={`w-4 h-4 ${activeTab === 'morning' ? 'text-amber-500 animate-spin-slow' : ''}`} />
            <span>الصباح</span>
            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-full font-mono text-slate-500">
              {`${getCompletedCountFor(MORNING_ATHKAR)}/${MORNING_ATHKAR.length}`}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('evening')}
            className={`py-4.5 rounded-xl font-bold header-font text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'evening'
                ? 'bg-slate-900 text-slate-100 shadow-lg transform scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Moon className={`w-4 h-4 ${activeTab === 'evening' ? 'text-blue-300' : ''}`} />
            <span>المساء</span>
            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
              {`${getCompletedCountFor(EVENING_ATHKAR)}/${EVENING_ATHKAR.length}`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sleep')}
            className={`py-4.5 rounded-xl font-bold header-font text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'sleep'
                ? 'bg-indigo-950 text-indigo-300 shadow-lg transform scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Bed className={`w-4 h-4 ${activeTab === 'sleep' ? 'text-indigo-400' : ''}`} />
            <span>النوم</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${activeTab === 'sleep' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-200 text-slate-500'}`}>
              {`${getCompletedCountFor(SLEEP_ATHKAR)}/${SLEEP_ATHKAR.length}`}
            </span>
          </button>
        </div>
      </div>

      {/* المؤشر العام للتقدم في هذه القائمة */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2rem] p-6 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-300 animate-bounce" />
            <span className="text-xs font-black header-font">بركة وريادة الأذكار</span>
          </div>
          <span className="text-xs font-black font-mono">
            {Math.round((getCompletedCount() / listToUse.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-yellow-300 h-full rounded-full transition-all duration-500"
            style={{ width: `${(getCompletedCount() / listToUse.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-[10px] opacity-90 leading-relaxed font-bold">
          💡 <span className="underline">المعادلة الإيمانية الذكية:</span> نسبة إنجاز هذه القائمة تمنحك درجات بحد أقصى <span className="text-yellow-200 font-black">100 درجة كاملة</span> لأذكار {activeTab === 'morning' ? 'الصباح 🌅' : (activeTab === 'evening' ? 'المساء 🌃' : 'النوم 🛌')} بالتناسب مع ما قرأته، وبمجرد إنهائك لـ 70% من القائمة يُفعّل لك تلقائياً العداد الإيماني العام.
        </p>
      </div>

      {/* بطاقات قراءة الأذكار فرداً فرداً */}
      <div className="space-y-4">
        {listToUse.map((item, index) => {
          const countDone = detailedData[item.id] || 0;
          const isDone = countDone >= item.count;
          const virtueOpen = !!showVirtues[item.id];

          return (
            <div 
              key={item.id}
              onClick={() => handleThikrTap(item.id, item.count)}
              className={`bg-white rounded-3xl p-5 border transition-all duration-300 cursor-pointer hover:border-slate-300 active:scale-[0.98] relative overflow-hidden select-none tap-highlight-transparent ${
                isDone 
                  ? 'border-emerald-100 bg-emerald-50/20 shadow-sm' 
                  : 'border-slate-100 shadow-sm'
              }`}
            >
              {/* ترقيم وقفل الذكر عند الإتمام */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                  isDone ? 'bg-emerald-150 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  ذكر {index + 1}
                </span>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={(e) => toggleVirtue(item.id, e)}
                    className="p-1 px-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[10px] font-bold"
                  >
                    {virtueOpen ? 'إخفاء الفضل' : 'فضل الذكر'}
                    <ChevronDown className={`w-3 h-3 transition-transform ${virtueOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* نص الذكر الكريم */}
              <p className="text-sm font-bold text-slate-800 leading-loose text-justify font-sans px-1 pb-4">
                {item.text}
              </p>

              {/* الفضل لو مفتوح */}
              {virtueOpen && (
                <div className="mt-2 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100/50 text-[11px] text-slate-500 leading-normal font-bold flex gap-2 items-start animate-in fade-in slide-in-from-top-2 duration-200">
                  <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p>{item.virtue}</p>
                </div>
              )}

              {/* خط التقدم الحركي والعداد */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">التكرارات المطلوبة: {item.count}</span>
                </div>
                
                {/* زر العداد التفاعلي المستدير الرائع */}
                <div className={`relative flex items-center justify-center p-1 rounded-full px-4 py-1.5 font-bold transition-all ${
                  isDone 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : countDone > 0 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-500'
                }`}>
                  {isDone ? (
                    <div className="flex items-center gap-1 text-xs">
                      <Check className="w-4 h-4" />
                      <span>تمَّ الورد</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-black font-mono">
                      <span>{countDone} من {item.count}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* تأثير خلفية خافتة عند الإنجاز */}
              {isDone && (
                <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.03] -translate-x-2 translate-y-4">
                  <CheckCircle2 className="w-36 h-36 text-emerald-800" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AthkarRead;
