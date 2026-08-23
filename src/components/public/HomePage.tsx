import React, { useEffect, useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { recordPrivatePageView } from '../../utils/visitorAnalytics';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Bell, 
  Clock, 
  Utensils, 
  Monitor, 
  BookOpenCheck,
  Calendar,
  AlertCircle,
  HelpCircle,
  MapPin,
  FileText,
  Gift,
  Building2,
  Image as ImageIcon,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Images,
  Droplets,
  HeartHandshake,
  Shield,
  Zap,
  Globe,
  Video,
  Film,
  X,
  Flame,
  Lightbulb,
  Compass,
  Maximize2
} from 'lucide-react';
import { parseVideoUrl } from '../../utils/mediaUtils';
import { GalleryItem } from '../../types';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOpenPortal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenPortal }) => {
  const { 
    settings, 
    students, 
    teachers, 
    classes, 
    notices, 
    facilities, 
    governmentSchemes, 
    gallery, 
    language 
  } = useSchool();
  const { role, isAuthenticated, userProfile } = useAuth();

  const publicNotices = notices.filter(n => n.isPublic && n.status === 'active').slice(0, 4);
  const featuredFacilities = facilities.slice(0, 6);
  const activeSchemes = governmentSchemes.slice(0, 4);
  const featuredGallery = gallery.slice(0, 3);

  // Hero Banner Carousel State
  const carouselImages = (settings.heroBannerCarouselImages && settings.heroBannerCarouselImages.length > 0)
    ? settings.heroBannerCarouselImages
    : [
        settings.heroBannerImage || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&w=2000&q=80"
      ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const carouselInterval = settings.heroBannerCarouselInterval || 5;
  const isCarouselActive = Boolean(settings.heroBannerCarouselEnabled) && carouselImages.length > 0;

  // Educational & Motivational Videos Showcase State
  const [selectedVideoModal, setSelectedVideoModal] = useState<GalleryItem | null>(null);
  const [inlinePlayingVideoId, setInlinePlayingVideoId] = useState<string | null>(null);
  const [videoCategoryFilter, setVideoCategoryFilter] = useState<'all' | 'class13' | 'class45' | 'class68' | 'motivation' | 'smart'>('all');

  const [sectionVisibility] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sms_homepage_sections_visibility');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    recordPrivatePageView('home');
  }, []);

  // Filter educational and motivational videos for Classes 1 to 8
  const educationalVideos = useMemo(() => {
    const allVideos = gallery.filter(item => 
      item.isPublic !== false && 
      (item.mediaType === 'video' || !!item.videoURL || !!item.youtubeId)
    );

    if (videoCategoryFilter === 'all') return allVideos;
    if (videoCategoryFilter === 'class13') {
      return allVideos.filter(v => 
        v.targetClass === 'Class 1-3' ||
        (v.tags && (v.tags.includes('Class1to3') || v.tags.includes('FLN') || v.tags.includes('Varnamala') || v.tags.includes('HindiBalgeet'))) ||
        v.albumName?.includes('1-3')
      );
    }
    if (videoCategoryFilter === 'class45') {
      return allVideos.filter(v => 
        v.targetClass === 'Class 4-5' || v.targetClass === 'Class 1-5' ||
        (v.tags && (v.tags.includes('Class4to5') || v.tags.includes('Class1to5') || v.tags.includes('MathFun') || v.tags.includes('EVS') || v.tags.includes('MoralStories'))) ||
        v.albumName?.includes('1-5') || v.albumName?.includes('3-5')
      );
    }
    if (videoCategoryFilter === 'class68') {
      return allVideos.filter(v => 
        v.targetClass === 'Class 6-8' ||
        (v.tags && (v.tags.includes('Class6to8') || v.tags.includes('ScienceLab') || v.tags.includes('UpperPrimary') || v.tags.includes('ISRO'))) ||
        v.albumName?.includes('6-8') || v.albumName?.includes('4-8')
      );
    }
    if (videoCategoryFilter === 'motivation') {
      return allVideos.filter(v => 
        (v.tags && (v.tags.includes('Motivation') || v.tags.includes('Inspiration') || v.tags.includes('AbdulKalam'))) ||
        v.titleEn.toLowerCase().includes('kalam') ||
        v.titleEn.toLowerCase().includes('motivat')
      );
    }
    if (videoCategoryFilter === 'smart') {
      return allVideos.filter(v => 
        (v.tags && (v.tags.includes('SmartClass') || v.tags.includes('InteractiveBoard') || v.tags.includes('DigitalEducation'))) ||
        v.titleEn.toLowerCase().includes('smart') ||
        v.albumName?.toLowerCase().includes('smart')
      );
    }
    return allVideos;
  }, [gallery, videoCategoryFilter]);

  // Hero Banner Carousel Auto-Play Timer
  useEffect(() => {
    if (!isCarouselActive || carouselImages.length <= 1 || !isAutoPlaying || isHovered) {
      return;
    }

    const intervalTimer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % carouselImages.length);
    }, carouselInterval * 1000);

    return () => clearInterval(intervalTimer);
  }, [isCarouselActive, carouselImages.length, isAutoPlaying, isHovered, carouselInterval]);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev + 1) % carouselImages.length);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-12 sm:space-y-16 pb-16 bg-slate-50/50">
      
      {/* Notice Ticker Bar */}
      {publicNotices.length > 0 && (
        <div className="bg-gradient-to-r from-gov-amber-500 via-gov-amber-600 to-amber-600 text-gov-navy-950 px-4 py-2 text-xs font-bold overflow-hidden shadow-xs border-b border-gov-amber-600">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="flex items-center gap-1 font-black uppercase px-2.5 py-0.5 rounded-full bg-gov-navy-950 text-gov-amber-400 text-[10px] shrink-0 shadow-xs animate-pulse">
                <Bell className="w-3 h-3" /> {language === 'hi' ? 'नवीनतम सूचना' : 'Flash Update'}
              </span>
              <div className="truncate text-gov-navy-950 font-semibold text-xs sm:text-sm">
                <span className="font-extrabold mr-2 underline decoration-gov-navy-950/40">
                  {language === 'hi' ? (publicNotices[0].titleHi || publicNotices[0].title) : publicNotices[0].title}:
                </span>
                <span>
                  {language === 'hi' ? (publicNotices[0].descriptionHi || publicNotices[0].description) : publicNotices[0].description}
                </span>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('notices')} 
              className="text-xs font-extrabold underline shrink-0 hover:text-white transition-colors cursor-pointer whitespace-nowrap bg-gov-navy-950/20 px-2.5 py-1 rounded-lg"
            >
              {language === 'hi' ? 'सभी सूचनाएं देखें →' : 'View All →'}
            </button>
          </div>
        </div>
      )}

      {/* Official Identity & Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        {settings.heroBannerLayout === 'panoramic_header' || !settings.heroBannerLayout ? (
          /* Modern Full-Bleed Panoramic Hero Banner with Live Dynamic Aspect Ratio (21:9 / 16:9) */
          <div className="space-y-6">
            <div 
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="rounded-3xl border border-gov-navy-800/60 overflow-hidden shadow-2xl bg-gov-navy-950 relative group"
            >
              {/* Aspect Ratio Container (Responsive adaptive height to never overflow on mobile / tablet) */}
              <div 
                className={`relative w-full overflow-hidden ${
                  settings.heroBannerAspectRatio === '16:9' ? 'min-h-[480px] sm:min-h-[420px] md:min-h-[380px] lg:aspect-video' :
                  settings.heroBannerAspectRatio === '3:1' ? 'min-h-[480px] sm:min-h-[420px] md:min-h-[380px] lg:aspect-[3/1]' :
                  settings.heroBannerAspectRatio === '4:3' ? 'min-h-[480px] sm:min-h-[420px] md:min-h-[380px] lg:aspect-[4/3]' : 
                  'min-h-[500px] sm:min-h-[440px] md:min-h-[400px] lg:min-h-[380px] lg:aspect-[21/9]'
                }`}
              >
                {/* Crossfading Hero Banner Images (Carousel or Static) */}
                {isCarouselActive ? (
                  carouselImages.map((imgUrl, idx) => (
                    <img
                      key={`hero-slide-${idx}-${imgUrl.slice(0, 30)}`}
                      src={imgUrl}
                      alt={`${settings.schoolName} Slide ${idx + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                        idx === currentSlideIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    />
                  ))
                ) : (
                  <img
                    src={settings.heroBannerImage || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2000&q=80"}
                    alt={settings.schoolName}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* High Contrast Gradient Overlay */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-gov-navy-950 via-gov-navy-950/85 to-gov-navy-950/40"
                  style={{
                    opacity: (settings.heroBannerOverlayOpacity !== undefined ? settings.heroBannerOverlayOpacity : 60) / 100
                  }}
                />

                {/* Content Inside Panoramic Hero (With safe padding & spacing on mobile/tablet) */}
                <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-8 lg:p-14 pb-16 sm:pb-12 text-white z-10 overflow-y-auto">
                  <div className="max-w-3xl space-y-3 sm:space-y-4 my-auto">
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 animate-hero-badges">
                      <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gov-amber-500 text-gov-navy-950 text-[10px] sm:text-xs font-black shadow-xs">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gov-navy-950 animate-pulse"></span>
                        <span>{language === 'hi' ? 'उत्तर प्रदेश शासन' : 'Govt. of Uttar Pradesh'}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-[10px] sm:text-xs font-bold">
                        <GraduationCap className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gov-amber-300" />
                        <span>{language === 'hi' ? 'कक्षा 1 से 8 (कंपोजिट)' : 'Classes 1–8 (Composite)'}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500/30 backdrop-blur-md text-emerald-200 border border-emerald-400/40 text-[10px] sm:text-xs font-bold">
                        <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" />
                        <span>{language === 'hi' ? '100% नि:शुल्क शिक्षा' : '100% Free Education'}</span>
                      </div>
                      <span className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-gov-navy-900/80 text-gov-amber-300 text-xs font-mono font-bold border border-gov-navy-700">
                        UDISE: {settings.schoolCode}
                      </span>
                    </div>

                    {/* Headlines with CSS Entry Animation */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-widest text-gov-amber-400 animate-hero-headline">
                        {language === 'hi' ? 'बेसिक शिक्षा परिषद, उत्तर प्रदेश' : 'Department of Basic Education, Govt. of UP'}
                      </div>
                      <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-snug sm:leading-tight drop-shadow-md animate-hero-headline">
                        {language === 'hi' 
                          ? (settings.heroBannerHeadlineHi || settings.schoolNameHi)
                          : (settings.heroBannerHeadlineEn || settings.schoolName)}
                      </h1>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm font-semibold text-slate-200 pt-0.5 animate-hero-subtitle">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gov-amber-400 shrink-0" />
                        <span className="line-clamp-2 sm:line-clamp-1">
                          {language === 'hi'
                            ? (settings.heroBannerSubtitleHi || `ग्राम: ${settings.villageHi || 'हरसिंहपुर गोवा'} • विकास खंड: ${settings.blockHi || 'शमसाबाद'} • जनपद: ${settings.districtHi || 'फर्रुखाबाद'} (उ.प्र.)`)
                            : (settings.heroBannerSubtitleEn || `Village: ${settings.village || 'Harsinghpur Gova'} • Block: ${settings.block || 'Shamsabad'} • District: ${settings.district || 'Farrukhabad'}, UP`)}
                        </span>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
                      <button
                        onClick={() => onNavigate('admission')}
                        className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gov-amber-500 text-gov-navy-950 font-black hover:bg-gov-amber-400 shadow-lg shadow-gov-amber-500/30 transition-all text-xs sm:text-sm cursor-pointer transform hover:-translate-y-0.5"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>{language === 'hi' ? 'नि:शुल्क प्रवेश प्रक्रिया' : 'Free Admission'}</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>

                      <button
                        onClick={() => onNavigate('schemes')}
                        className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all text-xs sm:text-sm cursor-pointer"
                      >
                        <Gift className="w-4 h-4 text-emerald-200" />
                        <span>{language === 'hi' ? 'डीबीटी व योजनाएं' : 'Govt. Schemes'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Carousel Navigation Arrows & Controls */}
                {isCarouselActive && carouselImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
                      aria-label="Previous Slide"
                      title={language === 'hi' ? 'पिछली फोटो' : 'Previous Slide'}
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
                      aria-label="Next Slide"
                      title={language === 'hi' ? 'अगली फोटो' : 'Next Slide'}
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {/* Carousel Bottom Indicator Dots & Controls */}
                    <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/20 shadow-lg">
                      <button
                        type="button"
                        onClick={() => setIsAutoPlaying(p => !p)}
                        className="text-gov-amber-400 hover:text-gov-amber-300 text-xs pr-1 cursor-pointer transition-colors"
                        title={isAutoPlaying ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
                        aria-label={isAutoPlaying ? 'Pause' : 'Play'}
                      >
                        {isAutoPlaying ? <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                      </button>

                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {carouselImages.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentSlideIndex(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                            className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                              idx === currentSlideIndex ? 'w-4 sm:w-5 bg-gov-amber-400' : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-[9px] sm:text-[10px] font-mono text-white/90 pl-1 border-l border-white/20">
                        {currentSlideIndex + 1}/{carouselImages.length}
                      </span>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Quick Institutional Verified Metric Strip Below Panoramic Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">{language === 'hi' ? 'यू-डायस कोड' : 'UDISE Code'}</div>
                  <div className="font-mono font-extrabold text-slate-900 text-sm">{settings.schoolCode}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">{language === 'hi' ? 'स्तर / कक्षाएं' : 'Classes'}</div>
                  <div className="font-extrabold text-slate-900 text-sm">Class 1 to 8 (कंपोजिट)</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">{language === 'hi' ? 'कुल नामांकित छात्र' : 'Enrolled Students'}</div>
                  <div className="font-black text-slate-900 text-sm">{students.length} Students (100% Free)</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">{language === 'hi' ? 'प्रधानाध्यापिका' : 'Head Teacher'}</div>
                  <div className="font-bold text-slate-900 text-xs truncate max-w-[130px]">{settings.headTeacherName}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Dual-Column Classic Institutional Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Hero Text & Actions */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Top Badges */}
              <div className="flex flex-wrap items-center gap-2 animate-hero-badges">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-gov-amber-600 to-amber-700 text-white text-xs font-black shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  <span>{language === 'hi' ? 'उत्तर प्रदेश शासन' : 'Govt. of Uttar Pradesh'}</span>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gov-navy-100 text-gov-navy-900 border border-gov-navy-200 text-xs font-bold">
                  <GraduationCap className="w-3.5 h-3.5 text-gov-navy-700" />
                  <span>{language === 'hi' ? 'कक्षा 1 से 8 (कंपोजिट)' : 'Classes 1–8 (Composite)'}</span>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === 'hi' ? '100% नि:शुल्क शिक्षा' : '100% Free Education'}</span>
                </div>
              </div>

              {/* Main Heading */}
              <div className="space-y-2">
                <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-gov-amber-700 animate-hero-headline">
                  {language === 'hi' ? 'बेसिक शिक्षा परिषद, उत्तर प्रदेश' : 'Department of Basic Education, Govt. of UP'}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gov-navy-950 tracking-tight leading-tight animate-hero-headline">
                  {language === 'hi' ? (settings.heroBannerHeadlineHi || settings.schoolNameHi) : (settings.heroBannerHeadlineEn || settings.schoolName)}
                </h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 pt-1 animate-hero-subtitle">
                  <MapPin className="w-4 h-4 text-gov-amber-600 shrink-0" />
                  <span>
                    {language === 'hi'
                      ? (settings.heroBannerSubtitleHi || `ग्राम: ${settings.villageHi || 'हरसिंहपुर गोवा'} • विकास खंड: ${settings.blockHi || 'शमसाबाद'} • जनपद: ${settings.districtHi || 'फर्रुखाबाद'} (उ.प्र.)`)
                      : (settings.heroBannerSubtitleEn || `Village: ${settings.village || 'Harsinghpur Gova'} • Block: ${settings.block || 'Shamsabad'} • District: ${settings.district || 'Farrukhabad'}, UP`)}
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                {language === 'hi'
                  ? 'कंपोजिट विद्यालय हरसिंहपुर गोवा में आपका स्वागत है। हमारा संकल्प प्रत्येक बच्चे को गुणवत्तापूर्ण बुनियादी साक्षरता एवं संख्यात्मक ज्ञान (NIPUN Bharat), आधुनिक शिक्षण, पोषण युक्त मध्याह्न भोजन (PM POSHAN) एवं समग्र विकास प्रदान करना है।'
                  : 'Welcome to Composite JHS Harsinghpur Gova. We are dedicated to foundational literacy & numeracy (NIPUN Bharat), modern pedagogy, free nutritious mid-day meals (PM POSHAN), and holistic development for all rural students.'}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('admission')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gov-amber-500 text-gov-navy-950 font-black hover:bg-gov-amber-600 shadow-lg shadow-gov-amber-500/25 transition-all text-xs sm:text-sm cursor-pointer transform hover:-translate-y-0.5"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>{language === 'hi' ? 'नि:शुल्क प्रवेश प्रक्रिया' : 'Free Admission Guidelines'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('schemes')}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 transition-all text-xs sm:text-sm cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-emerald-200" />
                  <span>{language === 'hi' ? 'डीबीटी व सरकारी योजनाएं' : 'Govt. Schemes & DBT'}</span>
                </button>
              </div>

            </div>

            {/* Right Column: Hero Visual Card / School Identity Profile */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-gov-navy-950 via-gov-navy-900 to-gov-navy-950 rounded-3xl p-6 sm:p-7 text-white shadow-2xl border border-gov-navy-800 space-y-5 relative overflow-hidden">
                
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-gov-navy-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gov-amber-400 to-amber-600 flex items-center justify-center text-gov-navy-950 font-black shadow-md">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-white">
                        {language === 'hi' ? 'आधिकारिक विद्यालय प्रोफ़ाइल' : 'Official Institutional Profile'}
                      </h3>
                      <p className="text-[11px] text-gov-amber-300 font-mono font-bold">UDISE: {settings.schoolCode}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                  </span>
                </div>

                {/* Verified Attributes Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-gov-navy-900/80 p-3 rounded-2xl border border-gov-navy-700/60">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{language === 'hi' ? 'स्तर / कक्षाएं' : 'Level & Classes'}</div>
                    <div className="font-extrabold text-slate-100 text-sm mt-0.5">Classes 1 — 8</div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">{language === 'hi' ? 'कंपोजिट परिषदीय' : 'Composite Govt.'}</div>
                  </div>

                  <div className="bg-gov-navy-900/80 p-3 rounded-2xl border border-gov-navy-700/60">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{language === 'hi' ? 'विकास खंड (ब्लॉक)' : 'Block'}</div>
                    <div className="font-extrabold text-slate-100 text-sm mt-0.5">
                      {language === 'hi' ? (settings.blockHi || 'शमसाबाद') : (settings.block || 'Shamsabad')}
                    </div>
                    <div className="text-[10px] text-gov-amber-300 font-semibold mt-0.5">{language === 'hi' ? 'शमसाबाद' : 'Shamsabad'}</div>
                  </div>

                  <div className="bg-gov-navy-900/80 p-3 rounded-2xl border border-gov-navy-700/60">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{language === 'hi' ? 'जनपद (जिला)' : 'District'}</div>
                    <div className="font-extrabold text-slate-100 text-sm mt-0.5">
                      {language === 'hi' ? (settings.districtHi || 'फर्रुखाबाद') : (settings.district || 'Farrukhabad')}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">{language === 'hi' ? 'फर्रुखाबाद, उ.प्र.' : 'Farrukhabad, UP'}</div>
                  </div>

                  <div className="bg-gov-navy-900/80 p-3 rounded-2xl border border-gov-navy-700/60">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{language === 'hi' ? 'प्रधानाध्यापिका' : 'Head Teacher'}</div>
                    <div className="font-extrabold text-gov-amber-300 text-xs mt-0.5">
                      {settings.headTeacherName}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{language === 'hi' ? 'प्रभारी प्रधानाध्यापिका' : 'In-Charge Head'}</div>
                  </div>
                </div>

                {/* Metrics Counter Strip */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gov-navy-800 text-center">
                  <div className="p-2.5 rounded-2xl bg-gov-navy-900 border border-gov-navy-800">
                    <div className="text-2xl font-black text-gov-amber-400">8</div>
                    <div className="text-[10px] text-slate-300 font-bold">{language === 'hi' ? 'कक्षाएं' : 'Classes'}</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-gov-navy-900 border border-gov-navy-800">
                    <div className="text-2xl font-black text-emerald-400">{students.length}</div>
                    <div className="text-[10px] text-slate-300 font-bold">{language === 'hi' ? 'नामांकित छात्र' : 'Enrolled'}</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-gov-navy-900 border border-gov-navy-800">
                    <div className="text-2xl font-black text-blue-400">100%</div>
                    <div className="text-[10px] text-slate-300 font-bold">{language === 'hi' ? 'नि:शुल्क' : 'Zero Fee'}</div>
                  </div>
                </div>

                {/* PM POSHAN Nutrition Badge */}
                <div className="bg-gradient-to-r from-gov-amber-500/20 to-amber-500/20 border border-gov-amber-500/40 p-3.5 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-gov-amber-500 text-gov-navy-950 rounded-xl font-bold shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-extrabold text-gov-amber-300">
                      {language === 'hi' ? 'पीएम पोषण (मध्याह्न भोजन योजना):' : 'PM-POSHAN Nutrition Scheme:'}
                    </div>
                    <div className="text-slate-300 text-[11px] mt-0.5">
                      {language === 'hi'
                        ? 'दैनिक पौष्टिक भोजन, साप्ताहिक फल एवं दूध वितरण मेन्यू अनुसार संचालित।'
                        : 'Hot nutritious daily meals served under strict hygiene and government menu guidelines.'}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </section>

      {/* "शिक्षा सेतु" - Vibrant Quick Services & Features Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>{language === 'hi' ? 'शिक्षा सेतु • त्वरित सेवाएं' : 'Key Portal Services & Highlights'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {language === 'hi' ? 'विद्यालय के प्रमुख अनुभाग व सुविधाएं' : 'Core Sections & Academic Services'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {language === 'hi' 
              ? 'कक्षा 1 से 8 तक के पाठ्यक्रम, सरकारी कल्याणकारी योजनाएं एवं भौतिक संसाधनों का विवरण।'
              : 'Detailed breakdown of curriculum, welfare entitlements, campus infrastructure, and official circulars.'}
          </p>
        </div>

        {/* 6 Vibrant Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Academics (Royal Blue) */}
          <div 
            onClick={() => onNavigate('classes')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md group-hover:bg-blue-600 transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-blue-700">Classes 1–8</div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">
                  {language === 'hi' ? 'कक्षाएं व पाठ्यक्रम' : 'Curriculum & Subjects'}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {language === 'hi'
                    ? 'बेसिक शिक्षा परिषद द्वारा निर्धारित प्राथमिक व उच्च प्राथमिक पाठ्यक्रम, निपुण भारत लक्ष्य एवं विषयवार विवरण।'
                    : 'State curriculum for Primary & Upper Primary, FLN NIPUN targets, textbooks, and assessment guidelines.'}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>{language === 'hi' ? 'पाठ्यक्रम देखें' : 'View Curriculum'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: DBT Schemes (Emerald Green) */}
          <div 
            onClick={() => onNavigate('schemes')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:bg-emerald-600 transition-colors">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Direct Benefit Transfer</div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors mt-0.5">
                  {language === 'hi' ? '₹1200 DBT व सरकारी योजनाएं' : '₹1200 DBT & Govt. Schemes'}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {language === 'hi'
                    ? 'यूनिफॉर्म, जूता-मोजा, बैग व स्वेटर हेतु ₹1200 अभिभावक के खाते में सीधे अंतरण एवं निःशुल्क पाठ्यपुस्तकें।'
                    : 'Direct bank transfer of ₹1200 per student for uniforms, bags, shoes, sweaters, plus free books & stationery.'}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>{language === 'hi' ? 'योजनाएं व पात्रता' : 'View All Schemes'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: PM POSHAN Mid-Day Meal (Amber/Orange) */}
          <div 
            onClick={() => onNavigate('facilities')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-amber-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md group-hover:bg-amber-400 transition-colors font-bold">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-700">Nutrition Program</div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors mt-0.5">
                  {language === 'hi' ? 'पीएम पोषण मध्याह्न भोजन' : 'PM POSHAN (Mid-Day Meal)'}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {language === 'hi'
                    ? 'दैनिक पौष्टिक गर्म भोजन, सप्ताह में फल एवं दूध वितरण, स्वच्छ किचेन शेड व आरओ पेयजल सुविधा।'
                    : 'Freshly prepared hot nutritious meals following weekly government menu with milk, fruits, and safe water.'}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
              <span>{language === 'hi' ? 'मेन्यू व व्यवस्था' : 'MDM Facilities'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Faculty & Administration (Purple/Indigo) */}
          <div 
            onClick={() => onNavigate('faculty')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-purple-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md group-hover:bg-purple-700 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-purple-700">Verified Faculty</div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-600 transition-colors mt-0.5">
                  {language === 'hi' ? 'प्रशिक्षित शिक्षक वृंद' : 'Faculty & Staff Directory'}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {language === 'hi'
                    ? 'बेसिक शिक्षा परिषद द्वारा नियुक्त योग्य एवं प्रशिक्षित शिक्षक, पदनाम, विशेषज्ञता एवं संपर्क विवरण।'
                    : 'Official profiles of government appointed qualified teachers, subject specializations, and leadership.'}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span>{language === 'hi' ? 'शिक्षक सूची देखें' : 'View Faculty List'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Campus & Tap Water (Cyan/Teal) */}
          <div 
            onClick={() => onNavigate('facilities')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-cyan-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-md group-hover:bg-cyan-700 transition-colors">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-cyan-700">Jal Jeevan Mission</div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-cyan-600 transition-colors mt-0.5">
                  {language === 'hi' ? 'नल से जल व भौतिक सुविधाएं' : 'Tap Water & Infrastructure'}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {language === 'hi'
                    ? 'कायाकल्प अंतर्गत विद्युतीकरण, नल से शुद्ध जल, शौचालय, खेल का मैदान, दिव्यांग रैंप एवं पुस्तकालय।'
                    : 'Operation Kayakalp facilities including running tap water, clean toilets, ramp access, electricity & sports.'}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700">
              <span>{language === 'hi' ? 'सुविधाएं देखें' : 'View Infrastructure'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Free Admissions & Documents (Rose/Red) */}
          <div 
            onClick={() => onNavigate('admission')}
            className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-rose-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md group-hover:bg-rose-600 transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-rose-700">RTE Act 2009</div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-rose-600 transition-colors mt-0.5">
                  {language === 'hi' ? 'नि:शुल्क प्रवेश व प्रपत्र' : 'Free Admission & Forms'}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {language === 'hi'
                    ? 'आयु सीमा, आवश्यक दस्तावेज (आधार, फोटो, बैंक खाता), प्रवेश प्रपत्र डाउनलोड एवं प्रक्रिया।'
                    : 'Zero-fee admission guidelines, age criteria, document checklist, downloadable forms & academic calendar.'}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
              <span>{language === 'hi' ? 'प्रवेश विवरण' : 'Admission Rules'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Comprehensive All Features & Portals Quick Access Directory */}
        <div className="mt-10 bg-slate-50/90 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gov-amber-800">
                <Sparkles className="w-4 h-4 text-gov-amber-600" />
                <span>{language === 'hi' ? 'सम्पूर्ण पोर्टल निर्देशिका' : 'Complete Portal Directory'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {language === 'hi' ? 'वेबसाइट के सभी मुख्य फीचर्स एवं सुविधाएं' : 'All Website Features & Access Modules'}
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
              {language === 'hi' ? '12+ आधिकारिक अनुभाग' : '12+ Official Sections'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Category 1: Academics & Welfare */}
            <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'शिक्षा व कल्याण' : 'Academics & Welfare'}</span>
              </div>
              
              <button
                onClick={() => onNavigate('classes')}
                className="w-full text-left p-2 rounded-xl hover:bg-blue-50/80 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                    {language === 'hi' ? 'कक्षाएं 1 से 8 पाठ्यक्रम' : 'Classes 1–8 Curriculum'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'निपुण भारत FLN व विषय' : 'NIPUN Bharat & Subjects'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('schemes')}
                className="w-full text-left p-2 rounded-xl hover:bg-emerald-50/80 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    {language === 'hi' ? '₹1200 DBT व सरकारी योजनाएं' : '₹1200 DBT & Schemes'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'यूनिफॉर्म, बैग, पाठ्यपुस्तक' : 'Uniform, Bags, Textbooks'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('admission')}
                className="w-full text-left p-2 rounded-xl hover:bg-rose-50/80 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition-colors truncate">
                    {language === 'hi' ? 'नि:शुल्क प्रवेश (RTE 2009)' : 'Free RTE Admissions'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'प्रवेश नियम, आयु व प्रपत्र' : 'Eligibility & Forms'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 shrink-0" />
              </button>
            </div>

            {/* Category 2: Institution & Campus */}
            <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-black text-purple-700 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Building2 className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'संस्थान व कार्मिक' : 'Campus & Faculty'}</span>
              </div>
              
              <button
                onClick={() => onNavigate('about')}
                className="w-full text-left p-2 rounded-xl hover:bg-purple-50/80 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                    {language === 'hi' ? 'संस्थान परिचय व मान्यता' : 'School Profile & History'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'UDISE कोड एवं मान्यता' : 'UDISE & Accreditation'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('faculty')}
                className="w-full text-left p-2 rounded-xl hover:bg-purple-50/80 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                    {language === 'hi' ? 'शिक्षक एवं कार्मिक पंजिका' : 'Faculty Directory'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'प्रधानाध्यापिका व प्रशिक्षित शिक्षक' : 'Headmaster & Teachers'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('facilities')}
                className="w-full text-left p-2 rounded-xl hover:bg-cyan-50/80 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition-colors truncate">
                    {language === 'hi' ? 'भौतिक संसाधन व नल से जल' : 'Infrastructure & Facilities'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'कायाकल्प, किचेन, खेल मैदान' : 'Kayakalp, Water & Sports'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 shrink-0" />
              </button>
            </div>

            {/* Category 3: Activities & Media */}
            <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Images className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'दीर्घा व अभिलेख' : 'Media & Circulars'}</span>
              </div>
              
              <button
                onClick={() => onNavigate('gallery')}
                className="w-full text-left p-2 rounded-xl hover:bg-amber-50/80 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                    {language === 'hi' ? 'सचित्र फोटो गैलरी' : 'Campus Photo Archive'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'कार्यक्रम व गतिविधियां' : 'Activities & Celebrations'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('notices')}
                className="w-full text-left p-2 rounded-xl hover:bg-amber-50/80 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                    {language === 'hi' ? 'सूचना पट्ट व आदेश' : 'Notice Board & Orders'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'नवीनतम शासनादेश व विज्ञप्ति' : 'Official Circulars'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('documents')}
                className="w-full text-left p-2 rounded-xl hover:bg-amber-50/80 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                    {language === 'hi' ? 'प्रपत्र व शैक्षिक कैलेंडर' : 'Forms & Academic Calendar'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'अवकाश तालिका व प्रवेश फॉर्म' : 'Holiday List & Forms'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
              </button>
            </div>

            {/* Category 4: Portals & Portals */}
            <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-black text-gov-navy-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'पोर्टल व सहायता' : 'Portals & Support'}</span>
              </div>
              
              <button
                onClick={() => onNavigate('sources')}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-gov-amber-700 transition-colors truncate">
                    {language === 'hi' ? 'शासकीय शिक्षा पोर्टल' : 'Official UP Portals'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'UDISE+, Prerna, Diksha' : 'UDISE+, Prerna, Diksha'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-gov-amber-600 shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('contact')}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-gov-amber-700 transition-colors truncate">
                    {language === 'hi' ? 'संपर्क व आपात हेल्पलाइन' : 'Contact & Helplines'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'पता, मैप व 24x7 सहायता' : 'Location, Map & 24x7 Help'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-gov-amber-600 shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('login-student')}
                className="w-full text-left p-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 transition-colors flex items-center justify-between group cursor-pointer border border-amber-200/60"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-gov-amber-800 transition-colors truncate flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-gov-amber-700" />
                    <span>{language === 'hi' ? 'छात्र एवं अभिभावक लॉगिन' : 'Student & Parent Login'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'उपस्थिति, अंकपत्र व डीबीटी' : 'Attendance & Progress Report'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gov-amber-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('login-teacher')}
                className="w-full text-left p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 transition-colors flex items-center justify-between group cursor-pointer border border-blue-200/60"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-800 transition-colors truncate flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-700" />
                    <span>{language === 'hi' ? 'शिक्षक एवं स्टॉफ लॉगिन' : 'Teacher & Staff Login'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'उपस्थिति अंकन व एमडीएम' : 'Mark Attendance & MDM Log'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('faq')}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-gov-amber-700 transition-colors truncate">
                    {language === 'hi' ? 'प्रश्नोत्तरी (FAQ)' : 'FAQ & Knowledge Base'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {language === 'hi' ? 'सामान्य प्रश्न व समाधान' : 'Common Inquiries'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-gov-amber-600 shrink-0" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* National Mission Highlight Banner (NIPUN Bharat & Samagra Shiksha) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-gov-navy-950 via-gov-navy-900 to-gov-navy-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-gov-navy-800">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-gov-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gov-amber-400 text-gov-navy-950 text-xs font-black">
                <Sparkles className="w-3.5 h-3.5" />
                <span>निपुण भारत मिशन • NIPUN BHARAT</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {language === 'hi'
                  ? 'बुनियादी साक्षरता एवं संख्या ज्ञान (FLN) का संकल्प'
                  : 'Foundational Literacy & Numeracy for Every Child'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {language === 'hi'
                  ? 'कक्षा 1 से 3 तक के सभी बच्चों को भाषा व गणित में दक्ष बनाने हेतु विशेष शिक्षण सामग्री, संदर्शिका एवं दैनिक अभ्यास पुस्तिकाओं द्वारा शिक्षण।'
                  : 'Ensuring every child in primary classes achieves foundational reading, writing, and basic mathematical operations under national FLN standards.'}
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <button
                onClick={() => onNavigate('classes')}
                className="px-5 py-3 rounded-xl bg-gov-amber-500 hover:bg-gov-amber-400 text-gov-navy-950 font-black text-xs sm:text-sm transition-all text-center cursor-pointer shadow-md"
              >
                {language === 'hi' ? 'निपुण लक्ष्य एवं कक्षाएं देखें' : 'Explore NIPUN Targets'}
              </button>
              <button
                onClick={() => onNavigate('documents')}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all text-center border border-white/20 cursor-pointer"
              >
                {language === 'hi' ? 'शैक्षिक कैलेंडर डाउनलोड करें' : 'Academic Calendar'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Smart Classroom & Motivational Educational Video Showcase */}
      {sectionVisibility.educationalVideos !== false && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-gov-navy-950 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
          {/* Subtle Ambient Glowing Elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{language === 'hi' ? 'स्मार्ट शिक्षण एवं छात्र प्रेरणा' : 'Smart Learning & Student Inspiration'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {language === 'hi'
                  ? 'आधुनिक स्मार्ट क्लासरूम एवं प्रेरक शिक्षण वीडियो'
                  : 'Top Smart Classrooms & Motivational Learning Videos'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {language === 'hi'
                  ? 'डिजिटल 3D बोर्ड शिक्षण, विज्ञान प्रयोगशाला के रोमांचक प्रयोग, गणितीय ट्रिक्स एवं महान विभूतियों के प्रेरक विचार जिससे विद्यार्थियों में पढ़ाई के प्रति नई ऊर्जा और उत्साह का संचार हो।'
                  : 'Explore interactive smart whiteboard lessons, exciting science experiments, fast math logic, and inspiring messages designed to cultivate curiosity and study passion.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('gallery')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gov-navy-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>{language === 'hi' ? 'सभी वीडियो एवं गैलरी' : 'View Full Media Hub'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video Category Filter Tabs by Class Level */}
          <div className="relative z-10 flex items-center gap-2 overflow-x-auto pt-6 pb-2 no-scrollbar">
            {[
              { id: 'all', labelHi: 'सभी कक्षाएं (1 से 8)', labelEn: 'All Classes (1-8)', icon: Film },
              { id: 'class13', labelHi: 'कक्षा 1 से 3 (बालगीत, वर्णमाला)', labelEn: 'Class 1-3 (FLN / Rhymes)', icon: Sparkles },
              { id: 'class45', labelHi: 'कक्षा 4 व 5 (गणित, EVS, कहानियां)', labelEn: 'Class 4-5 (Math & EVS)', icon: BookOpenCheck },
              { id: 'class68', labelHi: 'कक्षा 6 से 8 (विज्ञान प्रयोग, अंतरिक्ष)', labelEn: 'Class 6-8 (Science & Space)', icon: Lightbulb },
              { id: 'motivation', labelHi: 'डॉ. कलाम के 4 स्वर्णिम नियम', labelEn: 'Dr. Kalam Motivation', icon: Flame },
              { id: 'smart', labelHi: '3D स्मार्ट क्लासरूम', labelEn: 'Smart Digital Classes', icon: Monitor }
            ].map(tab => {
              const IconComp = tab.icon;
              const isActive = videoCategoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setVideoCategoryFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                    isActive
                      ? 'bg-amber-500 text-gov-navy-950 shadow-md font-black scale-102 ring-2 ring-amber-400/50'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white border border-white/10'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-gov-navy-950' : 'text-amber-400'}`} />
                  <span>{language === 'hi' ? tab.labelHi : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Videos Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {educationalVideos.slice(0, 6).map((video) => {
              const isPlaying = inlinePlayingVideoId === video.id;
              const thumb = video.thumbnailURL || video.imageUrl || video.imageURL || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80';
              const parsed = parseVideoUrl(video.videoURL || (video.youtubeId ? `https://youtube.com/watch?v=${video.youtubeId}` : ''));

              return (
                <div
                  key={video.id}
                  className={`group bg-slate-800/90 rounded-2xl border overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between duration-200 ${
                    isPlaying 
                      ? 'border-amber-400 ring-2 ring-amber-400/40 bg-slate-800 shadow-amber-500/10' 
                      : 'border-slate-700/80 hover:border-amber-400/80 hover:bg-slate-800 transform hover:-translate-y-1'
                  }`}
                >
                  {/* Video Screen: Live Inline Player or Video Thumbnail with Play Button */}
                  <div className="aspect-video relative bg-black overflow-hidden">
                    {isPlaying ? (
                      /* ACTIVE INLINE VIDEO PLAYER */
                      <div className="w-full h-full relative bg-black">
                        {parsed.embedUrl ? (
                          <iframe
                            src={`${parsed.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
                            title={video.titleEn}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : video.videoURL ? (
                          <video
                            src={video.videoURL}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                            <Film className="w-8 h-8 text-slate-600 mb-1" />
                            <p className="text-xs">{language === 'hi' ? 'वीडियो लोड हो रहा है...' : 'Video loading...'}</p>
                          </div>
                        )}

                        {/* Top Controls Overlay for Inline Player */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20 pointer-events-auto">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVideoModal(video);
                            }}
                            className="p-1.5 rounded-lg bg-black/80 hover:bg-slate-800 text-white/90 hover:text-white transition-all cursor-pointer backdrop-blur-xs border border-white/20"
                            title={language === 'hi' ? 'बड़ा करें (Full Theater View)' : 'Expand to Full View'}
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInlinePlayingVideoId(null);
                            }}
                            className="p-1.5 rounded-lg bg-black/80 hover:bg-rose-600 text-white transition-all cursor-pointer backdrop-blur-xs border border-white/20"
                            title={language === 'hi' ? 'वीडियो बंद करें' : 'Stop Video'}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Playing Status Pill */}
                        <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
                          <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-amber-400 text-[10px] font-bold flex items-center gap-1.5 border border-amber-400/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span>{language === 'hi' ? 'सक्रिय वीडियो' : 'Playing Now'}</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* INACTIVE THUMBNAIL WITH DIRECT PLAY TOGGLE */
                      <div 
                        onClick={() => setInlinePlayingVideoId(video.id)}
                        className="w-full h-full relative cursor-pointer group/thumb"
                      >
                        {/* Thumbnail Image with smooth scaling */}
                        <img
                          src={thumb}
                          alt={video.titleEn}
                          className="w-full h-full object-cover transform scale-100 group-hover:scale-108 group-hover/thumb:scale-108 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                          loading="lazy"
                        />
                        {/* Dynamic Vignette & Dark Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/25 group-hover:from-black/75 group-hover:via-black/20 group-hover/thumb:from-black/70 transition-all duration-300" />

                        {/* Centered Direct Play Button Overlay with Responsive Micro-Interactions */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          {/* Animated Ambient Pulse Ring on Hover */}
                          <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-400/40 scale-75 opacity-0 group-hover:scale-130 group-hover:opacity-100 group-hover/thumb:scale-130 group-hover/thumb:opacity-100 transition-all duration-500 ease-out blur-xs" />
                          
                          {/* Main Play Icon Circle Badge */}
                          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-amber-500 text-gov-navy-950 flex items-center justify-center shadow-2xl transform scale-95 group-hover:scale-110 group-hover/thumb:scale-110 group-hover:bg-amber-400 transition-all duration-300 ease-out ring-4 ring-white/40 group-hover:ring-6 group-hover:ring-amber-400/50 relative z-10">
                            <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current translate-x-0.5 group-hover:scale-105 transition-transform" />
                          </div>

                          {/* Hover Play Indicator Tag */}
                          <span className="absolute -bottom-8 px-2.5 py-0.5 rounded-full bg-black/90 backdrop-blur-md text-amber-300 text-[10px] font-black tracking-wide uppercase shadow-lg border border-amber-400/30 opacity-0 group-hover:opacity-100 group-hover/thumb:opacity-100 translate-y-1.5 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap z-20">
                            {language === 'hi' ? '▶ तुरंत चलाएं' : '▶ Click to Play'}
                          </span>
                        </div>

                        {/* Target Class Pill Badge */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {video.targetClass && (
                            <span className="px-2.5 py-1 rounded-md bg-amber-500 text-gov-navy-950 text-[10px] font-black tracking-tight shadow-md flex items-center gap-1">
                              <span>🎯 {video.targetClass}</span>
                            </span>
                          )}
                          <span className="px-2 py-1 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold backdrop-blur-xs">
                            {language === 'hi' ? 'सरल हिंदी' : 'Easy Hindi'}
                          </span>
                        </div>

                        {/* Duration & Age Group */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-1">
                          {video.duration && (
                            <span className="px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                              {video.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Metadata */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-amber-300/90 font-bold uppercase tracking-wider">
                        <span className="truncate max-w-[200px]">{video.albumName || 'Classroom Learning'}</span>
                        {video.ageGroup && (
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                            {video.ageGroup}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                        {language === 'hi' && video.titleHi ? video.titleHi : video.titleEn}
                      </h3>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {language === 'hi' && video.captionHi ? video.captionHi : video.captionEn || video.titleEn}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {video.tags?.slice(0, 2).map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/10 text-slate-300">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Direct Play / Stop Toggle Control */}
                      {isPlaying ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedVideoModal(video)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                            title={language === 'hi' ? 'बड़ी स्क्रीन में देखें' : 'Theater View'}
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setInlinePlayingVideoId(null)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>{language === 'hi' ? 'वीडियो बंद करें' : 'Stop'}</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setInlinePlayingVideoId(video.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gov-navy-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-103"
                        >
                          <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                          <span>{language === 'hi' ? 'सीधे चलाएं' : 'Play Video'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inspirational Student Quote Banner */}
          <div className="relative z-10 mt-8 p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-gov-navy-950 flex items-center justify-center font-bold shrink-0">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300">
                  {language === 'hi' ? '“सपने वो नहीं जो हम सोते हुए देखते हैं, सपने वो हैं जो हमें सोने नहीं देते।”' : '"Dreams are not what you see in sleep, dreams are those that do not let you sleep."'}
                </div>
                <div className="text-[11px] text-slate-300">
                  — {language === 'hi' ? 'भारतरत्न डॉ. एपीजे अब्दुल कलाम' : 'Bharat Ratna Dr. A.P.J. Abdul Kalam'}
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('login-student')}
              className="px-4 py-2 rounded-xl bg-white text-gov-navy-950 hover:bg-amber-100 text-xs font-extrabold shrink-0 transition-all cursor-pointer shadow-sm"
            >
              {language === 'hi' ? 'छात्र पोर्टल में लॉगिन करें' : 'Student Portal Login'}
            </button>
          </div>
        </div>
      </section>
      )}

      {/* Featured Government Schemes Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-gov-amber-700">
              {language === 'hi' ? 'शासकीय छात्र कल्याण' : 'Government Welfare Benefits'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {language === 'hi' ? 'छात्रों हेतु प्रमुख सरकारी योजनाएं' : 'Key Government Schemes for Students'}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('schemes')}
            className="text-xs font-black text-gov-amber-800 hover:text-gov-amber-950 flex items-center gap-1 cursor-pointer bg-gov-amber-50 px-3.5 py-2 rounded-xl border border-gov-amber-200"
          >
            <span>{language === 'hi' ? 'सभी योजनाएं एवं पात्रता देखें' : 'View All Welfare Schemes'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {activeSchemes.map((scheme) => (
            <div 
              key={scheme.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-gov-amber-400 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-gov-amber-100 text-gov-amber-900">
                    {language === 'hi' ? scheme.categoryHi : scheme.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-gov-amber-600 transition-colors">
                  {language === 'hi' ? scheme.nameHi : scheme.nameEn}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {language === 'hi' ? scheme.descriptionHi : scheme.descriptionEn}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  {language === 'hi' ? 'कक्षा 1 से 8' : 'Class 1–8'}
                </span>
                <button
                  onClick={() => onNavigate('schemes')}
                  className="font-bold text-gov-amber-700 group-hover:text-gov-amber-900 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{language === 'hi' ? 'विवरण' : 'Details'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Photo Showcase & Activities Gallery Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'सचित्र विद्यालय अभिलेखागार' : 'Campus Visual Archive'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {language === 'hi' ? 'विद्यालय गतिविधियां एवं फोटो गैलरी' : 'Campus Life & Activities Showcase'}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="text-xs font-black text-amber-900 hover:text-slate-950 flex items-center gap-1.5 cursor-pointer bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-xl border border-amber-200 transition-colors shadow-xs"
          >
            <span>{language === 'hi' ? 'सम्पूर्ण फोटो गैलरी देखें' : 'Explore Full Gallery'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {gallery
            .filter(item => item.isPublic !== false)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .slice(0, 4)
            .map((photo, idx) => {
              const img = photo.imageUrl || photo.imageURL || '';
              return (
                <div
                  key={photo.id}
                  onClick={() => onNavigate('gallery')}
                  className="group cursor-pointer bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between"
                >
                  <div className="aspect-4/3 bg-slate-950 overflow-hidden relative">
                    <img
                      src={img}
                      alt={photo.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                        {photo.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">{photo.date || 'Recent Activity'}</div>
                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1 mt-0.5">
                        {language === 'hi' && photo.titleHi ? photo.titleHi : photo.titleEn}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {language === 'hi' && photo.captionHi ? photo.captionHi : photo.captionEn || photo.titleEn}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-amber-700 flex items-center justify-between">
                      <span>{language === 'hi' ? 'गैलरी में देखें' : 'View in Gallery'} &rarr;</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Emergency & Official Helpline Numbers Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gov-navy-950 rounded-3xl p-6 sm:p-8 text-white border border-gov-navy-800 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1 max-w-md">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-gov-amber-400 uppercase tracking-wider">
                <Phone className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'आपातकालीन व शासकीय हेल्पलाइन' : 'Official Emergency Helplines'}</span>
              </div>
              <h4 className="text-lg font-black text-white">
                {language === 'hi' ? 'छात्र सुरक्षा एवं शासकीय सहायता नंबर' : '24x7 Student Safety & Support Helplines'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'किसी भी आपात स्थिति अथवा विभागीय जानकारी हेतु इन निशुल्क नंबरों पर संपर्क करें।'
                  : 'Toll-free government helplines for child rights, women safety, and basic education queries.'}
              </p>
            </div>

            {/* Helpline Number Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <div className="p-3 bg-gov-navy-900 rounded-2xl border border-gov-navy-800 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">{language === 'hi' ? 'चाइल्डलाइन' : 'Child Helpline'}</div>
                <div className="text-lg sm:text-xl font-black text-gov-amber-400 font-mono mt-0.5">1098</div>
                <div className="text-[10px] text-slate-400">{language === 'hi' ? 'बाल सुरक्षा' : 'Child Rights'}</div>
              </div>

              <div className="p-3 bg-gov-navy-900 rounded-2xl border border-gov-navy-800 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">{language === 'hi' ? 'महिला हेल्पलाइन' : 'Women Line'}</div>
                <div className="text-lg sm:text-xl font-black text-rose-400 font-mono mt-0.5">1090</div>
                <div className="text-[10px] text-slate-400">{language === 'hi' ? 'महिला सुरक्षा' : 'Women Safety'}</div>
              </div>

              <div className="p-3 bg-gov-navy-900 rounded-2xl border border-gov-navy-800 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">{language === 'hi' ? 'सीएम हेल्पलाइन' : 'CM Helpline'}</div>
                <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-0.5">1076</div>
                <div className="text-[10px] text-slate-400">{language === 'hi' ? 'जन शिकायत' : 'Grievance'}</div>
              </div>

              <div className="p-3 bg-gov-navy-900 rounded-2xl border border-gov-navy-800 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">{language === 'hi' ? 'आपातकालीन' : 'Emergency'}</div>
                <div className="text-lg sm:text-xl font-black text-blue-400 font-mono mt-0.5">112</div>
                <div className="text-[10px] text-slate-400">{language === 'hi' ? 'पुलिस / एम्बुलेंस' : 'Police/Medical'}</div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* School Timing & Location Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gov-amber-500 text-gov-navy-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-black text-gov-amber-700 uppercase tracking-wider">
                {language === 'hi' ? 'विद्यालय समय सारणी' : 'School Operational Timings'}
              </div>
              <h4 className="text-lg font-black text-slate-900 mt-0.5">
                08:30 AM — 03:00 PM (Monday to Saturday)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'hi' 
                  ? 'ग्रीष्मकालीन एवं शीतकालीन समय शासन के निर्देशानुसार परिवर्तित होता है।'
                  : 'Subject to seasonal timings and official gazetted holidays by UP Basic Shiksha Parishad.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-2.5 rounded-xl bg-gov-navy-950 hover:bg-gov-navy-900 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              {language === 'hi' ? 'संपर्क व मार्गदर्शन' : 'Contact & Location'}
            </button>
            <button
              onClick={() => onNavigate('documents')}
              className="px-5 py-2.5 rounded-xl bg-gov-amber-100 hover:bg-gov-amber-200 text-gov-amber-950 text-xs font-bold transition-all cursor-pointer"
            >
              {language === 'hi' ? 'अवकाश तालिका' : 'Holiday List'}
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Video Player Modal Lightbox */}
      {selectedVideoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedVideoModal(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/80">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    {selectedVideoModal.category} • {selectedVideoModal.albumName || 'Educational Showcase'}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-white truncate">
                    {language === 'hi' && selectedVideoModal.titleHi ? selectedVideoModal.titleHi : selectedVideoModal.titleEn}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedVideoModal(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="aspect-video bg-black relative">
              {(() => {
                const parsed = parseVideoUrl(selectedVideoModal.videoURL || (selectedVideoModal.youtubeId ? `https://youtube.com/watch?v=${selectedVideoModal.youtubeId}` : ''));
                if (parsed.embedUrl) {
                  return (
                    <iframe
                      src={`${parsed.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
                      title={selectedVideoModal.titleEn}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                } else if (selectedVideoModal.videoURL) {
                  return (
                    <video
                      src={selectedVideoModal.videoURL}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  );
                } else {
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                      <Film className="w-12 h-12 text-slate-600 mb-2" />
                      <p className="text-sm font-medium">Video player is preparing content.</p>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Modal Description & Action Bar */}
            <div className="p-5 bg-slate-900/90 border-t border-slate-800 space-y-3">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {language === 'hi' && selectedVideoModal.captionHi ? selectedVideoModal.captionHi : selectedVideoModal.captionEn || selectedVideoModal.titleEn}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="font-bold text-amber-400">Uploader:</span>
                  <span>{selectedVideoModal.uploaderName || 'Faculty Educator'}</span>
                  {selectedVideoModal.date && (
                    <>
                      <span>•</span>
                      <span>{selectedVideoModal.date}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedVideoModal(null);
                      onNavigate('gallery');
                    }}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{language === 'hi' ? 'पूरी गैलरी में देखें' : 'View Full Archive'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
