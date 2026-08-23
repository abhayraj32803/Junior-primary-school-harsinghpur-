import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, language } = useSchool();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    studentClass: 'Class 1',
    queryType: 'Admission Inquiry (प्रवेश संबंधी)',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 sm:space-y-12 overflow-x-hidden">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'hi' ? 'संपर्क एवं मार्गदर्शन सहायता केंद्र' : 'Official Helpdesk & Location'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {language === 'hi' ? 'विद्यालय संपर्क सूत्र एवं कार्यालय' : 'School Contact & Helpdesk'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {language === 'hi'
            ? 'नवीन नामांकन, छात्रवृत्ति, मध्याह्न भोजन या अन्य किसी भी शासकीय जानकारी हेतु विद्यालय कार्यालय से संपर्क करें।'
            : 'Get in touch for new admissions, welfare schemes, academic certificates, or school management committee interactions.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info & Visiting Hours */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl border border-slate-800">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white">
                {language === 'hi' ? 'कार्यालय प्रधानाध्यापक' : 'Office of the Head Teacher'}
              </h3>
              <p className="text-xs text-amber-400 font-mono mt-0.5">UDISE: {settings.schoolCode}</p>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">
                    {language === 'hi' ? 'आधिकारिक विद्यालय पता' : 'Campus Address'}
                  </div>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? `ग्राम: ${settings.villageHi || 'हरसिंहपुर गोवा'}, डाकघर: ${settings.postOfficeHi || settings.postHi || 'हरसिंहपुर गोवा'}, विकास खंड: ${settings.blockHi || 'शमसाबाद'}, जनपद: ${settings.districtHi || 'फर्रुखाबाद'}, उत्तर प्रदेश`
                      : `Village: ${settings.village || 'Harsinghpur Gova'}, Post: ${settings.postOffice || settings.post || 'Harsinghpur Gova'}, Block: ${settings.block || 'Shamsabad'}, District: ${settings.district || 'Farrukhabad'}, Uttar Pradesh`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">
                    {language === 'hi' ? 'पिन कोड (PIN Code)' : 'Postal PIN Code'}
                  </div>
                  <p className="text-amber-300 font-bold mt-0.5">
                    {settings.pinCode || 'सत्यापन अपेक्षित (Verification Required)'}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {language === 'hi' ? 'विभिन्न पूर्व रिकॉर्ड्स के कारण डाक विभाग से अंतिम मिलान प्रक्रियाधीन' : 'Verification underway to prevent mismatched PIN codes'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">
                    {language === 'hi' ? 'विद्यालय कार्य समय' : 'School Office Timings'}
                  </div>
                  <p className="text-slate-300 mt-0.5">
                    {language === 'hi' 
                      ? 'सोमवार से शनिवार: 08:30 AM से 03:00 PM (रविवार एवं राजपत्रित अवकाश बंद)' 
                      : 'Monday to Saturday: 08:30 AM to 03:00 PM (Sunday Closed)'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? 'शिक्षा का अधिकार (RTE 2009) सहायता केंद्र' : 'Right to Education (RTE) Helpdesk Active'}</span>
            </div>
          </div>
        </div>

        {/* Query Submission Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              {language === 'hi' ? 'अभिभावक एवं समुदाय सहायता प्रपत्र' : 'Parent & Community Inquiry Form'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {language === 'hi' 
                ? 'नामांकन, निःशुल्क पाठ्यपुस्तकों, या छात्रवृत्ति संबंधी पूछताछ सीधे विद्यालय प्रशासन को प्रेषित करें।' 
                : 'Submit inquiries regarding admission, scholarship, textbooks, or SMC matters.'}
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-950 text-base">
                  {language === 'hi' ? 'संदेश सफलतापूर्वक प्राप्त हुआ!' : 'Inquiry Submitted Successfully!'}
                </h4>
                <p className="text-xs text-emerald-800">
                  {language === 'hi' 
                    ? 'आपका अनुरोध विद्यालय कार्यालय में दर्ज हो चुका है। कार्यदिवस में संबंधित अधिकारी द्वारा समीक्षा की जाएगी।' 
                    : 'Your inquiry has been recorded and will be reviewed during office hours.'}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                >
                  {language === 'hi' ? 'दूसरा संदेश भेजें' : 'Send Another Inquiry'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      {language === 'hi' ? 'अभिभावक / आवेदक का नाम *' : 'Your Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'hi' ? 'उदा. राजेश कुमार' : 'e.g. Rajesh Kumar'}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      {language === 'hi' ? 'मोबाइल नंबर *' : 'Contact Mobile *'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit Mobile"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      {language === 'hi' ? 'संबंधित कक्षा' : 'Related Class'}
                    </label>
                    <select
                      value={form.studentClass}
                      onChange={(e) => setForm({ ...form, studentClass: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={`Class ${num}`}>
                          {language === 'hi' ? `कक्षा ${num} (Class ${num})` : `Class ${num}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      {language === 'hi' ? 'पूछताछ का प्रकार' : 'Inquiry Category'}
                    </label>
                    <select
                      value={form.queryType}
                      onChange={(e) => setForm({ ...form, queryType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      <option value="Admission Query">{language === 'hi' ? 'नवीन प्रवेश (New Admission)' : 'Admission Inquiry'}</option>
                      <option value="Textbooks & Uniform">{language === 'hi' ? 'पाठ्यपुस्तक व यूनिफॉर्म डीबीटी' : 'Textbooks & DBT Uniform'}</option>
                      <option value="Mid-Day Meal">{language === 'hi' ? 'मध्याह्न भोजन (MDM)' : 'Mid-Day Meal Feedback'}</option>
                      <option value="TC / Marksheet">{language === 'hi' ? 'टीसी / अंकपत्र (TC / Records)' : 'Transfer Certificate / Records'}</option>
                      <option value="Other">{language === 'hi' ? 'अन्य सामान्य जानकारी' : 'Other Inquiries'}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    {language === 'hi' ? 'आपका संदेश / प्रश्न *' : 'Your Inquiry Message *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={language === 'hi' ? 'कृपया अपना प्रश्न विस्तार से लिखें...' : 'Please describe your inquiry or feedback...'}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'hi' ? 'संदेश प्रेषित करें' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
