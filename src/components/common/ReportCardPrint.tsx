import React from 'react';
import { Student, Examination, Mark, SchoolSettings } from '../../types';
import { Printer, X, Award, CheckCircle } from 'lucide-react';

interface ReportCardPrintProps {
  student: Student;
  exam: Examination;
  marks: Mark[];
  settings: SchoolSettings;
  attendancePercentage: number;
  onClose: () => void;
}

export const ReportCardPrint: React.FC<ReportCardPrintProps> = ({
  student,
  exam,
  marks,
  settings,
  attendancePercentage,
  onClose
}) => {
  const totalMaxMarks = marks.reduce((acc, m) => acc + m.maximumMarks, 0);
  const totalObtainedMarks = marks.reduce((acc, m) => acc + m.marksObtained, 0);
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalObtainedMarks / totalMaxMarks) * 100) : 0;

  const getOverallGrade = (pct: number) => {
    if (pct >= 90) return { grade: "A+", result: "PASSED WITH DISTINCTION" };
    if (pct >= 80) return { grade: "A", result: "PASSED (FIRST DIVISION)" };
    if (pct >= 70) return { grade: "B+", result: "PASSED (FIRST DIVISION)" };
    if (pct >= 60) return { grade: "B", result: "PASSED (SECOND DIVISION)" };
    if (pct >= 50) return { grade: "C", result: "PASSED (THIRD DIVISION)" };
    if (pct >= 33) return { grade: "D", result: "PASSED" };
    return { grade: "E", result: "NEEDS IMPROVEMENT" };
  };

  const overall = getOverallGrade(overallPercentage);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 border border-slate-300 print:m-0 print:border-none print:shadow-none">
        {/* Action Header (hidden on print) */}
        <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Official Academic Progress Report</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Report Card Layout */}
        <div className="p-8 space-y-6 print:p-6" id="printable-report-card">
          {/* School Header Emblem & Names */}
          <div className="text-center border-b-2 border-slate-800 pb-4">
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">Department of Basic Education • Government School</div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase mt-1">
              {settings.schoolName}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {settings.address}, {settings.district}, {settings.state} - {settings.pincode}
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-2 font-semibold">
              <span>U-DISE CODE: {settings.schoolCode}</span>
              <span>•</span>
              <span>AFFILIATION: {settings.affiliationNumber}</span>
              <span>•</span>
              <span>ACADEMIC YEAR: {settings.academicYear}</span>
            </div>
            
            <div className="mt-3 inline-block bg-slate-900 text-white font-bold text-xs uppercase px-4 py-1 rounded-full tracking-wider">
              {exam.name}
            </div>
          </div>

          {/* Student Biodata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Student Name:</span>
              <div className="font-bold text-slate-900 text-sm">{student.name}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Class & Section:</span>
              <div className="font-bold text-slate-900">Class {student.classNumber} - Section '{student.sectionName}'</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Roll Number:</span>
              <div className="font-bold text-slate-900">{student.rollNumber}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Admission No (SRN):</span>
              <div className="font-bold text-slate-900">{student.admissionNumber}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Father's Name:</span>
              <div className="font-bold text-slate-900">{student.fatherName}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Mother's Name:</span>
              <div className="font-bold text-slate-900">{student.motherName}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Date of Birth:</span>
              <div className="font-bold text-slate-900">{student.dateOfBirth}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Attendance Record:</span>
              <div className="font-bold text-emerald-700">{attendancePercentage}% Cumulative</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Student ID:</span>
              <div className="font-mono font-bold text-slate-800">{student.studentId}</div>
            </div>
          </div>

          {/* Scholastic Achievement Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Scholastic Performance & Marks Summary
            </h4>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase">
                    <th className="py-2.5 px-3 border-r border-slate-300">#</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Subject</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">Max Marks</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">Marks Obtained</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">Percentage</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">Grade</th>
                    <th className="py-2.5 px-3">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {marks.map((m, idx) => (
                    <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">{m.subjectName}</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center">{m.maximumMarks}</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-bold text-slate-900">{m.marksObtained}</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center">{m.percentage}%</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center">
                        <span className="font-bold px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-800 border border-slate-300">
                          {m.grade}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-600 italic">{m.remarks || 'Satisfactory'}</td>
                    </tr>
                  ))}
                  {marks.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        No marks entries published for this examination yet.
                      </td>
                    </tr>
                  )}
                </tbody>
                {marks.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900">
                      <td colSpan={2} className="py-2.5 px-3 border-r border-slate-300 uppercase text-right">Grand Total:</td>
                      <td className="py-2.5 px-3 border-r border-slate-300 text-center">{totalMaxMarks}</td>
                      <td className="py-2.5 px-3 border-r border-slate-300 text-center text-sm">{totalObtainedMarks}</td>
                      <td className="py-2.5 px-3 border-r border-slate-300 text-center text-sm text-blue-700">{overallPercentage}%</td>
                      <td className="py-2.5 px-3 border-r border-slate-300 text-center text-sm text-emerald-700">{overall.grade}</td>
                      <td className="py-2.5 px-3 text-xs font-extrabold text-emerald-800">{overall.result}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Grading Scale Reference */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-800 uppercase">Grading Scale:</span>
            <span>A+ (91-100%) Outstanding</span>
            <span>•</span>
            <span>A (81-90%) Excellent</span>
            <span>•</span>
            <span>B+ (71-80%) Very Good</span>
            <span>•</span>
            <span>B (61-70%) Good</span>
            <span>•</span>
            <span>C (51-60%) Fair</span>
            <span>•</span>
            <span>D (33-50%) Pass</span>
          </div>

          {/* Signatures Area */}
          <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs font-semibold text-slate-700">
            <div className="border-t border-slate-400 pt-2">
              <div>Class Teacher's Signature</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">Verified & Signed</div>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <div>Parent / Guardian Signature</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">Acknowledged</div>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <div className="font-bold text-slate-900">Head Teacher / Principal</div>
              <div className="text-[10px] text-slate-500 font-normal mt-0.5">{settings.headTeacherName}</div>
              <div className="text-[9px] text-slate-400 uppercase mt-0.5">Official Stamp / Seal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
