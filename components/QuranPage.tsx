
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Book, 
  CheckCircle2, 
  Circle, 
  Repeat, 
  History, 
  ArrowLeftRight,
  Sparkles,
  ChevronDown,
  Clock,
  Mic,
  ListChecks,
  Plus,
  Minus,
  LayoutGrid,
  FileText,
  Settings,
  MessageSquareText,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Trash2,
  Bookmark
} from 'lucide-react';
import { DailyLog, ReflectionNote } from '../types';
import { QuranTadabbur } from './QuranTadabbur';

const QURAN_PORTIONS_NAMES = [
  "1- الفاتحة: (الحمد لله رب العالمين)",
  "2- البقرة: (إن الله لا يستحيي أن يضرب مثلاً)",
  "3- البقرة: (أتأمرون الناس بالبر)",
  "4- البقرة: (وإذ استسقى موسى لقومه)",
  "5- البقرة: (أفتطمعون أن يؤمنوا لكم)",
  "6- البقرة: (ولقد جاءكم موسى بالبينات)",
  "7- البقرة: (ما ننسخ من آية)",
  "8- البقرة: (وإذ ابتلى إبراهيم ربه)",
  "9- البقرة: (سيقول السفهاء من الناس)",
  "10- البقرة: (إن الصفا والمروة من شعائر الله)",
  "11- البقرة: (ليس البر أن تولوا وجوهكم)",
  "12- البقرة: (يسألونك عن الأهلة)",
  "13- البقرة: (واذكروا الله في أيام معدودات)",
  "14- البقرة: (يسألونك عن الخمر والميسر)",
  "15- البقرة: (والوالدات يرضعن أولادهن)",
  "16- البقرة: (ألم تر إلى الذين خرجوا من ديارهم)",
  "17- البقرة: (تلك الرسل فضلنا بعضهم على بعض)",
  "18- البقرة: (قول معروف ومغفرة خير من صدقة)",
  "19- البقرة: (ليس عليك هداهم ولكن الله يهدي)",
  "20- البقرة: (وإن كنتم على سفر)",
  "21- آل عمران: (قل أؤنبئكم بخير من ذلكم)",
  "22- آل عمران: (إن الله اصطفى آدم ونوحاً)",
  "23- آل عمران: (فلما أحس عيسى منهم الكفر)",
  "24- آل عمران: (ومن أهل الكتاب من إن تأمنه)",
  "25- آل عمران: (كل الطعام كان حلاً لبني إسرائيل)",
  "26- آل عمران: (ليسوا سواء من أهل الكتاب)",
  "27- آل عمران: (وسارعوا إلى مغفرة من ربكم)",
  "28- آل عمران: (إذ تصعدون ولا تلوون على أحد)",
  "29- آل عمران: (يستبشرون بنعمة من الله وفضل)",
  "30- آل عمران: (لتبلون في أموالكم وأنفسكم)",
  "31- النساء: (يا أيها الناس اتقوا ربكم)",
  "32- النساء: (ولكم نصف ما ترك أزواجكم)",
  "33- النساء: (والمحصنات من النساء إلا ما ملكت)",
  "34- النساء: (واعبدوا الله ولا تشركوا به شيئاً)",
  "35- النساء: (إن الله يأمركم أن تؤدوا الأمانات)",
  "36- النساء: (فليقاتل في سبيل الله الذين يشرون)",
  "37- النساء: (فما لكم في المنافقين فئتين)",
  "38- النساء: (ومن يهاجر في سبيل الله)",
  "39- النساء: (لا خير في كثير من نجواهم)",
  "40- النساء: (يا أيها الذين آمنوا كونوا قوامين)",
  "41- النساء: (لا يحب الله الجهر بالسوء)",
  "42- النساء: (إنا أوحينا إليك كما أوحينا إلى نوح)",
  "43- المائدة: (يا أيها الذين آمنوا أوفوا بالعقود)",
  "44- المائدة: (ولقد أخذ الله ميثاق بني إسرائيل)",
  "45- المائدة: (واتل عليهم نبأ ابني آدم بالحق)",
  "46- المائدة: (يا أيها الرسول لا يحزنك الذين يسارعون)",
  "47- المائدة: (يا أيها الذين آمنة لا تتخذوا اليهود والنصارى)",
  "48- المائدة: (يا أيها الرسول بلغ ما أنزل إليك)",
  "49- المائدة: (لتجدن أشد الناس عداوة للذين آمنوا)",
  "50- المائدة: (جعل الله الكعبة البيت الحرام قياماً)",
  "51- المائدة: (يوم يجمع الله الرسل فيقول ماذا أجبتم)",
  "52- الأنعام: (وله ما سكن في الليل والنهار)",
  "53- الأنعام: (إنما يستجيب الذين يسمعون)",
  "54- الأنعام: (وعنده مفاتح الغيب لا يعلمها إلا هو)",
  "55- الأنعام: (وإذ قال إبراهيم لأبيه آزر أتتخذ)",
  "56- الأنعام: (إن الله فالق الحب والنوى)",
  "57- الأنعام: (ولو أننا نزلنا إليهم الملائكة)",
  "58- الأنعام: (لهم دار السلام عند ربهم)",
  "59- الأنعام: (وهو الذي أنشأ جنات معروشات)",
  "60- الأنعام: (قل تعالوا أتل ما حرم ربكم عليكم)",
  "61- الأعراف: (المص * كتاب أنزل إليك)",
  "62- الأعراف: (يا بني آدم خذوا زينتكم عند كل مسجد)",
  "63- الأعراف: (وإذا صرفت أبصارهم)",
  "64- الأعراف: (وإلى عاد أخاهم هودا)",
  "65- الأعراف: (قال الملأ الذين استكبروا من قومه)",
  "66- الأعراف: (وأوحينا إلى موسى أن ألق عصاك)",
  "67- الأعراف: (وواعدنا موسى ثلاثين ليلة)",
  "68- الأعراف: (واكتب لنا في هذه الدنيا حسنة)",
  "69- الأعراف: (وإذ نتقنا الجبل فوقهم كأنه ظلة)",
  "70- الأعراف: (هو الذي خلقكم من نفس واحدة)",
  "71- الأنفال: (يسألونك عن الأنفال قل الأنفال لله والرسول)",
  "72- الأنفال: (إن شر الدواب عند الله الصم البكم )",
  "73- الأنفال: (واعلموا أنما غنمتم من شيء)",
  "74- الأنفال: (وإن جنحوا للسلم)",
  "75- التوبة: (براءة من الله ورسوله إلى الذين عاهدتم)",
  "76- التوبة: (أجعلتم سقاية الحاج وعمارة المسجد)",
  "77- التوبة: (يا أيها الذين آمنوا إن كثيراً من الأحبار)",
  "78- التوبة: (ولو أرادوا الخروج لأعدوا له عدة)",
  "79- التوبة: (إنما الصدقات للفقراء والمساكين)",
  "80- التوبة: (ومنهم من عاهد الله لئن آتانا)",
  "81- التوبة: (إنما السبيل على الذين يستئذنونك)",
  "82- التوبة: (إن الله اشترى من المؤمنين أنفسهم)",
  "83- التوبة: (وما كان المؤمنون لينفروا كافة)",
  "84- يونس: (ولو يعجل الله للناس الشر)",
  "85- يونس: (للذين أحسنوا الحسنى وزيادة)",
  "86- يونس: (ويستنبئونك أحق هو قل إي وربي)",
  "87- يونس: (واتل عليهم نبأ نوح)",
  "88- يونس: (وجاوزنا ببنى اسرائيل)",
  "89- هود: (وما من دابة في الأرض إلا على الله رزقها)",
  "90- هود: (مثل الفريقين كالأعمى)",
  "91- هود: (وقال اركبوا فيها)",
  "92- هود: (وإلى ثمود اخاهم صالحاً)",
  "93- هود: (وإلى مدين أخاهم شعيباً قال يا قوم)",
  "94- هود: (واما الذين سعدوا)",
  "95- يوسف: (لقد كان فى يوسف )",
  "96- يوسف: (وقال نسوة فى المدينة)",
  "97- يوسف: (وما أبرئ نفسي إن النفس لأمارة)",
  "98- يوسف: (قالوا إن يسرق )",
  "99- يوسف: (رب قد اّتيتنى )",
  "100- الرعد: (وإن تعجب فعجبٌ قولهم)",
  "101- الرعد: (أفمن يعلم أنما أنزل إليك)",
  "102- الرعد: (مثل الجنة التى وعد المتقون)",
  "103- إبراهيم: (قالت رسلهم أفى الله شك)",
  "104- إبراهيم: (ألم تر الى الذين بدلوا)",
  "105- الحجر: (الر تلك آيات الكتاب وقرآن مبين)",
  "106- الحجر: (نبئ عبادى أنى أنا الغفور الرحيم)",
  "107- النحل: (أتى أمر الله فلا تستعجلوه)",
  "108- النحل: (وقيل للذين اتقوا)",
  "109- النحل: (وقال الله لا تتخذوا إلهين اثنين)",
  "110- النحل: (ضرب الله مثلاً عبداً مملوكاً)",
  "111- النحل: (إن الله يأمر بالعدل والإحسان)",
  "112- النحل: (يوم تأتي كل نفس تجادل عن نفسها)",
  "113- الإسراء: (سبحان الذي أسرى بعبده ليلاً)",
  "114- الإسراء: (وقضى ربك ألا تبعدوا إلا إياه)",
  "115- الإسراء: (قل كونوا حجارة أو حديدا)",
  "116- الإسراء: (ولقد كرمنا بنى اّدم)",
  "117- الاسراء: (أو لم يروا أن الله)",
  "118- الكهف: (وترى الشمس إذا طلعت)",
  "119- الكهف: (واضرب لهم مثلا رجلين)",
  "120- الكهف: (ما أشهدتهم خلق السموات والارض)",
  "121- الكهف: (قال ألم أقل لك)",
  "122- الكهف: (وتركنا بعضهم يومئذ يموج )",
  "123- مريم: (فحملته فانتبذت به)",
  "124- مريم: (فخلف من بعدهم خلف)",
  "125- طه: (طه)",
  "126- طه: (منها خلقناكم وفيها نعيدكم ومنها نخرجكم تارة أخرى)",
  "127- طه: (وما أعجلك عن قومك يا موسى)",
  "128- طه: (وعنت الوجوه للحي القيوم)",
  "129- الأنبياء: (اقترب للناس حسابهم وهم في غفلة)",
  "130- الأنبياء: (ومن يقل منهم)",
  "131- الأنبياء: (ولقد اّتينا إبراهيم رشده)",
  "132- الأنبياء: (وأيوب إذ نادى ربه)",
  "133- الحج: (يا أيها الناس اتقوا ربكم إن زلزلة الساعة)",
  "134- الحج: (هذان خصمان اختصموا)",
  "135- الحج: (إن الله يدافع عن الذين اّمنوا)",
  "136- الحج: (ذلك ومن عاقب بمثل )",
  "137- المؤمنون: (قد أفلح المؤمنون الذين هم في صلاتهم)",
  "138- المؤمنون: (هيهات هيهات)",
  "139- المؤمنون: (ولو رحمناهم وكشفنا ما بهم من ضر)",
  "140- النور: (سورة أنزلناها وفرضناها وأنزلنا فيها)",
  "141- النور: (يا أيها الذين اّمنوا لا تتبعوا)",
  "142- النور: (الله نور السماوات والأرض مثل نوره)",
  "143- النور: (وأقسموا بالله جهد أيمانهم)",
  "144- الفرقان: (تبارك الذي نزل الفرقان على عبده)",
  "145- الفرقان: (وقال الذين لا يرجون لقاءنا لولا أنزل)",
  "146- الفرقان: (وهو الذي مرج البحرين هذا عذب فرات)",
  "147- الشعراء: (طسم * تلك آيات الكتاب المبين)",
  "148- الشعراء: (وأوحينا إلى موسي)",
  "149- الشعراء: (قالوا أنؤمن لك)",
  "150- الشعراء: (أوفوا الكيل ولا تكونوا)",
  "151- النمل: (طس تلك آيات القرآن وكتاب مبين)",
  "152- النمل: (قال سننظر أصدقت)",
  "153- النمل: (فما كان جواب قومه)",
  "154- النمل: (وإذا وقع القول عليهم)",
  "155- القصص: (وحرمنا عليه المراضع)",
  "156- القصص: (فلما قضى موسي الأجل)",
  "157- القصص: (ولقد وصلنا لهم القول)",
  "158- القصص: (إن قارون كان من قوم موسي)",
  "159- العنكبوت: (الم * أحسب الناس أن يتركوا أن يقولوا)",
  "160- العنكبوت: (فاّمن له لوط)",
  "161- العنكبوت: (ولا تجادلوا أهل الكتاب)",
  "162- الروم: (الم * غلبت الروم في أدنى الأرض)",
  "163- الروم: (منيبين إليه واتقوه وأقيموا الصلوة)",
  "164- الروم: (الله الذى خلقكم من ضعف)",
  "165- لقمان: (ومن يسلم وجهه)",
  "166- السجدة: (قل يتوفاكم ملك الموت)",
  "167- الأحزاب: (يا أيها النبي اتق الله ولا تطع الكافرين)",
  "168- الأحزاب: (قد يعلم الله المعوقين)",
  "169- الأحزاب: (ومن يقنت منكن لله ورسوله وتعمل هصالحاً)",
  "170- الأحزاب: (ترجى من تشاء منهم)",
  "171- الأحزاب: (لئن لم ينته المنافقون)",
  "172- سبأ: (ولقد اّتينا داود)",
  "173- سبأ: (قل من يرزقكم)",
  "174- سبأ: (قل إنما أعظكم بواحدة)",
  "175- فاطر: (يا أيها الناس أنتم الفقراء)",
  "176- فاطر: (إن الله يمسك السماوات)",
  "177- يس: (وما أنزلنا على قومه من بعده من جند من السماء)",
  "178- يس: (ألم أعهد إليكم)",
  "179- الصافات: (احشروا الذين ظلموا)",
  "180- الصافات: (وإن من شيعته)",
  "181- الصافات: (فنبذناه بالعراء وهو سقيم)",
  "182- ص: (وهل أتاك نبأ الخصم)",
  "183- ص: (وعندهم قاصرات الطرف)",
  "184- الزمر: (وإذا مس الإنسان ضر)",
  "185- الزمر: (فمن أظلم ممن كذب على الله وكذب بالصدق)",
  "186- الزمر: (قل يا عبادى الذين أسرفوا)",
  "187- غافر: (حم * تنزيل الكتاب من الله العزيز العليم)",
  "188- غافر: (أولم يسيروا فى الأرض)",
  "189- غافر: (ويقوم مالى أدعوكم)",
  "190- غافر: (قل إنى نهيت)",
  "191- فصلت: (قل أئنكم لتكفرون)",
  "192- فصلت: (وقيضنا لهم قرناء)",
  "193- فصلت: (إليه يرد علم الساعة وما تخرج من ثمرات)",
  "194- الشورى: (شرع لكم من الدين)",
  "195- الشورى: (ولو بسط الله الرزق لعباده لبغوا في الأرض)",
  "196- الشورى: (وما كان لبشر)",
  "197- الزخرف: (قال أو لو جئتكم)",
  "198- الزخرف: (ولما ضُرب ابن مريم مثلا)",
  "199- الدخان: (ولقد فتنا قبلهم)",
  "200- الجاثية: (الله الذى سخر لكم البحر)",
  "201- الأحقاف: (حم * تنزيل الكتاب من الله العزيز الحكيم)",
  "202- الأحقاف: (واذكر أخا عاد)",
  "203- محمد: (أفلم يسيروا فى الأرض)",
  "204- محمد: (يا أيها الذين آمنوا أطيعوا الله وأطيعوا الرسول ولا تبطلوا أعمالكم)",
  "205- الفتح: (لقد رضي الله عن المؤمنين إذ يبايعونك تحت الشجرة)",
  "206- الحجرات: (يا أيها الذين آمنوا لا تقدموا بين يدي)",
  "207- الحجرات: (قالت الأعراب آمنا)",
  "208- ق: (قال قرينه ربنا ما أطغيته ولكن كان في ضلال بعيد)",
  "209- الذاريات: (قال فما خطبكم أيها المرسلون)",
  "210- الطور: (ويطوف عليهم غلمان)",
  "211- النجم: (وكم من ملك فى السموات)",
  "212- القمر: (كذبت قبلهم قوم نوح)",
  "213- الرحمن: (الرحمن * علم القرآن * خلق الإنسان)",
  "214- الرحمن: (ولمن خاف مقام ربه جنتان)",
  "215- الرحمن: (ومن دونهما جنتان)",
  "216- الواقعة: (إذا وقعت الواقعة * ليس لوقعتها كاذبة)",
  "217- الواقعة: (أفرأيتم ما تمنون)",
  "218- الحديد: (سبح لله ما في السماوات والأرض وهو العزيز)",
  "219- الحديد: (ألم يأن)",
  "220- الحديد: (اعلموا أنما الحياة الدنيا لعب ولهو)",
  "221- المجادلة: (قد سمع الله قول التي تجادلك في زوجها)",
  "222- المجادلة: (ألم تر أن الله يعلم ما في السماوات وما في الأرض)",
  "223- الحشر: (سبح لله ما في السماوات وما في الأرض وهو)",
  "224- الحشر: (ألم تر إلى الذين نافقوا يقولون لإخوانهم)",
  "225- الممتحنة: (يا أيها الذين آمنوا لا تتخذوا عدوي وعدوكم)",
  "226- الممتحنة: (يا أيها الذين آمنوا إذا جاءكم المؤمنات)",
  "227- الصف: (سبح لله ما في السماوات وما في الأرض وهو)",
  "228- الجمعة: (يسبح لله ما في السماوات وما في الأرض الملك)",
  "229- المنافقون: (إذا جاءك المنافقون قالوا نشهد إنك)",
  "230- التغابن: (يسبح لله ما في السماوات وما في الأرض له)",
  "231- الطلاق: (يا أيها النبي إذا طلقتم النساء فطلقوهن)",
  "232- التحريم: (يا أيها النبي لم تحرم ما أحل الله لك)",
  "233- الملك: (تبارك الذي بيده الملك وهو على كل شيء)",
  "234- القلم: (ن والقلم وما يسطرون * ما أنت بنعمة ربك)",
  "235- الحاقة: (الحاقة * ما الحاقة * وما أدراك ما الحاقة)",
  "236- المعارج: (سأل سائل بعذاب واقع * للكافرين ليس له)",
  "237- نوح: (إنا أرسلنا نوحاً إلى قومه أن أنذر قومك)",
  "238- الجن: (قل أوحي إلي أنه استمع نفر من الجن)",
  "239- المزمل: (يا أيها المزمل * قم الليل إلا قليلاً)",
  "240- المدثر: (يا أيها المدثر * قم فأنذر * وربك فكبر)",
  "241- القيامة: (لا أقسم بيوم القيامة * ولا أقسم بالنفس)",
  "242- الإنسان: (هل أتى على الإنسان حين من الدهر)",
  "243- المرسلات: (والمرسلات عرفاً * فالعاصفات عصفاً)",
  "244- النبأ: (عم يتساءلون * عن النبأ العظيم)",
  "245- النازعات: (والنازعات غرقاً * والناشطات نشطاً)",
  "246- عبس: (عبس وتولى * أن جاءه الأعمى)",
  "247- التكوير: (إذا الشمس كورت * وإذا النجوم انكدرت)",
  "248- الانفطار: (إذا السماء انفطرت * وإذا الكواكب انتثرت)",
  "249- المطففين: (ويل للمطففين * الذين إذا اكتالوا على الناس)",
  "250- الانشقاق: (إذا السماء انشقت * وأذنت لربها وحقت)",
  "251- البروج: (والسماء ذات البروج * واليوم الموعود)",
  "252- الطارق: (والسماء والطارق * وما أدراك ما الطارق)",
  "253- الأعلى: (سبح اسم ربك الأعلى * الذي خلق فسوى)",
  "254- الغاشية: (هل أتاك حديث الغاشية * وجوه يومئذ خاشعة)",
  "255- الفجر: (والفجر * وليال عشر * والشفع والوتر)",
  "256- البلد: (لا أقسم بهذا البلد * وأنت حل بهذا البلد)",
  "257- الشمس والليل: (والشمس وضحاها * والليل إذا يغشى)",
  "258- الضحى والشرح: (والضحى * ألم نشرح لك صدرك)",
  "259- التين والعلق: (والتين والزيتون * اقرأ باسم ربك)",
  "260- القدر والبينة والزلزلة والعاديات",
  "261- القارعة والتكاثر والعصر والهمزة والفيل",
  "262- قريش والماعون والكوثر والكافرون والنصر والمسد والإخلاص والفلق والناس"
];

