import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Notice } from '../../types';
import { Bell, Plus, Search, Trash2, Globe, Lock, Calendar, Tag, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminNotices: React.FC = () => {
  const { notices, addNotice, deleteNotice } = useSchool();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Academic' as 'General' | 'Academic' | 'Holiday' | 'Exam' | 'Mid-Day Meal' | 'Sports & Cultural',
    targetRole: 'all' as 'all' | 'teacher' | 'student',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    isPublic: true
  });

  const filteredNotices = notices.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Academic',
      targetRole: 'all',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      isPublic: true
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNotice({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      targetRole: formData.targetRole,
      publishDate: formData.publishDate,
      expiryDate: formData.expiryDate,
      authorId: 'tch-001',
      authorName: 'Head Teacher / Admin',
      isPublic: formData.isPublic,
      status: 'active'
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Official Circulars & Notice Board</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast institutional updates to public portal, teachers, or students
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search circulars, keywords, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredNotices.map((notice) => (
          <div 
            key={notice.id} 
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  {notice.category}
                </span>
                <div className="flex items-center gap-2">
                  {notice.isPublic ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Globe className="w-3 h-3" /> Public
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" /> Portal Only
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-mono">{notice.publishDate}</span>
                </div>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 leading-snug">{notice.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{notice.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Audience: <strong className="capitalize text-slate-700">{notice.targetRole}</strong></span>
              <button
                onClick={() => deleteNotice(notice.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Notice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Notice Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Publish Official School Notice / Circular"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notice Headline *</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Sports Meet 2025 Schedule"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Academic">Academic</option>
                <option value="Exam">Examinations</option>
                <option value="Holiday">Holidays & Vacations</option>
                <option value="Mid-Day Meal">Mid-Day Meal (MDM)</option>
                <option value="Sports & Cultural">Sports & Cultural</option>
                <option value="General">General Administrative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
              <select
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="all">Everyone (All School)</option>
                <option value="teacher">Teachers Only</option>
                <option value="student">Students & Parents</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Publish Date</label>
              <input
                type="date"
                required
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
              </input>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPublicCheck"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="rounded-sm border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="isPublicCheck" className="text-xs font-bold text-slate-700">
              Display publicly on School Website homepage
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notice Description / Content *</label>
            <textarea
              rows={4}
              required
              placeholder="Write the full circular description, guidelines or instructions..."
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
              Post Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
