import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TimetableSlot } from '../../types';
import { Clock, Plus, Layers, Edit, Trash2, BookOpen, User, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminTimetable: React.FC = () => {
  const { timetable, classes, teachers, subjects, addTimetableSlot } = useSchool();
  const [selectedClassNumber, setSelectedClassNumber] = useState<number>(8);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6];

  const periodTimings: Record<number, string> = {
    1: '09:00 - 09:45 AM',
    2: '09:45 - 10:30 AM',
    3: '10:30 - 11:15 AM',
    4: '11:15 - 12:00 PM',
    5: '12:40 - 01:25 PM',
    6: '01:25 - 02:10 PM'
  };

  const [formData, setFormData] = useState({
    day: 'Monday',
    periodNumber: 1,
    subjectName: 'Mathematics',
    teacherId: teachers[0]?.id || '',
    roomNumber: 'Room 201'
  });

  const handleOpenAdd = () => {
    setFormData({
      day: 'Monday',
      periodNumber: 1,
      subjectName: 'Science',
      teacherId: teachers[0]?.id || '',
      roomNumber: `Room ${100 + selectedClassNumber}`
    });
    setIsAddModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find(t => t.id === formData.teacherId);
    await addTimetableSlot({
      classId: `class-${selectedClassNumber}`,
      classNumber: selectedClassNumber,
      sectionId: `sec-${selectedClassNumber}-${selectedSection}`,
      sectionName: selectedSection,
      day: formData.day as any,
      periodNumber: Number(formData.periodNumber),
      startTime: periodTimings[Number(formData.periodNumber)].split(' - ')[0],
      endTime: periodTimings[Number(formData.periodNumber)].split(' - ')[1],
      subjectName: formData.subjectName,
      teacherName: teacher ? teacher.name : 'Faculty',
      roomNumber: formData.roomNumber
    });
    setIsAddModalOpen(false);
  };

  // Filter slots for chosen class & section
  const currentSlots = timetable.filter(
    t => t.classNumber === selectedClassNumber && t.sectionName === selectedSection
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Academic Master Timetable</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Weekly period allocations and teacher deployments for Classes 1 to 8
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add / Update Schedule Slot</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Grade Level:</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <button
                key={num}
                onClick={() => setSelectedClassNumber(num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedClassNumber === num
                    ? 'bg-slate-900 text-amber-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Class {num}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Section:</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Timetable Grid / Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800">
                <th className="py-3 px-4 w-32 uppercase font-bold text-[11px] text-amber-400">Day / Daypart</th>
                {periods.map(p => (
                  <th key={p} className="py-3 px-3 border-l border-slate-800 text-center">
                    <div className="font-extrabold text-xs">Period {p}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal">{periodTimings[p]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {daysOfWeek.map((day) => {
                return (
                  <tr key={day} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-black text-slate-900 bg-slate-50 border-r border-slate-200">
                      {day}
                    </td>
                    {periods.map(periodNum => {
                      const slot = currentSlots.find(s => s.day === day && s.periodNumber === periodNum);
                      return (
                        <td key={periodNum} className="py-2.5 px-3 border-l border-slate-200 text-center">
                          {slot ? (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left space-y-1">
                              <div className="font-bold text-slate-900 text-xs truncate">
                                {slot.subjectName}
                              </div>
                              <div className="text-[10px] text-amber-800 font-semibold truncate flex items-center gap-1">
                                <User className="w-3 h-3 text-amber-600" />
                                <span>{slot.teacherName.split(' ')[0]}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-slate-50 text-slate-400 text-[10px] italic">
                              Self Study / Library
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Timetable Slot Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Assign Slot for Class ${selectedClassNumber} - Section ${selectedSection}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveSlot} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week *</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {daysOfWeek.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Period Number *</label>
              <select
                value={formData.periodNumber}
                onChange={(e) => setFormData({ ...formData, periodNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {periods.map(p => (
                  <option key={p} value={p}>Period {p} ({periodTimings[p]})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mathematics / Science / English / Hindi / Arts"
              value={formData.subjectName}
              onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Teacher *</label>
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Classroom / Hall</label>
            <input
              type="text"
              required
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
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
              Save Schedule Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
