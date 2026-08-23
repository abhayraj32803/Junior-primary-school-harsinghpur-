import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { BookOpenCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { resolveCurrentStudent } from '../../utils/studentUtils';

export const StudentHomework: React.FC = () => {
  const { userProfile } = useAuth();
  const { students, homeworkList } = useSchool();

  const currentStudent = resolveCurrentStudent(userProfile, students);
  const myHomework = homeworkList.filter(h => h.classNumber === currentStudent?.classNumber);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Daily Homework & Learning Tasks</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Assignments assigned for Class {currentStudent?.classNumber} - Section '{currentStudent?.sectionName}'
        </p>
      </div>

      {/* Homework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {myHomework.map((hw) => (
          <div key={hw.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {hw.subjectName}
                </span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Due {hw.dueDate}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 leading-snug">{hw.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{hw.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Assigned By: <strong className="text-slate-700">{hw.teacherName}</strong></span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Active Task
              </span>
            </div>
          </div>
        ))}

        {myHomework.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            No homework assigned for your class currently. Enjoy reading books!
          </div>
        )}
      </div>
    </div>
  );
};
