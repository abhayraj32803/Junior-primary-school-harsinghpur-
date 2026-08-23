import { UserProfile, UserRole } from '../types';
import { User, ShieldCheck, BookOpen, GraduationCap, LucideIcon } from 'lucide-react';

export interface AvatarTheme {
  gradient: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: LucideIcon;
  label: string;
}

/**
 * Resolves the effective photo URL for a user from their authentication profile
 * and any linked entity profile with robust fallback handling.
 */
export function getEffectiveUserProfilePhoto(
  userProfile?: Partial<UserProfile> | null,
  fallbackEntityPhoto?: string | null
): string | null {
  if (userProfile?.photoURL && userProfile.photoURL.trim() !== '') {
    return userProfile.photoURL.trim();
  }
  if (fallbackEntityPhoto && fallbackEntityPhoto.trim() !== '') {
    return fallbackEntityPhoto.trim();
  }
  return null;
}

/**
 * Extracts clean uppercase initials from a user's full name.
 */
export function getUserInitials(name?: string | null, defaultChar: string = 'U'): string {
  if (!name || name.trim() === '') return defaultChar.toUpperCase();
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Returns role-tailored color accents and iconic badges for fallback avatars.
 */
export function getRoleAvatarTheme(role?: UserRole | string): AvatarTheme {
  switch (role) {
    case 'admin':
      return {
        gradient: 'from-gov-amber-500 via-amber-600 to-amber-700',
        bgColor: 'bg-gov-navy-950',
        textColor: 'text-gov-amber-400',
        borderColor: 'border-gov-amber-400/40',
        icon: ShieldCheck,
        label: 'Headmaster / Admin',
      };
    case 'teacher':
      return {
        gradient: 'from-emerald-500 via-teal-600 to-emerald-700',
        bgColor: 'bg-slate-900',
        textColor: 'text-emerald-300',
        borderColor: 'border-emerald-500/40',
        icon: BookOpen,
        label: 'Faculty / Teacher',
      };
    case 'student':
      return {
        gradient: 'from-blue-500 via-indigo-600 to-blue-700',
        bgColor: 'bg-slate-900',
        textColor: 'text-blue-300',
        borderColor: 'border-blue-500/40',
        icon: GraduationCap,
        label: 'Enrolled Student',
      };
    default:
      return {
        gradient: 'from-slate-600 via-slate-700 to-slate-800',
        bgColor: 'bg-slate-900',
        textColor: 'text-slate-200',
        borderColor: 'border-slate-700',
        icon: User,
        label: 'User',
      };
  }
}
