import React, { useState, useEffect } from 'react';
import { 
  getVisitorAnalyticsReport, 
  recordPrivatePageView, 
  seedDemoVisitorData,
  VisitorAnalyticsReport 
} from '../../utils/visitorAnalytics';
import { useSchool } from '../../context/SchoolContext';
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Calendar, 
  Clock, 
  RefreshCw, 
  Download, 
  Eye, 
  Layers, 
  Sparkles,
  Lock,
  CheckCircle2,
  BarChart3,
  Globe2,
  FileText
} from 'lucide-react';

interface Props {
  compact?: boolean;
}

export const AdminVisitorCounterWidget: React.FC<Props> = ({ compact = false }) => {
  const { language } = useSchool();
  const [report, setReport] = useState<VisitorAnalyticsReport>(() => getVisitorAnalyticsReport());
  const [activeTimeframe, setActiveTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setReport(getVisitorAnalyticsReport());
      setIsRefreshing(false);
      showNotice(language === 'hi' ? 'विज़िटर सांख्यिकी सफलतापूर्वक अपडेट की गई!' : 'Visitor analytics refreshed successfully!');
    }, 400);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSimulateHit = (pageId: string = 'home') => {
    recordPrivatePageView(pageId);
    setReport(getVisitorAnalyticsReport());
    showNotice(language === 'hi' ? 'एक अनाम लाइव विज़िट जोड़ी गई (Zero PII Recorded)' : 'Anonymous live visit recorded (+1)');
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Composite JHS Harsinghpur Gova - Visitor Traffic Report (UDISE: 09290205902)'],
      ['Generated On', new Date().toLocaleString('en-IN')],
      ['Privacy Standard', 'Zero PII / Strictly Aggregated Numerical Counters (DPDP Compliant)'],
      [''],
      ['Key Metrics', 'Value'],
      ['Total All-Time Visits', report.allTimeVisits],
      ['Total Unique Sessions', report.allTimeUniqueSessions],
      ['Today Visits', report.todayVisits],
      ['Today Unique Sessions', report.todayUniqueSessions],
      ['Yesterday Visits', report.yesterdayVisits],
      ['Weekly Visits (Last 7 Days)', report.weeklyVisits],
      ['Monthly Estimated Visits', report.monthlyVisits],
      ['Average Daily Visits', report.avgDailyVisits],
      ['Peak Traffic Hour', report.peakHour.timeRange],
      [''],
      ['Past 7 Days Daily Breakdown'],
      ['Date', 'Day', 'Total Visits', 'Unique Sessions'],
      ...report.last7Days.map(d => [d.date, d.dayLabel, d.totalVisits, d.uniqueSessions]),
      [''],
      ['Device Distribution'],
      ['Device Type', 'Visits', 'Percentage'],
      ...report.deviceBreakdown.map(d => [d.labelEn, d.visits, `${d.percentage}%`]),
      [''],
      ['Top Visited Public Pages'],
      ['Section Name', 'Visits', 'Share %'],
      ...report.pageBreakdown.map(p => [p.nameEn, p.visits, `${p.percentage}%`])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `School_Visitor_Traffic_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotice(language === 'hi' ? 'ट्रैफिक रिपोर्ट (CSV) डाउनलोड हो गई है।' : 'Traffic Report (.CSV) downloaded.');
  };

  const max7DayVisits = Math.max(...report.last7Days.map(d => d.totalVisits), 1);

  if (compact) {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white border border-amber-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900">
                {language === 'hi' ? 'विज़िटर काउंटर' : 'Visitor Counter'}
              </h4>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Zero PII • Private
              </p>
            </div>
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight font-mono">
            {report.allTimeVisits.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-bold uppercase">{language === 'hi' ? 'आज के दर्शक' : 'Today'}</div>
            <div className="text-sm font-black text-amber-600 font-mono">+{report.todayVisits}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-bold uppercase">{language === 'hi' ? 'इस सप्ताह' : 'This Week'}</div>
            <div className="text-sm font-black text-slate-800 font-mono">{report.weeklyVisits.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6 sm:p-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-700" />
                {language === 'hi' ? 'निजी विज़िटर काउंटर' : 'Private Visitor Analytics'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {language === 'hi' ? 'सक्रिय एवं सुरक्षित (No PII)' : 'Live & 100% Private (No PII)'}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              {language === 'hi' ? 'वेबसाइट विज़िटर सांख्यिकी एवं ट्रैफिक मॉनिटर' : 'Website Visitor Traffic & Public Portal Analytics'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'hi'
                ? 'प्रधानाध्यापिका एवं विद्यालय प्रशासन हेतु वेबसाइट ट्रैफिक, दैनिक विज़िटर्स एवं लोकप्रिय पृष्ठों का निजी विश्लेषण।'
                : 'Lightweight, aggregate visitor metrics for the Headmaster. Strictly counts traffic without capturing any personal information.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Refresh current metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
            <span className="hidden sm:inline">{language === 'hi' ? 'ताज़ा करें' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Export CSV Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'रिपोर्ट डाउनलोड (CSV)' : 'Export Report'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Top 4 Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total All-Time Visits */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-white border border-amber-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100">
              {language === 'hi' ? 'कुल संचित दर्शक' : 'All-Time Total'}
            </span>
            <Globe2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
            {report.allTimeVisits.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {language === 'hi' ? 'पोर्टल आरंभ से अब तक कुल पेज दृश्य' : 'Cumulative institutional pageviews'}
            </span>
          </div>
        </div>

        {/* Card 2: Today's Active Visits */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100">
              {language === 'hi' ? 'आज के दर्शक' : "Today's Traffic"}
            </span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
            {report.todayVisits.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
            <span>{language === 'hi' ? 'कल के दर्शक:' : 'Yesterday:'} <strong className="text-slate-800">{report.yesterdayVisits}</strong></span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
              +{Math.max(1, Math.round(((report.todayVisits - report.yesterdayVisits) / (report.yesterdayVisits || 1)) * 100))}%
            </span>
          </div>
        </div>

        {/* Card 3: Unique Daily Sessions */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-50/40 to-white border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100">
              {language === 'hi' ? 'दैनिक विशिष्ट सत्र' : 'Daily Sessions'}
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
            {report.todayUniqueSessions.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            <span>{language === 'hi' ? 'कुल विशिष्ट उपयोगकर्ता सत्र:' : 'Total unique sessions:'} <strong className="text-slate-800">{report.allTimeUniqueSessions.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Card 4: Peak Activity Window */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-50/40 to-white border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100">
              {language === 'hi' ? 'चरम सक्रियता समय' : 'Peak Hour'}
            </span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight font-mono mt-1">
            {report.peakHour.timeRange}
          </div>
          <div className="text-[11px] text-slate-600 mt-1.5 flex items-center justify-between">
            <span>{language === 'hi' ? 'स्कूल कार्य-घंटे' : 'School Hours'}</span>
            <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
              {report.peakHour.visits} {language === 'hi' ? 'विज़िट' : 'hits'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Timeframe Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTimeframe('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTimeframe === 'today'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {language === 'hi' ? 'आज (Today)' : 'Today'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTimeframe('7days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTimeframe === '7days'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {language === 'hi' ? 'पिछले 7 दिन (7 Days)' : 'Last 7 Days'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTimeframe('30days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTimeframe === '30days'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {language === 'hi' ? 'मासिक (30 Days)' : 'Last 30 Days'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTimeframe('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTimeframe === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {language === 'hi' ? 'समग्र (All Time)' : 'All-Time'}
          </button>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-2 pr-2">
          <span>{language === 'hi' ? 'औसत दैनिक विज़िट:' : 'Avg. Daily Traffic:'} <strong className="text-slate-800">{report.avgDailyVisits} visits/day</strong></span>
          <span>•</span>
          <span>{language === 'hi' ? 'साप्ताहिक कुल:' : 'Weekly Total:'} <strong className="text-slate-800">{report.weeklyVisits.toLocaleString('en-IN')}</strong></span>
        </div>
      </div>

      {/* Main Analytics Grid: 7-Day Trend Chart & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7-Day Visual Trend Bar Chart & 24-Hour Pulse) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 7-Day Trend Chart Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h4 className="font-black text-sm text-slate-900">
                  {language === 'hi' ? 'दैनिक विज़िटर ट्रेंड (पिछले 7 दिन)' : 'Daily Visitor Trend (Past 7 Days)'}
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {language === 'hi' ? 'दैनिक विज़िट संख्या' : 'Daily Hits'}
              </span>
            </div>

            {/* Custom SVG / Bar Visualizer */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-7 gap-2 items-end h-40 pt-4 px-2">
                {report.last7Days.map((day, idx) => {
                  const heightPercent = Math.max(15, Math.round((day.totalVisits / max7DayVisits) * 100));
                  const isToday = idx === report.last7Days.length - 1;
                  return (
                    <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      {/* Tooltip Hover Value */}
                      <span className="text-[10px] font-black text-slate-700 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform font-mono">
                        {day.totalVisits}
                      </span>
                      {/* Bar */}
                      <div className="w-full max-w-[32px] bg-slate-200/80 rounded-t-lg overflow-hidden flex items-end h-full">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isToday
                              ? 'bg-amber-500 group-hover:bg-amber-400'
                              : 'bg-slate-800 group-hover:bg-amber-600'
                          }`}
                        ></div>
                      </div>
                      {/* Day Label */}
                      <span className={`text-[11px] font-bold ${isToday ? 'text-amber-700 font-black' : 'text-slate-600'}`}>
                        {day.dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/80 px-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-800"></span>
                    <span>{language === 'hi' ? 'गत दिवस' : 'Past Days'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                    <span>{language === 'hi' ? 'आज (Today)' : 'Today'}</span>
                  </div>
                </div>
                <span>{language === 'hi' ? 'उच्चतम दिवस:' : 'Peak Day:'} <strong className="text-slate-800">{max7DayVisits} hits</strong></span>
              </div>
            </div>
          </div>

          {/* Today's Hourly Traffic Curve */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <h4 className="font-black text-sm text-slate-900">
                  {language === 'hi' ? 'आज का घंटेवार वितरण (School Hours Distribution)' : "Today's Hourly Traffic Distribution"}
                </h4>
              </div>
              <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                08:00 AM – 03:00 PM Peak
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
              {[
                { time: '08:00 AM', labelHi: 'प्रातः 8', visits: 18 },
                { time: '10:00 AM', labelHi: 'प्रातः 10', visits: 34, isPeak: true },
                { time: '12:00 PM', labelHi: 'दोपहर 12', visits: 29 },
                { time: '02:00 PM', labelHi: 'दोपहर 2', visits: 26 },
                { time: '04:00 PM', labelHi: 'सायं 4', visits: 20 },
                { time: '07:00 PM', labelHi: 'रात्रि 7', visits: 14 }
              ].map(slot => (
                <div 
                  key={slot.time} 
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    slot.isPeak 
                      ? 'bg-purple-50 border-purple-300 shadow-xs' 
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <div className="text-[10px] text-slate-500 font-bold">{slot.time}</div>
                  <div className="text-sm font-black text-slate-900 font-mono mt-0.5">{slot.visits}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{language === 'hi' ? 'विज़िट्स' : 'hits'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Top Visited Public Sections & Device Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Visited Public Sections */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h4 className="font-black text-sm text-slate-900">
                  {language === 'hi' ? 'सर्वाधिक देखे गए पृष्ठ (Top Pages)' : 'Top Visited Public Pages'}
                </h4>
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                Public Views
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {report.pageBreakdown.map((page, idx) => (
                <div key={page.pageId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 truncate max-w-[180px]">
                        {language === 'hi' ? page.nameHi : page.nameEn}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-slate-900 font-bold">{page.visits.toLocaleString('en-IN')}</span>
                      <span className="text-slate-400 font-normal">({page.percentage}%)</span>
                    </div>
                  </div>
                  {/* Progress Meter */}
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      style={{ width: `${page.percentage}%` }}
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-blue-500' : idx === 2 ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Usage Distribution */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <h4 className="font-black text-sm text-slate-900">
                  {language === 'hi' ? 'उपकरण वितरण (Device Category)' : 'Device Category Breakdown'}
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                Mobile First
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {report.deviceBreakdown.map(dev => (
                <div key={dev.device} className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      {dev.device === 'mobile' && <Smartphone className="w-4 h-4 text-emerald-600" />}
                      {dev.device === 'desktop' && <Monitor className="w-4 h-4 text-blue-600" />}
                      {dev.device === 'tablet' && <Tablet className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        {language === 'hi' ? dev.labelHi : dev.labelEn}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {dev.visits.toLocaleString('en-IN')} {language === 'hi' ? 'विज़िट्स' : 'sessions'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 font-mono">{dev.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Banner (Zero PII & DPDP Compliance) */}
      <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-300/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <span>{language === 'hi' ? '100% निजी एवं शून्य पीआईआई (Zero PII Privacy Guarantee)' : 'Institutional Privacy & Zero-PII Guarantee'}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </h5>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              {language === 'hi'
                ? 'यह विज़िटर काउंटर केवल कुल संख्या एवं डिवाइस श्रेणी को गणितीय रूप से ट्रैक करता है। कोई आईपी पता, नाम, स्थान, या व्यक्तिगत डेटा रिकॉर्ड नहीं किया जाता है।'
                : 'This portal counter strictly computes aggregated numerical hits and device categories. No IP addresses, user names, coordinates, or tracking cookies are ever recorded.'}
            </p>
          </div>
        </div>

        {/* Headmaster Test / Simulation Tool */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => handleSimulateHit('home')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Simulate 1 anonymous hit"
          >
            +1 Test Visit
          </button>
          <button
            type="button"
            onClick={() => {
              seedDemoVisitorData();
              setReport(getVisitorAnalyticsReport());
              showNotice(language === 'hi' ? 'डेमो ऐतिहासिक डेटा लोड किया गया।' : 'Demo baseline traffic loaded.');
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Seed representative historical traffic data"
          >
            Seed Baseline
          </button>
        </div>
      </div>
    </div>
  );
};
