import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { GalleryItem } from '../../types';
import { 
  Video, 
  Plus, 
  Play, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles, 
  BookOpenCheck, 
  Lightbulb, 
  Flame, 
  Compass, 
  ExternalLink, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Film, 
  Layers, 
  Info, 
  Check, 
  Youtube,
  GraduationCap,
  Clock,
  Tag,
  Copy
} from 'lucide-react';

interface AdminEducationalVideosProps {
  onSaveNotice?: (msg: string) => void;
}

// Preset Curated Educational Videos for Classes 1 to 8
const CURATED_PRESET_VIDEOS: Omit<GalleryItem, 'id'>[] = [
  {
    titleHi: 'रोचक हिंदी वर्णमाला, स्वर-व्यंजन एवं सचित्र बालगीत (कक्षा 1-3)',
    titleEn: 'Hindi Alphabet Phonics & Illustrated Rhymes (Class 1-3)',
    captionHi: 'रंग-बिरंगे 3D एनिमेशन, चित्रों और मधुर बालगीतों के साथ अक्षर ज्ञान व शब्द निर्माण—निपुण भारत FLN मिशन के अंतर्गत बच्चों को बहुत आसानी से समझ आता है।',
    captionEn: 'Fun animated rhymes and phonetic illustrations for foundational literacy (FLN).',
    category: 'Classroom & Learning',
    mediaType: 'video',
    videoSource: 'youtube',
    youtubeId: 'kY31Q_zS9wU',
    videoURL: 'https://www.youtube.com/watch?v=kY31Q_zS9wU',
    thumbnailURL: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    imageURL: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    duration: '06:45',
    date: '2026-08-20',
    isPublic: true,
    isFeatured: true,
    sortOrder: 1,
    privacyApproved: true,
    albumName: 'कक्षा 1-3 निपुण भारत FLN',
    targetClass: 'Class 1-3',
    ageGroup: 'Age 5-8 yrs (कक्षा 1-3)',
    tags: ['Class1to3', 'FLN', 'Varnamala', 'HindiBalgeet', 'NIPUN']
  },
  {
    titleHi: 'पंचतंत्र सचित्र बाल कहानी - चतुर खरगोश और शेर (कक्षा 1-3)',
    titleEn: 'Panchatantra Moral Story - Clever Rabbit & Lion (Class 1-3)',
    captionHi: 'रोचक कार्टून एनिमेशन द्वारा बच्चों को संकट में बुद्धि और सूझबूझ से काम लेने की आसान सीख। नैतिक शिक्षा व भाषा विकास।',
    captionEn: 'Moral animation story teaching wit over brute force for primary grades.',
    category: 'Classroom & Learning',
    mediaType: 'video',
    videoSource: 'youtube',
    youtubeId: 'dQw4w9WgXcQ',
    videoURL: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailURL: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
    imageURL: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
    duration: '08:20',
    date: '2026-08-19',
    isPublic: true,
    isFeatured: true,
    sortOrder: 2,
    privacyApproved: true,
    albumName: 'कक्षा 1-3 नैतिक बाल कहानियां',
    targetClass: 'Class 1-3',
    ageGroup: 'Age 5-8 yrs (कक्षा 1-3)',
    tags: ['Class1to3', 'MoralStories', 'Panchatantra', 'Balgeet']
  },
  {
    titleHi: 'बारिश कैसे होती है? जल चक्र की सरल एनिमेटेड कहानी (कक्षा 4-5)',
    titleEn: 'How Rain Happens - Water Cycle Animated Science (Class 4-5)',
    captionHi: 'सूरज की धूप, भाप (वाष्पीकरण), बादल बनना और बारिश की बूंदें—प्राथमिक स्तर के विद्यार्थियों के लिए सचित्र एनिमेटेड विज्ञान पाठ।',
    captionEn: 'Simple animated explanation of evaporation, condensation, and rain precipitation.',
    category: 'Classroom & Learning',
    mediaType: 'video',
    videoSource: 'youtube',
    youtubeId: 'ncORPosDrjI',
    videoURL: 'https://www.youtube.com/watch?v=ncORPosDrjI',
    thumbnailURL: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80',
    imageURL: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80',
    duration: '05:30',
    date: '2026-08-18',
    isPublic: true,
    isFeatured: true,
    sortOrder: 3,
    privacyApproved: true,
    albumName: 'कक्षा 4-5 पर्यावरण व विज्ञान',
    targetClass: 'Class 4-5',
    ageGroup: 'Age 8-11 yrs (कक्षा 4-5)',
    tags: ['Class4to5', 'EVS', 'WaterCycle', 'ScienceFun']
  },
  {
    titleHi: 'खेल-खेल में गणित: 2 से 10 तक पहाड़े व आसान जोड़-घटाव (कक्षा 4-5)',
    titleEn: 'Fun Math Magic: Fast Tables & Addition Tricks (Class 4-5)',
    captionHi: 'सेब, टॉफी और खेल के मॉडल्स के माध्यम से पहाड़े याद करने का सबसे आसान व डर-मुक्त तरीका। मनोरंजक गणितीय गतिविधियां।',
    captionEn: 'Visual arithmetic games and fast multiplication techniques for primary learners.',
    category: 'Classroom & Learning',
    mediaType: 'video',
    videoSource: 'youtube',
    youtubeId: 'e-ORhEE9VVg',
    videoURL: 'https://www.youtube.com/watch?v=e-ORhEE9VVg',
    thumbnailURL: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    imageURL: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    duration: '07:15',
    date: '2026-08-17',
    isPublic: true,
    isFeatured: true,
    sortOrder: 4,
    privacyApproved: true,
    albumName: 'कक्षा 4-5 गणितीय जादू',
    targetClass: 'Class 4-5',
    ageGroup: 'Age 8-11 yrs (कक्षा 4-5)',
    tags: ['Class4to5', 'MathFun', 'Tables', 'PrimaryMath']
  },
  {
    titleHi: 'सरल एवं सुरक्षित विज्ञान प्रयोग: वायुदाब एवं चुंबक का जादू (कक्षा 6-8)',
    titleEn: 'Hands-On Science Lab: Air Pressure & Magnetism (Class 6-8)',
    captionHi: 'प्लास्टिक की बोतल, गुब्बारे और चुंबक की मदद से वायुदाब (हवा का दबाव) व आकर्षण-प्रतिकर्षण का आँखों देखा रोमांचक प्रयोग।',
    captionEn: 'Safe interactive science laboratory demonstrations explaining air pressure and magnetic fields.',
    category: 'Classroom & Learning',
    mediaType: 'video',
    videoSource: 'youtube',
    youtubeId: '3JZ_D3ELwOQ',
    videoURL: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
    thumbnailURL: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    imageURL: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    duration: '09:40',
    date: '2026-08-16',
    isPublic: true,
    isFeatured: true,
    sortOrder: 5,
    privacyApproved: true,
    albumName: 'कक्षा 6-8 विज्ञान प्रयोगशाला',
    targetClass: 'Class 6-8',
    ageGroup: 'Age 11-14 yrs (कक्षा 6-8)',
    tags: ['Class6to8', 'ScienceLab', 'Experiments', 'Physics']
  },
  {
    titleHi: 'हमारा सौरमंडल एवं चंद्रयान 3: ग्रहों की रोमांचक यात्रा (कक्षा 6-8)',
    titleEn: 'Our Solar System & Chandrayaan 3 Space Journey (Class 6-8)',
    captionHi: 'दिन-रात कैसे होते हैं, 8 ग्रह, सूर्य, चंद्रमा और भारत के ऐतिहासिक इसरो चंद्रयान 3 मिशन की 3D सचित्र जानकारी।',
    captionEn: 'Educational visual guide to 8 planets, moon orbit, and ISRO Chandrayaan mission.',
    category: 'Classroom & Learning',
    mediaType: 'video',
    videoSource: 'youtube',
    youtubeId: 'kJQP7kiw5Fk',
    videoURL: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    thumbnailURL: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    imageURL: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    duration: '11:20',
    date: '2026-08-15',
    isPublic: true,
    isFeatured: true,
    sortOrder: 6,
    privacyApproved: true,
    albumName: 'कक्षा 6-8 खगोल विज्ञान व अंतरिक्ष',
    targetClass: 'Class 6-8',
    ageGroup: 'Age 11-14 yrs (कक्षा 6-8)',
    tags: ['Class6to8', 'Space', 'ISRO', 'SolarSystem', 'Astronomy']
  },
  {
    titleHi: 'भारतरत्न डॉ. एपीजे अब्दुल कलाम के 4 स्वर्णिम नियम (सभी कक्षाएं 1 से 8)',
    titleEn: 'Dr. APJ Abdul Kalam: 4 Golden Rules for Student Success (Class 1-8)',
    captionHi: '1. महान लक्ष्य तय करना, 2. निरंतर ज्ञान अर्जित करना, 3. कठिन परिश्रम, 4. बाधाओं से कभी हार न मानना। विद्यार्थियों के लिए प्रेरणादायक संदेश।',
    captionEn: 'Inspiring guidance on goal setting, continuous learning, perseverance, and triumph over challenges.',
    category: 'Classroom & Learning',
    mediaType: 'video',
    videoSource: 'youtube',
    youtubeId: '9bZkp7q19f0',
    videoURL: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    thumbnailURL: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    imageURL: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    duration: '04:50',
    date: '2026-08-14',
    isPublic: true,
    isFeatured: true,
    sortOrder: 7,
    privacyApproved: true,
    albumName: 'डॉ. कलाम प्रेरणादायक विचार',
    targetClass: 'Class 1-8',
    ageGroup: 'All Students (कक्षा 1-8)',
    tags: ['Motivation', 'DrKalam', 'StudentInspiration', 'Success']
  },
  {
    titleHi: '3D डिजिटल स्मार्ट क्लासरूम में इंटरएक्टिव शिक्षण (कक्षा 1-8)',
    titleEn: 'Interactive Learning in 3D Smart Digital Classroom (Class 1-8)',
    captionHi: 'कंपोजिट विद्यालय हरसिंहपुर गोवा में डिजिटल टच बोर्ड और 3D मॉडल्स द्वारा पढ़ाई—खेल-खेल में कठिन विषयों की आसान समझ।',
    captionEn: 'Demonstration of interactive smartboard tools transforming school curriculum.',
    category: 'Classroom & Learning',
    mediaType: 'video',
    videoSource: 'youtube',
    youtubeId: '7wtfhZwyrcc',
    videoURL: 'https://www.youtube.com/watch?v=7wtfhZwyrcc',
    thumbnailURL: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    imageURL: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    duration: '08:30',
    date: '2026-08-12',
    isPublic: true,
    isFeatured: true,
    sortOrder: 8,
    privacyApproved: true,
    albumName: 'स्मार्ट क्लासरूम प्रदर्शनी',
    targetClass: 'Class 1-8',
    ageGroup: 'All Students (कक्षा 1-8)',
    tags: ['SmartClass', 'InteractiveBoard', 'DigitalEducation']
  }
];

