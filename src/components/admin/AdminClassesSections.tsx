import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Section, SchoolClass } from '../../types';
import { 
  Layers, 
  Plus, 
  Users, 
  Edit, 
  DoorOpen, 
  UserCheck, 
  GraduationCap, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminClassesSections: React.FC = () => {
  const { classes, sections, students, teachers, addSection, updateSection } = useSchool();
  const [selectedClassId, setSelectedClassId] = useState<string>('class-1');
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const [formData, setFormData] = useState({
    sectionName: 'C',
    roomNumber: 'Room-105',
    capacity: 40,
    classTeacherId: ''
  });

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classSections = sections.filter(s => s.classId === selectedClassId);

  const handleOpenAdd = () => {
    setFormData({
      sectionName: 'C',
      roomNumber: `Room-${100 + Number(currentClass.classNumber)}C`,
      capacity: 40,
      classTeacherId: teachers[0]?.id || ''
    });
    setIsAddSectionModalOpen(true);
  };

  const handleOpenEdit = (sec: Section) => {
    setSelectedSection(sec);
    const assignedTeacher = teachers.find(t => t.name === sec.classTeacherName);
    setFormData({
      sectionName: sec.sectionName,
      roomNumber: sec.roomNumber || '',
      capacity: sec.capacity || 40,
      classTeacherId: assignedTeacher?.id || teachers[0]?.id || ''
    });
    setIsEditSectionModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find(t => t.id === formData.classTeacherId);
    await addSection({
      classId: currentClass.id,
      classNumber: currentClass.classNumber,
      sectionName: formData.sectionName.toUpperCase(),
      classTeacherName: teacher ? teacher.name : 'Not Assigned',
      roomNumber: formData.roomNumber,
      capacity: Number(formData.capacity)
    });
    setIsAddSectionModalOpen(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;
    const teacher = teachers.find(t => t.id === formData.classTeacherId);
    await updateSection(selectedSection.id, {
      sectionName: formData.sectionName.toUpperCase(),
      classTeacherName: teacher ? teacher.name : selectedSection.classTeacherName,
      roomNumber: formData.roomNumber,
      capacity: Number(formData.capacity)
    });
    setIsEditSectionModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Class & Section Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard Primary (Classes 1-5) and Upper Primary (Classes 6-8) Structure
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Section to {currentClass?.name}</span>
        </button>
      </div>

      {/* Class Switcher Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {classes.map((cls) => {
          const isSelected = cls.id === selectedClassId;
          const studentCount = students.filter(s => s.classId === cls.id).length;
          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`p-3 rounded-2xl text-center border transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-102'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                {cls.classNumber <= 5 ? 'Primary' : 'Upper Pri.'}
              </div>
              <div className="text-sm font-black mt-0.5">{cls.name}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                {studentCount} Students
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Class Overview & Section Cards */}
      {currentClass && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  {currentClass.stage}
                </span>
                <span className="text-xs font-bold text-slate-400">Class Grade Level {currentClass.classNumber}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Sections & Classroom Allocation for {currentClass.name}
              </h3>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Total Enrolled: <strong className="text-slate-900">{students.filter(s => s.classId === currentClass.id).length} Students</strong>
            </div>
          </div>

          {/* Section Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classSections.map((sec) => {
              const secStudents = students.filter(s => s.classId === currentClass.id && s.sectionName === sec.sectionName);
              return (
                <div key={sec.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 hover:border-amber-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-900">
                      Section {sec.sectionName}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(sec)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-amber-600 shadow-xs"
                      title="Edit Section Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        Class Teacher:
                      </span>
                      <span className="font-bold text-slate-800">{sec.classTeacherName || 'Unassigned'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <DoorOpen className="w-4 h-4 text-slate-400" />
                        Classroom:
                      </span>
                      <span className="font-mono font-bold text-slate-800">{sec.roomNumber || 'Room 101'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        Capacity:
                      </span>
                      <span className="font-medium text-slate-700">
                        {secStudents.length} / {sec.capacity || 40} ({Math.round((secStudents.length / (sec.capacity || 40)) * 100)}% filled)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (secStudents.length / (sec.capacity || 40)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      <Modal
        isOpen={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        title={`Add New Section for ${currentClass?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Section Identifier (Letter) *</label>
            <input
              type="text"
              required
              maxLength={2}
              placeholder="e.g. C or D"
              value={formData.sectionName ?? ''}
              onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Class Teacher *</label>
            <select
              value={formData.classTeacherId ?? ''}
              onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                required
                value={formData.roomNumber ?? ''}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Student Capacity</label>
              <input
                type="number"
                required
                min={10}
                max={80}
                value={formData.capacity ?? 40}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddSectionModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md"
            >
              Create Section
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Section Modal */}
      <Modal
        isOpen={isEditSectionModalOpen}
        onClose={() => setIsEditSectionModalOpen(false)}
        title={`Edit Section ${selectedSection?.sectionName} (${currentClass?.name})`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Section Identifier *</label>
            <input
              type="text"
              required
              maxLength={2}
              value={formData.sectionName ?? ''}
              onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Class Teacher</label>
            <select
              value={formData.classTeacherId ?? ''}
              onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                required
                value={formData.roomNumber ?? ''}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Capacity</label>
              <input
                type="number"
                required
                min={10}
                max={80}
                value={formData.capacity ?? 40}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditSectionModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
            >
              Update Section
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
