import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  Users, 
  GraduationCap, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  CalendarCheck2, 
  Award, 
  BookOpenCheck,
  CheckCircle2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Student } from '../../types';
import { Modal } from '../common/Modal';

export const TeacherStudents: React.FC = () => {
  const { userProfile } = useAuth();
  const { students, teachers, teacherAssignments, classes, attendanceRecords, examResults } = useSchool();

  const currentTeacher = teachers.find(t => t.id === userProfile?.linkedEntityId) || teachers[0];
  const myAssignments = teacherAssignments.filter(a => a.teacherId === currentTeacher?.id);
  const myClassIds = new Set(myAssignments.map(a => a.classId));

  // If teacher has assignments, prioritize their assigned classes, otherwise allow viewing enrolled classes
  const assignedStudents = students.filter(s => myClassIds.size === 0 || myClassIds.has(s.classId));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = assignedStudents.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.includes(searchQuery);

    const matchesClass = selectedClass === 'all' || s.classNumber === selectedClass;

    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Class Rosters & Student Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Students (छात्र प्रबंधन)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            View student profiles, contact parents, track individual attendance streaks, and monitor academic progress for your allocated classes.
          </p>
        </div>

        <div className="bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700 text-right">
          <div className="text-xs text-slate-400">Total Enrolled</div>
          <div className="text-xl font-black text-amber-400">{filteredStudents.length} Students</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by Name, Admission No., or Roll No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">All Assigned Classes</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 space-y-2">
            <GraduationCap className="w-10 h-10 mx-auto text-slate-400" />
            <div className="font-bold">No students found matching your criteria</div>
            <p className="text-xs">Adjust your search or filter settings</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            return (
              <div 
                key={student.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Adm: {student.admissionNumber} • Roll: {student.rollNumber}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                      Class {student.classNumber}-{student.sectionName}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Father/Guardian:</span>
                      <span className="font-semibold text-slate-800">{student.fatherName}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Contact:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {student.mobile}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-semibold text-slate-800">{student.category}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Student</span>
                  </span>

                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors cursor-pointer"
                  >
                    View Card
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Student Detail Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={`Student Profile: ${selectedStudent?.name}`}
        maxWidth="md"
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-xs">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedStudent.name}</h3>
                <p className="text-slate-600">
                  Admission No: <strong className="font-mono">{selectedStudent.admissionNumber}</strong> • Class {selectedStudent.classNumber}-{selectedStudent.sectionName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold">Father's Name</span>
                <div className="font-bold text-slate-800">{selectedStudent.fatherName}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold">Mother's Name</span>
                <div className="font-bold text-slate-800">{selectedStudent.motherName}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold">Date of Birth</span>
                <div className="font-bold text-slate-800">{selectedStudent.dateOfBirth}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 font-semibold">Mobile Phone</span>
                <div className="font-bold text-slate-800">{selectedStudent.mobile}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold">Residential Address</span>
              <div className="font-bold text-slate-800">{selectedStudent.address}</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
