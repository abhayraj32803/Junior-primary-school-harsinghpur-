import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Trophy, 
  Sparkles, 
  Users, 
  Calendar, 
  Award, 
  Music, 
  Palette, 
  Medal, 
  Heart, 
  Trees, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight,
  Target,
  Smile,
  ShieldCheck,
  Zap,
  Flame,
  Globe
} from 'lucide-react';

interface ActivitiesPageProps {
  onNavigate?: (page: string) => void;
}

export const ActivitiesPage: React.FC<ActivitiesPageProps> = ({ onNavigate }) => {
  const { settings, language, gallery } = useSchool();
  const [activeTab, setActiveTab] = useState<'all' | 'sports' | 'cultural' | 'competitions' | 'educational'>('all');

  const activityCategories = [
    { id: 'all', labelEn: 'All Activities', labelHi: 'सभी गतिविधियां', icon: Sparkles },
    { id: 'sports', labelEn: 'Sports & Games', labelHi: 'खेलकूद एवं योग', icon: Trophy },
    { id: 'cultural', labelEn: 'Cultural Programs', labelHi: 'सांस्कृतिक कार्यक्रम', icon: Music },
    { id: 'competitions', labelEn: 'Competitions & Contests', labelHi: 'प्रतियोगिताएं व पुरस्कार', icon: Award },
    { id: 'educational', labelEn: 'Educational Initiatives', labelHi: 'शैक्षणिक व सह-पाठ्यचर्या', icon: BookOpen }
  ];

  const activitiesList = [
    {
      id: 'act-1',
      category: 'sports',
      titleHi: 'वार्षिक खेलकूद प्रतियोगिता एवं दैनिक योग',
      titleEn: 'Annual Sports Meet & Daily Morning Yoga',
      descHi: 'दौड़ (100m, 200m, 400m), कबड्डी, खो-खो, बैडमिंटन एवं वॉलीबॉल प्रतियोगिताएं। प्रातःकालीन प्रार्थना सभा में नियमित योग एवं सूर्य नमस्कार अभ्यास।',
      descEn: 'Track events (100m, 200m), Kabaddi, Kho-Kho, badminton, and daily morning assembly yoga & Surya Namaskar sessions.',
      frequencyHi: 'दैनिक एवं वार्षिक',
      frequencyEn: 'Daily & Annual',
      badgeHi: 'शारीरिक विकास',
      badgeEn: 'Physical Fitness',
      icon: Trophy,
      color: 'amber'
    },
    {
      id: 'act-2',
      category: 'cultural',
      titleHi: 'साप्ताहिक बाल सभा एवं राष्ट्रीय पर्व',
      titleEn: 'Weekly Bal Sabha & National Festivals',
      descHi: 'प्रत्येक शनिवार बाल सभा का आयोजन जिसमें बच्चे कविता पाठ, समूह गान, नाटक व प्रेरक प्रसंग प्रस्तुत करते हैं। 15 अगस्त, 26 जनवरी, 2 अक्टूबर व शिक्षक दिवस पर भव्य आयोजन।',
      descEn: 'Weekly Saturday Bal Sabha featuring poetry recitation, group songs, patriotic plays, and grand celebrations on Independence Day, Republic Day & Gandhi Jayanti.',
      frequencyHi: 'प्रत्येक शनिवार व पर्व',
      frequencyEn: 'Every Saturday & Festivals',
      badgeHi: 'कला व संस्कृति',
      badgeEn: 'Arts & Culture',
      icon: Music,
      color: 'purple'
    },
    {
      id: 'act-3',
      category: 'competitions',
      titleHi: 'चित्रकला, निबंध एवं सामान्य ज्ञान प्रतियोगिता',
      titleEn: 'Drawing, Essay & General Knowledge Contests',
      descHi: 'सड़क सुरक्षा, पर्यावरण संरक्षण, बेटी बचाओ-बेटी पढ़ाओ एवं विज्ञान विषयों पर अंतर-कक्षीय चित्रकला, सुलेख, वाद-विवाद एवं सामान्य ज्ञान क्विज का आयोजन।',
      descEn: 'Inter-class drawing, handwriting, debate, and GK quiz competitions on road safety, environmental conservation, and social themes.',
      frequencyHi: 'मासिक',
      frequencyEn: 'Monthly',
      badgeHi: 'प्रतिभा सम्मान',
      badgeEn: 'Talent Recognition',
      icon: Palette,
      color: 'blue'
    },
    {
      id: 'act-4',
      category: 'educational',
      titleHi: 'बाल संसद (Bal Sansad) एवं छात्र नेतृत्व',
      titleEn: 'Bal Sansad (Child Cabinet) & Student Leadership',
      descHi: 'लोकतांत्रिक मूल्यों के विकास हेतु बाल संसद का गठन। प्रधानमंत्री, शिक्षा मंत्री, स्वास्थ्य मंत्री, खेल मंत्री व जल मंत्री के रूप में छात्र विद्यालयी व्यवस्थाओं में सक्रिय भागीदारी निभाते हैं।',
      descEn: 'Democratic Child Cabinet where elected student ministers (Prime Minister, Education, Health, Sports, Water Minister) manage daily school leadership.',
      frequencyHi: 'सत्र पर्यन्त',
      frequencyEn: 'Year-Round',
      badgeHi: 'नेतृत्व क्षमता',
      badgeEn: 'Leadership',
      icon: Users,
      color: 'emerald'
    },
    {
      id: 'act-5',
      category: 'educational',
      titleHi: 'मीना मंच (Meena Manch) एवं बालिका सशक्तिकरण',
      titleEn: 'Meena Manch & Girl Child Empowerment',
      descHi: 'बालिकाओं में आत्मविश्वास, स्वच्छता जागरूकता, आत्मरक्षा एवं नियमित उपस्थिति को बढ़ावा देने हेतु मीना मंच के अंतर्गत प्रेरक सत्र व कहानियां।',
      descEn: 'Empowerment platform for girl students fostering leadership, menstrual hygiene awareness, self-defense skills, and regular attendance.',
      frequencyHi: 'साप्ताहिक',
      frequencyEn: 'Weekly',
      badgeHi: 'बालिका सशक्तिकरण',
      badgeEn: 'Girl Empowerment',
      icon: Heart,
      color: 'rose'
    },
    {
      id: 'act-6',
      category: 'educational',
      titleHi: 'विज्ञान प्रदर्शनी, टीएलएम मेला व पर्यावरण क्लब',
      titleEn: 'Science Exhibition, TLM Fair & Eco-Club',
      descHi: 'छात्रों द्वारा स्वनिर्मित विज्ञान मॉडल, गणितीय खेल, वेस्ट-टू-बेस्ट क्राफ्ट एवं विद्यालय परिसर में वृक्षारोपण व "एक पेड़ मां के नाम" अभियान।',
      descEn: 'Student-made science models, math learning kits, waste-to-wealth craft fairs, and campus plantation drives under the Eco-Club.',
      frequencyHi: 'त्रैमासिक',
      frequencyEn: 'Quarterly',
      badgeHi: 'प्रकृति व विज्ञान',
      badgeEn: 'Science & Ecology',
      icon: Trees,
      color: 'teal'
    }
  ];

  const filteredActivities = activeTab === 'all' 
    ? activitiesList 
    : activitiesList.filter(a => a.category === activeTab);

  const sportsPhotos = gallery.filter(g => 
    g.category?.toLowerCase().includes('sport') || 
    g.category?.toLowerCase().includes('activit') ||
    g.titleEn?.toLowerCase().includes('sports') ||
    g.titleEn?.toLowerCase().includes('yoga')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gov-amber-100 text-gov-amber-900 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gov-amber-700" />
            <span>{language === 'hi' ? 'सह-पाठ्यचर्या एवं समग्र विकास' : 'Co-Curricular & Holistic Development'}</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {language === 'hi' ? 'छात्र गतिविधियां एवं खेलकूद' : 'Student Activities & Sports'}
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {language === 'hi'
              ? `${settings.schoolNameHi} में हम केवल किताबी ज्ञान ही नहीं, बल्कि खेलकूद, सांस्कृतिक कार्यक्रमों, बाल संसद, मीना मंच एवं रचनात्मक प्रतियोगिताओं के माध्यम से बच्चों का सर्वांगीण विकास सुनिश्चित करते हैं।`
              : `At ${settings.schoolName}, education goes beyond textbooks. We nurture complete personality growth through sports, cultural events, Bal Sansad leadership, Meena Manch, and creative arts.`}
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {activityCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer border ${
                isActive
                  ? 'bg-gov-navy-950 text-gov-amber-300 border-gov-navy-950 shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-gov-amber-400' : 'text-slate-500'}`} />
              <span>{language === 'hi' ? cat.labelHi : cat.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-gov-amber-400 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-gov-amber-500/10 text-gov-amber-700 flex items-center justify-center font-bold">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {language === 'hi' ? act.badgeHi : act.badgeEn}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {language === 'hi' ? act.titleHi : act.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                    {language === 'hi' ? act.descHi : act.descEn}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gov-amber-600" />
                  <span>{language === 'hi' ? `आवृत्ति: ${act.frequencyHi}` : `Frequency: ${act.frequencyEn}`}</span>
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'hi' ? 'सक्रिय' : 'Active'}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Special Highlights: Bal Sansad & Four House System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bal Sansad Structure */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                {language === 'hi' ? 'बाल संसद (Student Council Portfolio)' : 'Bal Sansad Portfolio Structure'}
              </h3>
              <p className="text-xs text-slate-500">{language === 'hi' ? 'छात्रों द्वारा संचालित विद्यालयी मंत्रिमंडल' : 'Student-led campus governance'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900">{language === 'hi' ? 'प्रधानमंत्री' : 'Prime Minister'}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{language === 'hi' ? 'समग्र विद्यालय अनुशासन व समन्वय' : 'Overall coordination & discipline'}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900">{language === 'hi' ? 'शिक्षा मंत्री' : 'Education Minister'}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{language === 'hi' ? 'पुस्तकालय व शिक्षण सामग्री प्रबंधन' : 'Library & learning material'}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900">{language === 'hi' ? 'स्वास्थ्य व पोषण मंत्री' : 'Health & MDM Minister'}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{language === 'hi' ? 'स्वच्छता, हाथ धुलाई व भोजन व्यवस्था' : 'Cleanliness, handwash & MDM'}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900">{language === 'hi' ? 'जल व पर्यावरण मंत्री' : 'Water & Eco Minister'}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{language === 'hi' ? 'नल से जल, बागवानी व ऊर्जा बचत' : 'Tap water, garden & electricity'}</div>
            </div>
          </div>
        </div>

        {/* Four House System */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                {language === 'hi' ? 'सदन व्यवस्था (Four School Houses)' : 'Four House System'}
              </h3>
              <p className="text-xs text-slate-500">{language === 'hi' ? 'स्वस्थ प्रतिस्पर्धा एवं सहकारिता' : 'Healthy team spirit & sportsmanship'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950">
              <div className="font-black flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>{language === 'hi' ? 'टैगोर सदन (Red)' : 'Tagore House'}</span>
              </div>
              <div className="text-[11px] text-rose-800 mt-1">{language === 'hi' ? 'साहित्य, सृजन व कला' : 'Literature & Creative Arts'}</div>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950">
              <div className="font-black flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>{language === 'hi' ? 'कलाम सदन (Blue)' : 'Kalam House'}</span>
              </div>
              <div className="text-[11px] text-blue-800 mt-1">{language === 'hi' ? 'विज्ञान, नवाचार व जिज्ञासा' : 'Science & Innovation'}</div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
              <div className="font-black flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>{language === 'hi' ? 'विवेकानंद सदन (Yellow)' : 'Vivekananda House'}</span>
              </div>
              <div className="text-[11px] text-amber-800 mt-1">{language === 'hi' ? 'चरित्र निर्माण, योग व खेल' : 'Character, Yoga & Sports'}</div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
              <div className="font-black flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>{language === 'hi' ? 'गांधी सदन (Green)' : 'Gandhi House'}</span>
              </div>
              <div className="text-[11px] text-emerald-800 mt-1">{language === 'hi' ? 'सत्य, स्वच्छता व समाज सेवा' : 'Truth, Cleanliness & Service'}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Action Footer Bar */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-lg font-black">
            {language === 'hi' ? 'विद्यालय गतिविधियों की फोटो गैलरी देखें' : 'Explore Event Photo Gallery'}
          </h4>
          <p className="text-xs text-slate-400">
            {language === 'hi' ? 'खेलकूद, उत्सव, योग एवं राष्ट्रीय पर्वों की वास्तविक तस्वीरें देखें।' : 'Browse actual campus pictures of celebrations, games, and competitions.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('gallery')}
              className="px-6 py-3 rounded-xl bg-gov-amber-500 hover:bg-gov-amber-400 text-gov-navy-950 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-md"
            >
              {language === 'hi' ? 'फोटो गैलरी खोलें' : 'Open Photo Gallery'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
