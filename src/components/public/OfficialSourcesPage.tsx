import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Globe, 
  ExternalLink, 
  Building, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Info, 
  Landmark,
  Compass
} from 'lucide-react';

export const OfficialSourcesPage: React.FC = () => {
  const { language, officialSources } = useSchool();

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full mb-3 border border-amber-200">
                <Landmark className="w-3.5 h-3.5" />
                {language === 'hi' ? 'आधिकारिक स्रोत एवं संदर्भ' : 'Official Sources & Reference Portals'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {language === 'hi' 
                  ? 'शासकीय विभाग एवं आधिकारिक पोर्टल डायरेक्टरी' 
                  : 'Government Portals & Official Source Directory'}
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                {language === 'hi'
                  ? 'इस पोर्टल पर उपलब्ध सूचनाओं के आधिकारिक संदर्भ स्रोत एवं संबंधित शासकीय विभागों के लिंक।'
                  : 'Official government sources and reference links for all school public records.'}
              </p>
            </div>
            <div>
              <StatusBadge status="VERIFIED_CURRENT" language={language} size="md" />
            </div>
          </div>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {officialSources.map((source) => (
            <div key={source.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl">
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {source.department}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {language === 'hi' ? source.nameHi : source.nameEn}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {language === 'hi' ? source.purposeHi : source.purposeEn}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div>
                    <span className="font-bold text-slate-700">
                      {language === 'hi' ? 'प्रदत्त जानकारी: ' : 'Information Provided: '}
                    </span>
                    <span>{language === 'hi' ? source.informationProvidedHi : source.informationProvidedEn}</span>
                  </div>
                  {source.officeAddress && (
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{source.officeAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {language === 'hi' ? 'सत्यापन तिथि: ' : 'Verified: '}{source.lastChecked}
                </span>
                <a
                  href={source.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                >
                  <span>{language === 'hi' ? 'पोर्टल पर जाएं' : 'Visit Official Portal'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Informational Guidance Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-blue-950 flex items-start gap-4">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-blue-900">
              {language === 'hi' ? 'आधिकारिक स्रोत सत्यापन नीति' : 'Official Source Verification Policy'}
            </h4>
            <p className="text-xs text-blue-800 mt-1 leading-relaxed">
              {language === 'hi'
                ? 'यह पोर्टल भारत सरकार के शिक्षा मंत्रालय (UDISE+), उत्तर प्रदेश बेसिक शिक्षा परिषद, प्रेरणा मिशन तथा जल जीवन मिशन के सार्वजनिक रूप से उपलब्ध आधिकारिक रिकॉर्ड के आधार पर संकलित किया गया है। किसी भी आधिकारिक प्रमाण पत्र या विधिक कार्य हेतु संबंधित विभाग के पोर्टल का संदर्भ लें।'
                : 'This portal references publicly available official records from the Ministry of Education (UDISE+), UP Basic Shiksha Parishad, Mission Prerna, and Jal Jeevan Mission. For legal or administrative procedures, refer to the parent departmental portals.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
