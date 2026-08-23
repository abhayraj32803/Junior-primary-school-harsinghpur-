import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { StatusBadge } from '../common/StatusBadge';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Info, 
  BookOpen, 
  MessageSquareQuote,
  ShieldCheck
} from 'lucide-react';

export const FAQPage: React.FC = () => {
  const { language, faqList } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'faq-01': true,
    'faq-02': true,
    'faq-04': true
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    { id: 'all', labelHi: 'सभी प्रश्न', labelEn: 'All Questions' },
    { id: 'Identity & Location', labelHi: 'पहचान व स्थान', labelEn: 'Identity & Location' },
    { id: 'Academics & Admission', labelHi: 'प्रवेश व शिक्षा', labelEn: 'Academics & Admission' },
    { id: 'Staff & Contact', labelHi: 'शिक्षक व प्रशासन', labelEn: 'Staff & Administration' },
    { id: 'Facilities & Schemes', labelHi: 'सुविधाएं व योजनाएं', labelEn: 'Facilities & Schemes' },
    { id: 'Documents', labelHi: 'दस्तावेज व परिपत्र', labelEn: 'Documents' }
  ];

  const filteredFaqs = faqList.filter(item => {
    const matchesSearch = 
      item.questionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.questionHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answerEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answerHi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden py-8 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full mb-3 border border-amber-200">
                <HelpCircle className="w-3.5 h-3.5" />
                {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions (FAQ)'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {language === 'hi' 
                  ? 'सामान्य प्रश्नोत्तरी एवं आधिकारिक स्पष्टीकरण' 
                  : 'School FAQs & Official Clarifications'}
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                {language === 'hi'
                  ? 'विद्यालय से संबंधित सामान्य, प्रशासनिक एवं शैक्षिक शंकाओं के सत्यापित उत्तर।'
                  : 'Verified official answers to common questions regarding admissions, faculty, and school resources.'}
              </p>
            </div>
            <div>
              <StatusBadge status="VERIFIED_CURRENT" language={language} size="md" />
            </div>
          </div>

          {/* Search & Categories */}
          <div className="mt-6 space-y-3 pt-6 border-t border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'hi' ? 'प्रश्न या कीवर्ड खोजें (उदा. UDISE, प्रधानाध्यापिका, प्रवेश, भोजन, जल)...' : 'Search question by keyword (e.g., UDISE, Head Teacher, Admission, MDM)...'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {language === 'hi' ? cat.labelHi : cat.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isOpen = !!openItems[faq.id];
            return (
              <div 
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all hover:border-slate-300"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquareQuote className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">
                        {faq.category}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {language === 'hi' ? faq.questionHi : faq.questionEn}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={faq.verificationStatus} language={language} size="xs" />
                    <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-700 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/30">
                    <p className="font-normal text-slate-800">
                      {language === 'hi' ? faq.answerHi : faq.answerEn}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-medium text-slate-600">{language === 'hi' ? 'सत्यापित स्रोत: ' : 'Verified Source: '}</span>
                        <span>{faq.source}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
