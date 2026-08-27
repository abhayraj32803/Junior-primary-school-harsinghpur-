import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Heart, 
  ExternalLink, 
  AlertCircle, 
  PhoneCall,
  CheckCircle2,
  HelpCircle,
  FolderOpen,
  HelpCircle as QuestionIcon,
  LogIn,
  GraduationCap,
  BookOpen,
  Users,
  Building2,
  FileText,
  Globe
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface PublicFooterProps {
  onNavigate: (page: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  const { settings, language } = useSchool();

  const currentDate = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <footer className="w-full max-w-full overflow-x-hidden bg-gov-navy-950 text-slate-300 pt-8 sm:pt-12 pb-8 border-t-4 border-gov-amber-500">
      
      {/* Top Banner Accent: Government & RTE Guarantee with Mobile-Friendly Wrapping */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-6 sm:pb-8 mb-6 sm:mb-8 border-b border-gov-navy-850">
        <div className="bg-gov-navy-900/90 rounded-2xl p-4 sm:p-6 border border-gov-navy-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gov-amber-500 text-gov-navy-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <School className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gov-amber-400 truncate">
                {language === 'hi' ? 'शासकीय कंपोजिट विद्यालय (कक्षा 1 से 8)' : 'Government Composite JHS (Classes 1–8)'}
              </div>
              <div className="text-sm sm:text-lg font-black text-white leading-snug">
                {language === 'hi' ? settings.schoolNameHi : settings.schoolName}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-2">
            <div className="inline-flex items-center justify-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-gov-navy-950 border border-gov-navy-700 text-xs text-gov-amber-300 font-mono font-bold">
              <ShieldCheck className="w-4 h-4 text-gov-amber-400 shrink-0" />
              <span>UDISE: {settings.schoolCode}</span>
            </div>
            <button
              onClick={() => onNavigate('admission')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 touch-manipulation active:scale-[0.98]"
            >
              <GraduationCap className="w-4 h-4 text-emerald-200" />
              <span>{language === 'hi' ? 'नि:शुल्क प्रवेश 2024-25' : 'Free Admissions 2024-25'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* 4 Main IIT Delhi Style Footer Columns with Fluid Stacking */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pb-8 border-b border-gov-navy-850">
          
          {/* Col 1: Institute Identity & Mission */}
          <div className="space-y-3.5 sm:space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gov-amber-400 border-b border-gov-navy-800 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gov-amber-400" />
              <span>{language === 'hi' ? 'संस्थान परिचय' : 'About Institute'}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'hi'
                ? 'कक्षा 1 से 8 तक के छात्र-छात्राओं को नि:शुल्क एवं गुणवत्तापूर्ण बुनियादी शिक्षा, निपुण भारत मिशन, पीएम पोषण तथा समग्र शिक्षा के अंतर्गत संवर्धित करने वाला परिषदीय संस्थान।'
                : 'Dedicated to providing quality elementary education from Class 1 to 8 under Basic Shiksha Parishad, Samagra Shiksha, and PM-POSHAN.'}
            </p>
            <div className="space-y-2 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2 text-slate-200">
                <ShieldCheck className="w-4 h-4 text-gov-amber-400 shrink-0" />
                <span className="font-semibold">{language === 'hi' ? 'प्रभारी प्रधानाध्यापिका: श्रीमती किरण शाक्य' : 'Head Teacher: Smt. Kiran Shakya'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'hi' ? '100% नि:शुल्क शिक्षा एवं पाठ्यपुस्तकें' : '100% Free Education & Books'}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Academic & Navigation Links with >=44px Touch Targets on Mobile */}
          <div className="space-y-3.5 sm:space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gov-amber-400 border-b border-gov-navy-800 pb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gov-amber-400" />
              <span>{language === 'hi' ? 'त्वरित लिंक एवं अनुभाग' : 'Quick Navigation'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
              <button 
                onClick={() => onNavigate('home')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-gov-navy-900/60 hover:bg-gov-navy-850 active:bg-gov-navy-800 text-slate-200 hover:text-gov-amber-300 transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-gov-navy-800/80 active:scale-[0.99]"
              >
                <span className="text-gov-amber-400 font-bold">•</span>
                <span>{language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
              </button>

              <button 
                onClick={() => onNavigate('about')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-gov-navy-900/60 hover:bg-gov-navy-850 active:bg-gov-navy-800 text-slate-200 hover:text-gov-amber-300 transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-gov-navy-800/80 active:scale-[0.99]"
              >
                <span className="text-gov-amber-400 font-bold">•</span>
                <span>{language === 'hi' ? 'परिचय व इतिहास' : 'About Us'}</span>
              </button>

              <button 
                onClick={() => onNavigate('classes')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-gov-navy-900/60 hover:bg-gov-navy-850 active:bg-gov-navy-800 text-slate-200 hover:text-gov-amber-300 transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-gov-navy-800/80 active:scale-[0.99]"
              >
                <span className="text-gov-amber-400 font-bold">•</span>
                <span>{language === 'hi' ? 'पाठ्यक्रम (1-8)' : 'Curriculum'}</span>
              </button>

              <button 
                onClick={() => onNavigate('faculty')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-gov-navy-900/60 hover:bg-gov-navy-850 active:bg-gov-navy-800 text-slate-200 hover:text-gov-amber-300 transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-gov-navy-800/80 active:scale-[0.99]"
              >
                <span className="text-gov-amber-400 font-bold">•</span>
                <span>{language === 'hi' ? 'शिक्षक पंजिका' : 'Faculty'}</span>
              </button>

              <button 
                onClick={() => onNavigate('admission')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-gov-navy-900/60 hover:bg-gov-navy-850 active:bg-gov-navy-800 text-slate-200 hover:text-gov-amber-300 transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-gov-navy-800/80 active:scale-[0.99]"
              >
                <span className="text-emerald-400 font-bold">•</span>
                <span>{language === 'hi' ? 'नि:शुल्क प्रवेश' : 'Admissions'}</span>
              </button>

              <button 
                onClick={() => onNavigate('schemes')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-gov-navy-900/60 hover:bg-gov-navy-850 active:bg-gov-navy-800 text-slate-200 hover:text-gov-amber-300 transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-gov-navy-800/80 active:scale-[0.99]"
              >
                <span className="text-gov-amber-400 font-bold">•</span>
                <span>{language === 'hi' ? 'योजनाएं व DBT' : 'Schemes'}</span>
              </button>

              <button 
                onClick={() => onNavigate('facilities')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-gov-navy-900/60 hover:bg-gov-navy-850 active:bg-gov-navy-800 text-slate-200 hover:text-gov-amber-300 transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-gov-navy-800/80 active:scale-[0.99]"
              >
                <span className="text-gov-amber-400 font-bold">•</span>
                <span>{language === 'hi' ? 'सुविधाएं' : 'Facilities'}</span>
              </button>

              <button 
                onClick={() => onNavigate('statistics')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-gov-navy-900/60 hover:bg-gov-navy-850 active:bg-gov-navy-800 text-slate-200 hover:text-gov-amber-300 transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-gov-navy-800/80 active:scale-[0.99]"
              >
                <span className="text-gov-amber-400 font-bold">•</span>
                <span>{language === 'hi' ? 'सांख्यिकी' : 'Statistics'}</span>
              </button>

              <button 
                onClick={() => onNavigate('notices')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-gov-navy-900/60 hover:bg-gov-navy-850 active:bg-gov-navy-800 text-slate-200 hover:text-gov-amber-300 transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-gov-navy-800/80 active:scale-[0.99]"
              >
                <span className="text-gov-amber-400 font-bold">•</span>
                <span>{language === 'hi' ? 'सूचना पट्ट' : 'Notices'}</span>
              </button>

              <button 
                onClick={() => onNavigate('gallery')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-gov-navy-900/60 hover:bg-gov-navy-850 active:bg-gov-navy-800 text-slate-200 hover:text-gov-amber-300 transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-gov-navy-800/80 active:scale-[0.99]"
              >
                <span className="text-gov-amber-400 font-bold">•</span>
                <span>{language === 'hi' ? 'फोटो व वीडियो' : 'Gallery'}</span>
              </button>

              <button 
                onClick={() => onNavigate('documents')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-gov-navy-900/60 hover:bg-gov-navy-850 active:bg-gov-navy-800 text-slate-200 hover:text-gov-amber-300 transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-gov-navy-800/80 active:scale-[0.99]"
              >
                <span className="text-gov-amber-400 font-bold">•</span>
                <span>{language === 'hi' ? 'प्रपत्र व कैलेंडर' : 'Documents'}</span>
              </button>

              <button 
                onClick={() => onNavigate('faq')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-gov-navy-900/60 hover:bg-gov-navy-850 active:bg-gov-navy-800 text-slate-200 hover:text-gov-amber-300 transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-gov-navy-800/80 active:scale-[0.99]"
              >
                <span className="text-gov-amber-400 font-bold">•</span>
                <span>{language === 'hi' ? 'प्रश्नोत्तरी (FAQ)' : 'FAQs'}</span>
              </button>

              <button 
                onClick={() => onNavigate('login-student')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-300 font-bold transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-amber-500/30 active:scale-[0.99]"
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{language === 'hi' ? 'छात्र लॉगिन' : 'Student Login'}</span>
              </button>

              <button 
                onClick={() => onNavigate('login-teacher')} 
                className="min-h-[44px] px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 active:bg-blue-500/30 text-blue-300 font-bold transition-all cursor-pointer text-left flex items-center gap-2 touch-manipulation border border-blue-500/30 active:scale-[0.99]"
              >
                <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{language === 'hi' ? 'शिक्षक लॉगिन' : 'Teacher Login'}</span>
              </button>
            </div>
          </div>

          {/* Col 3: Official Government Portals (External Links) with Large Touch Targets */}
          <div className="space-y-3.5 sm:space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gov-amber-400 border-b border-gov-navy-800 pb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gov-amber-400" />
              <span>{language === 'hi' ? 'महत्वपूर्ण शासकीय पोर्टल' : 'Official Portals'}</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <a 
                href="https://udiseplus.gov.in" 
                target="_blank" 
                rel="noreferrer"
                className="min-h-[50px] flex flex-col justify-center p-3 rounded-xl bg-gov-navy-900 border border-gov-navy-800 hover:border-gov-amber-500/50 active:bg-gov-navy-850 transition-all touch-manipulation block"
              >
                <div className="font-semibold text-slate-200 flex items-center justify-between text-xs">
                  <span>UDISE+ National Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gov-amber-400 shrink-0" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Code: 09290205902
                </div>
              </a>

              <a 
                href="http://basiceducation.up.gov.in/" 
                target="_blank" 
                rel="noreferrer"
                className="min-h-[50px] flex flex-col justify-center p-3 rounded-xl bg-gov-navy-900 border border-gov-navy-800 hover:border-gov-amber-500/50 active:bg-gov-navy-850 transition-all touch-manipulation block"
              >
                <div className="font-semibold text-slate-200 flex items-center justify-between text-xs">
                  <span>बेसिक शिक्षा परिषद, उ.प्र.</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gov-amber-400 shrink-0" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  basiceducation.up.gov.in
                </div>
              </a>

              <a 
                href="https://prernaup.in" 
                target="_blank" 
                rel="noreferrer"
                className="min-h-[50px] flex flex-col justify-center p-3 rounded-xl bg-gov-navy-900 border border-gov-navy-800 hover:border-gov-amber-500/50 active:bg-gov-navy-850 transition-all touch-manipulation block"
              >
                <div className="font-semibold text-slate-200 flex items-center justify-between text-xs">
                  <span>मिशन प्रेरणा (DBT पोर्टल)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gov-amber-400 shrink-0" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  prernaup.in
                </div>
              </a>
            </div>
          </div>

          {/* Col 4: Location, Hours & Emergency Helplines with Touch-Friendly Helpline Badges */}
          <div className="space-y-3.5 sm:space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gov-amber-400 border-b border-gov-navy-800 pb-2 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-gov-amber-400" />
              <span>{language === 'hi' ? 'स्थान व हेल्पलाइन' : 'Contact & Helplines'}</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 bg-gov-navy-900/50 p-2.5 rounded-xl border border-gov-navy-800">
                <MapPin className="w-4 h-4 text-gov-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {language === 'hi'
                    ? `ग्राम: ${settings.villageHi || 'हरसिंहपुर गोवा'}, विकास खंड: ${settings.blockHi || 'शमसाबाद'}, जनपद: ${settings.districtHi || 'फर्रुखाबाद'}, उ.प्र.`
                    : `Village: ${settings.village || 'Harsinghpur Gova'}, Block: ${settings.block || 'Shamsabad'}, District: ${settings.district || 'Farrukhabad'}, UP`}
                </span>
              </div>
              <div className="flex items-center gap-2.5 bg-gov-navy-900/50 p-2.5 rounded-xl border border-gov-navy-800">
                <Clock className="w-4 h-4 text-gov-amber-400 shrink-0" />
                <span>08:30 AM – 03:00 PM (सोमवार – शनिवार)</span>
              </div>

              {/* National Helplines Box with >=44px Touch Targets */}
              <div className="pt-2 border-t border-gov-navy-800 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-200">
                  {language === 'hi' ? 'आपातकालीन / शासकीय हेल्पलाइन:' : 'Emergency Helplines:'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <a 
                    href="tel:1098"
                    className="min-h-[44px] p-2 rounded-xl bg-gov-navy-900 hover:bg-gov-navy-800 active:bg-gov-navy-750 border border-gov-navy-800 text-gov-amber-300 flex items-center justify-center gap-1.5 touch-manipulation active:scale-95 transition-all"
                  >
                    <span>Childline:</span> <span className="font-mono text-amber-200">1098</span>
                  </a>
                  <a 
                    href="tel:1090"
                    className="min-h-[44px] p-2 rounded-xl bg-gov-navy-900 hover:bg-gov-navy-800 active:bg-gov-navy-750 border border-gov-navy-800 text-pink-300 flex items-center justify-center gap-1.5 touch-manipulation active:scale-95 transition-all"
                  >
                    <span>Women:</span> <span className="font-mono text-pink-200">1090</span>
                  </a>
                  <a 
                    href="tel:112"
                    className="min-h-[44px] p-2 rounded-xl bg-gov-navy-900 hover:bg-gov-navy-800 active:bg-gov-navy-750 border border-gov-navy-800 text-blue-300 flex items-center justify-center gap-1.5 touch-manipulation active:scale-95 transition-all"
                  >
                    <span>Police:</span> <span className="font-mono text-blue-200">112</span>
                  </a>
                  <a 
                    href="tel:108"
                    className="min-h-[44px] p-2 rounded-xl bg-gov-navy-900 hover:bg-gov-navy-800 active:bg-gov-navy-750 border border-gov-navy-800 text-emerald-300 flex items-center justify-center gap-1.5 touch-manipulation active:scale-95 transition-all"
                  >
                    <span>Ambulance:</span> <span className="font-mono text-emerald-200">108</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* IIT Delhi Style Bottom Strip: Policies, Copyright, Last Updated & Responsive Stacking */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 pt-2">
          <div className="space-y-1 text-center md:text-left">
            <p>
              © {new Date().getFullYear()} {settings.schoolName}. {language === 'hi' ? 'सर्वाधिकार सुरक्षित।' : 'All Rights Reserved.'}
            </p>
            <p className="text-[11px] text-slate-500">
              {language === 'hi' 
                ? 'यह वेबसाइट बेसिक शिक्षा विभाग, उत्तर प्रदेश शासन के दिशा-निर्देशों के अनुरूप संचालित है।'
                : 'This portal is maintained in compliance with the guidelines of Basic Shiksha Department, Govt. of UP.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold">
            <button 
              onClick={() => onNavigate('about')} 
              className="min-h-[40px] px-3 py-2 rounded-lg bg-gov-navy-900/40 hover:bg-gov-navy-900 active:bg-gov-navy-800 text-slate-300 hover:text-gov-amber-400 transition-colors cursor-pointer touch-manipulation flex items-center"
            >
              {language === 'hi' ? 'वेबसाइट नीतियां' : 'Website Policies'}
            </button>
            <span className="hidden sm:inline text-slate-600">•</span>
            <button 
              onClick={() => onNavigate('faq')} 
              className="min-h-[40px] px-3 py-2 rounded-lg bg-gov-navy-900/40 hover:bg-gov-navy-900 active:bg-gov-navy-800 text-slate-300 hover:text-gov-amber-400 transition-colors cursor-pointer touch-manipulation flex items-center"
            >
              {language === 'hi' ? 'आरटीआई / प्रकटीकरण' : 'RTI & Disclosures'}
            </button>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-[11px] text-slate-500 font-mono py-2">
              {language === 'hi' ? `अंतिम अद्यतन: ${currentDate}` : `Last Updated: ${currentDate}`}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
