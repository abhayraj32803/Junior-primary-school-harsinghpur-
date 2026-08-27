import React from 'react';
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  Phone, 
  MapPin, 
  AlertCircle, 
  Home, 
  ShieldAlert,
  Navigation
} from 'lucide-react';

export interface Step2Data {
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  guardianName: string;
  guardianPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
  village: string;
  postOffice: string;
  block: string;
  district: string;
  pincode: string;
  distanceFromSchoolKm: string;
}

interface Step2ParentsInfoProps {
  data: Step2Data;
  onChange: (updates: Partial<Step2Data>) => void;
  errors: Record<string, string>;
  language: 'hi' | 'en';
}

export const Step2ParentsInfo: React.FC<Step2ParentsInfoProps> = ({
  data,
  onChange,
  errors,
  language
}) => {
  return (
    <div className="space-y-6">
      {/* Step Header Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            {language === 'hi' ? 'चरण 2: माता-पिता एवं अभिभावक विवरण' : 'Step 2: Parent & Guardian Details'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {language === 'hi'
              ? 'कृपया माता-पिता का नाम, व्यवसाय, पारिवारिक संपर्क तथा स्थाई निवास का पूरा पता दर्ज करें।'
              : 'Please enter parents names, occupations, residential address and emergency contact details.'}
          </p>
        </div>
      </div>

      {/* Parents Identity Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-600" />
          <span>{language === 'hi' ? 'माता-पिता का विवरण (Parents Information)' : 'Parents Information'}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* Father's Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'पिता का पूरा नाम (Father\'s Name)' : 'Father\'s Full Name'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.fatherName}
              onChange={(e) => onChange({ fatherName: e.target.value })}
              placeholder={language === 'hi' ? 'श्री राम प्रसाद / Shri Ram Prasad' : 'e.g. Ram Prasad'}
              className={`w-full px-4 py-3 min-h-[44px] bg-white border rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden ${
                errors.fatherName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.fatherName && (
              <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.fatherName}</span>
              </p>
            )}
          </div>

          {/* Father's Occupation */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'पिता का व्यवसाय (Father\'s Occupation)' : 'Father\'s Occupation'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={data.fatherOccupation}
                onChange={(e) => onChange({ fatherOccupation: e.target.value })}
                placeholder={language === 'hi' ? 'कृषि / व्यापार / नौकरी / अन्य' : 'Farmer / Business / Service'}
                className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Mother's Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'माता का पूरा नाम (Mother\'s Name)' : 'Mother\'s Full Name'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.motherName}
              onChange={(e) => onChange({ motherName: e.target.value })}
              placeholder={language === 'hi' ? 'श्रीमती सुनीता देवी / Smt. Sunita Devi' : 'e.g. Sunita Devi'}
              className={`w-full px-4 py-3 min-h-[44px] bg-white border rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden ${
                errors.motherName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.motherName && (
              <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.motherName}</span>
              </p>
            )}
          </div>

          {/* Mother's Occupation */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'माता का व्यवसाय (Mother\'s Occupation)' : 'Mother\'s Occupation'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={data.motherOccupation}
                onChange={(e) => onChange({ motherOccupation: e.target.value })}
                placeholder={language === 'hi' ? 'गृहिणी / स्वरोजगार / अन्य' : 'Homemaker / Self-employed'}
                className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Guardian Name (if applicable) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'अभिभावक का नाम (Guardian Name - यदि अलग हो)' : 'Guardian Name (If different)'}
            </label>
            <input
              type="text"
              value={data.guardianName}
              onChange={(e) => onChange({ guardianName: e.target.value })}
              placeholder={language === 'hi' ? 'अभिभावक का नाम (वैकल्पिक)' : 'Guardian Name (Optional)'}
              className="w-full px-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Guardian Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'अभिभावक मोबाइल नंबर (Guardian Mobile)' : 'Guardian Mobile Number'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={data.guardianPhone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                  onChange({ guardianPhone: cleaned });
                }}
                placeholder="9876543210"
                maxLength={10}
                className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold font-mono transition-all focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Emergency Contact & Safety */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>{language === 'hi' ? 'आपातकालीन संपर्क विवरण (Emergency Contact)' : 'Emergency Contact'}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'आपातकालीन संपर्क व्यक्ति का नाम' : 'Emergency Contact Person'}
            </label>
            <input
              type="text"
              value={data.emergencyContactName}
              onChange={(e) => onChange({ emergencyContactName: e.target.value })}
              placeholder={language === 'hi' ? 'रिश्तेदार / पड़ोसी का नाम' : 'Relative / Neighbor Name'}
              className="w-full px-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'आपातकालीन फोन नंबर (Emergency Phone)' : 'Emergency Phone Number'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4 text-rose-500" />
              </div>
              <input
                type="tel"
                value={data.emergencyContactPhone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                  onChange({ emergencyContactPhone: cleaned });
                }}
                placeholder="Emergency Contact 10-digit"
                maxLength={10}
                className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold font-mono transition-all focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Residential Address Details */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>{language === 'hi' ? 'स्थानीय निवास पता (Residential Address)' : 'Residential Address'}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'पूर्ण पता / मकान / मोहल्ला (Full Street Address)' : 'Street Address'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder={language === 'hi' ? 'ग्राम हरसिंहपुर गोवा, निकट पंचायत भवन' : 'e.g. Village Harsinghpur Gova, Near Panchayat'}
              className={`w-full px-4 py-3 min-h-[44px] bg-white border rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden ${
                errors.address ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.address}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'गाँव / शहर (Village / Town)' : 'Village / Town'}
            </label>
            <input
              type="text"
              value={data.village}
              onChange={(e) => onChange({ village: e.target.value })}
              placeholder="हरसिंहपुर गोवा / Harsinghpur Gova"
              className="w-full px-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'डाकघर (Post Office)' : 'Post Office'}
            </label>
            <input
              type="text"
              value={data.postOffice}
              onChange={(e) => onChange({ postOffice: e.target.value })}
              placeholder="शमसाबाद / Shamsabad"
              className="w-full px-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'विकास खंड (Block)' : 'Block / Tehsil'}
            </label>
            <input
              type="text"
              value={data.block}
              onChange={(e) => onChange({ block: e.target.value })}
              placeholder="शमसाबाद / Shamsabad"
              className="w-full px-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'जनपद (District)' : 'District'}
            </label>
            <input
              type="text"
              value={data.district}
              onChange={(e) => onChange({ district: e.target.value })}
              placeholder="Farrukhabad"
              className="w-full px-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'पिन कोड (Pincode)' : 'Pincode'}
            </label>
            <input
              type="text"
              value={data.pincode}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
                onChange({ pincode: cleaned });
              }}
              placeholder="209503"
              maxLength={6}
              className="w-full px-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold font-mono transition-all focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'hi' ? 'विद्यालय से दूरी (Distance in KM)' : 'Distance from School (KM)'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Navigation className="w-4 h-4 text-indigo-500" />
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={data.distanceFromSchoolKm}
                onChange={(e) => onChange({ distanceFromSchoolKm: e.target.value })}
                placeholder="0.5"
                className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold transition-all focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
