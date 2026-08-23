import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TeacherAssignment } from '../../types';
import { Users, Plus, Trash2, BookOpen, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminTeacherAssignments: React.FC = () => {
  const { teacherAssignments, teachers, classes, sections, subjects, addTeacherAssignment, removeTeacherAssignment } = useSchool();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    teacherId: '',
    classNumber: 6,
    sectionName: 'A',
    subjectName: 'Science'
  });

  const handleOpenAdd = () => {
    setFormData({
      teacherId: teachers[0]?.id || '',
      classNumber: 6,
      sectionName: 'A',
      subjectName: 'Science'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find(t => t.id === formData.teacherId);
    if (!teacher) return;

    await addTeacherAssignment({
      teacherId: teacher.id,
      teacherName: teacher.name,
      classId: `class-${formData.classNumber}`,
      classNumber: Number(formData.classNumber),
      sectionId: `sec-${formData.classNumber}-${formData.sectionName}`,
      sectionName: formData.sectionName,
      subjectId: `sub-${formData.classNumber}-gen`,
      subjectName: formData.subjectName,
      academicYear: '2025-2026'
    });
    setIsAddModalOpen(false);
  };

  const availableSubjectsForClass = subjects.filter(s => s.classNumber === Number(formData.classNumber));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Teacher Subject & Class Allocations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign qualified faculty to specific classes, sections, and subjects for the 2025-2026 session
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Faculty Assignment</span>
        </button>
      </div>

      {/* Allocations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Educator Name</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Assigned Subject</th>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teacherAssignments.map((asgn) => (
                <tr key={asgn.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                        {asgn.teacherName.charAt(0)}
                      </div>
                      <span>{asgn.teacherName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    Class {asgn.classNumber} - Section '{asgn.sectionName}'
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      {asgn.subjectName}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {asgn.academicYear}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => removeTeacherAssignment(asgn.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {teacherAssignments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No teacher assignments mapped.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Assignment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Assign Teacher to Subject & Class"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Faculty Educator *</label>
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class *</label>
              <select
                value={formData.classNumber}
                onChange={(e) => setFormData({ ...formData, classNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>Class {num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section *</label>
              <select
                value={formData.sectionName}
                onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mathematics / Science / English"
              value={formData.subjectName}
              onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
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
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
