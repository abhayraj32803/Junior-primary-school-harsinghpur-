import React, { useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Camera, 
  Upload, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  Info,
  HeartPulse,
  CreditCard
} from 'lucide-react';

export interface Step1Data {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  category: string;
  bloodGroup: string;
  aadhaarNumber: string;
  photoURL: string;
  photoFileName?: string;
}

interface Step1BasicInfoProps {
  data: Step1Data;
  onChange: (updates: Partial<Step1Data>) => void;
  errors: Record<string, string>;
  language: 'hi' | 'en';
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  data,
  onChange,
  errors,
  language
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate age from DOB
  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  const calculatedAge = calculateAge(data.dateOfBirth);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(language === 'hi' ? 'फोटो का आकार 2MB से कम होना चाहिए।' : 'Photo size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onChange({
        photoURL: base64,
        photoFileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    onChange({ photoURL: '', photoFileName: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Step Header Banner */}
      <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            {language === 'hi' ? 'चरण 1: छात्र का प्राथमिक व्यक्तिगत विवरण' : 'Step 1: Student Primary Identity Details'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {language === 'hi'
              ? 'कृपया छात्र का आधिकारिक नाम, जन्मतिथि, संपर्क विवरण एवं पासपोर्ट फोटो दर्ज करें। आपका ईमेल खाता सत्यापन कोड (OTP) प्राप्त करने हेतु अनिवार्य है।'
              : 'Please enter the official name, date of birth, contact details and photograph of the student. Email is required for secure OTP verification.'}
          </p>
        </div>
      </div>

      {/* Photo & Identity Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          {language === 'hi' ? 'छात्र पासपोर्ट फोटो (Student Passport Photo)' : 'Student Passport Photo'}
        </label>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar Preview */}
          <div className="relative group shrink-0">
            <div className="w-28 h-32 rounded-2xl bg-white border-2 border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center shadow-xs">
              {data.photoURL ? (
                <img
                  src={data.photoURL}
                  alt="Student Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-3">
                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                    {language === 'hi' ? 'रंगीन फोटो' : 'Upload Photo'}
                  </span>
                </div>
              )}
            </div>

            {data.photoURL && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-md cursor-pointer transition-transform hover:scale-110"
                title={language === 'hi' ? 'फोटो हटाएं' : 'Remove Photo'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Upload Controls & Guidelines */}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              id="student-photo-input"
            />
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>{data.photoURL ? (language === 'hi' ? 'फोटो बदलें' : 'Change Photo') : (language === 'hi' ? 'फोटो अपलोड करें' : 'Upload Photo')}</span>
              </button>
              
              {data.photoFileName && (
                <span className="text-[11px] font-mono text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 truncate max-w-xs">
                  {data.photoFileName}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {language === 'hi' 
                ? 'स्वीकृत प्रारूप: JPG, PNG, WEBP (अधिकतम आकार: 2 MB)। स्पष्ट व हाल की पासपोर्ट साइज फोटो संलग्न करें।' 
                : 'Accepted formats: JPG, PNG, WEBP (Max 2 MB). Upload a clear, recent passport-sized color photo.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            {language === 'hi' ? 'विद्यार्थी का पूरा आधिकारिक नाम (Full Name)' : 'Student Full Name'}{' '}
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              placeholder={language === 'hi' ? 'उदा. आरव कुमार / Aarav Kumar' : 'e.g. Aarav Kumar'}
              className={`w-full px-4 py-3 min-h-[44px] bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:bg-white focus:outline-hidden ${
                errors.fullName 
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' 
                  : 'border-slate-200 focus:border-amber-500'
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.fullName}</span>
            </p>
          )}
          <span className="text-[11px] text-slate-400 mt-1 block">
            {language === 'hi' ? 'आधार कार्ड या जन्म प्रमाण पत्र के अनुसार पूरा नाम लिखें।' : 'Enter name exactly as printed in Birth Certificate or Aadhaar.'}
          </span>
        </div>

        {/* Email Address (Strictly used for OTP) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-800">
              {language === 'hi' ? 'ईमेल आईडी (Email for Verification)' : 'Email Address'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {language === 'hi' ? 'OTP इस पर भेजा जाएगा' : 'OTP will be sent here'}
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value.toLowerCase().trim() })}
              placeholder="student@example.com"
              className={`w-full pl-10 pr-4 py-3 min-h-[44px] bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:bg-white focus:outline-hidden ${
                errors.email 
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' 
                  : 'border-slate-200 focus:border-amber-500'
              }`}
            />
          </div>
          {errors.email ? (
            <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.email}</span>
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-400">
              {language === 'hi' ? 'सुरक्षा हेतु 6-अंकों का OTP कोड केवल इसी ईमेल पर भेजा जाता है।' : 'Security OTP verification code will be dispatched to this email.'}
            </p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            {language === 'hi' ? 'मोबाइल नंबर (Mobile Number)' : 'Mobile Number'}{' '}
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                onChange({ phone: cleaned });
              }}
              placeholder="9876543210"
              maxLength={10}
              className={`w-full pl-10 pr-4 py-3 min-h-[44px] bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 font-semibold font-mono transition-all focus:bg-white focus:outline-hidden ${
                errors.phone 
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' 
                  : 'border-slate-200 focus:border-amber-500'
              }`}
            />
          </div>
          {errors.phone ? (
            <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.phone}</span>
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-400">
              {language === 'hi' ? '10 अंकों का सक्रिय मोबाइल नंबर दर्ज करें।' : 'Enter 10-digit active mobile number.'}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-800">
              {language === 'hi' ? 'जन्म तिथि (Date of Birth)' : 'Date of Birth'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            {calculatedAge !== null && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {language === 'hi' ? `आयु: ${calculatedAge} वर्ष` : `Age: ${calculatedAge} Yrs`}
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={data.dateOfBirth}
              onChange={(e) => onChange({ dateOfBirth: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full pl-10 pr-4 py-3 min-h-[44px] bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:bg-white focus:outline-hidden ${
                errors.dateOfBirth 
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' 
                  : 'border-slate-200 focus:border-amber-500'
              }`}
            />
          </div>
          {errors.dateOfBirth && (
            <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.dateOfBirth}</span>
            </p>
          )}
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            {language === 'hi' ? 'लिंग (Gender)' : 'Gender'}{' '}
            <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Male', 'Female', 'Other'] as const).map((genderOption) => {
              const isSelected = data.gender === genderOption;
              return (
                <button
                  key={genderOption}
                  type="button"
                  onClick={() => onChange({ gender: genderOption })}
                  className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>
                    {genderOption === 'Male' 
                      ? (language === 'hi' ? 'बालक (Male)' : 'Male')
                      : genderOption === 'Female'
                      ? (language === 'hi' ? 'बालिका (Female)' : 'Female')
                      : (language === 'hi' ? 'अन्य (Other)' : 'Other')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Social Category */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            {language === 'hi' ? 'सामाजिक वर्ग (Category)' : 'Social Category'}{' '}
            <span className="text-rose-500">*</span>
          </label>
          <select
            value={data.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full px-4 py-3 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:bg-white focus:border-amber-500 focus:outline-hidden"
          >
            <option value="General">General (सामान्य)</option>
            <option value="OBC">OBC (अन्य पिछड़ा वर्ग)</option>
            <option value="SC">SC (अनुसूचित जाति)</option>
            <option value="ST">ST (अनुसूचित जनजाति)</option>
            <option value="EWS">EWS (आर्थिक रूप से कमजोर)</option>
          </select>
        </div>

        {/* Blood Group */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            {language === 'hi' ? 'रक्त समूह (Blood Group)' : 'Blood Group'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <HeartPulse className="w-4 h-4 text-rose-500" />
            </div>
            <select
              value={data.bloodGroup}
              onChange={(e) => onChange({ bloodGroup: e.target.value })}
              className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:bg-white focus:border-amber-500 focus:outline-hidden"
            >
              <option value="Unknown">{language === 'hi' ? 'ज्ञात नहीं (Not Known)' : 'Not Known'}</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>

        {/* Aadhaar Number (Optional) */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            {language === 'hi' ? 'विद्यार्थी आधार संख्या (Student Aadhaar Number - Optional)' : 'Student Aadhaar Number (Optional)'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={data.aadhaarNumber}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 12);
                onChange({ aadhaarNumber: cleaned });
              }}
              placeholder="12-digit Aadhaar (xxxx xxxx xxxx)"
              maxLength={12}
              className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold font-mono transition-all focus:bg-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {language === 'hi'
              ? 'RTE अधिनियम के अंतर्गत आधार कार्ड न होने पर भी प्रवेश दिया जाता है। बाद में विद्यालय में जमा किया जा सकता है।'
              : 'Under RTE rules, admission is not denied for lack of Aadhaar; can be provided subsequently.'}
          </p>
        </div>

      </div>
    </div>
  );
};
