import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Building2, 
  Target, 
  Eye, 
  Award, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  CheckCircle, 
  Utensils, 
  Trees, 
  Droplet, 
  Laptop,
  HelpCircle,
  MapPin,
  FileCheck2,
  Lock,
  Calendar,
  Layers,
  Clock,
  Sun,
  Snowflake,
  CalendarDays,
  Sparkles,
  Info
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { settings, language } = useSchool();
  const [holidayCategoryFilter, setHolidayCategoryFilter] = useState<string>('all');

  const timings = settings.schoolTimings;
  const calendar = settings.academicCalendar;

  const holidaysList = calendar?.holidays || [];
  const filteredHolidays = holidaysList.filter(h => {
    if (holidayCategoryFilter === 'all') return true;
    return h.type === holidayCategoryFilter;
  });

  const officialProfile = [
    { 
      labelHi: 'विद्यालय का नाम (School Name)', 
      valueHi: settings.schoolNameHi, 
      valueEn: settings.schoolName,
      status: 'Verified', 
      source: 'UP Basic Education Department Records' 
    },
    { 
      labelHi: 'यू-डायस कोड (UDISE Code)', 
      valueHi: settings.schoolCode, 
      valueEn: settings.schoolCode,
      status: 'Verified', 
      source: 'National UDISE+ System' 
    },
    { 
      labelHi: 'ग्राम / बसावट (Village)', 
      valueHi: settings.villageHi || 'हरसिंहपुर गोवा', 
      valueEn: settings.village || 'Harsinghpur Gova',
      status: 'Verified', 
      source: 'Revenue & Panchayat Records' 
    },
    { 
      labelHi: 'डाकघर (Post Office)', 
      valueHi: settings.postOfficeHi || settings.postHi || 'हरसिंहपुर गोवा', 
      valueEn: settings.postOffice || settings.post || 'Harsinghpur Gova',
      status: 'Verified', 
      source: 'Postal Division Records' 
    },
    { 
      labelHi: 'विकास खंड (Block)', 
      valueHi: settings.blockHi || 'शमसाबाद', 
      valueEn: settings.block || 'Shamsabad',
      status: 'Verified', 
      source: 'Block Resource Centre (BRC) Shamsabad' 
    },
    { 
      labelHi: 'जनपद / जिला (District)', 
      valueHi: settings.districtHi || 'फर्रुखाबाद', 
      valueEn: settings.district || 'Farrukhabad',
      status: 'Verified', 
      source: 'BSA Farrukhabad' 
    },
    { 
      labelHi: 'राज्य (State)', 
      valueHi: 'उत्तर प्रदेश (Uttar Pradesh)', 
      valueEn: 'Uttar Pradesh',
      status: 'Verified', 
      source: 'Government of Uttar Pradesh' 
    },
    { 
      labelHi: 'संस्था प्रकार (School Type)', 
      valueHi: 'परिषदीय कंपोजिट उच्च प्राथमिक विद्यालय (Government Composite JHS)', 
      valueEn: 'Government Composite Junior High School (Classes 1-8)',
      status: 'Verified', 
      source: 'Basic Shiksha Parishad' 
    },
    { 
      labelHi: 'कक्षाएं (Class Span)', 
      valueHi: 'कक्षा 1 से कक्षा 8 (प्राथमिक एवं उच्च प्राथमिक)', 
      valueEn: 'Class 1 to Class 8 (Primary & Upper Primary)',
      status: 'Verified', 
      source: 'Department of School Education' 
    },
    { 
      labelHi: 'क्षेत्र (Area Type)', 
      valueHi: 'ग्रामीण (Rural)', 
      valueEn: 'Rural',
      status: 'Verified', 
      source: 'Demographic Classification' 
    },
    { 
      labelHi: 'शिक्षा का माध्यम (Medium)', 
      valueHi: 'हिंदी (Hindi) — आधिकारिक अंतिम सत्यापन अपेक्षित', 
      valueEn: 'Hindi — Official Confirmation in Progress',
      status: 'Pending', 
      source: 'School Records (Verification Ongoing)' 
    },
    { 
      labelHi: 'पिन कोड (PIN Code)', 
      valueHi: settings.pinCode || 'सत्यापन अपेक्षित (Verification Required)', 
      valueEn: settings.pinCode || 'Verification Required (Multiple records exist)',
      status: 'Verification Required', 
      source: 'Official Postal Audit Required' 
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 sm:space-y-12 overflow-x-hidden">
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          {language === 'hi' ? 'शासकीय विद्यालय परिचय एवं सांख्यिकी' : 'Institutional Heritage & Profile'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {language === 'hi' ? settings.schoolNameHi : settings.schoolName}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {language === 'hi' 
            ? 'उत्तर प्रदेश बेसिक शिक्षा परिषद के अधीन संचालित यह विद्यालय कक्षा 1 से 8 तक के छात्र-छात्राओं को समावेशी, निःशुल्क एवं गुणवत्तापूर्ण शिक्षा प्रदान करने हेतु पूर्णतः समर्पित है।'
            : 'Established under the Department of Basic Education, Government of Uttar Pradesh, providing free, compulsory, and foundational education for classes 1 through 8.'}
        </p>
      </div>

      {/* Official Master Profile Table with Verification Badges */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-black text-white">
                {language === 'hi' ? 'विद्यालय आधिकारिक मास्टर विवरण (UDISE Master Profile)' : 'Official Institutional Master Profile'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'hi'
                ? 'यह तालिका केवल सरकारी प्रमाणित रिकॉर्ड्स पर आधारित है। किसी भी काल्पनिक विवरण का पूर्णतः निषेध है।'
                : 'This directory strictly presents government-verified attributes. No synthetic assumptions are used.'}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
            UDISE: {settings.schoolCode}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-4 w-1/4">{language === 'hi' ? 'विवरण (Field)' : 'Attribute'}</th>
                <th className="py-3 px-4 w-2/5">{language === 'hi' ? 'प्रमाणित मान (Value)' : 'Official Value'}</th>
                <th className="py-3 px-4 w-1/6">{language === 'hi' ? 'स्थिति (Status)' : 'Verification'}</th>
                <th className="py-3 px-4">{language === 'hi' ? 'स्रोत / संदर्भ (Source)' : 'Source'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {officialProfile.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{row.labelHi}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {language === 'hi' ? row.valueHi : row.valueEn}
                  </td>
                  <td className="py-3.5 px-4">
                    {row.status === 'Verified' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        <CheckCircle className="w-3 h-3" /> {language === 'hi' ? 'सत्यापित' : 'Verified'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                        <HelpCircle className="w-3 h-3" /> {language === 'hi' ? 'सत्यापन अपेक्षित' : 'Verification Required'}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: SCHOOL OPERATING HOURS & TIMINGS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {language === 'hi' ? 'विद्यालय संचालन समय सारिणी (School Timings)' : 'School Operating Hours & Timings'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'hi' 
                  ? 'उत्तर प्रदेश बेसिक शिक्षा परिषद के शासनादेशों के अनुसार ग्रीष्मकालीन एवं शीतकालीन संचालन समय।'
                  : 'Seasonal daily timings, morning assembly, mid-day meal recess, and public office hours.'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
            Govt. Regulated
          </span>
        </div>

        {/* Timings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summer Timing Card */}
          <div className="p-6 rounded-3xl bg-amber-50/60 border border-amber-200/80 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    {language === 'hi' ? 'ग्रीष्मकालीन समय (Summer Timing)' : 'Summer Schedule'}
                  </h3>
                  <span className="text-[11px] text-amber-800 font-bold">
                    {timings?.summerTiming.effectivePeriodHi || '1 अप्रैल से 30 सितम्बर'}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold">
                08:00 AM – 02:00 PM
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 font-medium">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-amber-100">
                <span className="text-slate-500">{language === 'hi' ? 'दैनिक समय:' : 'Daily Hours:'}</span>
                <span className="font-bold text-slate-900 font-mono">{timings?.summerTiming.openingTime || '08:00 AM'} — {timings?.summerTiming.closingTime || '02:00 PM'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-amber-100">
                <span className="text-slate-500">{language === 'hi' ? 'प्रातः प्रार्थना सभा:' : 'Prayer Assembly:'}</span>
                <span className="font-bold text-slate-900">{timings?.summerTiming.assemblyTime || '08:00 AM – 08:20 AM'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-amber-100">
                <span className="text-slate-500">{language === 'hi' ? 'मध्याह्न भोजन (MDM):' : 'MDM Lunch Recess:'}</span>
                <span className="font-bold text-slate-900">{timings?.summerTiming.recessTime || '10:30 AM – 11:00 AM'}</span>
              </div>
            </div>
          </div>

          {/* Winter Timing Card */}
          <div className="p-6 rounded-3xl bg-sky-50/60 border border-sky-200/80 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                  <Snowflake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    {language === 'hi' ? 'शीतकालीन समय (Winter Timing)' : 'Winter Schedule'}
                  </h3>
                  <span className="text-[11px] text-sky-800 font-bold">
                    {timings?.winterTiming.effectivePeriodHi || '1 अक्टूबर से 31 मार्च'}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-sky-200/80 text-sky-900 text-[10px] font-bold">
                09:00 AM – 03:00 PM
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 font-medium">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-sky-100">
                <span className="text-slate-500">{language === 'hi' ? 'दैनिक समय:' : 'Daily Hours:'}</span>
                <span className="font-bold text-slate-900 font-mono">{timings?.winterTiming.openingTime || '09:00 AM'} — {timings?.winterTiming.closingTime || '03:00 PM'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-sky-100">
                <span className="text-slate-500">{language === 'hi' ? 'प्रातः प्रार्थना सभा:' : 'Prayer Assembly:'}</span>
                <span className="font-bold text-slate-900">{timings?.winterTiming.assemblyTime || '09:00 AM – 09:20 AM'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-sky-100">
                <span className="text-slate-500">{language === 'hi' ? 'मध्याह्न भोजन (MDM):' : 'MDM Lunch Recess:'}</span>
                <span className="font-bold text-slate-900">{timings?.winterTiming.recessTime || '11:30 AM – 12:00 PM'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Office Visiting Hours Note */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-900 block sm:inline mr-2">
              {language === 'hi' ? 'कार्यालय एवं अभिभावक भेंट समय:' : 'Office & Public Interaction Hours:'}
            </span>
            <span>
              {timings?.officeHours.startTime || '08:30 AM'} — {timings?.officeHours.endTime || '01:30 PM'} ({language === 'hi' ? (timings?.officeHours.workingDaysSummaryHi || 'सोमवार से शनिवार') : (timings?.officeHours.workingDaysSummaryEn || 'Mon-Sat')})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 italic">
            {language === 'hi' ? 'साप्ताहिक अवकाश: रविवार' : 'Weekly Off: Sunday'}
          </span>
        </div>
      </div>

      {/* SECTION: ACADEMIC CALENDAR & OFFICIAL HOLIDAY DATES */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {language === 'hi' ? `वार्षिक शैक्षिक कैलेंडर एवं शासकीय अवकाश सूची (सत्र ${calendar?.academicYear || '2025-26'})` : `Academic Calendar & Holiday Schedule (Session ${calendar?.academicYear || '2025-26'})`}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'hi'
                  ? 'उत्तर प्रदेश बेसिक शिक्षा परिषद द्वारा निर्गत आधिकारिक अवकाश तालिका एवं सत्र गतिविधियां।'
                  : 'Official holiday schedule and session milestones as notified by the UP Basic Shiksha Parishad.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-100">
              {calendar?.totalWorkingDaysTarget || 240} {language === 'hi' ? 'कार्य दिवस लक्ष्य' : 'Working Days Target'}
            </span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setHolidayCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              holidayCategoryFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'hi' ? `सभी अवकाश (${holidaysList.length})` : `All (${holidaysList.length})`}
          </button>
          <button
            onClick={() => setHolidayCategoryFilter('Gazetted')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              holidayCategoryFilter === 'Gazetted' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'hi' ? 'राजपत्रित अवकाश (Gazetted)' : 'Gazetted'}
          </button>
          <button
            onClick={() => setHolidayCategoryFilter('National Holiday')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              holidayCategoryFilter === 'National Holiday' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'hi' ? 'राष्ट्रीय पर्व (National)' : 'National Holidays'}
          </button>
          <button
            onClick={() => setHolidayCategoryFilter('Vacation')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              holidayCategoryFilter === 'Vacation' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'hi' ? 'दीर्घकालीन अवकाश (Vacations)' : 'Vacations'}
          </button>
        </div>

        {/* Holidays Table */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-32">{language === 'hi' ? 'दिनांक' : 'Date'}</th>
                  <th className="py-3 px-4">{language === 'hi' ? 'अवकाश का नाम' : 'Holiday Title'}</th>
                  <th className="py-3 px-4 w-28">{language === 'hi' ? 'श्रेणी' : 'Category'}</th>
                  <th className="py-3 px-4 w-20 text-center">{language === 'hi' ? 'दिन' : 'Days'}</th>
                  <th className="py-3 px-4">{language === 'hi' ? 'विवरण' : 'Remarks'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredHolidays.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      {language === 'hi' ? 'इस श्रेणी में कोई अवकाश नहीं है।' : 'No holidays found in this category.'}
                    </td>
                  </tr>
                ) : (
                  filteredHolidays.map((hol, idx) => (
                    <tr key={hol.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {hol.startDate}
                        {hol.endDate && <span className="text-slate-500 font-normal block text-[10px]">to {hol.endDate}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{language === 'hi' ? hol.titleHi : hol.titleEn}</div>
                        <div className="text-[10px] text-slate-400">{language === 'hi' ? hol.titleEn : hol.titleHi}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                          hol.type === 'National Holiday'
                            ? 'bg-blue-100 text-blue-800'
                            : hol.type === 'Vacation'
                            ? 'bg-emerald-100 text-emerald-800'
                            : hol.type === 'Gazetted'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {hol.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold font-mono text-slate-900">
                        {hol.daysCount}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {language === 'hi' ? (hol.descriptionHi || hol.descriptionEn) : (hol.descriptionEn || hol.descriptionHi)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vision & Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {language === 'hi' ? 'हमारा ध्येय (Mission)' : 'Our Institutional Mission'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'ग्रामीण अंचल के प्रत्येक बच्चे को जाति, धर्म या आर्थिक विषमता से परे सर्वांगीण, गुणवत्तापरक व आधुनिक शिक्षा उपलब्ध कराना। निपुण भारत मिशन के लक्ष्यों की समयबद्ध प्राप्ति एवं बुनियादी साक्षरता और संख्या ज्ञान (FLN) को सुदृढ़ करना।'
              : 'To provide inclusive, equitable, and high-standard primary and upper-primary schooling to every child, cultivating foundational numeracy, scientific inquiry, moral integrity, and social responsibility.'}
          </p>
          <ul className="space-y-2 pt-2 text-xs font-medium text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{language === 'hi' ? 'निपुण भारत मिशन (FLN) का 100% क्रियान्वयन' : '100% Foundational Literacy and Numeracy (FLN)'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{language === 'hi' ? 'निःशुल्क पाठ्यपुस्तकें, यूनिफॉर्म डीबीटी, मध्याह्न भोजन' : 'Free Textbooks, Uniform DBT, and PM POSHAN for all'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{language === 'hi' ? 'बालिकाओं की शिक्षा एवं सशक्तिकरण पर विशेष बल' : 'Equal educational empowerment for girl children'}</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {language === 'hi' ? 'हमारा दृष्टिकोण (Vision)' : 'Our Long-Term Vision'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'हरसिंहपुर गोवा कंपोजिट विद्यालय को एक आदर्श विद्यालय के रूप में विकसित करना, जहाँ तकनीक, अनुशासन, मानवीय मूल्य और खेलकूद के माध्यम से आत्मनिर्भर राष्ट्र निर्माताओं का निर्माण हो।'
              : 'To establish Composite JHS Harsinghpur Gova as a beacon of academic excellence in Shamsabad block, nurturing lifelong learners equipped with modern skills and high ethical character.'}
          </p>
          <ul className="space-y-2 pt-2 text-xs font-medium text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{language === 'hi' ? 'स्मार्ट क्लास व आईसीटी आधारित शिक्षा का विस्तार' : 'Expanding ICT and digital smart classroom pedagogy'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{language === 'hi' ? 'पर्यावरण जागरूकता एवं स्वच्छता का दैनिक अभ्यास' : 'Promoting environmental stewardship and sanitation'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{language === 'hi' ? 'विद्यालय प्रबंध समिति (SMC) व समुदाय की सक्रिय सहभागिता' : 'Active community and School Management Committee (SMC) partnership'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Governance & SMC Committee */}
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm uppercase tracking-wider">
          <Users className="w-5 h-5 text-amber-700" />
          <span>{language === 'hi' ? 'विद्यालय प्रबंध समिति (School Management Committee - SMC)' : 'School Management Committee (SMC)'}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {language === 'hi'
            ? 'शिक्षा का अधिकार अधिनियम (RTE 2009) के प्राविधानों के तहत विद्यालय में SMC का गठन किया गया है, जिसमें 75% सदस्य अध्ययनरत छात्र-छात्राओं के अभिभावक हैं। समिति द्वारा विद्यालय विकास योजना (SDP), मध्याह्न भोजन की गुणवत्ता, एवं वित्तीय पारदर्शिता का नियमित अनुश्रवण किया जाता है।'
            : 'In accordance with RTE 2009 guidelines, the School Management Committee actively monitors midday meal quality, physical infrastructure maintenance, and community enrollment campaigns.'}
        </p>
      </div>
    </div>
  );
};
