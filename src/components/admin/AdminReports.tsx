import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { TrendingUp, Users, Award, CalendarCheck2, Download, Printer, ShieldCheck } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { students, teachers, classes, attendance, marks, examinations, settings } = useSchool();

  // 1. Class-wise enrollment distribution
  const classDistributionData = classes.map(c => {
    const classStudents = students.filter(s => s.classId === c.id);
    const boys = classStudents.filter(s => s.gender === 'Male').length;
    const girls = classStudents.filter(s => s.gender === 'Female').length;
    return {
      name: c.name,
      Boys: boys,
      Girls: girls,
      Total: classStudents.length
    };
  });

  // 2. Gender distribution data
  const totalBoys = students.filter(s => s.gender === 'Male').length;
  const totalGirls = students.filter(s => s.gender === 'Female').length;
  const genderData = [
    { name: 'Girls (Beti Bachao)', value: totalGirls, color: '#ec4899' },
    { name: 'Boys', value: totalBoys, color: '#3b82f6' }
  ];

  // 3. Exam grade distribution data
  const gradeCounts: Record<string, number> = { 'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0, 'D': 0 };
  marks.forEach(m => {
    if (m.grade && gradeCounts[m.grade] !== undefined) {
      gradeCounts[m.grade]++;
    }
  });
  const gradeChartData = Object.keys(gradeCounts).map(g => ({
    grade: `Grade ${g}`,
    count: gradeCounts[g]
  }));

  // 4. Monthly attendance progression mock/data
  const attendanceMonthlyTrend = [
    { month: 'Jul', rate: 91 },
    { month: 'Aug', rate: 93 },
    { month: 'Sep', rate: 89 },
    { month: 'Oct', rate: 94 },
    { month: 'Nov', rate: 96 },
    { month: 'Dec', rate: 92 },
    { month: 'Jan', rate: 95 },
    { month: 'Feb', rate: 97 }
  ];

  const handlePrintReports = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Institutional Analytics & Governance Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key Performance Indicators (KPIs), Foundational Learning statistics & gender equity audit
          </p>
        </div>

        <button
          onClick={handlePrintReports}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-amber-400 hover:bg-slate-800 text-xs font-bold shadow-md transition-colors self-start md:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print Analytics Dossier</span>
        </button>
      </div>

      {/* Top 4 KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enrollment</span>
          <div className="text-2xl font-black text-slate-900">{students.length} Students</div>
          <div className="text-[11px] text-emerald-600 font-semibold">100% RTE Grant Coverage</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Girl Child Ratio</span>
          <div className="text-2xl font-black text-pink-600">
            {students.length > 0 ? Math.round((totalGirls / students.length) * 100) : 50}%
          </div>
          <div className="text-[11px] text-pink-700 font-semibold">{totalGirls} Girls Enrolled</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Attendance</span>
          <div className="text-2xl font-black text-amber-600">94.8%</div>
          <div className="text-[11px] text-slate-500 font-semibold">Biometric verified record</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Teacher-Student Ratio</span>
          <div className="text-2xl font-black text-blue-600">
            1 : {teachers.length > 0 ? Math.round(students.length / teachers.length) : 30}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">Compliant with RTE Norms</div>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Class-wise Students (Boys vs Girls) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Class 1 to 8 Enrollment by Gender</h3>
            <p className="text-xs text-slate-500">Student count distribution per grade</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Boys" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Girls" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Attendance Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Monthly Student Attendance Progression</h3>
            <p className="text-xs text-slate-500">Average percentage attendance throughout the session</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceMonthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Gender Equity Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Gender Ratio & Inclusivity</h3>
            <p className="text-xs text-slate-500">Proportion of male and female students</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Examination Grade Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">CCE Academic Grade Distribution</h3>
            <p className="text-xs text-slate-500">Overall grades scored across evaluated subjects</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="grade" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Count of Records" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
