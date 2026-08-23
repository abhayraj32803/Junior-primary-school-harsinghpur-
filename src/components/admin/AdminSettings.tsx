import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolSettings } from '../../types';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  ShieldAlert, 
  Building, 
  Award, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, resetToSeedData } = useSchool();
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    await resetToSeedData();
    setIsResetting(false);
    setIsResetModalOpen(false);
    setFormData({ ...settings });
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Institutional Configuration & Master Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure school identification, U-DISE parameters, grading schemes, and system state
          </p>
        </div>

        <button
          onClick={() => setIsResetModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-red-600" />
          <span>Reset to Fresh Seed Data</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">Institutional settings successfully updated and saved!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-600" />
            <span>School Identification & Accreditation</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official School Name *</label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">U-DISE National Code *</label>
              <input
                type="text"
                required
                value={formData.schoolCode}
                onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Affiliation / Reg Number</label>
              <input
                type="text"
                required
                value={formData.affiliationNumber}
                onChange={(e) => setFormData({ ...formData, affiliationNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Academic Session</label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Head Teacher / In-charge Name</label>
              <input
                type="text"
                required
                value={formData.headTeacherName}
                onChange={(e) => setFormData({ ...formData, headTeacherName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Office Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Address / Street</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District / Block</label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code (PIN)</label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Teacher Video & Media Upload Permissions */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Teacher Video & Media Upload Permissions (शिक्षक वीडियो एवं मीडिया अपलोड अनुमतियां)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure whether faculty and teachers can upload classroom learning videos, FLN demonstrations, and sports drills to the portal.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer p-2 bg-white rounded-xl border border-slate-200 hover:border-amber-400 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.allowTeacherVideoUpload !== false}
                  onChange={(e) => setFormData({ ...formData, allowTeacherVideoUpload: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-amber-600 rounded"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Allow Teachers to Upload Videos</span>
                  <span className="text-slate-500 text-[11px]">शिक्षकों को पोर्टल में वीडियो अपलोड एवं लिंक करने का विकल्प प्रदान करें</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-2 bg-white rounded-xl border border-slate-200 hover:border-amber-400 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.teacherVideoApprovalRequired || false}
                  onChange={(e) => setFormData({ ...formData, teacherVideoApprovalRequired: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-amber-600 rounded"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Require Admin Moderation / Review</span>
                  <span className="text-slate-500 text-[11px]">शिक्षक द्वारा अपलोड वीडियो सार्वजनिक करने से पूर्व प्रधानाध्यापक द्वारा सत्यापन आवश्यक हो</span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Video Duration (Minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={formData.teacherVideoMaxDurationMinutes || 15}
                  onChange={(e) => setFormData({ ...formData, teacherVideoMaxDurationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supported Video Channels</label>
                <div className="px-3 py-2 bg-slate-100 rounded-xl text-xs text-slate-700 font-medium">
                  Direct MP4/WebM Upload • YouTube Videos & Shorts • Google Drive Links
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>

      {/* Grading Scheme Reference */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          <span>CCE Grading Scale (Continuous Comprehensive Evaluation)</span>
        </h3>
        <p className="text-xs text-slate-500">
          Standard 7-point grading scale approved by State Basic Shiksha Parishad for Classes 1 to 8.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="text-lg font-black text-emerald-900">A1</div>
            <div className="text-[11px] text-emerald-700 font-bold">91% — 100%</div>
            <div className="text-[10px] text-slate-500 mt-1">Outstanding</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="text-lg font-black text-emerald-800">A2</div>
            <div className="text-[11px] text-emerald-700 font-bold">81% — 90%</div>
            <div className="text-[10px] text-slate-500 mt-1">Excellent</div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="text-lg font-black text-blue-900">B1</div>
            <div className="text-[11px] text-blue-700 font-bold">71% — 80%</div>
            <div className="text-[10px] text-slate-500 mt-1">Very Good</div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
            <div className="text-lg font-black text-blue-800">B2</div>
            <div className="text-[11px] text-blue-700 font-bold">61% — 70%</div>
            <div className="text-[10px] text-slate-500 mt-1">Good</div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="text-lg font-black text-amber-900">C1</div>
            <div className="text-[11px] text-amber-800 font-bold">51% — 60%</div>
            <div className="text-[10px] text-slate-500 mt-1">Fair</div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="text-lg font-black text-amber-800">C2</div>
            <div className="text-[11px] text-amber-800 font-bold">41% — 50%</div>
            <div className="text-[10px] text-slate-500 mt-1">Average</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
            <div className="text-lg font-black text-slate-700">D</div>
            <div className="text-[11px] text-slate-600 font-bold">33% — 40%</div>
            <div className="text-[10px] text-slate-500 mt-1">Pass</div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Database Reset to Seed State"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold">Are you sure you want to reset?</div>
              <p>
                This will wipe local modifications and re-populate the complete realistic data set for Classes 1 to 8, sample teachers, students, attendance, homework, exams, and notices.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isResetting}
              onClick={handleConfirmReset}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md disabled:opacity-50"
            >
              {isResetting ? 'Resetting...' : 'Yes, Reset Database'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
