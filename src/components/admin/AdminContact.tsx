import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Globe, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Navigation
} from 'lucide-react';
import { SchoolSettings } from '../../types';

export const AdminContact: React.FC = () => {
  const { settings, updateSchoolSettingsWithAudit, language } = useSchool();
  const { userProfile } = useAuth();

  const [phone, setPhone] = useState(settings.phone || '+91 94123 45678');
  const [email, setEmail] = useState(settings.email || 'headmaster.harsinghpur@upexc.gov.in');
  const [village, setVillage] = useState(settings.village || 'Harsinghpur Gova');
  const [post, setPost] = useState(settings.post || 'Shamsabad');
  const [block, setBlock] = useState(settings.block || 'Shamsabad');
  const [district, setDistrict] = useState(settings.district || 'Farrukhabad');
  const [state, setState] = useState(settings.state || 'Uttar Pradesh');
  const [pincode, setPincode] = useState(settings.pincode || '209503');
  const [summerTiming, setSummerTiming] = useState('08:00 AM – 02:00 PM (1 April to 30 Sept)');
  const [winterTiming, setWinterTiming] = useState('09:00 AM – 03:00 PM (1 Oct to 31 March)');
  const [mapLink, setMapLink] = useState('https://maps.google.com/?q=Composite+JHS+Harsinghpur+Gova+Farrukhabad');

  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSchoolSettingsWithAudit({
        phone,
        email,
        village,
        post,
        block,
        district,
        state,
        pincode
      }, {
        field: 'Public Contact & Location Coordinates',
        previousValue: settings.phone,
        newValue: phone,
        source: 'Headmaster Administrative Panel',
        status: 'VERIFIED_CURRENT',
        notes: `Updated institutional contact details and timings by ${userProfile?.name || 'Admin'}`
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
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {language === 'hi' ? 'संपर्क एवं लोकेशन' : 'Contact & Location Management'}
              </span>
              <span className="text-xs font-mono text-slate-500">PIN: {settings.pincode}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {language === 'hi' ? 'आधिकारिक संपर्क एवं विद्यालय समय प्रबंधन' : 'Contact Details, Address & School Timings'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'hi'
                ? 'हेल्पलाइन नंबर, आधिकारिक ईमेल, ग्रीष्मकालीन/शीतकालीन विद्यालय समय एवं गूगल मैप लोकेशन प्रबंधित करें।'
                : 'Update public hotline numbers, official emails, seasonal timings, and geographic coordinates.'}
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Contact information and timings successfully updated!</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact Numbers & Emails */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-500" />
            <span>{language === 'hi' ? 'दूरभाष एवं ईमेल' : 'Helpline & Official Email'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'आधिकारिक हेल्पलाइन / फोन नंबर' : 'Official Phone / Helpline'} *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'आधिकारिक ईमेल (Email Address)' : 'Official Email Address'} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>
          </div>
        </div>

        {/* Timings */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span>{language === 'hi' ? 'विद्यालय संचालन समय (School Operating Hours)' : 'School Operating Hours'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'ग्रीष्मकालीन समय (Summer Timing)' : 'Summer Operating Hours'}
              </label>
              <input
                type="text"
                value={summerTiming}
                onChange={(e) => setSummerTiming(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'शीतकालीन समय (Winter Timing)' : 'Winter Operating Hours'}
              </label>
              <input
                type="text"
                value={winterTiming}
                onChange={(e) => setWinterTiming(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Location & Map Link */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-500" />
            <span>{language === 'hi' ? 'गूगल मैप लिंक एवं नेविगेशन' : 'Google Map Link & Location'}</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {language === 'hi' ? 'Google Maps नेविगेशन URL' : 'Google Maps URL'}
            </label>
            <input
              type="text"
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : language === 'hi' ? 'संपर्क विवरण सहेजें' : 'Save Contact Details'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
