import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { StatusBadge } from '../common/StatusBadge';
import { 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  ShieldCheck, 
  ExternalLink, 
  FileCheck2, 
  FolderOpen,
  Filter
} from 'lucide-react';

export const PublicDocumentsPage: React.FC = () => {
  const { language, publicDocuments } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', labelHi: 'सभी दस्तावेज', labelEn: 'All Documents' },
    { id: 'Admission Forms', labelHi: 'प्रवेश प्रपत्र', labelEn: 'Admission Forms' },
    { id: 'Academic Calendar', labelHi: 'शैक्षिक कैलेंडर', labelEn: 'Academic Calendar' },
    { id: 'Holiday List', labelHi: 'अवकाश तालिका', labelEn: 'Holiday List' },
    { id: 'Government Scheme Documents', labelHi: 'शासकीय योजनाएं', labelEn: 'Scheme Documents' }
  ];

  const filteredDocs = publicDocuments.filter(doc => {
    const matchesSearch = 
      doc.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.titleHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full mb-3 border border-blue-200">
                <FolderOpen className="w-3.5 h-3.5" />
                {language === 'hi' ? 'आधिकारिक प्रपत्र एवं परिपत्र' : 'Official Forms & Circulars'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {language === 'hi' 
                  ? 'सार्वजनिक दस्तावेज, कैलेंडर व अवकाश तालिका' 
                  : 'Public Documents, Calendar & Holiday List'}
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                {language === 'hi'
                  ? 'बेसिक शिक्षा परिषद एवं विद्यालय से संबंधित सत्यापित प्रपत्र, शैक्षिक कैलेंडर एवं परिपत्र।'
                  : 'Verified official forms, academic calendars, holiday lists, and departmental circulars.'}
              </p>
            </div>
            <div>
              <StatusBadge status="VERIFIED_CURRENT" language={language} size="md" />
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'hi' ? 'दस्तावेज खोजें (जैसे: प्रवेश फॉर्म, कैलेंडर, अवकाश तालिका)...' : 'Search documents by title or keyword...'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDocs.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <StatusBadge 
                    status={item.verificationStatus} 
                    verification={item.verification}
                    language={language}
                    size="xs"
                  />
                </div>

                <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                  {item.category}
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">
                  {language === 'hi' ? item.titleHi : item.titleEn}
                </h3>

                <div className="space-y-1 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-600">{language === 'hi' ? 'स्रोत / जारीकर्ता: ' : 'Source: '}</span>
                    <span>{item.source}</span>
                  </div>
                  {item.documentNumber && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-600">{language === 'hi' ? 'क्रमांक: ' : 'Ref No: '}</span>
                      <span className="font-mono text-slate-700">{item.documentNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'hi' ? 'तिथि: ' : 'Date: '}{item.publishDate}</span>
                    <span className="text-slate-300">•</span>
                    <span>{item.fileType} ({item.fileSize || 'PDF'})</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={item.fileURL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'डाउनलोड / देखें' : 'Download / View'}
                </a>
                <a
                  href="http://basiceducation.up.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-500 hover:text-amber-600 flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'आधिकारिक पोर्टल' : 'Official Portal'}
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
