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
  Youtube
} from 'lucide-react';
import { GalleryItem } from '../../types';
import { parseVideoUrl } from '../../utils/mediaUtils';

export const GalleryPage: React.FC = () => {
  const { gallery, language } = useSchool();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [uploaderTypeFilter, setUploaderTypeFilter] = useState<'all' | 'admin' | 'teacher'>('all');
  const [sortSequence, setSortSequence] = useState<'best_sequence' | 'latest_first' | 'featured_first'>('best_sequence');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lightbox / Video Player Modal State
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
  const [inlinePlayingId, setInlinePlayingId] = useState<string | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);

  // Hero Spotlight Carousel State
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  const categories = [
    { id: 'all', labelHi: 'सभी एल्बम (All Media)', labelEn: 'All Media' },
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

  // Filter and Sequence Processed Media Items
  const displayMedia = useMemo(() => {
    return publicGallery
      .filter(item => {
        const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
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
            ? 'प्रधानाध्यापिका एवं समस्त शिक्षक गण द्वारा संकलित राष्ट्रीय पर्वों, निपुण भारत बाल अधिगम, खेलकूद, मध्याह्न भोजन एवं शैक्षणिक वीडियो की सजीव झांकी।'
            : 'Curated by the Headmaster and faculty teachers. Explore high-resolution visual archives, classroom video activities, and celebrations in institutional sequence.'}
        </p>
      </div>

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
                      <span>{isVideo ? (language === 'hi' ? 'सीधे वीडियो चलाएं' : 'Play Video') : (language === 'hi' ? 'पूरा चित्र देखें' : 'View Full Picture')}</span>
                      <span>&rarr;</span>
                    </button>
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

      {/* INTERACTIVE FULLSCREEN LIGHTBOX & VIDEO PLAYER MODAL */}
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
                  const videoInfo = parseVideoUrl(activeMedia.videoURL || '');
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
