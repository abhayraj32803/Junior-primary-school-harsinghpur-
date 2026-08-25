import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  GraduationCap, 
  BookOpen, 
  Gift, 
  Utensils, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  LogIn, 
  Award, 
  FileText, 
  HeartHandshake, 
  Users, 
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

interface StudentsPageProps {
  onNavigate: (page: string) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({ onNavigate }) => {
  const { settings, language, students } = useSchool();

  const welfareBenefits = [
    {
      titleHi: 'नि:शुल्क प्रवेश (RTE 2009)',
      titleEn: '100% Free Admission (RTE Act 2009)',
      descHi: 'कक्षा 1 से 8 तक किसी भी प्रकार का प्रवेश शुल्क, शिक्षण शुल्क या परीक्षा शुल्क नहीं लिया जाता।',
      descEn: 'Zero fee policy for Classes 1 to 8 covering registration, tuition, and examination fees.',
      icon: GraduationCap,
      color: 'amber',
      link: 'admission'
    },
    {
      titleHi: 'नि:शुल्क पाठ्यपुस्तकें व कार्यपुस्तिकाएं',
      titleEn: 'Free Textbooks & Workbooks',
      descHi: 'बेसिक शिक्षा परिषद द्वारा प्रत्येक नामांकित छात्र को सभी विषयों की रंगीन पाठ्यपुस्तकें व अभ्यास पुस्तिकाएं निःशुल्क।',
      descEn: 'Free government curriculum textbooks and FLN practice workbooks distributed at session start.',
      icon: BookOpen,
      color: 'blue',
      link: 'classes'
    },
    {
      titleHi: '₹1200 डायरेक्ट बेनिफिट ट्रांसफर (DBT)',
      titleEn: '₹1200 Direct Benefit Transfer (DBT)',
      descHi: 'दो जोड़ी यूनिफॉर्म, जूता-मोजा, स्कूल बैग एवं स्वेटर क्रय हेतु धनराशि सीधे माता/पिता के बैंक खाते में।',
      descEn: 'Direct transfer to parents Aadhaar-linked bank account for 2 uniform sets, shoes/socks, bag, and sweater.',
      icon: Gift,
      color: 'emerald',
      link: 'schemes'
    },
    {
      titleHi: 'पीएम पोषण (दैनिक मध्याह्न भोजन)',
      titleEn: 'PM-POSHAN (Mid-Day Meal)',
      descHi: 'साप्ताहिक मेन्यू अनुसार दैनिक गर्म व पौष्टिक भोजन, मौसमी फल एवं दूध वितरण शुद्ध व स्वच्छ परिवेश में।',
      descEn: 'Freshly cooked hot nutritious meals, seasonal fruits, and warm milk served following official weekly menu.',
      icon: Utensils,
      color: 'rose',
      link: 'facilities'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gov-amber-100 text-gov-amber-900 text-xs font-black uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-gov-amber-700" />
              <span>{language === 'hi' ? 'विद्यार्थी कॉर्नर • छात्र कल्याण' : 'Student Corner & Welfare'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {language === 'hi' ? 'छात्र हितलाभ एवं पोर्टल सेवाएं' : 'Student Services & Welfare Benefits'}
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {language === 'hi'
                ? 'शासकीय प्राथमिक व उच्च प्राथमिक विद्यालय में नामांकित प्रत्येक बच्चे को 100% निशुल्क शिक्षा, पुस्तकें, मध्याह्न भोजन, डीबीटी छात्रवृत्ति एवं डिजिटल प्रगति पत्र की सुविधा उपलब्ध है।'
                : 'Empowering every enrolled rural child with 100% free quality education, state textbooks, nutritious midday meals, DBT financial support, and student portal access.'}
            </p>
          </div>

          <div className="lg:col-span-4 bg-gov-navy-950 p-6 rounded-3xl text-white border border-gov-navy-800 space-y-4">
            <div>
              <div className="text-xs font-bold text-gov-amber-400 uppercase">
                {language === 'hi' ? 'छात्र/अभिभावक लॉगिन' : 'Student / Parent Portal'}
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">
                {language === 'hi' ? 'ऑनलाइन उपस्थिति व प्रगति पत्र' : 'Attendance & Progress Card'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'hi' ? 'अपने छात्र SR नंबर या रोल नंबर से सीधे लॉगिन करें।' : 'Login with Student SR number or Roll number to view records.'}
              </p>
            </div>

            <button
              onClick={() => onNavigate('login-student')}
              className="w-full py-3 px-4 rounded-xl bg-gov-amber-500 hover:bg-gov-amber-400 text-gov-navy-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'hi' ? 'छात्र पोर्टल में प्रवेश करें' : 'Login to Student Portal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Welfare Entitlements */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {language === 'hi' ? 'छात्रों हेतु शासन द्वारा प्रदत्त सुविधाएं' : 'Government Welfare Entitlements'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'hi' ? 'उत्तर प्रदेश शासन एवं समग्र शिक्षा अभियान द्वारा प्रदत्त शत-प्रतिशत निःशुल्क लाभ' : 'All state entitlements provided to students with zero fees'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {welfareBenefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-gov-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-gov-amber-500/10 text-gov-amber-700 flex items-center justify-center font-bold">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {language === 'hi' ? item.titleHi : item.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {language === 'hi' ? item.descHi : item.descEn}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    100% Free
                  </span>
                  <button
                    onClick={() => onNavigate(item.link)}
                    className="text-xs font-bold text-gov-amber-800 hover:text-gov-amber-950 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{language === 'hi' ? 'अधिक जानकारी' : 'Learn More'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Rules & Timings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-base">
            {language === 'hi' ? 'समय पालन एवं प्रार्थना सभा' : 'School Timings & Assembly'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'विद्यालय प्रातः 08:30 बजे से 03:00 बजे तक संचालित होता है। प्रातः 08:30 बजे अनिवार्य प्रार्थना सभा, राष्ट्रगान व योग सत्र।'
              : 'School operates from 08:30 AM to 03:00 PM. Morning assembly, National Anthem, and yoga at 08:30 AM sharp.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-base">
            {language === 'hi' ? 'नियमित उपस्थिति (80%+)' : 'Regular Attendance (80%+)'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'उत्कृष्ट अधिगम व परीक्षा पात्रता हेतु कम से कम 80% उपस्थिति अनिवार्य है। अनुपस्थिति की सूचना समय पर दें।'
              : 'Minimum 80% attendance is expected for academic continuity and full benefit of state welfare schemes.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-base">
            {language === 'hi' ? 'स्वच्छता व विद्यालयी गणवेश' : 'Uniform & Hygiene Standards'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'प्रतिदिन स्वच्छ निर्धारित गणवेश (Uniform) व जूतों में उपस्थित हों। भोजन से पूर्व साबुन से हाथ अवश्य धोएं।'
              : 'Students must attend in clean official uniform and shoes. Handwashing with soap before MDM is compulsory.'}
          </p>
        </div>

      </div>

      {/* Quick Navigation Links */}
      <div className="bg-slate-100 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 border border-slate-200">
        <div className="space-y-0.5">
          <h4 className="font-black text-slate-900 text-base">
            {language === 'hi' ? 'अन्य उपयोगी शैक्षणिक प्रपत्र' : 'Other Academic Resources'}
          </h4>
          <p className="text-xs text-slate-500">
            {language === 'hi' ? 'पाठ्यक्रम, समय सारणी, अवकाश तालिका एवं प्रवेश प्रपत्र' : 'Curriculum, timetable, holiday calendar and forms'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('classes')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs border border-slate-300 transition-colors cursor-pointer"
          >
            {language === 'hi' ? 'कक्षाएं व विषय' : 'Classes & Subjects'}
          </button>
          <button
            onClick={() => onNavigate('documents')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs border border-slate-300 transition-colors cursor-pointer"
          >
            {language === 'hi' ? 'अवकाश तालिका' : 'Holiday List'}
          </button>
          <button
            onClick={() => onNavigate('activities')}
            className="px-4 py-2.5 rounded-xl bg-gov-amber-500 hover:bg-gov-amber-400 text-gov-navy-950 font-black text-xs transition-colors cursor-pointer"
          >
            {language === 'hi' ? 'छात्र गतिविधियां' : 'Student Activities'}
          </button>
        </div>
      </div>

    </div>
  );
};
