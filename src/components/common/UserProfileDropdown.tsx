import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  User, 
  LogOut, 
  ShieldCheck, 
  BookOpen, 
  GraduationCap, 
  KeyRound, 
  Camera, 
  ExternalLink, 
  ChevronDown,
  Building2,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { ProfilePhotoModal } from './ProfilePhotoModal';
import { UserAvatar } from './UserAvatar';

interface UserProfileDropdownProps {
  onNavigateProfile?: () => void;
  onNavigatePublic?: () => void;
  onOpenPasswordChange?: () => void;
  onLogout?: () => Promise<void> | void;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  onNavigateProfile,
  onNavigatePublic,
  onOpenPasswordChange,
  onLogout
}) => {
  const { userProfile, role, logout } = useAuth();
  const { settings, language } = useSchool();
  const [isOpen, setIsOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return {
          label: language === 'hi' ? 'प्रधानाध्यापक (Headmaster)' : 'Headmaster / Admin',
          icon: ShieldCheck,
          bg: 'bg-red-500/10 text-red-400 border-red-500/30'
        };
      case 'teacher':
        return {
          label: language === 'hi' ? 'सहायक अध्यापक (Faculty)' : 'Assistant Teacher',
          icon: BookOpen,
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        };
      case 'student':
        return {
          label: language === 'hi' ? 'पंजीकृत छात्र (Student)' : 'Enrolled Student',
          icon: GraduationCap,
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
        };
      default:
        return {
          label: 'User',
          icon: User,
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
        };
    }
  };

  const roleInfo = getRoleBadge();
  const RoleIcon = roleInfo.icon;

  const handleLogout = async () => {
    setIsOpen(false);
    if (onLogout) {
      await onLogout();
    } else {
      await logout();
      if (onNavigatePublic) {
        onNavigatePublic();
      }
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button - College Style User Pill */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-white border border-slate-700 hover:border-amber-400/50 shadow-md transition-all group cursor-pointer"
          id="btn-user-profile-menu"
        >
          {/* Avatar with Online Pulse */}
          <UserAvatar 
            userProfile={userProfile}
            size="sm"
            showOnlineStatus={true}
          />

          {/* User Name & Designation */}
          <div className="hidden sm:block text-left max-w-[130px] md:max-w-[170px] truncate">
            <div className="text-xs font-bold text-white truncate leading-tight group-hover:text-amber-300 transition-colors">
              {userProfile?.fullName || userProfile?.name || 'User Profile'}
            </div>
            <div className="text-[10px] text-amber-400/90 font-medium truncate flex items-center gap-1">
              <RoleIcon className="w-3 h-3 shrink-0" />
              <span className="truncate">{userProfile?.role === 'admin' ? 'Headmaster' : userProfile?.role === 'teacher' ? 'Faculty' : 'Student'}</span>
            </div>
          </div>

          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2.5 w-80 sm:w-88 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2">
            
            {/* Profile Overview Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 relative overflow-hidden">
              <div className="flex items-start gap-3.5 relative z-10">
                {/* Interactive Avatar with Camera Upload Icon */}
                <div className="relative group/avatar shrink-0">
                  <UserAvatar
                    userProfile={userProfile}
                    size="lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsPhotoModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="absolute inset-0 bg-slate-950/70 rounded-2xl opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-[10px] text-white font-bold transition-opacity cursor-pointer gap-0.5"
                    title="Change Profile Photo"
                  >
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Change</span>
                  </button>
                </div>

                {/* Profile Identity Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${roleInfo.bg}`}>
                      <RoleIcon className="w-3 h-3" />
                      <span>{roleInfo.label}</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-white truncate">{userProfile?.name}</h3>
                  
                  <div className="text-[11px] font-mono text-amber-400 font-bold truncate">
                    ID: {userProfile?.username || userProfile?.employeeId || userProfile?.admissionNumber}
                  </div>

                  {userProfile?.designation && (
                    <div className="text-[11px] text-slate-400 truncate">
                      {userProfile.designation}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Snapshot */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 gap-1 text-[11px] text-slate-400 font-medium">
                {userProfile?.phone && (
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{userProfile.phone}</span>
                  </div>
                )}
                {userProfile?.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{userProfile.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-500 text-[10px] pt-1">
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{settings.schoolName} (UDISE: {settings.schoolCode})</span>
                </div>
              </div>
            </div>

            {/* Menu Links */}
            <div className="p-1.5 space-y-1">
              
              {/* Change Profile Photo */}
              <button
                type="button"
                onClick={() => {
                  setIsPhotoModalOpen(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Camera className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>{language === 'hi' ? 'प्रोफ़ाइल फ़ोटो बदलें' : 'Update Profile Photo'}</span>
                </div>
                <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-md font-bold">
                  {language === 'hi' ? 'फ़ोटो' : 'Avatar'}
                </span>
              </button>

              {/* View Profile Tab */}
              {onNavigateProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateProfile();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>{language === 'hi' ? 'मेरी आधिकारिक प्रोफाइल' : 'My Official Profile & ID'}</span>
                  </div>
                </button>
              )}

              {/* Change Password */}
              {onOpenPasswordChange && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenPasswordChange();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>{language === 'hi' ? 'पासवर्ड बदलें (Security)' : 'Change Security Password'}</span>
                  </div>
                </button>
              )}

              {/* Public Portal Shortcut */}
              {onNavigatePublic && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigatePublic();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>{language === 'hi' ? 'सार्वजनिक वेबसाइट देखें' : 'View Public Website'}</span>
                  </div>
                </button>
              )}

            </div>

            {/* Prominent Red Logout Button */}
            <div className="p-1.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 hover:border-rose-600 text-xs font-black transition-all shadow-md cursor-pointer group"
                id="btn-dropdown-logout"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>{language === 'hi' ? 'लॉगआउट / साइन आउट (Sign Out)' : 'Sign Out / Logout'}</span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </>
  );
};
