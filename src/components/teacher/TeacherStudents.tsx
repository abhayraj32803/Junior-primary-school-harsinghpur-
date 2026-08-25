import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  Users, 
  GraduationCap, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  CalendarCheck2, 
  Award, 
  BookOpenCheck,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Download,
  Printer,
  Eye,
  FileSpreadsheet,
  LayoutGrid,
  List,
  ChevronRight,
  TrendingUp,
  Percent,
  MapPin,
  MessageCircle,
  Building,
  Sparkles,
  Info
} from 'lucide-react';
import { Student } from '../../types';
import { Student360Modal } from '../common/Student360Modal';

export const TeacherStudents: React.FC = () => {
  const { userProfile } = useAuth();
  const { 
    students, 
    teachers, 
    teacherAssignments, 
    classes, 
    sections, 
    attendance, 
    marks, 
    getStudentAttendanceStats, 
    language 
  } = useSchool();

  const currentTeacher = teachers.find(t => t.id === userProfile?.linkedEntityId) || teachers[0];
  const myAssignments = teacherAssignments.filter(a => a.teacherId === currentTeacher?.id);
  const myClassIds = useMemo(() => new Set(myAssignments.map(a => a.classId)), [myAssignments]);

  const [selectedClassTab, setSelectedClassTab] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'all' | 'Male' | 'Female' | 'Other'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedStudentFor360, setSelectedStudentFor360] = useState<Student | null>(null);

  // Compute student count per class (1 to 8)
  const classBreakdown = useMemo(() => {
    const counts: { [key: number]: { total: number; boys: number; girls: number; name: string; isAssigned: boolean } } = {};
    for (let c = 1; c <= 8; c++) {
      const classObj = classes.find(cls => Number(cls.classNumber) === c);
      const isAssigned = classObj ? myClassIds.has(classObj.id) : false;
      const classStudents = students.filter(s => s.classNumber === c && s.status === 'active');
      const boys = classStudents.filter(s => s.gender === 'Male').length;
      const girls = classStudents.filter(s => s.gender === 'Female').length;
      counts[c] = {
        total: classStudents.length,
        boys,
        girls,
        name: classObj?.name || `Class ${c}`,
        isAssigned
      };
    }
    return counts;
  }, [classes, students, myClassIds]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Class Filter
      if (selectedClassTab !== 'all' && student.classNumber !== selectedClassTab) {
        return false;
      }
      // Gender Filter
      if (selectedGender !== 'all' && student.gender !== selectedGender) {
        return false;
      }
      // Category Filter
      if (selectedCategory !== 'all' && student.category !== selectedCategory) {
        return false;
      }
      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesAdm = student.admissionNumber.toLowerCase().includes(query);
        const matchesRoll = student.rollNumber.includes(query);
        const matchesFather = student.fatherName.toLowerCase().includes(query);
        const matchesMobile = student.mobile.includes(query);
        if (!matchesName && !matchesAdm && !matchesRoll && !matchesFather && !matchesMobile) {
          return false;
        }
      }
      return true;
    });
  }, [students, selectedClassTab, selectedGender, selectedCategory, searchQuery]);

  // Selected class stats
  const activeClassStats = useMemo(() => {
    const total = filteredStudents.length;
    const boys = filteredStudents.filter(s => s.gender === 'Male').length;
    const girls = filteredStudents.filter(s => s.gender === 'Female').length;
    return { total, boys, girls };
  }, [filteredStudents]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Roll No',
      'Admission No',
      'Student Name',
      'Class & Section',
      'Gender',
      'Father Name',
      'Mother Name',
      'Mobile',
      'Category',
      'Attendance %',
      'Status'
    ];

    const rows = filteredStudents.map(s => {
      const stats = getStudentAttendanceStats(s.id);
      return [
        `"${s.rollNumber}"`,
        `"${s.admissionNumber}"`,
        `"${s.name}"`,
        `"Class ${s.classNumber}-${s.sectionName}"`,
        `"${s.gender}"`,
        `"${s.fatherName}"`,
        `"${s.motherName}"`,
        `"${s.mobile}"`,
        `"${s.category}"`,
        `"${stats.percentage}%"`,
        `"${s.status}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Class_${selectedClassTab}_Students_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Roster
  const handlePrintRoster = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'संस्थागत छात्र प्रबंधन प्रणाली (College/School SIS)' : 'Student Information & Academic Records'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {language === 'hi' ? 'कक्षा-वार छात्र रजिस्टर एवं डेटा प्रबंधन' : 'Class Rosters & Student 360° Data'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {language === 'hi' 
              ? 'प्रत्येक कक्षा के छात्र-छात्राओं की पूरी जानकारी देखें: उपस्थिति, परीक्षा परिणाम, अभिभावक संपर्क, दस्तावेज़ एवं अकादमिक प्रगति।' 
              : 'Access complete master records for each class: attendance rate, examination progress, parent contacts, student documents, and academic profile.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{language === 'hi' ? 'CSV डाउनलोड करें' : 'Export CSV'}</span>
          </button>
          <button
            onClick={handlePrintRoster}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'hi' ? 'रजिस्टर प्रिंट करें' : 'Print Roster'}</span>
          </button>
        </div>
      </div>

      {/* Class Selector Matrix Pills (Classes 1 to 8 + All) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-4 h-4 text-amber-600" />
            <span>{language === 'hi' ? 'कक्षा चयन एवं छात्र संख्या (Class Rosters):' : 'Select Class Roster:'}</span>
          </span>
          <span className="text-xs font-bold text-slate-500">
            {language === 'hi' ? `कुल नामांकित: ${students.length} छात्र` : `Total School Enrollment: ${students.length}`}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {/* All Classes Button */}
          <button
            onClick={() => setSelectedClassTab('all')}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
              selectedClassTab === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md font-black'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span className="text-[11px] font-bold">{language === 'hi' ? 'सभी कक्षाएं' : 'All Classes'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${selectedClassTab === 'all' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'}`}>
              {students.length}
            </span>
          </button>

          {/* Individual Classes 1-8 */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map(classNum => {
            const data = classBreakdown[classNum];
            const isSelected = selectedClassTab === classNum;
            return (
              <button
                key={classNum}
                onClick={() => setSelectedClassTab(classNum)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md font-black ring-2 ring-amber-400/50'
                    : 'bg-white hover:bg-amber-50/50 text-slate-800 border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-1 text-xs font-black">
                  <span>Class {classNum}</span>
                  {data?.isAssigned && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="Assigned Class" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${isSelected ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-900'}`}>
                    {data?.total || 0}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">({data?.boys || 0}B/{data?.girls || 0}G)</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Strip for Current Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">
              {selectedClassTab === 'all' ? (language === 'hi' ? 'कुल छात्र' : 'Total Students') : (language === 'hi' ? `कक्षा ${selectedClassTab} कुल` : `Class ${selectedClassTab} Enrolled`)}
            </div>
            <div className="text-xl font-black text-slate-900">{activeClassStats.total} {language === 'hi' ? 'छात्र' : 'Students'}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">{language === 'hi' ? 'छात्र (Boys)' : 'Boys Enrolled'}</div>
            <div className="text-xl font-black text-slate-900">{activeClassStats.boys}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-900 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">{language === 'hi' ? 'छात्राएं (Girls)' : 'Girls Enrolled'}</div>
            <div className="text-xl font-black text-slate-900">{activeClassStats.girls}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">{language === 'hi' ? 'सक्रिय स्थिति' : 'Active Enrollment'}</div>
            <div className="text-xl font-black text-emerald-700">100% {language === 'hi' ? 'सत्यापित' : 'Verified'}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'नाम, प्रवेश क्रमांक, रोल नं, पिता का नाम या मोबाइल द्वारा खोजें...' : 'Search by Name, Admission No, Roll No, Father Name, Mobile...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">{language === 'hi' ? 'सभी लिंग (All)' : 'All Genders'}</option>
            <option value="Male">{language === 'hi' ? 'छात्र (Boys)' : 'Boys'}</option>
            <option value="Female">{language === 'hi' ? 'छात्राएं (Girls)' : 'Girls'}</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">{language === 'hi' ? 'सभी श्रेणियां (Category)' : 'All Categories'}</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 space-y-2">
          <GraduationCap className="w-12 h-12 mx-auto text-slate-400" />
          <div className="text-base font-black text-slate-800">
            {language === 'hi' ? 'कोई छात्र रिकॉर्ड नहीं मिला' : 'No Students Found'}
          </div>
          <p className="text-xs max-w-sm mx-auto text-slate-500">
            {language === 'hi' ? 'कृपया अपनी खोज या फ़िल्टर विकल्प बदलें।' : 'Try adjusting your search query or class filter.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* College-Grade Master SIS Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase text-[11px] tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Student & Admission No</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Parents Details</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Category / Blood</th>
                  <th className="py-3 px-4 text-center">Attendance Rate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => {
                  const stats = getStudentAttendanceStats(student.id);
                  const isHighAttendance = stats.percentage >= 75;
                  return (
                    <tr key={student.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        #{student.rollNumber || String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{student.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Adm: {student.admissionNumber} • {student.gender}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-black text-[10px]">
                          Class {student.classNumber}-{student.sectionName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-semibold">{student.fatherName}</div>
                        <div className="text-[10px] text-slate-400">M: {student.motherName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${student.mobile}`}
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-amber-700 font-medium"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{student.mobile}</span>
                          </a>
                          <a
                            href={`https://wa.me/91${student.mobile.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded-sm hover:bg-emerald-50"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-bold text-[10px] mr-1">
                          {student.category}
                        </span>
                        <span className="inline-block px-1.5 py-0.5 rounded-sm bg-rose-50 text-rose-700 font-bold text-[10px]">
                          {student.bloodGroup || 'O+'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-black text-xs">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            isHighAttendance ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {stats.percentage}%
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {stats.presentDays}/{stats.totalDays} days
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedStudentFor360(student)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-2xs transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{language === 'hi' ? 'पूरा डेटा (360°)' : 'Student 360°'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const stats = getStudentAttendanceStats(student.id);
            return (
              <div 
                key={student.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Adm: {student.admissionNumber} • Roll: {student.rollNumber}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                      Class {student.classNumber}-{student.sectionName}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Father/Guardian:</span>
                      <span className="font-semibold text-slate-800">{student.fatherName}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Contact:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {student.mobile}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Category & Blood:</span>
                      <span className="font-semibold text-slate-800">{student.category} • {student.bloodGroup}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Attendance:</span>
                      <span className={`font-black ${stats.percentage >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {stats.percentage}% ({stats.presentDays} days)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Student</span>
                  </span>

                  <button
                    onClick={() => setSelectedStudentFor360(student)}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors cursor-pointer"
                  >
                    View 360° Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Student 360 Modal for Teacher View */}
      {selectedStudentFor360 && (
        <Student360Modal
          isOpen={!!selectedStudentFor360}
          onClose={() => setSelectedStudentFor360(null)}
          student={selectedStudentFor360}
          canManageDocuments={true}
        />
      )}
    </div>
  );
};

