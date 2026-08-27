import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  School, 
  Award, 
  Sparkles, 
  Info, 
  Layers, 
  Languages, 
  HeartHandshake,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';

export interface Step3Data {
  classNumber: number;
  sectionName: string;
  admissionNumber: string;
  rollNumber: string;
  mediumOfInstruction: 'Hindi' | 'English';
  previousSchool: string;
  previousClassPassed: string;
  admissionQuota: 'General' | 'RTE 25% Quota' | 'BPL / Antyodaya' | 'CWSN Special Needs';
  cwsnDetails: string;
}

interface Step3AcademicInfoProps {
  data: Step3Data;
  onChange: (updates: Partial<Step3Data>) => void;
  errors: Record<string, string>;
  language: 'hi' | 'en';
}

export const Step3AcademicInfo: React.FC<Step3AcademicInfoProps> = ({
  data,
  onChange,
  errors,
  language
}) => {
  const classesList = [
    { num: 1, labelHi: 'कक्षा 1 (Class 1)', stage: 'Primary (प्राथमिक)' },
    { num: 2, labelHi: 'कक्षा 2 (Class 2)', stage: 'Primary (प्राथमिक)' },
    { num: 3, labelHi: 'कक्षा 3 (Class 3)', stage: 'Primary (प्राथमिक)' },
    { num: 4, labelHi: 'कक्षा 4 (Class 4)', stage: 'Primary (प्राथमिक)' },
    { num: 5, labelHi: 'कक्षा 5 (Class 5)', stage: 'Primary (प्राथमिक)' },
    { num: 6, labelHi: 'कक्षा 6 (Class 6)', stage: 'Upper Primary (उच्च प्राथमिक)' },
    { num: 7, labelHi: 'कक्षा 7 (Class 7)', stage: 'Upper Primary (उच्च प्राथमिक)' },
    { num: 8, labelHi: 'कक्षा 8 (Class 8)', stage: 'Upper Primary (उच्च प्राथमिक)' }
  ];

  return (
    <div className="space-y-6">
      {/* Step Header Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            {language === 'hi' ? 'चरण 3: शैक्षणिक एवं कक्षा प्रवेश विवरण' : 'Step 3: Academic & Class Admission Details'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {language === 'hi'
              ? 'प्रवेश हेतु वांछित कक्षा, माध्यम तथा पूर्व विद्यालय का विवरण चुनें। उत्तर प्रदेश बेसिक शिक्षा परिषद के अंतर्गत कक्षा 1 से 8 तक शिक्षा पूर्णतः निःशुल्क है।'
              : 'Select desired admission class, language medium, and prior schooling details. Education from Class 1 to 8 is 100% free under UP Basic Education Department.'}
          </p>
        </div>
      </div>

      {/* Class Selection Grid */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
            {language === 'hi' ? 'प्रवेश कक्षा का चयन (Select Admission Class)' : 'Admission Class'}{' '}
            <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
            {language === 'hi' ? 'सत्र 2025-26 खुला है' : 'Session 2025-26 Open'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {classesList.map((cls) => {
            const isSelected = data.classNumber === cls.num;
            return (
              <button
                key={cls.num}
                type="button"
                onClick={() => onChange({ classNumber: cls.num })}
                className={`min-h-[56px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/40'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-base font-black ${isSelected ? 'text-amber-300' : 'text-slate-900'}`}>
                    Class {cls.num}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className={`text-[10px] font-medium truncate mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {cls.stage}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section & Medium Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        
        {/* Section Preference */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <label className="block text-xs font-bold text-slate-800">
            {language === 'hi' ? 'वर्ग / अनुभाग (Section Preference)' : 'Section Preference'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['A', 'B', 'C'].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => onChange({ sectionName: sec })}
                className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center ${
                  data.sectionName === sec
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {language === 'hi' ? `वर्ग ${sec}` : `Section ${sec}`}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            {language === 'hi' ? 'अंतिम वर्ग आवंटन छात्र संख्या व विद्यालय नियमानुसार होगा।' : 'Final section assignment is managed by the class teacher.'}
          </p>
        </div>

        {/* Medium of Instruction */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <label className="block text-xs font-bold text-slate-800">
            {language === 'hi' ? 'शिक्षण माध्यम (Medium of Instruction)' : 'Medium of Instruction'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['Hindi', 'English'] as const).map((med) => (
              <button
                key={med}
                type="button"
                onClick={() => onChange({ mediumOfInstruction: med })}
                className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  data.mediumOfInstruction === med
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Languages className="w-3.5 h-3.5 text-amber-400" />
                <span>{med === 'Hindi' ? (language === 'hi' ? 'हिंदी माध्यम' : 'Hindi Medium') : (language === 'hi' ? 'अंग्रेजी (English)' : 'English Medium')}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            {language === 'hi' ? 'द्विभाषी (Bilingual) NCERT / SCERT पाठ्यक्रम लागू।' : 'Bilingual NCERT / SCERT curriculum provided.'}
          </p>
        </div>

      </div>

      {/* Admission Quota / Category */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
          {language === 'hi' ? 'प्रवेश कोटा व सरकारी योजना (Admission Scheme / Quota)' : 'Admission Quota / Category'}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'General', titleHi: 'सामान्य प्रवेश (General Free Admission)', descHi: 'कक्षा 1-8 के सभी छात्रों हेतु 100% निःशुल्क' },
            { id: 'RTE 25% Quota', titleHi: 'RTE 25% निःशुल्क कोटा (RTE Act 2009)', descHi: 'आस-पड़ोस के अलाभित समूह व दुर्बल वर्ग हेतु' },
            { id: 'BPL / Antyodaya', titleHi: 'बीपीएल / अंत्योदय योजना (BPL Card)', descHi: 'विशेष कल्याणकारी योजना व DBT छात्रवृत्ति' },
            { id: 'CWSN Special Needs', titleHi: 'दिव्यांग छात्र (CWSN Special Needs)', descHi: 'सुगम्य शिक्षण सामग्री व सहायक उपकरण' }
          ].map((quota) => {
            const isSelected = data.admissionQuota === quota.id;
            return (
              <button
                key={quota.id}
                type="button"
                onClick={() => onChange({ admissionQuota: quota.id as any })}
                className={`min-h-[56px] p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'bg-emerald-900/10 border-emerald-600 ring-2 ring-emerald-500/20'
                    : 'bg-white hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                  isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{quota.titleHi}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{quota.descHi}</div>
                </div>
              </button>
            );
          })}
        </div>

        {data.admissionQuota === 'CWSN Special Needs' && (
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'दिव्यांगता का विवरण (Special Needs / CWSN Details)' : 'Special Needs Details'}
            </label>
            <input
              type="text"
              value={data.cwsnDetails}
              onChange={(e) => onChange({ cwsnDetails: e.target.value })}
              placeholder={language === 'hi' ? 'उदा. दृष्टिबाधित / श्रवणबाधित / अस्थिबाधित' : 'e.g. Visual / Locomotor / Hearing'}
              className="w-full px-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:border-amber-500 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Prior Schooling Details */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <School className="w-4 h-4 text-amber-600" />
          <span>{language === 'hi' ? 'पूर्व विद्यालय का विवरण (Previous School Information - यदि लागू हो)' : 'Previous School Details (If applicable)'}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'पूर्व विद्यालय का नाम (Previous School Name)' : 'Previous School Name'}
            </label>
            <input
              type="text"
              value={data.previousSchool}
              onChange={(e) => onChange({ previousSchool: e.target.value })}
              placeholder={language === 'hi' ? 'प्राथमिक विद्यालय / आंगनवाड़ी / अन्य' : 'Anganwadi / Primary School'}
              className="w-full px-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'उत्तीर्ण पिछली कक्षा (Last Class Passed)' : 'Last Class Passed'}
            </label>
            <input
              type="text"
              value={data.previousClassPassed}
              onChange={(e) => onChange({ previousClassPassed: e.target.value })}
              placeholder={language === 'hi' ? 'आंगनवाड़ी / कक्षा 1 / अन्य' : 'Anganwadi / Class 1 / None'}
              className="w-full px-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Official Headmaster Note */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            {language === 'hi'
              ? 'नोट: औपचारिक प्रवेश पंजिका क्रमांक (SR Number) और अनुक्रमांक (Roll Number) का आवंटन प्रधानाध्यापिका द्वारा भौतिक सत्यापन के उपरांत आधिकारिक रूप से मुहरबंद किया जाएगा।'
              : 'Notice: Official Scholar Register (SR) Number and Roll Number will be verified and stamped by the Head Teacher.'}
          </span>
        </div>
      </div>
    </div>
  );
};
