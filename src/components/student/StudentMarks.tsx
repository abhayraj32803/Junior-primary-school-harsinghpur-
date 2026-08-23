import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { Award, Printer, CheckCircle2, BookOpen } from 'lucide-react';
import { ReportCardPrint } from '../common/ReportCardPrint';
import { resolveCurrentStudent } from '../../utils/studentUtils';

export const StudentMarks: React.FC = () => {
  const { userProfile } = useAuth();
  const { students, examinations, marks, settings, getStudentAttendanceStats } = useSchool();

  const currentStudent = resolveCurrentStudent(userProfile, students);
  const [selectedExamId, setSelectedExamId] = useState<string>(examinations[0]?.id || '');
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const selectedExam = examinations.find(e => e.id === selectedExamId) || examinations[0];
  const myMarks = marks.filter(m => m.studentId === currentStudent?.id && m.examId === selectedExamId);

  const totalMarksObtained = myMarks.reduce((sum, m) => sum + m.marksObtained, 0);
  const totalMaxMarks = myMarks.reduce((sum, m) => sum + m.maxMarks, 0);
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Academic Results & Progress Dossier</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous Comprehensive Evaluation (CCE) for student {currentStudent?.name}
          </p>
        </div>

        <button
          onClick={() => setIsPrintOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors self-start md:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print Official Report Card</span>
        </button>
      </div>

      {/* Exam Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-600">Select Exam Session:</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
          >
            {examinations.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        {/* Aggregate Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Aggregate Score</span>
            <span className="text-sm font-black text-slate-900">{totalMarksObtained} / {totalMaxMarks} ({overallPercentage}%)</span>
          </div>
        </div>
      </div>

      {/* Subject Marks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4 text-center">Max Marks</th>
              <th className="py-3 px-4 text-center">Marks Scored</th>
              <th className="py-3 px-4 text-center">CCE Grade</th>
              <th className="py-3 px-4">Educator Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {myMarks.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">{m.subjectName}</td>
                <td className="py-3 px-4 text-center font-mono text-slate-500">{m.maxMarks}</td>
                <td className="py-3 px-4 text-center font-bold text-slate-900">{m.marksObtained}</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-black text-xs">
                    {m.grade}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600 italic">{m.remarks || 'Satisfactory progress'}</td>
              </tr>
            ))}
            {myMarks.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No marks published for this examination yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Report Card Print Modal */}
      {isPrintOpen && currentStudent && selectedExam && (
        <ReportCardPrint
          student={currentStudent}
          exam={selectedExam}
          marks={myMarks}
          attendancePercentage={getStudentAttendanceStats(currentStudent.id).percentage}
          settings={settings}
          onClose={() => setIsPrintOpen(false)}
        />
      )}
    </div>
  );
};