const QURAN_PAGES_LIST = Array.from({ length: 604 }, (_, i) => `صفحة ${i + 1}`);

export const QURAN_SURAHS = [
  { id: 1, name: "الفاتحة", page: 1 },
  { id: 2, name: "البقرة", page: 2 },
  { id: 3, name: "آل عمران", page: 50 },
  { id: 4, name: "النساء", page: 77 },
  { id: 5, name: "المائدة", page: 106 },
  { id: 6, name: "الأنعام", page: 128 },
  { id: 7, name: "الأعراف", page: 151 },
  { id: 8, name: "الأنفال", page: 177 },
  { id: 9, name: "التوبة", page: 187 },
  { id: 10, name: "يونس", page: 208 },
  { id: 11, name: "هود", page: 221 },
  { id: 12, name: "يوسف", page: 235 },
  { id: 13, name: "الرعد", page: 249 },
  { id: 14, name: "إبراهيم", page: 255 },
  { id: 15, name: "الحجر", page: 262 },
  { id: 16, name: "النحل", page: 267 },
  { id: 17, name: "الإسراء", page: 282 },
  { id: 18, name: "الكهف", page: 293 },
  { id: 19, name: "مريم", page: 305 },
  { id: 20, name: "طه", page: 312 },
  { id: 21, name: "الأنبياء", page: 322 },
  { id: 22, name: "الحج", page: 332 },
  { id: 23, name: "المؤمنون", page: 342 },
  { id: 24, name: "النور", page: 350 },
  { id: 25, name: "الفرقان", page: 359 },
  { id: 26, name: "الشعراء", page: 367 },
  { id: 27, name: "النمل", page: 377 },
  { id: 28, name: "القصص", page: 385 },
  { id: 29, name: "العنكبوت", page: 396 },
  { id: 30, name: "الروم", page: 404 },
  { id: 31, name: "لقمان", page: 411 },
  { id: 32, name: "السجدة", page: 415 },
  { id: 33, name: "الأحزاب", page: 418 },
  { id: 34, name: "سبأ", page: 428 },
  { id: 35, name: "فاطر", page: 434 },
  { id: 36, name: "يس", page: 440 },
  { id: 37, name: "الصافات", page: 446 },
  { id: 38, name: "ص", page: 453 },
  { id: 39, name: "الزمر", page: 458 },
  { id: 40, name: "غافر", page: 467 },
  { id: 41, name: "فصلت", page: 477 },
  { id: 42, name: "الشورى", page: 483 },
  { id: 43, name: "الزخرف", page: 489 },
  { id: 44, name: "الدخان", page: 496 },
  { id: 45, name: "الجاثية", page: 499 },
  { id: 46, name: "الأحقاف", page: 502 },
  { id: 47, name: "محمد", page: 507 },
  { id: 48, name: "الفتح", page: 511 },
  { id: 49, name: "الحجرات", page: 515 },
  { id: 50, name: "ق", page: 518 },
  { id: 51, name: "الذاريات", page: 520 },
  { id: 52, name: "الطور", page: 523 },
  { id: 53, name: "النجم", page: 526 },
  { id: 54, name: "القمر", page: 528 },
  { id: 55, name: "الرحمن", page: 531 },
  { id: 56, name: "الواقعة", page: 534 },
  { id: 57, name: "الحديد", page: 537 },
  { id: 58, name: "المجادلة", page: 542 },
  { id: 59, name: "الحشر", page: 545 },
  { id: 60, name: "الممتحنة", page: 549 },
  { id: 61, name: "الصف", page: 551 },
  { id: 62, name: "الجمعة", page: 553 },
  { id: 63, name: "المنافقون", page: 554 },
  { id: 64, name: "التغابن", page: 556 },
  { id: 65, name: "الطلاق", page: 558 },
  { id: 66, name: "التحريم", page: 560 },
  { id: 67, name: "الملك", page: 562 },
  { id: 68, name: "القلم", page: 564 },
  { id: 69, name: "الحاقة", page: 566 },
  { id: 70, name: "المعارج", page: 568 },
  { id: 71, name: "نوح", page: 570 },
  { id: 72, name: "الجن", page: 572 },
  { id: 73, name: "المزمل", page: 574 },
  { id: 74, name: "المدثر", page: 575 },
  { id: 75, name: "القيامة", page: 577 },
  { id: 76, name: "الإنسان", page: 578 },
  { id: 77, name: "المرسلات", page: 580 },
  { id: 78, name: "النبأ", page: 582 },
  { id: 79, name: "النازعات", page: 585 },
  { id: 80, name: "عبس", page: 588 },
  { id: 81, name: "التكوير", page: 589 },
  { id: 82, name: "الأنفطار", page: 591 },
  { id: 83, name: "المطففين", page: 592 },
  { id: 84, name: "الانشقاق", page: 593 },
  { id: 85, name: "البروج", page: 595 },
  { id: 86, name: "الطارق", page: 596 },
  { id: 87, name: "الأعلى", page: 597 },
  { id: 88, name: "الغاشية", page: 598 },
  { id: 89, name: "الفجر", page: 599 },
  { id: 90, name: "البلد", page: 601 },
  { id: 91, name: "الشمس", page: 602 },
  { id: 92, name: "الليل", page: 603 },
  { id: 93, name: "الضحى", page: 604 },
  { id: 94, name: "الشرح", page: 604 },
  { id: 95, name: "التين", page: 604 },
  { id: 96, name: "العلق", page: 604 },
  { id: 97, name: "القدر", page: 604 },
  { id: 98, name: "البينة", page: 604 },
  { id: 99, name: "الزلزلة", page: 604 },
  { id: 100, name: "العاديات", page: 604 },
  { id: 101, name: "القارعة", page: 604 },
  { id: 102, name: "التكاثر", page: 604 },
  { id: 103, name: "العصر", page: 604 },
  { id: 104, name: "الهمزة", page: 604 },
  { id: 105, name: "الفيل", page: 604 },
  { id: 106, name: "قريش", page: 604 },
  { id: 107, name: "الماعون", page: 604 },
  { id: 108, name: "الكوثر", page: 604 },
  { id: 109, name: "الكافرون", page: 604 },
  { id: 110, name: "النصر", page: 604 },
  { id: 111, name: "المسد", page: 604 },
  { id: 112, name: "الإخلاص", page: 604 },
  { id: 113, name: "الفلق", page: 604 },
  { id: 114, name: "الناس", page: 604 }
];

