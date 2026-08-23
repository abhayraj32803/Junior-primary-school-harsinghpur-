import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  getEffectiveUserProfilePhoto, 
  getUserInitials, 
  getRoleAvatarTheme 
} from '../../utils/avatarUtils';

export interface UserAvatarProps {
  userProfile?: Partial<UserProfile> | null;
  photoURL?: string | null;
  name?: string;
  role?: UserRole | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'rounded' | 'circle' | 'square';
  showOnlineStatus?: boolean;
  className?: string;
  imgClassName?: string;
  fallbackMode?: 'initials' | 'icon';
  onClick?: () => void;
  alt?: string;
}

const SIZE_MAP = {
  xs: {
    container: 'w-6 h-6',
    innerRadius: 'rounded-md',
    outerRadius: 'rounded-lg',
    text: 'text-[10px]',
    iconSize: 'w-3 h-3',
    border: 'p-0.5',
    indicator: 'w-2 h-2 -bottom-0.5 -right-0.5',
  },
  sm: {
    container: 'w-8 h-8',
    innerRadius: 'rounded-[10px]',
    outerRadius: 'rounded-xl',
    text: 'text-xs',
    iconSize: 'w-3.5 h-3.5',
    border: 'p-0.5',
    indicator: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
  },
  md: {
    container: 'w-10 h-10',
    innerRadius: 'rounded-[12px]',
    outerRadius: 'rounded-2xl',
    text: 'text-sm font-black',
    iconSize: 'w-4 h-4',
    border: 'p-0.5',
    indicator: 'w-3 h-3 -bottom-0.5 -right-0.5',
  },
  lg: {
    container: 'w-14 h-14 sm:w-16 sm:h-16',
    innerRadius: 'rounded-[14px]',
    outerRadius: 'rounded-2xl',
    text: 'text-lg font-black',
    iconSize: 'w-6 h-6',
    border: 'p-0.5 sm:p-1',
    indicator: 'w-3.5 h-3.5 bottom-0 right-0',
  },
  xl: {
    container: 'w-16 h-16 sm:w-20 sm:h-20',
    innerRadius: 'rounded-[16px]',
    outerRadius: 'rounded-2xl sm:rounded-3xl',
    text: 'text-2xl font-black',
    iconSize: 'w-8 h-8',
    border: 'p-1',
    indicator: 'w-4 h-4 bottom-0 right-0',
  },
  '2xl': {
    container: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32',
    innerRadius: 'rounded-[20px]',
    outerRadius: 'rounded-3xl',
    text: 'text-3xl sm:text-4xl font-black',
    iconSize: 'w-12 h-12',
    border: 'p-1 sm:p-1.5',
    indicator: 'w-5 h-5 bottom-1 right-1',
  },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  userProfile: propUserProfile,
  photoURL: propPhotoURL,
  name: propName,
  role: propRole,
  size = 'md',
  shape = 'rounded',
  showOnlineStatus = false,
  className = '',
  imgClassName = '',
  fallbackMode = 'initials',
  onClick,
  alt,
}) => {
  const authContext = useAuth();
  const contextProfile = authContext?.userProfile;

  // Resolve active profile & parameters
  const effectiveProfile = propUserProfile !== undefined ? propUserProfile : contextProfile;
  const effectivePhoto = getEffectiveUserProfilePhoto(effectiveProfile, propPhotoURL);
  const effectiveName = propName || effectiveProfile?.name || 'User';
  const effectiveRole = propRole || effectiveProfile?.role || 'user';

  const [hasImgError, setHasImgError] = useState(false);
  const theme = getRoleAvatarTheme(effectiveRole);
  const sizeConfig = SIZE_MAP[size];
  const FallbackIcon = theme.icon;

  const shapeClass = shape === 'circle' 
    ? 'rounded-full' 
    : shape === 'square' 
    ? 'rounded-none' 
    : sizeConfig.outerRadius;

  const innerShapeClass = shape === 'circle' 
    ? 'rounded-full' 
    : shape === 'square' 
    ? 'rounded-none' 
    : sizeConfig.innerRadius;

  const initials = getUserInitials(effectiveName, effectiveRole === 'admin' ? 'H' : effectiveRole === 'teacher' ? 'T' : 'S');
  const showImage = Boolean(effectivePhoto && !hasImgError);

  return (
    <div 
      className={`relative inline-block shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div 
        className={`
          ${sizeConfig.container} 
          ${shapeClass} 
          ${sizeConfig.border} 
          bg-gradient-to-br ${theme.gradient} 
          shadow-md overflow-hidden flex items-center justify-center
        `}
      >
        {showImage ? (
          <img
            src={effectivePhoto!}
            alt={alt || effectiveName}
            className={`w-full h-full object-cover ${innerShapeClass} ${imgClassName}`}
            referrerPolicy="no-referrer"
            onError={() => setHasImgError(true)}
          />
        ) : (
          <div 
            className={`w-full h-full ${theme.bgColor} ${innerShapeClass} flex items-center justify-center ${theme.textColor} select-none`}
            title={`${effectiveName} (${theme.label})`}
          >
            {fallbackMode === 'icon' ? (
              <FallbackIcon className={sizeConfig.iconSize} />
            ) : (
              <span className={`${sizeConfig.text} tracking-tighter`}>
                {initials}
              </span>
            )}
          </div>
        )}
      </div>

      {showOnlineStatus && (
        <span 
          className={`absolute ${sizeConfig.indicator} bg-emerald-500 border-2 border-slate-900 rounded-full shadow-xs ring-1 ring-white/10`} 
          title="Active Online"
        />
      )}
    </div>
  );
};
