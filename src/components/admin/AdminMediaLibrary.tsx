import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  X, 
  Copy, 
  ExternalLink,
  Lock,
  Globe,
  AlertTriangle,
  Star,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Edit3,
  Calendar,
  Sparkles,
  Layers,
  UserCheck,
  Check,
  Save,
  GripVertical,
  Wand2,
  RefreshCw,
  HelpCircle,
  SlidersHorizontal,
  Video,
  Film,
  Play,
  Youtube,
  Link2,
  Clock,
  Camera
} from 'lucide-react';
import { GalleryItem } from '../../types';
import { parseVideoUrl, captureVideoFrame } from '../../utils/mediaUtils';

export const AdminMediaLibrary: React.FC = () => {
  const { gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem, reorderGalleryItems, teachers, settings, updateSettings, language } = useSchool();
  const { userProfile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [uploaderFilter, setUploaderFilter] = useState<'all' | 'admin' | 'teacher'>('all');
  const [sortMode, setSortMode] = useState<'custom_sequence' | 'latest_date' | 'featured_first'>('custom_sequence');
  
  // Drag & Drop State
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // New Media Form State (Photo & Video support)
  const [uploadMediaType, setUploadMediaType] = useState<'photo' | 'video'>('photo');
  const [videoSourceType, setVideoSourceType] = useState<'youtube' | 'drive' | 'upload'>('youtube');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDuration, setNewVideoDuration] = useState('');
  const [newCustomThumbnail, setNewCustomThumbnail] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newTitleHi, setNewTitleHi] = useState('');
  const [newCaptionEn, setNewCaptionEn] = useState('');
  const [newCaptionHi, setNewCaptionHi] = useState('');
  const [newCategory, setNewCategory] = useState<string>('School Building');
  const [newImageURL, setNewImageURL] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newIsPublic, setNewIsPublic] = useState(true);
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [newUploaderName, setNewUploaderName] = useState(userProfile?.name || 'Smt. Kiran Shakya (Headmaster)');
  const [newPrivacyApproved, setNewPrivacyApproved] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    'School Building',
    'Classroom & Learning',
    'Sports & Playground',
    'Cultural Activities',
    'Independence & Republic Day',
    'Mid-Day Meal',
    'Teachers',
    'National Celebrations',
    'Facilities'
  ];

  const teacherVideos = gallery.filter(g => (g.mediaType === 'video' || !!g.videoURL) && (g.uploaderRole === 'Teacher' || (g.uploaderName && !g.uploaderName.includes('Headmaster') && !g.uploaderName.includes('Admin'))));
  const allowTeacherVideos = settings?.allowTeacherVideoUpload !== false;
  const requireVideoApproval = settings?.teacherVideoApprovalRequired === true;

  const handleToggleTeacherVideoUpload = async () => {
    const updated = !allowTeacherVideos;
    await updateSettings({ ...settings, allowTeacherVideoUpload: updated });
    showToast(
      updated
        ? (language === 'hi' ? 'शिक्षकों के लिए वीडियो अपलोड विकल्प सक्रिय किया गया!' : 'Teacher video upload feature enabled!')
        : (language === 'hi' ? 'शिक्षकों के लिए वीडियो अपलोड विकल्प निष्क्रिय किया गया।' : 'Teacher video upload feature disabled.'),
      'success'
    );
  };

  const handleToggleVideoApproval = async () => {
    const updated = !requireVideoApproval;
    await updateSettings({ ...settings, teacherVideoApprovalRequired: updated });
    showToast(
      updated
        ? (language === 'hi' ? 'शिक्षक वीडियो हेतु सत्यापन अनिवार्य किया गया।' : 'Admin review required for teacher video uploads.')
        : (language === 'hi' ? 'शिक्षक वीडियो सीधे सार्वजनिक रूप से प्रकाशित होंगे।' : 'Teacher videos will be published directly.'),
      'info'
    );
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotificationToast({ message, type });
    setTimeout(() => {
      setNotificationToast(null);
    }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewImageURL(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        alert('Please select a video file under 30MB or use a YouTube / Drive link.');
        return;
      }
      setVideoFileName(file.name);
      try {
        const frame = await captureVideoFrame(file);
        if (frame) setNewCustomThumbnail(frame);

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setNewVideoUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMediaType === 'photo' && !newImageURL) return;
    if (uploadMediaType === 'video' && !newVideoUrl) return;
    if (!newTitleEn) return;

    setIsUploading(true);

    try {
      const parsedVideo = uploadMediaType === 'video' ? parseVideoUrl(newVideoUrl) : null;
      const effectiveThumbnail = uploadMediaType === 'video'
        ? (newCustomThumbnail || (parsedVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80'))
        : newImageURL;

      await addGalleryItem({
        titleEn: newTitleEn.trim(),
        titleHi: newTitleHi.trim() || newTitleEn.trim(),
        captionEn: newCaptionEn.trim(),
        captionHi: newCaptionHi.trim() || newCaptionEn.trim(),
        category: newCategory,
        mediaType: uploadMediaType,
        imageURL: effectiveThumbnail,
        imageUrl: effectiveThumbnail,
        date: newDate,
        isPublic: newIsPublic,
        isFeatured: newIsFeatured,
        privacyApproved: newPrivacyApproved,
        uploadedBy: userProfile?.id || 'admin',
        uploaderRole: 'Headmaster',
        uploaderName: newUploaderName,
        sortOrder: gallery.length + 1,
        ...(uploadMediaType === 'video' ? {
          videoURL: parsedVideo?.cleanUrl || newVideoUrl,
          videoSource: videoSourceType,
          youtubeId: parsedVideo?.videoId,
          duration: newVideoDuration || '03:00',
          thumbnailURL: effectiveThumbnail
        } : {})
      });

      showToast(
        uploadMediaType === 'video'
          ? (language === 'hi' ? 'वीडियो सफलतापूर्वक अपलोड व अनुक्रमित हुआ!' : 'Video successfully uploaded and indexed!')
          : (language === 'hi' ? 'फोटो सफलतापूर्वक अपलोड हुई!' : 'Photo successfully uploaded and indexed!')
      );

      // Reset form
      setNewTitleEn('');
      setNewTitleHi('');
      setNewCaptionEn('');
      setNewCaptionHi('');
      setNewImageURL('');
      setNewVideoUrl('');
      setNewCustomThumbnail('');
      setVideoFileName('');
      setNewVideoDuration('');
      setNewIsFeatured(false);
      setIsUploadModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const targetRank = Math.max(1, Math.min(gallery.length, Number(editingItem.sortOrder) || 1));
      
      // Update item properties
      await updateGalleryItem(editingItem.id, {
        titleEn: editingItem.titleEn,
        titleHi: editingItem.titleHi,
        captionEn: editingItem.captionEn,
        captionHi: editingItem.captionHi,
        category: editingItem.category,
        date: editingItem.date,
        isPublic: editingItem.isPublic,
        isFeatured: editingItem.isFeatured,
        sortOrder: targetRank,
        uploaderName: editingItem.uploaderName,
        duration: editingItem.duration,
        videoURL: editingItem.videoURL
      });

      // Reposition in list if rank changed
      const currentIndex = gallery.findIndex(g => g.id === editingItem.id);
      if (currentIndex !== -1 && currentIndex !== (targetRank - 1)) {
        const updatedList = [...gallery];
        const [movedItem] = updatedList.splice(currentIndex, 1);
        updatedList.splice(targetRank - 1, 0, movedItem);
        await reorderGalleryItems(updatedList);
      }

      setEditingItem(null);
      showToast(language === 'hi' ? 'मीडिया विवरण व अनुक्रम अद्यतन किया गया!' : 'Media details & sequence updated!');
    } catch (err) {
      console.error(err);
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemId(id);
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverIndex(null);
    setIsDragging(false);
  };

  const handleDrop = async (targetIndex: number) => {
    if (!draggedItemId) return;
    const sourceIndex = gallery.findIndex(g => g.id === draggedItemId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      handleDragEnd();
      return;
    }

    const reordered = [...gallery];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    await reorderGalleryItems(reordered);
    showToast(
      language === 'hi'
        ? `मीडिया #${sourceIndex + 1} को क्रम #${targetIndex + 1} पर स्थानांतरित किया गया!`
        : `Media #${sourceIndex + 1} moved to position #${targetIndex + 1}!`
    );
    handleDragEnd();
  };

  // Direct In-Place Sort Order Number Input Handler
  const handleDirectSortOrderChange = async (itemId: string, newRankInput: number) => {
    if (isNaN(newRankInput) || newRankInput < 1) return;
    const targetRank = Math.max(1, Math.min(gallery.length, Math.floor(newRankInput)));
    const currentIndex = gallery.findIndex(g => g.id === itemId);
    if (currentIndex === -1 || (currentIndex + 1) === targetRank) return;

    const reordered = [...gallery];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetRank - 1, 0, moved);

    await reorderGalleryItems(reordered);
    showToast(
      language === 'hi'
        ? `मीडिया को क्रम #${targetRank} पर निर्धारित किया गया!`
        : `Media set to sequence rank #${targetRank}!`
    );
  };

  // Standard Government Portal Sequence Preset (मानक शासकीय क्रम)
  const applyStandardGovtSequence = async () => {
    const categoryPriority: Record<string, number> = {
      'School Building': 10,
      'Classroom & Learning': 20,
      'Mid-Day Meal': 30,
      'Sports & Playground': 40,
      'Independence & Republic Day': 50,
      'National Celebrations': 60,
      'Facilities': 70,
      'Cultural Activities': 80,
      'Teachers': 90
    };

    const sortedByGovtStandard = [...gallery].sort((a, b) => {
      const priorityA = categoryPriority[a.category] ?? 100;
      const priorityB = categoryPriority[b.category] ?? 100;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;

      const dateA = new Date(a.date || '').getTime() || 0;
      const dateB = new Date(b.date || '').getTime() || 0;
      return dateB - dateA;
    });

    await reorderGalleryItems(sortedByGovtStandard);
    showToast(
      language === 'hi'
        ? 'मानक शासकीय पोर्टल अनुक्रम (UP Basic Shiksha Norms) सफलतापूर्वक लागू हुआ!'
        : 'Standard Government Portal Sequence (UP Education Portal Norms) applied successfully!'
    );
  };

  // Normalize / Re-index 1..N
  const normalizeSequence = async () => {
    await reorderGalleryItems([...gallery]);
    showToast(
      language === 'hi'
        ? 'समस्त मीडिया अनुक्रम 1 से N तक री-इंडेक्स किया गया!'
        : 'All media sequence ranks normalized sequentially from 1 to N!'
    );
  };

  const moveSequence = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;

    const newArr = [...gallery];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    await reorderGalleryItems(newArr);
    showToast(
      language === 'hi'
        ? `मीडिया क्रम #${targetIndex + 1} पर भेजा गया!`
        : `Media moved to rank #${targetIndex + 1}!`
    );
  };

  const toggleFeatured = async (item: GalleryItem) => {
    await updateGalleryItem(item.id, { isFeatured: !item.isFeatured });
    showToast(item.isFeatured ? 'Removed from Spotlight Carousel' : 'Added to Spotlight Hero Carousel');
  };

  const togglePublic = async (item: GalleryItem) => {
    await updateGalleryItem(item.id, { isPublic: !item.isPublic });
    showToast(item.isPublic ? 'Media set to Internal Only' : 'Media published to Public Website');
  };

  const handleDelete = async (id: string) => {
    await deleteGalleryItem(id);
    setDeleteConfirmId(null);
    if (previewItem?.id === id) setPreviewItem(null);
    showToast(language === 'hi' ? 'मीडिया हटा दिया गया!' : 'Media deleted successfully!');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('URL Copied to clipboard!', 'info');
  };

  // Filter & Sort Display
  const filteredAndSortedMedia = [...gallery].filter(item => {
    const matchesSearch = item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.titleHi && item.titleHi.includes(searchQuery)) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.uploaderName && item.uploaderName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    
    const matchesMediaType = mediaTypeFilter === 'all'
      ? true
      : mediaTypeFilter === 'video'
        ? item.mediaType === 'video' || !!item.videoURL
        : item.mediaType === 'photo' || (!item.videoURL && item.mediaType !== 'video');

    const matchesUploader = uploaderFilter === 'all' 
      ? true 
      : uploaderFilter === 'admin' 
        ? item.uploaderRole === 'Admin' || item.uploaderRole === 'Headmaster' || !item.uploaderRole
        : item.uploaderRole === 'Teacher';

    return matchesSearch && matchesCat && matchesMediaType && matchesUploader;
  }).sort((a, b) => {
    if (sortMode === 'featured_first') {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    }
    if (sortMode === 'latest_date') {
      return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
    }
    // Default custom sequence
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  const photoCount = gallery.filter(g => g.mediaType !== 'video' && !g.videoURL).length;
  const videoCount = gallery.filter(g => g.mediaType === 'video' || !!g.videoURL).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {language === 'hi' ? 'केंद्रीय मीडिया व वीडियो अनुक्रम प्रबंधन' : 'Centralized Photo & Video Manager'}
              </span>
              <span className="text-xs text-slate-500 font-semibold">{photoCount} Photos • {videoCount} Videos</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {language === 'hi' ? 'फोटो व वीडियो लाइब्रेरी एवं अनुक्रम नियंत्रण' : 'Photo & Video Gallery Sequence Control'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'hi'
                ? 'फोटो अथवा वीडियो को ड्रैग-एंड-ड्रॉप करें, सीधे क्रम संख्या (#) बदलें, तथा शिक्षक द्वारा अपलोड वीडियो प्रबंधित करें।'
                : 'Drag & drop media, edit sort rank (#) numbers, and manage both teacher-uploaded photos and activity videos.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Apply Standard Govt Sequence Preset Button */}
          <button
            onClick={applyStandardGovtSequence}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black shadow-xs transition-all cursor-pointer"
            title="Sort according to official UP Basic Shiksha Department guidelines"
            id="btn-apply-govt-sequence"
          >
            <Wand2 className="w-4 h-4 text-amber-400" />
            <span>{language === 'hi' ? 'शासकीय मानक अनुक्रम लागू करें' : 'Apply Govt Portal Sequence'}</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer shrink-0"
            id="btn-upload-media-asset"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? 'नया फोटो / वीडियो अपलोड करें' : 'Upload Photo / Video'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Notification Toast */}
      {notificationToast && (
        <div className={`p-3.5 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 animate-fade-in shadow-xs ${
          notificationToast.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-amber-50 border border-amber-200 text-amber-900'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationToast.message}</span>
        </div>
      )}

      {/* Teacher Video Upload Feature & Moderation Control Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            allowTeacherVideos 
              ? 'bg-rose-500/10 text-rose-600 border-rose-500/30' 
              : 'bg-slate-100 text-slate-400 border-slate-200'
          }`}>
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                allowTeacherVideos 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {allowTeacherVideos ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {language === 'hi' ? 'शिक्षक वीडियो अपलोड: सक्रिय (Enabled)' : 'Teacher Video Upload: Active'}
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3 text-rose-600" />
                    {language === 'hi' ? 'शिक्षक वीडियो अपलोड: निष्क्रिय (Disabled)' : 'Teacher Video Upload: Restricted'}
                  </>
                )}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {teacherVideos.length} {language === 'hi' ? 'शिक्षक वीडियो पोर्टल में संलग्न' : 'Faculty Videos in Archive'}
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-1">
              {language === 'hi' ? 'शिक्षक वीडियो अपलोड विकल्प व अनुमति नियंत्रण' : 'Teacher Video Upload Option & Permissions'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              {language === 'hi'
                ? 'शिक्षकों को अपने शिक्षक पोर्टल से कक्षा शिक्षण, निपुण भारत गतिविधियां एवं खेलकूद वीडियो अपलोड करने की अनुमति प्रदान करें।'
                : 'Allow teachers to upload classroom FLN demonstrations, sports drills, and cultural videos directly from their Teacher Portal.'}
            </p>
          </div>
        </div>

        {/* Quick Toggles for Admin */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch sm:self-auto justify-end">
          <button
            onClick={handleToggleTeacherVideoUpload}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              allowTeacherVideos
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
            }`}
            title="Toggle whether teachers can upload videos"
          >
            <Video className="w-4 h-4" />
            <span>
              {allowTeacherVideos
                ? (language === 'hi' ? 'वीडियो अपलोड अनुमति चालू है' : 'Upload Allowed (Click to Disable)')
                : (language === 'hi' ? 'वीडियो अपलोड चालू करें' : 'Enable Teacher Upload')}
            </span>
          </button>

          <button
            onClick={handleToggleVideoApproval}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-2xs flex items-center gap-1.5 cursor-pointer ${
              requireVideoApproval
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Toggle whether uploaded videos need admin approval before showing publicly"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>
              {requireVideoApproval
                ? (language === 'hi' ? 'सत्यापन आवश्यक (Moderated)' : 'Review Required')
                : (language === 'hi' ? 'सीधा प्रकाशन (Direct Publish)' : 'Direct Publish')}
            </span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Instructions & Reordering Helper Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
            <GripVertical className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
              {language === 'hi' ? 'ड्रैग-एंड-ड्रॉप व क्रम संख्या (#) संपादन मार्गदर्शिका' : 'Drag-and-Drop & Rank Editing Protocol'}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {language === 'hi'
                ? 'कार्ड को ग्रिप हैंडल से ड्रैग करें, अथवा [# संख्या] बॉक्स में सीधे मनचाहा क्रम टाइप कर Enter दबाएं।'
                : 'Drag cards by the handle or directly edit the [# rank] input to sequence photos and videos in standard sequence.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={normalizeSequence}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Normalize sort order numbers 1 to N"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'hi' ? 'क्रम री-इंडेक्स (1..N)' : 'Normalize 1..N'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Sequence Controls Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'शीर्षक, श्रेणी या शिक्षक नाम खोजें...' : 'Search by title, tag, or uploader...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Media Type Filter: All / Photos / Videos */}
          <div className="md:col-span-3 flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setMediaTypeFilter('all')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                mediaTypeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({gallery.length})
            </button>
            <button
              onClick={() => setMediaTypeFilter('photo')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                mediaTypeFilter === 'photo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3 h-3 text-amber-600" />
              <span>Photos ({photoCount})</span>
            </button>
            <button
              onClick={() => setMediaTypeFilter('video')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                mediaTypeFilter === 'video' ? 'bg-rose-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-3 h-3" />
              <span>Videos ({videoCount})</span>
            </button>
          </div>

          {/* Uploader Filter */}
          <div className="md:col-span-3 flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setUploaderFilter('all')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                uploaderFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Roles
            </button>
            <button
              onClick={() => setUploaderFilter('admin')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                uploaderFilter === 'admin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Headmaster
            </button>
            <button
              onClick={() => setUploaderFilter('teacher')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                uploaderFilter === 'teacher' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Teachers
            </button>
          </div>

          {/* Sequence Sorting Preset */}
          <div className="md:col-span-2 flex items-center justify-end gap-1">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as any)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-amber-500"
            >
              <option value="custom_sequence">Govt Rank (#)</option>
              <option value="featured_first">Spotlights First</option>
              <option value="latest_date">Latest Date</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({gallery.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Sequence Grid with Full Drag & Drop Support */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredAndSortedMedia.map((item, index) => {
          const img = item.thumbnailURL || item.imageURL || item.imageUrl || '';
          const isVideo = item.mediaType === 'video' || !!item.videoURL;
          const isItemDragged = draggedItemId === item.id;
          const isTargetDrop = dragOverIndex === index && !isItemDragged;

          return (
            <div 
              key={item.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={() => { if (dragOverIndex === index) setDragOverIndex(null); }}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              className={`bg-white rounded-3xl border transition-all flex flex-col justify-between group relative select-none ${
                isItemDragged ? 'opacity-40 scale-95 border-dashed border-amber-500 shadow-none' : 'shadow-xs hover:shadow-xl'
              } ${
                isTargetDrop 
                  ? 'border-2 border-amber-500 ring-4 ring-amber-500/20 scale-[1.02] bg-amber-50/40' 
                  : 'border-slate-200 hover:border-amber-400'
              }`}
            >
              {/* Target Drop Indicator Line */}
              {isTargetDrop && (
                <div className="absolute inset-x-0 -top-2 h-1.5 bg-amber-500 rounded-full z-30 animate-pulse shadow-xs" />
              )}

              {/* Image / Video Box */}
              <div 
                className="relative aspect-4/3 bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing" 
                onClick={() => setPreviewItem(item)}
              >
                <img 
                  src={img} 
                  alt={item.titleEn} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                  loading="lazy"
                />
                
                {/* Drag Handle & Inline Direct Sort Order Input */}
                <div 
                  className="absolute top-2 left-2 flex flex-wrap gap-1.5 items-center z-10" 
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drag Handle Icon */}
                  <div 
                    className="w-7 h-7 rounded-lg bg-slate-950/80 backdrop-blur-xs text-slate-300 hover:text-amber-400 flex items-center justify-center cursor-grab active:cursor-grabbing border border-slate-700/50 shadow-xs"
                    title="Click and drag to reorder position in gallery"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Direct In-Place Editable Sort Order Input */}
                  <div 
                    className="flex items-center gap-0.5 bg-slate-950/90 backdrop-blur-xs text-white rounded-lg px-2 py-0.5 border border-slate-700/70 shadow-xs"
                    title="Click to type a sequence rank number (e.g. 1, 2, 3) and press Enter"
                  >
                    <span className="text-[10px] text-amber-400 font-mono font-black">#</span>
                    <input
                      type="number"
                      min={1}
                      max={gallery.length}
                      defaultValue={item.sortOrder || index + 1}
                      key={`${item.id}-${item.sortOrder}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleDirectSortOrderChange(item.id, Number((e.target as HTMLInputElement).value));
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (val && val !== item.sortOrder) {
                          handleDirectSortOrderChange(item.id, val);
                        }
                      }}
                      className="w-7 bg-transparent text-amber-300 text-xs font-mono font-black text-center focus:outline-hidden focus:bg-slate-800 rounded py-0"
                    />
                  </div>

                  {isVideo ? (
                    <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-black flex items-center gap-1 shadow-xs">
                      <Video className="w-2.5 h-2.5" /> Video
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Duration Badge */}
                {isVideo && item.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold z-10">
                    {item.duration}
                  </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                  {item.isFeatured && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-0.5 shadow-md">
                      <Star className="w-2.5 h-2.5 fill-slate-950" /> Featured
                    </span>
                  )}
                  {item.isPublic ? (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs">
                      <Globe className="w-2.5 h-2.5" /> Public
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs">
                      <Lock className="w-2.5 h-2.5" /> Internal
                    </span>
                  )}
                </div>

                {/* Hover Overlay Button */}
                <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                    className="p-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:scale-105 transition-transform cursor-pointer"
                    title={isVideo ? 'Play Video' : 'Preview Fullscreen'}
                  >
                    {isVideo ? <Play className="w-4 h-4 fill-slate-900" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
                    className="p-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md hover:scale-105 transition-transform cursor-pointer"
                    title="Edit Metadata & Sequence"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.videoURL || img); }}
                    className="p-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:scale-105 transition-transform cursor-pointer"
                    title="Copy Media URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      <span>{item.date || 'Recent'}</span>
                    </span>
                    <span className="text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md text-[10px] truncate max-w-[120px]">
                      {item.uploaderName || item.uploadedBy || 'Admin'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                    {language === 'hi' && item.titleHi ? item.titleHi : item.titleEn}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {language === 'hi' && item.captionHi ? item.captionHi : item.captionEn || item.titleEn}
                  </p>
                </div>

                {/* Sequence Reorder & Quick Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Sequence Move Arrows */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveSequence(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Move up 1 rank in sequence"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveSequence(index, 'down')}
                      disabled={index === gallery.length - 1}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Move down 1 rank in sequence"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleFeatured(item)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        item.isFeatured 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : 'bg-slate-100 text-slate-400 hover:text-amber-600'
                      }`}
                      title={item.isFeatured ? 'Remove from Hero Spotlight' : 'Add to Hero Spotlight Carousel'}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => togglePublic(item)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        item.isPublic 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                      title={item.isPublic ? 'Publicly Visible' : 'Hidden / Internal Only'}
                    >
                      {item.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Edit metadata & sequence rank"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Media"
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

      {filteredAndSortedMedia.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">No media assets found</h3>
          <p className="text-xs text-slate-500">Try selecting another category or media filter.</p>
        </div>
      )}

      {/* EDIT MEDIA MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-slate-900">Edit Media Details & Sequence</h3>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMedia} className="space-y-4">
              {/* Media Thumbnail */}
              <div className="aspect-16/9 bg-slate-950 rounded-2xl overflow-hidden relative">
                <img 
                  src={editingItem.thumbnailURL || editingItem.imageURL || editingItem.imageUrl} 
                  alt={editingItem.titleEn} 
                  className="w-full h-full object-cover"
                />
                {(editingItem.mediaType === 'video' || editingItem.videoURL) && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                )}
              </div>

              {/* Title EN & HI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title (English) *</label>
                  <input
                    type="text"
                    value={editingItem.titleEn}
                    onChange={(e) => setEditingItem({ ...editingItem, titleEn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">शीर्षक (हिंदी)</label>
                  <input
                    type="text"
                    value={editingItem.titleHi || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, titleHi: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Video URL or Duration if applicable */}
              {(editingItem.mediaType === 'video' || editingItem.videoURL) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Film className="w-3.5 h-3.5 text-rose-600" /> Video URL
                    </label>
                    <input
                      type="text"
                      value={editingItem.videoURL || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, videoURL: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-600" /> Duration
                    </label>
                    <input
                      type="text"
                      value={editingItem.duration || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                      placeholder="e.g. 03:45"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Captions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Caption (English)</label>
                  <textarea
                    rows={2}
                    value={editingItem.captionEn || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, captionEn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">विवरण (हिंदी)</label>
                  <textarea
                    rows={2}
                    value={editingItem.captionHi || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, captionHi: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Category, Date & Sequence */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={editingItem.date || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sequence Rank (#)</label>
                  <input
                    type="number"
                    min={1}
                    max={gallery.length}
                    value={editingItem.sortOrder ?? 1}
                    onChange={(e) => setEditingItem({ ...editingItem, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Uploader Attribution */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Uploaded By (Attribution)</label>
                <input
                  type="text"
                  value={editingItem.uploaderName || editingItem.uploadedBy || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, uploaderName: e.target.value })}
                  placeholder="e.g. Smt. Kiran Shakya / Sri Teacher Name"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Checkboxes */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isFeatured || false}
                    onChange={(e) => setEditingItem({ ...editingItem, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span>Spotlight Hero Showcase (कॉलेज मुख्य कैरोसेल में दिखाएं)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isPublic}
                    onChange={(e) => setEditingItem({ ...editingItem, isPublic: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span>Show publicly on School Website Gallery</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-slate-900">Confirm Deletion</h3>
              <p className="text-xs text-slate-600">Are you sure you want to permanently delete this media asset? This will remove it from the public gallery and all sequence lists.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview / Video Player Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setPreviewItem(null)}>
          <div className="bg-slate-900 rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border border-slate-800 space-y-4 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-16/9 bg-slate-950 flex items-center justify-center">
              {previewItem.mediaType === 'video' || previewItem.videoURL ? (
                (() => {
                  const videoInfo = parseVideoUrl(previewItem.videoURL || '');
                  if (videoInfo.type === 'youtube' && videoInfo.videoId) {
                    return (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoInfo.videoId}?autoplay=1&rel=0`}
                        title={previewItem.titleEn}
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
                        title={previewItem.titleEn}
                        className="w-full h-full border-0"
                        allow="autoplay"
                        allowFullScreen
                      />
                    );
                  }
                  return (
                    <video
                      src={previewItem.videoURL || ''}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  );
                })()
              ) : (
                <img 
                  src={previewItem.imageURL || previewItem.imageUrl} 
                  alt={previewItem.titleEn} 
                  className="max-h-full max-w-full object-contain" 
                />
              )}
              <button 
                onClick={() => setPreviewItem(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-2">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                  {previewItem.category}
                </span>
                {previewItem.mediaType === 'video' && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1">
                    <Video className="w-3 h-3" /> Video
                  </span>
                )}
                {previewItem.duration && <span className="font-mono text-rose-300">Duration: {previewItem.duration}</span>}
                <span className="text-slate-400 font-mono">{previewItem.date}</span>
                <span className="text-emerald-400">By: {previewItem.uploaderName || previewItem.uploadedBy || 'Admin'}</span>
              </div>
              <h3 className="font-black text-lg text-white">{previewItem.titleEn}</h3>
              {previewItem.titleHi && <p className="font-semibold text-sm text-slate-300">{previewItem.titleHi}</p>}
              {previewItem.captionEn && <p className="text-xs text-slate-400">{previewItem.captionEn}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Upload Media Modal (Supports both Photo & Video) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-slate-900">Upload Media Asset</h3>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Switch Photo vs Video */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setUploadMediaType('photo')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  uploadMediaType === 'photo' ? 'bg-white text-slate-950 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-4 h-4 text-amber-600" />
                <span>Photo (चित्र)</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMediaType('video')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  uploadMediaType === 'video' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video (वीडियो)</span>
              </button>
            </div>

            <form onSubmit={handleCreateMedia} className="space-y-4">
              {/* Media File Upload Box */}
              {uploadMediaType === 'photo' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Image File</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-amber-400 transition-colors bg-slate-50">
                    {newImageURL ? (
                      <div className="space-y-3">
                        <img src={newImageURL} alt="Preview" className="h-32 mx-auto rounded-xl object-cover shadow-xs" />
                        <button 
                          type="button" 
                          onClick={() => setNewImageURL('')}
                          className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Choose different image
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer space-y-2 block">
                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                        <div className="text-xs font-bold text-slate-700">Click or drag image to upload</div>
                        <div className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</div>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                      <Film className="w-4 h-4 text-rose-600" /> Video Source
                    </span>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-rose-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setVideoSourceType('youtube')}
                        className={`px-2 py-0.5 rounded font-bold ${videoSourceType === 'youtube' ? 'bg-rose-600 text-white' : 'text-slate-600'}`}
                      >
                        YouTube
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoSourceType('drive')}
                        className={`px-2 py-0.5 rounded font-bold ${videoSourceType === 'drive' ? 'bg-rose-600 text-white' : 'text-slate-600'}`}
                      >
                        Drive
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoSourceType('upload')}
                        className={`px-2 py-0.5 rounded font-bold ${videoSourceType === 'upload' ? 'bg-rose-600 text-white' : 'text-slate-600'}`}
                      >
                        Direct File
                      </button>
                    </div>
                  </div>

                  {videoSourceType !== 'upload' ? (
                    <div>
                      <input
                        type="url"
                        placeholder={videoSourceType === 'youtube' ? "https://www.youtube.com/watch?v=..." : "https://drive.google.com/file/d/..."}
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs text-slate-900 focus:outline-hidden focus:border-rose-600"
                        required
                      />
                    </div>
                  ) : (
                    <div className="border border-dashed border-rose-300 rounded-xl p-4 bg-white text-center">
                      <input type="file" accept="video/*" onChange={handleVideoFileUpload} className="text-xs" />
                      {videoFileName && <span className="text-xs text-emerald-600 block mt-1">{videoFileName}</span>}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Duration (e.g. 04:15)"
                      value={newVideoDuration}
                      onChange={(e) => setNewVideoDuration(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-xs text-slate-900"
                    />
                    <input
                      type="url"
                      placeholder="Custom Poster URL (opt)"
                      value={newCustomThumbnail}
                      onChange={(e) => setNewCustomThumbnail(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Title EN & HI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title (English) *</label>
                  <input
                    type="text"
                    value={newTitleEn}
                    onChange={(e) => setNewTitleEn(e.target.value)}
                    placeholder="e.g. Republic Day Celebration"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">शीर्षक (हिंदी)</label>
                  <input
                    type="text"
                    value={newTitleHi}
                    onChange={(e) => setNewTitleHi(e.target.value)}
                    placeholder="उदा. गणतंत्र दिवस समारोह"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Uploader Attribution */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Uploader Name</label>
                <input
                  type="text"
                  value={newUploaderName}
                  onChange={(e) => setNewUploaderName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Privacy Consent & Spotlight Controls */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Display & Spotlight Controls</span>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsFeatured}
                    onChange={(e) => setNewIsFeatured(e.target.checked)}
                    className="rounded-sm text-amber-600 focus:ring-amber-500"
                  />
                  <span>Feature in Hero Spotlight Carousel (कॉलेज मुख्य स्लाइडर)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsPublic}
                    onChange={(e) => setNewIsPublic(e.target.checked)}
                    className="rounded-sm text-amber-600 focus:ring-amber-500"
                  />
                  <span>Show publicly on School Website Gallery</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPrivacyApproved}
                    onChange={(e) => setNewPrivacyApproved(e.target.checked)}
                    className="rounded-sm text-amber-600 focus:ring-amber-500"
                  />
                  <span>Institutional Media Privacy Compliance Confirmed</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (uploadMediaType === 'photo' ? !newImageURL : !newVideoUrl) || !newTitleEn}
                  className={`px-5 py-2 rounded-xl text-xs font-black shadow-md transition-all disabled:opacity-50 cursor-pointer ${
                    uploadMediaType === 'video' ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  }`}
                >
                  {isUploading ? 'Uploading...' : uploadMediaType === 'video' ? 'Publish Video' : 'Publish Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
