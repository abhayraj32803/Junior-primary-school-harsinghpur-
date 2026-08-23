import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Gift, 
  CheckCircle2, 
  ShieldCheck, 
  Edit3, 
  Plus, 
  Search, 
  ExternalLink, 
  FileText, 
  Utensils, 
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { GovernmentScheme, DataVerificationStatus } from '../../types';

export const AdminSchemes: React.FC = () => {
  const { governmentSchemes, updateGovernmentScheme, addGovernmentScheme, language } = useSchool();
  const { userProfile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingScheme, setEditingScheme] = useState<GovernmentScheme | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Scheme State
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [department, setDepartment] = useState('Basic Education Department, Govt. of UP');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionHi, setDescriptionHi] = useState('');
  const [eligibilityEn, setEligibilityEn] = useState('');
  const [eligibilityHi, setEligibilityHi] = useState('');
  const [mealInfoHi, setMealInfoHi] = useState('');
  const [distributionStatus, setDistributionStatus] = useState<GovernmentScheme['distributionStatus']>('Active & Ongoing');
  const [academicYear, setAcademicYear] = useState('2025-2026');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheme) return;

    await updateGovernmentScheme(editingScheme.id, {
      nameEn: editingScheme.nameEn,
      nameHi: editingScheme.nameHi,
      department: editingScheme.department,
      descriptionEn: editingScheme.descriptionEn,
      descriptionHi: editingScheme.descriptionHi,
      eligibilityEn: editingScheme.eligibilityEn,
      eligibilityHi: editingScheme.eligibilityHi,
      mealInfoHi: editingScheme.mealInfoHi,
      distributionStatus: editingScheme.distributionStatus,
      academicYear: editingScheme.academicYear,
      lastUpdated: new Date().toISOString().split('T')[0]
    });

    setEditingScheme(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn) return;

    await addGovernmentScheme({
      nameEn,
      nameHi: nameHi || nameEn,
      department,
      descriptionEn,
      descriptionHi: descriptionHi || descriptionEn,
      eligibilityEn,
      eligibilityHi: eligibilityHi || eligibilityEn,
      mealInfoHi,
      distributionStatus,
      academicYear,
      documentsRequired: ['Aadhaar Card', 'Bank Passbook (Parent/Guardian)', 'Admission Receipt'],
      verificationStatus: 'VERIFIED_CURRENT',
      source: 'Department of Basic Education Portal',
      lastUpdated: new Date().toISOString().split('T')[0],
      verification: {
        isVerified: true,
        status: 'VERIFIED_CURRENT',
        source: 'Headmaster Administrative Directorate',
        lastUpdated: new Date().toISOString()
      }
    });

    setIsAddModalOpen(false);
    setNameEn('');
    setNameHi('');
    setDescriptionEn('');
    setDescriptionHi('');
  };

  const filteredSchemes = governmentSchemes.filter(s => 
    s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nameHi.includes(searchQuery) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {language === 'hi' ? 'कल्याणकारी योजनाएं' : 'Government Welfare Schemes'}
              </span>
              <span className="text-xs font-mono text-slate-500">{governmentSchemes.length} Schemes Active</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {language === 'hi' ? 'शासकीय कल्याणकारी योजनाएं एवं डीबीटी' : 'Government Schemes, MDM & DBT'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'hi'
                ? 'पीएम पोषण (मध्याह्न भोजन), निःशुल्क पाठ्यपुस्तक, निःशुल्क यूनिफॉर्म/डीबीटी एवं छात्रवृत्ति वितरण की जानकारी अपडेट करें।'
                : 'Manage Mid-Day Meal guidelines, free textbook distribution, uniform DBT benefits, and scholarships.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'hi' ? 'नई योजना जोड़ें' : 'Add Government Scheme'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Scheme details updated and published to school website!</span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'योजना का नाम खोजें...' : 'Search scheme name or department...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Scheme Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredSchemes.map((scheme) => (
          <div 
            key={scheme.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {scheme.department}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {scheme.distributionStatus}
                </span>
              </div>

              <div>
                <h4 className="font-black text-base text-slate-900">{language === 'hi' ? scheme.nameHi : scheme.nameEn}</h4>
                <p className="text-xs font-semibold text-slate-500">{language === 'hi' ? scheme.nameEn : scheme.nameHi}</p>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">
                {language === 'hi' ? scheme.descriptionHi : scheme.descriptionEn}
              </p>

              {scheme.mealInfoHi && (
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                  <Utensils className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="line-clamp-2">
                    <strong>MDM विवरण:</strong> {scheme.mealInfoHi}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] font-mono">Session: {scheme.academicYear}</span>
              <button
                onClick={() => setEditingScheme(scheme)}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Scheme</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingScheme && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-slate-900">Edit Scheme Details</h3>
              </div>
              <button onClick={() => setEditingScheme(null)} className="p-1 rounded-xl text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Name (English) *</label>
                  <input
                    type="text"
                    value={editingScheme.nameEn}
                    onChange={(e) => setEditingScheme({ ...editingScheme, nameEn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">योजना का नाम (हिंदी) *</label>
                  <input
                    type="text"
                    value={editingScheme.nameHi}
                    onChange={(e) => setEditingScheme({ ...editingScheme, nameHi: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingScheme.distributionStatus}
                    onChange={(e) => setEditingScheme({ ...editingScheme, distributionStatus: e.target.value as GovernmentScheme['distributionStatus'] })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden font-bold"
                  >
                    <option value="Active & Ongoing">Active & Ongoing</option>
                    <option value="Scheduled Distribution">Scheduled Distribution</option>
                    <option value="Completed for Session">Completed for Session</option>
                    <option value="Verification Required">Verification Required</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Session</label>
                  <input
                    type="text"
                    value={editingScheme.academicYear}
                    onChange={(e) => setEditingScheme({ ...editingScheme, academicYear: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">विवरण (हिंदी)</label>
                <textarea
                  rows={2}
                  value={editingScheme.descriptionHi}
                  onChange={(e) => setEditingScheme({ ...editingScheme, descriptionHi: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">पात्रता / Eligibility (हिंदी)</label>
                <input
                  type="text"
                  value={editingScheme.eligibilityHi}
                  onChange={(e) => setEditingScheme({ ...editingScheme, eligibilityHi: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">MDM मेनू / पोषण विवरण (वैकल्पिक)</label>
                <textarea
                  rows={2}
                  value={editingScheme.mealInfoHi || ''}
                  onChange={(e) => setEditingScheme({ ...editingScheme, mealInfoHi: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingScheme(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-slate-900">Add Government Scheme</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Name (English) *</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Free School Bag & Stationery"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">योजना का नाम (हिंदी)</label>
                  <input
                    type="text"
                    value={nameHi}
                    onChange={(e) => setNameHi(e.target.value)}
                    placeholder="उदा. निःशुल्क स्कूल बैग योजना"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!nameEn}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all disabled:opacity-50"
                >
                  Add Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
