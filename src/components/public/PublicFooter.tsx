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
  LogIn
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface PublicFooterProps {
  onNavigate: (page: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  const { settings, language } = useSchool();

  return (
    <footer className="bg-gov-navy-950 text-slate-300 pt-10 pb-8 border-t border-gov-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 4 Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-gov-navy-850">
          {/* Col 1: Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gov-amber-500 flex items-center justify-center text-gov-navy-950 font-bold shadow-xs">
                <School className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gov-amber-400">
                  {language === 'hi' ? 'शासकीय कंपोजिट विद्यालय' : 'Government Composite JHS'}
                </div>
                <div className="text-sm font-bold text-white leading-tight">
                  {language === 'hi' ? settings.schoolNameHi : settings.schoolName}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'hi'
                ? 'कक्षा 1 से 8 तक के छात्र-छात्राओं को नि:शुल्क एवं गुणवत्तापूर्ण बुनियादी शिक्षा, निपुण भारत मिशन, पीएम पोषण तथा समग्र शिक्षा के अंतर्गत संवर्धित करने वाला परिषदीय संस्थान।'
                : 'Providing foundational literacy, numeracy, and quality elementary education from Class 1 to 8 under Samagra Shiksha and PM-POSHAN.'}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gov-navy-900 border border-gov-navy-700/80 text-[11px] text-gov-amber-300 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-gov-amber-400" />
              UDISE: {settings.schoolCode}
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {language === 'hi' ? 'पोर्टल अनुभाग' : 'Portal Sections'}
            </h4>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-slate-300">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'विद्यालय परिचय' : 'About Profile'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('classes')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'कक्षाएं व पाठ्यक्रम' : 'Academics'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faculty')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'शिक्षक वृंद' : 'Faculty'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('statistics')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'समग्र सांख्यिकी' : 'Statistics'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('facilities')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'भौतिक सुविधाएं' : 'Facilities'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('schemes')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'सरकारी योजनाएं' : 'Govt Schemes'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admission')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'नि:शुल्क प्रवेश' : 'Admissions'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('documents')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'प्रपत्र व कैलेंडर' : 'Documents'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('sources')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'शासकीय पोर्टल' : 'Govt Sources'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-gov-amber-400 transition-colors cursor-pointer text-left">
                  {language === 'hi' ? 'प्रश्नोत्तरी (FAQ)' : 'FAQ'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('login')} 
                  className="text-gov-amber-400 hover:text-gov-amber-300 font-semibold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'स्टाफ ERP लॉगिन' : 'Staff ERP Login'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Govt Initiatives */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {language === 'hi' ? 'महत्वपूर्ण शासकीय पोर्टल' : 'Official Portals'}
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <a 
                href="https://udiseplus.gov.in" 
                target="_blank" 
                rel="noreferrer"
                className="block p-2 rounded-lg bg-gov-navy-900 border border-gov-navy-700/80 hover:border-gov-amber-500/50 transition-colors"
              >
                <div className="font-semibold text-slate-200 flex items-center justify-between text-xs">
                  <span>UDISE+ National Portal</span>
                  <ExternalLink className="w-3 h-3 text-gov-amber-400" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  UDISE: 09290205902
                </div>
              </a>

              <a 
                href="http://basiceducation.up.gov.in/" 
                target="_blank" 
                rel="noreferrer"
                className="block p-2 rounded-lg bg-gov-navy-900 border border-gov-navy-700/80 hover:border-gov-amber-500/50 transition-colors"
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
                className="block p-2 rounded-lg bg-gov-navy-900 border border-gov-navy-700/80 hover:border-gov-amber-500/50 transition-colors"
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

          {/* Col 4: Location & Helpline info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {language === 'hi' ? 'स्थान व हेल्पलाइन' : 'Location & Helplines'}
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
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
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span className="text-gov-amber-400 font-mono">1098 (Childline)</span>
                  <span className="text-gov-amber-400 font-mono">1090 (Women)</span>
                  <span className="text-gov-amber-400 font-mono">1076 (CM Line)</span>
                  <span className="text-gov-amber-400 font-mono">112 (Emergency)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & Visitor Badge */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {settings.schoolName}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            {/* Private Aggregate Visitor Count Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gov-navy-900 border border-gov-navy-800 text-[11px] text-slate-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">{language === 'hi' ? 'कुल दर्शक:' : 'Total Visitors:'}</span>
              <span className="text-gov-amber-400 font-bold">15,840+</span>
            </div>

            <span>
              {language === 'hi'
                ? 'बेसिक शिक्षा परिषद, उत्तर प्रदेश शासन'
                : 'Department of Basic Education, Govt. of Uttar Pradesh'}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
