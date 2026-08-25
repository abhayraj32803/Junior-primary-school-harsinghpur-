import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Image as ImageIcon, 
  Calendar, 
  Tag, 
  X, 
  ShieldCheck, 
  ZoomIn, 
  Sparkles, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2, 
  Download, 
  Share2, 
  Filter, 
  Search, 
  UserCheck, 
  Star, 
  Camera, 
  Grid, 
  CheckCircle2, 
  SlidersHorizontal,
  Video,
  Film,
  Clock,
  ExternalLink,
  Youtube,
  Copy,
  Check,
  Flame,
  Lightbulb,
  BookOpenCheck,
  Monitor
} from 'lucide-react';
import { GalleryItem } from '../../types';
import { parseVideoUrl } from '../../utils/mediaUtils';

interface GalleryPageProps {
  onNavigate?: (page: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate }) => {
  const { gallery, language } = useSchool();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [uploaderTypeFilter, setUploaderTypeFilter] = useState<'all' | 'admin' | 'teacher'>('all');
  const [sortSequence, setSortSequence] = useState<'best_sequence' | 'latest_first' | 'featured_first'>('best_sequence');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Showcase Video Filter & Inline Playing State
  const [videoCategoryFilter, setVideoCategoryFilter] = useState<'all' | 'class13' | 'class45' | 'class68' | 'motivation' | 'smart'>('all');
  const [inlinePlayingVideoId, setInlinePlayingVideoId] = useState<string | null>(null);
  const [selectedVideoModal, setSelectedVideoModal] = useState<GalleryItem | null>(null);
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);

  // General Lightbox Modal State
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
  const [inlinePlayingId, setInlinePlayingId] = useState<string | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);

  // Hero Spotlight Carousel State
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  const categories = [
    { id: 'all', labelHi: 'सभी एल्बम (All Media)', labelEn: 'All Media' },
    { id: 'Educational & Motivation', labelHi: 'स्मार्ट क्लास व छात्र प्रेरणा वीडियो', labelEn: 'Smart Classes & Motivation' },
    { id: 'Classroom & Learning', labelHi: 'कक्षा शिक्षण व निपुण (Classrooms)', labelEn: 'Classroom & Learning' },
    { id: 'Sports & Playground', labelHi: 'खेलकूद एवं व्यायाम (Sports)', labelEn: 'Sports & Athletics' },
    { id: 'Cultural Activities', labelHi: 'सांस्कृतिक एवं बाल सभा (Cultural)', labelEn: 'Cultural & Bal Sabha' },
    { id: 'Independence & Republic Day', labelHi: 'स्वतंत्रता व गणतंत्र दिवस', labelEn: 'Republic & Independence' },
    { id: 'Mid-Day Meal', labelHi: 'मध्याह्न भोजन (PM POSHAN)', labelEn: 'Mid-Day Meal' },
    { id: 'School Building', labelHi: 'परिसर एवं भवन (Campus)', labelEn: 'Campus & Infrastructure' },
    { id: 'National Celebrations', labelHi: 'पर्यावरण व अन्य उत्सव', labelEn: 'Science & Environment' },
    { id: 'Teachers', labelHi: 'शिक्षक बैठक एवं कार्यशाला', labelEn: 'Faculty & Workshop' },
  ];

  // Public items only
  const publicGallery = useMemo(() => {
    return gallery.filter(item => item.isPublic !== false);
  }, [gallery]);

  // Educational and Motivational Videos for Showcase
  const educationalVideos = useMemo(() => {
    const allVideos = publicGallery.filter(item => 
      item.mediaType === 'video' || !!item.videoURL || !!item.youtubeId
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
  }, [publicGallery, videoCategoryFilter]);

  // Featured Spotlight Media for Hero Banner
  const featuredSpotlights = useMemo(() => {
    const featured = publicGallery.filter(item => item.isFeatured);
    return featured.length > 0 ? featured : publicGallery.slice(0, 4);
  }, [publicGallery]);

  // Auto-advance hero carousel
  useEffect(() => {
    if (isHeroPaused || featuredSpotlights.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % featuredSpotlights.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isHeroPaused, featuredSpotlights.length]);

  // Copy direct video URL handler
  const handleCopyLink = (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let urlToCopy = item.videoURL || '';
    if (!urlToCopy && item.youtubeId) {
      urlToCopy = `https://www.youtube.com/watch?v=${item.youtubeId}`;
    }
    if (!urlToCopy && (item.imageUrl || item.imageURL)) {
      urlToCopy = item.imageUrl || item.imageURL || '';
    }
    if (urlToCopy) {
      navigator.clipboard.writeText(urlToCopy).then(() => {
        setCopiedVideoId(item.id);
        setTimeout(() => setCopiedVideoId(null), 2500);
      }).catch(() => {
        // fallback
      });
    }
  };

  // Filter and Sequence Processed Media Items for General Grid
  const displayMedia = useMemo(() => {
    return publicGallery
      .filter(item => {
        const isEduCat = selectedCategory === 'Educational & Motivation';
        const matchesCat = selectedCategory === 'all' 
          ? true 
          : isEduCat 
            ? (item.mediaType === 'video' || item.category === 'Classroom & Learning' || item.albumName?.includes('Smart') || item.albumName?.includes('Class'))
            : item.category === selectedCategory;

        const matchesSearch = !searchQuery || 
          item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.titleHi && item.titleHi.includes(searchQuery)) ||
          (item.captionEn && item.captionEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.captionHi && item.captionHi.includes(searchQuery)) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.albumName && item.albumName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
          (item.uploaderName && item.uploaderName.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesMediaType = mediaTypeFilter === 'all' 
          ? true 
          : mediaTypeFilter === 'video'
            ? item.mediaType === 'video' || !!item.videoURL
            : item.mediaType === 'photo' || (!item.videoURL && item.mediaType !== 'video');

        const matchesUploader = uploaderTypeFilter === 'all'
          ? true
          : uploaderTypeFilter === 'admin'
            ? item.uploaderRole === 'Admin' || item.uploaderRole === 'Headmaster' || !item.uploaderRole
            : item.uploaderRole === 'Teacher';

        return matchesCat && matchesSearch && matchesMediaType && matchesUploader;
      })
      .sort((a, b) => {
        if (sortSequence === 'featured_first') {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        }
        if (sortSequence === 'latest_first') {
          return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
        }
        // 'best_sequence' as on official portal
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
  }, [publicGallery, selectedCategory, searchQuery, mediaTypeFilter, uploaderTypeFilter, sortSequence]);

  // Slideshow timer for Lightbox (Photo only mode)
  useEffect(() => {
    if (!isSlideshowPlaying || activeMediaIndex === null) return;
    const currentItem = displayMedia[activeMediaIndex];
    if (currentItem?.mediaType === 'video' || currentItem?.videoURL) return; // Don't auto-skip videos

    const timer = setInterval(() => {
      setActiveMediaIndex(prev => {
        if (prev === null) return 0;
        return (prev + 1) % displayMedia.length;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [isSlideshowPlaying, activeMediaIndex, displayMedia]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeMediaIndex === null) return;
      if (e.key === 'Escape') setActiveMediaIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveMediaIndex((activeMediaIndex + 1) % displayMedia.length);
      }
      if (e.key === 'ArrowLeft') {
        setActiveMediaIndex((activeMediaIndex - 1 + displayMedia.length) % displayMedia.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMediaIndex, displayMedia.length]);

  const activeMedia = activeMediaIndex !== null ? displayMedia[activeMediaIndex] : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-12 overflow-x-hidden">
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-black tracking-wide">
          <Camera className="w-4 h-4 text-amber-600" />
          <span>{language === 'hi' ? 'कंपोजिट विद्यालय आधिकारिक फोटो व वीडियो अभिलेखागार' : 'Institutional Photo & Video Archive'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
          {language === 'hi' ? 'सचित्र विद्यालय जीवन एवं शैक्षणिक वीडियो' : 'Campus Moments, Milestones & Videos'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
          {language === 'hi'
            ? 'प्रधानाध्यापिका एवं समस्त शिक्षक गण द्वारा संकलित राष्ट्रीय पर्वों, निपुण भारत बाल अधिगम, स्मार्ट क्लासरूम, खेलकूद एवं प्रेरक शैक्षणिक वीडियो की सजीव झांकी।'
            : 'Curated by the Headmaster and faculty teachers. Explore high-resolution visual archives, classroom video activities, motivational lessons, and celebrations in institutional sequence.'}
        </p>
      </div>

      {/* DEDICATED STUDENT INSPIRATION & SMART CLASSROOMS VIDEO SHOWCASE */}
      <section className="w-full">
        <div className="bg-gradient-to-br from-slate-900 via-gov-navy-950 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
          {/* Subtle Ambient Glowing Elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{language === 'hi' ? 'स्मार्ट शिक्षण एवं छात्र प्रेरणा' : 'Student Inspiration & Smart Learning'}</span>
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
                onClick={() => {
                  setMediaTypeFilter('video');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gov-navy-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>{language === 'hi' ? 'सभी वीडियो संग्रह' : 'View All Videos'}</span>
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
              const isCopied = copiedVideoId === video.id;

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
                            onClick={(e) => handleCopyLink(video, e)}
                            className="p-1.5 rounded-lg bg-black/80 hover:bg-slate-800 text-white/90 hover:text-white transition-all cursor-pointer backdrop-blur-xs border border-white/20"
                            title={isCopied ? 'Copied!' : 'Copy Link'}
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
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

                        {/* Copy Link button on Thumbnail overlay */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
                          <button
                            type="button"
                            onClick={(e) => handleCopyLink(video, e)}
                            className="p-1.5 rounded-lg bg-black/80 hover:bg-slate-900 text-slate-200 hover:text-white border border-white/20 transition-all cursor-pointer backdrop-blur-xs shadow-md"
                            title={isCopied ? (language === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link Copied!') : (language === 'hi' ? 'यूट्यूब लिंक कॉपी करें' : 'Copy Direct Link')}
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
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

                      {/* Action buttons: Copy Link & Play / Stop Toggle Control */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(video, e)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isCopied
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10'
                          }`}
                          title={language === 'hi' ? 'यूट्यूब लिंक कॉपी करें' : 'Copy Direct URL'}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                          <span>{isCopied ? (language === 'hi' ? 'कॉपी हुआ' : 'Copied!') : (language === 'hi' ? 'कॉपी' : 'Copy')}</span>
                        </button>

                        {isPlaying ? (
                          <div className="flex items-center gap-1.5">
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
                              <span>{language === 'hi' ? 'बंद करें' : 'Stop'}</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setInlinePlayingVideoId(video.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gov-navy-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-103"
                          >
                            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                            <span>{language === 'hi' ? 'चलाएं' : 'Play'}</span>
                          </button>
                        )}
                      </div>
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
            {onNavigate && (
              <button
                onClick={() => onNavigate('login-student')}
                className="px-4 py-2 rounded-xl bg-white text-gov-navy-950 hover:bg-amber-100 text-xs font-extrabold shrink-0 transition-all cursor-pointer shadow-sm"
              >
                {language === 'hi' ? 'छात्र पोर्टल में लॉगिन करें' : 'Student Portal Login'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Hero Spotlight Banner Carousel */}
      {featuredSpotlights.length > 0 && (
        <div 
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-800 group"
          onMouseEnter={() => setIsHeroPaused(true)}
          onMouseLeave={() => setIsHeroPaused(false)}
        >
          <div className="relative aspect-21/9 min-h-[340px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
            {featuredSpotlights.map((item, idx) => {
              const img = item.thumbnailURL || item.imageUrl || item.imageURL || '';
              const isVideo = item.mediaType === 'video' || !!item.videoURL;
              const isActive = idx === heroIndex;
              return (
                <div
                  key={item.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={img}
                    alt={item.titleEn}
                    className="w-full h-full object-cover brightness-[0.70]"
                    loading="lazy"
                  />
                  {/* Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

                  {/* Play Action Trigger on Center */}
                  {isVideo && (
                    <div 
                      onClick={() => {
                        const targetIdx = displayMedia.findIndex(m => m.id === item.id);
                        setActiveMediaIndex(targetIdx !== -1 ? targetIdx : 0);
                      }}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-white" />
                      </div>
                    </div>
                  )}

                  {/* Slide Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-20 max-w-3xl space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                        <Star className="w-3.5 h-3.5 fill-slate-950" />
                        {language === 'hi' ? 'प्रमुख गतिविधि (Spotlight)' : 'Featured Spotlight'}
                      </span>
                      {isVideo ? (
                        <span className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-black flex items-center gap-1">
                          <Video className="w-3.5 h-3.5" /> Video Record
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-xs font-bold">
                          {item.category}
                        </span>
                      )}
                      {item.duration && (
                        <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-rose-300 text-xs font-mono font-bold">
                          {item.duration}
                        </span>
                      )}
                      {item.date && (
                        <span className="px-3 py-1 rounded-lg bg-black/40 backdrop-blur-md text-slate-300 text-xs font-mono">
                          {item.date}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-3xl font-black text-white leading-snug drop-shadow-md">
                      {language === 'hi' && item.titleHi ? item.titleHi : item.titleEn}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed drop-shadow-xs max-w-2xl">
                      {language === 'hi' && item.captionHi ? item.captionHi : item.captionEn || item.titleEn}
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                      {item.uploaderName && (
                        <div className="text-[11px] text-amber-300 flex items-center gap-1.5 font-semibold">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Uploaded by: {item.uploaderName}</span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const targetIdx = displayMedia.findIndex(m => m.id === item.id);
                          setActiveMediaIndex(targetIdx !== -1 ? targetIdx : 0);
                        }}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {isVideo ? <Play className="w-3.5 h-3.5 fill-white" /> : <ZoomIn className="w-3.5 h-3.5" />}
                        <span>{isVideo ? (language === 'hi' ? 'वीडियो देखें' : 'Watch Video') : (language === 'hi' ? 'फोटो देखें' : 'View Photo')}</span>
                      </button>
                      {isVideo && (
                        <button
                          onClick={(e) => handleCopyLink(item, e)}
                          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Copy Link"
                        >
                          {copiedVideoId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedVideoId === item.id ? 'Copied!' : 'Copy Link'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Left / Right Carousel Controls */}
            <button
              onClick={() => setHeroIndex((heroIndex - 1 + featuredSpotlights.length) % featuredSpotlights.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-amber-500 hover:text-slate-950 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg"
              title="Previous Item"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setHeroIndex((heroIndex + 1) % featuredSpotlights.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-amber-500 hover:text-slate-950 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg"
              title="Next Item"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-4 right-6 z-30 flex items-center gap-2">
              {featuredSpotlights.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === heroIndex ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'फोटो, वीडियो, शिक्षक या गतिविधि खोजें...' : 'Search media by event, tag or faculty...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Media Type Tabs: All / Photos / Videos */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setMediaTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mediaTypeFilter === 'all' ? 'bg-white text-slate-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'hi' ? 'सभी मीडिया' : 'All Media'}
              </button>

              <button
                onClick={() => setMediaTypeFilter('photo')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mediaTypeFilter === 'photo' ? 'bg-white text-slate-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'hi' ? 'फोटो' : 'Photos'}</span>
              </button>

              <button
                onClick={() => setMediaTypeFilter('video')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mediaTypeFilter === 'video' ? 'bg-rose-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'वीडियो' : 'Videos'}</span>
              </button>
            </div>

            {/* Uploader Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setUploaderTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  uploaderTypeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Sources
              </button>
              <button
                onClick={() => setUploaderTypeFilter('teacher')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  uploaderTypeFilter === 'teacher' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Faculty Uploads
              </button>
              <button
                onClick={() => setUploaderTypeFilter('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  uploaderTypeFilter === 'admin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Headmaster Archive
              </button>
            </div>

            {/* Sequence Selector */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={sortSequence}
                onChange={(e) => setSortSequence(e.target.value as any)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-amber-500"
              >
                <option value="best_sequence">Portal Sequence (सर्वश्रेष्ठ शासकीय क्रम)</option>
                <option value="featured_first">Spotlights First (प्रमुख पहले)</option>
                <option value="latest_first">Latest Date (नवीनतम पहले)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-2 border-t border-slate-100">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {language === 'hi' ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid in Best Institutional Sequence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayMedia.map((item, index) => {
          const img = item.thumbnailURL || item.imageUrl || item.imageURL || '';
          const isVideo = item.mediaType === 'video' || !!item.videoURL;
          const isPlaying = isVideo && inlinePlayingId === item.id;
          const parsed = isVideo ? parseVideoUrl(item.videoURL || (item.youtubeId ? `https://youtube.com/watch?v=${item.youtubeId}` : '')) : null;
          const isCopied = copiedVideoId === item.id;

          return (
            <div 
              key={item.id}
              className={`group bg-white rounded-3xl border shadow-xs hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between ${
                isPlaying ? 'border-rose-500 ring-2 ring-rose-400/30' : 'border-slate-200 hover:border-amber-400'
              }`}
            >
              {/* Media Aspect Container: Live Video Player or Image Thumbnail */}
              <div className="aspect-4/3 overflow-hidden relative bg-slate-950">
                {isPlaying && parsed ? (
                  <div className="w-full h-full relative bg-black">
                    {parsed.embedUrl ? (
                      <iframe
                        src={`${parsed.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
                        title={item.titleEn}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : item.videoURL ? (
                      <video
                        src={item.videoURL}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs">
                        Loading video...
                      </div>
                    )}

                    {/* Top Overlay controls */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(item, e)}
                        className="p-1.5 rounded-lg bg-black/80 hover:bg-slate-800 text-white transition-colors cursor-pointer border border-white/20"
                        title={isCopied ? 'Copied!' : 'Copy Link'}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMediaIndex(index)}
                        className="p-1.5 rounded-lg bg-black/80 hover:bg-slate-800 text-white transition-colors cursor-pointer border border-white/20"
                        title="Expand Full View"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setInlinePlayingId(null)}
                        className="p-1.5 rounded-lg bg-black/80 hover:bg-rose-600 text-white transition-colors cursor-pointer border border-white/20"
                        title="Stop Video"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      if (isVideo) {
                        setInlinePlayingId(item.id);
                      } else {
                        setActiveMediaIndex(index);
                      }
                    }}
                    className="w-full h-full relative cursor-pointer"
                  >
                    <img 
                      src={img} 
                      alt={item.titleEn}
                      className="w-full h-full object-cover transform scale-100 group-hover:scale-108 transition-transform duration-600 ease-out opacity-90 group-hover:opacity-100"
                      loading="lazy"
                    />

                    {/* Sequence & Category Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                      <span className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-amber-300 text-[10px] font-mono font-bold">
                        #{index + 1}
                      </span>
                      {item.targetClass && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-gov-navy-950 text-[10px] font-black shadow-xs">
                          🎯 {item.targetClass}
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                        {item.category}
                      </span>
                      {isVideo && (
                        <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-black flex items-center gap-1 shadow-xs">
                          <Video className="w-2.5 h-2.5" /> Video
                        </span>
                      )}
                    </div>

                    {/* Video Duration Badge */}
                    {isVideo && item.duration && (
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold z-10">
                        {item.duration}
                      </div>
                    )}

                    {/* Featured Star Badge */}
                    {item.isFeatured && (
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-xs">
                          <Star className="w-2.5 h-2.5 fill-slate-950" /> Featured
                        </span>
                      </div>
                    )}

                    {/* Hover Play / Zoom Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <span className={`p-3 rounded-2xl font-black shadow-lg transform group-hover:scale-110 transition-transform ${
                        isVideo ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                      }`}>
                        {isVideo ? <Play className="w-6 h-6 ml-0.5 fill-white" /> : <ZoomIn className="w-5 h-5" />}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Meta Content */}
              <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{item.date || 'School Event'}</span>
                    </span>
                    {item.uploaderName && (
                      <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[130px]">
                        {item.uploaderName}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors pt-0.5">
                    {language === 'hi' && item.titleHi ? item.titleHi : item.titleEn}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {language === 'hi' && item.captionHi ? item.captionHi : item.captionEn || item.titleEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-amber-600">
                  {isPlaying ? (
                    <button
                      type="button"
                      onClick={() => setInlinePlayingId(null)}
                      className="flex items-center gap-1 text-rose-600 hover:text-rose-700 cursor-pointer font-bold"
                    >
                      <Pause className="w-3 h-3 fill-current" />
                      <span>{language === 'hi' ? 'वीडियो बंद करें' : 'Stop Video'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isVideo) {
                            setInlinePlayingId(item.id);
                          } else {
                            setActiveMediaIndex(index);
                          }
                        }}
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        {isVideo ? <Play className="w-3 h-3 text-rose-600 fill-rose-600" /> : null}
                        <span>{isVideo ? (language === 'hi' ? 'चलाएं' : 'Play') : (language === 'hi' ? 'पूरा चित्र' : 'View Full')}</span>
                        <span>&rarr;</span>
                      </button>
                      {isVideo && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(item, e)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isCopied ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Copy Direct Link"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Copied' : 'Link'}</span>
                        </button>
                      )}
                    </div>
                  )}
                  <span className="text-slate-400 font-mono text-[10px]">{isVideo ? 'HD VIDEO' : 'HD'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayMedia.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">{language === 'hi' ? 'कोई मीडिया नहीं मिला' : 'No media items found'}</h3>
          <p className="text-xs text-slate-500">{language === 'hi' ? 'कृपया अन्य श्रेणी या खोज शब्द चुनें।' : 'Please choose another category or clear your search query.'}</p>
        </div>
      )}

      {/* Child Privacy & Safety Banner */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-5 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900">{language === 'hi' ? 'बाल सुरक्षा एवं निजता नीति (Child Protection & Privacy Standard)' : 'Institutional Child Safety & Privacy Policy'}</div>
          <p className="text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'विद्यालय पोर्टल पर प्रदर्शित समस्त चित्र एवं वीडियो शैक्षणिक गतिविधियों, क्रीड़ा एवं राष्ट्रीय पर्वों के आधिकारिक अभिलेख हैं। सभी शिक्षकों द्वारा केवल अधिकृत सामग्री ही अपलोड की जाती है।'
              : 'All media hosted on this portal are official archival records of pedagogical, athletic, and national ceremonies approved by the school administration.'}
          </p>
        </div>
      </div>

      {/* DEDICATED SHOWCASE VIDEO MODAL */}
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleCopyLink(selectedVideoModal, e)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedVideoId === selectedVideoModal.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedVideoId === selectedVideoModal.id ? 'Copied' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={() => setSelectedVideoModal(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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

                {selectedVideoModal.targetClass && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-gov-navy-950 font-bold">
                    🎯 {selectedVideoModal.targetClass}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE FULLSCREEN LIGHTBOX & GENERAL VIDEO PLAYER MODAL */}
      {activeMedia && activeMediaIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 text-white animate-fade-in"
          onClick={() => setActiveMediaIndex(null)}
        >
          {/* Top Control Bar */}
          <div className="flex items-center justify-between z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-mono text-xs font-black">
                {activeMediaIndex + 1} / {displayMedia.length}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                {activeMedia.category}
              </span>
              {activeMedia.mediaType === 'video' || activeMedia.videoURL ? (
                <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center gap-1">
                  <Video className="w-3 h-3" /> Video Playback
                </span>
              ) : null}
              {activeMedia.isFeatured && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-300" /> Featured
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Copy Link Button in Lightbox */}
              {(activeMedia.videoURL || activeMedia.mediaType === 'video') && (
                <button
                  onClick={(e) => handleCopyLink(activeMedia, e)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
                  title="Copy Video Link"
                >
                  {copiedVideoId === activeMedia.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedVideoId === activeMedia.id ? 'Copied' : 'Copy Link'}</span>
                </button>
              )}

              {/* Slideshow Play/Pause (only for photo stream) */}
              {!activeMedia.videoURL && activeMedia.mediaType !== 'video' && (
                <button
                  onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSlideshowPlaying ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isSlideshowPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
                >
                  {isSlideshowPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isSlideshowPlaying ? 'Pause' : 'Slideshow'}</span>
                </button>
              )}

              <button
                onClick={() => setActiveMediaIndex(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                title="Close Viewer (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Media Stage with Prev/Next Navigation */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveMediaIndex((activeMediaIndex - 1 + displayMedia.length) % displayMedia.length)}
              className="absolute left-2 sm:left-6 z-20 w-12 h-12 rounded-2xl bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-2xl"
              title="Previous (Left Arrow)"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>

            {/* Video vs Photo Rendering */}
            {activeMedia.mediaType === 'video' || activeMedia.videoURL ? (
              <div className="w-full max-w-4xl aspect-16/9 bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                {(() => {
                  const videoInfo = parseVideoUrl(activeMedia.videoURL || (activeMedia.youtubeId ? `https://youtube.com/watch?v=${activeMedia.youtubeId}` : ''));
                  if (videoInfo.type === 'youtube' && videoInfo.videoId) {
                    return (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoInfo.videoId}?autoplay=1&rel=0`}
                        title={activeMedia.titleEn}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    );
                  }
                  if (videoInfo.type === 'drive' && videoInfo.embedUrl) {
                    return (
                      <iframe
                        src={videoInfo.embedUrl}
                        title={activeMedia.titleEn}
                        className="w-full h-full border-0"
                        allow="autoplay"
                        allowFullScreen
                      />
                    );
                  }
                  return (
                    <video
                      src={activeMedia.videoURL || ''}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  );
                })()}
              </div>
            ) : (
              <img 
                src={activeMedia.imageUrl || activeMedia.imageURL} 
                alt={activeMedia.titleEn}
                className="max-h-[68vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-all duration-300"
              />
            )}

            <button
              onClick={() => setActiveMediaIndex((activeMediaIndex + 1) % displayMedia.length)}
              className="absolute right-2 sm:right-6 z-20 w-12 h-12 rounded-2xl bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-2xl"
              title="Next (Right Arrow)"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>

          {/* Bottom Info & Thumbnail Strip */}
          <div className="max-w-4xl mx-auto w-full space-y-3 z-10" onClick={(e) => e.stopPropagation()}>
            <div className="text-center space-y-1 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                {language === 'hi' && activeMedia.titleHi ? activeMedia.titleHi : activeMedia.titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                {language === 'hi' && activeMedia.captionHi ? activeMedia.captionHi : activeMedia.captionEn || activeMedia.titleEn}
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-amber-400 font-semibold pt-1 flex-wrap">
                {activeMedia.duration && <span className="font-mono text-rose-300">Duration: {activeMedia.duration}</span>}
                {activeMedia.date && <span>Date: {activeMedia.date}</span>}
                {activeMedia.uploaderName && <span>Uploaded by: {activeMedia.uploaderName}</span>}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar justify-center">
              {displayMedia.map((item, idx) => {
                const img = item.thumbnailURL || item.imageUrl || item.imageURL || '';
                const isSelected = idx === activeMediaIndex;
                const isVid = item.mediaType === 'video' || !!item.videoURL;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`w-14 h-11 rounded-xl overflow-hidden shrink-0 border-2 relative transition-all cursor-pointer ${
                      isSelected ? 'border-amber-400 scale-105 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={item.titleEn} className="w-full h-full object-cover" />
                    {isVid && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
