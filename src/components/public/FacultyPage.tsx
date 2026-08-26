import React, { useState, useMemo } from 'react';
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
  Users,
  Search,
  Filter,
  Building2,
  Calendar,
  Lock,
  Sparkles,
  PhoneCall,
  ArrowUpRight
} from 'lucide-react';

interface FacultyPageProps {
  onNavigate?: (page: string) => void;
}

export const FacultyPage: React.FC<FacultyPageProps> = ({ onNavigate }) => {
  const { teachers, teacherAssignments, language } = useSchool();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  // Filter teachers to only show those where showOnWebsite is true (or undefined for backward compatibility)
  const visibleTeachers = useMemo(() => {
    return teachers.filter(t => t.showOnWebsite !== false && t.status !== 'inactive');
  }, [teachers]);

  const getTeacherSubjects = (teacherId: string) => {
    const asgns = teacherAssignments.filter(a => a.teacherId === teacherId);
    const uniqueSubjects = Array.from(new Set(asgns.map(a => `${a.subjectName} (Class ${a.classNumber})`)));
    return uniqueSubjects;
  };

  const filteredTeachers = useMemo(() => {
    return visibleTeachers.filter(t => {
      const matchSearch = 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.designation && t.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.qualification && t.qualification.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.specialization && t.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.employeeId && t.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchRole = true;
      if (selectedRoleFilter === 'HEAD') {
        matchRole = t.designation.toLowerCase().includes('head') || t.designation.toLowerCase().includes('प्रधानाध्यापक');
      } else if (selectedRoleFilter === 'PRIMARY') {
        matchRole = t.designation.toLowerCase().includes('primary') || t.designation.toLowerCase().includes('प्राथमिक');
      } else if (selectedRoleFilter === 'UPPER') {
        matchRole = t.designation.toLowerCase().includes('upper') || t.designation.toLowerCase().includes('उच्च');
      } else if (selectedRoleFilter === 'SHIKSHA_MITRA') {
        matchRole = t.designation.toLowerCase().includes('mitra') || t.designation.toLowerCase().includes('मित्र');
      }

      return matchSearch && matchRole;
    });
  }, [visibleTeachers, searchTerm, selectedRoleFilter]);

  const publicContactCount = visibleTeachers.filter(t => t.showPhonePublicly && t.phone).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 overflow-x-hidden">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
          <UserCheck className="w-4 h-4 text-amber-600" />
          <span>{language === 'hi' ? 'उत्तर प्रदेश बेसिक शिक्षा परिषद — शिक्षक संवर्ग' : 'UP Basic Education — Teaching Faculty Directory'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {language === 'hi' ? 'हमारे योग्य एवं समर्पित शिक्षक वृंद' : 'Our Qualified Teaching Faculty'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {language === 'hi'
            ? 'बेसिक शिक्षा परिषद द्वारा चयनित, प्रशिक्षित एवं टीईटी (TET/CTET) उत्तीर्ण शिक्षक जो विद्यार्थियों के उज्ज्वल भविष्य निर्माण हेतु सेवारत हैं।'
            : 'Meet our government-certified teachers committed to mentoring students with foundational learning, modern pedagogy, and moral education.'}
        </p>

        {onNavigate && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('login-teacher')}
              className="px-5 py-2.5 rounded-xl bg-gov-navy-950 hover:bg-gov-navy-900 text-gov-amber-400 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer border border-gov-navy-800"
            >
              <Users className="w-4 h-4 text-gov-amber-400" />
              <span>{language === 'hi' ? 'शिक्षक एवं स्टॉफ लॉगिन' : 'Teacher Portal Login'}</span>
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 border border-slate-200"
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>{language === 'hi' ? 'विद्यालय कार्यालय संपर्क' : 'School Office Contact'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Stat Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{visibleTeachers.length}</div>
            <div className="text-[11px] font-semibold text-slate-500">
              {language === 'hi' ? 'स्वीकृत शिक्षक' : 'Faculty Listed'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">100%</div>
            <div className="text-[11px] font-semibold text-slate-500">
              {language === 'hi' ? 'प्रशिक्षित TET/B.Ed' : 'TET/B.Ed Certified'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{publicContactCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">
              {language === 'hi' ? 'सार्वजनिक संपर्क उपलब्ध' : 'Direct Contacts'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">09290205902</div>
            <div className="text-[11px] font-semibold text-slate-500">
              {language === 'hi' ? 'UDISE संवर्ग कोड' : 'Official UDISE'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'hi' ? 'शिक्षक का नाम, विषय या पद खोजें...' : 'Search by name, subject, or designation...'}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', labelHi: 'समस्त शिक्षक', labelEn: 'All Faculty' },
              { id: 'HEAD', labelHi: 'प्रधानाध्यापक', labelEn: 'Headmaster' },
              { id: 'PRIMARY', labelHi: 'प्राथमिक शिक्षक', labelEn: 'Primary' },
              { id: 'UPPER', labelHi: 'उच्च प्राथमिक', labelEn: 'Upper Primary' },
              { id: 'SHIKSHA_MITRA', labelHi: 'शिक्षामित्र', labelEn: 'Shiksha Mitra' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedRoleFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedRoleFilter === f.id
                    ? 'bg-gov-amber-500 text-gov-navy-950 shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {language === 'hi' ? f.labelHi : f.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">
            {language === 'hi' ? 'कोई शिक्षक रिकॉर्ड नहीं मिला' : 'No faculty matching criteria'}
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'hi' ? 'कृपया अपनी खोज अथवा फ़िल्टर को बदलकर पुनः प्रयास करें।' : 'Try adjusting your search query or filter.'}
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedRoleFilter('ALL'); }}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 cursor-pointer"
          >
            {language === 'hi' ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => {
            const subjects = getTeacherSubjects(teacher.id);
            const hasPublicPhone = teacher.showPhonePublicly && teacher.phone;

            return (
              <div 
                key={teacher.id} 
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group"
              >
                {/* Top Banner & Photo */}
                <div className="bg-gradient-to-r from-gov-navy-950 via-slate-900 to-gov-navy-950 p-6 flex items-center gap-4 text-white relative">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-amber-500 overflow-hidden shrink-0 shadow-md">
                    {teacher.photoURL ? (
                      <img 
                        src={teacher.photoURL} 
                        alt={teacher.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-amber-400 text-xl bg-gov-navy-900">
                        {teacher.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <h3 className="font-black text-base text-white truncate group-hover:text-amber-300 transition-colors">{teacher.name}</h3>
                    <div className="text-xs text-amber-400 font-semibold truncate">{teacher.designation}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{teacher.employeeId}</div>
                  </div>
                </div>

                {/* Teacher Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-xs">
                  <div className="space-y-3">
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

                    {/* Public Contact Number (if teacher allowed) */}
                    <div>
                      <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider mb-1">
                        {language === 'hi' ? 'संपर्क मोबाइल:' : 'Contact Mobile:'}
                      </span>
                      {hasPublicPhone ? (
                        <div className="flex items-center gap-2">
                          <a 
                            href={`tel:${teacher.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold hover:bg-emerald-100 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{teacher.phone}</span>
                          </a>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            {language === 'hi' ? '(अनुमति प्राप्त)' : '(Authorized)'}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-medium">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>{language === 'hi' ? 'गोपनीय (कार्यालय द्वारा संपर्क)' : 'Protected (School Office Only)'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider mb-1">
                        {language === 'hi' ? 'आवंटित विषय एवं कक्षाएं:' : 'Assigned Subjects & Classes:'}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {subjects.length > 0 ? (
                          subjects.map((sub, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-semibold text-[11px]"
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
                    <span className="flex items-center gap-1 font-bold text-emerald-700">
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
      )}
    </div>
  );
};

