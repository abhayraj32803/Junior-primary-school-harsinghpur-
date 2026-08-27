import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceStatus, Student } from '../../types';
import { 
  CalendarCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save, 
  Calendar, 
  Users, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Eye, 
  EyeOff, 
  Phone, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Info, 
  UserCheck, 
  FileSpreadsheet, 
  Table, 
  LayoutGrid, 
  CheckSquare, 
  AlertTriangle,
  BookOpen,
  Building2,
  CalendarDays,
  MessageSquareText,
  Lock,
  GraduationCap
} from 'lucide-react';
import { Student360Modal } from '../common/Student360Modal';

export const TeacherAttendance: React.FC = () => {
  const { userProfile } = useAuth();
  const { 
    students, 
    teachers, 
    teacherAssignments, 
    attendance, 
    classes, 
    sections, 
    settings, 
    saveBulkAttendance,
    language 
  } = useSchool();

  // 1. Resolve current logged-in teacher & teaching assignments
  const currentTeacher = useMemo(() => {
    return teachers.find(t => 
      (userProfile?.linkedEntityId && t.id === userProfile.linkedEntityId) ||
      (userProfile?.uid && (t.id === userProfile.uid || t.userId === userProfile.uid)) ||
      (userProfile?.email && t.email && t.email.toLowerCase() === userProfile.email.toLowerCase()) ||
      (userProfile?.name && t.name && t.name.toLowerCase() === userProfile.name.toLowerCase())
    ) || teachers.find(t => t.id === 'tch-kiran-shakya') || teachers[0];
  }, [teachers, userProfile]);

  const designationLower = (currentTeacher?.designation || '').toLowerCase();
  const isHeadTeacherOrAdmin = 
    userProfile?.role === 'admin' || 
    designationLower.includes('head') || 
    designationLower.includes('principal') || 
    designationLower.includes('in-charge') ||
    designationLower.includes('प्रधानाध्यापक') ||
    designationLower.includes('प्रधानाध्यापिका');

  // Teacher's authorized assignments
  const myAssignments = useMemo(() => {
    return teacherAssignments.filter(a => a.teacherId === currentTeacher?.id);
  }, [teacherAssignments, currentTeacher]);

  // Allowed classes for this teacher
  const allowedClasses = useMemo(() => {
    if (isHeadTeacherOrAdmin || myAssignments.some(a => a.classId === 'all' || String(a.classNumber).includes('1–8') || String(a.classNumber).toLowerCase().includes('all'))) {
      return [1, 2, 3, 4, 5, 6, 7, 8];
    }
    const classNums = myAssignments
      .map(a => Number(a.classNumber))
      .filter(num => !isNaN(num) && num >= 1 && num <= 8);
    return classNums.length > 0 ? Array.from(new Set(classNums)).sort((a: number, b: number) => a - b) : [1, 2, 3, 4, 5, 6, 7, 8];
  }, [isHeadTeacherOrAdmin, myAssignments]);

  // Initial Class & Section selection
  const defaultClassNumber = allowedClasses[0] || 5;
  const defaultSection = myAssignments.find(a => Number(a.classNumber) === defaultClassNumber)?.sectionName || 'A';

  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedClassNumber, setSelectedClassNumber] = useState<number>(defaultClassNumber);
  const [selectedSection, setSelectedSection] = useState<string>(defaultSection);
  
  // UI States
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'half_day' | 'unmarked'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [sortBy, setSortBy] = useState<'roll' | 'name'>('roll');
  const [unmaskedStudents, setUnmaskedStudents] = useState<Record<string, boolean>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [selectedStudentFor360, setSelectedStudentFor360] = useState<Student | null>(null);
  
  // Save status & feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Month for Monthly Register View
  const [monthlyYearMonth, setMonthlyYearMonth] = useState<string>(() => new Date().toISOString().slice(0, 7)); // YYYY-MM

  // Ensure selected class is within allowed classes
  useEffect(() => {
    if (!allowedClasses.includes(selectedClassNumber)) {
      setSelectedClassNumber(allowedClasses[0] || 1);
    }
  }, [allowedClasses, selectedClassNumber]);

  // Filter students for the active Class and Section
  const classStudents = useMemo(() => {
    const list = students.filter(
      s => Number(s.classNumber) === Number(selectedClassNumber) && 
           (s.sectionName || 'A').toUpperCase() === selectedSection.toUpperCase() && 
           s.status === 'active'
    );

    // Sort by Roll Number, fallback to Name
    return list.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      const rollA = parseInt(a.rollNumber || '0', 10);
      const rollB = parseInt(b.rollNumber || '0', 10);
      if (!isNaN(rollA) && !isNaN(rollB) && rollA !== 0 && rollB !== 0) {
        return rollA - rollB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [students, selectedClassNumber, selectedSection, sortBy]);

  // Local Attendance State for active date & class
  const [localAttendance, setLocalAttendance] = useState<Record<string, AttendanceStatus>>({});

  // Sync local attendance when date, class, or section changes
  useEffect(() => {
    const statusMap: Record<string, AttendanceStatus> = {};
    const remarks: Record<string, string> = {};
    
    classStudents.forEach(student => {
      const existing = attendance.find(a => 
        a.studentId === student.id && 
        a.date === selectedDate &&
        (a.classNumber ? Number(a.classNumber) === Number(selectedClassNumber) : true)
      );

      if (existing) {
        statusMap[student.id] = (existing.status === 'half-day' || existing.status === 'half_day') 
          ? 'half_day' 
          : existing.status === 'absent' 
          ? 'absent' 
          : existing.status === 'late' 
          ? 'late' 
          : 'present';
        if (existing.remarks) {
          remarks[student.id] = existing.remarks;
        }
      } else {
        // Default to 'present' for convenient fast-flow attendance logging
        statusMap[student.id] = 'present';
      }
    });

    setLocalAttendance(statusMap);
    setRemarksMap(remarks);
    setHasUnsavedChanges(false);
  }, [selectedDate, selectedClassNumber, selectedSection, classStudents, attendance]);

  // Check if selected date is a Sunday or Gazetted Holiday
  const holidayInfo = useMemo(() => {
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday
    const isSunday = dayOfWeek === 0;

    const matchedHoliday = settings?.academicHolidays?.find(h => {
      if (!h.isActive) return false;
      if (h.startDate === selectedDate) return true;
      if (h.endDate && selectedDate >= h.startDate && selectedDate <= h.endDate) return true;
      return false;
    });

    return {
      isSunday,
      isHoliday: isSunday || !!matchedHoliday,
      holidayName: isSunday ? (language === 'hi' ? 'रविवार (साप्ताहिक अवकाश)' : 'Sunday (Weekly Holiday)') : (language === 'hi' ? matchedHoliday?.titleHi || matchedHoliday?.titleEn : matchedHoliday?.titleEn),
      type: matchedHoliday?.type || (isSunday ? 'Weekly Holiday' : '')
    };
  }, [selectedDate, settings?.academicHolidays, language]);

  // Handle single student status change
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    setHasUnsavedChanges(true);
  };

  // Handle remark change
  const handleRemarkChange = (studentId: string, text: string) => {
    setRemarksMap(prev => ({
      ...prev,
      [studentId]: text
    }));
    setHasUnsavedChanges(true);
  };

  // Batch actions
  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach(s => {
      updated[s.id] = status;
    });
    setLocalAttendance(updated);
    setHasUnsavedChanges(true);
  };

  // Reset to saved state
  const handleReset = () => {
    const statusMap: Record<string, AttendanceStatus> = {};
    const remarks: Record<string, string> = {};
    classStudents.forEach(student => {
      const existing = attendance.find(a => a.studentId === student.id && a.date === selectedDate);
      statusMap[student.id] = existing ? existing.status : 'present';
      if (existing?.remarks) remarks[student.id] = existing.remarks;
    });
    setLocalAttendance(statusMap);
    setRemarksMap(remarks);
    setHasUnsavedChanges(false);
  };

  // Toggle Parent contact masking
  const toggleMask = (studentId: string) => {
    setUnmaskedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Quick Date Jump
  const handleDateShift = (days: number) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Save Attendance Register with backend verification
  const handleSaveRegister = async () => {
    if (classStudents.length === 0) {
      setErrorMessage(language === 'hi' ? 'इस कक्षा में कोई नामांकित छात्र नहीं है।' : 'No active students found in this class & section.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccessMessage(null);

    const records = classStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      classId: `class-${selectedClassNumber}`,
      classNumber: selectedClassNumber,
      sectionId: `sec-${selectedClassNumber}-${selectedSection}`,
      sectionName: selectedSection,
      date: selectedDate,
      status: localAttendance[student.id] || 'present',
      remarks: remarksMap[student.id] || '',
      markedBy: currentTeacher?.name || userProfile?.name || 'Class Teacher',
      markedByRole: (userProfile?.role === 'admin' ? 'admin' : 'teacher') as any
    }));

    try {
      const result = await saveBulkAttendance(
        records,
        `class-${selectedClassNumber}`,
        `sec-${selectedClassNumber}-${selectedSection}`,
        selectedDate,
        undefined,
        currentTeacher?.id
      );

      if (result.success) {
        setHasUnsavedChanges(false);
        const successText = language === 'hi'
          ? `कक्षा ${selectedClassNumber}-${selectedSection} की उपस्थिति दिनांक ${selectedDate} हेतु सफलतापूर्वक सुरक्षित एवं सत्यापित की गई! (${classStudents.length} छात्र)`
          : `Attendance register for Class ${selectedClassNumber}-${selectedSection} on ${selectedDate} successfully committed & verified! (${classStudents.length} students)`;
        setSaveSuccessMessage(successText);
        setTimeout(() => setSaveSuccessMessage(null), 5000);
      } else {
        setErrorMessage(result.error || 'Failed to save attendance record.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving attendance records.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered students for display in table/grid
  const filteredStudents = useMemo(() => {
    return classStudents.filter(student => {
      // Status filter
      if (statusFilter !== 'all') {
        const currStatus = localAttendance[student.id];
        if (statusFilter === 'present' && currStatus !== 'present') return false;
        if (statusFilter === 'absent' && currStatus !== 'absent') return false;
        if (statusFilter === 'half_day' && (currStatus !== 'half_day' && currStatus !== 'late')) return false;
      }

      // Gender filter
      if (genderFilter !== 'all' && student.gender !== genderFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesRoll = (student.rollNumber || '').toLowerCase().includes(query);
        const matchesAdm = (student.admissionNumber || '').toLowerCase().includes(query);
        const matchesId = (student.id || '').toLowerCase().includes(query);
        const matchesFather = (student.fatherName || '').toLowerCase().includes(query);
        const matchesGuardian = (student.guardianName || '').toLowerCase().includes(query);
        if (!matchesName && !matchesRoll && !matchesAdm && !matchesId && !matchesFather && !matchesGuardian) {
          return false;
        }
      }

      return true;
    });
  }, [classStudents, statusFilter, genderFilter, searchQuery, localAttendance]);

  // Statistics calculation for the current class/date
  const stats = useMemo(() => {
    const total = classStudents.length;
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let late = 0;

    classStudents.forEach(s => {
      const st = localAttendance[s.id] || 'present';
      if (st === 'present') present++;
      else if (st === 'absent') absent++;
      else if (st === 'half_day') halfDay++;
      else if (st === 'late') late++;
    });

    const effectivePresent = present + (halfDay * 0.5) + (late * 0.8);
    const percentage = total > 0 ? Math.round((effectivePresent / total) * 100) : 0;

    return { total, present, absent, halfDay, late, percentage };
  }, [classStudents, localAttendance]);

  // Print Official Daily Register Sheet
  const handlePrintDailyRegister = () => {
    window.print();
  };

  // Export Daily Register to CSV
  const handleExportCSV = () => {
    const headers = ["Roll No", "Admission No", "Student Name", "Gender", "Father Name", "Contact Mobile", "Date", "Class", "Section", "Status", "Remarks"];
    const rows = classStudents.map(s => [
      s.rollNumber || '',
      s.admissionNumber || '',
      `"${s.name.replace(/"/g, '""')}"`,
      s.gender,
      `"${(s.fatherName || s.guardianName || '').replace(/"/g, '""')}"`,
      s.mobile || s.phone || '',
      selectedDate,
      `Class ${selectedClassNumber}`,
      selectedSection,
      (localAttendance[s.id] || 'present').toUpperCase(),
      `"${(remarksMap[s.id] || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Register_Class_${selectedClassNumber}_${selectedSection}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Days array for Monthly View
  const monthlyDays = useMemo(() => {
    const [yearStr, monthStr] = monthlyYearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `${yearStr}-${monthStr.padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const d = new Date(year, month - 1, dayNum);
      const isSunday = d.getDay() === 0;
      return { dayNum, dateStr, isSunday, dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }) };
    });
  }, [monthlyYearMonth]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Institutional Auth Badge */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
              <CalendarCheck2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {language === 'hi' ? 'डिजिटल छात्र उपस्थिति पंजिका' : 'Digital Student Attendance Register'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{language === 'hi' ? 'सत्यापित पोर्टल' : 'Official Portal'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                <span>{settings.schoolName}</span>
                <span>•</span>
                <span className="font-mono text-slate-400">UDISE: {settings.udiseCode}</span>
                <span>•</span>
                <span className="text-amber-700 font-semibold">{language === 'hi' ? 'सत्र 2025-2026' : 'Session 2025–2026'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Save & Mode switch */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'daily'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'दैनिक पंजिका' : 'Daily Register'}</span>
            </button>

            <button
              onClick={() => setViewMode('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'मासिक मैट्रिक्स' : 'Monthly Sheet'}</span>
            </button>
          </div>

          <button
            onClick={handleSaveRegister}
            disabled={isSaving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 ring-2 ring-amber-400/50 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
            id="btn-teacher-save-attendance-main"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>
              {isSaving
                ? (language === 'hi' ? 'सुरक्षित हो रहा है...' : 'Saving...')
                : hasUnsavedChanges
                ? (language === 'hi' ? 'पंजिका सुरक्षित करें (Unsaved)' : 'Commit Changes (Unsaved)')
                : (language === 'hi' ? 'पंजिका सुरक्षित करें' : 'Save Register')}
            </span>
          </button>
        </div>
      </div>

      {/* Teacher Authorization Context Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {language === 'hi' ? 'अधिकृत कक्षा अध्यापक' : 'Designated Class Teacher'}
              </span>
              <span className="text-amber-400 font-bold text-xs">• {currentTeacher?.name}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentTeacher?.designation || 'Assistant Teacher'} • {language === 'hi' ? 'आवंटित कक्षाएं:' : 'Assigned Scope:'} {
                isHeadTeacherOrAdmin 
                  ? (language === 'hi' ? 'कक्षा 1 से 8 (प्रधानाध्यापक प्रशासनिक पहुंच)' : 'Classes 1–8 (Headmaster Full Scope)')
                  : `Class ${allowedClasses.join(', ')} (Section ${selectedSection})`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">{language === 'hi' ? 'स्थिति:' : 'Access Level:'}</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30 flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>{isHeadTeacherOrAdmin ? 'Admin / Full Access' : 'Verified Class Teacher'}</span>
          </span>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {saveSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-bold">{saveSuccessMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 flex items-center gap-3 shadow-xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="font-bold">{errorMessage}</div>
        </div>
      )}

      {/* Holiday / Weekend Warning Banner */}
      {holidayInfo.isHoliday && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-extrabold">{language === 'hi' ? 'अवकाश सूचना:' : 'Holiday / Non-Instructional Day:'}</span>{' '}
              <span>{holidayInfo.holidayName}</span>
              <p className="text-[11px] text-amber-700 mt-0.5">
                {language === 'hi' 
                  ? 'चयनित तिथि अवकाश दिवस है। यदि विशेष बाल सभा, खेलकूद या अतिरिक्त शिक्षण सत्र आयोजित हुआ है तो उपस्थिति अंकित की जा सकती है।' 
                  : 'Selected date is a scheduled school holiday / non-instructional day. Attendance can still be recorded for special events or remedial sessions.'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-200/80 text-amber-900 font-bold text-[10px] uppercase shrink-0">
            {holidayInfo.type || 'Holiday'}
          </span>
        </div>
      )}

      {/* 2. Control Panel & Date Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Date Picker with Quick Jump Buttons */}
          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {language === 'hi' ? 'उपस्थिति दिनांक (Date)' : 'Register Date'}
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleDateShift(-1)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                title={language === 'hi' ? 'पिछला दिन' : 'Previous Day'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative flex-1">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs font-bold text-slate-900 transition-colors"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              <button
                onClick={() => handleDateShift(1)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                title={language === 'hi' ? 'अगला दिन' : 'Next Day'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleSetToday}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-xs font-bold border border-slate-200 transition-colors shrink-0"
              >
                {language === 'hi' ? 'आज (Today)' : 'Today'}
              </button>
            </div>
          </div>

          {/* Class Selector (Restricted to Authorized Classes) */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {language === 'hi' ? 'कक्षा (Class)' : 'Assigned Class'}
            </label>
            <select
              value={selectedClassNumber}
              onChange={(e) => setSelectedClassNumber(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs font-bold text-slate-900 transition-colors"
            >
              {allowedClasses.map(num => (
                <option key={num} value={num}>
                  {language === 'hi' ? `कक्षा ${num} (Class ${num})` : `Class ${num}`}
                </option>
              ))}
            </select>
          </div>

          {/* Section Selector */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {language === 'hi' ? 'अनुभाग (Section)' : 'Section'}
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs font-bold text-slate-900 transition-colors"
            >
              <option value="A">{language === 'hi' ? 'अनुभाग A (Section A)' : 'Section A'}</option>
              <option value="B">{language === 'hi' ? 'अनुभाग B (Section B)' : 'Section B'}</option>
              <option value="C">{language === 'hi' ? 'अनुभाग C (Section C)' : 'Section C'}</option>
            </select>
          </div>
        </div>

        {/* 3. Live Metric Statistics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              {language === 'hi' ? 'कुल नामांकित' : 'Total Enrolled'}
            </span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">{stats.total}</span>
          </div>

          <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block flex items-center justify-between">
              <span>{language === 'hi' ? 'उपस्थित (P)' : 'Present (P)'}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-emerald-700">{stats.present}</span>
              <span className="text-[11px] font-bold text-emerald-600">
                ({stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="bg-red-50/80 p-3 rounded-2xl border border-red-200">
            <span className="text-[10px] font-bold text-red-800 uppercase block flex items-center justify-between">
              <span>{language === 'hi' ? 'अनुपस्थित (A)' : 'Absent (A)'}</span>
              <XCircle className="w-3.5 h-3.5 text-red-600" />
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-red-700">{stats.absent}</span>
              <span className="text-[11px] font-bold text-red-600">
                ({stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block flex items-center justify-between">
              <span>{language === 'hi' ? 'अर्ध-दिवस (H)' : 'Half-Day (H)'}</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-amber-700">{stats.halfDay + stats.late}</span>
              <span className="text-[11px] font-bold text-amber-600">
                ({stats.total > 0 ? Math.round(((stats.halfDay + stats.late) / stats.total) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 sm:col-span-2 lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-900 uppercase">
                {language === 'hi' ? 'दैनिक उपस्थिति दर' : 'Attendance Rate'}
              </span>
              <span className="text-xs font-black text-blue-900">{stats.percentage}%</span>
            </div>
            <div className="w-full bg-blue-200/80 rounded-full h-2 mt-1.5 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${
                  stats.percentage >= 80 ? 'bg-emerald-500' : stats.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. Quick Batch Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              {language === 'hi' ? 'त्वरित क्रियाएं:' : 'Batch Actions:'}
            </span>
            <button
              onClick={() => handleMarkAll('present')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'सभी को उपस्थित करें' : 'Mark All Present'}</span>
            </button>

            <button
              onClick={() => handleMarkAll('absent')}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'सभी को अनुपस्थित करें' : 'Mark All Absent'}</span>
            </button>

            {hasUnsavedChanges && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>{language === 'hi' ? 'रीसेट (Reset)' : 'Reset Edits'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintDailyRegister}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              title={language === 'hi' ? 'पंजिका प्रिंट करें' : 'Print Register'}
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              title={language === 'hi' ? 'CSV निर्यात करें' : 'Export CSV'}
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* DAILY REGISTER VIEW */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          {/* Search & In-Register Filters */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder={language === 'hi' ? 'नाम, रोल नंबर, प्रवेश संख्या से खोजें...' : 'Search student by Name, Roll No, Father...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All ({classStudents.length})
                </button>
                <button
                  onClick={() => setStatusFilter('present')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'present' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  P ({stats.present})
                </button>
                <button
                  onClick={() => setStatusFilter('absent')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'absent' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  A ({stats.absent})
                </button>
                <button
                  onClick={() => setStatusFilter('half_day')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'half_day' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  H ({stats.halfDay + stats.late})
                </button>
              </div>

              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="all">All Genders</option>
                <option value="Male">Boys (छात्र)</option>
                <option value="Female">Girls (छात्रा)</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="roll">Sort by Roll No</option>
                <option value="name">Sort by Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Student Register Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredStudents.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="font-bold text-slate-700 text-sm">
                  {language === 'hi' ? 'कोई विद्यार्थी रिकॉर्ड नहीं मिला' : 'No students found in this register query'}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {language === 'hi' 
                    ? 'कृपया सुनिश्चित करें कि चयनित कक्षा व अनुभाग में सक्रिय छात्र पंजीकृत हैं अथवा खोज फ़िल्टर रीसेट करें।'
                    : 'Check your search filters or make sure students are enrolled in this class and section.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4 w-16 text-center">Roll</th>
                      <th className="py-3.5 px-4 min-w-[220px]">Student Details (विद्यार्थी विवरण)</th>
                      <th className="py-3.5 px-4 min-w-[200px]">Parent / Contact (गोपनीय संपर्क)</th>
                      <th className="py-3.5 px-4 min-w-[260px] text-center">Attendance Status (उपस्थिति स्थिति)</th>
                      <th className="py-3.5 px-4 min-w-[180px]">Remarks / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => {
                      const currentStatus = localAttendance[student.id] || 'present';
                      const isUnmasked = unmaskedStudents[student.id];
                      const parentPhone = student.mobile || student.phone || '9876543210';
                      const maskedPhone = parentPhone.length >= 10 
                        ? `${parentPhone.slice(0, 2)}••••••${parentPhone.slice(-2)}` 
                        : '••••••••••';

                      return (
                        <tr 
                          key={student.id} 
                          className={`hover:bg-slate-50/80 transition-colors ${
                            currentStatus === 'absent' ? 'bg-red-50/30' : currentStatus === 'half_day' ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          {/* Roll Number */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 font-mono font-black text-slate-800 text-xs border border-slate-200">
                              #{student.rollNumber || '—'}
                            </span>
                          </td>

                          {/* Student Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative flex items-center justify-center">
                                {student.photoURL ? (
                                  <img 
                                    src={student.photoURL} 
                                    alt={student.name}
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <span className="font-bold text-xs text-slate-600">
                                    {student.name.slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                                <span 
                                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                    student.gender === 'Female' ? 'bg-pink-500' : 'bg-blue-500'
                                  }`} 
                                  title={student.gender}
                                />
                              </div>

                              <div className="min-w-0">
                                <button
                                  onClick={() => setSelectedStudentFor360(student)}
                                  className="font-black text-slate-900 hover:text-amber-600 text-xs transition-colors flex items-center gap-1.5 text-left truncate group cursor-pointer"
                                  title="View 360° Profile"
                                >
                                  <span className="truncate">{student.name}</span>
                                  <Eye className="w-3 h-3 text-slate-400 group-hover:text-amber-600 shrink-0" />
                                </button>
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                                  <span>{student.admissionNumber || `ADM-${student.id.slice(-4)}`}</span>
                                  <span>•</span>
                                  <span className="text-slate-500">{student.gender}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Parent Info & Masked Mobile */}
                          <td className="py-3.5 px-4">
                            <div className="text-xs space-y-0.5">
                              <div className="font-semibold text-slate-800 truncate">
                                {student.fatherName ? `Father: ${student.fatherName}` : student.guardianName ? `Guardian: ${student.guardianName}` : 'Parent Recorded'}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span className="font-mono">{isUnmasked ? parentPhone : maskedPhone}</span>
                                <button
                                  type="button"
                                  onClick={() => toggleMask(student.id)}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 transition-colors"
                                  title={isUnmasked ? 'Mask Phone Number' : 'Click to Reveal Parent Phone'}
                                >
                                  {isUnmasked ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-amber-600" />}
                                </button>
                                {isUnmasked && (
                                  <a
                                    href={`tel:${parentPhone}`}
                                    className="text-[10px] font-bold text-blue-600 hover:underline ml-1"
                                  >
                                    Call
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Large Accessible Touch Buttons for Class 1-3 accessibility */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                              {/* Present Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'present')}
                                className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{language === 'hi' ? 'उपस्थित' : 'Present'}</span>
                              </button>

                              {/* Absent Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'absent')}
                                className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  currentStatus === 'absent'
                                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-600/30'
                                    : 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700'
                                }`}
                              >
                                <XCircle className="w-4 h-4" />
                                <span>{language === 'hi' ? 'अनुपस्थित' : 'Absent'}</span>
                              </button>

                              {/* Half Day / Leave Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'half_day')}
                                className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  currentStatus === 'half_day' || currentStatus === 'late'
                                    ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-500/40 font-black'
                                    : 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800'
                                }`}
                              >
                                <Clock className="w-4 h-4" />
                                <span>{language === 'hi' ? 'अर्ध-दिवस' : 'Half Day'}</span>
                              </button>
                            </div>
                          </td>

                          {/* Remarks / Reason */}
                          <td className="py-3.5 px-4">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder={currentStatus === 'absent' ? 'Reason for leave...' : 'Optional notes...'}
                                value={remarksMap[student.id] || ''}
                                onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                                className={`w-full px-2.5 py-1.5 border rounded-xl text-[11px] transition-colors ${
                                  currentStatus === 'absent' 
                                    ? 'bg-red-50/50 border-red-200 focus:bg-white focus:border-red-500' 
                                    : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500'
                                }`}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MONTHLY REGISTER MATRIX VIEW */}
      {viewMode === 'monthly' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-amber-600" />
                <span>{language === 'hi' ? 'मासिक उपस्थिति पंजिका पत्रक (Monthly Register Grid)' : 'Monthly Attendance Register Sheet'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Class {selectedClassNumber} - Section '{selectedSection}' • {language === 'hi' ? 'माह का संपूर्ण विवरण' : 'Complete 31-day session matrix'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-500">{language === 'hi' ? 'माह चुनें:' : 'Select Month:'}</label>
              <input
                type="month"
                value={monthlyYearMonth}
                onChange={(e) => setMonthlyYearMonth(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-[10px]">
                  <th className="py-2.5 px-3 sticky left-0 bg-slate-900 z-10 border border-slate-800">Roll</th>
                  <th className="py-2.5 px-3 sticky left-10 bg-slate-900 z-10 min-w-[160px] border border-slate-800">Student Name</th>
                  {monthlyDays.map((d) => (
                    <th 
                      key={d.dateStr} 
                      className={`py-2 px-1 text-center min-w-[28px] border border-slate-800 ${
                        d.isSunday ? 'bg-red-950 text-red-300' : ''
                      }`}
                      title={d.dateStr}
                    >
                      <div>{d.dayNum}</div>
                      <div className="text-[8px] text-slate-400 font-normal">{d.dayName}</div>
                    </th>
                  ))}
                  <th className="py-2.5 px-2 text-center bg-slate-800 border border-slate-700">P Days</th>
                  <th className="py-2.5 px-2 text-center bg-slate-800 border border-slate-700">% Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {classStudents.map((student) => {
                  let monthlyPresent = 0;
                  let workingDays = 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold sticky left-0 bg-white border border-slate-200">
                        #{student.rollNumber || '—'}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 sticky left-10 bg-white border border-slate-200 truncate max-w-[160px]">
                        {student.name}
                      </td>

                      {monthlyDays.map((d) => {
                        const rec = attendance.find(a => a.studentId === student.id && a.date === d.dateStr);
                        if (!d.isSunday) workingDays++;

                        let symbol = '—';
                        let cellClass = 'text-slate-300';

                        if (d.isSunday) {
                          symbol = 'S';
                          cellClass = 'bg-red-50 text-red-400 font-bold';
                        } else if (rec) {
                          if (rec.status === 'present') {
                            symbol = 'P';
                            cellClass = 'bg-emerald-100 text-emerald-800 font-bold';
                            monthlyPresent += 1;
                          } else if (rec.status === 'absent') {
                            symbol = 'A';
                            cellClass = 'bg-red-100 text-red-800 font-bold';
                          } else if (rec.status === 'half_day' || rec.status === 'late') {
                            symbol = 'H';
                            cellClass = 'bg-amber-100 text-amber-800 font-bold';
                            monthlyPresent += 0.5;
                          }
                        }

                        return (
                          <td 
                            key={d.dateStr} 
                            onClick={() => {
                              setSelectedDate(d.dateStr);
                              setViewMode('daily');
                            }}
                            className={`py-1.5 px-1 text-center font-mono cursor-pointer hover:ring-1 hover:ring-amber-400 border border-slate-200 ${cellClass}`}
                            title={`Click to open daily register for ${d.dateStr}`}
                          >
                            {symbol}
                          </td>
                        );
                      })}

                      <td className="py-2 px-2 text-center font-bold text-slate-900 bg-slate-50 border border-slate-200 font-mono">
                        {monthlyPresent}
                      </td>
                      <td className="py-2 px-2 text-center font-black text-slate-900 bg-amber-50 border border-slate-200 font-mono">
                        {workingDays > 0 ? `${Math.round((monthlyPresent / workingDays) * 100)}%` : '100%'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Institutional Header (Visible only when printing) */}
      <div className="hidden print:block space-y-4 p-4 text-black">
        <div className="text-center border-b-2 border-black pb-3">
          <h1 className="text-xl font-bold uppercase">{settings.schoolName}</h1>
          <p className="text-xs">
            {settings.schoolAddress} • UDISE Code: {settings.udiseCode}
          </p>
          <h2 className="text-sm font-bold mt-2 underline uppercase">
            Official Class Attendance Register — Class {selectedClassNumber} Section {selectedSection}
          </h2>
          <p className="text-xs mt-0.5">
            Date: {selectedDate} • Verified Class Teacher: {currentTeacher?.name} ({currentTeacher?.employeeId})
          </p>
        </div>

        <table className="w-full text-xs border border-black border-collapse mt-4">
          <thead>
            <tr className="border-b border-black font-bold">
              <th className="p-2 border-r border-black">Roll No</th>
              <th className="p-2 border-r border-black">Admission No</th>
              <th className="p-2 border-r border-black">Student Name</th>
              <th className="p-2 border-r border-black">Gender</th>
              <th className="p-2 border-r border-black">Parent Name</th>
              <th className="p-2 border-r border-black">Status</th>
              <th className="p-2">Teacher Remarks</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.map(s => (
              <tr key={s.id} className="border-b border-black">
                <td className="p-2 border-r border-black font-mono font-bold">#{s.rollNumber}</td>
                <td className="p-2 border-r border-black font-mono">{s.admissionNumber}</td>
                <td className="p-2 border-r border-black font-bold">{s.name}</td>
                <td className="p-2 border-r border-black">{s.gender}</td>
                <td className="p-2 border-r border-black">{s.fatherName || s.guardianName}</td>
                <td className="p-2 border-r border-black font-bold">{(localAttendance[s.id] || 'present').toUpperCase()}</td>
                <td className="p-2">{remarksMap[s.id] || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-end pt-12 text-xs font-bold">
          <div>
            <div className="border-t border-black w-48 pt-1 text-center">
              Class Teacher Signature
            </div>
            <div className="text-[10px] text-center font-normal text-slate-600 mt-0.5">
              {currentTeacher?.name}
            </div>
          </div>

          <div>
            <div className="border-t border-black w-48 pt-1 text-center">
              Headmaster / Principal Stamp
            </div>
            <div className="text-[10px] text-center font-normal text-slate-600 mt-0.5">
              Composite JHS Harsinghpur Gova
            </div>
          </div>
        </div>
      </div>

      {/* 360 Student Details Modal */}
      {selectedStudentFor360 && (
        <Student360Modal
          student={selectedStudentFor360}
          isOpen={!!selectedStudentFor360}
          onClose={() => setSelectedStudentFor360(null)}
          canManageDocuments={false}
        />
      )}
    </div>
  );
};
