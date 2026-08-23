import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { Modal } from './Modal';
import { UserAvatar } from './UserAvatar';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  User, 
  Image as ImageIcon,
  ShieldCheck,
  GraduationCap,
  Users
} from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Curated academic & professional avatars
const AVATAR_PRESETS = [
  {
    category: 'Headmaster / Admin',
    items: [
      { id: 'hm-1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80', label: 'Female Principal' },
      { id: 'hm-2', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80', label: 'Male Principal' },
      { id: 'hm-3', url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=300&auto=format&fit=crop&q=80', label: 'Senior Educator' },
      { id: 'hm-4', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', label: 'Officer' },
    ]
  },
  {
    category: 'Teachers / Faculty',
    items: [
      { id: 'tch-1', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80', label: 'Female Teacher' },
      { id: 'tch-2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', label: 'Male Teacher' },
      { id: 'tch-3', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80', label: 'Science Faculty' },
      { id: 'tch-4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', label: 'Maths Teacher' },
    ]
  },
  {
    category: 'Students / Scholars',
    items: [
      { id: 'stu-1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80', label: 'Boy Student' },
      { id: 'stu-2', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', label: 'Girl Student' },
      { id: 'stu-3', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80', label: 'Primary Scholar' },
      { id: 'stu-4', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80', label: 'Upper Primary Scholar' },
    ]
  }
];

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfileState, updateStudentProfile } = useAuth();
  const { updateStudent, updateTeacher, language } = useSchool();
  
  const [selectedPhoto, setSelectedPhoto] = useState<string>(userProfile?.photoURL || userProfile?.profilePhoto || '');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'upload'>('presets');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    const photoToSave = customUrl.trim() || selectedPhoto;
    if (!photoToSave) return;

    // Update auth profile state & database
    updateUserProfileState({ photoURL: photoToSave, profilePhoto: photoToSave });

    // Also update student or teacher record in database
    if (userProfile?.role === 'student') {
      if (userProfile.uid) {
        await updateStudentProfile(userProfile.uid, { photoURL: photoToSave, profilePhoto: photoToSave });
      }
      const targetId = userProfile.linkedEntityId || userProfile.uid;
      if (targetId) {
        updateStudent(targetId, { photoURL: photoToSave, profilePhoto: photoToSave });
      }
    } else if (userProfile?.role === 'teacher' && userProfile?.linkedEntityId) {
      updateTeacher(userProfile.linkedEntityId, { photoURL: photoToSave, profilePhoto: photoToSave });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedPhoto(result);
        setCustomUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'hi' ? 'प्रोफ़ाइल फ़ोटो अपडेट करें' : 'Update Official Profile Picture'}
    >
      <div className="space-y-5">
        
        {/* Current Preview Card */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center gap-4 border border-slate-800 shadow-md">
          <UserAvatar
            userProfile={userProfile}
            photoURL={selectedPhoto}
            size="xl"
            shape="rounded"
          />

          <div className="min-w-0 flex-1">
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              {userProfile?.role === 'admin' ? 'Headmaster Profile' : userProfile?.role === 'teacher' ? 'Faculty Profile' : 'Student Identity'}
            </div>
            <div className="text-sm font-black text-white truncate">{userProfile?.name}</div>
            <div className="text-[11px] text-slate-400 font-mono">ID: {userProfile?.username}</div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'presets' 
                ? 'bg-white text-slate-950 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'hi' ? 'गैलरी अवतार' : 'Verified Avatars'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'upload' 
                ? 'bg-white text-slate-950 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'hi' ? 'फ़ाइल अपलोड' : 'Upload Photo'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'custom' 
                ? 'bg-white text-slate-950 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'hi' ? 'फ़ोटो URL' : 'Image URL'}
          </button>
        </div>

        {/* Preset Avatars */}
        {activeTab === 'presets' && (
          <div className="space-y-4 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {AVATAR_PRESETS.map((grp) => (
              <div key={grp.category} className="space-y-2">
                <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  {grp.category}
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {grp.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(item.url);
                        setCustomUrl(item.url);
                      }}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-0.5 group cursor-pointer ${
                        selectedPhoto === item.url 
                          ? 'border-amber-500 ring-2 ring-amber-400/50 scale-95 shadow-md' 
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img 
                        src={item.url} 
                        alt={item.label} 
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform" 
                        referrerPolicy="no-referrer"
                      />
                      {selectedPhoto === item.url && (
                        <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload File */}
        {activeTab === 'upload' && (
          <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center space-y-3 transition-colors bg-slate-50">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                {language === 'hi' ? 'डिवाइस से फ़ोटो चुनें' : 'Choose photo from your device'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">PNG, JPG or WEBP up to 5MB</div>
            </div>
            <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm">
              <Camera className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'फ़ाइल ब्राउज़ करें' : 'Browse File'}</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>
        )}

        {/* Custom URL */}
        {activeTab === 'custom' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {language === 'hi' ? 'वेब इमेज URL दर्ज करें' : 'Direct Photo Web URL'}
            </label>
            <input 
              type="url" 
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                setSelectedPhoto(e.target.value);
              }}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white"
            />
          </div>
        )}

        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{language === 'hi' ? 'प्रोफ़ाइल फ़ोटो सफलतापूर्वक सुरक्षित की गई!' : 'Profile photo updated successfully!'}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            {language === 'hi' ? 'रद्द करें' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'hi' ? 'फ़ोटो सुरक्षित करें' : 'Save Photo'}</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};
