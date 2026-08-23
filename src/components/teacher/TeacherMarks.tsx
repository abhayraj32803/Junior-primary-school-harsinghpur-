import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { Award, Save, CheckCircle2 } from 'lucide-react';

export const TeacherMarks: React.FC = () => {
  const { userProfile } = useAuth();
  const { teachers, teacherAssignments, students, examinations, subjects, marks, saveBulkMarks } = useSchool();

  const currentTeacher = teachers.find(t => t.id === userProfile?.entityId) || teachers[0];
  const myAssignments = teacherAssignments.filter(a => a.teacherId === currentTeacher?.id);

  const [selectedExamId, setSelectedExamId] = useState<string>(examinations[0]?.id || '');
  const [selectedClassNumber, setSelectedClassNumber] = useState<number>(myAssignments[0]?.classNumber || 8);
  const [selectedSection, setSelectedSection] = useState<string>(myAssignments[0]?.sectionName || 'A');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const classStudents = students.filter(
    s => s.classNumber === selectedClassNumber && s.sectionName === selectedSection && s.status === 'active'
  );

  const classSubjects = subjects.filter(s => s.classNumber === selectedClassNumber);

  React.useEffect(() => {
    if (classSubjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(classSubjects[0].id);
    }
  }, [selectedClassNumber, classSubjects, selectedSubjectId]);

  const [studentMarksState, setStudentMarksState] = useState<Record<string, { marksObtained: number; isAbsent: boolean; remarks: string }>>({});

  React.useEffect(() => {
    if (!selectedExamId || !selectedSubjectId) return;
    const initialMarks: Record<string, { marksObtained: number; isAbsent: boolean; remarks: string }> = {};
    classStudents.forEach(student => {
      const existing = marks.find(
        m => m.examId === selectedExamId && m.studentId === student.id && m.subjectId === selectedSubjectId
      );
      initialMarks[student.id] = {
        marksObtained: existing ? existing.marksObtained : 0,
        isAbsent: existing ? existing.isAbsent : false,
        remarks: existing ? existing.remarks || '' : 'Good'
      };
    });
    setStudentMarksState(initialMarks);
  }, [selectedExamId, selectedClassNumber, selectedSection, selectedSubjectId, marks]);

  const handleSaveMarks = async () => {
    const currSubject = subjects.find(s => s.id === selectedSubjectId);
    if (!currSubject) return;

    const records = classStudents.map(student => {
      const st = studentMarksState[student.id] || { marksObtained: 0, isAbsent: false, remarks: '' };
      const pct = (st.marksObtained / (currSubject.totalMarks || 100)) * 100;
      let grade = 'E';
      if (pct >= 90) grade = 'A1';
      else if (pct >= 80) grade = 'A2';
      else if (pct >= 70) grade = 'B1';
      else if (pct >= 60) grade = 'B2';
      else if (pct >= 50) grade = 'C1';
      else if (pct >= 40) grade = 'C2';
      else if (pct >= 33) grade = 'D';

      return {
        examId: selectedExamId,
        studentId: student.id,
        subjectId: currSubject.id,
        subjectName: currSubject.name,
        marksObtained: Number(st.marksObtained),
        maxMarks: currSubject.totalMarks,
        grade,
        isAbsent: st.isAbsent,
        remarks: st.remarks
      };
    });

    await saveBulkMarks(records);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Examination Marks & Evaluation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit student test scores and formative/summative feedback
          </p>
        </div>

        <button
          onClick={handleSaveMarks}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors self-start md:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Class Marks</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">Student examination marks saved successfully!</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
          >
            {examinations.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Class</label>
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

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
          >
            {classSubjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} (Max {s.totalMarks})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
              <th className="py-3 px-4">Roll</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Marks Obtained</th>
              <th className="py-3 px-4">Teacher Remark / Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classStudents.map((student) => {
              const st = studentMarksState[student.id] || { marksObtained: 0, isAbsent: false, remarks: '' };
              return (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">#{student.rollNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{student.name}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={st.marksObtained}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setStudentMarksState(prev => ({
                          ...prev,
                          [student.id]: { ...prev[student.id], marksObtained: val }
                        }));
                      }}
                      className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={st.remarks}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStudentMarksState(prev => ({
                          ...prev,
                          [student.id]: { ...prev[student.id], remarks: val }
                        }));
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
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
