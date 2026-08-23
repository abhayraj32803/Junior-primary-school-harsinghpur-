import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Bell, 
  Search, 
  Calendar, 
  Tag, 
  FileText, 
  Download, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const PublicNoticesPage: React.FC = () => {
  const { notices, publicDocuments, language } = useSchool();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', labelHi: 'सभी सूचनाएं (All)', labelEn: 'All Notices' },
    { id: 'General', labelHi: 'सामान्य (General)', labelEn: 'General' },
    { id: 'Academic', labelHi: 'शैक्षणिक (Academic)', labelEn: 'Academic' },
    { id: 'Mid-Day Meal', labelHi: 'मध्याह्न भोजन (MDM)', labelEn: 'Mid-Day Meal' },
    { id: 'Holiday', labelHi: 'अवकाश (Holidays)', labelEn: 'Holidays' },
    { id: 'Exam', labelHi: 'परीक्षा एवं परिणाम', labelEn: 'Exams' },
    { id: 'Sports & Cultural', labelHi: 'खेलकूद व सांस्कृतिक', labelEn: 'Sports & Cultural' },
  ];

  const filteredNotices = notices.filter(n => {
    const titleText = (language === 'hi' && n.titleHi) ? n.titleHi : n.title;
    const descText = (language === 'hi' && n.descriptionHi) ? n.descriptionHi : n.description;
    const matchesSearch = titleText.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          descText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || n.category === selectedCategory;
    return matchesSearch && matchesCat && (n.isPublic || n.targetRole === 'all');
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10 overflow-x-hidden">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <Bell className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'hi' ? 'आधिकारिक सूचना पट्ट एवं शासनादेश' : 'Official Circulars & Circular Board'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {language === 'hi' ? 'सूचना पट्ट एवं महत्वपूर्ण विज्ञप्तियां' : 'School Notices & Public Circulars'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {language === 'hi'
            ? 'परीक्षा कार्यक्रम, प्रवेश सूचना, मध्याह्न भोजन वितरण, अवकाश तालिका एवं बेसिक शिक्षा परिषद के दिशा-निर्देश।'
            : 'Stay updated with official notifications regarding academic schedules, examinations, Mid-Day Meal menus, holidays, and government directives.'}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'सूचना खोजें (उदा. परीक्षा, अवकाश, एमडीएम)...' : 'Search circulars, keywords...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold self-end md:self-center">
            {language === 'hi' ? `${filteredNotices.length} सूचनाएं उपलब्ध` : `${filteredNotices.length} active notices`}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-amber-400'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {language === 'hi' ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNotices.map((notice) => (
          <div 
            key={notice.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  {notice.category}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {notice.publishDate}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {language === 'hi' ? (notice.titleHi || notice.title) : notice.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'hi' ? (notice.descriptionHi || notice.description) : notice.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {language === 'hi' ? 'जारीकर्ता:' : 'Issued by:'} {notice.authorName}
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{language === 'hi' ? 'शासकीय प्रमाणित' : 'Verified'}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredNotices.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
          <Bell className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">{language === 'hi' ? 'कोई सूचना नहीं मिली' : 'No notices found'}</h3>
          <p className="text-xs text-slate-500">{language === 'hi' ? 'कृपया अन्य श्रेणी या खोज शब्द चुनें।' : 'Please check back later or try a different filter.'}</p>
        </div>
      )}

      {/* Official Circulars / Documents section */}
      {publicDocuments.length > 0 && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {language === 'hi' ? 'शासनादेश एवं शैक्षणिक प्रपत्र डाउनलोड' : 'Government Orders & Downloadable Circulars'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'hi' ? 'बेसिक शिक्षा विभाग उत्तर प्रदेश से संबंधित आधिकारिक परिपत्र' : 'Official downloadable documents and government circulars'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicDocuments.map((pdoc) => (
              <div key={pdoc.id} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase">{pdoc.category}</span>
                  <h4 className="font-bold text-xs text-slate-100 mt-1">
                    {language === 'hi' ? pdoc.titleHi : pdoc.titleEn}
                  </h4>
                </div>
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{pdoc.date}</span>
                  <a
                    href={pdoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                  >
                    <span>{language === 'hi' ? 'देखें' : 'View'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
