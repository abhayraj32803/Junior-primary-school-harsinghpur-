import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { 
  UserCheck, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Upload, 
  Phone, 
  Mail, 
  Award, 
  BookOpen, 
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

export const AdminHeadTeacher: React.FC = () => {
  const { settings, updateSchoolSettingsWithAudit, language } = useSchool();
  const { userProfile } = useAuth();

  const [name, setName] = useState(settings.headTeacherName || 'Smt. Kiran Shakya');
  const [designation, setDesignation] = useState(settings.headTeacherDesignation || 'Head Teacher / Headmaster');
  const [qualification, setQualification] = useState('B.Ed., Post Graduation in Education');
  const [phone, setPhone] = useState(settings.phone || '+91 94123 45678');
  const [email, setEmail] = useState(settings.email || 'headmaster.harsinghpur@upexc.gov.in');
  const [welcomeMessageHi, setWelcomeMessageHi] = useState(
    'कंपोजिट उच्च प्राथमिक विद्यालय हरसिंहपुर गोवा में आपका स्वागत है। हमारा लक्ष्य प्रत्येक बच्चे को गुणवत्तापूर्ण, समावेशी एवं नैतिक शिक्षा प्रदान कर उनके उज्ज्वल भविष्य का निर्माण करना है।'
  );
  const [welcomeMessageEn, setWelcomeMessageEn] = useState(
    'Welcome to Composite JHS Harsinghpur Gova. Our commitment is to deliver quality, value-based, and inclusive foundational education to empower every young learner.'
  );
  const [photoURL, setPhotoURL] = useState<string>(settings.headTeacherVerification?.sourceUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoURL(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSchoolSettingsWithAudit({
        headTeacherName: name,
        headTeacherDesignation: designation,
        phone,
        email
      }, {
        field: 'Head Teacher Profile',
        previousValue: settings.headTeacherName,
        newValue: name,
        source: 'Headmaster Administrative Panel',
        status: 'VERIFIED_CURRENT',
        notes: `Updated Head Teacher profile records by ${userProfile?.name || 'Admin'}`
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {language === 'hi' ? 'प्रधानाध्यापिका प्रबंधन' : 'Head Teacher Management'}
              </span>
              <span className="text-xs font-mono text-slate-500">Official Directorate</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {language === 'hi' ? 'प्रधानाध्यापिका आधिकारिक प्रोफ़ाइल' : 'Head Teacher Official Profile'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'hi'
                ? 'श्रीमती किरण शाक्य (प्रधानाध्यापिका) की सार्वजनिक वेबसाइट प्रोफ़ाइल, संदेश एवं संपर्क प्रबंधित करें।'
                : 'Manage Smt. Kiran Shakya’s official administrative bio, principal desk welcome message, and contact info.'}
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 text-sm animate-fade-in">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>
              {language === 'hi' ? 'प्रधानाध्यापिका विवरण सुरक्षित रूप से सहेज लिया गया!' : 'Head Teacher profile saved successfully!'}
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-700">Audit Log Recorded</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Avatar & Photo Upload */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <div className="w-36 h-36 rounded-3xl overflow-hidden ring-4 ring-purple-100 shadow-lg bg-slate-100 flex items-center justify-center">
                {photoURL ? (
                  <img src={photoURL} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <UserCheck className="w-16 h-16 text-slate-400" />
                )}
              </div>
              <label 
                htmlFor="head-photo-upload" 
                className="absolute bottom-2 right-2 p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer transition-all hover:scale-105"
                title="Change Photo"
              >
                <Upload className="w-4 h-4" />
                <input 
                  type="file" 
                  id="head-photo-upload" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900">{name}</h3>
              <p className="text-xs font-bold text-purple-700">{designation}</p>
              <p className="text-[11px] text-slate-500 mt-1">{qualification}</p>
            </div>

            <div className="w-full pt-4 border-t border-slate-100 space-y-2 text-left text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="font-mono">{phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 truncate">
                <Mail className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="truncate">{email}</span>
              </div>
            </div>
          </div>

          {/* Right Detailed Info */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>{language === 'hi' ? 'आधिकारिक पद एवं क्रेडेंशियल्स' : 'Designation & Official Details'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'प्रधानाध्यापिका का नाम' : 'Head Teacher Name'} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'पदनाम (Designation)' : 'Designation'} *
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'शैक्षणिक योग्यता' : 'Qualifications'}
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'आधिकारिक फोन नंबर' : 'Official Phone'}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'प्रधानाध्यापिका का संदेश (हिंदी में)' : 'Head Teacher’s Desk Welcome Message (Hindi)'}
                </label>
                <textarea
                  rows={3}
                  value={welcomeMessageHi}
                  onChange={(e) => setWelcomeMessageHi(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'प्रधानाध्यापिका का संदेश (English में)' : 'Head Teacher’s Desk Message (English)'}
                </label>
                <textarea
                  rows={3}
                  value={welcomeMessageEn}
                  onChange={(e) => setWelcomeMessageEn(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : language === 'hi' ? 'प्रोफ़ाइल सहेजें एवं लाइव करें' : 'Save & Publish Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
