export interface SurahMeta {
  id: number;
  name: string;
  arabicName: string;
  totalAyahs: number;
  type: 'مكية' | 'مدنية';
  page: number;
}

export const QURAN_114_SURAHS: SurahMeta[] = [
  { id: 1, name: "الفاتحة", arabicName: "سُورَةُ الفَاتِحَةِ", totalAyahs: 7, type: "مكية", page: 1 },
  { id: 2, name: "البقرة", arabicName: "سُورَةُ البَقَرَةِ", totalAyahs: 286, type: "مدنية", page: 2 },
  { id: 3, name: "آل عمران", arabicName: "سُورَةُ آلِ عِمْرَانَ", totalAyahs: 200, type: "مدنية", page: 50 },
  { id: 4, name: "النساء", arabicName: "سُورَةُ النِّسَاءِ", totalAyahs: 176, type: "مدنية", page: 77 },
  { id: 5, name: "المائدة", arabicName: "سُورَةُ المَائِدَةِ", totalAyahs: 120, type: "مدنية", page: 106 },
  { id: 6, name: "الأنعام", arabicName: "سُورَةُ الأَنْعَامِ", totalAyahs: 165, type: "مكية", page: 128 },
  { id: 7, name: "الأعراف", arabicName: "سُورَةُ الأَعْرَافِ", totalAyahs: 206, type: "مكية", page: 151 },
  { id: 8, name: "الأنفال", arabicName: "سُورَةُ الأَنْفَالِ", totalAyahs: 75, type: "مدنية", page: 177 },
  { id: 9, name: "التوبة", arabicName: "سُورَةُ التَّوْبَةِ", totalAyahs: 129, type: "مدنية", page: 187 },
  { id: 10, name: "يونس", arabicName: "سُورَةُ يُونُسَ", totalAyahs: 109, type: "مكية", page: 208 },
  { id: 11, name: "هود", arabicName: "سُورَةُ هُودٍ", totalAyahs: 123, type: "مكية", page: 221 },
  { id: 12, name: "يوسف", arabicName: "سُورَةُ يُوسُفَ", totalAyahs: 111, type: "مكية", page: 235 },
  { id: 13, name: "الرعد", arabicName: "سُورَةُ الرَّعْدِ", totalAyahs: 43, type: "مدنية", page: 249 },
  { id: 14, name: "إبراهيم", arabicName: "سُورَةُ إِبْرَاهِيمَ", totalAyahs: 52, type: "مكية", page: 255 },
  { id: 15, name: "الحجر", arabicName: "سُورَةُ الحِجْرِ", totalAyahs: 99, type: "مكية", page: 262 },
  { id: 16, name: "النحل", arabicName: "سُورَةُ النَّحْلِ", totalAyahs: 128, type: "مكية", page: 267 },
  { id: 17, name: "الإسراء", arabicName: "سُورَةُ الإِسْرَاءِ", totalAyahs: 111, type: "مكية", page: 282 },
  { id: 18, name: "الكهف", arabicName: "سُورَةُ الكَهْفِ", totalAyahs: 110, type: "مكية", page: 293 },
  { id: 19, name: "مريم", arabicName: "سُورَةُ مَرْيَمَ", totalAyahs: 98, type: "مكية", page: 305 },
  { id: 20, name: "طه", arabicName: "سُورَةُ طه", totalAyahs: 135, type: "مكية", page: 312 },
  { id: 21, name: "الأنبياء", arabicName: "سُورَةُ الأَنْبِيَاءِ", totalAyahs: 112, type: "مكية", page: 322 },
  { id: 22, name: "الحج", arabicName: "سُورَةُ الحَجِّ", totalAyahs: 78, type: "مدنية", page: 332 },
  { id: 23, name: "المؤمنون", arabicName: "سُورَةُ المُؤْمِنُونَ", totalAyahs: 118, type: "مكية", page: 342 },
  { id: 24, name: "النور", arabicName: "سُورَةُ النُّورِ", totalAyahs: 64, type: "مدنية", page: 350 },
  { id: 25, name: "الفرقان", arabicName: "سُورَةُ الفُرْقَانِ", totalAyahs: 77, type: "مكية", page: 359 },
  { id: 26, name: "الشعراء", arabicName: "سُورَةُ الشُّعَرَاءِ", totalAyahs: 227, type: "مكية", page: 367 },
  { id: 27, name: "النمل", arabicName: "سُورَةُ النَّمْلِ", totalAyahs: 93, type: "مكية", page: 377 },
  { id: 28, name: "القصص", arabicName: "سُورَةُ القَصَصِ", totalAyahs: 88, type: "مكية", page: 385 },
  { id: 29, name: "العنكبوت", arabicName: "سُورَةُ العَنْكَبُوتِ", totalAyahs: 69, type: "مكية", page: 396 },
  { id: 30, name: "الروم", arabicName: "سُورَةُ الرُّومِ", totalAyahs: 60, type: "مكية", page: 404 },
  { id: 31, name: "لقمان", arabicName: "سُورَةُ لُقْمَانَ", totalAyahs: 34, type: "مكية", page: 411 },
  { id: 32, name: "السجدة", arabicName: "سُورَةُ السَّجْدَةِ", totalAyahs: 30, type: "مكية", page: 415 },
  { id: 33, name: "الأحزاب", arabicName: "سُورَةُ الأَحْزَابِ", totalAyahs: 73, type: "مدنية", page: 418 },
  { id: 34, name: "سبأ", arabicName: "سُورَةُ سَبَإٍ", totalAyahs: 54, type: "مكية", page: 428 },
  { id: 35, name: "فاطر", arabicName: "سُورَةُ فَاطِرٍ", totalAyahs: 45, type: "مكية", page: 434 },
  { id: 36, name: "يس", arabicName: "سُورَةُ يس", totalAyahs: 83, type: "مكية", page: 440 },
  { id: 37, name: "الصافات", arabicName: "سُورَةُ الصَّافَّاتِ", totalAyahs: 182, type: "مكية", page: 446 },
  { id: 38, name: "ص", arabicName: "سُورَةُ ص", totalAyahs: 88, type: "مكية", page: 453 },
  { id: 39, name: "الزمر", arabicName: "سُورَةُ الزُّمَرِ", totalAyahs: 75, type: "مكية", page: 458 },
  { id: 40, name: "غافر", arabicName: "سُورَةُ غَافِرٍ", totalAyahs: 85, type: "مكية", page: 467 },
  { id: 41, name: "فصلت", arabicName: "سُورَةُ فُصِّلَتْ", totalAyahs: 54, type: "مكية", page: 477 },
  { id: 42, name: "الشورى", arabicName: "سُورَةُ الشُّورَى", totalAyahs: 53, type: "مكية", page: 483 },
  { id: 43, name: "الزخرف", arabicName: "سُورَةُ الزُّخْرُفِ", totalAyahs: 89, type: "مكية", page: 489 },
  { id: 44, name: "الدخان", arabicName: "سُورَةُ الدُّخَانِ", totalAyahs: 59, type: "مكية", page: 496 },
  { id: 45, name: "الجاثية", arabicName: "سُورَةُ الجَاثِيَةِ", totalAyahs: 37, type: "مكية", page: 499 },
  { id: 46, name: "الأحقاف", arabicName: "سُورَةُ الأَحْقَافِ", totalAyahs: 35, type: "مكية", page: 502 },
  { id: 47, name: "محمد", arabicName: "سُورَةُ مُحَمَّدٍ", totalAyahs: 38, type: "مدنية", page: 507 },
  { id: 48, name: "الفتح", arabicName: "سُورَةُ الفَتْحِ", totalAyahs: 29, type: "مدنية", page: 511 },
  { id: 49, name: "الحجرات", arabicName: "سُورَةُ الحُجُرَاتِ", totalAyahs: 18, type: "مدنية", page: 515 },
  { id: 50, name: "ق", arabicName: "سُورَةُ ق", totalAyahs: 45, type: "مكية", page: 518 },
  { id: 51, name: "الذاريات", arabicName: "سُورَةُ الذَّارِيَاتِ", totalAyahs: 60, type: "مكية", page: 520 },
  { id: 52, name: "الطور", arabicName: "سُورَةُ الطُّورِ", totalAyahs: 49, type: "مكية", page: 523 },
  { id: 53, name: "النجم", arabicName: "سُورَةُ النَّجْمِ", totalAyahs: 62, type: "مكية", page: 526 },
  { id: 54, name: "القمر", arabicName: "سُورَةُ القَمَرِ", totalAyahs: 55, type: "مكية", page: 528 },
  { id: 55, name: "الرحمن", arabicName: "سُورَةُ الرَّحْمَنِ", totalAyahs: 78, type: "مدنية", page: 531 },
  { id: 56, name: "الواقعة", arabicName: "سُورَةُ الوَاقِعَةِ", totalAyahs: 96, type: "مكية", page: 534 },
  { id: 57, name: "الحديد", arabicName: "سُورَةُ الحَدِيدِ", totalAyahs: 29, type: "مدنية", page: 537 },
  { id: 58, name: "المجادلة", arabicName: "سُورَةُ المُجَادَلَةِ", totalAyahs: 22, type: "مدنية", page: 542 },
  { id: 59, name: "الحشر", arabicName: "سُورَةُ الحَشْرِ", totalAyahs: 24, type: "مدنية", page: 545 },
  { id: 60, name: "الممتحنة", arabicName: "سُورَةُ المُمْتَحَنَةِ", totalAyahs: 13, type: "مدنية", page: 549 },
  { id: 61, name: "الصف", arabicName: "سُورَةُ الصَّفِّ", totalAyahs: 14, type: "مدنية", page: 551 },
  { id: 62, name: "الجمعة", arabicName: "سُورَةُ الجُمُعَةِ", totalAyahs: 11, type: "مدنية", page: 553 },
  { id: 63, name: "المنافقون", arabicName: "سُورَةُ المُنَافِقُونَ", totalAyahs: 11, type: "مدنية", page: 554 },
  { id: 64, name: "التغابن", arabicName: "سُورَةُ التَّغَابُنِ", totalAyahs: 18, type: "مدنية", page: 556 },
  { id: 65, name: "الطلاق", arabicName: "سُورَةُ الطَّلَاقِ", totalAyahs: 12, type: "مدنية", page: 558 },
  { id: 66, name: "التحريم", arabicName: "سُورَةُ التَّحْرِيمِ", totalAyahs: 12, type: "مدنية", page: 560 },
  { id: 67, name: "الملك", arabicName: "سُورَةُ المُلْكِ", totalAyahs: 30, type: "مكية", page: 562 },
  { id: 68, name: "القلم", arabicName: "سُورَةُ القَلَمِ", totalAyahs: 52, type: "مكية", page: 564 },
  { id: 69, name: "الحاقة", arabicName: "سُورَةُ الحَاقَّةِ", totalAyahs: 52, type: "مكية", page: 566 },
  { id: 70, name: "المعارج", arabicName: "سُورَةُ المَعَارِجِ", totalAyahs: 44, type: "مكية", page: 568 },
  { id: 71, name: "نوح", arabicName: "سُورَةُ نُوحٍ", totalAyahs: 28, type: "مكية", page: 570 },
  { id: 72, name: "الجن", arabicName: "سُورَةُ الجِنِّ", totalAyahs: 28, type: "مكية", page: 572 },
  { id: 73, name: "المزمل", arabicName: "سُورَةُ المُزَّمِّلِ", totalAyahs: 20, type: "مكية", page: 574 },
  { id: 74, name: "المدثر", arabicName: "سُورَةُ المُدَّثِّرِ", totalAyahs: 56, type: "مكية", page: 575 },
  { id: 75, name: "القيامة", arabicName: "سُورَةُ القِيَامَةِ", totalAyahs: 40, type: "مكية", page: 577 },
  { id: 76, name: "الإنسان", arabicName: "سُورَةُ الإِنْسَانِ", totalAyahs: 31, type: "مدنية", page: 578 },
  { id: 77, name: "المرسلات", arabicName: "سُورَةُ المُرْسَلَاتِ", totalAyahs: 50, type: "مكية", page: 580 },
  { id: 78, name: "النبأ", arabicName: "سُورَةُ النَّبَإِ", totalAyahs: 40, type: "مكية", page: 582 },
  { id: 79, name: "النازعات", arabicName: "سُورَةُ النَّازِعَاتِ", totalAyahs: 46, type: "مكية", page: 583 },
  { id: 80, name: "عبس", arabicName: "سُورَةُ عَبَسَ", totalAyahs: 42, type: "مكية", page: 585 },
  { id: 81, name: "التكوير", arabicName: "سُورَةُ التَّكْوِيرِ", totalAyahs: 29, type: "مكية", page: 586 },
  { id: 82, name: "الانفطار", arabicName: "سُورَةُ الانْفِطَارِ", totalAyahs: 19, type: "مكية", page: 587 },
  { id: 83, name: "المطففين", arabicName: "سُورَةُ المُطَفِّفِينَ", totalAyahs: 36, type: "مكية", page: 587 },
  { id: 84, name: "الانشقاق", arabicName: "سُورَةُ الانْشِقَاقِ", totalAyahs: 25, type: "مكية", page: 589 },
  { id: 85, name: "البروج", arabicName: "سُورَةُ البُرُوجِ", totalAyahs: 22, type: "مكية", page: 590 },
  { id: 86, name: "الطارق", arabicName: "سُورَةُ الطَّارِقِ", totalAyahs: 17, type: "مكية", page: 591 },
  { id: 87, name: "الأعلى", arabicName: "سُورَةُ الأَعْلَى", totalAyahs: 19, type: "مكية", page: 591 },
  { id: 88, name: "الغاشية", arabicName: "سُورَةُ الغَاشِيَةِ", totalAyahs: 26, type: "مكية", page: 592 },
  { id: 89, name: "الفجر", arabicName: "سُورَةُ الفَجْرِ", totalAyahs: 30, type: "مكية", page: 593 },
  { id: 90, name: "البلد", arabicName: "سُورَةُ البَلَدِ", totalAyahs: 20, type: "مكية", page: 594 },
  { id: 91, name: "الشمس", arabicName: "سُورَةُ الشَّمْسِ", totalAyahs: 15, type: "مكية", page: 595 },
  { id: 92, name: "الليل", arabicName: "سُورَةُ اللَّيْلِ", totalAyahs: 21, type: "مكية", page: 595 },
  { id: 93, name: "الضحى", arabicName: "سُورَةُ الضُّحَى", totalAyahs: 11, type: "مكية", page: 596 },
  { id: 94, name: "الشرح", arabicName: "سُورَةُ الشَّرْحِ", totalAyahs: 8, type: "مكية", page: 596 },
  { id: 95, name: "التين", arabicName: "سُورَةُ التِّينِ", totalAyahs: 8, type: "مكية", page: 597 },
  { id: 96, name: "العلق", arabicName: "سُورَةُ العَلَقِ", totalAyahs: 19, type: "مكية", page: 597 },
  { id: 97, name: "القدر", arabicName: "سُورَةُ القَدْرِ", totalAyahs: 5, type: "مكية", page: 598 },
  { id: 98, name: "البينة", arabicName: "سُورَةُ البَيِّنَةِ", totalAyahs: 8, type: "مدنية", page: 598 },
  { id: 99, name: "الزلزلة", arabicName: "سُورَةُ الزَّلْزَلَةِ", totalAyahs: 8, type: "مدنية", page: 599 },
  { id: 100, name: "العاديات", arabicName: "سُورَةُ العَادِيَاتِ", totalAyahs: 11, type: "مكية", page: 599 },
  { id: 101, name: "القارعة", arabicName: "سُورَةُ القَارِعَةِ", totalAyahs: 11, type: "مكية", page: 600 },
  { id: 102, name: "التكاثر", arabicName: "سُورَةُ التَّكَاثُرِ", totalAyahs: 8, type: "مكية", page: 600 },
  { id: 103, name: "العصر", arabicName: "سُورَةُ العَصْرِ", totalAyahs: 3, type: "مكية", page: 601 },
  { id: 104, name: "الهمزة", arabicName: "سُورَةُ الهُمَزَةِ", totalAyahs: 9, type: "مكية", page: 601 },
  { id: 105, name: "الفيل", arabicName: "سُورَةُ الفِيلِ", totalAyahs: 5, type: "مكية", page: 601 },
  { id: 106, name: "قريش", arabicName: "سُورَةُ قُرَيْشٍ", totalAyahs: 4, type: "مكية", page: 602 },
  { id: 107, name: "الماعون", arabicName: "سُورَةُ المَاعُونِ", totalAyahs: 7, type: "مكية", page: 602 },
  { id: 108, name: "الكوثر", arabicName: "سُورَةُ الكَوْثَرِ", totalAyahs: 3, type: "مكية", page: 602 },
  { id: 109, name: "الكافرون", arabicName: "سُورَةُ الكَافِرُونَ", totalAyahs: 6, type: "مكية", page: 603 },
  { id: 110, name: "النصر", arabicName: "سُورَةُ النَّصْرِ", totalAyahs: 3, type: "مدنية", page: 603 },
  { id: 111, name: "المسد", arabicName: "سُورَةُ المَسَدِ", totalAyahs: 5, type: "مكية", page: 603 },
  { id: 112, name: "الإخلاص", arabicName: "سُورَةُ الإِخْلَاصِ", totalAyahs: 4, type: "مكية", page: 604 },
  { id: 113, name: "الفلق", arabicName: "سُورَةُ الفَلَقِ", totalAyahs: 5, type: "مكية", page: 604 },
  { id: 114, name: "الناس", arabicName: "سُورَةُ النَّاسِ", totalAyahs: 6, type: "مكية", page: 604 }
];

