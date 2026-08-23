import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Users, 
  ShieldAlert, 
  CheckCircle, 
  GraduationCap, 
  Info, 
  Lock, 
  BarChart3, 
  UserCheck, 
  BookOpen, 
  FileCheck2 
} from 'lucide-react';

export const StatisticsPage: React.FC = () => {
  const { language, aggregateOverview, classes, settings } = useSchool();

  return (
    <div className="bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Header with Title & Verification */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full mb-3 border border-amber-200">
                <BarChart3 className="w-3.5 h-3.5" />
                {language === 'hi' ? 'सार्वजनिक समग्र सांख्यिकी' : 'Public Aggregate Statistics'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {language === 'hi' 
                  ? 'विद्यार्थी नामांकन एवं श्रेणीवार समग्र सांख्यिकी' 
                  : 'Student Enrolment & Class Aggregate Statistics'}
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                {language === 'hi'
                  ? 'विद्यालय में कक्षा 1 से 8 तक के नामांकन एवं समग्र आंकड़ों का आधिकारिक सत्यापन आधारित विवरण।'
                  : 'Official verification-tagged aggregate statistics for Classes 1 through 8.'}
              </p>
            </div>
            <div>
              <StatusBadge 
                status={aggregateOverview.status} 
                source={aggregateOverview.source}
                language={language}
                size="md"
              />
            </div>
          </div>

          {/* Strict Privacy Protection Banner */}
          <div className="mt-6 p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3.5 text-emerald-950">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700 shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                {language === 'hi' ? '🔒 विद्यार्थी डेटा निजता एवं सुरक्षा नीति' : '🔒 Student Data Privacy & Protection Policy'}
              </h4>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'बाल अधिकार एवं निजता संरक्षण नियमों के तहत इस पोर्टल पर किसी भी विद्यार्थी का नाम, पिता का नाम, आधार संख्या, मोबाइल नंबर, बैंक खाता या कोई भी व्यक्तिगत/निजी विवरण सार्वजनिक रूप से प्रदर्शित नहीं किया जाता है। यहाँ केवल विद्यालय स्तर के समग्र (Aggregate) आंकड़े प्रदर्शित किए जाते हैं।'
                  : 'Under child protection and privacy guidelines, no personal student PII (such as student names, Aadhaar numbers, guardian phone numbers, or bank accounts) is published on this public portal. Only high-level aggregate data is displayed.'}
              </p>
            </div>
          </div>
        </div>

        {/* Aggregate Overview Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {language === 'hi' ? 'कुल अनुमानित नामांकन' : 'Total Enrolment'}
              </span>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-slate-850">
                {aggregateOverview.totalEnrolment ?? (language === 'hi' ? 'सत्यापन प्रक्रियाधीन' : 'Verification in Progress')}
              </div>
              <div className="mt-2">
                <StatusBadge status="NOT_AVAILABLE" language={language} size="xs" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {language === 'hi' ? 'कक्षा समूह' : 'Class Stages'}
              </span>
              <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xl font-bold text-slate-800">
                {language === 'hi' ? 'कक्षा 1 से 8 (कंपोजिट)' : 'Classes 1 to 8 (Composite)'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {language === 'hi' ? 'प्राथमिक (1-5) + उच्च प्राथमिक (6-8)' : 'Primary (1-5) & Upper Primary (6-8)'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {language === 'hi' ? 'शिक्षक-छात्र अनुपात' : 'Student-Teacher Ratio'}
              </span>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-lg font-bold text-slate-800">
                {aggregateOverview.studentTeacherRatio}
              </div>
              <div className="mt-2">
                <StatusBadge status="HISTORICAL_VERIFICATION_REQUIRED" language={language} size="xs" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {language === 'hi' ? 'शिक्षा माध्यम' : 'Medium of Instruction'}
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-lg font-bold text-slate-800">
                {settings.medium}
              </div>
              <div className="mt-2">
                <StatusBadge status="VERIFIED_CURRENT" language={language} size="xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Class-wise Aggregate Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                {language === 'hi' ? 'कक्षावार समग्र नामांकन एवं सांख्यिकी तालिका' : 'Class-wise Aggregate Enrolment Table'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'hi' 
                  ? 'अद्यतन शैक्षिक सत्र 2025-2026 हेतु सत्यापन स्थिति'
                  : 'Current academic session 2025-2026 verification statuses'}
              </p>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              {language === 'hi' ? 'डेटा स्रोत: UDISE+ / बेसिक शिक्षा विभाग' : 'Source: UDISE+ / Basic Education Department'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">{language === 'hi' ? 'कक्षा' : 'Class'}</th>
                  <th className="py-3.5 px-6 font-semibold">{language === 'hi' ? 'स्तर' : 'Stage'}</th>
                  <th className="py-3.5 px-6 font-semibold text-center">{language === 'hi' ? 'छात्र (Boys)' : 'Boys'}</th>
                  <th className="py-3.5 px-6 font-semibold text-center">{language === 'hi' ? 'छात्राएं (Girls)' : 'Girls'}</th>
                  <th className="py-3.5 px-6 font-semibold text-center">{language === 'hi' ? 'कुल संख्या (Total)' : 'Total'}</th>
                  <th className="py-3.5 px-6 font-semibold">{language === 'hi' ? 'सत्यापन स्थिति' : 'Verification Status'}</th>
                  <th className="py-3.5 px-6 font-semibold">{language === 'hi' ? 'स्रोत विवरण' : 'Data Source'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {aggregateOverview.classBreakdown.map((item) => (
                  <tr key={item.classNumber} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {language === 'hi' ? item.classNameHi : item.classNameEn}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {item.classNumber <= 5 
                        ? (language === 'hi' ? 'प्राथमिक (Primary)' : 'Primary (1-5)') 
                        : (language === 'hi' ? 'उच्च प्राथमिक (Upper Primary)' : 'Upper Primary (6-8)')}
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-slate-500 font-mono">
                      {item.boysCount ?? '—'}
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-slate-500 font-mono">
                      {item.girlsCount ?? '—'}
                    </td>
                    <td className="py-4 px-6 text-center text-xs font-semibold text-slate-700 font-mono">
                      {item.totalStudents ?? '—'}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={item.verificationStatus} language={language} size="xs" />
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {item.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 text-xs text-slate-600 border-t border-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              {language === 'hi' 
                ? 'कक्षावार विस्तृत नामांकन संख्या वार्षिक यू-डायस+ सत्यापन के उपरांत अद्यतन की जाती है।' 
                : 'Class-wise breakdown numbers are published following official UDISE+ census validation.'}
            </span>
            <span className="font-semibold text-slate-700">
              {language === 'hi' ? 'सत्र: 2025-2026' : 'Session: 2025-2026'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