// Helper to extract YouTube Video ID from any URL format
function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  
  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Match youtube.com/watch?v=ID or youtu.be/ID or youtube.com/embed/ID or shorts/ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : '';
}

export const AdminEducationalVideos: React.FC<AdminEducationalVideosProps> = ({ onSaveNotice }) => {
  const { gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem, reorderGalleryItems, language } = useSchool();
  const { userProfile } = useAuth();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<'all' | 'class13' | 'class45' | 'class68' | 'motivation' | 'smart'>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<GalleryItem | null>(null);
  const [previewModalVideo, setPreviewModalVideo] = useState<GalleryItem | null>(null);

  // Form State
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formExtractedId, setFormExtractedId] = useState('');
  const [formTitleHi, setFormTitleHi] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formCaptionHi, setFormCaptionHi] = useState('');
  const [formCaptionEn, setFormCaptionEn] = useState('');
  const [formTargetClass, setFormTargetClass] = useState<'Class 1-3' | 'Class 4-5' | 'Class 6-8' | 'Class 1-8'>('Class 1-3');
  const [formAgeGroup, setFormAgeGroup] = useState('Age 5-8 yrs (कक्षा 1-3)');
  const [formDuration, setFormDuration] = useState('05:30');
  const [formAlbumName, setFormAlbumName] = useState('कक्षा 1-8 शैक्षिक वीडियो');
  const [formTags, setFormTags] = useState('Class1to3, FLN, Education');
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(true);
  const [formThumbnailCustom, setFormThumbnailCustom] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);

  // Helper to copy direct YouTube video URL to clipboard
  const handleCopyLink = async (
    videoOrPreset: { id?: string; youtubeId?: string; videoURL?: string; titleHi?: string; titleEn?: string },
    identifier?: string
  ) => {
    const idKey = identifier || videoOrPreset.id || videoOrPreset.youtubeId || 'temp';
    const ytId = videoOrPreset.youtubeId || extractYouTubeId(videoOrPreset.videoURL || '');
    const url = ytId ? `https://www.youtube.com/watch?v=${ytId}` : videoOrPreset.videoURL || '';

    if (!url) {
      alert(language === 'hi' ? 'कोई वैध यूट्यूब लिंक उपलब्ध नहीं है।' : 'No valid YouTube link available.');
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopiedVideoId(idKey);
      if (onSaveNotice) {
        onSaveNotice(
          language === 'hi'
            ? `यूट्यूब लिंक कॉपी किया गया: ${url}`
            : `YouTube link copied: ${url}`
        );
      }

      setTimeout(() => {
        setCopiedVideoId(prev => (prev === idKey ? null : prev));
      }, 2500);
    } catch (err) {
      console.error('Failed to copy YouTube link:', err);
    }
  };

  // All Educational & Motivational Videos in the Gallery
  const educationalVideos = useMemo(() => {
    return gallery
      .filter(item => item.mediaType === 'video' || !!item.youtubeId || !!item.videoURL)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [gallery]);

  // Filtered list
  const filteredVideos = useMemo(() => {
    return educationalVideos.filter(v => {
      // Class level filter
      let matchesClass = true;
      if (classFilter === 'class13') {
        matchesClass = v.targetClass === 'Class 1-3' || (v.tags && v.tags.includes('Class1to3')) || (v.albumName && v.albumName.includes('1-3'));
      } else if (classFilter === 'class45') {
        matchesClass = v.targetClass === 'Class 4-5' || (v.tags && v.tags.includes('Class4to5')) || (v.albumName && v.albumName.includes('4-5'));
      } else if (classFilter === 'class68') {
        matchesClass = v.targetClass === 'Class 6-8' || (v.tags && v.tags.includes('Class6to8')) || (v.albumName && v.albumName.includes('6-8'));
      } else if (classFilter === 'motivation') {
        matchesClass = v.targetClass === 'Class 1-8' || (v.tags && v.tags.includes('Motivation')) || (v.titleEn?.toLowerCase().includes('kalam'));
      } else if (classFilter === 'smart') {
        matchesClass = (v.tags && v.tags.includes('SmartClass')) || (v.titleEn?.toLowerCase().includes('smart'));
      }

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        v.titleHi?.toLowerCase().includes(q) ||
        v.titleEn?.toLowerCase().includes(q) ||
        v.captionHi?.toLowerCase().includes(q) ||
        v.captionEn?.toLowerCase().includes(q) ||
        v.albumName?.toLowerCase().includes(q) ||
        v.targetClass?.toLowerCase().includes(q) ||
        v.tags?.some(t => t.toLowerCase().includes(q));

      return matchesClass && matchesSearch;
    });
  }, [educationalVideos, classFilter, searchQuery]);

  // Auto-extract YouTube ID when URL changes in form
  const handleUrlChange = (val: string) => {
    setFormYoutubeUrl(val);
    const id = extractYouTubeId(val);
    setFormExtractedId(id);
    if (id && !formThumbnailCustom) {
      setFormThumbnailCustom(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
    }
  };

  // Open Form to Add New Video
  const handleOpenAddForm = () => {
    setEditingVideo(null);
    setFormYoutubeUrl('');
    setFormExtractedId('');
    setFormTitleHi('');
    setFormTitleEn('');
    setFormCaptionHi('');
    setFormCaptionEn('');
    setFormTargetClass('Class 1-3');
    setFormAgeGroup('Age 5-8 yrs (कक्षा 1-3)');
    setFormDuration('05:30');
    setFormAlbumName('कक्षा 1-3 निपुण भारत FLN');
    setFormTags('Class1to3, FLN, Education, Balgeet');
    setFormIsPublic(true);
    setFormIsFeatured(true);
    setFormThumbnailCustom('');
    setIsFormOpen(true);
  };

  // Open Form to Edit Existing Video
  const handleOpenEditForm = (item: GalleryItem) => {
    setEditingVideo(item);
    const ytId = item.youtubeId || extractYouTubeId(item.videoURL || '');
    setFormYoutubeUrl(item.videoURL || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : ''));
    setFormExtractedId(ytId);
    setFormTitleHi(item.titleHi || '');
    setFormTitleEn(item.titleEn || '');
    setFormCaptionHi(item.captionHi || '');
    setFormCaptionEn(item.captionEn || '');
    setFormTargetClass((item.targetClass as any) || 'Class 1-3');
    setFormAgeGroup(item.ageGroup || 'All Students (कक्षा 1-8)');
    setFormDuration(item.duration || '05:00');
    setFormAlbumName(item.albumName || 'Educational Series');
    setFormTags(item.tags ? item.tags.join(', ') : 'Education');
    setFormIsPublic(item.isPublic !== false);
    setFormIsFeatured(Boolean(item.isFeatured));
    setFormThumbnailCustom(item.thumbnailURL || item.imageUrl || item.imageURL || '');
    setIsFormOpen(true);
  };

  // Save Form (Create or Update)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formExtractedId && !formYoutubeUrl.trim()) {
      alert('कृपया एक वैध यूट्यूब वीडियो लिंक या 11-अक्षरों का Video ID दर्ज करें।');
      return;
    }

    if (!formTitleHi.trim() && !formTitleEn.trim()) {
      alert('कृपया वीडियो का शीर्षक दर्ज करें।');
      return;
    }

    setIsSaving(true);
    try {
      const ytId = formExtractedId || extractYouTubeId(formYoutubeUrl);
      const thumbnail = formThumbnailCustom || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80');
      const tagArray = formTags.split(',').map(t => t.trim()).filter(Boolean);

      const videoData: Omit<GalleryItem, 'id'> = {
        titleHi: formTitleHi.trim() || formTitleEn.trim(),
        titleEn: formTitleEn.trim() || formTitleHi.trim(),
        captionHi: formCaptionHi.trim(),
        captionEn: formCaptionEn.trim(),
        category: 'Classroom & Learning',
        mediaType: 'video',
        videoSource: 'youtube',
        youtubeId: ytId,
        videoURL: formYoutubeUrl.trim() || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : ''),
        thumbnailURL: thumbnail,
        imageUrl: thumbnail,
        imageURL: thumbnail,
        duration: formDuration.trim() || '05:00',
        date: editingVideo?.date || new Date().toISOString().split('T')[0],
        isPublic: formIsPublic,
        isFeatured: formIsFeatured,
        sortOrder: editingVideo?.sortOrder || educationalVideos.length + 1,
        privacyApproved: true,
        albumName: formAlbumName.trim() || 'Classroom Learning',
        targetClass: formTargetClass,
        ageGroup: formAgeGroup,
        tags: tagArray.length > 0 ? tagArray : ['Education', formTargetClass.replace(' ', '')],
        uploadedBy: userProfile?.uid || 'admin',
        uploaderName: userProfile?.name || 'Headmaster'
      };

      if (editingVideo) {
        await updateGalleryItem(editingVideo.id, videoData);
        if (onSaveNotice) onSaveNotice('शैक्षिक वीडियो सफलतापूर्वक अपडेट किया गया!');
      } else {
        await addGalleryItem(videoData);
        if (onSaveNotice) onSaveNotice('नया शैक्षिक यूट्यूब वीडियो सफलतापूर्वक जोड़ा गया!');
      }

      setIsFormOpen(false);
      setEditingVideo(null);
    } catch (err) {
      console.error(err);
      alert('वीडियो सहेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Visibility directly from card
  const handleToggleVisibility = async (item: GalleryItem) => {
    try {
      await updateGalleryItem(item.id, { isPublic: !item.isPublic });
    } catch (e) {
      console.error(e);
    }
  };

  // Move Video Up in Order
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const items = [...educationalVideos];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    await reorderGalleryItems(items);
  };

  // Move Video Down in Order
  const handleMoveDown = async (index: number) => {
    if (index >= educationalVideos.length - 1) return;
    const items = [...educationalVideos];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    await reorderGalleryItems(items);
  };

  // Delete Video
  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`क्या आप वीडियो "${title}" को हटाना चाहते हैं?`)) {
      await deleteGalleryItem(id);
      if (onSaveNotice) onSaveNotice('वीडियो सफलतापूर्वक हटा दिया गया।');
    }
  };

  // Add Preset Video with 1 Click
  const handleAddPreset = async (preset: Omit<GalleryItem, 'id'>) => {
    try {
      await addGalleryItem({
        ...preset,
        sortOrder: educationalVideos.length + 1,
        date: new Date().toISOString().split('T')[0],
        uploadedBy: userProfile?.uid || 'admin',
        uploaderName: userProfile?.name || 'Headmaster'
      });
      if (onSaveNotice) onSaveNotice(`"${preset.titleHi}" को सफलतापूर्वक जोड़ा गया!`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      
      {/* Component Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0 mt-1">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                {language === 'hi' ? 'कक्षा 1 से 8 शैक्षिक व प्रेरक वीडियो' : 'Class 1-8 Curriculum & Motivation Videos'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {educationalVideos.length} {language === 'hi' ? 'वीडियो सक्रिय' : 'Videos Linked'}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              {language === 'hi'
                ? 'शैक्षिक एवं प्रेरक वीडियो प्रबंधक (होमपेज ग्रिड डिस्प्ले)'
                : 'Educational & Motivational Videos Manager'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
              {language === 'hi'
                ? 'कक्षा 1 से 8 के विद्यार्थियों हेतु यूट्यूब शैक्षिक वीडियो लिंक करें (निपुण भारत FLN, गणित ट्रिक्स, विज्ञान प्रयोग, अंतरिक्ष व डॉ. कलाम प्रेरणा विचार) जो सार्वजनिक मुख्य पृष्ठ पर ग्रिड के रूप में प्रदर्शित होंगे।'
                : 'Link curated YouTube educational & motivational videos for Class 1 to 8. They appear in a high-engagement interactive video grid on the public homepage.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPresetsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-xs border border-slate-800"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{language === 'hi' ? 'तैयार शैक्षिक वीडियो लाइब्रेरी' : 'Preset Video Library'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddForm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? '+ नया यूट्यूब वीडियो जोड़ें' : '+ Link YouTube Video'}</span>
          </button>
        </div>
      </div>

      {/* Metric Counters by Class Level */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase text-amber-800">कक्षा 1 से 3 (FLN)</div>
            <div className="text-xl font-black text-amber-950 mt-0.5">
              {educationalVideos.filter(v => v.targetClass === 'Class 1-3' || (v.tags && v.tags.includes('Class1to3'))).length}
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-amber-500 opacity-60" />
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase text-blue-800">कक्षा 4 व 5 (गणित/EVS)</div>
            <div className="text-xl font-black text-blue-950 mt-0.5">
              {educationalVideos.filter(v => v.targetClass === 'Class 4-5' || (v.tags && v.tags.includes('Class4to5'))).length}
            </div>
          </div>
          <BookOpenCheck className="w-6 h-6 text-blue-500 opacity-60" />
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase text-indigo-800">कक्षा 6 से 8 (विज्ञान/Space)</div>
            <div className="text-xl font-black text-indigo-950 mt-0.5">
              {educationalVideos.filter(v => v.targetClass === 'Class 6-8' || (v.tags && v.tags.includes('Class6to8'))).length}
            </div>
          </div>
          <Lightbulb className="w-6 h-6 text-indigo-500 opacity-60" />
        </div>

        <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase text-orange-800">कलाम प्रेरणा व विचार</div>
            <div className="text-xl font-black text-orange-950 mt-0.5">
              {educationalVideos.filter(v => v.targetClass === 'Class 1-8' || (v.tags && v.tags.includes('Motivation'))).length}
            </div>
          </div>
          <Flame className="w-6 h-6 text-orange-500 opacity-60" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'शीर्षक, कक्षा या विषय खोजें...' : 'Search by title, class or tag...'}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:bg-white focus:border-amber-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {[
            { id: 'all', label: 'सभी वीडियो (All)', icon: Film },
            { id: 'class13', label: 'कक्षा 1-3 (FLN)', icon: Sparkles },
            { id: 'class45', label: 'कक्षा 4-5 (गणित/EVS)', icon: BookOpenCheck },
            { id: 'class68', label: 'कक्षा 6-8 (विज्ञान)', icon: Lightbulb },
            { id: 'motivation', label: 'डॉ. कलाम विचार', icon: Flame },
            { id: 'smart', label: 'स्मार्ट क्लास', icon: Video }
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = classFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setClassFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Videos Grid in Admin Panel */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video, idx) => {
            const ytId = video.youtubeId || extractYouTubeId(video.videoURL || '');
            const thumb = video.thumbnailURL || video.imageUrl || video.imageURL || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');

            return (
              <div
                key={video.id}
                className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  video.isPublic === false
                    ? 'bg-slate-50 border-slate-300 opacity-75'
                    : 'bg-white border-slate-200 hover:border-amber-400'
                }`}
              >
                {/* Video Card Header / Thumbnail */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden group">
                  <img
                    src={thumb}
                    alt={video.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/30 to-transparent" />

                  {/* Play preview button */}
                  <button
                    type="button"
                    onClick={() => setPreviewModalVideo(video)}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                    title="Play Video"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-amber-400 transition-transform">
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    </div>
                  </button>

                  {/* Top Badges: Target Class & Visibility */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    {video.targetClass && (
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black shadow-xs">
                        🎯 {video.targetClass}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                      सरल हिंदी
                    </span>
                  </div>

                  {/* Top Right: YouTube indicator */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    {ytId && (
                      <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <Youtube className="w-3 h-3 fill-current" />
                        <span>YouTube</span>
                      </span>
                    )}
                  </div>

                  {/* Bottom Duration & Sort Position */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-900/90 text-amber-300 text-[10px] font-mono font-bold">
                      #{idx + 1}
                    </span>
                    {video.duration && (
                      <span className="px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-mono font-bold">
                        {video.duration}
                      </span>
                    )}
                  </div>
                </div>

                {/* Video Info Body */}
                <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-amber-700 font-bold uppercase">
                      <span className="truncate max-w-[180px]">{video.albumName || 'Curriculum Series'}</span>
                      {video.ageGroup && (
                        <span className="text-slate-500 font-medium">{video.ageGroup}</span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">
                      {video.titleHi || video.titleEn}
                    </h4>

                    {video.titleEn && video.titleHi !== video.titleEn && (
                      <div className="text-[11px] font-semibold text-slate-500 line-clamp-1">
                        {video.titleEn}
                      </div>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-0.5">
                      {video.captionHi || video.captionEn}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {video.tags?.slice(0, 3).map((t, tIdx) => (
                      <span key={tIdx} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Action Controls Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Move Up/Down Order & Copy Link */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveUp(idx)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 cursor-pointer transition-colors"
                          title="Move Up in Homepage Grid"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === educationalVideos.length - 1}
                          onClick={() => handleMoveDown(idx)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 cursor-pointer transition-colors"
                          title="Move Down in Homepage Grid"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Direct YouTube Copy Link Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(video)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          copiedVideoId === video.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200 hover:border-slate-300'
                        }`}
                        title={
                          copiedVideoId === video.id
                            ? (language === 'hi' ? 'यूट्यूब लिंक क्लिपबोर्ड पर कॉपी हो गया!' : 'YouTube URL copied to clipboard!')
                            : (language === 'hi' ? 'यूट्यूब लिंक कॉपी करें (Copy Link)' : 'Copy direct YouTube video URL')
                        }
                      >
                        {copiedVideoId === video.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span className="text-[11px] font-bold text-white">{language === 'hi' ? 'कॉपी हुआ!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[11px] font-bold">{language === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Visibility, Edit, Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(video)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          video.isPublic !== false
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                        }`}
                        title={video.isPublic !== false ? 'Live on Homepage (Click to Hide)' : 'Hidden (Click to Show)'}
                      >
                        {video.isPublic !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{video.isPublic !== false ? 'सार्वजनिक' : 'छिपा हुआ'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditForm(video)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                        title="Edit Video Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(video.id, video.titleHi || video.titleEn)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                        title="Delete Video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
          <Video className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">कोई वीडियो नहीं मिला</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            फ़िल्टर बदलें या नया यूट्यूब वीडियो जोड़ने के लिए ऊपर दिए गए बटन पर क्लिक करें।
          </p>
          <button
            type="button"
            onClick={handleOpenAddForm}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black cursor-pointer shadow-xs"
          >
            + पहला यूट्यूब वीडियो जोड़ें
          </button>
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-red-600 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingVideo
                      ? (language === 'hi' ? 'यूट्यूब वीडियो संपादित करें' : 'Edit YouTube Video')
                      : (language === 'hi' ? 'नया शैक्षिक/प्रेरक वीडियो लिंक करें' : 'Link New Educational YouTube Video')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'hi'
                      ? 'कक्षा 1-8 पाठ्यक्रम आधारित वीडियो का यूट्यूब लिंक व विवरण भरें।'
                      : 'Curriculum-aligned YouTube video details for public homepage grid.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveForm} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              
              {/* YouTube URL / Video ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  {language === 'hi' ? 'यूट्यूब वीडियो लिंक या Video ID (YouTube Link / ID):' : 'YouTube Video URL or 11-char ID:'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Youtube className="w-4 h-4 text-red-600 fill-current absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formYoutubeUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... या youtu.be/..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                {formExtractedId && (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-bold pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>वैध यूट्यूब Video ID: <code className="font-mono bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-800">{formExtractedId}</code></span>
                  </div>
                )}
              </div>

              {/* Live Preview Thumbnail Strip */}
              {formExtractedId && (
                <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center gap-3">
                  <img
                    src={`https://img.youtube.com/vi/${formExtractedId}/hqdefault.jpg`}
                    alt="Thumbnail Preview"
                    className="w-24 h-16 object-cover rounded-xl border border-white/20"
                  />
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>यूट्यूब थंबनेल स्वतः प्राप्त (Auto-Generated)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      https://img.youtube.com/vi/{formExtractedId}/hqdefault.jpg
                    </div>
                  </div>
                </div>
              )}

              {/* Target Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'लक्षित कक्षा स्तर (Target Class Level):' : 'Target Class Level:'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formTargetClass}
                    onChange={(e) => {
                      const c = e.target.value as any;
                      setFormTargetClass(c);
                      if (c === 'Class 1-3') {
                        setFormAgeGroup('Age 5-8 yrs (कक्षा 1-3)');
                        setFormAlbumName('कक्षा 1-3 निपुण भारत FLN');
                      } else if (c === 'Class 4-5') {
                        setFormAgeGroup('Age 8-11 yrs (कक्षा 4-5)');
                        setFormAlbumName('कक्षा 4-5 गणित व पर्यावरण');
                      } else if (c === 'Class 6-8') {
                        setFormAgeGroup('Age 11-14 yrs (कक्षा 6-8)');
                        setFormAlbumName('कक्षा 6-8 विज्ञान प्रयोगशाला');
                      } else {
                        setFormAgeGroup('All Students (कक्षा 1-8)');
                        setFormAlbumName('डॉ. कलाम प्रेरणादायक विचार');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Class 1-3">कक्षा 1 से 3 (FLN / बालगीत / वर्णमाला)</option>
                    <option value="Class 4-5">कक्षा 4 व 5 (गणित / EVS / पर्यावरण)</option>
                    <option value="Class 6-8">कक्षा 6 से 8 (विज्ञान प्रयोग / अंतरिक्ष / ISRO)</option>
                    <option value="Class 1-8">सभी कक्षाएं (1 से 8 - डॉ. कलाम प्रेरणा / विचार)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'अनुमानित अवधि (Duration, e.g. 05:30):' : 'Video Duration (MM:SS):'}
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="05:30"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Title in Hindi & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'शीर्षक (हिंदी में):' : 'Title (Hindi):'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitleHi}
                    onChange={(e) => setFormTitleHi(e.target.value)}
                    placeholder="उदा. रोचक हिंदी वर्णमाला एवं सचित्र बालगीत"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'Title (English):' : 'Title (English):'}
                  </label>
                  <input
                    type="text"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    placeholder="e.g. Hindi Alphabet Phonics & Rhymes"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Concept Summary / Caption */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  {language === 'hi' ? 'वीडियो का संक्षिप्त विवरण / सीख (हिंदी में):' : 'Concept Summary (Hindi):'}
                </label>
                <textarea
                  rows={2}
                  value={formCaptionHi}
                  onChange={(e) => setFormCaptionHi(e.target.value)}
                  placeholder="विद्यार्थी इस वीडियो से क्या सीखेंगे? जैसे: सूरज की धूप, भाप और बारिश का सचित्र विज्ञान..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500"
                />
              </div>

              {/* Album & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'श्रृंखला / एल्बम नाम:' : 'Series / Album Name:'}
                  </label>
                  <input
                    type="text"
                    value={formAlbumName}
                    onChange={(e) => setFormAlbumName(e.target.value)}
                    placeholder="उदा. कक्षा 1-3 निपुण भारत FLN"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'टैग (Tags, अल्पविराम से अलग करें):' : 'Tags (comma separated):'}
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Class1to3, FLN, Balgeet, Science"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Toggles: Public & Featured */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPublic}
                    onChange={(e) => setFormIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>सार्वजनिक रूप से मुख्य पृष्ठ पर प्रदर्शित करें (Live on Homepage)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>विशेष चुनिंदा वीडियो (Featured Badge)</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'सहेजा जा रहा है...' : editingVideo ? 'अपडेट करें' : 'यूट्यूब वीडियो जोड़ें'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preset Library Modal */}
      {isPresetsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Presets Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {language === 'hi' ? 'कक्षा 1 से 8 के लिए तैयार शैक्षिक वीडियो लाइब्रेरी' : 'Curated Class 1-8 Educational Video Library'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'hi'
                      ? '1-क्लिक में अपने विद्यालय पोर्टल पर उच्च गुणवत्ता वाले शैक्षिक व प्रेरक वीडियो जोड़ें।'
                      : 'Add verified curriculum-aligned videos with single click.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPresetsOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets List */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
              {CURATED_PRESET_VIDEOS.map((preset, pIdx) => {
                const isAlreadyAdded = educationalVideos.some(v => v.youtubeId === preset.youtubeId);

                return (
                  <div
                    key={pIdx}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-14 rounded-xl bg-black overflow-hidden relative shrink-0">
                        <img
                          src={preset.thumbnailURL}
                          alt={preset.titleEn}
                          className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[8px] font-mono text-white font-bold">
                          {preset.duration}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                            🎯 {preset.targetClass}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {preset.albumName}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">
                          {preset.titleHi}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {preset.captionHi}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(preset, `preset-${pIdx}`)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                          copiedVideoId === `preset-${pIdx}`
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                        title={
                          copiedVideoId === `preset-${pIdx}`
                            ? (language === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link Copied!')
                            : (language === 'hi' ? 'यूट्यूब लिंक कॉपी करें' : 'Copy YouTube URL')
                        }
                      >
                        {copiedVideoId === `preset-${pIdx}` ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span className="text-[11px]">{language === 'hi' ? 'कॉपी हुआ' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-[11px]">{language === 'hi' ? 'लिंक' : 'Link'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isAlreadyAdded}
                        onClick={() => handleAddPreset(preset)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                          isAlreadyAdded
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                        }`}
                      >
                        {isAlreadyAdded ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> जोड़ा जा चुका है
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> पोर्टल में जोड़ें
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Presets Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsPresetsOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                पूर्ण (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive YouTube Video Player Modal */}
      {previewModalVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-3xl w-full overflow-hidden text-white flex flex-col">
            
            {/* Player Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 pr-3">
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black">
                  🎯 {previewModalVideo.targetClass}
                </span>
                <h4 className="font-extrabold text-sm text-white truncate">
                  {previewModalVideo.titleHi || previewModalVideo.titleEn}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalVideo(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="aspect-video w-full bg-black">
              {previewModalVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${previewModalVideo.youtubeId}?autoplay=1&rel=0`}
                  title={previewModalVideo.titleEn}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : previewModalVideo.videoURL ? (
                <iframe
                  src={previewModalVideo.videoURL}
                  title={previewModalVideo.titleEn}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  Video stream not available
                </div>
              )}
            </div>

            {/* Player Details */}
            <div className="p-4 space-y-2 bg-slate-950 text-xs">
              <p className="text-slate-300 leading-relaxed">
                {previewModalVideo.captionHi || previewModalVideo.captionEn}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>{previewModalVideo.albumName}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(previewModalVideo, `preview-${previewModalVideo.id}`)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      copiedVideoId === `preview-${previewModalVideo.id}`
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                    title="Copy direct YouTube link"
                  >
                    {copiedVideoId === `preview-${previewModalVideo.id}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>{language === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>{language === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link'}</span>
                      </>
                    )}
                  </button>

                  {previewModalVideo.youtubeId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${previewModalVideo.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>यूट्यूब पर खोलें (Open in YouTube)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
