import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Eye, 
  Sparkles, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  X, 
  Layers, 
  Star, 
  Filter, 
  Search, 
  Globe, 
  Lock, 
  ArrowUpRight,
  Camera,
  Heart,
  FileCheck,
  Edit3,
  Video,
  Play,
  Film,
  Youtube,
  Link2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { GalleryItem } from '../../types';
import { parseVideoUrl, captureVideoFrame } from '../../utils/mediaUtils';

export const TeacherGalleryUpload: React.FC = () => {
  const { gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem, settings, language } = useSchool();
  const { userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'upload' | 'my_photos' | 'all_photos'>('upload');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Upload Form State
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [videoSourceType, setVideoSourceType] = useState<'youtube' | 'drive' | 'upload'>('youtube');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [captionEn, setCaptionEn] = useState('');
  const [captionHi, setCaptionHi] = useState('');
  const [category, setCategory] = useState<GalleryItem['category']>('Classroom & Learning');
  const [imageURL, setImageURL] = useState('');
  const [customThumbnailURL, setCustomThumbnailURL] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPublic, setIsPublic] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('NIPUN Bharat');
  const [privacyConsent, setPrivacyConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVideoProcessing, setIsVideoProcessing] = useState(false);

  const categories = [
    { id: 'Classroom & Learning', labelHi: 'कक्षा शिक्षण एवं अधिगम (NIPUN)', labelEn: 'Classroom & Learning' },
    { id: 'Sports & Playground', labelHi: 'खेलकूद, योग एवं व्यायाम', labelEn: 'Sports & Yoga' },
    { id: 'Cultural Activities', labelHi: 'सांस्कृतिक एवं बाल सभा कार्यक्रम', labelEn: 'Cultural Activities' },
    { id: 'Independence & Republic Day', labelHi: 'राष्ट्रीय पर्व (स्वतंत्रता/गणतंत्र दिवस)', labelEn: 'National Festivals' },
    { id: 'Mid-Day Meal', labelHi: 'पीएम पोषण (मध्याह्न भोजन)', labelEn: 'Mid-Day Meal' },
    { id: 'School Building', labelHi: 'विद्यालय परिसर व कायाकल्प', labelEn: 'Campus & Infrastructure' },
    { id: 'Teachers', labelHi: 'शिक्षक बैठक एवं कार्यशाला', labelEn: 'Faculty & Workshop' },
    { id: 'National Celebrations', labelHi: 'पर्यावरण, विज्ञान व अन्य उत्सव', labelEn: 'Science & Environment' },
  ];

  const photoPresets = [
    {
      titleEn: 'Foundational Literacy & Numeracy (FLN) TLM Activity',
      titleHi: 'निपुण भारत मिशन अंतर्गत टीएलएम आधारित शिक्षण गतिविधि',
      captionEn: 'Students enthusiastically participating in interactive math and language learning.',
      captionHi: 'कक्षा में छात्र-छात्राएं गणित किट एवं भाषा संदर्शिका के माध्यम से उत्साहपूर्वक सीखते हुए।',
      category: 'Classroom & Learning',
      tag: 'NIPUN Bharat'
    },
    {
      titleEn: 'Morning Yoga, PT & Physical Fitness Session',
      titleHi: 'प्रातःकालीन योगाभ्यास, पीटी एवं शारीरिक व्यायाम',
      captionEn: 'Daily wellness, Surya Namaskar, and physical drill for students in school playground.',
      captionHi: 'विद्यालय प्रांगण में बच्चों द्वारा नियमित योगाभ्यास एवं सूर्य नमस्कार प्रदर्शन।',
      category: 'Sports & Playground',
      tag: 'Sports & Yoga'
    },
    {
      titleEn: 'PM POSHAN Hot Fresh Nutritious Lunch Distribution',
      titleHi: 'पीएम पोषण अंतर्गत स्वच्छ व पौष्टिक भोजन एवं फल वितरण',
      captionEn: 'Serving hygienic, hot-cooked meal adhering to the prescribed nutritional menu.',
      captionHi: 'साप्ताहिक मेन्यू अनुसार विद्यार्थियों को शुद्ध, ताजा व पौष्टिक भोजन वितरित किया गया।',
      category: 'Mid-Day Meal',
      tag: 'PM POSHAN'
    },
    {
      titleEn: 'Bal Sabha & Saturday Cultural Expression',
      titleHi: 'शनिवारीय बाल सभा, देशभक्ति गायन एवं नाटक प्रस्तुति',
      captionEn: 'Students showcasing storytelling, poetry recitation, and creative crafts.',
      captionHi: 'छात्रों द्वारा प्रेरक कहानियों, बाल कविताओं एवं संवादों का सुंदर प्रस्तुतीकरण।',
      category: 'Cultural Activities',
      tag: 'Bal Sabha'
    },
    {
      titleEn: 'Science & Environmental Tree Plantation Drive',
      titleHi: 'पर्यावरण संरक्षण एवं विद्यालय प्रांगण वृक्षारोपण अभियान',
      captionEn: 'Students planting saplings and learning about biodiversity conservation.',
      captionHi: 'विद्यार्थियों एवं शिक्षकों द्वारा विद्यालय प्रांगण में औषधीय व छायादार पौधों का रोपण।',
      category: 'National Celebrations',
      tag: 'Eco Club'
    }
  ];

  const videoPresets = [
    {
      titleEn: 'Interactive FLN Math Kit Demonstration Video',
      titleHi: 'गणित किट एवं शिक्षण संदर्शिका से लाइव शिक्षण गतिविधि वीडियो',
      captionEn: 'Watch students solving fun mathematical puzzles and building foundational numeracy skills.',
      captionHi: 'विद्यार्थियों द्वारा गणितीय पहेलियों एवं टीएलएम के माध्यम से रोचक शिक्षण प्रदर्शन।',
      category: 'Classroom & Learning',
      tag: 'NIPUN FLN Video',
      duration: '03:45'
    },
    {
      titleEn: 'Annual Sports Day Drill & Surya Namaskar Video',
      titleHi: 'वार्षिक खेलकूद एवं सामूहिक सूर्य नमस्कार प्रदर्शन वीडियो',
      captionEn: 'Video recording of students performing synchronized physical fitness and yoga exercises.',
      captionHi: 'विद्यालय प्रांगण में विद्यार्थियों द्वारा सामूहिक योग एवं लयबद्ध शारीरिक व्यायाम।',
      category: 'Sports & Playground',
      tag: 'Sports Video',
      duration: '04:20'
    },
    {
      titleEn: 'Bal Sabha Saturday Patriotic Song & Drama Performance',
      titleHi: 'शनिवारीय बाल सभा देशभक्ति एकांकी एवं समूह गान वीडियो',
      captionEn: 'Inspiring video capturing theatrical storytelling and cultural expressions by primary students.',
      captionHi: 'छात्रों द्वारा प्रेरक सामाजिक नाटक एवं देशभक्ति समूह गान की मनमोहक वीडियो प्रस्तुति।',
      category: 'Cultural Activities',
      tag: 'Bal Sabha Video',
      duration: '05:10'
    },
    {
      titleEn: 'PM POSHAN Meal Preparation & Dining Etiquette Video',
      titleHi: 'पीएम पोषण स्वच्छ रसोई, भोजन वितरण एवं स्वच्छता आदतें वीडियो',
      captionEn: 'Video coverage of clean dining, handwashing drill, and hot nutrition service.',
      captionHi: 'विद्यार्थियों द्वारा भोजन पूर्व साबुन से हाथ धोने एवं स्वच्छ पोषण ग्रहण का सजीव वीडियो।',
      category: 'Mid-Day Meal',
      tag: 'MDM Video',
      duration: '02:50'
    }
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('कृपया 5MB से छोटी इमेज फाइल चुनें (Please select an image smaller than 5MB).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageURL(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        alert('कृपया 30MB से छोटा वीडियो चुनें अथवा YouTube/Google Drive लिंक का उपयोग करें।');
        return;
      }
      setVideoFileName(file.name);
      setIsVideoProcessing(true);
      try {
        const frameThumbnail = await captureVideoFrame(file);
        if (frameThumbnail) {
          setCustomThumbnailURL(frameThumbnail);
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setVideoUrlInput(event.target.result as string);
          }
          setIsVideoProcessing(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error(err);
        setIsVideoProcessing(false);
      }
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomThumbnailURL(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyPhotoPreset = (preset: typeof photoPresets[0]) => {
    setTitleEn(preset.titleEn);
    setTitleHi(preset.titleHi);
    setCaptionEn(preset.captionEn);
    setCaptionHi(preset.captionHi);
    setCategory(preset.category as any);
    setSelectedTag(preset.tag);
  };

  const applyVideoPreset = (preset: typeof videoPresets[0]) => {
    setTitleEn(preset.titleEn);
    setTitleHi(preset.titleHi);
    setCaptionEn(preset.captionEn);
    setCaptionHi(preset.captionHi);
    setCategory(preset.category as any);
    setSelectedTag(preset.tag);
    setVideoDuration(preset.duration);
  };

  const parsedVideo = parseVideoUrl(videoUrlInput);
  const effectiveThumbnail = mediaType === 'video'
    ? (customThumbnailURL || (parsedVideo.type === 'youtube' && parsedVideo.thumbnailUrl ? parsedVideo.thumbnailUrl : (imageURL || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80')))
    : imageURL;

  const allowTeacherVideoUpload = settings?.allowTeacherVideoUpload !== false;
  const teacherVideoApprovalRequired = settings?.teacherVideoApprovalRequired === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mediaType === 'photo' && !imageURL) {
      alert('कृपया फोटो चुनें या अपलोड करें (Please select a photo).');
      return;
    }
    if (mediaType === 'video') {
      if (!allowTeacherVideoUpload) {
        alert('शिक्षक वीडियो अपलोड विकल्प वर्तमान में व्यवस्थापक द्वारा अक्षम किया गया है। (Teacher video uploading is currently disabled by administrator).');
        return;
      }
      if (!videoUrlInput) {
        alert('कृपया वीडियो फ़ाइल चुनें या YouTube / Google Drive वीडियो URL दर्ज करें (Please provide a video URL or upload a video).');
        return;
      }
    }
    if (!titleEn) {
      alert('कृपया शीर्षक भरें (Please enter a title).');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploaderName = userProfile?.name || 'Faculty Member';
      const effectiveIsPublic = mediaType === 'video' && teacherVideoApprovalRequired ? false : isPublic;
      
      const payload: Omit<GalleryItem, 'id'> = {
        titleEn: titleEn.trim(),
        titleHi: titleHi.trim() || titleEn.trim(),
        captionEn: captionEn.trim(),
        captionHi: captionHi.trim() || captionEn.trim(),
        category,
        mediaType,
        imageURL: effectiveThumbnail,
        imageUrl: effectiveThumbnail,
        date: eventDate,
        isPublic: effectiveIsPublic,
        isFeatured,
        privacyApproved: privacyConsent,
        uploadedBy: userProfile?.id || 'teacher',
        uploaderRole: 'Teacher',
        uploaderName,
        tags: [selectedTag, 'Faculty Upload', mediaType === 'video' ? 'Video Archive' : 'Photo Archive', category],
        ...(mediaType === 'video' ? {
          videoURL: parsedVideo.cleanUrl || videoUrlInput,
          videoSource: videoSourceType === 'youtube' ? 'youtube' : videoSourceType === 'drive' ? 'drive' : 'upload',
          youtubeId: parsedVideo.videoId,
          duration: videoDuration || '03:00',
          thumbnailURL: effectiveThumbnail
        } : {})
      };

      await addGalleryItem(payload);

      setSuccessMessage(
        mediaType === 'video'
          ? (teacherVideoApprovalRequired
              ? 'वीडियो सफलतापूर्वक सबमिट हो गया! प्रधानाध्यापक के सत्यापन के उपरांत यह सार्वजनिक रूप से प्रदर्शित होगा।'
              : 'वीडियो सफलतापूर्वक विद्यालय गैलरी में अपलोड हो गया! (Video successfully added to school gallery!)')
          : 'फोटो सफलतापूर्वक विद्यालय गैलरी में अपलोड हो गई! (Photo successfully added to school gallery!)'
      );
      setTimeout(() => setSuccessMessage(null), 4000);

      // Reset form
      setTitleEn('');
      setTitleHi('');
      setCaptionEn('');
      setCaptionHi('');
      setImageURL('');
      setVideoUrlInput('');
      setCustomThumbnailURL('');
      setVideoFileName('');
      setVideoDuration('');
      setIsFeatured(false);
      setActiveTab('my_photos');
    } catch (err) {
      console.error(err);
      alert('अपलोड में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTeacherId = userProfile?.id || userProfile?.entityId;
  const myUploadedItems = gallery.filter(item => 
    item.uploadedBy === currentTeacherId || 
    item.uploaderRole === 'Teacher' || 
    (item.uploaderName && userProfile?.name && item.uploaderName.toLowerCase().includes(userProfile.name.toLowerCase()))
  );

  const displayedItems = (activeTab === 'my_photos' ? myUploadedItems : gallery).filter(item => {
    const matchesSearch = item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.titleHi && item.titleHi.includes(searchQuery)) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = mediaTypeFilter === 'all' || (item.mediaType || 'photo') === mediaTypeFilter;
    return matchesSearch && matchesCat && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shrink-0">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'शिक्षक फोटो व वीडियो गतिविधि अभिलेख' : 'Faculty Photo & Video Archive'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {language === 'hi' ? 'फोटो एवं वीडियो अपलोड पोर्टल' : 'Photo & Video Gallery Upload'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
                {language === 'hi'
                  ? 'अपनी कक्षा की गतिविधियां, शैक्षणिक वीडियो, खेलकूद, राष्ट्रीय पर्व एवं मध्याह्न भोजन के चित्र व वीडियो वेबसाइट पर प्रदर्शित करने हेतु अपलोड करें।'
                  : 'Upload classroom activities, pedagogical videos, sports events, and celebrations directly to the school photo & video gallery.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${
                activeTab === 'upload'
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? 'नया फोटो / वीडियो अपलोड करें' : 'Upload Photo / Video'}</span>
            </button>

            <button
              onClick={() => setActiveTab('my_photos')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'my_photos'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? `मेरे अपलोड (${myUploadedItems.length})` : `My Uploads (${myUploadedItems.length})`}</span>
            </button>

            <button
              onClick={() => setActiveTab('all_photos')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all_photos'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span>{language === 'hi' ? `समग्र गैलरी (${gallery.length})` : `All Gallery (${gallery.length})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 flex items-center justify-between text-xs sm:text-sm font-bold shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: UPLOAD MEDIA FORM */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            
            {/* Media Type Switcher: Photo vs Video */}
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-amber-600" />
                    <span>{language === 'hi' ? 'मीडिया अपलोड एवं विवरण प्रपत्र' : 'Media Details & Upload Form'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'hi' 
                      ? 'फोटो अथवा वीडियो का चयन करें तथा विवरण भरें।'
                      : 'Choose between Photo or Video upload, add event details, and publish.'}
                  </p>
                </div>

                {/* Photo / Video Switch Buttons */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setMediaType('photo')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      mediaType === 'photo'
                        ? 'bg-white text-slate-950 shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>{language === 'hi' ? 'फोटो (Photo)' : 'Photo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!allowTeacherVideoUpload) {
                        alert(language === 'hi' 
                          ? 'शिक्षक वीडियो अपलोड विकल्प वर्तमान में व्यवस्थापक (प्रधानाध्यापक) द्वारा बंद है।' 
                          : 'Teacher video uploading is currently disabled by administrator.');
                        return;
                      }
                      setMediaType('video');
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      mediaType === 'video'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : allowTeacherVideoUpload
                        ? 'text-slate-600 hover:text-slate-950'
                        : 'text-slate-400 opacity-60 cursor-not-allowed'
                    }`}
                    title={!allowTeacherVideoUpload ? 'Video upload is currently disabled by admin' : 'Switch to Video upload'}
                  >
                    <Video className="w-4 h-4" />
                    <span>{language === 'hi' ? 'वीडियो (Video)' : 'Video'}</span>
                    {!allowTeacherVideoUpload && <span className="text-[10px] ml-0.5 font-bold">🔒</span>}
                  </button>
                </div>
              </div>
            </div>

            {/* Video Policy Status Banner */}
            {mediaType === 'video' && (
              <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                teacherVideoApprovalRequired 
                  ? 'bg-blue-50 border border-blue-200 text-blue-900' 
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              }`}>
                <ShieldCheck className={`w-4 h-4 shrink-0 ${teacherVideoApprovalRequired ? 'text-blue-600' : 'text-emerald-600'}`} />
                <div>
                  <span className="font-bold">
                    {teacherVideoApprovalRequired 
                      ? (language === 'hi' ? 'सत्यापन आवश्यक नीति सक्रिय:' : 'Moderation Policy Active:')
                      : (language === 'hi' ? 'प्रत्यक्ष प्रकाशन सक्रिय:' : 'Direct Publishing Active:')}
                  </span>{' '}
                  {teacherVideoApprovalRequired
                    ? (language === 'hi' 
                        ? 'आपके द्वारा अपलोड किया गया वीडियो प्रधानाध्यापक के सत्यापन के उपरांत मुख्य वेबसाइट पर लाइव दिखेगा।' 
                        : 'Uploaded videos will be reviewed by the Headmaster before appearing on the public school portal.')
                    : (language === 'hi'
                        ? 'आपके द्वारा अपलोड वीडियो सीधे विद्यालय गैलरी व वेबसाइट पर प्रदर्शित होगा।'
                        : 'Uploaded videos will be published directly to the public school gallery.')}
                </div>
              </div>
            )}

            {!allowTeacherVideoUpload && mediaType === 'photo' && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
                <span className="font-bold text-slate-800">सूचना:</span>
                <span>
                  {language === 'hi'
                    ? 'शिक्षक वीडियो अपलोड विकल्प वर्तमान में व्यवस्थापक द्वारा प्रतिबंधित है। आप सामान्य रूप से फोटो अपलोड कर सकते हैं।'
                    : 'Video upload is currently disabled by admin. Photo uploads remain fully operational.'}
                </span>
              </div>
            )}

            {/* Quick Presets */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {mediaType === 'video'
                    ? (language === 'hi' ? 'वीडियो शीघ्र प्रविष्टि टेम्पलेट (Video Quick Presets):' : 'Video Quick Presets:')
                    : (language === 'hi' ? 'फोटो शीघ्र प्रविष्टि टेम्पलेट (Photo Quick Presets):' : 'Photo Quick Presets:')}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(mediaType === 'video' ? videoPresets : photoPresets).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => mediaType === 'video' ? applyVideoPreset(preset as any) : applyPhotoPreset(preset as any)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-[11px] font-semibold text-slate-700 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    {mediaType === 'video' ? <Film className="w-3 h-3 text-rose-600 shrink-0" /> : <Camera className="w-3 h-3 text-amber-600 shrink-0" />}
                    <span>{language === 'hi' ? preset.titleHi.slice(0, 28) + '...' : preset.titleEn.slice(0, 24) + '...'}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* MEDIA INPUT SECTION: PHOTO OR VIDEO */}
              {mediaType === 'photo' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    {language === 'hi' ? '1. फोटो चुनें (Select / Drop Image) *' : '1. Select / Drop Image *'}
                  </label>
                  
                  <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="teacher-photo-file-input"
                    />
                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        {imageURL ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> फोटो चयनित है (Image Selected - Click to change)
                          </span>
                        ) : (
                          language === 'hi' ? 'फोटो अपलोड करने के लिए क्लिक करें या ड्रैग करें' : 'Click to browse or drag & drop photo'
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Supports JPG, PNG, WebP (Max 5MB)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 font-semibold">{language === 'hi' ? 'या वेब URL:' : 'Or image URL:'}</span>
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={imageURL.startsWith('data:') ? '' : imageURL}
                      onChange={(e) => setImageURL(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-rose-600" />
                      <span>{language === 'hi' ? '1. वीडियो स्रोत चुनें (Select Video Source) *' : '1. Video Source *'}</span>
                    </label>

                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-rose-200">
                      <button
                        type="button"
                        onClick={() => setVideoSourceType('youtube')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          videoSourceType === 'youtube' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Youtube className="w-3.5 h-3.5" />
                        <span>YouTube</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVideoSourceType('drive')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          videoSourceType === 'drive' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Google Drive</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVideoSourceType('upload')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          videoSourceType === 'upload' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Direct File</span>
                      </button>
                    </div>
                  </div>

                  {videoSourceType === 'youtube' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-rose-600 shrink-0" />
                        <input
                          type="url"
                          required
                          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          value={videoUrlInput}
                          onChange={(e) => setVideoUrlInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-xs text-slate-900 focus:border-rose-600 focus:outline-hidden"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {language === 'hi' 
                          ? 'YouTube वीडियो का सामान्य या शॉर्ट लिंक पेस्ट करें। थंबनेल स्वतः आ जाएगा।'
                          : 'Paste any standard YouTube or Shorts URL. Thumbnail and duration are automatically fetched.'}
                      </p>
                    </div>
                  )}

                  {videoSourceType === 'drive' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-rose-600 shrink-0" />
                        <input
                          type="url"
                          required
                          placeholder="https://drive.google.com/file/d/VIDEO_ID/view?usp=sharing"
                          value={videoUrlInput}
                          onChange={(e) => setVideoUrlInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-xs text-slate-900 focus:border-rose-600 focus:outline-hidden"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {language === 'hi' 
                          ? 'Google Drive शेयर लिंक को "Anyone with link can view" पर सेट करें।'
                          : 'Ensure Google Drive video permissions are set to "Anyone with the link can view".'}
                      </p>
                    </div>
                  )}

                  {videoSourceType === 'upload' && (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-2xl p-5 text-center transition-colors bg-white relative cursor-pointer">
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime"
                          onChange={handleVideoFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          id="teacher-video-file-input"
                        />
                        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                            <Film className="w-5 h-5" />
                          </div>
                          <div className="text-xs font-bold text-slate-800">
                            {videoFileName ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> {videoFileName} (Click to change)
                              </span>
                            ) : (
                              language === 'hi' ? 'MP4 / WebM वीडियो फाइल चुनें' : 'Select MP4 / WebM video file'
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Supports MP4, WebM, QuickTime (Max 30MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        <span>{language === 'hi' ? 'वीडियो अवधि (Duration)' : 'Video Duration'}</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 03:45 or 05:20"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs text-slate-900 focus:border-rose-600 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-rose-600" />
                        <span>{language === 'hi' ? 'कस्टम थंबनेल (Thumbnail)' : 'Custom Poster / Thumbnail'}</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="w-full text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Title Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'शीर्षक (Hindi) *' : 'Title (Hindi) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={mediaType === 'video' ? "उदा. निपुण भारत गणित गतिविधि वीडियो" : "उदा. निपुण भारत गणित गतिविधि"}
                    value={titleHi}
                    onChange={(e) => setTitleHi(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'शीर्षक (English) *' : 'Title (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={mediaType === 'video' ? "e.g. NIPUN Math TLM Demonstration Video" : "e.g. NIPUN Math TLM Activity"}
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Captions / Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'विवरण (Hindi)' : 'Caption / Description (Hindi)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="आयोजन अथवा वीडियो का संक्षिप्त विवरण..."
                    value={captionHi}
                    onChange={(e) => setCaptionHi(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'विवरण (English)' : 'Caption / Description (English)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the event or video clip..."
                    value={captionEn}
                    onChange={(e) => setCaptionEn(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'श्रेणी (Category) *' : 'Category *'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {language === 'hi' ? cat.labelHi : cat.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'आयोजन तिथि (Event Date) *' : 'Event Date *'}
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Switches: Public & Featured */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'hi' ? 'सार्वजनिक वेबसाइट पर दिखाएं (Public Showcase)' : 'Show on Public Website'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {language === 'hi' ? 'वेबसाइट के फोटो व वीडियो गैलरी पेज पर सभी आगंतुकों को दिखेगा।' : 'Visible to public visitors on gallery page.'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{language === 'hi' ? 'मुख्य स्पॉटलाइट (Featured in Carousel)' : 'Spotlight in Hero Carousel'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {language === 'hi' ? 'गैलरी के सबसे ऊपर प्रमुख स्लाइडर में स्थान पाएं।' : 'Show in the top premier hero slideshow.'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Privacy Consent Confirmation */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-slate-800 text-xs">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-slate-900">
                    {language === 'hi' ? 'बाल सुरक्षा एवं गोपनीयता मानक' : 'Child Protection & Institutional Verification'}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === 'hi'
                      ? 'मैं प्रमाणित करता/करती हूँ कि यह चित्र / वीडियो विद्यालय की अधिकृत गतिविधि का है तथा इसमें किसी बालक की कोई निजी संवेदनशील पहचान प्रकाशित नहीं है।'
                      : 'I certify this is an authorized school event media compliant with institutional privacy standards.'}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (mediaType === 'photo' ? !imageURL : !videoUrlInput)}
                className={`w-full py-3.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmitting || (mediaType === 'photo' ? !imageURL : !videoUrlInput)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : mediaType === 'video'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
                id="btn-teacher-submit-media"
              >
                {mediaType === 'video' ? <Video className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                <span>
                  {isSubmitting
                    ? (language === 'hi' ? 'अपलोड हो रहा है...' : 'Uploading...')
                    : mediaType === 'video'
                    ? (language === 'hi' ? 'वीडियो गैलरी में प्रकाशित करें (Publish Video)' : 'Publish Video to School Gallery')
                    : (language === 'hi' ? 'फोटो गैलरी में प्रकाशित करें (Publish Photo)' : 'Publish Photo to School Gallery')}
                </span>
              </button>
            </form>
          </div>

          {/* Right Column: Live Public Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>{language === 'hi' ? 'लाइव पूर्वावलोकन' : 'Live Public Card Preview'}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mediaType === 'video' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                  {mediaType === 'video' ? 'Video Format' : 'Photo Format'}
                </span>
              </div>

              {/* Card Preview */}
              <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
                <div className="aspect-16/10 relative overflow-hidden bg-slate-950 flex items-center justify-center">
                  
                  {mediaType === 'photo' ? (
                    imageURL ? (
                      <img 
                        src={imageURL} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 space-y-2 text-slate-500">
                        <ImageIcon className="w-12 h-12 mx-auto text-slate-600" />
                        <p className="text-xs">{language === 'hi' ? 'फोटो चुनने पर लाइव पूर्वावलोकन दिखेगा' : 'Select a photo to see live preview'}</p>
                      </div>
                    )
                  ) : (
                    effectiveThumbnail ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={effectiveThumbnail} 
                          alt="Video Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 ml-0.5" />
                          </div>
                        </div>
                        {videoDuration && (
                          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                            {videoDuration}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center p-6 space-y-2 text-slate-500">
                        <Video className="w-12 h-12 mx-auto text-slate-600" />
                        <p className="text-xs">{language === 'hi' ? 'वीडियो लिंक या फाइल चुनने पर पूर्वावलोकन दिखेगा' : 'Enter video link or file to preview'}</p>
                      </div>
                    )
                  )}

                  {isFeatured && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black shadow-md flex items-center gap-1 z-10">
                      <Star className="w-3 h-3 fill-slate-950" /> Featured
                    </div>
                  )}

                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-amber-300 text-[10px] font-bold z-10 flex items-center gap-1">
                    {mediaType === 'video' ? <Film className="w-3 h-3 text-rose-400" /> : null}
                    <span>{category}</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>{eventDate}</span>
                    </span>
                    <span className="text-emerald-400 font-medium truncate max-w-[150px]">
                      By: {userProfile?.name || 'Faculty'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white line-clamp-1">
                    {language === 'hi' ? (titleHi || 'शीर्षक यहाँ दिखेगा') : (titleEn || 'Title will appear here')}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {language === 'hi' ? (captionHi || 'विवरण यहाँ दिखेगा') : (captionEn || 'Caption description will appear here')}
                  </p>
                </div>
              </div>

              {/* Upload Guidelines */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'hi' ? 'शिक्षक अपलोड मार्गदर्शिका:' : 'Teacher Upload Best Practices:'}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
                  <li>{language === 'hi' ? 'YouTube / Google Drive लिंक सबसे तेज़ व उच्च गुणवत्ता में लोड होते हैं।' : 'YouTube & Drive embeds stream instantly in full HD without buffering.'}</li>
                  <li>{language === 'hi' ? 'गतिविधि वीडियो में छात्रों की शैक्षणिक सहभागिता को प्राथमिकता दें।' : 'Highlight foundational learning, FLN math kit drills, and yoga.'}</li>
                  <li>{language === 'hi' ? 'अपलोड होते ही मीडिया मुख्य वेबसाइट पर प्रदर्शित होने लगता है।' : 'Uploaded media is automatically indexed into the school portal.'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 & 3: MEDIA ARCHIVE LIST (MY UPLOADS & ALL GALLERY) */}
      {activeTab !== 'upload' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'hi' ? 'शीर्षक या श्रेणी खोजें...' : 'Search media by title...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Media Type Filter (All / Photos / Videos) */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setMediaTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  mediaTypeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'hi' ? 'सभी' : 'All'}
              </button>
              <button
                onClick={() => setMediaTypeFilter('photo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  mediaTypeFilter === 'photo' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'hi' ? 'फोटो' : 'Photos'}</span>
              </button>
              <button
                onClick={() => setMediaTypeFilter('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  mediaTypeFilter === 'video' ? 'bg-rose-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'वीडियो' : 'Videos'}</span>
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto custom-scrollbar pb-1 md:pb-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({displayedItems.length})
              </button>
              {categories.slice(0, 4).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayedItems.map((item) => {
              const img = item.thumbnailURL || item.imageURL || item.imageUrl || '';
              const isVideo = item.mediaType === 'video' || !!item.videoURL;
              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-amber-400 transition-all flex flex-col justify-between group"
                >
                  <div 
                    className="relative aspect-4/3 bg-slate-950 overflow-hidden cursor-pointer"
                    onClick={() => setPreviewItem(item)}
                  >
                    <img 
                      src={img} 
                      alt={item.titleEn} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-amber-300 text-[10px] font-bold">
                        {item.category}
                      </span>
                      {isVideo && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black flex items-center gap-1">
                          <Video className="w-2.5 h-2.5" /> Video
                        </span>
                      )}
                      {item.isFeatured && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-slate-950" /> Featured
                        </span>
                      )}
                    </div>

                    {/* Duration badge */}
                    {isVideo && item.duration && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                        {item.duration}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                        className="p-3 rounded-full bg-black/70 text-amber-400 hover:scale-110 transition-transform flex items-center gap-1 font-bold text-xs"
                      >
                        {isVideo ? <Play className="w-5 h-5 fill-amber-400" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-600" />
                        <span>{item.date || 'Recent'}</span>
                      </span>
                      <span className="text-slate-500 font-medium truncate max-w-[110px]">
                        {item.uploaderName || item.uploadedBy || 'Faculty'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {language === 'hi' ? item.titleHi : item.titleEn}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {language === 'hi' ? (item.captionHi || item.captionEn) : (item.captionEn || item.captionHi)}
                    </p>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => updateGalleryItem(item.id, { isFeatured: !item.isFeatured })}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                          item.isFeatured ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                        title="Toggle Spotlight Carousel"
                      >
                        <Star className={`w-3 h-3 ${item.isFeatured ? 'fill-amber-600 text-amber-600' : ''}`} />
                        <span>{item.isFeatured ? 'Featured' : 'Feature'}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(language === 'hi' ? 'क्या आप निश्चित रूप से इसे हटाना चाहते हैं?' : 'Are you sure you want to delete this media?')) {
                            deleteGalleryItem(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {displayedItems.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">
                {language === 'hi' ? 'कोई मीडिया उपलब्ध नहीं है' : 'No media items in this view'}
              </h4>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? 'नया फोटो अथवा वीडियो अपलोड करने के लिए ऊपर दिए बटन पर क्लिक करें।' : 'Click "Upload Photo / Video" to add moments from school events.'}
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-md cursor-pointer"
              >
                {language === 'hi' ? 'अभी अपलोड करें' : 'Upload Media Now'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox / Video Player Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setPreviewItem(null)}>
          <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full overflow-hidden border border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Stage: Video or Image */}
            <div className="max-h-[60vh] bg-black flex items-center justify-center relative">
              {previewItem.mediaType === 'video' || previewItem.videoURL ? (
                (() => {
                  const videoInfo = parseVideoUrl(previewItem.videoURL || '');
                  if (videoInfo.type === 'youtube' && videoInfo.videoId) {
                    return (
                      <div className="w-full aspect-16/9 max-h-[60vh]">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${videoInfo.videoId}?autoplay=1&rel=0`}
                          title={previewItem.titleEn}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    );
                  }
                  if (videoInfo.type === 'drive' && videoInfo.embedUrl) {
                    return (
                      <div className="w-full aspect-16/9 max-h-[60vh]">
                        <iframe
                          src={videoInfo.embedUrl}
                          title={previewItem.titleEn}
                          className="w-full h-full border-0"
                          allow="autoplay"
                          allowFullScreen
                        />
                      </div>
                    );
                  }
                  return (
                    <video
                      src={previewItem.videoURL || ''}
                      controls
                      autoPlay
                      className="max-h-[60vh] w-full object-contain"
                    />
                  );
                })()
              ) : (
                <img 
                  src={previewItem.imageURL || previewItem.imageUrl} 
                  alt={previewItem.titleEn}
                  className="max-h-[60vh] w-full object-contain"
                />
              )}
            </div>

            <div className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="text-amber-400 font-bold uppercase">
                  {previewItem.category}
                </span>
                {previewItem.mediaType === 'video' && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1">
                    <Video className="w-3 h-3" /> Video
                  </span>
                )}
                {previewItem.duration && (
                  <span className="text-slate-400 font-mono">Duration: {previewItem.duration}</span>
                )}
                {previewItem.date && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{previewItem.date}</span>
                  </>
                )}
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400">By: {previewItem.uploaderName || previewItem.uploadedBy || 'Faculty'}</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {language === 'hi' ? previewItem.titleHi : previewItem.titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {language === 'hi' ? (previewItem.captionHi || previewItem.captionEn) : (previewItem.captionEn || previewItem.captionHi)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
