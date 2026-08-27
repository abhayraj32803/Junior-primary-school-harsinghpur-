import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceStatus } from '../../types';
import { 
  CalendarCheck2, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Save, 
  CheckCheck,
  Calendar
} from 'lucide-react';

export const AdminAttendance: React.FC = () => {
  const { students, classes, attendance, saveBulkAttendance } = useSchool();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClassNumber, setSelectedClassNumber] = useState<number>(8);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local attendance status map for the chosen class/section/date
  const classStudents = students.filter(
    s => s.classNumber === selectedClassNumber && s.sectionName === selectedSection && s.status === 'active'
  );

  // Initialize or read existing attendance records
  const [localAttendance, setLocalAttendance] = useState<Record<string, AttendanceStatus>>({});

  // Sync state when date, class, or section changes
  React.useEffect(() => {
    const map: Record<string, AttendanceStatus> = {};
    classStudents.forEach(student => {
      const existing = attendance.find(a => a.studentId === student.id && a.date === selectedDate);
      map[student.id] = existing ? existing.status : 'present';
    });
    setLocalAttendance(map);
  }, [selectedDate, selectedClassNumber, selectedSection, attendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach(s => {
      updated[s.id] = status;
    });
    setLocalAttendance(updated);
  };

  const handleSaveAttendance = async () => {
    const records = classStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      classId: student.classId,
      classNumber: student.classNumber,
      sectionId: student.sectionId,
      sectionName: student.sectionName,
      date: selectedDate,
      status: localAttendance[student.id] || 'present',
      markedBy: 'Admin / Headmaster',
      markedByRole: 'admin' as const
    }));

    await saveBulkAttendance(records);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Stats for the active view
  const presentCount = Object.values(localAttendance).filter(s => s === 'present').length;
  const lateCount = Object.values(localAttendance).filter(s => s === 'late').length;
  const absentCount = Object.values(localAttendance).filter(s => s === 'absent').length;
  const halfDayCount = Object.values(localAttendance).filter(s => s === 'half-day' || s === 'half_day').length;
  const totalCount = classStudents.length;
  const rate = totalCount > 0 ? Math.round(((presentCount + (lateCount * 0.8) + (halfDayCount * 0.5)) / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Institutional Attendance Register</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor and record daily student attendance for Primary & Upper Primary classes
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors self-start md:self-auto"
          id="btn-admin-save-attendance"
        >
          <Save className="w-4 h-4" />
          <span>Commit Daily Register</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">Attendance records successfully synced to Firestore Database!</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Register Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Class
          </label>
          <select
            value={selectedClassNumber}
            onChange={(e) => setSelectedClassNumber(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>Class {num}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Quick Summary Pill Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Class Strength</span>
            <span className="font-bold text-base">{totalCount} Students</span>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div>
            <span className="text-emerald-400 block text-[10px] uppercase font-bold">Present</span>
            <span className="font-bold text-base text-emerald-400">{presentCount}</span>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div>
            <span className="text-amber-400 block text-[10px] uppercase font-bold">Late</span>
            <span className="font-bold text-base text-amber-400">{lateCount}</span>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div>
            <span className="text-red-400 block text-[10px] uppercase font-bold">Absent</span>
            <span className="font-bold text-base text-red-400">{absentCount}</span>
          </div>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMarkAll('present')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll('absent')}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/30 transition-colors"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Students Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Father's Name</th>
                <th className="py-3 px-4 text-center">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((student) => {
                const currentStatus = localAttendance[student.id] || 'present';
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      #{student.rollNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0">
                          {student.photoURL ? (
                            <img src={student.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-slate-500">
                              {student.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span>{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {student.fatherName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Present */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        {/* Late */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'late')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                            currentStatus === 'late'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-800'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Late</span>
                        </button>

                        {/* Absent */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                            currentStatus === 'absent'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {classStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No active students enrolled in Class {selectedClassNumber} - Section {selectedSection}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
