import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  MapPin, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  FileText, 
  Award,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';
import { SchoolSettings, DataVerificationStatus } from '../../types';

export const AdminSchoolProfile: React.FC = () => {
  const { settings, updateSchoolSettingsWithAudit, language } = useSchool();
  const { userProfile } = useAuth();

  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'general' | 'location' | 'academic' | 'media'>('general');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (settings) {
      setFormData(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleChange = (field: keyof SchoolSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSchoolSettingsWithAudit(formData, {
        field: 'Institutional Profile',
        previousValue: settings.schoolName,
        newValue: formData.schoolName,
        source: 'Headmaster Administrative Panel',
        status: 'VERIFIED_CURRENT',
        notes: `Updated institutional profile details by ${userProfile?.name || 'Admin'}`
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...settings });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {language === 'hi' ? 'सत्यापित विद्यालय प्रोफ़ाइल' : 'Verified School Profile'}
              </span>
              <span className="text-xs font-mono text-slate-500">UDISE: {settings.schoolCode}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {language === 'hi' ? 'विद्यालय प्रोफ़ाइल एवं विवरण' : 'School Profile & Institutional Information'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'hi' 
                ? 'वेबसाइट पर प्रदर्शित होने वाली समस्त आधिकारिक जानकारी को यहाँ से प्रबंधित करें।' 
                : 'Manage the official institutional records, location metadata, and background displayed across the public portal.'}
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-1 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'general' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            {language === 'hi' ? 'सामान्य जानकारी' : 'General Info'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('location')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'location' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            {language === 'hi' ? 'स्थान व पता' : 'Location & Address'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'academic' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            {language === 'hi' ? 'सत्र एवं समय' : 'Academic & Timing'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 text-sm animate-fade-in">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>
              {language === 'hi' ? 'विद्यालय विवरण सफलतापूर्वक अपडेट हो गया!' : 'School profile updated successfully!'}
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-700">Audit Log Recorded</span>
        </div>
      )}

      {/* Main Form Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {activeTab === 'general' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>{language === 'hi' ? 'संस्थागत पहचान (Institutional Identity)' : 'Institutional Identity'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'विद्यालय का नाम (English)' : 'School Name (English)'} *
                </label>
                <input
                  type="text"
                  value={formData.schoolName ?? ''}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'विद्यालय का नाम (हिंदी)' : 'School Name (Hindi)'} *
                </label>
                <input
                  type="text"
                  value={formData.schoolNameHi ?? ''}
                  onChange={(e) => handleChange('schoolNameHi', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'UDISE कोड' : 'UDISE Code'} *
                </label>
                <input
                  type="text"
                  value={formData.schoolCode ?? ''}
                  onChange={(e) => handleChange('schoolCode', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  required
                />
                <span className="text-[11px] text-slate-500">आधिकारिक यू-डायस कोड: 09290205902</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'विद्यालय का स्तर' : 'School Level / Category'} *
                </label>
                <input
                  type="text"
                  value={formData.schoolLevel ?? ''}
                  onChange={(e) => handleChange('schoolLevel', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="Primary with Upper Primary (Class 1 to 8)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'प्रबंधन विभाग' : 'School Management'}
                </label>
                <input
                  type="text"
                  value={formData.management ?? ''}
                  onChange={(e) => handleChange('management', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="Department of Basic Education, Govt. of Uttar Pradesh"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'विद्यालय का प्रकार' : 'School Type / Gender'}
                </label>
                <input
                  type="text"
                  value={formData.schoolType ?? ''}
                  onChange={(e) => handleChange('schoolType', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="Co-educational (सह-शिक्षा)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'शिक्षा का माध्यम' : 'Medium of Instruction'}
                </label>
                <input
                  type="text"
                  value={formData.medium ?? ''}
                  onChange={(e) => handleChange('medium', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="Hindi (हिंदी माध्यम)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'क्षेत्र प्रकार' : 'Area Type'}
                </label>
                <select
                  value={formData.areaType ?? 'Rural'}
                  onChange={(e) => handleChange('areaType', e.target.value as 'Rural' | 'Urban')}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                >
                  <option value="Rural">Rural (ग्रामीण)</option>
                  <option value="Urban">Urban (शहरी)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              <span>{language === 'hi' ? 'स्थान एवं भौगोलिक विवरण (Geographical Address)' : 'Location & Geographical Address'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'गाँव / ग्राम पंचायत' : 'Village / Gram Panchayat'}
                </label>
                <input
                  type="text"
                  value={formData.village ?? ''}
                  onChange={(e) => handleChange('village', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'डाकघर (Post Office)' : 'Post Office'}
                </label>
                <input
                  type="text"
                  value={formData.post ?? ''}
                  onChange={(e) => handleChange('post', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'पिन कोड (PIN Code)' : 'PIN Code'}
                </label>
                <input
                  type="text"
                  value={formData.pincode ?? ''}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'विकास खंड (Block)' : 'Educational Block'}
                </label>
                <input
                  type="text"
                  value={formData.block ?? ''}
                  onChange={(e) => handleChange('block', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'जनपद (District)' : 'District'}
                </label>
                <input
                  type="text"
                  value={formData.district ?? ''}
                  onChange={(e) => handleChange('district', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'राज्य (State)' : 'State'}
                </label>
                <input
                  type="text"
                  value={formData.state ?? ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>{language === 'hi' ? 'सत्र एवं शैक्षणिक व्यवस्था (Academic Session)' : 'Academic Session & Operations'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'वर्तमान शैक्षणिक सत्र' : 'Current Academic Session'}
                </label>
                <input
                  type="text"
                  value={formData.academicYear ?? ''}
                  onChange={(e) => handleChange('academicYear', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  placeholder="2025-2026"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'दैनिक कालांश (Periods per Day)' : 'Periods per Day'}
                </label>
                <input
                  type="number"
                  min="4"
                  max="10"
                  value={formData.periodsPerDay ?? 8}
                  onChange={(e) => handleChange('periodsPerDay', parseInt(e.target.value) || 8)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'संस्था प्रमुख (Head Teacher Name)' : 'Head Teacher Name'}
                </label>
                <input
                  type="text"
                  value={formData.headTeacherName ?? ''}
                  onChange={(e) => handleChange('headTeacherName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'पदनाम (Designation)' : 'Designation'}
                </label>
                <input
                  type="text"
                  value={formData.headTeacherDesignation ?? ''}
                  onChange={(e) => handleChange('headTeacherDesignation', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Button Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{language === 'hi' ? 'परिवर्तन रद्द करें' : 'Discard Changes'}</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : language === 'hi' ? 'परिवर्तन सहेजें एवं प्रकाशित करें' : 'Save & Publish Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
