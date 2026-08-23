import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Building2, 
  Droplet, 
  Zap, 
  Laptop, 
  BookOpen, 
  Utensils, 
  HeartPulse, 
  Accessibility, 
  CheckCircle2, 
  HelpCircle, 
  Filter,
  ShieldCheck,
  Search
} from 'lucide-react';

export const FacilitiesPage: React.FC = () => {
  const { facilities, language, settings } = useSchool();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', labelHi: 'सभी सुविधाएं (All)', labelEn: 'All Facilities' },
    { id: 'Classrooms & Campus', labelHi: 'भवन एवं कक्षाएं', labelEn: 'Classrooms & Campus' },
    { id: 'Water & Sanitation', labelHi: 'पेयजल एवं स्वच्छता', labelEn: 'Water & Sanitation' },
    { id: 'Electricity & Power', labelHi: 'विद्युत एवं प्रकाश', labelEn: 'Electricity & Power' },
    { id: 'Digital & ICT', labelHi: 'डिजिटल व आईसीटी', labelEn: 'Digital & ICT' },
    { id: 'Library & Learning', labelHi: 'पुस्तकालय व खेल', labelEn: 'Library & Learning' },
    { id: 'PM POSHAN & Nutrition', labelHi: 'मध्याह्न भोजन (MDM)', labelEn: 'PM POSHAN & Kitchen' },
    { id: 'Health & Safety', labelHi: 'स्वास्थ्य एवं सुरक्षा', labelEn: 'Health & Safety' },
    { id: 'Accessibility', labelHi: 'दिव्यांग सुगमता', labelEn: 'Accessibility' },
  ];

  const filteredFacilities = facilities.filter(f => {
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      f.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.nameHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.descriptionHi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const verifiedCount = facilities.filter(f => f.verification.isVerified).length;
  const pendingCount = facilities.length - verifiedCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'कायाकल्प एवं समग्र शिक्षा मानक' : 'Operation Kayakalp & Samagra Shiksha Standards'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {language === 'hi' ? 'विद्यालय भौतिक एवं शैक्षणिक सुविधाएं' : 'School Infrastructure & Facilities'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {language === 'hi'
            ? 'कंपोजिट उच्च प्राथमिक विद्यालय हरसिंहपुर गोवा में उपलब्ध मूलभूत अवस्थापना, स्वच्छता, डिजिटल एवं पोषण सुविधाओं की आधिकारिक अद्यतन स्थिति।'
            : 'Comprehensive inventory of learning environment, sanitation, power, digital learning, and student welfare facilities at Composite JHS Harsinghpur Gova.'}
        </p>
      </div>

      {/* Summary Audit Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold">{language === 'hi' ? 'कुल सूचीबद्ध सुविधाएं' : 'Total Tracked Facilities'}</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{facilities.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-800 font-semibold">{language === 'hi' ? 'सत्यापित सुविधाएं' : 'Official Verified Status'}</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{verifiedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-800 font-semibold">{language === 'hi' ? 'सत्यापन प्रक्रियाधीन' : 'Verification Required'}</div>
            <div className="text-2xl font-black text-amber-900 mt-1">{pendingCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'सुविधा खोजें (उदा. शौचालय, सोलर, आरओ)...' : 'Search facilities (e.g. toilet, solar, RO)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
            {language === 'hi' 
              ? `${filteredFacilities.length} सुविधाएं प्रदर्शित` 
              : `Showing ${filteredFacilities.length} facilities`}
          </div>
        </div>

        {/* Category Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {language === 'hi' ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Facility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((fac) => {
          const isVerified = fac.verification.isVerified;
          return (
            <div 
              key={fac.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'hi' ? fac.categoryHi : fac.category}
                  </span>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      <CheckCircle2 className="w-3 h-3" /> {language === 'hi' ? 'प्रमाणित' : 'Verified'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                      <HelpCircle className="w-3 h-3" /> {language === 'hi' ? 'सत्यापन अपेक्षित' : 'Verification Required'}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900">
                  {language === 'hi' ? fac.nameHi : fac.nameEn}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'hi' ? fac.descriptionHi : fac.descriptionEn}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{language === 'hi' ? 'उपलब्धता स्थिति:' : 'Availability:'}</span>
                  <span className={`font-bold ${fac.status === 'Available' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {fac.status === 'Available' 
                      ? (language === 'hi' ? 'उपलब्ध (Available)' : 'Available') 
                      : (language === 'hi' ? 'सत्यापन प्रक्रियाधीन' : 'Verification Required')}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  <span className="font-semibold">{language === 'hi' ? 'स्रोत:' : 'Source:'}</span> {fac.verification.source || 'Basic Shiksha Parishad'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFacilities.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">{language === 'hi' ? 'कोई सुविधा नहीं मिली' : 'No facilities found'}</h3>
          <p className="text-xs text-slate-500">{language === 'hi' ? 'कृपया अन्य श्रेणी या खोज शब्द चुनें।' : 'Please try a different search or category filter.'}</p>
        </div>
      )}
    </div>
  );
};
