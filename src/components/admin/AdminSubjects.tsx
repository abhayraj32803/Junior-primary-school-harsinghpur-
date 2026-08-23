import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Subject } from '../../types';
import { BookOpen, Plus, Search, Edit, Trash2, Award, CheckCircle } from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminSubjects: React.FC = () => {
  const { subjects, classes, addSubject } = useSchool();
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subjectCode: 'SUB-101',
    classId: 'class-1',
    classNumber: 1,
    totalMarks: 100,
    passingMarks: 33
  });

  const filteredSubjects = subjects.filter(s => 
    selectedClassId === 'all' || s.classId === selectedClassId
  );

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      subjectCode: `SUB-${Math.floor(100 + Math.random() * 900)}`,
      classId: 'class-6',
      classNumber: 6,
      totalMarks: 100,
      passingMarks: 33
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSubject({
      name: formData.name,
      subjectCode: formData.subjectCode.toUpperCase(),
      classId: formData.classId,
      classNumber: Number(formData.classNumber),
      totalMarks: Number(formData.totalMarks),
      passingMarks: Number(formData.passingMarks)
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Curriculum Subject Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {subjects.length} prescribed subjects across Primary & Upper Primary classes
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Class Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => setSelectedClassId('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedClassId === 'all'
              ? 'bg-slate-900 text-amber-400'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Classes
        </button>
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => setSelectedClassId(cls.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedClassId === cls.id
                ? 'bg-slate-900 text-amber-400'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cls.name}
          </button>
        ))}
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((sub) => (
          <div key={sub.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700">
                {sub.subjectCode}
              </span>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Class {sub.classNumber}
              </span>
            </div>

            <h3 className="font-extrabold text-base text-slate-900">{sub.name}</h3>

            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Max Marks</span>
                <span className="font-bold text-slate-800">{sub.totalMarks} Marks</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Passing Marks</span>
                <span className="font-bold text-emerald-700">{sub.passingMarks} Marks</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Prescribed Subject to Curriculum"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sanskrit / ICT Computer Science"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code *</label>
              <input
                type="text"
                required
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Class *</label>
              <select
                value={formData.classNumber}
                onChange={(e) => {
                  const cNum = Number(e.target.value);
                  setFormData({
                    ...formData,
                    classNumber: cNum,
                    classId: `class-${cNum}`
                  });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>Class {num}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Max Marks</label>
              <input
                type="number"
                required
                min={20}
                max={200}
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Passing Marks</label>
              <input
                type="number"
                required
                min={5}
                max={100}
                value={formData.passingMarks}
                onChange={(e) => setFormData({ ...formData, passingMarks: Number(e.target.value) })}
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
              Save Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
