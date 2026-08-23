import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { StatusBadge } from './StatusBadge';
import { 
  Search, 
  X, 
  BookOpen, 
  Building2, 
  HelpCircle, 
  FileText, 
  Users, 
  Gift, 
  Globe, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { 
    language, 
    settings, 
    teachers, 
    facilities, 
    governmentSchemes, 
    publicDocuments, 
    faqList, 
    officialSources,
    classes 
  } = useSchool();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search Results Compilation
  const results: Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    page: string;
    verificationStatus?: string;
    icon: React.ElementType;
  }> = [];

  if (q.length > 0) {
    // 1. School Identity checks
    if (
      settings.schoolName.toLowerCase().includes(q) || 
      settings.schoolCode.includes(q) || 
      settings.village.toLowerCase().includes(q) ||
      settings.block.toLowerCase().includes(q) ||
      settings.headTeacherName.toLowerCase().includes(q)
    ) {
      results.push({
        id: 'school-profile',
        type: language === 'hi' ? 'विद्यालय पहचान' : 'School Profile',
        title: `${settings.schoolName} (UDISE: ${settings.schoolCode})`,
        subtitle: `Block: ${settings.block}, District: ${settings.district} • Head Teacher: ${settings.headTeacherName}`,
        page: 'about',
        verificationStatus: 'VERIFIED_CURRENT',
        icon: Building2
      });
    }

    // 2. Teachers
    teachers.forEach(t => {
      if (t.name.toLowerCase().includes(q) || t.designation.toLowerCase().includes(q)) {
        results.push({
          id: t.id,
          type: language === 'hi' ? 'शिक्षक / प्रशासन' : 'Faculty / Staff',
          title: t.name,
          subtitle: `${t.designation} • ${t.specialization || ''}`,
          page: 'faculty',
          verificationStatus: t.verificationStatus,
          icon: Users
        });
      }
    });

    // 3. Government Schemes
    governmentSchemes.forEach(s => {
      if (
        s.nameEn.toLowerCase().includes(q) || 
        s.nameHi.toLowerCase().includes(q) || 
        s.descriptionEn.toLowerCase().includes(q) || 
        s.descriptionHi.toLowerCase().includes(q)
      ) {
        results.push({
          id: s.id,
          type: language === 'hi' ? 'सरकारी योजना' : 'Government Scheme',
          title: language === 'hi' ? s.nameHi : s.nameEn,
          subtitle: language === 'hi' ? s.descriptionHi.slice(0, 80) + '...' : s.descriptionEn.slice(0, 80) + '...',
          page: 'schemes',
          verificationStatus: s.verificationStatus,
          icon: Gift
        });
      }
    });

    // 4. Facilities
    facilities.forEach(f => {
      if (
        f.nameEn.toLowerCase().includes(q) || 
        f.nameHi.toLowerCase().includes(q) || 
        f.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: f.id,
          type: language === 'hi' ? 'ढांचा व सुविधा' : 'Facility',
          title: language === 'hi' ? f.nameHi : f.nameEn,
          subtitle: `${f.category} • ${f.status}`,
          page: 'facilities',
          verificationStatus: f.verificationStatus,
          icon: Building2
        });
      }
    });

    // 5. Public Documents
    publicDocuments.forEach(d => {
      if (
        d.titleEn.toLowerCase().includes(q) || 
        d.titleHi.toLowerCase().includes(q) || 
        d.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: d.id,
          type: language === 'hi' ? 'दस्तावेज' : 'Document',
          title: language === 'hi' ? d.titleHi : d.titleEn,
          subtitle: `${d.category} • ${d.source}`,
          page: 'documents',
          verificationStatus: d.verificationStatus,
          icon: FileText
        });
      }
    });

    // 6. FAQs
    faqList.forEach(faq => {
      if (
        faq.questionEn.toLowerCase().includes(q) || 
        faq.questionHi.toLowerCase().includes(q) || 
        faq.answerEn.toLowerCase().includes(q) || 
        faq.answerHi.toLowerCase().includes(q)
      ) {
        results.push({
          id: faq.id,
          type: language === 'hi' ? 'प्रश्नोत्तरी (FAQ)' : 'FAQ',
          title: language === 'hi' ? faq.questionHi : faq.questionEn,
          subtitle: language === 'hi' ? faq.answerHi.slice(0, 80) + '...' : faq.answerEn.slice(0, 80) + '...',
          page: 'faq',
          verificationStatus: faq.verificationStatus,
          icon: HelpCircle
        });
      }
    });

    // 7. Official Sources
    officialSources.forEach(src => {
      if (
        src.nameEn.toLowerCase().includes(q) || 
        src.nameHi.toLowerCase().includes(q) || 
        src.department.toLowerCase().includes(q)
      ) {
        results.push({
          id: src.id,
          type: language === 'hi' ? 'शासकीय पोर्टल' : 'Official Portal',
          title: language === 'hi' ? src.nameHi : src.nameEn,
          subtitle: src.department,
          page: 'sources',
          verificationStatus: 'VERIFIED_CURRENT',
          icon: Globe
        });
      }
    });
  }

  const handleSelect = (page: string) => {
    onNavigate(page);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Box */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'hi' ? 'पूरे पोर्टल पर खोजें (जैसे: 09290205902, किरण शाक्य, नल से जल, पीएम पोषण)...' : 'Search portal by UDISE, Teacher, Scheme, Water, Calendar, FAQ...'}
            className="w-full text-base bg-transparent border-none focus:outline-hidden text-slate-900 placeholder:text-slate-400"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-500 bg-slate-200/80 hover:bg-slate-300 rounded-lg transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {q.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Sparkles className="w-8 h-8 mx-auto text-amber-500 mb-2 opacity-80" />
              <p className="font-semibold text-slate-600">
                {language === 'hi' ? 'त्वरित खोज प्रारंभ करें' : 'Quick Search Across Portal'}
              </p>
              <p className="text-slate-400 mt-1">
                {language === 'hi' 
                  ? 'UDISE कोड, शिक्षक, योजनाएं, सुविधाएं, दस्तावेज, परिपत्र या प्रश्न खोजें।'
                  : 'Search by UDISE code, faculty, government schemes, facilities, circulars, or FAQs.'}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              {language === 'hi' ? `"${query}" के लिए कोई परिणाम नहीं मिला।` : `No results found for "${query}".`}
            </div>
          ) : (
            results.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item.page)}
                  className="w-full text-left p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-start justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 text-slate-700 rounded-xl shrink-0 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {item.type}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.verificationStatus && (
                      <StatusBadge status={item.verificationStatus} language={language} size="xs" />
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>{results.length} {language === 'hi' ? 'परिणाम' : 'results'}</span>
          <div className="flex items-center gap-3">
            <span>[ESC] {language === 'hi' ? 'बंद करें' : 'to close'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
