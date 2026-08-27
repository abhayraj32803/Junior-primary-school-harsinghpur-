import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  CalendarDays, 
  Sun, 
  Snowflake, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle, 
  ShieldCheck, 
  Info,
  Layers,
  Sparkles,
  Building,
  Flag,
  Coffee,
  Check
} from 'lucide-react';
import { 
  SchoolTimingsConfig, 
  AcademicCalendarConfig, 
  SchoolHolidayItem, 
  AcademicMilestone 
} from '../../types';

export const AdminTimingsCalendar: React.FC = () => {
  const { settings, updateSchoolSettingsWithAudit, language } = useSchool();
  const { userProfile } = useAuth();

  // Active section tab inside Timings & Calendar editor
  const [activeTab, setActiveTab] = useState<'timings' | 'calendar' | 'holidays'>('timings');

  // Timings State
  const defaultTimings: SchoolTimingsConfig = settings.schoolTimings || {
    activeScheduleMode: 'auto',
    summerTiming: {
      openingTime: '08:00 AM',
      closingTime: '02:00 PM',
      assemblyTime: '08:00 AM – 08:20 AM',
      recessTime: '10:30 AM – 11:00 AM',
      effectivePeriodEn: '1 April to 30 September',
      effectivePeriodHi: '1 अप्रैल से 30 सितम्बर (ग्रीष्मकालीन)'
    },
    winterTiming: {
      openingTime: '09:00 AM',
      closingTime: '03:00 PM',
      assemblyTime: '09:00 AM – 09:20 AM',
      recessTime: '11:30 AM – 12:00 PM',
      effectivePeriodEn: '1 October to 31 March',
      effectivePeriodHi: '1 अक्टूबर से 31 मार्च (शीतकालीन)'
    },
    officeHours: {
      startTime: '08:30 AM',
      endTime: '01:30 PM',
      workingDaysSummaryEn: 'Monday to Saturday (Closed on Sunday & Gazetted Holidays)',
      workingDaysSummaryHi: 'सोमवार से शनिवार (रविवार एवं राजपत्रित अवकाश में बंद)',
      visitorGuidelineEn: 'Parents & public visitors are requested to meet the Headmaster with valid photo ID during office hours.',
      visitorGuidelineHi: 'अभिभावक एवं आगंतुक वैध पहचान पत्र के साथ कार्यालय समय में प्रधानाध्यापिका से संपर्क करें।'
    },
    workingDaysList: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    weeklyOff: 'Sunday (रविवार)',
    notesEn: 'Timings are regulated under Uttar Pradesh Basic Shiksha Parishad directives. Prayer assembly and Mid-Day Meal sessions are conducted strictly on schedule.',
    notesHi: 'विद्यालय संचालन समय उत्तर प्रदेश बेसिक शिक्षा परिषद के शासनादेशों के अनुरूप है। प्रातः प्रार्थना सभा एवं मध्याह्न भोजन निर्धारित समय पर संपन्न होता है।',
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  // Academic Calendar State
  const defaultCalendar: AcademicCalendarConfig = settings.academicCalendar || {
    academicYear: '2025-2026',
    sessionStart: '2025-04-01',
    sessionEnd: '2026-03-31',
    totalWorkingDaysTarget: 240,
    summerVacationStart: '2025-05-20',
    summerVacationEnd: '2025-06-30',
    winterVacationStart: '2025-12-31',
    winterVacationEnd: '2026-01-14',
    halfYearlyExamPeriod: 'October / November 2025',
    annualExamPeriod: 'March 2026',
    resultsDeclarationDate: '2026-03-31',
    milestones: [],
    holidays: [],
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  const [timings, setTimings] = useState<SchoolTimingsConfig>(defaultTimings);
  const [calendar, setCalendar] = useState<AcademicCalendarConfig>(defaultCalendar);
  const [holidayFilter, setHolidayFilter] = useState<string>('all');
  const [searchHoliday, setSearchHoliday] = useState<string>('');

  // Holiday Modal State
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<SchoolHolidayItem | null>(null);
  const [holidayForm, setHolidayForm] = useState<Partial<SchoolHolidayItem>>({
    titleEn: '',
    titleHi: '',
    startDate: '',
    endDate: '',
    daysCount: 1,
    type: 'Gazetted',
    descriptionEn: '',
    descriptionHi: '',
    isActive: true
  });

  // Milestone Modal State
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<AcademicMilestone | null>(null);
  const [milestoneForm, setMilestoneForm] = useState<Partial<AcademicMilestone>>({
    titleEn: '',
    titleHi: '',
    date: '',
    endDate: '',
    category: 'Session',
    descriptionEn: '',
    descriptionHi: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Helper to determine currently active seasonal mode
  const getActiveScheduleDetails = () => {
    if (timings.activeScheduleMode === 'summer') {
      return { mode: 'Summer Schedule (ग्रीष्मकालीन समय)', isSummer: true, details: timings.summerTiming };
    }
    if (timings.activeScheduleMode === 'winter') {
      return { mode: 'Winter Schedule (शीतकालीन समय)', isSummer: false, details: timings.winterTiming };
    }
    if (timings.activeScheduleMode === 'custom') {
      return { mode: 'Custom Schedule (विशेष समय)', isSummer: true, details: timings.summerTiming };
    }
    // Auto detection based on current month (April 1 to Sept 30 is Summer)
    const month = new Date().getMonth() + 1; // 1-12
    const isSummerMonth = month >= 4 && month <= 9;
    return {
      mode: isSummerMonth ? 'Auto-Active: Summer Schedule (ग्रीष्मकालीन)' : 'Auto-Active: Winter Schedule (शीतकालीन)',
      isSummer: isSummerMonth,
      details: isSummerMonth ? timings.summerTiming : timings.winterTiming
    };
  };

  const activeSchedule = getActiveScheduleDetails();

  // Save all settings to Firebase & Audit log
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const updatedTimings = {
        ...timings,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      const updatedCalendar = {
        ...calendar,
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      await updateSchoolSettingsWithAudit(
        {
          schoolTimings: updatedTimings,
          academicCalendar: updatedCalendar
        },
        {
          field: 'School Operating Hours & Academic Calendar',
          previousValue: `${settings.schoolTimings?.activeScheduleMode || 'Default'} (${settings.academicCalendar?.holidays?.length || 0} holidays)`,
          newValue: `${updatedTimings.activeScheduleMode} (${updatedCalendar.holidays.length} holidays, ${updatedCalendar.milestones.length} milestones)`,
          source: 'Website Hub Timings & Calendar Editor',
          status: 'VERIFIED_CURRENT',
          notes: `Updated school daily timings, seasonal hours, and academic calendar holiday list by ${userProfile?.name || 'Administrator'}.`
        }
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save timings and calendar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Holiday handlers
  const handleOpenHolidayModal = (holiday?: SchoolHolidayItem) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setHolidayForm(holiday);
    } else {
      setEditingHoliday(null);
      setHolidayForm({
        titleEn: '',
        titleHi: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        daysCount: 1,
        type: 'Gazetted',
        descriptionEn: '',
        descriptionHi: '',
        isActive: true
      });
    }
    setIsHolidayModalOpen(true);
  };

  const handleSaveHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayForm.titleEn || !holidayForm.startDate) return;

    let updatedList: SchoolHolidayItem[];
    if (editingHoliday) {
      updatedList = calendar.holidays.map(h => 
        h.id === editingHoliday.id ? { ...h, ...holidayForm } as SchoolHolidayItem : h
      );
    } else {
      const newHoliday: SchoolHolidayItem = {
        id: `hol-${Date.now()}`,
        titleEn: holidayForm.titleEn || '',
        titleHi: holidayForm.titleHi || holidayForm.titleEn || '',
        startDate: holidayForm.startDate || '',
        endDate: holidayForm.endDate || undefined,
        daysCount: Number(holidayForm.daysCount) || 1,
        type: holidayForm.type || 'Gazetted',
        descriptionEn: holidayForm.descriptionEn || '',
        descriptionHi: holidayForm.descriptionHi || '',
        isActive: holidayForm.isActive ?? true
      };
      updatedList = [...calendar.holidays, newHoliday];
    }

    // Sort chronologically
    updatedList.sort((a, b) => a.startDate.localeCompare(b.startDate));

    setCalendar({
      ...calendar,
      holidays: updatedList
    });
    setIsHolidayModalOpen(false);
  };

  const handleDeleteHoliday = (id: string) => {
    if (window.confirm('Are you sure you want to remove this holiday from the academic calendar?')) {
      setCalendar({
        ...calendar,
        holidays: calendar.holidays.filter(h => h.id !== id)
      });
    }
  };

  // Milestone handlers
  const handleOpenMilestoneModal = (milestone?: AcademicMilestone) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setMilestoneForm(milestone);
    } else {
      setEditingMilestone(null);
      setMilestoneForm({
        titleEn: '',
        titleHi: '',
        date: new Date().toISOString().split('T')[0],
        endDate: '',
        category: 'Session',
        descriptionEn: '',
        descriptionHi: ''
      });
    }
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneForm.titleEn || !milestoneForm.date) return;

    let updatedList: AcademicMilestone[];
    if (editingMilestone) {
      updatedList = calendar.milestones.map(m => 
        m.id === editingMilestone.id ? { ...m, ...milestoneForm } as AcademicMilestone : m
      );
    } else {
      const newMilestone: AcademicMilestone = {
        id: `ms-${Date.now()}`,
        titleEn: milestoneForm.titleEn || '',
        titleHi: milestoneForm.titleHi || milestoneForm.titleEn || '',
        date: milestoneForm.date || '',
        endDate: milestoneForm.endDate || undefined,
        category: milestoneForm.category || 'Session',
        descriptionEn: milestoneForm.descriptionEn || '',
        descriptionHi: milestoneForm.descriptionHi || ''
      };
      updatedList = [...calendar.milestones, newMilestone];
    }

    updatedList.sort((a, b) => a.date.localeCompare(b.date));

    setCalendar({
      ...calendar,
      milestones: updatedList
    });
    setIsMilestoneModalOpen(false);
  };

  const handleDeleteMilestone = (id: string) => {
    setCalendar({
      ...calendar,
      milestones: calendar.milestones.filter(m => m.id !== id)
    });
  };

  // Reset/Pre-fill to Government Standard Holidays
  const handleResetToStandardGovHolidays = () => {
    if (window.confirm('Reset holiday schedule to official UP Basic Shiksha Parishad standard calendar?')) {
      const standardHolidays: SchoolHolidayItem[] = [
        { id: 'hol-01', titleEn: 'Mahavir Jayanti', titleHi: 'महावीर जयंती', startDate: '2025-04-10', daysCount: 1, type: 'Gazetted', descriptionEn: 'Lord Mahavira birth anniversary', descriptionHi: 'भगवान महावीर जन्म कल्याणक', isActive: true },
        { id: 'hol-02', titleEn: 'Dr. B.R. Ambedkar Jayanti', titleHi: 'डॉ. भीमराव आंबेडकर जयंती', startDate: '2025-04-14', daysCount: 1, type: 'National Holiday', descriptionEn: 'Constitution architect Bharat Ratna Babasaheb Ambedkar Jayanti', descriptionHi: 'संविधान निर्माता भारतरत्न बाबासाहेब डॉ. आंबेडकर जयंती', isActive: true },
        { id: 'hol-03', titleEn: 'Good Friday', titleHi: 'गुड फ्राइडे', startDate: '2025-04-18', daysCount: 1, type: 'Gazetted', descriptionEn: 'Good Friday Observance', descriptionHi: 'ईसाई समुदाय का पवित्र दिवस', isActive: true },
        { id: 'hol-04', titleEn: 'Summer Vacation (ग्रीष्मावकाश)', titleHi: 'ग्रीष्मावकाश', startDate: '2025-05-20', endDate: '2025-06-30', daysCount: 42, type: 'Vacation', descriptionEn: 'Annual 42-day Summer Break for UP Basic Schools', descriptionHi: 'उत्तर प्रदेश बेसिक शिक्षा परिषद का 42 दिवसीय ग्रीष्मकालीन अवकाश', isActive: true },
        { id: 'hol-05', titleEn: 'Muharram', titleHi: 'मोहर्रम', startDate: '2025-07-06', daysCount: 1, type: 'Gazetted', descriptionEn: 'Muharram holiday (subject to moon)', descriptionHi: 'मोहर्रम अवकाश (चांद के अनुसार)', isActive: true },
        { id: 'hol-06', titleEn: 'Independence Day', titleHi: 'स्वतंत्रता दिवस (ध्वजारोहण एवं राष्ट्रीय पर्व)', startDate: '2025-08-15', daysCount: 1, type: 'National Holiday', descriptionEn: 'National Day — Flag hoisting, patriotic songs, and cultural presentations.', descriptionHi: 'राष्ट्रीय पर्व — प्रातः 08:00 बजे ध्वजारोहण व बाल सभा।', isActive: true },
        { id: 'hol-07', titleEn: 'Raksha Bandhan', titleHi: 'रक्षाबंधन', startDate: '2025-08-09', daysCount: 1, type: 'Gazetted', descriptionEn: 'Sibling celebration festival', descriptionHi: 'रक्षाबंधन का पावन पर्व', isActive: true },
        { id: 'hol-08', titleEn: 'Janmashtami', titleHi: 'श्री कृष्ण जन्माष्टमी', startDate: '2025-08-16', daysCount: 1, type: 'Gazetted', descriptionEn: 'Birth of Lord Krishna', descriptionHi: 'श्री कृष्ण जन्मोत्सव', isActive: true },
        { id: 'hol-09', titleEn: 'Eid-e-Milad (Barawafat)', titleHi: 'ईद-ए-मिलाद (बारावफात)', startDate: '2025-09-05', daysCount: 1, type: 'Gazetted', descriptionEn: 'Prophet Muhammad birthday', descriptionHi: 'बारावफात अवकाश', isActive: true },
        { id: 'hol-10', titleEn: 'Mahatma Gandhi & Shastri Jayanti', titleHi: 'महात्मा गांधी एवं लाल बहादुर शास्त्री जयंती', startDate: '2025-10-02', daysCount: 1, type: 'National Holiday', descriptionEn: 'National Holiday — Homage and Swachhta pledge', descriptionHi: 'राष्ट्रीय पर्व — बापू व शास्त्री जी के चित्र पर पुष्पांजलि व स्वच्छता अभियान।', isActive: true },
        { id: 'hol-11', titleEn: 'Maha Ashtami / Mahanavami / Dussehra', titleHi: 'दुर्गा पूजा, महानवमी एवं विजयादशमी (दशहरा)', startDate: '2025-10-01', endDate: '2025-10-03', daysCount: 3, type: 'Gazetted', descriptionEn: 'Dussehra festival vacation', descriptionHi: 'दशहरा व विजयोत्सव अवकाश', isActive: true },
        { id: 'hol-12', titleEn: 'Maharshi Valmiki Jayanti', titleHi: 'महर्षि वाल्मीकि जयंती', startDate: '2025-10-07', daysCount: 1, type: 'Gazetted', descriptionEn: 'Birth of Adi Kavi Valmiki', descriptionHi: 'रामायण रचयिता महर्षि वाल्मीकि जयंती', isActive: true },
        { id: 'hol-13', titleEn: 'Deepawali, Govardhan Puja & Bhai Dooj', titleHi: 'दीपावली, गोवर्धन पूजा एवं भैया दूज', startDate: '2025-10-20', endDate: '2025-10-23', daysCount: 4, type: 'Gazetted', descriptionEn: 'Diwali festive holiday break', descriptionHi: 'दीपावली का दीपोत्सव एवं भैयादूज अवकाश', isActive: true },
        { id: 'hol-14', titleEn: 'Chhath Puja', titleHi: 'छठ पूजा (सायंकालीन अर्घ्य)', startDate: '2025-10-28', daysCount: 1, type: 'Gazetted', descriptionEn: 'Sun worship Chhath festival', descriptionHi: 'सूर्य षष्ठी छठ पूजा पर्व', isActive: true },
        { id: 'hol-15', titleEn: 'Guru Nanak Jayanti & Kartik Purnima', titleHi: 'गुरु नानक जयंती व कार्तिक पूर्णिमा', startDate: '2025-11-05', daysCount: 1, type: 'Gazetted', descriptionEn: 'Prakash Parv Guru Nanak Jayanti', descriptionHi: 'प्रकाश पर्व गुरु नानक देव जयंती व गंगा स्नान', isActive: true },
        { id: 'hol-16', titleEn: 'Christmas Day', titleHi: 'क्रिसमस डे (बड़ा दिन)', startDate: '2025-12-25', daysCount: 1, type: 'Gazetted', descriptionEn: 'Christmas Day observance', descriptionHi: 'ईसाई समुदाय का पावन पर्व', isActive: true },
        { id: 'hol-17', titleEn: 'Winter Vacation (शीतकालीन अवकाश)', titleHi: 'शीतकालीन अवकाश', startDate: '2025-12-31', endDate: '2026-01-14', daysCount: 15, type: 'Vacation', descriptionEn: '15-day Winter break for UP Basic Schools', descriptionHi: 'शीत लहर के दृष्टिगत बेसिक शिक्षा परिषद का 15 दिवसीय शीतकालीन अवकाश', isActive: true },
        { id: 'hol-18', titleEn: 'Makar Sankranti', titleHi: 'मकर संक्रांति / खिचड़ी पर्व', startDate: '2026-01-14', daysCount: 1, type: 'Gazetted', descriptionEn: 'Harvest festival holiday', descriptionHi: 'मकर संक्रांति व खिचड़ी पर्व', isActive: true },
        { id: 'hol-19', titleEn: 'Republic Day', titleHi: 'गणतंत्र दिवस (ध्वजारोहण एवं राष्ट्रीय पर्व)', startDate: '2026-01-26', daysCount: 1, type: 'National Holiday', descriptionEn: 'National Day — Flag hoisting, patriotic songs, and speech events.', descriptionHi: 'राष्ट्रीय पर्व — प्रातः 08:30 बजे ध्वजारोहण व देशभक्ति बाल सभा।', isActive: true },
        { id: 'hol-20', titleEn: 'Maha Shivratri', titleHi: 'महाशिवरात्रि', startDate: '2026-02-15', daysCount: 1, type: 'Gazetted', descriptionEn: 'Maha Shivratri festival', descriptionHi: 'महाशिवरात्रि व्रत एवं उत्सव', isActive: true },
        { id: 'hol-21', titleEn: 'Holi & Holika Dahan', titleHi: 'होलिका दहन एवं होली (धुलेंडी)', startDate: '2026-03-03', endDate: '2026-03-05', daysCount: 3, type: 'Gazetted', descriptionEn: 'Holi festival vacation', descriptionHi: 'रंगोत्सव होली का पावन अवकाश', isActive: true },
        { id: 'hol-22', titleEn: 'Eid-ul-Fitr', titleHi: 'ईद-उल-फितर (मीठी ईद)', startDate: '2026-03-20', daysCount: 1, type: 'Gazetted', descriptionEn: 'Eid-ul-Fitr festival (subject to moon)', descriptionHi: 'ईद-उल-फितर अवकाश', isActive: true },
        { id: 'hol-23', titleEn: 'Ram Navami', titleHi: 'श्री राम नवमी', startDate: '2026-03-27', daysCount: 1, type: 'Gazetted', descriptionEn: 'Lord Rama birth celebration', descriptionHi: 'श्री राम जन्मोत्सव', isActive: true }
      ];

      setCalendar({
        ...calendar,
        holidays: standardHolidays
      });
    }
  };

  // Filter holidays
  const filteredHolidays = calendar.holidays.filter(h => {
    if (holidayFilter !== 'all' && h.type !== holidayFilter) return false;
    if (searchHoliday.trim()) {
      const q = searchHoliday.toLowerCase();
      return h.titleEn.toLowerCase().includes(q) || h.titleHi.includes(q) || h.startDate.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-700" />
                {language === 'hi' ? 'वेबसाइट हब • समय व कैलेंडर' : 'Website Hub • Timings & Calendar'}
              </span>
              <span className="text-xs font-mono text-slate-500">Session: {calendar.academicYear}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {language === 'hi' ? 'विद्यालय समय सारिणी एवं शैक्षिक कैलेंडर संपादक' : 'School Timings & Academic Calendar Editor'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'hi'
                ? 'दैनिक संचालन समय (ग्रीष्मकालीन/शीतकालीन), कार्यालय समय, परीक्षा सत्र एवं शासकीय अवकाश सूची प्रबंधित करें जो मुख्य वेबसाइट पर स्वतः प्रदर्शित होती हैं।'
                : 'Define daily opening/closing times, seasonal schedules, academic milestones, and holiday dates that automatically reflect across the Contact, About, and Public pages.'}
            </p>
          </div>
        </div>

        {/* Global Save Button */}
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? (language === 'hi' ? 'सहेजा जा रहा है...' : 'Saving...') : (language === 'hi' ? 'सभी परिवर्तन सहेजें' : 'Save All Changes')}</span>
        </button>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'hi' 
                ? '✓ विद्यालय संचालन समय एवं शैक्षिक कैलेंडर सफलतापूर्वक सहेजा गया और संपर्क व परिचय पृष्ठ पर अपडेट हो गया!' 
                : '✓ School timings and academic calendar successfully updated and synced across Contact & About pages!'}
            </span>
          </div>
        </div>
      )}

      {/* Live Status Highlight */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-3xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            {activeSchedule.isSummer ? <Sun className="w-5 h-5" /> : <Snowflake className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                {language === 'hi' ? 'वर्तमान में सक्रिय समय' : 'Live Active Schedule'}
              </span>
              <span className="text-xs text-slate-300 font-bold">
                {activeSchedule.mode}
              </span>
            </div>
            <p className="text-sm font-black text-white mt-0.5">
              {activeSchedule.details.openingTime} — {activeSchedule.details.closingTime}
              <span className="text-xs font-normal text-slate-300 ml-2">
                (प्रार्थना: {activeSchedule.details.assemblyTime} | मध्याह्न भोजन: {activeSchedule.details.recessTime})
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">{language === 'hi' ? 'सक्रिय मोड:' : 'Mode:'}</span>
          <select
            value={timings.activeScheduleMode}
            onChange={(e) => setTimings({ ...timings, activeScheduleMode: e.target.value as any })}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-600 text-xs font-bold text-amber-400 focus:outline-hidden focus:border-amber-400"
          >
            <option value="auto">Auto (Seasonal Date Based)</option>
            <option value="summer">Force Summer (ग्रीष्मकालीन)</option>
            <option value="winter">Force Winter (शीतकालीन)</option>
            <option value="custom">Custom (विशेष)</option>
          </select>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('timings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'timings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>{language === 'hi' ? '1. दैनिक संचालन समय (Daily Timings)' : '1. Daily Operating Hours'}</span>
        </button>

        <button
          onClick={() => setActiveTab('holidays')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'holidays'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <CalendarDays className="w-4 h-4 text-amber-400" />
          <span>{language === 'hi' ? `2. शासकीय अवकाश सूची (${calendar.holidays.length})` : `2. Official Holiday Dates (${calendar.holidays.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-amber-400" />
          <span>{language === 'hi' ? '3. सत्र माइलस्टोन व परीक्षाएं' : '3. Session Milestones & Exams'}</span>
        </button>
      </div>

      {/* TAB 1: DAILY OPERATING HOURS & SEASONAL TIMINGS */}
      {activeTab === 'timings' && (
        <div className="space-y-6">
          {/* Summer & Winter Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summer Timings Card */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-amber-200 shadow-xs space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {language === 'hi' ? 'ग्रीष्मकालीन समय (Summer Schedule)' : 'Summer Operating Schedule'}
                    </h3>
                    <p className="text-[11px] text-amber-700 font-semibold">
                      {timings.summerTiming.effectivePeriodHi} • {timings.summerTiming.effectivePeriodEn}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                  1 April – 30 Sept
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'विद्यालय खुलने का समय (Opening Time) *' : 'Opening Time *'}
                  </label>
                  <input
                    type="text"
                    value={timings.summerTiming.openingTime}
                    onChange={(e) => setTimings({
                      ...timings,
                      summerTiming: { ...timings.summerTiming, openingTime: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    placeholder="08:00 AM"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'विद्यालय बंद होने का समय (Closing Time) *' : 'Closing Time *'}
                  </label>
                  <input
                    type="text"
                    value={timings.summerTiming.closingTime}
                    onChange={(e) => setTimings({
                      ...timings,
                      summerTiming: { ...timings.summerTiming, closingTime: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    placeholder="02:00 PM"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'प्रातः प्रार्थना सभा समय (Assembly)' : 'Assembly & Prayer Time'}
                  </label>
                  <input
                    type="text"
                    value={timings.summerTiming.assemblyTime}
                    onChange={(e) => setTimings({
                      ...timings,
                      summerTiming: { ...timings.summerTiming, assemblyTime: e.target.value }
                    })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    placeholder="08:00 AM – 08:20 AM"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'मध्याह्न भोजन / मध्यांतर (Recess/MDM)' : 'Recess / MDM Lunch Time'}
                  </label>
                  <input
                    type="text"
                    value={timings.summerTiming.recessTime}
                    onChange={(e) => setTimings({
                      ...timings,
                      summerTiming: { ...timings.summerTiming, recessTime: e.target.value }
                    })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    placeholder="10:30 AM – 11:00 AM"
                  />
                </div>
              </div>
            </div>

            {/* Winter Timings Card */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sky-200 shadow-xs space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                    <Snowflake className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {language === 'hi' ? 'शीतकालीन समय (Winter Schedule)' : 'Winter Operating Schedule'}
                    </h3>
                    <p className="text-[11px] text-sky-700 font-semibold">
                      {timings.winterTiming.effectivePeriodHi} • {timings.winterTiming.effectivePeriodEn}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 text-[10px] font-black">
                  1 Oct – 31 March
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'विद्यालय खुलने का समय (Opening Time) *' : 'Opening Time *'}
                  </label>
                  <input
                    type="text"
                    value={timings.winterTiming.openingTime}
                    onChange={(e) => setTimings({
                      ...timings,
                      winterTiming: { ...timings.winterTiming, openingTime: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                    placeholder="09:00 AM"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'विद्यालय बंद होने का समय (Closing Time) *' : 'Closing Time *'}
                  </label>
                  <input
                    type="text"
                    value={timings.winterTiming.closingTime}
                    onChange={(e) => setTimings({
                      ...timings,
                      winterTiming: { ...timings.winterTiming, closingTime: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                    placeholder="03:00 PM"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'प्रातः प्रार्थना सभा समय (Assembly)' : 'Assembly & Prayer Time'}
                  </label>
                  <input
                    type="text"
                    value={timings.winterTiming.assemblyTime}
                    onChange={(e) => setTimings({
                      ...timings,
                      winterTiming: { ...timings.winterTiming, assemblyTime: e.target.value }
                    })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                    placeholder="09:00 AM – 09:20 AM"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'मध्याह्न भोजन / मध्यांतर (Recess/MDM)' : 'Recess / MDM Lunch Time'}
                  </label>
                  <input
                    type="text"
                    value={timings.winterTiming.recessTime}
                    onChange={(e) => setTimings({
                      ...timings,
                      winterTiming: { ...timings.winterTiming, recessTime: e.target.value }
                    })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                    placeholder="11:30 AM – 12:00 PM"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Office, Helpdesk & Working Days Config */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span>{language === 'hi' ? 'कार्यालय एवं जनसामान्य संपर्क समय (Office & Helpdesk Timings)' : 'Office & Public Interaction Hours'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'कार्यालय प्रारंभ समय (Office Start Time)' : 'Office Start Time'}
                </label>
                <input
                  type="text"
                  value={timings.officeHours.startTime}
                  onChange={(e) => setTimings({
                    ...timings,
                    officeHours: { ...timings.officeHours, startTime: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'कार्यालय समाप्ति समय (Office End Time)' : 'Office End Time'}
                </label>
                <input
                  type="text"
                  value={timings.officeHours.endTime}
                  onChange={(e) => setTimings({
                    ...timings,
                    officeHours: { ...timings.officeHours, endTime: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'कार्य दिवस विवरण (हिंदी)' : 'Working Days Summary (Hindi)'}
                </label>
                <input
                  type="text"
                  value={timings.officeHours.workingDaysSummaryHi}
                  onChange={(e) => setTimings({
                    ...timings,
                    officeHours: { ...timings.officeHours, workingDaysSummaryHi: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'कार्य दिवस विवरण (अंग्रेज़ी)' : 'Working Days Summary (English)'}
                </label>
                <input
                  type="text"
                  value={timings.officeHours.workingDaysSummaryEn}
                  onChange={(e) => setTimings({
                    ...timings,
                    officeHours: { ...timings.officeHours, workingDaysSummaryEn: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'आगंतुक एवं अभिभावक दिशानिर्देश (हिंदी)' : 'Visitor Guidelines (Hindi)'}
                </label>
                <input
                  type="text"
                  value={timings.officeHours.visitorGuidelineHi}
                  onChange={(e) => setTimings({
                    ...timings,
                    officeHours: { ...timings.officeHours, visitorGuidelineHi: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOLIDAY DATES & OFFICIAL CALENDAR LIST */}
      {activeTab === 'holidays' && (
        <div className="space-y-6">
          {/* Action Bar & Stats */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setHolidayFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  holidayFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {language === 'hi' ? `सभी अवकाश (${calendar.holidays.length})` : `All (${calendar.holidays.length})`}
              </button>
              <button
                onClick={() => setHolidayFilter('Gazetted')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  holidayFilter === 'Gazetted' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {language === 'hi' ? 'राजपत्रित (Gazetted)' : 'Gazetted'}
              </button>
              <button
                onClick={() => setHolidayFilter('National Holiday')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  holidayFilter === 'National Holiday' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {language === 'hi' ? 'राष्ट्रीय पर्व' : 'National Holidays'}
              </button>
              <button
                onClick={() => setHolidayFilter('Vacation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  holidayFilter === 'Vacation' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {language === 'hi' ? 'दीर्घकालीन अवकाश (Vacations)' : 'Vacations'}
              </button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={searchHoliday}
                onChange={(e) => setSearchHoliday(e.target.value)}
                placeholder={language === 'hi' ? 'अवकाश खोजें...' : 'Search holiday...'}
                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden w-full sm:w-48"
              />

              <button
                onClick={() => handleOpenHolidayModal()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'hi' ? 'नया अवकाश जोड़ें' : 'Add Holiday'}</span>
              </button>

              <button
                onClick={handleResetToStandardGovHolidays}
                title="Reset to UP Basic Shiksha Parishad Official Holidays"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">{language === 'hi' ? 'मानक सूची' : 'Default List'}</span>
              </button>
            </div>
          </div>

          {/* Holidays Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-32">{language === 'hi' ? 'दिनांक (Date)' : 'Date'}</th>
                    <th className="py-3 px-4">{language === 'hi' ? 'अवकाश का नाम (Holiday Name)' : 'Holiday Title'}</th>
                    <th className="py-3 px-4 w-28">{language === 'hi' ? 'श्रेणी (Type)' : 'Category'}</th>
                    <th className="py-3 px-4 w-20 text-center">{language === 'hi' ? 'दिन' : 'Days'}</th>
                    <th className="py-3 px-4">{language === 'hi' ? 'विवरण (Description)' : 'Notes'}</th>
                    <th className="py-3 px-4 w-24 text-right">{language === 'hi' ? 'कार्रवाई' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredHolidays.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        {language === 'hi' ? 'कोई अवकाश नहीं मिला।' : 'No holidays found matching criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredHolidays.map((holiday, idx) => (
                      <tr key={holiday.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {holiday.startDate}
                          {holiday.endDate && <span className="text-slate-500 font-normal block text-[10px]">to {holiday.endDate}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{holiday.titleHi}</div>
                          <div className="text-[11px] text-slate-500">{holiday.titleEn}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                            holiday.type === 'National Holiday'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : holiday.type === 'Vacation'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : holiday.type === 'Gazetted'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}>
                            {holiday.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold font-mono">
                          {holiday.daysCount}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                          {language === 'hi' ? (holiday.descriptionHi || holiday.descriptionEn) : (holiday.descriptionEn || holiday.descriptionHi)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenHolidayModal(holiday)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                              title="Edit Holiday"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteHoliday(holiday.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Delete Holiday"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACADEMIC SESSION MILESTONES & EXAM SCHEDULE */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Session Overview Card */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <span>{language === 'hi' ? 'शैक्षिक सत्र समय-सारिणी (Academic Session Overview)' : 'Academic Session Overview'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'शैक्षिक सत्र (Academic Year) *' : 'Academic Year *'}
                </label>
                <input
                  type="text"
                  value={calendar.academicYear}
                  onChange={(e) => setCalendar({ ...calendar, academicYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                  placeholder="2025-2026"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'सत्र प्रारंभ दिनांक (Session Start)' : 'Session Start Date'}
                </label>
                <input
                  type="date"
                  value={calendar.sessionStart}
                  onChange={(e) => setCalendar({ ...calendar, sessionStart: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'सत्र समापन दिनांक (Session End)' : 'Session End Date'}
                </label>
                <input
                  type="date"
                  value={calendar.sessionEnd}
                  onChange={(e) => setCalendar({ ...calendar, sessionEnd: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'न्यूनतम कार्य दिवस लक्ष्य (Working Days)' : 'Target Working Days'}
                </label>
                <input
                  type="number"
                  value={calendar.totalWorkingDaysTarget}
                  onChange={(e) => setCalendar({ ...calendar, totalWorkingDaysTarget: Number(e.target.value) || 240 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'अर्द्धवार्षिक परीक्षा अवधि' : 'Half Yearly Exam Period'}
                </label>
                <input
                  type="text"
                  value={calendar.halfYearlyExamPeriod}
                  onChange={(e) => setCalendar({ ...calendar, halfYearlyExamPeriod: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden"
                  placeholder="October / November"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'वार्षिक परीक्षा अवधि' : 'Annual Exam Period'}
                </label>
                <input
                  type="text"
                  value={calendar.annualExamPeriod}
                  onChange={(e) => setCalendar({ ...calendar, annualExamPeriod: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden"
                  placeholder="March"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'परीक्षाफल घोषणा दिनांक (Result Date)' : 'Result Declaration Date'}
                </label>
                <input
                  type="date"
                  value={calendar.resultsDeclarationDate}
                  onChange={(e) => setCalendar({ ...calendar, resultsDeclarationDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Milestones List */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {language === 'hi' ? 'सत्र प्रमुख गतिविधियां व माइलस्टोन (Key Milestones)' : 'Key Session Events & Milestones'}
              </h3>
              <button
                onClick={() => handleOpenMilestoneModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'नया माइलस्टोन' : 'Add Milestone'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {calendar.milestones.map((ms, idx) => (
                <div key={ms.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-700">{ms.date} {ms.endDate && `to ${ms.endDate}`}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                          {ms.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{ms.titleHi} ({ms.titleEn})</h4>
                      <p className="text-xs text-slate-500">{language === 'hi' ? (ms.descriptionHi || ms.descriptionEn) : (ms.descriptionEn || ms.descriptionHi)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenMilestoneModal(ms)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMilestone(ms.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT HOLIDAY */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-black text-base flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-amber-400" />
                <span>{editingHoliday ? (language === 'hi' ? 'अवकाश संपादित करें' : 'Edit Holiday') : (language === 'hi' ? 'नया अवकाश जोड़ें' : 'Add New Holiday')}</span>
              </h3>
              <button
                onClick={() => setIsHolidayModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHoliday} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'अवकाश का नाम (हिंदी में) *' : 'Holiday Title (Hindi) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={holidayForm.titleHi || ''}
                    onChange={(e) => setHolidayForm({ ...holidayForm, titleHi: e.target.value })}
                    placeholder="उदा. दीपावली / भैया दूज"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'अवकाश का नाम (अंग्रेज़ी में) *' : 'Holiday Title (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={holidayForm.titleEn || ''}
                    onChange={(e) => setHolidayForm({ ...holidayForm, titleEn: e.target.value })}
                    placeholder="e.g. Deepawali Festival"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'प्रारंभ दिनांक (Start Date) *' : 'Start Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={holidayForm.startDate || ''}
                    onChange={(e) => setHolidayForm({ ...holidayForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'समाप्ति दिनांक (End Date)' : 'End Date (Optional)'}
                  </label>
                  <input
                    type="date"
                    value={holidayForm.endDate || ''}
                    onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'अवकाश दिवस संख्या (Days Count) *' : 'Days Count *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={holidayForm.daysCount || 1}
                    onChange={(e) => setHolidayForm({ ...holidayForm, daysCount: Number(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'अवकाश श्रेणी (Category) *' : 'Category *'}
                  </label>
                  <select
                    value={holidayForm.type || 'Gazetted'}
                    onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Gazetted">Gazetted (राजपत्रित)</option>
                    <option value="National Holiday">National Holiday (राष्ट्रीय पर्व)</option>
                    <option value="Vacation">Vacation (ग्रीष्म/शीत अवकाश)</option>
                    <option value="Restricted">Restricted (प्रतिबंधित)</option>
                    <option value="Regional">Regional (स्थानीय)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'संक्षिप्त विवरण (Hindi)' : 'Description (Hindi)'}
                  </label>
                  <input
                    type="text"
                    value={holidayForm.descriptionHi || ''}
                    onChange={(e) => setHolidayForm({ ...holidayForm, descriptionHi: e.target.value })}
                    placeholder="उदा. उत्तर प्रदेश बेसिक शिक्षा परिषद आदेशानुसार"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'संक्षिप्त विवरण (English)' : 'Description (English)'}
                  </label>
                  <input
                    type="text"
                    value={holidayForm.descriptionEn || ''}
                    onChange={(e) => setHolidayForm({ ...holidayForm, descriptionEn: e.target.value })}
                    placeholder="e.g. As per State Council academic notification"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black"
                >
                  {language === 'hi' ? 'अवकाश सहेजें' : 'Save Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MILESTONE */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-black text-base flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                <span>{editingMilestone ? (language === 'hi' ? 'माइलस्टोन संपादित करें' : 'Edit Milestone') : (language === 'hi' ? 'नया माइलस्टोन जोड़ें' : 'Add Milestone')}</span>
              </h3>
              <button
                onClick={() => setIsMilestoneModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMilestone} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'गतिविधि शीर्षक (हिंदी)' : 'Title (Hindi) *'}
                </label>
                <input
                  type="text"
                  required
                  value={milestoneForm.titleHi || ''}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, titleHi: e.target.value })}
                  placeholder="उदा. अर्द्धवार्षिक परीक्षा 2025"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'गतिविधि शीर्षक (अंग्रेज़ी)' : 'Title (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={milestoneForm.titleEn || ''}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, titleEn: e.target.value })}
                  placeholder="e.g. Half Yearly Examinations"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'दिनांक (Date) *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={milestoneForm.date || ''}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'श्रेणी (Category)' : 'Category'}
                  </label>
                  <select
                    value={milestoneForm.category || 'Session'}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Session">Session (सत्र)</option>
                    <option value="Examination">Examination (परीक्षा)</option>
                    <option value="Evaluation">Evaluation (मूल्यांकन)</option>
                    <option value="Admission">Admission (प्रवेश उत्सव)</option>
                    <option value="Vacation">Vacation (अवकाश)</option>
                    <option value="Event">Event (उत्सव)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'विवरण (Description)' : 'Description'}
                </label>
                <textarea
                  value={milestoneForm.descriptionHi || ''}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, descriptionHi: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  placeholder="संक्षिप्त विवरण..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black"
                >
                  {language === 'hi' ? 'सहेजें' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