export interface TadabburCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  desc: string;
}

export const TADABBUR_CATEGORIES: TadabburCategory[] = [
  {
    id: "aqidah",
    label: "عقيدة وتوحيد",
    icon: "💎",
    color: "from-amber-500 to-amber-600",
    badgeBg: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-800",
    desc: "معرفة الله بأسمائه وصفاته وتجريد التوحيد له وحده"
  },
  {
    id: "mercy",
    label: "رجاء ومغفرة",
    icon: "🕊️",
    color: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-800",
    desc: "سعة رحمة الله وبشارات التائبين والمحسنين وإحسان الظن"
  },
  {
    id: "tazkiya",
    label: "تزكية وسلوك",
    icon: "🌿",
    color: "from-teal-500 to-emerald-700",
    badgeBg: "bg-teal-50 border-teal-200",
    badgeText: "text-teal-800",
    desc: "طهارة القلب، تزكية النفس، وحسن التعامل مع الخلق"
  },
  {
    id: "patience",
    label: "صبر ويقين",
    icon: "⚡",
    color: "from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-800",
    desc: "الرضا بالقضاء، الثبات عند الشدائد، واليقين بالفرج"
  },
  {
    id: "dua",
    label: "دعاء ومناجاة",
    icon: "🤲",
    color: "from-rose-500 to-pink-600",
    badgeBg: "bg-rose-50 border-rose-200",
    badgeText: "text-rose-800",
    desc: "التضرع، والافتقار إلى الله، وسؤال خيري الدنيا والآخرة"
  },
  {
    id: "tafakkur",
    label: "تفكر وآيات",
    icon: "🌌",
    color: "from-purple-500 to-violet-600",
    badgeBg: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-800",
    desc: "التفكر في عجائب خلق الله والآفاق ونعم الله الباطنة والظاهرة"
  },
  {
    id: "stories",
    label: "قصص وعبر",
    icon: "📜",
    color: "from-amber-600 to-orange-600",
    badgeBg: "bg-orange-50 border-orange-200",
    badgeText: "text-orange-800",
    desc: "سير الأنبياء والمصلحين وسنن الله في الكون وتاريخ الأمم"
  },
  {
    id: "action",
    label: "أحكام ومسؤولية",
    icon: "⚖️",
    color: "from-cyan-600 to-blue-700",
    badgeBg: "bg-cyan-50 border-cyan-200",
    badgeText: "text-cyan-800",
    desc: "الامتثال للأوامر واجتناب النواهي وأداء الأمانات وحفظ العهود"
  }
];

