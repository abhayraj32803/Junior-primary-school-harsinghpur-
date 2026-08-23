import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Gift, 
  Utensils, 
  BookOpen, 
  CreditCard, 
  Award, 
  HeartHandshake, 
  GraduationCap, 
  CheckCircle2, 
  Info, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const GovernmentSchemesPage: React.FC = () => {
  const { governmentSchemes, language } = useSchool();

  const mdmMenu = [
    { dayHi: 'सोमवार', dayEn: 'Monday', menuHi: 'रोटी, दाल (सोयाबीन/सब्जी युक्त), ताजा फल', menuEn: 'Roti, Dal with vegetables/soybean, Fresh Fruit' },
    { dayHi: 'मंगलवार', dayEn: 'Tuesday', menuHi: 'चावल, राजमा / चना दाल एवं सब्जी', menuEn: 'Rice, Rajma / Chana Dal & Vegetable' },
    { dayHi: 'बुधवार', dayEn: 'Wednesday', menuHi: 'रोटी, मौसमी हरी सब्जी, गर्म दूध', menuEn: 'Roti, Seasonal Green Vegetables, Warm Milk' },
    { dayHi: 'गुरुवार', dayEn: 'Thursday', menuHi: 'चावल, कढ़ी-पकौड़ा / दाल एवं सब्जी', menuEn: 'Rice, Kadhi-Pakoda / Dal & Veg' },
    { dayHi: 'शुक्रवार', dayEn: 'Friday', menuHi: 'रोटी, सोयाबीन-आलू की सब्जी, दाल', menuEn: 'Roti, Soybean-Potato Sabzi, Dal' },
    { dayHi: 'शनिवार', dayEn: 'Saturday', menuHi: 'चावल, तहरी (सब्जीयुक्त) एवं उबला अंडा / फल', menuEn: 'Rice, Veg Tehri & Boiled Egg / Fruit' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 sm:space-y-12 overflow-x-hidden">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <Gift className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'hi' ? 'उत्तर प्रदेश शासन एवं समग्र शिक्षा अभियान' : 'Govt. of UP & Samagra Shiksha Initiatives'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {language === 'hi' ? 'शासकीय छात्र कल्याण योजनाएं' : 'Government Welfare Schemes & Benefits'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {language === 'hi'
            ? 'परिषदीय विद्यालयों में अध्ययनरत कक्षा 1 से 8 तक के सभी विद्यार्थियों हेतु निःशुल्क शिक्षा, पोषण, वर्दी अनुदान एवं छात्रवृत्ति योजनाओं का संपूर्ण विवरण।'
            : 'Explore complete information on 100% free educational materials, Direct Benefit Transfer (DBT) grants, PM POSHAN midday meals, and scholarship assistance.'}
        </p>
      </div>

      {/* DBT ₹1200 Special Feature Card */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              {language === 'hi' ? 'डीबीटी प्रत्यक्ष लाभ अंतरण' : 'Direct Benefit Transfer (DBT)'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white pt-2">
              {language === 'hi' ? 'यूनिफॉर्म, जूता-मोजा, बैग एवं स्वेटर हेतु ₹1200 प्रति छात्र' : '₹1200 DBT Grant for Uniform, Bag, Shoes & Sweater'}
            </h2>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-black text-emerald-400">₹1,200</div>
            <div className="text-xs text-slate-400 font-medium">{language === 'hi' ? 'प्रति छात्र अभिभावक खाते में' : 'Per Child to Parent Bank Account'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
            <div className="font-bold text-amber-300">2 Sets Uniform</div>
            <div className="text-slate-300">{language === 'hi' ? '2 जोड़ी स्कूल ड्रेस सिलाई सहित (₹600)' : '2 Sets School Uniforms (₹600)'}</div>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
            <div className="font-bold text-amber-300">School Bag</div>
            <div className="text-slate-300">{language === 'hi' ? 'मजबूत आकर्षक स्कूल बस्ता (₹175)' : 'Quality Ergonomic School Bag (₹175)'}</div>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
            <div className="font-bold text-amber-300">Shoes & 2 Pairs Socks</div>
            <div className="text-slate-300">{language === 'hi' ? 'काले जूते व 2 जोड़ी मोजे (₹125)' : 'Black School Shoes + 2 Pairs Socks (₹125)'}</div>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
            <div className="font-bold text-amber-300">Warm Winter Sweater</div>
            <div className="text-slate-300">{language === 'hi' ? 'शीतकालीन गर्म स्वेटर (₹200)' : 'Winter Knit Sweater (₹200)'}</div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            {language === 'hi'
              ? 'पात्रता शर्त: छात्र-छात्रा का विद्यालय में आधार प्रमाणीकरण एवं माता/पिता का बैंक खाता आधार सीडेड (Aadhaar Seeded & NPCI Active) होना अनिवार्य है।'
              : 'Eligibility: Student must have completed Aadhaar verification on Prerna portal and parents must have an active Aadhaar-seeded bank account.'}
          </span>
        </div>
      </div>

      {/* Government Schemes Detailed List */}
      <div className="space-y-6">
        <div className="text-left">
          <h2 className="text-2xl font-black text-slate-900">
            {language === 'hi' ? 'समस्त शासकीय छात्रवृत्ति एवं कल्याण योजनाएं' : 'All Welfare & Academic Incentive Schemes'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {governmentSchemes.map((scheme) => (
            <div 
              key={scheme.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900">
                    {language === 'hi' ? scheme.categoryHi : scheme.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {language === 'hi' ? scheme.benefitHi : scheme.benefit}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900">
                  {language === 'hi' ? scheme.nameHi : scheme.nameEn}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {language === 'hi' ? scheme.descriptionHi : scheme.descriptionEn}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 shrink-0">{language === 'hi' ? 'पात्रता:' : 'Eligibility:'}</span>
                  <span className="text-slate-600">{language === 'hi' ? scheme.eligibilityHi : scheme.eligibilityEn}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 shrink-0">{language === 'hi' ? 'प्रक्रिया:' : 'Process:'}</span>
                  <span className="text-slate-600">{language === 'hi' ? scheme.processHi : scheme.processEn}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PM POSHAN Weekly Menu Schedule */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {language === 'hi' ? 'पीएम पोषण (मध्याह्न भोजन) साप्ताहिक मेन्यू तालिका' : 'PM POSHAN Weekly Nutritional Menu Table'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'hi' ? 'बेसिक शिक्षा परिषद द्वारा निर्धारित मानक अनुसार' : 'As prescribed by UP Basic Shiksha Parishad guidelines'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {mdmMenu.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-black text-amber-700 uppercase">
                {language === 'hi' ? item.dayHi : item.dayEn}
              </div>
              <div className="text-xs font-semibold text-slate-800">
                {language === 'hi' ? item.menuHi : item.menuEn}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
