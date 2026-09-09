import React from 'react';
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
  ArrowRight, 
  HelpCircle
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
  const { language, classes } = useSchool();

  // Dynamic Day of the Week for Today's MDM Menu
  const daysHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayIndex = new Date().getDay();
  const todayNameHi = daysHi[currentDayIndex];
  const todayNameEn = daysEn[currentDayIndex];

  const mdmSchedule: Record<number, { menuHi: string; menuEn: string; icon: string; highlight: string }> = {
    1: { menuHi: 'रोटी, दाल (सोयाबीन/सब्जी युक्त), ताजा मौसमी फल', menuEn: 'Roti, Dal with Veg/Soybean, Fresh Fruit', icon: '🍎', highlight: 'सोमवार: फल वितरण' },
    2: { menuHi: 'चावल, राजमा / चना दाल एवं सब्जी', menuEn: 'Rice, Rajma / Chana Dal & Fresh Veg', icon: '🍛', highlight: 'मंगलवार: दाल व सब्जी' },
    3: { menuHi: 'रोटी, मौसमी हरी सब्जी, 150ml गर्म ताजा दूध', menuEn: 'Roti, Seasonal Veg, 150ml Warm Milk', icon: '🥛', highlight: 'बुधवार: गर्म दूध दिवस' },
    4: { menuHi: 'चावल, कढ़ी-पकौड़ा / दाल एवं सब्जी', menuEn: 'Rice, Kadhi-Pakoda / Dal & Veg', icon: '🍲', highlight: 'गुरुवार: कढ़ी-चावल' },
    5: { menuHi: 'रोटी, सोयाबीन-आलू की सब्जी, दाल', menuEn: 'Roti, Soybean-Potato Sabzi, Dal', icon: '🥗', highlight: 'शुक्रवार: प्रोटीन युक्त आहार' },
    6: { menuHi: 'चावल, सब्जीयुक्त पौष्टिक तहरी एवं फल', menuEn: 'Veggie Tehri & Fresh Fruit', icon: '🍳', highlight: 'शनिवार: विशेष तहरी' },
    0: { menuHi: 'रविवार अवकाश (कल सोमवार को फल व दाल-रोटी)', menuEn: 'Sunday Holiday (Fresh fruit & meal tomorrow)', icon: '☀️', highlight: 'साप्ताहिक अवकाश' }
  };

  const todayMenu = mdmSchedule[currentDayIndex];

  // Core Directory Items
  const guideCards = [
    {
      id: 'mdm',
      icon: Utensils,
      bgGradient: 'from-amber-500 to-orange-500',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      tagHi: 'मध्याह्न भोजन',
      tagEn: 'Mid-Day Meal',
      titleHi: 'आज का भोजन (MDM)',
      titleEn: "Today's Meal",
      descHi: `${todayNameHi}: ${todayMenu.menuHi}`,
      descEn: `${todayNameEn}: ${todayMenu.menuEn}`,
      actionLabelHi: 'मेन्यू देखें',
      actionLabelEn: 'View Menu',
      targetPage: 'schemes'
    },
    {
      id: 'classes',
      icon: BookOpen,
      bgGradient: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      tagHi: 'पाठ्यक्रम',
      tagEn: 'Curriculum',
      titleHi: 'कक्षा 1 से 8 पुस्तकें व विषय',
      titleEn: 'Classes 1–8 Books & Subjects',
      descHi: 'एससीईआरटी (SCERT) पाठ्यपुस्तकें एवं विषय सूची',
      descEn: 'Prescribed textbooks & subject syllabus',
      actionLabelHi: 'किताबें देखें',
      actionLabelEn: 'View Books',
      targetPage: 'classes'
    },
    {
      id: 'schemes',
      icon: Gift,
      bgGradient: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      tagHi: 'डीबीटी सहायता',
      tagEn: 'DBT Grants',
      titleHi: '₹1200 DBT व सरकारी लाभ',
      titleEn: '₹1200 DBT & Benefits',
      descHi: 'यूनिफॉर्म, बैग, जूते-मोज़े व स्वेटर अनुदान',
      descEn: 'Direct grant for uniform, bag & shoes',
      actionLabelHi: 'लाभ देखें',
      actionLabelEn: 'View Benefits',
      targetPage: 'schemes'
    },
    {
      id: 'notices',
      icon: Bell,
      bgGradient: 'from-rose-600 to-red-600',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      tagHi: 'सूचनाएं',
      tagEn: 'Notices',
      titleHi: 'अवकाश एवं सूचना पट्ट',
      titleEn: 'Holidays & Notices',
      descHi: 'नवीनतम शासकीय अवकाश व परीक्षा समय-सारिणी',
      descEn: 'Official holiday lists & exam timetable',
      actionLabelHi: 'नोटिस देखें',
      actionLabelEn: 'View Notices',
      targetPage: 'notices'
    },
    {
      id: 'faculty',
      icon: Users,
      bgGradient: 'from-purple-600 to-violet-600',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      tagHi: 'स्टाफ',
      tagEn: 'Staff',
      titleHi: 'शिक्षक वृंद',
      titleEn: 'Teachers & Faculty',
      descHi: 'प्रधानाध्यापिका एवं समस्त शिक्षक विवरण',
      descEn: 'Certified teaching faculty profiles',
      actionLabelHi: 'सूची देखें',
      actionLabelEn: 'View Faculty',
      targetPage: 'faculty'
    },
    {
      id: 'admission',
      icon: GraduationCap,
      bgGradient: 'from-amber-600 to-yellow-600',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      tagHi: 'नि:शुल्क दाखिला',
      tagEn: 'Free Admission',
      titleHi: 'शत-प्रतिशत नि:शुल्क प्रवेश',
      titleEn: '100% Free Admission',
      descHi: 'कक्षा 1 से 8 में बिना किसी शुल्क के सीधा दाखिला',
      descEn: 'Zero fee enrollment under RTE Act',
      actionLabelHi: 'प्रवेश नियम',
      actionLabelEn: 'Admission Info',
      targetPage: 'admission'
    },
    {
      id: 'activities',
      icon: Sparkles,
      bgGradient: 'from-pink-600 to-rose-500',
      badgeBg: 'bg-pink-100 text-pink-900 border-pink-300',
      tagHi: 'गतिविधियां',
      tagEn: 'Activities',
      titleHi: 'खेलकूद व फोटो गैलरी',
      titleEn: 'Sports & Gallery',
      descHi: 'योगाभ्यास, बाल सभा व सांस्कृतिक कार्यक्रम',
      descEn: 'Morning assembly, Yoga, events & photos',
      actionLabelHi: 'गैलरी देखें',
      actionLabelEn: 'View Gallery',
      targetPage: 'gallery'
    },
    {
      id: 'login',
      icon: LogIn,
      bgGradient: 'from-slate-800 to-slate-950',
      badgeBg: 'bg-slate-200 text-slate-900 border-slate-300',
      tagHi: 'पोर्टल',
      tagEn: 'Portal',
      titleHi: 'विद्यार्थी पोर्टल लॉगिन',
      titleEn: 'Student Portal Login',
      descHi: 'मासिक परीक्षा अंक, रिजल्ट व उपस्थिति',
      descEn: 'Check exam marks, report cards & ID card',
      actionLabelHi: 'लॉगिन करें',
      actionLabelEn: 'Login',
      targetPage: 'login',
      isLogin: true
    },
    {
      id: 'contact',
      icon: Phone,
      bgGradient: 'from-cyan-600 to-blue-700',
      badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      tagHi: 'संपर्क',
      tagEn: 'Contact',
      titleHi: 'विद्यालय संपर्क व पता',
      titleEn: 'School Contact & Help',
      descHi: 'फोन नंबर, गूगल मैप्स व कार्यालय समय',
      descEn: 'Helpline phone, GPS location & visiting hours',
      actionLabelHi: 'संपर्क करें',
      actionLabelEn: 'Contact',
      targetPage: 'contact'
    }
  ];

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
      className="bg-gradient-to-b from-amber-50/40 via-white to-slate-50/40 rounded-3xl p-5 sm:p-8 border border-amber-200/70 shadow-sm relative overflow-hidden space-y-6 sm:space-y-8"
    >
      {/* 1. Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-300 text-amber-900 text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'hi' ? 'त्वरित मार्गदर्शिका' : 'Quick Guide'}</span>
        </div>

        <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {language === 'hi' ? 'छात्र एवं अभिभावक सेवा डायरेक्टरी' : 'Student & Parent Quick Directory'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {language === 'hi' 
            ? 'अपनी कक्षा, आज का भोजन, पाठ्यक्रम, योजनाएं या विद्यालय की जानकारी 1-क्लिक में देखें।'
            : 'Access class syllabus, today\'s MDM lunch, welfare schemes, and school information directly.'}
        </p>
      </div>

      {/* 2. Class 1 to 8 Direct Access */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span className="text-xs sm:text-sm font-black text-slate-900">
              {language === 'hi' ? 'अपनी कक्षा चुनें (कक्षा 1 से 8)' : 'Select Your Class (1 to 8)'}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-amber-700">
            {language === 'hi' ? 'किताबें व विषय' : 'Books & Syllabus'}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((classNum) => {
            const isPrimary = classNum <= 5;
            return (
              <button
                key={classNum}
                onClick={() => handleQuickClassClick(classNum)}
                className={`py-2.5 px-1.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95 border ${
                  isPrimary
                    ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400 hover:bg-amber-100 text-amber-950'
                    : 'bg-blue-50/60 border-blue-200 hover:border-blue-400 hover:bg-blue-100 text-blue-950'
                }`}
                title={`Class ${classNum}`}
                id={`btn-guide-class-${classNum}`}
              >
                <span className="text-xs sm:text-sm font-black">
                  {language === 'hi' ? `कक्षा ${classNum}` : `Class ${classNum}`}
                </span>
                <span className={`text-[9px] font-bold mt-0.5 px-1.5 rounded-full ${
                  isPrimary ? 'bg-amber-200/70 text-amber-900' : 'bg-blue-200/70 text-blue-900'
                }`}>
                  {isPrimary ? (language === 'hi' ? 'प्राथमिक' : 'Primary') : (language === 'hi' ? 'उच्च प्रा.' : 'Upper')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Today's MDM Lunch Callout */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0 border border-white/30">
              {todayMenu.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                  {language === 'hi' ? `आज का भोजन (${todayNameHi})` : `Today's Meal (${todayNameEn})`}
                </span>
                <span className="text-[11px] font-bold text-amber-100">
                  {todayMenu.highlight}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-black text-white mt-0.5">
                {language === 'hi' ? todayMenu.menuHi : todayMenu.menuEn}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('schemes')}
            className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-amber-50 transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer self-stretch sm:self-auto justify-center"
            id="btn-guide-mdm-full"
          >
            <span>{language === 'hi' ? 'पूरा मेन्यू' : 'Full Menu'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Streamlined 9 Quick Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {guideCards.map((card) => {
          const IconComp = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              id={`guide-card-${card.id}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.bgGradient} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    <IconComp className="w-4.5 h-4.5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeBg}`}>
                    {language === 'hi' ? card.tagHi : card.tagEn}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                  {language === 'hi' ? card.titleHi : card.titleEn}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {language === 'hi' ? card.descHi : card.descEn}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-800">
                <span>{language === 'hi' ? card.actionLabelHi : card.actionLabelEn}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
