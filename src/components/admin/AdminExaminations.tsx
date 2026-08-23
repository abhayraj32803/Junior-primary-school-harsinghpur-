import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Examination, Student, Subject, MarkRecord } from '../../types';
import { 
  Award, 
  Plus, 
  Search, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  Edit, 
  Eye,
  Save,
  BookOpen
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ReportCardPrint } from '../common/ReportCardPrint';

export const AdminExaminations: React.FC = () => {
  const { 
    examinations, 
    classes, 
    subjects, 
    students, 
    marks, 
    addExamination, 
    updateExamination, 
    saveBulkMarks, 
    settings,
    getStudentAttendanceStats
  } = useSchool();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Examination | null>(null);
  const [selectedClassNumber, setSelectedClassNumber] = useState<number>(8);
  const [selectedSection, setSelectedSection] = useState<string>('A');

  // Report Card print state
  const [printReportData, setPrintReportData] = useState<{
    student: Student;
    exam: Examination;
    studentMarks: MarkRecord[];
  } | null>(null);

  // Form for New Exam
  const [examForm, setExamForm] = useState({
    title: 'Unit Test 2 (Formative Assessment)',
    examType: 'Unit Test' as 'Unit Test' | 'Mid Term' | 'Annual' | 'Quarterly',
    academicYear: '2025-2026',
    startDate: '2025-11-10',
    endDate: '2025-11-15',
    maxMarks: 50,
    status: 'published' as 'draft' | 'published' | 'completed'
  });

  // Marks Entry local state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [studentMarksState, setStudentMarksState] = useState<Record<string, { marksObtained: number; isAbsent: boolean; remarks: string }>>({});
  const [marksSaveSuccess, setMarksSaveSuccess] = useState(false);

  const handleOpenAdd = () => {
    setExamForm({
      title: 'Term 2 Summative Evaluation',
      examType: 'Mid Term',
      academicYear: '2025-2026',
      startDate: '2026-03-01',
      endDate: '2026-03-08',
      maxMarks: 100,
      status: 'published'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    await addExamination({
      title: examForm.title,
      examType: examForm.examType,
      academicYear: examForm.academicYear,
      startDate: examForm.startDate,
      endDate: examForm.endDate,
      maxMarks: Number(examForm.maxMarks),
      status: examForm.status,
      classIds: ['class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'class-8']
    });
    setIsAddModalOpen(false);
  };

  // Open Marks Management for an exam
  const handleOpenMarksEntry = (exam: Examination) => {
    setSelectedExam(exam);
    const classSubs = subjects.filter(s => s.classNumber === selectedClassNumber);
    const initialSubId = classSubs[0]?.id || '';
    setSelectedSubjectId(initialSubId);
    setIsMarksModalOpen(true);
  };

  // Initialize student marks state when exam/class/section/subject changes
  const activeStudents = students.filter(
    s => s.classNumber === selectedClassNumber && s.sectionName === selectedSection && s.status === 'active'
  );

  React.useEffect(() => {
    if (!selectedExam || !selectedSubjectId) return;
    const initialMarks: Record<string, { marksObtained: number; isAbsent: boolean; remarks: string }> = {};
    activeStudents.forEach(student => {
      const existing = marks.find(
        m => m.examId === selectedExam.id && m.studentId === student.id && m.subjectId === selectedSubjectId
      );
      initialMarks[student.id] = {
        marksObtained: existing ? existing.marksObtained : 0,
        isAbsent: existing ? existing.isAbsent : false,
        remarks: existing ? existing.remarks || '' : 'Good performance'
      };
    });
    setStudentMarksState(initialMarks);
  }, [selectedExam, selectedClassNumber, selectedSection, selectedSubjectId, marks]);

  const handleSaveMarks = async () => {
    if (!selectedExam || !selectedSubjectId) return;
    const currentSubject = subjects.find(s => s.id === selectedSubjectId);
    if (!currentSubject) return;

    const newMarksRecords: any[] = activeStudents.map(student => {
      const stData = studentMarksState[student.id] || { marksObtained: 0, isAbsent: false, remarks: '' };
      const percentage = (stData.marksObtained / (currentSubject.totalMarks || 100)) * 100;
      let grade = 'E';
      if (percentage >= 90) grade = 'A1';
      else if (percentage >= 80) grade = 'A2';
      else if (percentage >= 70) grade = 'B1';
      else if (percentage >= 60) grade = 'B2';
      else if (percentage >= 50) grade = 'C1';
      else if (percentage >= 40) grade = 'C2';
      else if (percentage >= 33) grade = 'D';

      return {
        examId: selectedExam.id,
        studentId: student.id,
        subjectId: currentSubject.id,
        subjectName: currentSubject.name,
        marksObtained: Number(stData.marksObtained),
        maxMarks: currentSubject.totalMarks,
        grade,
        isAbsent: stData.isAbsent,
        remarks: stData.remarks
      };
    });

    await saveBulkMarks(newMarksRecords);
    setMarksSaveSuccess(true);
    setTimeout(() => setMarksSaveSuccess(false), 3000);
  };

  const handlePrintStudentReport = (student: Student, exam: Examination) => {
    const studentMarks = marks.filter(m => m.studentId === student.id && m.examId === exam.id);
    setPrintReportData({
      student,
      exam,
      studentMarks
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Examinations, Evaluation & Report Cards</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous Comprehensive Evaluation (CCE) for Classes 1 to 8
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors self-start md:self-auto"
          id="btn-add-exam-main"
        >
          <Plus className="w-4 h-4" />
          <span>Create Examination</span>
        </button>
      </div>

      {/* Examinations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {examinations.map((exam) => (
          <div key={exam.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  {exam.examType}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  exam.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {exam.status}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 leading-snug">{exam.title}</h3>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exam.startDate} to {exam.endDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>Max Marks: {exam.maxMarks} per subject</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => handleOpenMarksEntry(exam)}
                className="flex-1 py-2 rounded-xl bg-slate-900 text-amber-400 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Enter / View Marks</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Marks Management Modal */}
      {selectedExam && (
        <Modal
          isOpen={isMarksModalOpen}
          onClose={() => setIsMarksModalOpen(false)}
          title={`Grade Book: ${selectedExam.title}`}
          maxWidth="4xl"
        >
          <div className="space-y-5">
            {/* Filter Bar */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Class</label>
                <select
                  value={selectedClassNumber}
                  onChange={(e) => setSelectedClassNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>Class {num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                >
                  {subjects.filter(s => s.classNumber === selectedClassNumber).map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Max: {s.totalMarks})</option>
                  ))}
                </select>
              </div>
            </div>

            {marksSaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Student marks and grades successfully committed!</span>
              </div>
            )}

            {/* Students Marks Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Roll</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Score (Max {subjects.find(s => s.id === selectedSubjectId)?.totalMarks || 100})</th>
                    <th className="py-2.5 px-3">Remarks / Feedback</th>
                    <th className="py-2.5 px-3 text-right">Report Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeStudents.map((student) => {
                    const stData = studentMarksState[student.id] || { marksObtained: 0, isAbsent: false, remarks: '' };
                    return (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">#{student.rollNumber}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{student.name}</td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min={0}
                            max={subjects.find(s => s.id === selectedSubjectId)?.totalMarks || 100}
                            value={stData.marksObtained}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setStudentMarksState(prev => ({
                                ...prev,
                                [student.id]: {
                                  ...prev[student.id],
                                  marksObtained: val
                                }
                              }));
                            }}
                            className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:bg-white"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={stData.remarks}
                            placeholder="Teacher feedback..."
                            onChange={(e) => {
                              const val = e.target.value;
                              setStudentMarksState(prev => ({
                                ...prev,
                                [student.id]: {
                                  ...prev[student.id],
                                  remarks: val
                                }
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handlePrintStudentReport(student, selectedExam)}
                            className="p-1.5 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"
                            title="Generate Print-Ready Report Card"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Card</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMarksModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSaveMarks}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save All Marks</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Exam Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Official School Examination"
        maxWidth="md"
      >
        <form onSubmit={handleSaveExam} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Examination Title *</label>
            <input
              type="text"
              required
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Exam Type *</label>
              <select
                value={examForm.examType}
                onChange={(e) => setExamForm({ ...examForm, examType: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Unit Test">Unit Test (Formative)</option>
                <option value="Mid Term">Mid Term / Half Yearly</option>
                <option value="Annual">Annual Summative Exam</option>
                <option value="Quarterly">Quarterly Assessment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Subject Marks</label>
              <input
                type="number"
                required
                value={examForm.maxMarks}
                onChange={(e) => setExamForm({ ...examForm, maxMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={examForm.startDate}
                onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={examForm.endDate}
                onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md"
            >
              Publish Examination
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Card Print Trigger */}
      {printReportData && (
        <ReportCardPrint
          student={printReportData.student}
          exam={printReportData.exam}
          marks={printReportData.studentMarks}
          attendancePercentage={getStudentAttendanceStats(printReportData.student.id).percentage}
          settings={settings}
          onClose={() => setPrintReportData(null)}
        />
      )}
    </div>
  );
};
