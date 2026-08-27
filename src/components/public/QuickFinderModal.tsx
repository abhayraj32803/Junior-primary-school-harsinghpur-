import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  X, 
  Search, 
  Utensils, 
  BookOpen, 
  Gift, 
  Bell, 
  Users, 
  Sparkles, 
  GraduationCap, 
  LogIn, 
  Phone, 
  ArrowRight,
  HelpCircle,
  Clock,
  MapPin
} from 'lucide-react';

interface QuickFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onOpenPortal?: () => void;
}

export const QuickFinderModal: React.FC<QuickFinderModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenPortal
}) => {
  const { language, settings } = useSchool();
  const [filterText, setFilterText] = useState('');

  if (!isOpen) return null;

  const quickLinks = [
    {
      id: 'mdm',
      titleHi: 'आज का खाना / मध्याह्न भोजन (MDM)',
      titleEn: "Today's Mid-Day Meal Menu",
      subHi: 'सोमवार से शनिवार का भोजन चार्ट, फल व दूध वितरण',
      subEn: 'Weekly menu chart, fruit and milk distribution',
      icon: Utensils,
      color: 'bg-amber-500 text-white',
      page: 'schemes',
      keywords: ['खाना', 'भोजन', 'mdm', 'food', 'lunch', 'fruit', 'दूध']
    },
    {
      id: 'classes',
      titleHi: 'कक्षा 1 से 8 किताबें व पढ़ाई (Books & Syllabus)',
      titleEn: 'Classes 1 to 8 Books & Syllabus',
      subHi: 'एससीईआरटी (SCERT) पाठ्यपुस्तकें, विषय व दक्षताएं',
      subEn: 'SCERT textbooks, subjects, and learning targets',
      icon: BookOpen,
      color: 'bg-blue-600 text-white',
      page: 'classes',
      keywords: ['किताब', 'किताबें', 'विषय', 'सिलेबस', 'books', 'syllabus', 'subjects', 'class']
    },
    {
      id: 'schemes',
      titleHi: '₹1200 DBT, मुफ्त ड्रेस, बैग, जूता-मोज़ा',
      titleEn: '₹1200 DBT & Free Uniforms, Bag, Shoes',
      subHi: 'सरकारी अनुदान एवं छात्रवृत्ति विवरण',
      subEn: 'Government welfare schemes and student benefits',
      icon: Gift,
      color: 'bg-emerald-600 text-white',
      page: 'schemes',
      keywords: ['ड्रेस', 'वर्दी', 'बैग', 'जूते', 'dbt', '1200', 'grant', 'scholarship']
    },
    {
      id: 'notices',
      titleHi: 'स्कूल की छुट्टियां व ताज़ा सूचनाएं (Notices)',
      titleEn: 'Holidays & Circular Notices',
      subHi: 'अवकाश तालिका, परीक्षा की तारीखें व जरूरी आदेश',
      subEn: 'Holiday list, exam dates and official circulars',
      icon: Bell,
      color: 'bg-rose-600 text-white',
      page: 'notices',
      keywords: ['छुट्टी', 'नोटिस', 'सूचना', 'परीक्षा', 'holiday', 'leave', 'exam']
    },
    {
      id: 'faculty',
      titleHi: 'हमारे शिक्षक व कक्षा अध्यापक (Teachers)',
      titleEn: 'Teachers & Faculty Members',
      subHi: 'प्रधानाध्यापिका एवं समस्त शिक्षक सूची व योग्यता',
      subEn: 'Headmaster and certified school faculty',
      icon: Users,
      color: 'bg-purple-600 text-white',
      page: 'faculty',
      keywords: ['शिक्षक', 'टीचर', 'सर', 'मैडम', 'teacher', 'faculty', 'staff']
    },
    {
      id: 'admission',
      titleHi: 'नया दाखिला / प्रवेश नियम (Free Admission)',
      titleEn: 'Free Admission in Class 1 to 8',
      subHi: '100% निःशुल्क शिक्षा का अधिकार (RTE) व आवश्यक प्रपत्र',
      subEn: '100% free enrollment guidelines and documents',
      icon: GraduationCap,
      color: 'bg-amber-600 text-white',
      page: 'admission',
      keywords: ['दाखिला', 'प्रवेश', 'एडमिशन', 'admission', 'rte', 'enrollment']
    },
    {
      id: 'gallery',
      titleHi: 'खेलकूद, बाल सभा व फोटो गैलरी (Gallery)',
      titleEn: 'Sports, Events & Photo Gallery',
      subHi: 'योग, विज्ञान मेला, बाल संसद व सांस्कृतिक कार्यक्रम',
      subEn: 'Assembly, sports competitions and photo archive',
      icon: Sparkles,
      color: 'bg-pink-600 text-white',
      page: 'gallery',
      keywords: ['खेल', 'फोटो', 'तस्वीर', 'गैलरी', 'sports', 'gallery', 'photos']
    },
    {
      id: 'login',
      titleHi: 'विद्यार्थी लॉगिन / रिजल्ट व हाजिरी',
      titleEn: 'Student Login & Report Card',
      subHi: 'रोल नंबर से लॉगिन करके अंक व पहचान पत्र देखें',
      subEn: 'Login with roll number for marks & ID card',
      icon: LogIn,
      color: 'bg-slate-900 text-white',
      page: 'login',
      isLogin: true,
      keywords: ['रिजल्ट', 'अंक', 'हाजिरी', 'लॉगिन', 'marks', 'result', 'login']
    },
    {
      id: 'contact',
      titleHi: 'स्कूल का पता, फोन व गूगल मैप्स',
      titleEn: 'School Location & Contact',
      subHi: 'ग्राम हरसिंहपुर गोवा, ब्लॉक शमसाबाद, फर्रुखाबाद',
      subEn: 'Address, phone number and map directions',
      icon: Phone,
      color: 'bg-cyan-600 text-white',
      page: 'contact',
      keywords: ['फोन', 'नंबर', 'पता', 'मैप', 'phone', 'contact', 'map', 'location']
    }
  ];

  const filtered = quickLinks.filter(item => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      item.titleHi.toLowerCase().includes(q) ||
      item.titleEn.toLowerCase().includes(q) ||
      item.subHi.toLowerCase().includes(q) ||
      item.subEn.toLowerCase().includes(q) ||
      item.keywords.some(k => k.toLowerCase().includes(q))
    );
  });

  const handleClick = (item: typeof quickLinks[0]) => {
    onClose();
    if (item.isLogin && onOpenPortal) {
      onOpenPortal();
    } else {
      onNavigate(item.page);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-amber-300 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-gov-navy-950 via-slate-900 to-gov-navy-950 text-white p-5 sm:p-6 flex items-center justify-between border-b-2 border-gov-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {language === 'hi' ? 'कहाँ पर क्या मिलेगा? (त्वरित खोज)' : 'Where to Find What? (Quick Finder)'}
              </h2>
              <p className="text-xs text-amber-200 font-medium">
                {language === 'hi' ? 'कक्षा 1 से 8 के विद्यार्थियों एवं अभिभावकों के लिए आसान मार्गदर्शिका' : 'Easy navigation for Class 1-8 students and parents'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative">
            <Search className="w-5 h-5 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder={language === 'hi' ? 'खोजें (जैसे: खाना, किताब, छुट्टी, ड्रेस, रिजल्ट, सर...)' : 'Search (e.g. food, books, holiday, uniform, marks...)'}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm font-medium outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Links List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 custom-scrollbar">
          {filtered.map((item) => {
            const IconComp = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-amber-800 transition-colors truncate">
                      {language === 'hi' ? item.titleHi : item.titleEn}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium truncate">
                      {language === 'hi' ? item.subHi : item.subEn}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 shrink-0">
                  <span className="hidden sm:inline">{language === 'hi' ? 'खोलें' : 'Open'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs font-medium">
              {language === 'hi' ? 'कोई परिणाम नहीं मिला। कृपया दूसरा शब्द लिखकर देखें।' : 'No results found. Try typing something else.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-3.5 px-5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>{language === 'hi' ? 'परिषदीय प्राथमिक व उच्च प्राथमिक विद्यालय' : 'Basic Education Composite School'}</span>
          <button
            onClick={onClose}
            className="font-bold text-amber-800 hover:underline cursor-pointer"
          >
            {language === 'hi' ? 'बंद करें (Close)' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
