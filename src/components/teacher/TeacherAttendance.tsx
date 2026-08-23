import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceStatus } from '../../types';
import { CalendarCheck2, CheckCircle, XCircle, Clock, Save, Calendar } from 'lucide-react';

export const TeacherAttendance: React.FC = () => {
  const { userProfile } = useAuth();
  const { students, teachers, teacherAssignments, attendance, saveBulkAttendance } = useSchool();

  const currentTeacher = teachers.find(t => t.id === userProfile?.entityId) || teachers[0];
  const myAssignments = teacherAssignments.filter(a => a.teacherId === currentTeacher?.id);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClassNumber, setSelectedClassNumber] = useState<number>(myAssignments[0]?.classNumber || 8);
  const [selectedSection, setSelectedSection] = useState<string>(myAssignments[0]?.sectionName || 'A');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const classStudents = students.filter(
    s => s.classNumber === selectedClassNumber && s.sectionName === selectedSection && s.status === 'active'
  );

  const [localAttendance, setLocalAttendance] = useState<Record<string, AttendanceStatus>>({});

  React.useEffect(() => {
    const map: Record<string, AttendanceStatus> = {};
    classStudents.forEach(student => {
      const existing = attendance.find(a => a.studentId === student.id && a.date === selectedDate);
      map[student.id] = existing ? existing.status : 'present';
    });
    setLocalAttendance(map);
  }, [selectedDate, selectedClassNumber, selectedSection, attendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setLocalAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const map: Record<string, AttendanceStatus> = {};
    classStudents.forEach(s => { map[s.id] = status; });
    setLocalAttendance(map);
  };

  const handleSave = async () => {
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
      markedBy: currentTeacher?.name || 'Teacher',
      markedByRole: 'teacher' as const
    }));

    await saveBulkAttendance(records);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const presentCount = Object.values(localAttendance).filter(s => s === 'present').length;
  const lateCount = Object.values(localAttendance).filter(s => s === 'late').length;
  const absentCount = Object.values(localAttendance).filter(s => s === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Class Daily Attendance Register</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log student attendance for your assigned classes (Classes 1 to 8)
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors self-start md:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Class Register</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">Daily attendance records successfully saved!</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">My Assigned Classes</label>
          <select
            value={selectedClassNumber}
            onChange={(e) => setSelectedClassNumber(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>Class {num}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <span>Enrolled: <strong>{classStudents.length}</strong></span>
          <span>•</span>
          <span className="text-emerald-400">Present: <strong>{presentCount}</strong></span>
          <span>•</span>
          <span className="text-amber-400">Late: <strong>{lateCount}</strong></span>
          <span>•</span>
          <span className="text-red-400">Absent: <strong>{absentCount}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMarkAll('present')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll('absent')}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/30"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
              <th className="py-3 px-4">Roll</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classStudents.map((student) => {
              const currentStatus = localAttendance[student.id] || 'present';
              return (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">#{student.rollNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{student.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                          currentStatus === 'late'
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Late</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                          currentStatus === 'absent'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600'
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
          </tbody>
        </table>
      </div>
    </div>
  );
};
