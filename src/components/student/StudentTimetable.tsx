import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { Clock, User } from 'lucide-react';
import { resolveCurrentStudent } from '../../utils/studentUtils';

export const StudentTimetable: React.FC = () => {
  const { userProfile } = useAuth();
  const { students, timetable } = useSchool();

  const currentStudent = resolveCurrentStudent(userProfile, students);
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6];

  const periodTimings: Record<number, string> = {
    1: '09:00 - 09:45 AM',
    2: '09:45 - 10:30 AM',
    3: '10:30 - 11:15 AM',
    4: '11:15 - 12:00 PM',
    5: '12:40 - 01:25 PM',
    6: '01:25 - 02:10 PM'
  };

  const mySlots = timetable.filter(
    t => t.classNumber === currentStudent?.classNumber && t.sectionName === currentStudent?.sectionName
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Class Timetable & Schedule</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Weekly timetable for Class {currentStudent?.classNumber} - Section '{currentStudent?.sectionName}'
        </p>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-3 px-4 w-28 uppercase font-bold text-[11px] text-amber-400">Day</th>
                {periods.map(p => (
                  <th key={p} className="py-3 px-3 border-l border-slate-800 text-center">
                    <div className="font-extrabold text-xs">Period {p}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal">{periodTimings[p]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {daysOfWeek.map((day) => (
                <tr key={day} className="hover:bg-slate-50/80">
                  <td className="py-4 px-4 font-black text-slate-900 bg-slate-50 border-r border-slate-200">
                    {day}
                  </td>
                  {periods.map(p => {
                    const slot = mySlots.find(s => s.day === day && s.periodNumber === p);
                    return (
                      <td key={p} className="py-2.5 px-3 border-l border-slate-200 text-center">
                        {slot ? (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left space-y-0.5">
                            <div className="font-bold text-slate-900 text-xs truncate">{slot.subjectName}</div>
                            <div className="text-[10px] text-amber-800 font-bold flex items-center gap-1">
                              <User className="w-3 h-3 text-amber-600" />
                              <span>{slot.teacherName.split(' ')[0]}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{slot.roomNumber}</div>
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-slate-50 text-slate-400 text-[10px] italic">
                            Activity / Recess
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
