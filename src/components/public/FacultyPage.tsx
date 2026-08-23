import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Teacher } from '../../types';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  Award, 
  BookOpen, 
  CheckCircle, 
  ShieldCheck, 
  UserCheck,
  AlertCircle,
  Users
} from 'lucide-react';

interface FacultyPageProps {
  onNavigate?: (page: string) => void;
}

export const FacultyPage: React.FC<FacultyPageProps> = ({ onNavigate }) => {
  const { teachers, teacherAssignments, language } = useSchool();

  const getTeacherSubjects = (teacherId: string) => {
    const asgns = teacherAssignments.filter(a => a.teacherId === teacherId);
    const uniqueSubjects = Array.from(new Set(asgns.map(a => `${a.subjectName} (Class ${a.classNumber})`)));
    return uniqueSubjects;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10 overflow-x-hidden">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <UserCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'hi' ? 'उत्तर प्रदेश बेसिक शिक्षा परिषद शिक्षक संवर्ग' : 'UP Basic Education Teaching Cadre'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {language === 'hi' ? 'हमारे योग्य एवं समर्पित शिक्षक वृंद' : 'Our Qualified Teaching Faculty'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {language === 'hi'
            ? 'बेसिक शिक्षा परिषद द्वारा चयनित, प्रशिक्षित एवं टीईटी (TET/CTET) उत्तीर्ण शिक्षक जो विद्यार्थियों के उज्ज्वल भविष्य निर्माण हेतु सेवारत हैं।'
            : 'Meet our dedicated, government-certified teachers committed to mentoring students across foundational, primary, and upper-primary classes.'}
        </p>

        {onNavigate && (
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => onNavigate('login-teacher')}
              className="px-5 py-2.5 rounded-2xl bg-gov-navy-950 hover:bg-gov-navy-900 text-gov-amber-400 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer border border-gov-navy-800"
            >
              <Users className="w-4 h-4 text-gov-amber-400" />
              <span>{language === 'hi' ? 'शिक्षक एवं स्टॉफ पोर्टल लॉगिन करें →' : 'Teacher & Staff ERP Login →'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => {
          const subjects = getTeacherSubjects(teacher.id);
          return (
            <div 
              key={teacher.id} 
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all"
            >
              {/* Top Banner & Photo */}
              <div className="bg-slate-900 p-6 flex items-center gap-4 text-white relative">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-amber-500 overflow-hidden shrink-0">
                  {teacher.photoURL ? (
                    <img 
                      src={teacher.photoURL} 
                      alt={teacher.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-amber-400 text-xl">
                      {teacher.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="truncate">
                  <h3 className="font-extrabold text-base text-white truncate">{teacher.name}</h3>
                  <div className="text-xs text-amber-400 font-semibold">{teacher.designation}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{teacher.employeeId}</div>
                </div>
              </div>

              {/* Teacher Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-xs">
                <div className="space-y-2.5">
                  <div>
                    <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">
                      {language === 'hi' ? 'शैक्षणिक योग्यता:' : 'Academic Qualifications:'}
                    </span>
                    <div className="font-bold text-slate-800 text-xs mt-0.5">{teacher.qualification}</div>
                  </div>

                  {teacher.specialization && (
                    <div>
                      <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">
                        {language === 'hi' ? 'विशेषज्ञता / संवर्ग:' : 'Domain Specialization:'}
                      </span>
                      <div className="font-medium text-slate-700">{teacher.specialization}</div>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider mb-1">
                      {language === 'hi' ? 'आवंटित विषय एवं कक्षाएं:' : 'Assigned Subjects & Classes:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {subjects.length > 0 ? (
                        subjects.map((sub, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]"
                          >
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">
                          {language === 'hi' ? 'प्राथमिक कक्षाएं (समस्त विषय)' : 'Primary All Subjects'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{language === 'hi' ? 'सत्यापित शिक्षक' : 'Verified Faculty'}</span>
                  </span>
                  <span className="font-mono text-slate-400">UDISE: 09290205902</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
