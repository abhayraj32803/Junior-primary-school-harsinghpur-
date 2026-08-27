import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  BookOpen, 
  Utensils, 
  Gift, 
  Bell, 
  Users, 
  Sparkles, 
  GraduationCap, 
  LogIn, 
  Phone, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Calendar,
  Layers,
  HeartHandshake,
  FileText,
  MapPin,
  ChevronRight
} from 'lucide-react';

interface StudentParentGuideProps {
  onNavigate: (page: string) => void;
  onOpenPortal?: () => void;
  onSelectClass?: (classId: string) => void;
}

export const StudentParentGuide: React.FC<StudentParentGuideProps> = ({ 
  onNavigate, 
  onOpenPortal,
  onSelectClass
}) => {
  const { language, classes, settings, notices } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassTab, setSelectedClassTab] = useState<number | null>(null);

  // Dynamic Day of the Week for Today's MDM Menu
  const daysHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayIndex = new Date().getDay();
  const todayNameHi = daysHi[currentDayIndex];
  const todayNameEn = daysEn[currentDayIndex];

  const mdmSchedule: Record<number, { menuHi: string; menuEn: string; icon: string; highlight: string }> = {
    1: { menuHi: 'रोटी, दाल (सोयाबीन/सब्जी युक्त), ताजा मौसमी फल', menuEn: 'Roti, Dal with Veg/Soybean, Fresh Fruit', icon: '🍎', highlight: 'सोमवार: ताजा फल वितरण' },
    2: { menuHi: 'चावल, राजमा / चना दाल एवं सब्जी', menuEn: 'Rice, Rajma / Chana Dal & Fresh Veg', icon: '🍛', highlight: 'मंगलवार: पौष्टिक राजमा/दाल' },
    3: { menuHi: 'रोटी, मौसमी हरी सब्जी, 150ml गर्म ताजा दूध', menuEn: 'Roti, Seasonal Veg, 150ml Warm Milk', icon: '🥛', highlight: 'बुधवार: गर्म दूध वितरण दिवस' },
    4: { menuHi: 'चावल, कढ़ी-पकौड़ा / दाल एवं सब्जी', menuEn: 'Rice, Kadhi-Pakoda / Dal & Veg', icon: '🍲', highlight: 'गुरुवार: स्वादिष्ट कढ़ी-चावल' },
    5: { menuHi: 'रोटी, सोयाबीन-आलू की सब्जी, दाल', menuEn: 'Roti, Soybean-Potato Sabzi, Dal', icon: '🥗', highlight: 'शुक्रवार: प्रोटीन युक्त सोयाबीन' },
    6: { menuHi: 'चावल, सब्जीयुक्त पौष्टिक तहरी एवं उबला अंडा / मौसमी फल', menuEn: 'Veggie Tehri, Boiled Egg / Fresh Fruit', icon: '🍳', highlight: 'शनिवार: विशेष तहरी व फल' },
    0: { menuHi: 'रविवार अवकाश (कल सोमवार को स्वादिष्ट फल व दाल-रोटी)', menuEn: 'Sunday Holiday (Fresh fruit & dal roti tomorrow)', icon: '☀️', highlight: 'साप्ताहिक अवकाश' }
  };

  const todayMenu = mdmSchedule[currentDayIndex];

  // Core "कहाँ क्या मिलेगा?" Directory Items
  const guideCards = [
    {
      id: 'mdm',
      icon: Utensils,
      bgGradient: 'from-amber-500 to-orange-500',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      tagHi: 'आज का खाना / मेन्यू',
      tagEn: "Today's Mid-Day Meal",
      questionHi: 'आज स्कूल में खाने में क्या बना है?',
      questionEn: "What is cooking for lunch today?",
      descHi: `आज (${todayNameHi}): ${todayMenu.menuHi}`,
      descEn: `Today (${todayNameEn}): ${todayMenu.menuEn}`,
      actionLabelHi: 'पूरा साप्ताहिक मेन्यू देखें',
      actionLabelEn: 'View Weekly Menu',
      targetPage: 'schemes',
      keywords: ['खाना', 'भोजन', 'मिड डे मील', 'mdm', 'food', 'lunch', 'fruit', 'फल', 'दूध', 'milk', 'चावल', 'रोटी']
    },
    {
      id: 'classes',
      icon: BookOpen,
      bgGradient: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      tagHi: 'कक्षा 1 से 8 की पढ़ाई',
      tagEn: 'Class 1 to 8 Books & Syllabus',
      questionHi: 'मेरी कक्षा की किताबें, विषय और टाइम-टेबल कहाँ हैं?',
      questionEn: 'Where are my textbooks, subjects & syllabus?',
      descHi: 'कक्षा 1 से 8 तक के सभी विषय, एससीईआरटी (SCERT) पुस्तकें एवं मासिक परीक्षा योजना।',
      descEn: 'Prescribed SCERT textbooks, syllabus, subjects and monthly evaluation schedules for Classes 1 to 8.',
      actionLabelHi: 'कक्षावार किताबें व विषय देखें',
      actionLabelEn: 'View Class Syllabus',
      targetPage: 'classes',
      keywords: ['किताब', 'किताबें', 'सिलेबस', 'विषय', 'पढ़ाई', 'books', 'syllabus', 'subjects', 'class', 'कक्षा', 'टाइम टेबल', 'timetable']
    },
    {
      id: 'schemes',
      icon: Gift,
      bgGradient: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      tagHi: 'मुफ्त ₹1200 व सरकारी लाभ',
      tagEn: 'Free Grants & DBT ₹1200',
      questionHi: 'ड्रेस, जूता-मोज़ा, बैग और छात्रवृत्ति कैसे मिलेगी?',
      questionEn: 'How to get ₹1200 DBT for uniform, bag & shoes?',
      descHi: 'प्रत्येक बच्चे के माता-पिता के खाते में ₹1200 DBT (2 जोड़ी ड्रेस, बैग, जूते-मोजे, स्वेटर) व 100% फ्री किताबें।',
      descEn: '₹1200 Direct Benefit Transfer to parent accounts for 2 uniforms, bag, shoes, socks, sweater + free textbooks.',
      actionLabelHi: 'सरकारी लाभ व डीबीटी विवरण',
      actionLabelEn: 'View Govt Benefits',
      targetPage: 'schemes',
      keywords: ['ड्रेस', 'वर्दी', 'यूनिफॉर्म', 'बैग', 'जूते', 'मोजे', 'स्वेटर', 'रुपये', 'dbt', '1200', 'grant', 'scholarship', 'छात्रवृत्ति', 'लाभ', 'scheme']
    },
    {
      id: 'notices',
      icon: Bell,
      bgGradient: 'from-rose-600 to-red-600',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      tagHi: 'छुट्टियां व ताज़ा सूचनाएं',
      tagEn: 'Holidays & Notice Board',
      questionHi: 'स्कूल की छुट्टी कब है और अगली परीक्षा कब होगी?',
      questionEn: 'When is the next holiday or exam?',
      descHi: 'नवीनतम शासकीय अवकाश, परीक्षा समय-सारिणी, मौसम अलर्ट एवं विद्यालय नोटिस बोर्ड।',
      descEn: 'Official holiday lists, exam timetables, weather alerts, and circulars issued by Basic Education Dept.',
      actionLabelHi: 'नोटिस बोर्ड व छुट्टियां देखें',
      actionLabelEn: 'Open Notice Board',
      targetPage: 'notices',
      keywords: ['छुट्टी', 'अवकाश', 'नोटिस', 'सूचना', 'परीक्षा', 'एग्जाम', 'holiday', 'leave', 'notice', 'circular', 'exam', 'date']
    },
    {
      id: 'faculty',
      icon: Users,
      bgGradient: 'from-purple-600 to-violet-600',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      tagHi: 'हमारे गुरुजी / शिक्षक',
      tagEn: 'Teachers & Faculty',
      questionHi: 'हमारे क्लास टीचर और बाकी शिक्षक कौन-कौन हैं?',
      questionEn: 'Who are our teachers and class in-charges?',
      descHi: 'प्रधानाध्यापिका एवं सभी समर्पित, प्रशिक्षित शिक्षकों की योग्यता, पदनाम एवं कक्षा आवंटन।',
      descEn: 'Meet the Headmaster and certified faculty members, their educational qualifications and assigned classes.',
      actionLabelHi: 'शिक्षकों की सूची देखें',
      actionLabelEn: 'Meet Teachers',
      targetPage: 'faculty',
      keywords: ['शिक्षक', 'टीचर', 'सर', 'मैडम', 'गुरुजी', 'प्रधानाध्यापक', 'teacher', 'faculty', 'headmaster', 'staff', 'class teacher']
    },
    {
      id: 'admission',
      icon: GraduationCap,
      bgGradient: 'from-amber-600 to-yellow-600',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      tagHi: 'नया दाखिला (100% फ्री)',
      tagEn: 'Free Admission Process',
      questionHi: 'स्कूल में बच्चे का नया एडमिशन कैसे कराएं?',
      questionEn: 'How to enroll a new student in Class 1 to 8?',
      descHi: 'निशुल्क शिक्षा का अधिकार (RTE)। आवश्यक कागजात: आधार कार्ड, जन्म प्रमाण पत्र व बैंक पासबुक।',
      descEn: '100% Free admission under RTE. Required documents: Student/Parent Aadhaar, Birth Certificate, Bank Passbook.',
      actionLabelHi: 'दाखिला प्रक्रिया व नियम',
      actionLabelEn: 'Admission Guide',
      targetPage: 'admission',
      keywords: ['दाखिला', 'प्रवेश', 'एडमिशन', 'फीस', 'admission', 'enrollment', 'form', 'rte', 'new student', 'कागजात', 'documents']
    },
    {
      id: 'activities',
      icon: Sparkles,
      bgGradient: 'from-pink-600 to-rose-500',
      badgeBg: 'bg-pink-100 text-pink-900 border-pink-300',
      tagHi: 'खेलकूद व गतिविधियां',
      tagEn: 'Sports & Gallery',
      questionHi: 'स्कूल के खेलकूद, बाल सभा और फोटो कहाँ दिखेंगे?',
      questionEn: 'Where to see sports events, cultural activities & photos?',
      descHi: 'दैनिक प्रार्थना सभा, योग, खेलकूद प्रतियोगिताएं, विज्ञान मेला, रंगोली एवं बाल संसद के जीवंत फोटो।',
      descEn: 'Morning assembly, Yoga, annual sports competitions, science exhibitions, and event photo gallery.',
      actionLabelHi: 'फोटो गैलरी व खेलकूद',
      actionLabelEn: 'View Gallery & Sports',
      targetPage: 'gallery',
      keywords: ['खेल', 'खेलकूद', 'फोटो', 'तस्वीरें', 'गैलरी', 'बाल सभा', 'sports', 'games', 'gallery', 'photos', 'activities', 'yoga']
    },
    {
      id: 'login',
      icon: LogIn,
      bgGradient: 'from-slate-800 to-slate-950',
      badgeBg: 'bg-slate-200 text-slate-900 border-slate-300',
      tagHi: 'विद्यार्थी पोर्टल लॉगिन',
      tagEn: 'Student Login & Results',
      questionHi: 'अपना रिजल्ट, रिपोर्ट कार्ड और हाजिरी कैसे देखें?',
      questionEn: 'How to check report card, marks and attendance?',
      descHi: 'विद्यार्थी अपने रोल नंबर और पासवर्ड से लॉगिन करके मासिक परीक्षा अंक, गृहकार्य व पहचान पत्र देख सकते हैं।',
      descEn: 'Students can log in with their Roll Number & password to check monthly exam marks, homework & ID card.',
      actionLabelHi: 'विद्यार्थी लॉगिन करें',
      actionLabelEn: 'Student Login',
      targetPage: 'login',
      isLogin: true,
      keywords: ['रिजल्ट', 'रिजल्ट्स', 'अंक', 'नंबर', 'हाजिरी', 'उपस्थिति', 'लॉगिन', 'marks', 'result', 'report card', 'login', 'portal', 'roll number']
    },
    {
      id: 'contact',
      icon: Phone,
      bgGradient: 'from-cyan-600 to-blue-700',
      badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      tagHi: 'स्कूल का पता व फोन',
      tagEn: 'School Contact & Help',
      questionHi: 'स्कूल से कैसे संपर्क करें या स्कूल कैसे पहुंचें?',
      questionEn: 'How to contact the school or find the location?',
      descHi: 'विद्यालय का पूरा पता, गूगल मैप्स लोकेशन, हेल्पलाइन फोन नंबर एवं प्रधानाध्यापक से मिलने का समय।',
      descEn: 'Complete postal address, Google Maps GPS directions, helpline contact numbers and office visiting hours.',
      actionLabelHi: 'स्कूल का पता व फोन नंबर',
      actionLabelEn: 'Contact Details',
      targetPage: 'contact',
      keywords: ['फोन', 'मोबाइल', 'नंबर', 'पता', 'कहाँ है', 'मैप', 'गूगल मैप', 'संपर्क', 'help', 'contact', 'phone', 'address', 'map', 'location']
    }
  ];

  // Search Filtering
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return guideCards;
    const query = searchQuery.toLowerCase().trim();
    return guideCards.filter(card => 
      card.questionHi.toLowerCase().includes(query) ||
      card.questionEn.toLowerCase().includes(query) ||
      card.descHi.toLowerCase().includes(query) ||
      card.descEn.toLowerCase().includes(query) ||
      card.tagHi.toLowerCase().includes(query) ||
      card.tagEn.toLowerCase().includes(query) ||
      card.keywords.some(k => k.toLowerCase().includes(query))
    );
  }, [searchQuery, guideCards]);

  const handleCardClick = (card: typeof guideCards[0]) => {
    if (card.isLogin && onOpenPortal) {
      onOpenPortal();
    } else {
      onNavigate(card.targetPage);
    }
  };

  const handleQuickClassClick = (classNum: number) => {
    const targetClass = classes.find(c => c.classNumber === classNum) || classes[classNum - 1];
    if (targetClass) {
      if (onSelectClass) onSelectClass(targetClass.id);
      try {
        sessionStorage.setItem('sms_selected_class_id', targetClass.id);
      } catch {}
    }
    onNavigate('classes');
  };

  return (
    <section 
      id="student-parent-guide-hub"
      className="bg-gradient-to-b from-amber-50/50 via-white to-blue-50/40 rounded-3xl sm:rounded-4xl p-5 sm:p-8 lg:p-10 border-2 border-amber-200/80 shadow-md relative overflow-hidden space-y-8 sm:space-y-10"
    >
      {/* Background Subtle Orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* -------------------------------------------------------------
          1. HEADER WITH BILINGUAL TITLE & SEARCH BAR
          ------------------------------------------------------------- */}
      <div className="text-center max-w-3xl mx-auto space-y-3 relative z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold shadow-xs">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>{language === 'hi' ? 'कक्षा 1 से 8 विद्यार्थी व अभिभावक आसान मार्गदर्शिका' : 'Class 1 to 8 Students & Parents Easy Guide'}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
          {language === 'hi' ? (
            <span>कहाँ पर <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-600">क्या मिलेगा?</span> आसान गाइड</span>
          ) : (
            <span>Where to Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-600">What?</span> Easy Guide</span>
          )}
        </h2>

        <p className="text-xs sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {language === 'hi' 
            ? 'अपनी आवश्यकता चुनें और सीधे 1-क्लिक में सही पेज पर पहुंचें — किताबें, आज का भोजन, छुट्टियां, शिक्षक या रिजल्ट!'
            : 'Select your requirement and jump directly with 1-click — Books, Today\'s MDM lunch, holidays, teachers, or results!'}
        </p>

        {/* Quick Search / Filter Input */}
        <div className="pt-2 max-w-xl mx-auto">
          <div className="relative">
            <Search className="w-5 h-5 text-amber-600 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'आप क्या ढूंढ रहे हैं? (उदा. खाना, किताब, छुट्टी, ड्रेस, रिजल्ट, सर...)' : 'What are you looking for? (e.g. food, books, holiday, uniform, marks...)'}
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border-2 border-amber-300/80 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 text-slate-900 text-xs sm:text-sm font-medium shadow-sm transition-all outline-none"
              id="guide-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 bg-slate-100 rounded-md"
              >
                ✕
              </button>
            )}
          </div>
        </div>

      </div>

      {/* -------------------------------------------------------------
          2. CLASS 1 TO 8 ONE-TAP DIRECT ACCESS ROW
          ------------------------------------------------------------- */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-amber-200 shadow-sm space-y-3 relative z-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              {language === 'hi' ? 'अपनी कक्षा चुनें (Select Your Class 1 to 8):' : 'Select Your Class (1 to 8):'}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-amber-700">
            {language === 'hi' ? 'कक्षावार किताबें, विषय और टाइम-टेबल' : 'Classwise syllabus, books & timetable'}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((classNum) => {
            const isPrimary = classNum <= 5;
            return (
              <button
                key={classNum}
                onClick={() => handleQuickClassClick(classNum)}
                className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer transform hover:-translate-y-1 active:scale-95 shadow-xs border-2 ${
                  isPrimary
                    ? 'bg-gradient-to-b from-amber-50 to-orange-50 border-amber-200 hover:border-amber-400 hover:bg-amber-100 text-amber-950'
                    : 'bg-gradient-to-b from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100 text-blue-950'
                }`}
                title={`Class ${classNum} Books & Syllabus`}
                id={`btn-guide-class-${classNum}`}
              >
                <span className="text-xs sm:text-sm font-black">
                  {language === 'hi' ? `कक्षा ${classNum}` : `Class ${classNum}`}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-bold mt-0.5 px-1.5 py-0.2 rounded-full ${
                  isPrimary ? 'bg-amber-200/80 text-amber-900' : 'bg-blue-200/80 text-blue-900'
                }`}>
                  {isPrimary ? (language === 'hi' ? 'प्राथमिक' : 'Primary') : (language === 'hi' ? 'उच्च प्रा.' : 'Upper')}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* -------------------------------------------------------------
          3. TODAY'S MDM LUNCH CALLOUT (LIVE & ATTRACTIVE)
          ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-inner border border-white/30">
              {todayMenu.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full text-amber-100 border border-white/30">
                  {language === 'hi' ? `आज का भोजन (${todayNameHi})` : `Today's Menu (${todayNameEn})`}
                </span>
                <span className="text-xs font-bold text-amber-100">
                  {todayMenu.highlight}
                </span>
              </div>
              <p className="text-base sm:text-lg font-black text-white mt-1">
                {language === 'hi' ? todayMenu.menuHi : todayMenu.menuEn}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('schemes')}
            className="px-4 py-2 rounded-xl bg-white text-gov-navy-950 font-black text-xs hover:bg-amber-50 transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer self-stretch sm:self-auto justify-center"
            id="btn-guide-mdm-full"
          >
            <span>{language === 'hi' ? 'साप्ताहिक मेन्यू चार्ट' : 'Weekly Menu Chart'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-gov-navy-950" />
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          4. 8 EASY QUESTION DIRECTORY CARDS (GRID VIEW)
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 relative z-10">
        
        {filteredCards.map((card) => {
          const IconComp = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="bg-white rounded-2xl sm:rounded-3xl p-5 border-2 border-slate-200/90 hover:border-amber-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
              id={`guide-card-${card.id}`}
            >
              {/* Top Accent Gradient Bar on Hover */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${card.bgGradient} absolute top-0 left-0 opacity-80 group-hover:opacity-100 transition-opacity`} />

              <div className="space-y-3 pt-1">
                
                {/* Badge & Icon Header */}
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.bgGradient} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${card.badgeBg}`}>
                    {language === 'hi' ? card.tagHi : card.tagEn}
                  </span>
                </div>

                {/* Friendly Question Header */}
                <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                  {language === 'hi' ? card.questionHi : card.questionEn}
                </h3>

                {/* Clear Answer / Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {language === 'hi' ? card.descHi : card.descEn}
                </p>

              </div>

              {/* Action Button Strip */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-amber-700 group-hover:text-amber-800 flex items-center gap-1.5">
                  <span>{language === 'hi' ? card.actionLabelHi : card.actionLabelEn}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {language === 'hi' ? 'सीधे जाएं' : 'Jump Now'}
                </span>
              </div>

            </div>
          );
        })}

      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-10 bg-white rounded-3xl border border-slate-200">
          <p className="text-sm font-bold text-slate-600">
            {language === 'hi' ? 'कोई परिणाम नहीं मिला। कृपया दूसरा शब्द खोजें।' : 'No matching results. Try searching something else.'}
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
          >
            {language === 'hi' ? 'सभी देखें' : 'View All'}
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------
          5. QUICK STUDENT & PARENT FAQ (SIMPLE ANSWERS)
          ------------------------------------------------------------- */}
      <div className="bg-slate-50/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 space-y-4">
        
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            {language === 'hi' ? 'अक्सर पूछे जाने वाले ज़रूरी सवाल (Quick Help FAQ)' : 'Frequently Asked Questions (Quick Help FAQ)'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
            <div className="font-black text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'hi' ? 'क्या स्कूल में कोई फीस लगती है?' : 'Is there any school tuition fee?'}</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed pl-5.5">
              {language === 'hi' 
                ? 'बिल्कुल नहीं! कक्षा 1 से 8 तक सभी बच्चों के लिए शिक्षा, पुस्तकें, मिड-डे मील भोजन और ड्रेस अनुदान 100% निःशुल्क है।'
                : 'No! Under RTE Act, education, SCERT books, Mid-Day Meal and ₹1200 DBT uniform grant are 100% free.'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
            <div className="font-black text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{language === 'hi' ? 'स्कूल का समय क्या है?' : 'What are the school operational hours?'}</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed pl-5.5">
              {language === 'hi' 
                ? 'ग्रीष्मकाल: सुबह 8:00 से दोपहर 2:00 बजे तक। शीतकाल: सुबह 9:00 से दोपहर 3:00 बजे तक (सोमवार से शनिवार)।'
                : 'Summer: 8:00 AM – 2:00 PM. Winter: 9:00 AM – 3:00 PM (Monday to Saturday).'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
            <div className="font-black text-slate-900 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{language === 'hi' ? '₹1200 DBT कैसे मिलते हैं?' : 'How to receive ₹1200 DBT?'}</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed pl-5.5">
              {language === 'hi' 
                ? 'माता/पिता का बैंक खाता आधार से लिंक (Aadhaar Seeded) होना चाहिए। धनराशि सीधे प्रेरणा पोर्टल से खाते में आती है।'
                : 'Parent bank account must be Aadhaar seeded. Funds are directly transferred via UP Prerna Portal.'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
            <div className="font-black text-slate-900 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{language === 'hi' ? 'टीचर या प्रधानाध्यापक से बात कैसे करें?' : 'How to contact Headmaster/Teachers?'}</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed pl-5.5">
              {language === 'hi' 
                ? 'संपर्क पेज पर जाएं या स्कूल समय में विद्यालय कार्यालय में आकर सीधे मिल सकते हैं।'
                : 'Visit the Contact page or visit the school office during working hours.'}
            </p>
          </div>

        </div>

      </div>

    </section>
  );
};
