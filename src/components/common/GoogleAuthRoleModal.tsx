import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  BookOpen,
  Lock,
  Sparkles,
  ShieldCheck,
  User,
  Calendar,
  Phone,
  Home,
  FileText,
  BadgeInfo
} from 'lucide-react';
import { Modal } from './Modal';
import { GoogleAuthDetails } from '../../context/AuthContext';

interface GoogleAuthRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: GoogleAuthDetails) => Promise<void>;
  isLoading?: boolean;
  language?: 'hi' | 'en';
}

export const GoogleAuthRoleModal: React.FC<GoogleAuthRoleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  language = 'hi'
}) => {
  // Student Profile Fields
  const [fullName, setFullName] = useState<string>('');
  const [fatherName, setFatherName] = useState<string>('');
  const [motherName, setMotherName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('2015-05-15');
  const [classNumber, setClassNumber] = useState<number>(5);
  const [sectionName, setSectionName] = useState<string>('A');
  const [rollNumber, setRollNumber] = useState<string>('1');
  const [admissionNumber, setAdmissionNumber] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [category, setCategory] = useState<string>('OBC');
  const [address, setAddress] = useState<string>('ग्राम हरसिंहपुर गोवा, शमसाबाद, फर्रुखाबाद');

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError(language === 'hi' ? 'कृपया विद्यार्थी का पूरा नाम (Full Name) दर्ज करें।' : "Please enter student's full name.");
      return;
    }

    if (!fatherName.trim()) {
      setFormError(language === 'hi' ? 'कृपया पिता / अभिभावक का नाम दर्ज करें।' : "Please enter father's name.");
      return;
    }

    if (!dateOfBirth) {
      setFormError(language === 'hi' ? 'कृपया जन्म तिथि दर्ज करें।' : 'Please enter date of birth.');
      return;
    }

    const details: GoogleAuthDetails = {
      fullName: fullName.trim(),
      name: fullName.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim() || undefined,
      guardianName: fatherName.trim(),
      dateOfBirth,
      dob: dateOfBirth,
      classNumber: Number(classNumber),
      sectionName,
      rollNumber: rollNumber.trim() || '1',
      admissionNumber: admissionNumber.trim() || undefined,
      phone: phone.trim() || undefined,
      mobile: phone.trim() || undefined,
      gender,
      category,
      address: address.trim() || undefined
    };

    await onConfirm(details);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'hi' ? 'Google छात्र पंजीकरण एवं प्रोफाइल निर्माण' : 'Student Google Registration & Profile Setup'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 p-3.5 rounded-2xl flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0 mt-0.5">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-black text-amber-950 flex items-center gap-1.5 flex-wrap">
              <span>{language === 'hi' ? 'Google के साथ छात्र प्रोफाइल का स्वतः निर्माण' : 'Instant Student Profile Creation with Google'}</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 text-[10px] font-bold">
                {language === 'hi' ? 'एक बार विवरण भरें' : 'Fill Details Once'}
              </span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
              {language === 'hi'
                ? 'यह विवरण एक बार सहेजे जाने के बाद आपके आईडी कार्ड, छात्र प्रोफाइल, गृहकार्य एवं उपस्थिति में स्थायी रूप से सुरक्षित हो जाएगा। बार-बार विवरण दर्ज करने की आवश्यकता नहीं होगी।'
                : 'These details will permanently configure your ID card, attendance, homework, and academic profile. You will not need to enter them again.'}
            </p>
          </div>
        </div>

        {/* Section 1: Student Identity */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 border-b border-slate-200/80 pb-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>{language === 'hi' ? '1. विद्यार्थी का नाम एवं व्यक्तिगत विवरण' : '1. Student Personal Details'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Student Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'विद्यार्थी का पूरा नाम (Student Official Full Name) *' : 'Student Full Name *'}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={language === 'hi' ? 'उदा. रोहन वर्मा / Rohan Verma' : 'e.g. Rohan Verma'}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden"
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'जन्म तिथि (Date of Birth) *' : 'Date of Birth *'}
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'लिंग (Gender) *' : 'Gender *'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden"
              >
                <option value="Male">{language === 'hi' ? 'बालक (Male / Boy)' : 'Male'}</option>
                <option value="Female">{language === 'hi' ? 'बालिका (Female / Girl)' : 'Female'}</option>
                <option value="Other">{language === 'hi' ? 'अन्य (Other)' : 'Other'}</option>
              </select>
            </div>

            {/* Social Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'सामाजिक श्रेणी (Category)' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden"
              >
                <option value="OBC">OBC (अन्य पिछड़ा वर्ग)</option>
                <option value="SC">SC (अनुसूचित जाति)</option>
                <option value="ST">ST (अनुसूचित जनजाति)</option>
                <option value="General">General (सामान्य)</option>
                <option value="EWS">EWS (आर्थिक रूप से कमजोर)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Parents & Contact */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 border-b border-slate-200/80 pb-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>{language === 'hi' ? '2. माता-पिता एवं संपर्क विवरण' : '2. Parents & Contact Details'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Father's Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {language === 'hi' ? "पिता का नाम (Father's Name) *" : "Father's Name *"}
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="e.g. Shri Ramakant Shakya"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden"
                required
              />
            </div>

            {/* Mother's Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {language === 'hi' ? "माता का नाम (Mother's Name)" : "Mother's Name"}
              </label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="e.g. Smt. Sunita Devi"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Phone / Mobile */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'मोबाइल नंबर (Mobile / Phone)' : 'Mobile Number'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Academic Details */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 border-b border-slate-200/80 pb-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>{language === 'hi' ? '3. कक्षा, वर्ग एवं विद्यालय विवरण' : '3. Class, Section & Roll Number'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Class */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'कक्षा (Class) *' : 'Class *'}
              </label>
              <select
                value={classNumber}
                onChange={(e) => setClassNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden"
                required
              >
                <option value={1}>Class 1 (कक्षा 1)</option>
                <option value={2}>Class 2 (कक्षा 2)</option>
                <option value={3}>Class 3 (कक्षा 3)</option>
                <option value={4}>Class 4 (कक्षा 4)</option>
                <option value={5}>Class 5 (कक्षा 5)</option>
                <option value={6}>Class 6 (कक्षा 6)</option>
                <option value={7}>Class 7 (कक्षा 7)</option>
                <option value={8}>Class 8 (कक्षा 8)</option>
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'वर्ग (Section) *' : 'Section *'}
              </label>
              <select
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden"
                required
              >
                <option value="A">Section A (वर्ग 'अ')</option>
                <option value="B">Section B (वर्ग 'ब')</option>
                <option value="C">Section C (वर्ग 'स')</option>
              </select>
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'रोल नंबर (Roll No.) *' : 'Roll Number *'}
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 12"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden font-mono"
                required
              />
            </div>

            {/* Admission / SR No. */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'दाखिला सं. (SR No.)' : 'Admission / SR No.'}
              </label>
              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                placeholder="e.g. ADM-2026-045"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {language === 'hi' ? 'ग्राम / स्थायी पता (Village / Address)' : 'Permanent Address'}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Gram Harsinghpur Gova, Post Shamsabad, Farrukhabad"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Security Info */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0 text-slate-700" />
          <span className="font-semibold">
            {language === 'hi'
              ? 'यह विवरण सुरक्षित रूप से सहेजा जाता है और केवल विद्यालय प्रशासन एवं छात्र द्वारा देखा जा सकता है।'
              : 'Your student records are encrypted and accessible only by authorized school administration and the student.'}
          </span>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            {language === 'hi' ? 'रद्द करें' : 'Cancel'}
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>
              {language === 'hi' 
                ? 'Google से जारी रखें एवं प्रोफाइल बनाएं'
                : 'Continue with Google & Create Profile'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </Modal>
  );
};
