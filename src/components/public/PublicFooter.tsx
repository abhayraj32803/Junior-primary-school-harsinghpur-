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
    <footer className="w-full max-w-full overflow-x-hidden bg-gov-navy-950 text-slate-300 pt-12 pb-8 border-t-4 border-gov-amber-500">
      
      {/* Top Banner Accent: Government & RTE Guarantee */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 mb-8 border-b border-gov-navy-850">
        <div className="bg-gov-navy-900/90 rounded-2xl p-4 sm:p-6 border border-gov-navy-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-gov-amber-500 text-gov-navy-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <School className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-gov-amber-400">
                {language === 'hi' ? 'शासकीय कंपोजिट विद्यालय (कक्षा 1 से 8)' : 'Government Composite JHS (Classes 1–8)'}
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {language === 'hi' ? settings.schoolNameHi : settings.schoolName}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gov-navy-950 border border-gov-navy-700 text-xs text-gov-amber-300 font-mono font-bold">
              <ShieldCheck className="w-4 h-4 text-gov-amber-400" />
              <span>UDISE: {settings.schoolCode}</span>
            </div>
            <button
              onClick={() => onNavigate('admission')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors cursor-pointer shadow-xs"
            >
              {language === 'hi' ? 'नि:शुल्क प्रवेश 2024-25' : 'Free Admissions 2024-25'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* 4 Main IIT Delhi Style Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-gov-navy-850">
          
          {/* Col 1: Institute Identity & Mission */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gov-amber-400 border-b border-gov-navy-800 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{language === 'hi' ? 'संस्थान परिचय' : 'About Institute'}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'hi'
                ? 'कक्षा 1 से 8 तक के छात्र-छात्राओं को नि:शुल्क एवं गुणवत्तापूर्ण बुनियादी शिक्षा, निपुण भारत मिशन, पीएम पोषण तथा समग्र शिक्षा के अंतर्गत संवर्धित करने वाला परिषदीय संस्थान।'
                : 'Dedicated to providing quality elementary education from Class 1 to 8 under Basic Shiksha Parishad, Samagra Shiksha, and PM-POSHAN.'}
            </p>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-slate-200">
                <ShieldCheck className="w-4 h-4 text-gov-amber-400 shrink-0" />
                <span>{language === 'hi' ? 'प्रभारी प्रधानाध्यापिका: श्रीमती किरण शाक्य' : 'Head Teacher: Smt. Kiran Shakya'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'hi' ? '100% नि:शुल्क शिक्षा एवं पाठ्यपुस्तकें' : '100% Free Education & Books'}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Academic & Navigation Links (IIT Delhi style Quick Links) */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gov-amber-400 border-b border-gov-navy-800 pb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{language === 'hi' ? 'त्वरित लिंक एवं अनुभाग' : 'Quick Navigation'}</span>
            </h4>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-300">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• मुख्य पृष्ठ' : '• Home'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• परिचय व इतिहास' : '• About Us'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('classes')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• पाठ्यक्रम (1-8)' : '• Curriculum'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faculty')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• शिक्षक पंजिका' : '• Faculty'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admission')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• नि:शुल्क प्रवेश' : '• Admissions'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('schemes')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• योजनाएं व DBT' : '• Schemes'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('facilities')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• सुविधाएं' : '• Facilities'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('statistics')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• सांख्यिकी' : '• Statistics'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('notices')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• सूचना पट्ट' : '• Notices'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• फोटो व वीडियो' : '• Gallery'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('documents')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• प्रपत्र व कैलेंडर' : '• Documents'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• प्रश्नोत्तरी (FAQ)' : '• FAQs'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login-student')} className="hover:text-gov-amber-400 font-bold text-amber-300 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• 🎓 छात्र पोर्टल लॉगिन' : '• 🎓 Student Login'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login-teacher')} className="hover:text-gov-amber-400 font-bold text-blue-300 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• 👨‍🏫 शिक्षक पोर्टल लॉगिन' : '• 👨‍🏫 Teacher Login'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login-admin')} className="hover:text-gov-amber-400 font-bold text-emerald-300 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? '• 🛡️ प्रधानाध्यापक ERP' : '• 🛡️ Headmaster ERP'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Government Portals (External Links) */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gov-amber-400 border-b border-gov-navy-800 pb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{language === 'hi' ? 'महत्वपूर्ण शासकीय पोर्टल' : 'Official Portals'}</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <a 
                href="https://udiseplus.gov.in" 
                target="_blank" 
                rel="noreferrer"
                className="block p-2 rounded-xl bg-gov-navy-900 border border-gov-navy-800 hover:border-gov-amber-500/50 transition-colors"
              >
                <div className="font-semibold text-slate-200 flex items-center justify-between text-xs">
                  <span>UDISE+ National Portal</span>
                  <ExternalLink className="w-3 h-3 text-gov-amber-400" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Code: 09290205902
                </div>
              </a>

              <a 
                href="http://basiceducation.up.gov.in/" 
                target="_blank" 
                rel="noreferrer"
                className="block p-2 rounded-xl bg-gov-navy-900 border border-gov-navy-800 hover:border-gov-amber-500/50 transition-colors"
              >
                <div className="font-semibold text-slate-200 flex items-center justify-between text-xs">
                  <span>बेसिक शिक्षा परिषद, उत्तर प्रदेश</span>
                  <ExternalLink className="w-3 h-3 text-gov-amber-400" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  basiceducation.up.gov.in
                </div>
              </a>

              <a 
                href="https://prernaup.in" 
                target="_blank" 
                rel="noreferrer"
                className="block p-2 rounded-xl bg-gov-navy-900 border border-gov-navy-800 hover:border-gov-amber-500/50 transition-colors"
              >
                <div className="font-semibold text-slate-200 flex items-center justify-between text-xs">
                  <span>मिशन प्रेरणा (DBT पोर्टल)</span>
                  <ExternalLink className="w-3 h-3 text-gov-amber-400" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  prernaup.in
                </div>
              </a>
            </div>
          </div>

          {/* Col 4: Location, Hours & Emergency Helplines */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gov-amber-400 border-b border-gov-navy-800 pb-2 flex items-center gap-2">
              <PhoneCall className="w-4 h-4" />
              <span>{language === 'hi' ? 'स्थान व हेल्पलाइन' : 'Contact & Helplines'}</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gov-amber-400 shrink-0 mt-0.5" />
                <span>
                  {language === 'hi'
                    ? `ग्राम: ${settings.villageHi || 'हरसिंहपुर गोवा'}, विकास खंड: ${settings.blockHi || 'शमसाबाद'}, जनपद: ${settings.districtHi || 'फर्रुखाबाद'}, उ.प्र.`
                    : `Village: ${settings.village || 'Harsinghpur Gova'}, Block: ${settings.block || 'Shamsabad'}, District: ${settings.district || 'Farrukhabad'}, UP`}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gov-amber-400 shrink-0 mt-0.5" />
                <span>08:30 AM – 03:00 PM (Monday – Saturday)</span>
              </div>

              {/* National Helplines Box */}
              <div className="pt-2 border-t border-gov-navy-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-200">
                  {language === 'hi' ? 'आपातकालीन / शासकीय हेल्पलाइन:' : 'Emergency Helplines:'}
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                  <div className="p-1.5 rounded-lg bg-gov-navy-900 border border-gov-navy-800 text-gov-amber-300">
                    Childline: 1098
                  </div>
                  <div className="p-1.5 rounded-lg bg-gov-navy-900 border border-gov-navy-800 text-pink-300">
                    Women: 1090
                  </div>
                  <div className="p-1.5 rounded-lg bg-gov-navy-900 border border-gov-navy-800 text-blue-300">
                    Police: 112
                  </div>
                  <div className="p-1.5 rounded-lg bg-gov-navy-900 border border-gov-navy-800 text-emerald-300">
                    Ambulance: 108
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* IIT Delhi Style Bottom Strip: Policies, Copyright, Last Updated & Webmaster */}
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

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <button onClick={() => onNavigate('about')} className="hover:text-gov-amber-400 transition-colors cursor-pointer">
              {language === 'hi' ? 'वेबसाइट नीतियां' : 'Website Policies'}
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('faq')} className="hover:text-gov-amber-400 transition-colors cursor-pointer">
              {language === 'hi' ? 'आरटीआई / प्रकटीकरण' : 'RTI & Disclosures'}
            </button>
            <span>•</span>
            <span className="text-[11px] text-slate-500 font-mono">
              {language === 'hi' ? `अंतिम अद्यतन: ${currentDate}` : `Last Updated: ${currentDate}`}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
