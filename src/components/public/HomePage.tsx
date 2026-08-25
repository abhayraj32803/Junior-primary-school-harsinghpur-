import React, { useEffect, useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { recordPrivatePageView } from '../../utils/visitorAnalytics';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Bell, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ChevronRight, 
  ArrowRight, 
  Building2, 
  Laptop, 
  Trophy, 
  Droplets, 
  Utensils, 
  Image as ImageIcon, 
  Sparkles, 
  ExternalLink,
  School
} from 'lucide-react';
import { 
  getFacilityIconComponent, 
  DEFAULT_HOMEPAGE_FACILITIES 
} from '../../utils/facilityIconUtils';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOpenPortal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { 
    settings, 
    students, 
    teachers, 
    notices, 
    gallery, 
    language 
  } = useSchool();

  useEffect(() => {
    recordPrivatePageView('home');
  }, []);

  // 1. Hero Carousel / Banner Image
  const carouselImages = (settings.heroBannerCarouselImages && settings.heroBannerCarouselImages.length > 0)
    ? settings.heroBannerCarouselImages
    : [
        settings.heroBannerImage || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=2000&q=80"
      ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % carouselImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // 2. Latest 4 Notices
  const latestNotices = notices
    .filter(n => n.status === 'active' && n.isPublic)
    .slice(0, 4);

  // 3. Exactly 6 Core Facilities (Dynamically configured from Settings or Default)
  const sixFacilities = settings.homepageFacilities && settings.homepageFacilities.length === 6
    ? settings.homepageFacilities
    : DEFAULT_HOMEPAGE_FACILITIES;

  // 4. Curated 4 Activities & Gallery Images for Combined Section
  const combinedActivities = [
    {
      titleHi: 'खेलकूद एवं दैनिक योगाभ्यास',
      titleEn: 'Sports & Daily Yoga',
      descHi: 'दौड़, कबड्डी, खो-खो, वॉलीबॉल एवं दैनिक प्रार्थना सभा में नियमित योग।',
      descEn: 'Athletics, track events, volleyball, and daily morning prayer yoga sessions.',
      icon: Trophy
    },
    {
      titleHi: 'सांस्कृतिक कार्यक्रम व बाल सभा',
      titleEn: 'Cultural Events & Bal Sabha',
      descHi: 'साप्ताहिक शनिवार बाल सभा, देशभक्ति नाटक, समूह गान एवं राष्ट्रीय पर्व उत्सव।',
      descEn: 'Weekly Saturday assembly, patriotic drama, choir, and national festival celebrations.',
      icon: Sparkles
    },
    {
      titleHi: 'रचनात्मक प्रतियोगिताएं',
      titleEn: 'Creative Competitions',
      descHi: 'सुलेख, चित्रकला, निबंध, सामान्य ज्ञान व विज्ञान क्विज प्रतियोगिताएं।',
      descEn: 'Calligraphy, painting, essay writing, and foundational science & GK quizzes.',
      icon: BookOpen
    },
    {
      titleHi: 'बाल संसद व मीना मंच',
      titleEn: 'Bal Sansad & Meena Manch',
      descHi: 'विद्यार्थी नेतृत्व, बालिका सशक्तिकरण, पर्यावरण क्लब व स्वच्छता अभियान।',
      descEn: 'Student council governance, girl empowerment Meena Manch, and eco-drives.',
      icon: Users
    }
  ];

  // Photos for gallery display
  const previewPhotos = (gallery && gallery.length > 0)
    ? gallery.slice(0, 4)
    : [
        { id: '1', title: 'प्रार्थना सभा व योगाभ्यास', imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80', category: 'Activities' },
        { id: '2', title: 'स्मार्ट क्लास में शिक्षण', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80', category: 'Classroom' },
        { id: '3', title: 'वार्षिक खेलकूद प्रतियोगिता', imageUrl: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&w=800&q=80', category: 'Sports' },
        { id: '4', title: 'पौष्टिक मध्याह्न भोजन वितरण', imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80', category: 'Campus' }
      ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* =========================================================================
          1. HERO SECTION (Vibrant, Colorful School Banner)
          ========================================================================= */}
      <section className="relative bg-gov-navy-950 text-white overflow-hidden rounded-b-3xl sm:rounded-b-4xl border-b-4 border-gov-amber-500 shadow-xl">
        {/* Subtle Decorative Gradient Aura / Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gov-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Background Image Carousel with soft darkening */}
        <div className="absolute inset-0 z-0">
          {carouselImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlideIndex ? 'opacity-40 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <img
                src={img}
                alt="School Campus"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-gov-navy-950 via-gov-navy-950/80 to-gov-navy-950/45" />
          <div className="absolute inset-0 bg-radial from-transparent via-gov-navy-950/40 to-gov-navy-950/90" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="max-w-3xl space-y-6">
            
            {/* Department Tag with Glowing Saffron Border */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-gov-amber-500/25 to-orange-500/25 border border-gov-amber-400/50 text-gov-amber-300 text-xs sm:text-sm font-bold backdrop-blur-md shadow-sm">
              <School className="w-4 h-4 text-gov-amber-400" />
              <span>{language === 'hi' ? 'बेसिक शिक्षा परिषद, उत्तर प्रदेश' : 'Basic Education Dept, Uttar Pradesh'}</span>
            </div>

            {/* School Name */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
                {language === 'hi' ? (settings.schoolNameHi || settings.schoolName) : settings.schoolName}
              </h1>
              <p className="text-sm sm:text-base text-gov-amber-200 font-semibold flex items-center gap-1.5 drop-shadow-sm">
                <MapPin className="w-4 h-4 text-gov-amber-400 shrink-0" />
                <span>
                  {language === 'hi' 
                    ? `ग्राम: ${settings.villageHi || settings.village || 'हरसिंहपुर गोवा'}, ब्लॉक: ${settings.blockHi || settings.block || 'शमसाबाद'}, जनपद: ${settings.districtHi || settings.district || 'फर्रुखाबाद'}`
                    : `Village: ${settings.village || 'Harsinghpur Gova'}, Block: ${settings.block || 'Shamsabad'}, District: ${settings.district || 'Farrukhabad'}`}
                </span>
              </p>
            </div>

            {/* Short Welcome Message */}
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal max-w-2xl text-shadow-sm">
              {language === 'hi'
                ? 'हमारे शासकीय परिषदीय विद्यालय में आपका स्वागत है। यहां कक्षा 1 से 8 तक के सभी बच्चों को 100% निःशुल्क, सुरक्षित, समावेशी और गुणवत्तापूर्ण शिक्षा प्रदान की जाती है।'
                : 'Welcome to our official Government Composite School. Providing 100% free, high-quality, and inclusive education for Classes 1 to 8 under the Right to Education Act.'}
            </p>

            {/* 2 Vibrant Action Buttons: "About School" & "Admission" */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => onNavigate('about')}
                className="px-6 sm:px-7 py-3.5 rounded-xl bg-white hover:bg-gov-amber-50 text-gov-navy-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-black/20 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95 border border-white/80"
                id="btn-hero-about"
              >
                <span>{language === 'hi' ? 'स्कूल के बारे में (About School)' : 'About School'}</span>
                <ArrowRight className="w-4 h-4 text-gov-navy-950" />
              </button>

              <button
                onClick={() => onNavigate('admission')}
                className="px-6 sm:px-7 py-3.5 rounded-xl bg-gradient-to-r from-gov-amber-500 via-amber-400 to-gov-amber-500 hover:from-amber-400 hover:to-amber-300 text-gov-navy-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-gov-amber-500/30 hover:shadow-gov-amber-500/50 transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95"
                id="btn-hero-admission"
              >
                <GraduationCap className="w-4 h-4 text-gov-navy-950" />
                <span>{language === 'hi' ? 'नि:शुल्क प्रवेश (Admission)' : 'Free Admission'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Tricolor Ribbon Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-500 opacity-90" />
      </section>

      {/* =========================================================================
          2. SCHOOL INFORMATION (4 Colorful & Vibrant Stat Cards)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Classes 1-8 (Warm Amber / Saffron) */}
          <div className="bg-gradient-to-br from-white via-amber-50/40 to-orange-50/30 rounded-2xl p-5 sm:p-6 border-2 border-amber-200/80 shadow-sm hover:border-amber-400 hover:shadow-md card-hover-glow transition-all flex items-start gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                {language === 'hi' ? 'कक्षाएं' : 'Classes'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                कक्षा 1 – 8
              </div>
              <div className="text-xs text-amber-700 font-semibold mt-0.5">
                {language === 'hi' ? 'प्राथमिक व उच्च प्राथमिक' : 'Primary & Upper Primary'}
              </div>
            </div>
          </div>

          {/* Card 2: Total Students (Ocean Blue / Sky) */}
          <div className="bg-gradient-to-br from-white via-blue-50/40 to-sky-50/30 rounded-2xl p-5 sm:p-6 border-2 border-blue-200/80 shadow-sm hover:border-blue-400 hover:shadow-md card-hover-glow transition-all flex items-start gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                {language === 'hi' ? 'कुल विद्यार्थी' : 'Total Students'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {students.length > 0 ? `${students.length}+ नामांकित` : '100% Free RTE'}
              </div>
              <div className="text-xs text-blue-700 font-semibold mt-0.5">
                {language === 'hi' ? 'निःशुल्क सर्व शिक्षा' : 'Zero Fee Education'}
              </div>
            </div>
          </div>

          {/* Card 3: Teachers (Emerald Green / Teal) */}
          <div className="bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 rounded-2xl p-5 sm:p-6 border-2 border-emerald-200/80 shadow-sm hover:border-emerald-400 hover:shadow-md card-hover-glow transition-all flex items-start gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {language === 'hi' ? 'शिक्षक' : 'Teachers'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {teachers.length > 0 ? `${teachers.length} शिक्षक` : 'योग्य शिक्षक'}
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                {language === 'hi' ? 'प्रशिक्षित व समर्पित' : 'Govt Certified Faculty'}
              </div>
            </div>
          </div>

          {/* Card 4: UDISE Code (Royal Purple / Violet) */}
          <div className="bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/30 rounded-2xl p-5 sm:p-6 border-2 border-purple-200/80 shadow-sm hover:border-purple-400 hover:shadow-md card-hover-glow transition-all flex items-start gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                {language === 'hi' ? 'यू-डायस कोड' : 'UDISE Code'}
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-slate-900 mt-0.5">
                {settings.schoolCode || '09290205902'}
              </div>
              <div className="text-xs text-purple-700 font-semibold mt-0.5">
                {language === 'hi' ? 'राष्ट्रीय पोर्टल मान्य' : 'UDISE+ Verified'}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. ABOUT OUR SCHOOL (Rich & Attractive Warm Theme)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-white via-slate-50 to-amber-50/30 rounded-3xl p-6 sm:p-9 border-2 border-amber-200/70 shadow-sm relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="max-w-4xl space-y-4 relative z-10">
            
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider">
              <School className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'hi' ? 'विद्यालय परिचय' : 'About Our School'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {language === 'hi' 
                ? `${settings.schoolNameHi || settings.schoolName} का परिचय`
                : `About ${settings.schoolName}`}
            </h2>

            {/* Clean 3-4 lines description */}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {language === 'hi'
                ? `${settings.schoolNameHi || settings.schoolName} बेसिक शिक्षा परिषद उत्तर प्रदेश के अंतर्गत संचालित एक मान्यता प्राप्त परिषदीय विद्यालय है। विद्यालय में कक्षा 1 से 8 तक के ग्रामीण छात्र-छात्राओं को निपुण भारत मिशन, सुसज्जित कक्षा-कक्ष, समृद्ध पुस्तकालय, खेलकूद एवं निःशुल्क मध्याह्न भोजन के साथ संस्कारयुक्त व गुणवत्तापूर्ण शिक्षा प्रदान की जाती है।`
                : `${settings.schoolName} is an officially recognized Government Composite School under the Basic Education Department of Uttar Pradesh. Serving Classes 1 to 8, the school is dedicated to providing inclusive learning, modern smart classrooms, a curated library, active sports facilities, and nutritious mid-day meals.`}
            </p>

            {/* Read More button with Glowing Accent */}
            <div className="pt-2">
              <button
                onClick={() => onNavigate('about')}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                id="btn-about-readmore"
              >
                <span>{language === 'hi' ? 'विस्तृत परिचय पढ़ें (Read More)' : 'Read More About School'}</span>
                <ArrowRight className="w-4 h-4 text-gov-amber-400" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          4. IMPORTANT NOTICES (Latest 4 Notices with Colorful Category Badges)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {language === 'hi' ? 'महत्वपूर्ण सूचनाएं' : 'Important Notices'}
            </h2>
          </div>

          <button
            onClick={() => onNavigate('notices')}
            className="text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-50"
          >
            <span>{language === 'hi' ? 'सभी सूचनाएं देखें' : 'View All Notices'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestNotices.length > 0 ? (
            latestNotices.map((notice, nIdx) => {
              const noticeColorSchemes = [
                { badge: 'bg-amber-100 text-amber-900 border-amber-200', border: 'hover:border-amber-400', leftBar: 'border-l-4 border-l-amber-500' },
                { badge: 'bg-blue-100 text-blue-900 border-blue-200', border: 'hover:border-blue-400', leftBar: 'border-l-4 border-l-blue-500' },
                { badge: 'bg-emerald-100 text-emerald-900 border-emerald-200', border: 'hover:border-emerald-400', leftBar: 'border-l-4 border-l-emerald-500' },
                { badge: 'bg-purple-100 text-purple-900 border-purple-200', border: 'hover:border-purple-400', leftBar: 'border-l-4 border-l-purple-500' }
              ];
              const scheme = noticeColorSchemes[nIdx % noticeColorSchemes.length];

              return (
                <div
                  key={notice.id}
                  onClick={() => onNavigate('notices')}
                  className={`bg-white rounded-2xl p-5 border border-slate-200 ${scheme.leftBar} ${scheme.border} shadow-xs hover:shadow-md card-hover-glow transition-all cursor-pointer flex flex-col justify-between group`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${scheme.badge}`}>
                        {notice.category || 'NOTICE'}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{notice.publishDate || notice.date || 'नवीनतम'}</span>
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                      {language === 'hi' ? (notice.titleHi || notice.title) : notice.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                      {language === 'hi' ? (notice.descriptionHi || notice.description) : notice.description}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-500 text-xs">
              {language === 'hi' ? 'वर्तमान में कोई नई सूचना उपलब्ध नहीं है।' : 'No new notices at this time.'}
            </div>
          )}
        </div>

      </section>

      {/* =========================================================================
          5. OUR FACILITIES (6 Colorful & Attractive Cards)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {language === 'hi' ? 'विद्यालय की सुविधाएं' : 'Our Facilities'}
            </h2>
          </div>

          <button
            onClick={() => onNavigate('facilities')}
            className="text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-50"
          >
            <span>{language === 'hi' ? 'विस्तार से देखें' : 'View Details'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Cards Grid with Distinct Colorful Palettes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {sixFacilities.map((fac, idx) => {
            const Icon = typeof fac.icon === 'string' ? getFacilityIconComponent(fac.icon) : (fac.icon || Building2);
            
            const facilityThemes = [
              {
                bg: 'bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20',
                border: 'border-2 border-amber-200/80 hover:border-amber-400',
                iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-amber-500/25',
                tag: 'text-amber-800'
              },
              {
                bg: 'bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20',
                border: 'border-2 border-blue-200/80 hover:border-blue-400',
                iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/25',
                tag: 'text-blue-800'
              },
              {
                bg: 'bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/20',
                border: 'border-2 border-teal-200/80 hover:border-teal-400',
                iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-teal-500/25',
                tag: 'text-teal-800'
              },
              {
                bg: 'bg-gradient-to-br from-white via-emerald-50/30 to-green-50/20',
                border: 'border-2 border-emerald-200/80 hover:border-emerald-400',
                iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-500/25',
                tag: 'text-emerald-800'
              },
              {
                bg: 'bg-gradient-to-br from-white via-sky-50/30 to-blue-50/20',
                border: 'border-2 border-sky-200/80 hover:border-sky-400',
                iconBg: 'bg-gradient-to-br from-sky-500 to-blue-500 text-white shadow-sky-500/25',
                tag: 'text-sky-800'
              },
              {
                bg: 'bg-gradient-to-br from-white via-rose-50/30 to-orange-50/20',
                border: 'border-2 border-rose-200/80 hover:border-rose-400',
                iconBg: 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-rose-500/25',
                tag: 'text-rose-800'
              }
            ];

            const theme = facilityThemes[idx % facilityThemes.length];

            return (
              <div
                key={fac.id}
                className={`${theme.bg} ${theme.border} rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md card-hover-glow transition-all space-y-3 relative overflow-hidden group`}
              >
                <div className={`w-11 h-11 rounded-2xl ${theme.iconBg} flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {language === 'hi' ? fac.nameHi : fac.nameEn}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">
                    {language === 'hi' ? fac.descHi : fac.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* =========================================================================
          6. ACTIVITIES & GALLERY (Rich & Colorful Combined Section)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="bg-gradient-to-br from-white via-slate-50 to-purple-50/20 rounded-3xl p-6 sm:p-9 border-2 border-purple-200/60 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-300 text-purple-900 text-xs font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <span>{language === 'hi' ? 'गतिविधियां एवं फोटो गैलरी' : 'Activities & Gallery'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {language === 'hi' ? 'छात्र गतिविधियां एवं विद्यालय झलकियां' : 'School Activities & Campus Glimpses'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('activities')}
                className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-950 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                {language === 'hi' ? 'सभी गतिविधियां' : 'All Activities'}
              </button>
              <button
                onClick={() => onNavigate('gallery')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                {language === 'hi' ? 'पूरी फोटो गैलरी' : 'Full Gallery'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            
            {/* Left Side: 4 Core Activities with Colorful Icon Badges */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'hi' ? 'प्रमुख छात्र गतिविधियां' : 'Core Activities'}
              </div>
              <div className="space-y-2.5">
                {combinedActivities.map((act, i) => {
                  const Icon = act.icon;
                  const actColors = [
                    'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-amber-500/20',
                    'bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-purple-500/20',
                    'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-blue-500/20',
                    'bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-emerald-500/20'
                  ];

                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xs card-hover-glow transition-all flex items-start gap-3.5"
                    >
                      <div className={`w-9 h-9 rounded-xl ${actColors[i % actColors.length]} flex items-center justify-center shrink-0 mt-0.5 shadow-md`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          {language === 'hi' ? act.titleHi : act.titleEn}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 font-normal">
                          {language === 'hi' ? act.descHi : act.descEn}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: 4 Gallery Photo Cards with Zoom & Glow */}
            <div className="lg:col-span-7 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'hi' ? 'परिसर एवं कार्यक्रम फोटो' : 'Campus Photos'}
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                {previewPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => onNavigate('gallery')}
                    className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 border-2 border-slate-200 hover:border-purple-400 cursor-pointer shadow-xs hover:shadow-md card-hover-glow transition-all"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title || 'School Photo'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <p className="text-[11px] sm:text-xs font-bold line-clamp-1 drop-shadow-sm">
                        {photo.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================================================
          7. CONTACT & LOCATION (Address, Phone, Email, Google Map, Timings, Links)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/20 rounded-3xl p-6 sm:p-9 border-2 border-blue-200/60 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-500/15 to-sky-500/15 border border-blue-300 text-blue-900 text-xs font-black uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5 text-blue-700" />
              <span>{language === 'hi' ? 'संपर्क एवं लोकेशन' : 'Contact & Location'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {language === 'hi' ? 'विद्यालय से संपर्क करें एवं पता' : 'Get in Touch with School'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            
            {/* Left Column: Address, Phone, Email, Timings */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Address (Warm Amber Tone) */}
                <div className="p-4 rounded-2xl bg-white border-2 border-amber-200/80 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-gov-navy-950">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span>{language === 'hi' ? 'विद्यालय का पता' : 'School Address'}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {language === 'hi'
                      ? (settings.addressHi || `${settings.schoolNameHi || settings.schoolName}, ग्राम व पोस्ट: ${settings.villageHi || 'हरसिंहपुर गोवा'}, विकास खंड: ${settings.blockHi || 'शमसाबाद'}, जनपद: ${settings.districtHi || 'फर्रुखाबाद'}, उत्तर प्रदेश - 209503`)
                      : (settings.address || `${settings.schoolName}, Village & Post: ${settings.village || 'Harsinghpur Gova'}, Block: ${settings.block || 'Shamsabad'}, District: ${settings.district || 'Farrukhabad'}, UP - 209503`)}
                  </p>
                </div>

                {/* Phone & Email (Emerald & Sky Tones) */}
                <div className="p-4 rounded-2xl bg-white border-2 border-emerald-200/80 space-y-2.5 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gov-navy-950">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <span>{language === 'hi' ? 'फोन / हेल्पलाइन' : 'Phone / Helpline'}</span>
                    </div>
                    <p className="text-xs text-slate-800 font-mono font-bold mt-1">
                      {settings.phone || '+91 9450000000'}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-gov-navy-950">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <span>{language === 'hi' ? 'ईमेल' : 'Email'}</span>
                    </div>
                    <p className="text-xs text-slate-800 font-mono mt-1 truncate">
                      {settings.email || 'ups.harsinghpur@gmail.com'}
                    </p>
                  </div>
                </div>

              </div>

              {/* School Timings */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 flex items-start gap-3 shadow-xs">
                <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900">
                    {language === 'hi' ? 'विद्यालय समय सारणी (School Timings):' : 'School Timings:'}
                  </span>
                  <div className="text-slate-700 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      <strong>{language === 'hi' ? 'ग्रीष्मकालीन:' : 'Summer:'}</strong> {settings.summerTiming || '08:00 AM से 02:00 PM'}
                    </span>
                    <span>
                      <strong>{language === 'hi' ? 'शीतकालीन:' : 'Winter:'}</strong> {settings.winterTiming || '09:00 AM से 03:00 PM'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Official Links */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-600 mb-2">
                  {language === 'hi' ? 'महत्वपूर्ण शासकीय पोर्टल लिंक्स:' : 'Important Official Portals:'}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <a
                    href="https://basiceducation.up.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-800 font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <span>बेसिक शिक्षा परिषद</span>
                    <ExternalLink className="w-3 h-3 text-amber-600" />
                  </a>
                  <a
                    href="https://prernaup.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <span>प्रेरणा पोर्टल (UP)</span>
                    <ExternalLink className="w-3 h-3 text-blue-600" />
                  </a>
                  <a
                    href="https://diksha.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <span>दीक्षा पोर्टल</span>
                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                  </a>
                  <a
                    href="https://udiseplus.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-800 font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <span>UDISE+</span>
                    <ExternalLink className="w-3 h-3 text-purple-600" />
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column: Google Map with Rounded Frame */}
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border-2 border-blue-200 min-h-[240px] relative bg-slate-100 shadow-sm">
              <iframe
                title="School Location Map"
                src={settings.googleMapsUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3550.0!2d79.4!3d27.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDMwJzAwLjAiTiA3OcKwMjQnMDAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000"}
                width="100%"
                height="100%"
                className="w-full h-full min-h-[240px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>

        </div>

      </section>

    </div>
  );
};