interface QuranPageProps {
  log: DailyLog;
  logs: Record<string, DailyLog>;
  plan: 'new_1' | 'new_2' | 'itqan_3' | 'itqan_4';
  onUpdatePlan: (plan: 'new_1' | 'new_2' | 'itqan_3' | 'itqan_4') => void;
  onUpdateLog: (log: DailyLog) => void;
}

const QuranPage: React.FC<QuranPageProps> = ({ log, logs, plan, onUpdatePlan, onUpdateLog }) => {
  const [subTab, setSubTab] = useState<'hifz' | 'tadabbur'>('hifz');
  const [hifzUnit, setHifzUnit] = useState<'page' | 'rub'>('rub');

  useEffect(() => {
    const savedUnit = localStorage.getItem('worship_quran_unit') as 'page' | 'rub';
    if (savedUnit) setHifzUnit(savedUnit);
  }, []);

  const handleUnitChange = (unit: 'page' | 'rub') => {
    setHifzUnit(unit);
    localStorage.setItem('worship_quran_unit', unit);
    onUpdateLog({ ...log, quran: { ...log.quran, todayPortion: '' } });
  };

  const quranData = log.quran || { hifzRub: 0, revisionRub: 0, todayPortion: '', todayReps: 0, tasksCompleted: [], readPages: [] };
  const readPages = quranData.readPages || [];

  const toggleTask = (taskId: string) => {
    const currentTasks = quranData.tasksCompleted || [];
    const newTasks = currentTasks.includes(taskId) ? currentTasks.filter(id => id !== taskId) : [...currentTasks, taskId];
    onUpdateLog({ ...log, quran: { ...quranData, tasksCompleted: newTasks } });
  };

  const updatePortionName = (name: string) => {
    onUpdateLog({ ...log, quran: { ...quranData, todayPortion: name } });
  };

  const updateReps = (val: number) => {
    onUpdateLog({ ...log, quran: { ...quranData, todayReps: Math.max(0, val) } });
  };

  const currentIndex = useMemo(() => {
    if (!quranData.todayPortion) return 0;
    const list = hifzUnit === 'rub' ? QURAN_PORTIONS_NAMES : QURAN_PAGES_LIST;
    const idx = list.indexOf(quranData.todayPortion);
    return idx !== -1 ? idx + 1 : 0;
  }, [quranData.todayPortion, hifzUnit]);

  const rabtPortions = useMemo(() => {
    if (currentIndex <= 1) return [];
    const portions = [];
    const list = hifzUnit === 'rub' ? QURAN_PORTIONS_NAMES : QURAN_PAGES_LIST;
    const limit = Math.max(1, currentIndex - 10);
    for (let i = currentIndex - 1; i >= limit; i--) {
      portions.push({ id: `rabt_${i}`, label: list[i - 1], index: i });
    }
    return portions;
  }, [currentIndex, hifzUnit]);

  // منطق مراجعة المحفوظ القديم (تقسيم على 7 أيام تبدأ من الأحد)
  const murajaaData = useMemo(() => {
    const list = hifzUnit === 'rub' ? QURAN_PORTIONS_NAMES : QURAN_PAGES_LIST;
    const buffer = hifzUnit === 'rub' ? 11 : 25; 
    
    if (currentIndex <= buffer) return null;
    
    const totalOldPortions = currentIndex - buffer;
    
    // JS getDay(): الأحد=0، الاثنين=1، ... السبت=6
    const cycleDay = new Date().getDay(); 
    
    // عدد الأرباع التي يجب مراجعتها يومياً (قسمة على 7)
    const dailyQuota = Math.ceil(totalOldPortions / 7);
    
    // تحديد البداية والنهاية لمراجعة اليوم بناءً على cycleDay (0=Sunday)
    const startIndex = cycleDay * dailyQuota;
    const endIndex = Math.min(startIndex + dailyQuota, totalOldPortions);
    
    if (startIndex >= totalOldPortions) return null;
 
    const items = [];
    for (let i = startIndex; i < endIndex; i++) {
        items.push({
            id: `mur_${i + 1}`,
            label: list[i]
        });
    }
 
    return { 
      items,
      total: totalOldPortions,
      unitLabel: hifzUnit === 'rub' ? 'أرباع' : 'صفحات',
      quota: items.length,
      dayName: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][cycleDay]
    };
  }, [currentIndex, hifzUnit]);

  const hifzSteps = [
    { id: 'prev_repeat', label: 'تكرار محفوظ الأمس ٥ مرات', desc: 'لربط محفوظ اليوم بما سبقه وتثبيته', icon: <History className="w-4 h-4" /> },
    { id: 'listen', label: 'الاستماع لمجود مع النظر', desc: 'للتأكد من سلامة النطق', icon: <Clock className="w-4 h-4" /> },
    { id: 'repeat', label: `تكرار ال${hifzUnit === 'rub' ? 'ربع' : 'وجه'} ٤٠ مرة`, desc: 'تثبيت الحفظ في الذاكرة العميقة', icon: <Repeat className="w-4 h-4" /> },
    { id: 'record', label: 'التسجيل الصوتي والمطابقة', desc: 'قراءة غيبية ومطابقتها للتصحيح', icon: <Mic className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* التبويبات الثنائية الفاخرة */}
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
        <button 
          onClick={() => setSubTab('hifz')} 
          className={`flex-1 py-3 rounded-xl text-[10px] sm:text-xs font-black header-font transition-all flex items-center justify-center gap-1.5 ${subTab === 'hifz' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Repeat className="w-4 h-4" /> برنامج الحفظ والإتقان
        </button>
        <button 
          onClick={() => setSubTab('tadabbur')} 
          className={`flex-1 py-3 rounded-xl text-[10px] sm:text-xs font-black header-font transition-all flex items-center justify-center gap-1.5 ${subTab === 'tadabbur' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Sparkles className="w-4 h-4" /> محراب التدبر والتدوين
        </button>
      </div>

      {subTab === 'hifz' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
             <div className="flex items-center gap-2 mb-4">
               <Settings className="w-4 h-4 text-slate-400" />
               <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest header-font">تخصيص خطة الحفظ اليومية</h4>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => handleUnitChange('page')}
                 className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${hifzUnit === 'page' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-50 border-transparent text-slate-400'}`}
               >
                 <FileText className="w-4 h-4" />
                 <span className="text-xs font-bold header-font">صفحة واحدة</span>
               </button>
               <button 
                 onClick={() => handleUnitChange('rub')}
                 className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${hifzUnit === 'rub' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-50 border-transparent text-slate-400'}`}
               >
                 <LayoutGrid className="w-4 h-4" />
                 <span className="text-xs font-bold header-font">ربع حزب</span>
               </button>
             </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 mb-4"><Book className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-sm">المحفوظ الجديد لليوم</h3></div>
             <div className="relative mb-6">
               <select 
                 value={quranData.todayPortion || ''} 
                 onChange={(e) => updatePortionName(e.target.value)} 
                 className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pr-10 text-xs font-black header-font appearance-none outline-none focus:border-emerald-500 transition-all text-slate-700"
               >
                 <option value="">{`اختر ${hifzUnit === 'rub' ? 'الربع' : 'الصفحة'} التي ستحفظها اليوم..`}</option>
                 {(hifzUnit === 'rub' ? QURAN_PORTIONS_NAMES : QURAN_PAGES_LIST).map((name, idx) => (
                   <option key={idx} value={name}>{name}</option>
                 ))}
               </select>
               <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
             </div>
             
             {quranData.todayPortion && (
               <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 animate-in zoom-in duration-300">
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <Repeat className="w-4 h-4 text-emerald-600" />
                     <span className="text-xs font-black text-emerald-800 header-font">{`عدد تكرار ال${hifzUnit === 'rub' ? 'ربع' : 'وجه'}`}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <button onClick={() => updateReps((quranData.todayReps || 0) - 1)} className="p-1.5 bg-white rounded-lg border border-emerald-200 text-emerald-600"><Minus className="w-4 h-4" /></button>
                     <span className="text-xl font-black font-mono text-emerald-900">{quranData.todayReps || 0}</span>
                     <button onClick={() => updateReps((quranData.todayReps || 0) + 1)} className="p-1.5 bg-white rounded-lg border border-emerald-200 text-emerald-600"><Plus className="w-4 h-4" /></button>
                   </div>
                 </div>
               </div>
             )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6"><ListChecks className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-800 header-font text-sm">خطوات الإتقان (بالترتيب)</h3></div>
            <div className="space-y-3">
              {hifzSteps.map((step, idx) => (
                <button key={step.id} onClick={() => toggleTask(step.id)} className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-right ${quranData.tasksCompleted?.includes(step.id) ? 'bg-emerald-50 border-emerald-200 opacity-70' : 'bg-slate-50 border-transparent'}`}>
                  <div className={`mt-1 rounded-lg p-2 ${quranData.tasksCompleted?.includes(step.id) ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300 shadow-sm'}`}>{step.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-black header-font ${quranData.tasksCompleted?.includes(step.id) ? 'text-emerald-800 line-through' : 'text-slate-700'}`}>{idx + 1}. {step.label}</p>
                      {quranData.tasksCompleted?.includes(step.id) ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-200" />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">{step.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <ArrowLeftRight className="w-5 h-5 text-blue-500" />
              <div className="flex flex-col">
                <h3 className="font-bold text-slate-800 header-font text-sm">دعامة الربط التلقائي</h3>
                <p className="text-[9px] text-slate-400 font-bold italic">{`مراجعة آخر 10 ${hifzUnit === 'rub' ? 'أرباع' : 'صفحات'} سابقة لموضعك الحالي`}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {rabtPortions.length > 0 ? rabtPortions.map((item) => (
                <button key={item.id} onClick={() => toggleTask(item.id)} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${quranData.tasksCompleted?.includes(item.id) ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-transparent'}`}>
                  <span className={`text-[10px] font-black header-font transition-all ${quranData.tasksCompleted?.includes(item.id) ? 'text-emerald-800' : 'text-slate-600'}`}>{item.label}</span>
                  {quranData.tasksCompleted?.includes(item.id) ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-200" />}
                </button>
              )) : (
                <div className="text-center py-6 text-[10px] text-slate-400 font-bold italic">{`اختر موضع حفظك الحالي ليتم جدولة الربط (آخر 10 ${hifzUnit === 'rub' ? 'أرباع' : 'صفحات'}) تلقائياً`}</div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-bold header-font leading-tight">مراجعة المحفوظ القديم</h3>
                  <p className="text-[9px] text-emerald-300/60 font-bold uppercase">يتم ختم مراجعة قديمك كل 7 أيام (بداية الأسبوع: الأحد)</p>
                </div>
              </div>
              
              {murajaaData ? (
                <div className="space-y-6">
                  <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-emerald-500 text-emerald-950 px-3 py-1 rounded-full text-[10px] font-black header-font">ورد يوم {murajaaData.dayName}</div>
                      <div className="text-[10px] font-bold text-emerald-300 italic">{`(${murajaaData.quota} ${murajaaData.unitLabel} اليوم)`}</div>
                    </div>
                    
                    <div className="space-y-2">
                        {murajaaData.items.map((item) => (
                            <button 
                                key={item.id} 
                                onClick={() => toggleTask(item.id)} 
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-right ${quranData.tasksCompleted?.includes(item.id) ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100' : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'}`}
                            >
                                <span className="text-[10px] font-bold header-font leading-relaxed">{item.label}</span>
                                {quranData.tasksCompleted?.includes(item.id) ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <Circle className="w-4 h-4 text-white/20" />
                                )}
                            </button>
                        ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                     <p className="text-[10px] text-slate-400 font-bold">إجمالي محفوظك القديم الحالي: <span className="text-emerald-400">{murajaaData.total}</span> {murajaaData.unitLabel}.</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-[10px] text-emerald-300 font-bold leading-relaxed">{`بمجرد أن يتجاوز محفوظك الـ ${hifzUnit === 'rub' ? '11 ربعاً' : '25 صفحة'}، سيبدأ النظام بتقسيم القديم على 7 أيام وعرض ورد اليوم تلقائياً.`}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* محراب التدبر القرآني المتكامل */
        <QuranTadabbur 
          log={log} 
          onUpdateLog={onUpdateLog} 
          currentDate={log.date}
        />
      )}
    </div>
  );
};

export default QuranPage;
