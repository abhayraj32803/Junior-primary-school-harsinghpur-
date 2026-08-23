import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  Sparkles, 
  Building, 
  ShieldCheck, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../../types';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentPageTitle: string;
  onNavigateToPublic?: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, currentPageTitle, onNavigateToPublic }) => {
  const { userProfile, role, logout, switchDemoRole } = useAuth();
  const { settings, notices } = useSchool();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNoticesDropdown, setShowNoticesDropdown] = useState(false);

  const activeNotices = notices.filter(n => n.status === 'active').slice(0, 4);

  const handleRoleChange = (newRole: UserRole) => {
    switchDemoRole(newRole);
    setShowRoleMenu(false);
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin / Head Teacher
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5" />
            Teacher Portal
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <GraduationCap className="w-3.5 h-3.5" />
            Student Portal
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-hidden"
            title="Toggle Menu"
            id="btn-toggle-sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">
                {currentPageTitle}
              </h1>
              {getRoleBadge()}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block mt-0.5 font-medium">
              {settings.schoolName} • U-DISE: {settings.schoolCode}
            </p>
          </div>
        </div>

        {/* Right Side: Demo Switcher, Notices, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
              id="btn-switch-demo-persona"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Switch Persona</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Test As Persona
                </div>
                <button
                  onClick={() => handleRoleChange('admin')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${role === 'admin' ? 'font-bold text-red-700 bg-red-50' : 'text-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <div>
                      <div>Head Teacher (Admin)</div>
                      <div className="text-[10px] text-slate-500">Shri R. K. Sharma</div>
                    </div>
                  </div>
                  {role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />}
                </button>
                <button
                  onClick={() => handleRoleChange('teacher')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${role === 'teacher' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>Science Teacher</div>
                      <div className="text-[10px] text-slate-500">Smt. Anjali Verma</div>
                    </div>
                  </div>
                  {role === 'teacher' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
                <button
                  onClick={() => handleRoleChange('student')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${role === 'student' ? 'font-bold text-blue-700 bg-blue-50' : 'text-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>Class 8 Student</div>
                      <div className="text-[10px] text-slate-500">Aarav Sharma (Roll 01)</div>
                    </div>
                  </div>
                  {role === 'student' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Public Website View Shortcut */}
          {onNavigateToPublic && (
            <button
              onClick={() => onNavigateToPublic('home')}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Public School Portal"
              id="btn-view-public-site"
            >
              <Building className="w-4 h-4" />
            </button>
          )}

          {/* Notifications dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNoticesDropdown(!showNoticesDropdown)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
              title="Notifications"
              id="btn-header-notices"
            >
              <Bell className="w-4 h-4" />
              {activeNotices.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNoticesDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Latest School Notices</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">
                    {activeNotices.length} active
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {activeNotices.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-700">
                          {n.category}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.publishDate}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">{n.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.description}</p>
                    </div>
                  ))}
                  {activeNotices.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400">No active circulars.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile info & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <UserAvatar
              userProfile={userProfile}
              size="sm"
              shape="circle"
            />

            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 line-clamp-1">
                {userProfile?.name || 'User'}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">
                {userProfile?.role}
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
              title="Sign Out"
              id="btn-header-logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
