import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { 
  Building, 
  Book, 
  Laptop, 
  Trophy, 
  Droplets, 
  Utensils, 
  Monitor, 
  Wifi, 
  Lightbulb, 
  GraduationCap, 
  Users, 
  Shield, 
  Activity, 
  Heart, 
  Award,
  Sparkles,
  Images,
  FileText,
  Bell,
  Phone,
  BookOpen,
  Globe,
  MapPin,
  CheckCircle2,
  Clock,
  Compass,
  Check
} from 'lucide-react';

export interface IconOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tags?: string[];
}

export const DEFAULT_ADMIN_ICONS: IconOption[] = [
  { id: 'Building', label: 'Building / Infrastructure', icon: Building, tags: ['school', 'campus', 'room'] },
  { id: 'Book', label: 'Book / Library', icon: Book, tags: ['library', 'reading', 'curriculum'] },
  { id: 'Laptop', label: 'Laptop / Smart Class', icon: Laptop, tags: ['computer', 'digital', 'tech'] },
  { id: 'Trophy', label: 'Trophy / Sports & Arts', icon: Trophy, tags: ['award', 'sports', 'winner'] },
  { id: 'Droplets', label: 'Water / Sanitation', icon: Droplets, tags: ['water', 'tap', 'clean'] },
  { id: 'Utensils', label: 'Utensils / Mid-Day Meal', icon: Utensils, tags: ['food', 'mdm', 'nutrition'] },
  { id: 'Monitor', label: 'Monitor / ICT Lab', icon: Monitor, tags: ['screen', 'lab', 'computer'] },
  { id: 'Wifi', label: 'WiFi / Internet', icon: Wifi, tags: ['network', 'online', 'broadband'] },
  { id: 'Lightbulb', label: 'Lightbulb / Solar & Power', icon: Lightbulb, tags: ['electricity', 'idea', 'solar'] },
  { id: 'GraduationCap', label: 'Graduation Cap / Academics', icon: GraduationCap, tags: ['admission', 'education', 'degree'] },
  { id: 'Users', label: 'Users / Staff & Students', icon: Users, tags: ['faculty', 'team', 'children'] },
  { id: 'Shield', label: 'Shield / Security & CCTV', icon: Shield, tags: ['safety', 'protection', 'guard'] },
  { id: 'Activity', label: 'Activity / Health & First Aid', icon: Activity, tags: ['medical', 'pulse', 'doctor'] },
  { id: 'Heart', label: 'Heart / Care & Wellness', icon: Heart, tags: ['counseling', 'kindness', 'health'] },
  { id: 'Award', label: 'Award / Excellence', icon: Award, tags: ['merit', 'rank', 'certificate'] },
  { id: 'Sparkles', label: 'Sparkles / Innovation', icon: Sparkles, tags: ['new', 'portal', 'smart'] },
  { id: 'Images', label: 'Gallery / Photos', icon: Images, tags: ['picture', 'camera', 'media'] },
  { id: 'FileText', label: 'Documents / Circulars', icon: FileText, tags: ['tc', 'pdf', 'forms'] },
  { id: 'Bell', label: 'Bell / Announcements', icon: Bell, tags: ['alert', 'notice', 'news'] },
  { id: 'Phone', label: 'Phone / Helpline', icon: Phone, tags: ['contact', 'call', 'support'] },
  { id: 'Globe', label: 'Globe / Portal Links', icon: Globe, tags: ['website', 'online', 'link'] },
  { id: 'Clock', label: 'Clock / Timetable', icon: Clock, tags: ['time', 'schedule', 'periods'] },
];

export interface AdminIconPickerProps {
  selectedIconId: string;
  onSelectIcon: (iconId: string) => void;
  iconOptions?: IconOption[];
  label?: string;
  className?: string;
}

export const AdminIconPicker: React.FC<AdminIconPickerProps> = ({
  selectedIconId,
  onSelectIcon,
  iconOptions = DEFAULT_ADMIN_ICONS,
  label = 'Select Icon',
  className = ''
}) => {
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return iconOptions;
    return iconOptions.filter(
      opt => 
        opt.label.toLowerCase().includes(q) || 
        opt.id.toLowerCase().includes(q) ||
        (opt.tags && opt.tags.some(t => t.toLowerCase().includes(q)))
    );
  }, [search, iconOptions]);

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-semibold text-[#172033]">
          {label}
        </label>
        
        <div className="relative w-48 sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-56 overflow-y-auto custom-scrollbar p-1 bg-slate-50/70 border border-slate-200 rounded-xl">
        {filteredIcons.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedIconId.toLowerCase() === opt.id.toLowerCase();

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectIcon(opt.id)}
              className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100/90 border-slate-200/80 hover:border-slate-300'
              }`}
              title={opt.label}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium truncate flex-1">
                {opt.id}
              </span>
              {isSelected && (
                <Check className="w-3 h-3 text-white shrink-0 ml-auto" />
              )}
            </button>
          );
        })}

        {filteredIcons.length === 0 && (
          <div className="col-span-full py-4 text-center text-xs text-slate-400">
            No icons matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
};