export interface DailyTadabburSeed {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: string;
  ayahText: string;
  theme: string;
  inspiration: string;
  scholarQuote: string;
  suggestedAction: string;
}

export const DAILY_TADABBUR_SEEDS: DailyTadabburSeed[] = [
  {
    id: "seed_1",
    surahNumber: 2,
    surahName: "البقرة",
    ayahNumber: "152",
    ayahText: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    theme: "aqidah",
    inspiration: "لو لم يكن في الذكر إلا أن الله يذكرك في الملأ الأعلى لكفى به شرفاً لا يدانيه شرف!",
    scholarQuote: "قال ابن القيم: 'لو علم الذاكر من يُجالسه في ذكره، لتفتت كبده حباً وشوقاً وخجلاً'.",
    suggestedAction: "أعقد العزم على تخصيص عشر دقائق في السحر أو بعد الصلاة لا أبتغي فيها إلا ذكر الله بقلب حاضر."
  },
  {
    id: "seed_2",
    surahNumber: 39,
    surahName: "الزمر",
    ayahNumber: "53",
    ayahText: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
    theme: "mercy",
    inspiration: "أضافهم إلى نفسه تشريفاً وتطميناً (يا عبادي)، فلا تيأس مهما ثقلت ذنوبك فبابه مشرع ورحمته سبقت غضبه.",
    scholarQuote: "قال ابن عباس: 'هذه أرجى آية في كتاب الله عز وجل للمذنبين والتائبين'.",
    suggestedAction: "أستحضر ذنباً يثقل صدري وأجدد له توبة نصوحاً واستغفاراً صادقاً في سجودي الليلة."
  },
  {
    id: "seed_3",
    surahNumber: 13,
    surahName: "الرعد",
    ayahNumber: "28",
    ayahText: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    theme: "patience",
    inspiration: "في القلب شعثٌ لا يلمه إلا الإقبال على الله، وقلقٌ لا يسكنه إلا الأنس بكلامه ومناجاته.",
    scholarQuote: "قال السعدي: 'أي يزول قلقها واضطرابها، وتحضرها أفراحها ولذاتها عند ذكر الله ومحبته'.",
    suggestedAction: "كلما شعرت بضيق أو قلق اليوم، أتوقف عن كل شيء وأستغفر مائة مرة بتؤدة وسكينة."
  },
  {
    id: "seed_4",
    surahNumber: 25,
    surahName: "الفرقان",
    ayahNumber: "63",
    ayahText: "وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا وَإِذَا خَاطَبَهُمُ الْجَاهِلُونَ قَالُوا سَلَامًا",
    theme: "tazkiya",
    inspiration: "سكينة في المشي، وقار في السمت، وحلمٌ رفيع عند مقابلة جهل السفهاء دون خصومة.",
    scholarQuote: "قال الحسن البصري: 'حلماء إذا جُهل عليهم لم يجهلوا، هذا نهارهم فكيف ليلهم؟ ليلهم خير ليل!'.",
    suggestedAction: "أتدرب اليوم على ضبط الغضب والإعراض عن أي جدال فارغ أو إساءة بكلمة طيبة وابتسامة."
  },
  {
    id: "seed_5",
    surahNumber: 2,
    surahName: "البقرة",
    ayahNumber: "186",
    ayahText: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    theme: "dua",
    inspiration: "لم يقل (فقل لهم قريب) بل تولى الجواب بنفسه سبحانه مباشرة بلا واسطة (فإني قريب) إشعاراً بعظيم قربه ولطفه.",
    scholarQuote: "قال ابن رجب: 'المؤمن يدعو ربه بيقين الإجابة، فإن الله أكرم من أن يرد كفاً رفعت إليه خائبة'.",
    suggestedAction: "أكتب ثلاث حاجات ملحة في خاطري، وأتضرع بها في آخر ساعة قبل المغرب أو بين الأذان والإقامة."
  },
  {
    id: "seed_6",
    surahNumber: 65,
    surahName: "الطلاق",
    ayahNumber: "2-3",
    ayahText: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا * وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    theme: "patience",
    inspiration: "مهما اشتدت الأبواب إغلاقاً، فإن تقوى الله تفتح المضائق من جهات لم تكن تخطر على بال أحد.",
    scholarQuote: "قال شيخ الإسلام ابن تيمية: 'توكل على الله وحده، فإن الكفاية معلقة بالتوكل'.",
    suggestedAction: "أراجع أمراً أخشى تعسره في رزقي أو دراستي، وأوكله لرب السماء بيقين تام بأن العاقبة خير."
  },
  {
    id: "seed_7",
    surahNumber: 18,
    surahName: "الكهف",
    ayahNumber: "46",
    ayahText: "الْمَالُ وَالْبَنُونَ زِينَةُ الْحَيَاةِ الدُّنْيَا ۖ وَالْبَاقِيَاتُ الصَّالِحَاتُ خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا",
    theme: "aqidah",
    inspiration: "كل ما في الدنيا يزول ويبقى أثر التسبيح والتحميد والتكبير والعمل الصالح ذخراً عند رب العزة.",
    scholarQuote: "قال السعدي: 'كل عمل يقرب إلى الله من صلاة وصيام وذكر وصدقة هو من الباقيات الصالحات'.",
    suggestedAction: "أُكثر اليوم من: 'سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر' مع استشعار بقائها في ميزاني."
  },
  {
    id: "seed_8",
    surahNumber: 3,
    surahName: "آل عمران",
    ayahNumber: "133",
    ayahText: "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ",
    theme: "action",
    inspiration: "الآخرة لا تحتمل التثاقل والتسويف، والميدان يتطلب المسارعة والمبادرة قبل فوات الأوان.",
    scholarQuote: "قال عمر بن الخطاب رضي الله عنه: 'حاسبوا أنفسكم قبل أن تحاسبوا، وزنوا أعمالكم قبل أن توزن عليكم'.",
    suggestedAction: "أبدأ فوراً في عمل صالح كنت أؤجله منذ فترة (بر والدين، صلة رحم، صدقة، أو ختمة ورد)."
  }
];
