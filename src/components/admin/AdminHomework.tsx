import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Homework } from '../../types';
import { BookOpenCheck, Plus, Calendar, Layers, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminHomework: React.FC = () => {
  const { homeworkList, classes, subjects, teachers, addHomework, deleteHomework } = useSchool();
  const [selectedClassNumber, setSelectedClassNumber] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classNumber: 8,
    sectionName: 'A',
    subjectName: 'Science',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  });

  const filteredHomework = homeworkList.filter(h => 
    selectedClassNumber === 'all' || h.classNumber === Number(selectedClassNumber)
  );

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      classNumber: 8,
      sectionName: 'A',
      subjectName: 'Science',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
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
      teacherId: 'tch-001',
      teacherName: 'Head Teacher / Admin',
      assignedDate: formData.assignedDate,
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
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Homework & Home Assignments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor and distribute daily learning tasks for Classes 1 to 8
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Homework</span>
        </button>
      </div>

      {/* Class Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => setSelectedClassNumber('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedClassNumber === 'all'
              ? 'bg-slate-900 text-amber-400'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Classes
        </button>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
          <button
            key={num}
            onClick={() => setSelectedClassNumber(String(num))}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedClassNumber === String(num)
                ? 'bg-slate-900 text-amber-400'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Class {num}
          </button>
        ))}
      </div>

      {/* Homework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHomework.map((hw) => (
          <div key={hw.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                  {hw.subjectName}
                </span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Class {hw.classNumber} - '{hw.sectionName}'
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 leading-snug">{hw.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{hw.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>Due: {hw.dueDate}</span>
              </div>

              <button
                onClick={() => deleteHomework(hw.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove Homework"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredHomework.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            No homework assigned for this filter.
          </div>
        )}
      </div>

      {/* Add Homework Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Assign Daily Homework to Students"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Homework Title / Topic *</label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 4: Photosynthesis Exercise Questions"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
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
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Submission Due Date *</label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Homework Details / Problem Set *</label>
            <textarea
              rows={4}
              required
              placeholder="List specific notebook problems, textbook questions or project assignments..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Broadcast Homework
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
