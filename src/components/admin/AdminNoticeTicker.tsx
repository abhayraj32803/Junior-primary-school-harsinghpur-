import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { NoticeTickerAlert, NoticeTickerConfig } from '../../types';
import { 
  Bell, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  ExternalLink, 
  Play, 
  Pause, 
  Flame, 
  Layers, 
  Eye, 
  Gauge, 
  Palette, 
  Smartphone, 
  Monitor, 
  Info, 
  Save, 
  Check, 
  GraduationCap, 
  Gift, 
  Calendar, 
  Award, 
  AlertTriangle, 
  FileText, 
  Phone, 
  X,
  Radio,
  BookOpen
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminNoticeTicker: React.FC = () => {
  const { settings, updateSettings, notices, language } = useSchool();

  // Current or default ticker settings
  const currentTickerConfig: NoticeTickerConfig = useMemo(() => {
    return settings.noticeTicker || {
      enabled: true,
      speed: 'medium',
      pauseOnHover: true,
      themeStyle: 'amber_gold',
      mode: 'combined',
      headerLabelEn: 'Flash Updates',
      headerLabelHi: 'नवीनतम सूचना व अलर्ट',
      customAlerts: []
    };
  }, [settings.noticeTicker]);

  // Local state for interactive editing before save or instant live update
  const [tickerConfig, setTickerConfig] = useState<NoticeTickerConfig>(currentTickerConfig);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Omit<NoticeTickerAlert, 'id' | 'createdAt'>>({
    textHi: '',
    textEn: '',
    badgeLabelHi: 'ताज़ा सूचना',
    badgeLabelEn: 'FLASH NEWS',
    priority: 'normal',
    linkTarget: 'notices',
    isActive: true,
    order: 1
  });

  // Sync state if settings change externally
  React.useEffect(() => {
    if (settings.noticeTicker) {
      setTickerConfig(settings.noticeTicker);
    }
  }, [settings.noticeTicker]);

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    const alerts = tickerConfig.customAlerts || [];
    if (!searchTerm.trim()) return alerts;
    const term = searchTerm.toLowerCase();
    return alerts.filter(a => 
      a.textHi.toLowerCase().includes(term) ||
      a.textEn.toLowerCase().includes(term) ||
      (a.badgeLabelHi && a.badgeLabelHi.toLowerCase().includes(term)) ||
      (a.badgeLabelEn && a.badgeLabelEn.toLowerCase().includes(term))
    );
  }, [tickerConfig.customAlerts, searchTerm]);

  // Handle Save All to Firebase / School Context
  const handleSaveConfig = async (newConfig: NoticeTickerConfig) => {
    setTickerConfig(newConfig);
    await updateSettings({
      noticeTicker: newConfig
    });
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  // Toggle Master Switch
  const handleToggleMaster = async () => {
    const updated: NoticeTickerConfig = {
      ...tickerConfig,
      enabled: !tickerConfig.enabled
    };
    await handleSaveConfig(updated);
  };

  // Update single config field
  const handleUpdateField = async <K extends keyof NoticeTickerConfig>(key: K, value: NoticeTickerConfig[K]) => {
    const updated: NoticeTickerConfig = {
      ...tickerConfig,
      [key]: value
    };
    await handleSaveConfig(updated);
  };

  // Toggle alert active state
  const handleToggleAlertActive = async (alertId: string) => {
    const updatedAlerts = tickerConfig.customAlerts.map(a => 
      a.id === alertId ? { ...a, isActive: !a.isActive } : a
    );
    const updated: NoticeTickerConfig = {
      ...tickerConfig,
      customAlerts: updatedAlerts
    };
    await handleSaveConfig(updated);
  };

  // Move alert up/down
  const handleMoveAlert = async (index: number, direction: 'up' | 'down') => {
    const alerts = [...tickerConfig.customAlerts];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= alerts.length) return;

    const temp = alerts[index];
    alerts[index] = alerts[targetIndex];
    alerts[targetIndex] = temp;

    // update order property
    const reordered = alerts.map((a, idx) => ({ ...a, order: idx + 1 }));
    const updated: NoticeTickerConfig = {
      ...tickerConfig,
      customAlerts: reordered
    };
    await handleSaveConfig(updated);
  };

  // Delete Alert
  const handleDeleteAlert = async (alertId: string) => {
    const updatedAlerts = tickerConfig.customAlerts.filter(a => a.id !== alertId);
    const updated: NoticeTickerConfig = {
      ...tickerConfig,
      customAlerts: updatedAlerts
    };
    await handleSaveConfig(updated);
  };

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingAlertId(null);
    setFormData({
      textHi: '',
      textEn: '',
      badgeLabelHi: 'ताज़ा सूचना',
      badgeLabelEn: 'FLASH NEWS',
      priority: 'normal',
      linkTarget: 'notices',
      isActive: true,
      order: (tickerConfig.customAlerts?.length || 0) + 1
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (alert: NoticeTickerAlert) => {
    setEditingAlertId(alert.id);
    setFormData({
      textHi: alert.textHi,
      textEn: alert.textEn,
      badgeLabelHi: alert.badgeLabelHi || 'ताज़ा सूचना',
      badgeLabelEn: alert.badgeLabelEn || 'FLASH NEWS',
      priority: alert.priority || 'normal',
      linkTarget: alert.linkTarget || 'notices',
      isActive: alert.isActive,
      order: alert.order || 1
    });
    setIsModalOpen(true);
  };

  // Submit Alert Form
  const handleSubmitAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.textHi.trim() && !formData.textEn.trim()) return;

    let updatedAlerts: NoticeTickerAlert[];
    if (editingAlertId) {
      updatedAlerts = tickerConfig.customAlerts.map(a => 
        a.id === editingAlertId ? {
          ...a,
          ...formData,
          textHi: formData.textHi.trim() || formData.textEn.trim(),
          textEn: formData.textEn.trim() || formData.textHi.trim(),
        } : a
      );
    } else {
      const newAlert: NoticeTickerAlert = {
        id: `tck-${Date.now()}`,
        ...formData,
        textHi: formData.textHi.trim() || formData.textEn.trim(),
        textEn: formData.textEn.trim() || formData.textHi.trim(),
        createdAt: new Date().toISOString()
      };
      updatedAlerts = [newAlert, ...(tickerConfig.customAlerts || [])];
    }

    const updated: NoticeTickerConfig = {
      ...tickerConfig,
      customAlerts: updatedAlerts
    };
    await handleSaveConfig(updated);
    setIsModalOpen(false);
  };

  // Quick Preset Templates
  const presetTemplates = [
    {
      id: 'admission',
      titleEn: 'Admissions Open',
      titleHi: 'नवीन प्रवेश प्रारंभ',
      icon: GraduationCap,
      badgeEn: 'ADMISSIONS OPEN',
      badgeHi: 'प्रवेश प्रारंभ',
      textEn: 'Session 2025–26: 100% Free Admissions open for Classes 1 to 8! No fee, free textbooks & mid-day meal.',
      textHi: 'नवीन शैक्षिक सत्र 2025-26 हेतु कक्षा 1 से 8 में शत-प्रतिशत नि:शुल्क प्रवेश प्रारंभ! तुरंत संपर्क करें।',
      priority: 'urgent' as const,
      link: 'admission'
    },
    {
      id: 'dbt',
      titleEn: 'DBT & Free Facilities',
      titleHi: 'डीबीटी ₹1,200 व सुविधाएं',
      icon: Gift,
      badgeEn: 'GOVT SCHEMES',
      badgeHi: 'डीबीटी व योजनाएं',
      textEn: 'Free textbooks, DBT ₹1,200 uniform grant, shoes-socks, and nutritious hot Mid-Day Meal for all students.',
      textHi: 'सभी नामांकित बच्चों को नि:शुल्क पाठ्यपुस्तकें, यूनिफॉर्म डीबीटी (₹1,200), जूता-मोजा एवं मिड-डे मील उपलब्ध।',
      priority: 'important' as const,
      link: 'schemes'
    },
    {
      id: 'exams',
      titleEn: 'Exam Schedule',
      titleHi: 'परीक्षा समय-सारिणी',
      icon: Award,
      badgeEn: 'EXAMINATIONS',
      badgeHi: 'वार्षिक परीक्षा',
      textEn: 'Annual Evaluation & Assessment examinations schedule declared. Report cards distribution date announced.',
      textHi: 'सत्र 2025-26 वार्षिक मूल्यांकन व परीक्षा समय-सारिणी जारी। सभी विद्यार्थी समय पर उपस्थित रहें।',
      priority: 'important' as const,
      link: 'notices'
    },
    {
      id: 'holiday',
      titleEn: 'Seasonal Vacation',
      titleHi: 'अवकाश सूचना',
      icon: Calendar,
      badgeEn: 'HOLIDAY NOTICE',
      badgeHi: 'अवकाश सूचना',
      textEn: 'School will remain closed as per Basic Shiksha Parishad official holiday calendar order.',
      textHi: 'बेसिक शिक्षा परिषद के आधिकारिक आदेशानुसार विद्यालय में अवकाश रहेगा।',
      priority: 'normal' as const,
      link: 'documents'
    },
    {
      id: 'emergency',
      titleEn: 'Emergency Alert',
      titleHi: 'मौसम / आवश्यक अलर्ट',
      icon: AlertTriangle,
      badgeEn: 'OFFICIAL ALERT',
      badgeHi: 'विशेष आदेश',
      textEn: 'District Administration / BSA Farrukhabad order regarding revised school timings or temporary weather closure.',
      textHi: 'जिला बेसिक शिक्षा अधिकारी (BSA) फर्रुखाबाद के आदेशानुसार विद्यालय समय में परिवर्तन / विशेष दिशा-निर्देश।',
      priority: 'urgent' as const,
      link: 'notices'
    }
  ];

  const handleApplyPreset = (preset: typeof presetTemplates[0]) => {
    setEditingAlertId(null);
    setFormData({
      textHi: preset.textHi,
      textEn: preset.textEn,
      badgeLabelHi: preset.badgeHi,
      badgeLabelEn: preset.badgeEn,
      priority: preset.priority,
      linkTarget: preset.link,
      isActive: true,
      order: (tickerConfig.customAlerts?.length || 0) + 1
    });
    setIsModalOpen(true);
  };

  // Build the live preview items
  const activeDisplayItems = useMemo(() => {
    const items: Array<{ id: string; badge: string; text: string; priority?: string; link?: string }> = [];

    // Custom alerts
    if (tickerConfig.mode === 'custom_alerts' || tickerConfig.mode === 'combined') {
      const activeCustom = (tickerConfig.customAlerts || []).filter(a => a.isActive);
      activeCustom.forEach(a => {
        items.push({
          id: a.id,
          badge: language === 'hi' ? (a.badgeLabelHi || 'सूचना') : (a.badgeLabelEn || 'UPDATE'),
          text: language === 'hi' ? a.textHi : a.textEn,
          priority: a.priority,
          link: a.linkTarget
        });
      });
    }

    // Notices
    if (tickerConfig.mode === 'auto_sync_notices' || tickerConfig.mode === 'combined') {
      const activeNotices = notices.filter(n => n.status === 'active' && n.isPublic);
      activeNotices.forEach(n => {
        items.push({
          id: n.id,
          badge: language === 'hi' ? 'परिपत्र' : 'CIRCULAR',
          text: language === 'hi' ? `${n.titleHi || n.title}: ${n.descriptionHi || n.description}` : `${n.title}: ${n.description}`,
          priority: n.priority,
          link: 'notices'
        });
      });
    }

    return items;
  }, [tickerConfig, notices, language]);

  // Duration in seconds for animation
  const animationDurationSeconds = 
    tickerConfig.speed === 'slow' ? 45 :
    tickerConfig.speed === 'fast' ? 16 : 28;

  // Theme styling definitions
  const themeClasses: Record<string, { bar: string; badge: string; text: string; border: string }> = {
    amber_gold: {
      bar: 'bg-gradient-to-r from-gov-amber-500 via-amber-500 to-amber-600 text-slate-950',
      badge: 'bg-slate-950 text-amber-300 border-amber-400/40',
      text: 'text-slate-950',
      border: 'border-amber-600'
    },
    crimson_alert: {
      bar: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white',
      badge: 'bg-white text-red-700 border-white/60',
      text: 'text-white',
      border: 'border-red-700'
    },
    emerald_gov: {
      bar: 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white',
      badge: 'bg-amber-400 text-emerald-950 border-amber-300',
      text: 'text-emerald-50',
      border: 'border-emerald-800'
    },
    navy_classic: {
      bar: 'bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white',
      badge: 'bg-amber-500 text-slate-950 border-amber-400',
      text: 'text-slate-100',
      border: 'border-slate-800'
    },
    modern_dark: {
      bar: 'bg-slate-950 text-slate-100',
      badge: 'bg-amber-400 text-slate-950 border-amber-300',
      text: 'text-slate-200',
      border: 'border-slate-800'
    }
  };

  const currentTheme = themeClasses[tickerConfig.themeStyle] || themeClasses.amber_gold;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-xs">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                  {language === 'hi' ? 'लाइव टिकर प्रबंधन' : 'Live Ticker Management'}
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-500">
                  {language === 'hi' ? 'दैनिक संचालन एवं CMS हब' : 'Daily Operations & Website CMS'}
                </span>
                {tickerConfig.enabled ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {language === 'hi' ? 'लाइव सक्रिय (LIVE)' : 'Active On Live Website'}
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                    {language === 'hi' ? 'निष्क्रिय (Paused)' : 'Disabled / Hidden'}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                {language === 'hi' ? 'वेबसाइट सूचना टिकर एवं फ्लैश अलर्ट' : 'Notice Ticker & Flash Alerts Bar'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                {language === 'hi' 
                  ? 'स्कूल की मुख्य वेबसाइट पर ऊपर स्क्रॉल होने वाली ताज़ा सूचनाएं, प्रवेश अलर्ट, अवकाश घोषणाएं व परीक्षा अपडेट प्रबंधित करें।' 
                  : 'Broadcast dynamic scrolling alerts, urgent admission calls, holiday notices, and exam updates live across the public school homepage.'}
              </p>
            </div>
          </div>

          {/* Action Buttons & Master Switch */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
            <button
              onClick={handleToggleMaster}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-sm ${
                tickerConfig.enabled
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
              id="btn-toggle-ticker-master"
            >
              {tickerConfig.enabled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>{language === 'hi' ? 'टिकर चालू है (Active)' : 'Ticker is ON'}</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 text-slate-500" />
                  <span>{language === 'hi' ? 'टिकर बंद है (Turn ON)' : 'Ticker is OFF'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer"
              id="btn-add-ticker-alert"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? 'नया अलर्ट जोड़ें' : 'Create New Alert'}</span>
            </button>

            {isSavedRecently && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'सेव हो गया' : 'Saved'}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* LIVE INTERACTIVE WEBSITE SIMULATION PREVIEW */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-lg p-5 sm:p-6 text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              {language === 'hi' ? 'लाइव सिमुलेशन पूर्वावलोकन (Live School Website Preview)' : 'Live School Website Simulation Preview'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Ticker Canvas Simulator */}
        <div className={`mx-auto transition-all duration-300 ${previewDevice === 'desktop' ? 'w-full' : 'max-w-xs'}`}>
          <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-md">
            {tickerConfig.enabled ? (
              <div 
                className={`${currentTheme.bar} px-3 py-2 text-xs font-bold overflow-hidden shadow-xs border-b ${currentTheme.border} marquee-container relative select-none`}
                style={{ ['--marquee-duration' as any]: `${animationDurationSeconds}s` }}
              >
                <div className="flex items-center gap-3">
                  {/* Fixed Header Badge */}
                  <div className="flex items-center gap-1 font-black uppercase px-2.5 py-0.5 rounded-full text-[10px] shrink-0 shadow-xs z-10 whitespace-nowrap bg-slate-950 text-amber-400 border border-amber-400/30">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>{language === 'hi' ? (tickerConfig.headerLabelHi || 'नवीनतम सूचना') : (tickerConfig.headerLabelEn || 'Flash Updates')}</span>
                  </div>

                  {/* Scrolling Horizontal Marquee */}
                  <div className="flex-1 overflow-hidden relative">
                    {activeDisplayItems.length > 0 ? (
                      <div className={`animate-marquee flex items-center gap-8 ${tickerConfig.pauseOnHover ? 'pause-on-hover' : ''}`}>
                        {/* Render twice for seamless continuous loop */}
                        {[...activeDisplayItems, ...activeDisplayItems].map((item, idx) => (
                          <div 
                            key={`preview-item-${idx}-${item.id}`}
                            className="flex items-center gap-2 shrink-0 cursor-default"
                          >
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                              item.priority === 'urgent' ? 'bg-red-600 text-white border-red-400 animate-pulse' :
                              item.priority === 'important' ? 'bg-amber-400 text-slate-950 border-amber-300' :
                              currentTheme.badge
                            }`}>
                              {item.badge}
                            </span>
                            <span className={`font-bold text-xs sm:text-sm ${currentTheme.text}`}>
                              {item.text}
                            </span>
                            <span className="text-current opacity-40 font-mono text-sm">•</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs opacity-75 italic py-0.5">
                        {language === 'hi' ? 'कोई सक्रिय अलर्ट मौजूद नहीं है। नीचे से नया अलर्ट जोड़ें।' : 'No active alerts to display. Add alerts below.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/80 p-4 text-center text-xs text-slate-400 italic">
                {language === 'hi' ? 'सूचना टिकर वर्तमान में बंद (Disabled) है।' : 'Notice Ticker is currently disabled.'}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 px-1">
            <span>Speed: <strong className="text-amber-400 uppercase">{tickerConfig.speed}</strong> ({animationDurationSeconds}s cycle)</span>
            <span>Hover to pause: <strong className="text-amber-400">{tickerConfig.pauseOnHover ? 'Enabled' : 'Disabled'}</strong></span>
            <span>Active Alerts: <strong className="text-emerald-400">{activeDisplayItems.length} items</strong></span>
          </div>
        </div>
      </div>

      {/* QUICK PRESETS DRAWER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900">
              {language === 'hi' ? 'त्वरित 1-क्लिक अलर्ट टेम्पलेट्स (Quick Presets)' : '1-Click Quick Alert Presets'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {language === 'hi' ? 'क्लिक करके तुरंत अलर्ट भरें' : 'Click to pre-fill standard alerts'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {presetTemplates.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs text-slate-800 group-hover:text-amber-900 truncate">
                    {language === 'hi' ? preset.titleHi : preset.titleEn}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {language === 'hi' ? preset.textHi : preset.textEn}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BEHAVIOR & STYLING CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Control 1: Ticker Mode */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              {language === 'hi' ? 'प्रदर्शन मोड (Display Mode)' : 'Broadcast Mode'}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500">
            {language === 'hi' ? 'निर्धारित करें कि टिकर में क्या प्रदर्शित हो' : 'Select what items scroll across the live ticker'}
          </p>
          <div className="space-y-1.5">
            {[
              { id: 'combined', labelEn: 'Combined (Custom Alerts + Latest Circulars)', labelHi: 'संयुक्त (कस्टम अलर्ट + आधिकारिक परिपत्र)' },
              { id: 'custom_alerts', labelEn: 'Custom Short Alerts Only', labelHi: 'केवल कस्टम शॉर्ट अलर्ट' },
              { id: 'auto_sync_notices', labelEn: 'Auto-Sync from Published Notices', labelHi: 'केवल प्रकाशित नोटिस/सर्कुलर' }
            ].map(mode => (
              <label 
                key={mode.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  tickerConfig.mode === mode.id 
                    ? 'bg-purple-50 border-purple-300 text-purple-950 font-black' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="tickerMode"
                  checked={tickerConfig.mode === mode.id}
                  onChange={() => handleUpdateField('mode', mode.id as any)}
                  className="accent-purple-600 cursor-pointer"
                />
                <span>{language === 'hi' ? mode.labelHi : mode.labelEn}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Control 2: Speed & Behavior */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              {language === 'hi' ? 'स्क्रॉल गति एवं इंटरैक्शन' : 'Scroll Speed & Pause'}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500">
            {language === 'hi' ? 'स्क्रॉलिंग गति को आवश्यकतानुसार समायोजित करें' : 'Adjust scroll speed and hovering pause'}
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'slow', label: 'Slow (45s)' },
              { id: 'medium', label: 'Normal (28s)' },
              { id: 'fast', label: 'Fast (16s)' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => handleUpdateField('speed', s.id as any)}
                className={`py-2 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  tickerConfig.speed === s.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={tickerConfig.pauseOnHover}
              onChange={(e) => handleUpdateField('pauseOnHover', e.target.checked)}
              className="accent-blue-600 rounded cursor-pointer"
            />
            <span>{language === 'hi' ? 'माउस ले जाने पर टिकर रोकें (Pause on Hover)' : 'Pause scrolling on mouse hover'}</span>
          </label>
        </div>

        {/* Control 3: Theme Color */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              {language === 'hi' ? 'टिकर कलर थीम' : 'Color Scheme Style'}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500">
            {language === 'hi' ? 'वेबसाइट के स्वरूप के अनुसार थीम चुनें' : 'Choose banner color harmony on public site'}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'amber_gold', label: 'Amber Gold (Govt Standard)', bg: 'bg-amber-500' },
              { id: 'crimson_alert', label: 'Crimson Urgent Alert', bg: 'bg-red-600' },
              { id: 'emerald_gov', label: 'Emerald UP Basic', bg: 'bg-emerald-700' },
              { id: 'navy_classic', label: 'Royal Navy Blue', bg: 'bg-slate-900' },
              { id: 'modern_dark', label: 'Sleek Dark Slate', bg: 'bg-slate-950' }
            ].map(thm => (
              <button
                key={thm.id}
                onClick={() => handleUpdateField('themeStyle', thm.id as any)}
                className={`flex items-center gap-2 p-2 rounded-xl text-[11px] font-bold border transition-all text-left cursor-pointer ${
                  tickerConfig.themeStyle === thm.id
                    ? 'border-amber-500 bg-amber-50/80 font-black text-slate-950 ring-1 ring-amber-400'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${thm.bg} shrink-0 shadow-xs`} />
                <span className="truncate">{thm.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ALERTS MANAGEMENT LIST & TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search and Action Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {language === 'hi' ? 'सक्रिय शॉर्ट अलर्ट सूची' : 'Configured Short Alerts List'}
              </h3>
              <p className="text-xs text-slate-500">
                {tickerConfig.customAlerts?.length || 0} {language === 'hi' ? 'कुल अलर्ट दर्ज' : 'total alerts configured'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={language === 'hi' ? 'अलर्ट खोजें...' : 'Search alerts...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'अलर्ट जोड़ें' : 'Add Alert'}</span>
            </button>
          </div>
        </div>

        {/* Alerts List */}
        {filteredAlerts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredAlerts.map((alert, index) => {
              return (
                <div 
                  key={alert.id}
                  className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                    alert.isActive ? 'hover:bg-amber-50/20' : 'bg-slate-50/70 opacity-60'
                  }`}
                >
                  {/* Left: Reorder & Status */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="flex sm:flex-col gap-1 shrink-0 pt-0.5 sm:pt-0">
                      <button
                        onClick={() => handleMoveAlert(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveAlert(index, 'down')}
                        disabled={index === filteredAlerts.length - 1}
                        title="Move Down"
                        className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Priority Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          alert.priority === 'urgent' ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse flex items-center gap-1' :
                          alert.priority === 'important' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {alert.priority === 'urgent' && <Flame className="w-2.5 h-2.5 text-red-600" />}
                          {alert.priority || 'normal'}
                        </span>

                        {/* Category Badge */}
                        <span className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                          {language === 'hi' ? alert.badgeLabelHi || 'अलर्ट' : alert.badgeLabelEn || 'ALERT'}
                        </span>

                        {/* Link destination indicator */}
                        {alert.linkTarget && (
                          <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>Target: {alert.linkTarget}</span>
                          </span>
                        )}

                        <span className="text-xs text-slate-400">Order #{index + 1}</span>
                      </div>

                      {/* Bilingual Alert Text */}
                      <div className="space-y-0.5">
                        <div className="text-sm font-black text-slate-900">
                          {alert.textHi}
                        </div>
                        {alert.textEn && alert.textEn !== alert.textHi && (
                          <div className="text-xs font-semibold text-slate-500">
                            {alert.textEn}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Toggle Active, Edit, Delete */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => handleToggleAlertActive(alert.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        alert.isActive
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      {alert.isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'hi' ? 'सक्रिय' : 'Active'}</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3.5 h-3.5 text-slate-500" />
                          <span>{language === 'hi' ? 'रोका हुआ' : 'Paused'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(alert)}
                      className="p-2 rounded-xl hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer"
                      title="Edit Alert"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
              <Radio className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-800">
              {language === 'hi' ? 'कोई अलर्ट नहीं मिला' : 'No Alerts Configured'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {language === 'hi' 
                ? 'ऊपर दिए गए "नया अलर्ट जोड़ें" बटन या त्वरित टेम्पलेट का उपयोग करके वेबसाइट टिकर पर लाइव संदेश जोड़ें।'
                : 'Use the "Create New Alert" button or select one of the 1-click presets above to create alerts for the website.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs cursor-pointer"
            >
              {language === 'hi' ? 'पहला अलर्ट जोड़ें' : 'Create First Alert'}
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT ALERT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAlertId 
          ? (language === 'hi' ? 'अलर्ट संपादित करें (Edit Alert)' : 'Edit Notice Ticker Alert')
          : (language === 'hi' ? 'नया लाइव टिकर अलर्ट जोड़ें' : 'Create New Notice Ticker Alert')
        }
        size="lg"
      >
        <form onSubmit={handleSubmitAlert} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              {language === 'hi' 
                ? 'शॉर्ट अलर्ट संदेश को संक्षिप्त (लगभग 80-120 अक्षर) रखें ताकि यह वेबसाइट पर स्पष्ट और तेजी से पढ़ा जा सके।'
                : 'Keep alerts concise (80-120 characters) for optimal readability while scrolling horizontally across mobile and desktop screens.'}
            </span>
          </div>

          {/* Hindi Alert Text */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800">
                {language === 'hi' ? 'अलर्ट संदेश (हिंदी में) *' : 'Alert Message (Hindi) *'}
              </label>
              <span className="text-[10px] text-slate-400">{formData.textHi.length} chars</span>
            </div>
            <textarea
              required
              rows={2}
              value={formData.textHi}
              onChange={(e) => setFormData({ ...formData, textHi: e.target.value })}
              placeholder="उदा. सत्र 2025-26 हेतु कक्षा 1 से 8 में शत-प्रतिशत नि:शुल्क प्रवेश प्रारंभ! तुरंत संपर्क करें।"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* English Alert Text */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800">
                {language === 'hi' ? 'अलर्ट संदेश (अंग्रेजी में) *' : 'Alert Message (English) *'}
              </label>
              <span className="text-[10px] text-slate-400">{formData.textEn.length} chars</span>
            </div>
            <textarea
              required
              rows={2}
              value={formData.textEn}
              onChange={(e) => setFormData({ ...formData, textEn: e.target.value })}
              placeholder="e.g. Session 2025–26 100% Free Admissions open for Classes 1 to 8! Contact school office."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Badges & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {language === 'hi' ? 'बैज लेबल (हिंदी)' : 'Badge Label (Hindi)'}
              </label>
              <input
                type="text"
                value={formData.badgeLabelHi}
                onChange={(e) => setFormData({ ...formData, badgeLabelHi: e.target.value })}
                placeholder="उदा. प्रवेश प्रारंभ, ताज़ा सूचना, अवकाश"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {language === 'hi' ? 'बैज लेबल (अंग्रेजी)' : 'Badge Label (English)'}
              </label>
              <input
                type="text"
                value={formData.badgeLabelEn}
                onChange={(e) => setFormData({ ...formData, badgeLabelEn: e.target.value })}
                placeholder="e.g. ADMISSIONS, FLASH NEWS, HOLIDAY"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Priority and Link Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {language === 'hi' ? 'प्राथमिकता / तात्कालिकता' : 'Priority Level'}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="normal">Normal (सामान्य)</option>
                <option value="important">Important (महत्वपूर्ण)</option>
                <option value="urgent">Urgent / Blinking Pulse (अत्यधिक आवश्यक / ब्लिंक)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {language === 'hi' ? 'क्लिक करने पर खुलने वाला पेज' : 'Destination Page Link'}
              </label>
              <select
                value={formData.linkTarget}
                onChange={(e) => setFormData({ ...formData, linkTarget: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="notices">Official Circulars / Notices (सूचना पट्ट)</option>
                <option value="admission">Free Admission Guidelines (प्रवेश नियम)</option>
                <option value="schemes">Government Welfare Schemes / MDM (योजनाएं)</option>
                <option value="facilities">Campus & Facilities (भौतिक सुविधाएं)</option>
                <option value="gallery">Photo & Video Gallery (गैलरी)</option>
                <option value="documents">Public Documents & Calendars (दस्तावेज़)</option>
                <option value="contact">Contact & Map (संपर्क व समय)</option>
              </select>
            </div>
          </div>

          {/* Active Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="accent-amber-500 rounded cursor-pointer w-4 h-4"
              />
              <span>{language === 'hi' ? 'इस अलर्ट को तुरंत लाइव वेबसाइट पर सक्रिय करें' : 'Activate this alert immediately on the live website'}</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingAlertId ? (language === 'hi' ? 'अपडेट करें' : 'Save Changes') : (language === 'hi' ? 'अलर्ट प्रकाशित करें' : 'Publish Alert')}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
