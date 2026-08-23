import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  BookOpen, 
  Layers, 
  Award, 
  Clock, 
  CheckCircle2, 
  FileText,
  Sparkles,
  GraduationCap
} from 'lucide-react';

export const ClassesCurriculumPage: React.FC = () => {
  const { classes, subjects, sections, language } = useSchool();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'class-1');

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classSubjects = subjects.filter(s => s.classId === selectedClassId);
  const classSections = sections.filter(s => s.classId === selectedClassId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'hi' ? 'उत्तर प्रदेश बेसिक शिक्षा पाठ्यचर्या' : 'UP Basic Education Curriculum'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {language === 'hi' ? 'कक्षा 1 से 8 विस्तृत पाठ्यचर्या एवं विषय' : 'Classes 1 to 8 Academic Curriculum'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {language === 'hi'
            ? 'एससीईआरटी (SCERT) एवं बेसिक शिक्षा परिषद उत्तर प्रदेश द्वारा निर्धारित नवीनतम पाठ्यपुस्तकें, निपुण भारत दक्षताएं एवं मूल्यांकन व्यवस्था।'
            : 'State Board & NCERT aligned learning progression designed for foundational literacy, cognitive growth, and scientific inquiry.'}
        </p>
      </div>

      {/* Class Selector Pills */}
      <div className="flex items-center justify-center flex-wrap gap-2">
        {classes.map((cls) => {
          const isSelected = cls.id === selectedClassId;
          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-amber-400 shadow-md scale-105'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cls.name}
            </button>
          );
        })}
      </div>

      {/* Selected Class Details & Syllabus */}
      {currentClass && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  {currentClass.classNumber <= 5 
                    ? (language === 'hi' ? 'प्राथमिक स्तर (Primary 1-5)' : 'Primary Level')
                    : (language === 'hi' ? 'उच्च प्राथमिक स्तर (Upper Primary 6-8)' : 'Upper Primary Level')}
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {language === 'hi' ? 'सत्र 2025-26' : 'Session 2025-26'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                {currentClass.name} {language === 'hi' ? 'विषयवार विवरण एवं पुस्तकें' : 'Detailed Syllabus'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'hi'
                  ? `सक्रिय वर्ग: ${classSections.map(s => `सेक्शन ${s.sectionName}`).join(', ') || 'सेक्शन A एवं B'}`
                  : `Sections: ${classSections.map(s => `Section ${s.sectionName}`).join(', ') || 'Section A & B'}`}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">
                {language === 'hi' ? 'मूल्यांकन एवं परीक्षा प्रणाली:' : 'Assessment & Exam System:'}
              </div>
              <div>
                {language === 'hi' 
                  ? 'सत्रिक मासिक मूल्यांकन (Formative) + अर्द्धवार्षिक एवं वार्षिक परीक्षा (Summative)' 
                  : 'Monthly Formative Assessments + Half-Yearly & Annual Summative Exams'}
              </div>
            </div>
          </div>

          {/* Subjects Table / Cards */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>{language === 'hi' ? 'निर्धारित पाठ्यपुस्तकें एवं विषय सूची' : 'Prescribed Subjects & Evaluation Scheme'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classSubjects.map((sub) => (
                <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs bg-slate-200 text-slate-700">
                      {sub.subjectCode}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">
                      {language === 'hi' ? `पूर्णांक: ${sub.totalMarks}` : `Max: ${sub.totalMarks}`}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{sub.name}</h4>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span>{language === 'hi' ? `उत्तीर्णांक: ${sub.passingMarks}` : `Pass: ${sub.passingMarks}`}</span>
                    <span className="font-semibold text-amber-600">{language === 'hi' ? 'निःशुल्क SCERT पुस्तक' : 'SCERT Free'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special NIPUN Bharat Box for Primary Classes */}
          {currentClass.classNumber <= 3 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>{language === 'hi' ? 'निपुण भारत मिशन दक्षताएं (NIPUN Bharat FLN)' : 'NIPUN Bharat Mission FLN Targets'}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {language === 'hi'
                  ? 'कक्षा 1 से 3 के लिए भाषा (अर्थ के साथ पढ़ना व 30-60 शब्द प्रति मिनट प्रवाह) तथा गणित (संख्या पहचान, जोड़-घटाव) की बुनियादी दक्षताओं पर विशेष केंद्रित शिक्षण कार्य संकुल बैठकों के अनुसार कराया जाता है।'
                  : 'Special focus on foundational reading comprehension (30-60 words/min) and fundamental mathematics (numbers, basic arithmetic) under state FLN guidelines.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
