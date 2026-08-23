import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Plus, 
  Edit3, 
  Save, 
  Calendar, 
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';

export const AdminAdmission: React.FC = () => {
  const { settings, updateSchoolSettingsWithAudit, language } = useSchool();
  const { userProfile } = useAuth();

  const [admissionOpen, setAdmissionOpen] = useState(true);
  const [minAgeClass1, setMinAgeClass1] = useState(6);
  const [session, setSession] = useState(settings.academicYear || '2025-2026');
  const [feeStatus, setFeeStatus] = useState('100% Free Education (RTE Act 2009)');
  const [guidelinesHi, setGuidelinesHi] = useState(
    'शिक्षा का अधिकार अधिनियम (RTE 2009) के अंतर्गत कक्षा 1 से 8 तक सभी बालक-बालिकाओं के लिए प्रवेश पूर्णतः निःशुल्क है। कोई भी प्रवेश परीक्षा या डोनेशन नहीं लिया जाता।'
  );
  const [guidelinesEn, setGuidelinesEn] = useState(
    'Under the Right to Education Act (RTE 2009), admission from Class 1 to 8 is completely free for all children. No entrance test or capitation fee is charged.'
  );

  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSchoolSettingsWithAudit({
        academicYear: session
      }, {
        field: 'Admission Criteria & Guidelines',
        previousValue: 'Previous Guidelines',
        newValue: 'Updated Guidelines',
        source: 'Headmaster Administrative Panel',
        status: 'VERIFIED_CURRENT',
        notes: `Updated admission guidelines and document checklists by ${userProfile?.name || 'Admin'}`
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {language === 'hi' ? 'प्रवेश प्रबंधन' : 'Admission Governance'}
              </span>
              <span className="text-xs font-mono text-slate-500">RTE Compliance</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {language === 'hi' ? 'प्रवेश प्रक्रिया, नियम व दस्तावेज़ प्रबंधन' : 'Admission Guidelines & Document Rules'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'hi'
                ? 'कक्षा 1 से 8 तक के नवीन प्रवेश नियम, आवश्यक प्रमाण-पत्र एवं आरटीई 2009 पात्रता प्रबंधित करें।'
                : 'Configure Class 1-8 eligibility criteria, 3-tier required document lists, and admission cycles.'}
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Admission guidelines and document requirements updated successfully!</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Controls */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            <span>{language === 'hi' ? 'सत्र एवं प्रवेश स्थिति' : 'Admission Cycle & Status'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'प्रवेश सत्र (Academic Session)' : 'Academic Session'}
              </label>
              <input
                type="text"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'कक्षा 1 हेतु न्यूनतम आयु (वर्ष)' : 'Class 1 Minimum Age (Years)'}
              </label>
              <input
                type="number"
                min="5"
                max="7"
                value={minAgeClass1}
                onChange={(e) => setMinAgeClass1(parseInt(e.target.value) || 6)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'शुल्क व्यवस्था' : 'Fee Structure'}
              </label>
              <input
                type="text"
                value={feeStatus}
                onChange={(e) => setFeeStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'प्रवेश निर्देश एवं नियम (हिंदी)' : 'Admission Guidelines & Rules (Hindi)'}
              </label>
              <textarea
                rows={3}
                value={guidelinesHi}
                onChange={(e) => setGuidelinesHi(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'Admission Guidelines (English)' : 'Admission Guidelines (English)'}
              </label>
              <textarea
                rows={3}
                value={guidelinesEn}
                onChange={(e) => setGuidelinesEn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Standard Required Documents Overview */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <span>{language === 'hi' ? 'आवश्यक प्रमाण-पत्र श्रेणियां' : 'Required Document Categories'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>1. सामान्यतः आवश्यक (Generally Required)</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>छात्र का जन्म प्रमाण पत्र / स्व-घोषणा</li>
                <li>छात्र का आधार कार्ड (यदि उपलब्ध हो)</li>
                <li>अभिभावक (माता/पिता) का आधार कार्ड</li>
                <li>पासपोर्ट साइज फोटो (3 प्रतियां)</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>2. आवश्यकतानुसार (Applicable Only)</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>स्थानांतरण प्रमाण पत्र (TC - कक्षा 2-8 हेतु)</li>
                <li>पूर्व कक्षा की अंकतालिका / रिपोर्ट कार्ड</li>
                <li>जाति प्रमाण पत्र (SC/ST/OBC हेतु)</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>3. योजना लाभ हेतु (Scheme Specific)</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>अभिभावक का बैंक खाता पासबुक (DBT यूनिफॉर्म/जूते-मोजे)</li>
                <li>आय प्रमाण पत्र (छात्रवृत्ति हेतु)</li>
                <li>दिव्यांगता प्रमाण पत्र (CWSN लाभ हेतु)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : language === 'hi' ? 'प्रवेश नियम सहेजें' : 'Save Admission Rules'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
