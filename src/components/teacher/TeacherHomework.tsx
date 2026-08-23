import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { BookOpenCheck, Plus, Clock, Trash2, Calendar } from 'lucide-react';
import { Modal } from '../common/Modal';

export const TeacherHomework: React.FC = () => {
  const { userProfile } = useAuth();
  const { teachers, teacherAssignments, homeworkList, addHomework, deleteHomework } = useSchool();

  const currentTeacher = teachers.find(t => t.id === userProfile?.entityId) || teachers[0];
  const myAssignments = teacherAssignments.filter(a => a.teacherId === currentTeacher?.id);
  const myHomework = homeworkList.filter(h => h.teacherId === currentTeacher?.id || h.teacherName.includes(currentTeacher?.name || ''));

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classNumber: myAssignments[0]?.classNumber || 8,
    sectionName: myAssignments[0]?.sectionName || 'A',
    subjectName: myAssignments[0]?.subjectName || 'Science',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await addHomework({
      title: formData.title,
      description: formData.description,
      classId: `class-${formData.classNumber}`,
      classNumber: Number(formData.classNumber),
      sectionId: `sec-${formData.classNumber}-${formData.sectionName}`,
      sectionName: formData.sectionName,
      subjectId: `sub-${formData.classNumber}-gen`,
      subjectName: formData.subjectName,
      teacherId: currentTeacher?.id || 'tch-001',
      teacherName: currentTeacher?.name || 'Teacher',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      status: 'active'
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Homework Assignments & Tasks</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign homework tasks and project work to your classes
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Homework Task</span>
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myHomework.map((hw) => (
          <div key={hw.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                  {hw.subjectName}
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                  Class {hw.classNumber} - '{hw.sectionName}'
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">{hw.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{hw.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1 text-amber-700 font-bold text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>Due: {hw.dueDate}</span>
              </div>
              <button
                onClick={() => deleteHomework(hw.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {myHomework.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            You have not assigned any homework yet.
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Student Homework Assignment"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Homework Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Science Chapter 5 Notebook Questions"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
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
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Due Date *</label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Instructions / Problems *</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md"
            >
              Post Homework
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
