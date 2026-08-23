import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle, 
  Edit3, 
  Plus, 
  ShieldCheck, 
  Save, 
  X, 
  Search, 
  ExternalLink,
  Wrench
} from 'lucide-react';
import { FacilityItem, DataVerificationStatus } from '../../types';

export const AdminFacilities: React.FC = () => {
  const { facilities, updateFacility, addFacility, language } = useSchool();
  const { userProfile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<FacilityItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Facility Form
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [category, setCategory] = useState<FacilityItem['category']>('Infrastructure');
  const [status, setStatus] = useState<FacilityItem['status']>('Available');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionHi, setDescriptionHi] = useState('');
  const [source, setSource] = useState('UDISE+ / School Verification');

  const categories: FacilityItem['category'][] = [
    'Infrastructure',
    'Water & Sanitation',
    'Digital & ICT',
    'Nutrition & Health',
    'Accessibility & Sports',
    'Safety & Hygiene'
  ];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    await updateFacility(editingItem.id, {
      nameEn: editingItem.nameEn,
      nameHi: editingItem.nameHi,
      category: editingItem.category,
      status: editingItem.status,
      descriptionEn: editingItem.descriptionEn,
      descriptionHi: editingItem.descriptionHi,
      source: editingItem.source,
      lastUpdated: new Date().toISOString().split('T')[0]
    });

    setEditingItem(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn) return;

    await addFacility({
      nameEn,
      nameHi: nameHi || nameEn,
      category,
      status,
      verificationStatus: 'VERIFIED_CURRENT',
      source,
      lastUpdated: new Date().toISOString().split('T')[0],
      verification: {
        isVerified: true,
        status: 'VERIFIED_CURRENT',
        source: 'Headmaster Administrative Directorate',
        lastUpdated: new Date().toISOString()
      },
      descriptionEn,
      descriptionHi: descriptionHi || descriptionEn,
      iconName: 'Building'
    });

    setIsAddModalOpen(false);
    setNameEn('');
    setNameHi('');
    setDescriptionEn('');
    setDescriptionHi('');
  };

  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = f.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.nameHi.includes(searchQuery) ||
                          f.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {language === 'hi' ? 'भौतिक सुविधाएं प्रबंधन' : 'School Facilities & Infrastructure'}
              </span>
              <span className="text-xs font-mono text-slate-500">{facilities.length} Facilities Monitored</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {language === 'hi' ? 'विद्यालय सुविधाएं एवं अवसंरचना' : 'Facilities & Physical Infrastructure'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'hi'
                ? 'कक्षा कक्ष, पेयजल, शौचालय, कंप्यूटर, खेल मैदान एवं अन्य सुविधाओं की वास्तविक स्थिति अपडेट करें।'
                : 'Manage real-time status (Available, Not Available, Under Maintenance, Needs Verification) and audit trails.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'hi' ? 'नई सुविधा जोड़ें' : 'Add New Facility'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Facility status updated successfully and synced with public portal!</span>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'सुविधा का नाम खोजें...' : 'Search facility by name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto custom-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({facilities.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFacilities.map((fac) => {
          const isAvailable = fac.status === 'Available';
          const isNotAvailable = fac.status === 'Not Available';
          const isMaintenance = fac.status === 'Under Maintenance';

          return (
            <div 
              key={fac.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                    {fac.category}
                  </span>

                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    isAvailable ? 'bg-emerald-100 text-emerald-800' :
                    isNotAvailable ? 'bg-rose-100 text-rose-800' :
                    isMaintenance ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isAvailable && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {isNotAvailable && <XCircle className="w-3 h-3 text-rose-600" />}
                    {isMaintenance && <Clock className="w-3 h-3 text-amber-600" />}
                    <span>{fac.status}</span>
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-slate-900">{language === 'hi' ? fac.nameHi : fac.nameEn}</h4>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{language === 'hi' ? fac.nameEn : fac.nameHi}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {language === 'hi' ? fac.descriptionHi : fac.descriptionEn}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 text-[10px]">Updated: {fac.lastUpdated}</span>
                <button
                  onClick={() => setEditingItem(fac)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Facility</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-slate-900">Edit Facility Details</h3>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded-xl text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Name (English) *</label>
                  <input
                    type="text"
                    value={editingItem.nameEn}
                    onChange={(e) => setEditingItem({ ...editingItem, nameEn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">नाम (हिंदी) *</label>
                  <input
                    type="text"
                    value={editingItem.nameHi}
                    onChange={(e) => setEditingItem({ ...editingItem, nameHi: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as FacilityItem['category'] })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Operational Status *</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as FacilityItem['status'] })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden font-bold"
                  >
                    <option value="Available">Available (उपलब्ध)</option>
                    <option value="Not Available">Not Available (अनुपलब्ध)</option>
                    <option value="Under Maintenance">Under Maintenance (मरम्मत कार्य जारी)</option>
                    <option value="Verification Required">Verification Required (सत्यापन प्रतीक्षारत)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={editingItem.descriptionEn}
                  onChange={(e) => setEditingItem({ ...editingItem, descriptionEn: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">विवरण (हिंदी)</label>
                <textarea
                  rows={2}
                  value={editingItem.descriptionHi}
                  onChange={(e) => setEditingItem({ ...editingItem, descriptionHi: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-slate-900">Add New Facility</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Name (English) *</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Science Laboratory"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">नाम (हिंदी)</label>
                  <input
                    type="text"
                    value={nameHi}
                    onChange={(e) => setNameHi(e.target.value)}
                    placeholder="उदा. विज्ञान प्रयोगशाला"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FacilityItem['category'])}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as FacilityItem['status'])}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden font-bold"
                  >
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Verification Required">Verification Required</option>
                  </select>
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
                  Add Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
