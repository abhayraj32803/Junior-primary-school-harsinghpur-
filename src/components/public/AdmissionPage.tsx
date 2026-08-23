import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { StatusBadge } from '../common/StatusBadge';
import { 
  GraduationCap, 
  CheckCircle2, 
  FileText, 
  Download, 
  Calendar, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Clock,
  PhoneCall,
  MapPin,
  FileCheck2,
  Users,
  AlertCircle
} from 'lucide-react';

export const AdmissionPage: React.FC = () => {
  const { language, settings } = useSchool();

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full mb-3 border border-emerald-200">
                <GraduationCap className="w-3.5 h-3.5" />
                {language === 'hi' ? 'नि:शुल्क एवं अनिवार्य बाल शिक्षा' : 'Free & Compulsory Elementary Admission'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {language === 'hi' 
                  ? 'प्रवेश प्रक्रिया एवं नियम (सत्र 2025–2026)' 
                  : 'Admission Process & Guidelines (Session 2025–2026)'}
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                {language === 'hi'
                  ? 'शिक्षा का अधिकार अधिनियम (RTE Act 2009) के अंतर्गत कक्षा 1 से 8 तक शत-प्रतिशत नि:शुल्क प्रवेश व्यवस्था।'
                  : '100% free admission in Classes 1 to 8 under the Right of Children to Free and Compulsory Education (RTE) Act.'}
              </p>
            </div>
            <div>
              <StatusBadge status="VERIFIED_CURRENT" language={language} size="md" />
            </div>
          </div>
        </div>

        {/* Key Highlights Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {language === 'hi' ? '₹0 प्रवेश शुल्क (शत-प्रतिशत नि:शुल्क)' : '₹0 Admission Fee (100% Free)'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'किसी भी प्रकार का कोई प्रवेश शुल्क, शिक्षण शुल्क या परीक्षा शुल्क नहीं लिया जाता।'
                  : 'No admission fee, tuition fee, examination fee, or development charge is levied.'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {language === 'hi' ? 'नि:शुल्क किताबें, यूनिफॉर्म व भोजन' : 'Free Books, Uniform & Meals'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'सभी पाठ्यपुस्तकें नि:शुल्क, पीएम पोषण गर्म भोजन एवं ₹1,200 डीबीटी सहायता उपलब्ध।'
                  : 'Free SCERT textbooks, daily hot PM POSHAN mid-day meals, and ₹1,200 DBT assistance.'}
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 bg-amber-600 text-white rounded-xl shadow-xs shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {language === 'hi' ? 'आयु अनुरूप कक्षा में प्रवेश' : 'Age-Appropriate Admission'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'कक्षा 1 में न्यूनतम आयु 6 वर्ष पूर्ण होने पर सीधे प्रवेश प्रदान किया जाता है।'
                  : 'Direct admission based on age criteria (Minimum 6 years completed for Class 1).'}
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Procedure & Required Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Step by Step Process */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-600" />
              {language === 'hi' ? 'प्रवेश प्राप्त करने की सरल चरणबद्ध प्रक्रिया' : 'Step-by-Step Admission Process'}
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {language === 'hi' ? 'विद्यालय प्रांगण में उपस्थिति' : 'Visit the School Premises'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? 'अभिभावक/माता-पिता बच्चे के साथ कार्यदिवसों में प्रातः 9:00 बजे से दोपहर 1:00 बजे के मध्य विद्यालय कार्यालय में संपर्क करें।'
                      : 'Parents/guardians visit the school office with the child during working hours (9:00 AM – 1:00 PM).'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {language === 'hi' ? 'प्रवेश प्रपत्र (Admission Form) भरना' : 'Fill Admission Form'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? 'विद्यालय से नि:शुल्क प्रवेश प्रपत्र प्राप्त करें अथवा पोर्टल से डाउनलोड कर आवश्यक विवरण अंकित करें।'
                      : 'Obtain the free admission proforma from the school office or download it from this portal.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {language === 'hi' ? 'दस्तावेजों का मिलान एवं प्रेरणा पोर्टल प्रविष्टि' : 'Document Verification & Prerna Portal Entry'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? 'प्रधानाध्यापिका द्वारा दस्तावेजों का सत्यापन कर प्रेरणा पोर्टल पर छात्र का ऑनलाइन पंजीकरण किया जाता है।'
                      : 'School administration verifies details and registers the child on the UP State Prerna Portal.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {language === 'hi' ? 'तत्काल नि:शुल्क पाठ्यपुस्तकें व कक्षा आवंटन' : 'Class Assignment & Free Books Distribution'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? 'प्रवेश पुष्टि के साथ ही छात्र को संबंधित कक्षा, रोल नंबर तथा पाठ्यपुस्तकें प्रदान की जाती हैं।'
                      : 'Upon admission confirmation, the student receives class roll number, textbooks, and daily MDM meal entitlement.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-blue-600" />
              {language === 'hi' ? 'आवश्यक दस्तावेजों की सूची (Checklist)' : 'Required Documents Checklist'}
            </h2>

            <ul className="space-y-3.5">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {language === 'hi' ? '1. जन्म प्रमाण पत्र (Birth Certificate) या आयु घोषणा' : '1. Birth Certificate or Age Declaration'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {language === 'hi' 
                      ? 'ग्राम पंचायत/नगर निकाय से निर्गत जन्म प्रमाण पत्र अथवा अभिभावक द्वारा स्वप्रमाणित आयु घोषणा पत्र।'
                      : 'Gram Panchayat/Municipal Birth Certificate or parental age self-declaration.'}
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {language === 'hi' ? '2. विद्यार्थी का आधार कार्ड (Student Aadhaar)' : '2. Student Aadhaar Card'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {language === 'hi' 
                      ? 'यदि उपलब्ध हो (आधार न होने पर भी प्रवेश नहीं रोका जाता, बाद में बनवाया जा सकता है)।'
                      : 'If available (Admission is never denied for lack of Aadhaar; can be added subsequently).'}
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {language === 'hi' ? '3. माता/पिता का आधार कार्ड (Parents Aadhaar)' : '3. Parents / Guardian Aadhaar Card'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {language === 'hi' 
                      ? 'प्रेरणा पोर्टल एवं ₹1,200 डीबीटी योजना सत्यापन हेतु अनिवार्य।'
                      : 'Required for Prerna Portal verification and DBT ₹1,200 benefit transfer.'}
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {language === 'hi' ? '4. बैंक पासबुक की छायाप्रति (Bank Passbook Copy)' : '4. Bank Account Passbook Copy'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {language === 'hi' 
                      ? 'माता/पिता का आधार-सीडेड बैंक खाता विवरण।'
                      : 'Aadhaar-seeded bank account of mother/father for DBT transfer.'}
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {language === 'hi' ? '5. पासपोर्ट साइज फोटोग्राफ (2 Photos)' : '5. Passport Size Photographs (2 Photos)'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {language === 'hi' ? 'छात्र की 2 नवीनतम रंगीन फोटो।' : 'Two recent passport-size photos of the student.'}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact / Help Section */}
        <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">
              {language === 'hi' ? 'प्रवेश संबंधी सहायता हेतु विद्यालय से संपर्क करें' : 'Contact School for Admission Enquiries'}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              {language === 'hi'
                ? `कंपोजिट उच्च प्राथमिक विद्यालय हरसिंहपुर गोवा, विकास खंड शमसाबाद, जनपद फर्रुखाबाद। प्रधानाध्यापिका: ${settings.headTeacherName}`
                : `Composite JHS Harsinghpur Gova, Block Shamsabad, District Farrukhabad. Head Teacher: ${settings.headTeacherName}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="http://basiceducation.up.gov.in/" 
              target="_blank" 
              rel="noreferrer"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {language === 'hi' ? 'विभागीय पोर्टल' : 'Department Portal'}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
