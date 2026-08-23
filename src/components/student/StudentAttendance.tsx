import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { CalendarCheck2, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { resolveCurrentStudent } from '../../utils/studentUtils';

export const StudentAttendance: React.FC = () => {
  const { userProfile } = useAuth();
  const { students, attendance, getStudentAttendanceStats } = useSchool();

  const currentStudent = resolveCurrentStudent(userProfile, students);
  const myRecords = attendance.filter(a => a.studentId === currentStudent?.id);
  const stats = getStudentAttendanceStats(currentStudent?.id || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Attendance Record & History</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed log of classroom attendance for student {currentStudent?.name}
        </p>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Working Days</span>
          <div className="text-2xl font-black text-slate-900">{stats.total} Days</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Days Present</span>
          <div className="text-2xl font-black text-emerald-600">{stats.present} Days</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Days Absent</span>
          <div className="text-2xl font-black text-red-600">{stats.absent} Days</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Attendance Percentage</span>
          <div className="text-2xl font-black text-amber-600">{stats.percentage}%</div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Class Session</th>
              <th className="py-3 px-4">Attendance Status</th>
              <th className="py-3 px-4">Verified By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {myRecords.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-800">{rec.date}</td>
                <td className="py-3 px-4 text-slate-600">Class {rec.classNumber} - '{rec.sectionName}'</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-xl ${
                    rec.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                    rec.status === 'late' ? 'bg-amber-100 text-amber-800' :
                    rec.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.status === 'present' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {rec.status === 'absent' && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                    {rec.status === 'late' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                    <span className="capitalize">{rec.status}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500 font-medium">{rec.markedBy}</td>
              </tr>
            ))}
            {myRecords.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No attendance records logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
