import React, { useState, useMemo, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { PromotionAction, PromotionDecision, Student } from '../../types';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Layers,
  Sparkles,
  RefreshCw,
  Download,
  Printer,
  FileSpreadsheet,
  Filter,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Check,
  RotateCcw,
  FileText,
  HelpCircle,
  Info,
  Calendar,
  ChevronRight,
  UserCheck,
  UserX,
  Award,
  BookOpen
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface StudentPromotionRowState {
  student: Student;
  action: PromotionAction;
  targetClassNumber: number;
  targetClassId: string;
  targetSectionName: string;
  targetSectionId: string;
  newRollNumber: string;
  remarks: string;
  avgPercentage?: number;
  grade?: string;
  hasExamRecord: boolean;
  selected: boolean;
}

export const AdminBulkPromotion: React.FC = () => {
  const {
    language,
    students,
    classes,
    sections,
    marks,
    examinations,
    bulkPromoteStudents,
    settings
  } = useSchool();
  const { userProfile } = useAuth();

  // Academic Sessions
  const currentAcademicYear = settings.academicYear || '2025-2026';
  
  // Calculate next academic year suggestion (e.g. 2025-2026 -> 2026-2027)
  const defaultNextAcademicYear = useMemo(() => {
    const parts = currentAcademicYear.split('-');
    if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      return `${Number(parts[0]) + 1}-${Number(parts[1]) + 1}`;
    }
    return '2026-2027';
  }, [currentAcademicYear]);

  // Selected Source Controls
  const [sourceClassNumber, setSourceClassNumber] = useState<number>(1);
  const [sourceSectionFilter, setSourceSectionFilter] = useState<string>('all');
  const [sourceYear, setSourceYear] = useState<string>(currentAcademicYear);
  const [targetYear, setTargetYear] = useState<string>(defaultNextAcademicYear);

  // Target Config Defaults
  const [targetSectionDefault, setTargetSectionDefault] = useState<string>('same'); // 'same' | 'A' | 'B' | 'C'
  const [rollNumberingStrategy, setRollNumberingStrategy] = useState<'alpha' | 'current' | 'same'>('alpha');
  const [passingPercentageThreshold, setPassingPercentageThreshold] = useState<number>(33);

  // Search & Filter within Class
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | PromotionAction>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');

  // Execution & Modal States
  const [studentRows, setStudentRows] = useState<StudentPromotionRowState[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    promoted: number;
    retained: number;
    transferred: number;
    graduated: number;
    total: number;
    targetClassNumber: number;
    targetYear: string;
  } | null>(null);

  // Available sections for current selected target class
  const targetClassNumber = useMemo(() => {
    if (sourceClassNumber >= 8) return 8;
    return sourceClassNumber + 1;
  }, [sourceClassNumber]);

  const targetClassId = useMemo(() => {
    const found = classes.find(c => c.classNumber === targetClassNumber);
    return found ? found.id : `class-${targetClassNumber}`;
  }, [classes, targetClassNumber]);

  const targetSectionsForClass = useMemo(() => {
    return sections.filter(s => s.classNumber === targetClassNumber);
  }, [sections, targetClassNumber]);

  // Initialize/Refresh student rows when source class or filters change
  useEffect(() => {
    const classStudents = students.filter(
      s => s.classNumber === sourceClassNumber && s.status === 'active'
    );

    // Calculate marks performance per student
    const rows: StudentPromotionRowState[] = classStudents.map((student, idx) => {
      // Find marks for this student
      const studentMarks = marks.filter(m => m.studentId === student.id);
      let avgPercentage: number | undefined = undefined;
      let grade = 'N/A';
      const hasExamRecord = studentMarks.length > 0;

      if (hasExamRecord) {
        const totalMarksObtained = studentMarks.reduce((sum, m) => sum + (Number(m.marksObtained) || 0), 0);
        const totalMaxMarks = studentMarks.reduce((sum, m) => sum + (Number(m.maximumMarks) || 100), 0);
        if (totalMaxMarks > 0) {
          avgPercentage = Math.round((totalMarksObtained / totalMaxMarks) * 100);
          if (avgPercentage >= 75) grade = 'A';
          else if (avgPercentage >= 60) grade = 'B';
          else if (avgPercentage >= 45) grade = 'C';
          else if (avgPercentage >= 33) grade = 'D';
          else grade = 'E (Needs Support)';
        }
      }

      // Default action: if class 8, default to GRADUATE, else PROMOTE
      const defaultAction: PromotionAction = sourceClassNumber === 8 ? 'GRADUATE' : 'PROMOTE';

      // Default target section
      let targetSecName = student.sectionName || 'A';
      if (targetSectionDefault !== 'same') {
        targetSecName = targetSectionDefault;
      }
      const matchedTargetSec = targetSectionsForClass.find(s => s.sectionName === targetSecName) || targetSectionsForClass[0];
      const targetSecId = matchedTargetSec ? matchedTargetSec.id : `sec-${targetClassNumber}-${targetSecName}`;

      let defaultRemark = '';
      if (defaultAction === 'GRADUATE') {
        defaultRemark = language === 'hi' ? 'कक्षा 8 उत्तीर्ण - टीसी/प्रमाणपत्र जारी' : 'Class 8 Graduated - Ready for Higher Secondary';
      } else {
        defaultRemark = avgPercentage !== undefined 
          ? (language === 'hi' ? `सत्र परीक्षा परिणाम: ${avgPercentage}% (${grade}) के साथ पदोन्नत` : `Promoted with ${avgPercentage}% (${grade})`)
          : (language === 'hi' ? 'निःशुल्क एवं अनिवार्य बाल शिक्षा अधिकार (RTE) के तहत अगली कक्षा में पदोन्नत' : 'Promoted under RTE annual progression');
      }

      return {
        student,
        action: defaultAction,
        targetClassNumber: defaultAction === 'GRADUATE' ? sourceClassNumber : targetClassNumber,
        targetClassId: defaultAction === 'GRADUATE' ? student.classId : targetClassId,
        targetSectionName: targetSecName,
        targetSectionId: targetSecId,
        newRollNumber: String(idx + 1).padStart(2, '0'),
        remarks: defaultRemark,
        avgPercentage,
        grade,
        hasExamRecord,
        selected: true
      };
    });

    // Apply initial roll numbering
    reorderRollNumbers(rows, rollNumberingStrategy);
    setStudentRows(rows);
    setExecutionResult(null);
  }, [sourceClassNumber, targetClassNumber, targetClassId, targetSectionsForClass, targetSectionDefault, students, marks, language]);

  // Re-sequence roll numbers helper
  const reorderRollNumbers = (rows: StudentPromotionRowState[], strategy: 'alpha' | 'current' | 'same') => {
    if (strategy === 'same') {
      rows.forEach(r => {
        r.newRollNumber = r.student.rollNumber || '01';
      });
      return;
    }

    let sorted = [...rows];
    if (strategy === 'alpha') {
      sorted.sort((a, b) => a.student.name.localeCompare(b.student.name));
    } else if (strategy === 'current') {
      sorted.sort((a, b) => {
        const rollA = parseInt(a.student.rollNumber) || 999;
        const rollB = parseInt(b.student.rollNumber) || 999;
        return rollA - rollB;
      });
    }

    // Assign sequential numbers to promoted and retained students
    let counter = 1;
    sorted.forEach(row => {
      if (row.action === 'PROMOTE' || row.action === 'RETAIN') {
        row.newRollNumber = String(counter++).padStart(2, '0');
      } else {
        row.newRollNumber = '-';
      }
    });
  };

  // Bulk Quick Action: Set Action for all selected
  const handleBulkSetAction = (action: PromotionAction) => {
    setStudentRows(prev => {
      const updated = prev.map(row => {
        if (!row.selected) return row;
        
        let tClassNum = targetClassNumber;
        let tClassId = targetClassId;
        let remarks = row.remarks;

        if (action === 'RETAIN') {
          tClassNum = sourceClassNumber;
          tClassId = row.student.classId;
          remarks = language === 'hi' 
            ? 'वार्षिक मूल्यांकन में उपचारात्मक आवश्यकता - इसी कक्षा में रोकें' 
            : 'Retained in same class for remedial support';
        } else if (action === 'TRANSFER') {
          remarks = language === 'hi' 
            ? 'स्थानांतरण प्रमाणपत्र (TC) जारी - अन्य विद्यालय हेतु' 
            : 'Transfer Certificate (TC) issued';
        } else if (action === 'GRADUATE') {
          remarks = language === 'hi' 
            ? 'कक्षा 8 उत्तीर्ण - पूर्व छात्र (Alumni)' 
            : 'Class 8 Elementary Education Completed';
        } else if (action === 'PROMOTE') {
          remarks = row.avgPercentage !== undefined 
            ? (language === 'hi' ? `सत्र परीक्षा परिणाम: ${row.avgPercentage}% (${row.grade}) के साथ पदोन्नत` : `Promoted with ${row.avgPercentage}% (${row.grade})`)
            : (language === 'hi' ? 'अगली कक्षा में पदोन्नत' : 'Promoted to next class level');
        }

        return {
          ...row,
          action,
          targetClassNumber: tClassNum,
          targetClassId: tClassId,
          remarks
        };
      });
      reorderRollNumbers(updated, rollNumberingStrategy);
      return updated;
    });
  };

  // Auto-Evaluate based on Exam Marks
  const handleAutoEvaluateFromMarks = () => {
    setStudentRows(prev => {
      const updated = prev.map(row => {
        // If student has marks and percentage < threshold, flag for Retain, otherwise Promote
        if (row.hasExamRecord && row.avgPercentage !== undefined) {
          const isPassed = row.avgPercentage >= passingPercentageThreshold;
          const action: PromotionAction = isPassed 
            ? (sourceClassNumber === 8 ? 'GRADUATE' : 'PROMOTE')
            : 'RETAIN';
          
          const tClassNum = action === 'RETAIN' ? sourceClassNumber : targetClassNumber;
          const tClassId = action === 'RETAIN' ? row.student.classId : targetClassId;
          const remarks = isPassed 
            ? (language === 'hi' ? `परीक्षा परिणाम: ${row.avgPercentage}% (${row.grade}) - उत्तीर्ण` : `Passed with ${row.avgPercentage}% (${row.grade})`)
            : (language === 'hi' ? `परीक्षा परिणाम: ${row.avgPercentage}% - पूरक/उपचारात्मक आवश्यकता` : `Below threshold (${row.avgPercentage}%) - Needs Remedial/Retained`);

          return {
            ...row,
            action,
            targetClassNumber: tClassNum,
            targetClassId: tClassId,
            remarks
          };
        } else {
          // RTE Policy: automatic promotion up to Class 8
          const action: PromotionAction = sourceClassNumber === 8 ? 'GRADUATE' : 'PROMOTE';
          return {
            ...row,
            action,
            targetClassNumber: targetClassNumber,
            targetClassId: targetClassId,
            remarks: language === 'hi' ? 'RTE 2009 धारा 16 के अनुसार शत-प्रतिशत पदोन्नति' : 'Promoted under RTE Elementary Progression'
          };
        }
      });
      reorderRollNumbers(updated, rollNumberingStrategy);
      return updated;
    });
  };

  // Update Individual Row Action
  const handleRowActionChange = (studentId: string, action: PromotionAction) => {
    setStudentRows(prev => {
      const updated = prev.map(row => {
        if (row.student.id !== studentId) return row;
        let tClassNum = targetClassNumber;
        let tClassId = targetClassId;
        let remarks = row.remarks;

        if (action === 'RETAIN') {
          tClassNum = sourceClassNumber;
          tClassId = row.student.classId;
          remarks = language === 'hi' ? 'इसी कक्षा में रोकें (Repeat/Retained)' : 'Retained in same class level';
        } else if (action === 'TRANSFER') {
          remarks = language === 'hi' ? 'टीसी जारी (Transferred)' : 'Transfer Certificate (TC) Issued';
        } else if (action === 'GRADUATE') {
          remarks = language === 'hi' ? 'कक्षा 8 उत्तीर्ण (Graduated)' : 'Elementary Level Graduated';
        } else {
          remarks = language === 'hi' ? 'अगली कक्षा में पदोन्नत' : 'Promoted to next class';
        }

        return {
          ...row,
          action,
          targetClassNumber: tClassNum,
          targetClassId: tClassId,
          remarks
        };
      });
      reorderRollNumbers(updated, rollNumberingStrategy);
      return updated;
    });
  };

  // Update Row Target Section
  const handleRowSectionChange = (studentId: string, secName: string) => {
    setStudentRows(prev => prev.map(row => {
      if (row.student.id !== studentId) return row;
      const matched = targetSectionsForClass.find(s => s.sectionName === secName);
      return {
        ...row,
        targetSectionName: secName,
        targetSectionId: matched ? matched.id : `sec-${row.targetClassNumber}-${secName}`
      };
    }));
  };

  // Update Row Roll Number
  const handleRowRollChange = (studentId: string, val: string) => {
    setStudentRows(prev => prev.map(row => {
      if (row.student.id !== studentId) return row;
      return { ...row, newRollNumber: val };
    }));
  };

  // Update Row Remarks
  const handleRowRemarksChange = (studentId: string, val: string) => {
    setStudentRows(prev => prev.map(row => {
      if (row.student.id !== studentId) return row;
      return { ...row, remarks: val };
    }));
  };

  // Toggle Single Selection
  const handleToggleSelectRow = (studentId: string) => {
    setStudentRows(prev => prev.map(row => {
      if (row.student.id !== studentId) return row;
      return { ...row, selected: !row.selected };
    }));
  };

  // Toggle All Selection
  const handleToggleSelectAll = (selectAll: boolean) => {
    setStudentRows(prev => prev.map(row => ({ ...row, selected: selectAll })));
  };

  // Filtered Rows for Display
  const filteredRows = useMemo(() => {
    return studentRows.filter(row => {
      // Section filter
      if (sourceSectionFilter !== 'all' && row.student.sectionName !== sourceSectionFilter) {
        return false;
      }
      // Action filter
      if (actionFilter !== 'all' && row.action !== actionFilter) {
        return false;
      }
      // Gender filter
      if (genderFilter !== 'all' && row.student.gender !== genderFilter) {
        return false;
      }
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = row.student.name.toLowerCase().includes(q);
        const matchesRoll = row.student.rollNumber.toLowerCase().includes(q);
        const matchesAdm = row.student.admissionNumber.toLowerCase().includes(q);
        const matchesFather = (row.student.fatherName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesAdm && !matchesFather) {
          return false;
        }
      }
      return true;
    });
  }, [studentRows, sourceSectionFilter, actionFilter, genderFilter, searchTerm]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = studentRows.length;
    const promoted = studentRows.filter(r => r.action === 'PROMOTE').length;
    const retained = studentRows.filter(r => r.action === 'RETAIN').length;
    const transferred = studentRows.filter(r => r.action === 'TRANSFER').length;
    const graduated = studentRows.filter(r => r.action === 'GRADUATE').length;
    const boys = studentRows.filter(r => r.student.gender === 'Male').length;
    const girls = studentRows.filter(r => r.student.gender === 'Female').length;
    const selectedCount = studentRows.filter(r => r.selected).length;

    return { total, promoted, retained, transferred, graduated, boys, girls, selectedCount };
  }, [studentRows]);

  // Execute Bulk Promotion
  const handleExecutePromotion = async () => {
    setIsProcessing(true);
    try {
      const decisions: PromotionDecision[] = studentRows.map(row => ({
        studentId: row.student.id,
        action: row.action,
        targetClassNumber: row.targetClassNumber,
        targetClassId: row.targetClassId,
        targetSectionName: row.targetSectionName,
        targetSectionId: row.targetSectionId,
        newRollNumber: row.newRollNumber,
        academicYear: targetYear,
        remarks: row.remarks,
        percentage: row.avgPercentage,
        isPassed: row.action === 'PROMOTE' || row.action === 'GRADUATE'
      }));

      const res = await bulkPromoteStudents(decisions, {
        sourceClassNumber,
        sourceAcademicYear: sourceYear,
        targetAcademicYear: targetYear,
        promotedBy: userProfile?.name || 'School Principal / Admin'
      });

      setExecutionResult({
        success: res.failedCount === 0,
        promoted: stats.promoted,
        retained: stats.retained,
        transferred: stats.transferred,
        graduated: stats.graduated,
        total: decisions.length,
        targetClassNumber,
        targetYear
      });

      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error("Bulk promotion execution error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Export Promotion Gazette to CSV
  const handleExportCSV = () => {
    const headers = [
      'Sl No',
      'Admission No',
      'Student Name',
      'Gender',
      'Father Name',
      'Current Class',
      'Current Roll',
      'Exam Score (%)',
      'Grade',
      'Decision (Action)',
      'New Class',
      'New Section',
      'New Roll No',
      'Academic Year',
      'Remarks'
    ];

    const rows = studentRows.map((r, idx) => [
      idx + 1,
      `"${r.student.admissionNumber}"`,
      `"${r.student.name}"`,
      `"${r.student.gender}"`,
      `"${r.student.fatherName}"`,
      `"Class ${r.student.classNumber}-${r.student.sectionName}"`,
      `"${r.student.rollNumber}"`,
      r.avgPercentage !== undefined ? `${r.avgPercentage}%` : 'N/A',
      `"${r.grade || 'N/A'}"`,
      `"${r.action}"`,
      r.action === 'GRADUATE' ? '"Class 8 Completed (Alumni)"' : `"Class ${r.targetClassNumber}"`,
      `"${r.targetSectionName}"`,
      `"${r.newRollNumber}"`,
      `"${targetYear}"`,
      `"${r.remarks}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Class_${sourceClassNumber}_Promotion_Gazette_${targetYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Gazette
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Instructions */}
      <div className="bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-3xl border border-amber-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                {language === 'hi' ? 'वार्षिक सत्र रोल-ओवर' : 'Annual Session Rollover'}
              </span>
              <span className="text-xs text-amber-800 font-bold">
                {language === 'hi' ? 'कक्षा 1 से 8 बल्क पदोन्नति प्रणाली' : 'Classes 1–8 Bulk Student Promotion'}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {language === 'hi' ? 'छात्र बल्क पदोन्नति एवं सत्र परिवर्तन' : 'Bulk Student Promotion & Session Transition'}
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              {language === 'hi'
                ? 'इस मॉड्यूल के माध्यम से आप किसी भी कक्षा के सभी विद्यार्थियों को परीक्षा परिणामों (Pass/Fail) के आधार पर अगली कक्षा/वर्ग एवं नवीन शैक्षणिक सत्र में स्थानांतरित कर सकते हैं। आरटीई नियमानुसार कक्षा 8 के छात्रों को पूर्व-छात्र (Graduated/Alumni) के रूप में चिह्नित किया जाता है।'
                : 'Effortlessly promote students from one class/section to the next academic session. Evaluate annual exam performance (Pass/Fail), assign new sections and roll numbers, issue TCs, or graduate Class 8 students.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              disabled={studentRows.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'hi' ? 'गजट CSV' : 'Export CSV'}</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={studentRows.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hi' ? 'पदोन्नति पंजिका प्रिंट' : 'Print Register'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Execution Success Notification */}
      {executionResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-xs animate-in fade-in duration-200 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-950">
                  {language === 'hi'
                    ? `सफलतापूर्वक निष्पादित! कक्षा ${sourceClassNumber} के ${executionResult.total} छात्रों का सत्र परिवर्तन पूर्ण हुआ।`
                    : `Session Rollover Successful! Processed ${executionResult.total} students from Class ${sourceClassNumber}.`}
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {language === 'hi'
                    ? `पदोन्नत: ${executionResult.promoted} | रोके गए: ${executionResult.retained} | टीसी जारी: ${executionResult.transferred} | उत्तीर्ण/ग्रेजुएट: ${executionResult.graduated} • नवीन सत्र: ${executionResult.targetYear}`
                    : `Promoted: ${executionResult.promoted} | Retained: ${executionResult.retained} | Transferred: ${executionResult.transferred} | Graduated: ${executionResult.graduated} • Target Session: ${executionResult.targetYear}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setExecutionResult(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1.5 rounded-lg hover:bg-emerald-100/60 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Class Selection Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">1</span>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {language === 'hi' ? 'स्रोत कक्षा एवं वर्तमान सत्र चयन (Source Class):' : 'Select Source Class & Current Session:'}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {students.filter(s => s.classNumber === sourceClassNumber && s.status === 'active').length} {language === 'hi' ? 'छात्र नामांकित' : 'Active Students in this class'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(cNum => {
            const isSelected = sourceClassNumber === cNum;
            const classStudents = students.filter(s => s.classNumber === cNum && s.status === 'active');
            const boys = classStudents.filter(s => s.gender === 'Male').length;
            const girls = classStudents.filter(s => s.gender === 'Female').length;

            return (
              <button
                key={cNum}
                onClick={() => {
                  setSourceClassNumber(cNum);
                  setExecutionResult(null);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400/50 scale-102'
                    : 'bg-slate-50 hover:bg-slate-100/80 text-slate-700 border-slate-200'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                  {cNum <= 5 ? 'Primary' : 'Upper Pri.'}
                </span>
                <span className="text-sm font-black">Class {cNum}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {classStudents.length}
                  </span>
                  <span className={`text-[9px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    ({boys}B/{girls}G)
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Transition Configuration & Target Session Settings */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">2</span>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            {language === 'hi' ? 'सत्र पदोन्नति सेटिंग्स एवं नियम (Progression Rules):' : 'Progression Configuration & Defaults:'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
          {/* Source to Target Session */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'hi' ? 'शैक्षणिक सत्र रोल-ओवर' : 'Academic Sessions'}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sourceYear}
                onChange={(e) => setSourceYear(e.target.value)}
                placeholder="2025-2026"
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-700"
                title="Source Session"
              />
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                placeholder="2026-2027"
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-amber-50 border border-amber-300 rounded-lg text-amber-950 focus:ring-1 focus:ring-amber-500"
                title="Target Session"
              />
            </div>
          </div>

          {/* Target Class Mapping Display */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'hi' ? 'लक्षित कक्षा (Target Class)' : 'Target Progression Level'}</span>
            </label>
            <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Class {sourceClassNumber}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-700 font-black">
                {sourceClassNumber === 8 
                  ? (language === 'hi' ? 'कक्षा 8 उत्तीर्ण (Alumni)' : 'Class 8 Graduated') 
                  : `Class ${targetClassNumber}`}
              </span>
            </div>
          </div>

          {/* Target Section Allocation Strategy */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'hi' ? 'वर्ग आवंटन (Target Section)' : 'Default Target Section'}</span>
            </label>
            <select
              value={targetSectionDefault}
              onChange={(e) => setTargetSectionDefault(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="same">{language === 'hi' ? 'समान वर्ग रखें (Auto A->A, B->B)' : 'Keep Same as Current Section'}</option>
              <option value="A">{language === 'hi' ? 'सभी को सेक्शन A में भेजें' : 'Allocate All to Section A'}</option>
              <option value="B">{language === 'hi' ? 'सभी को सेक्शन B में भेजें' : 'Allocate All to Section B'}</option>
              <option value="C">{language === 'hi' ? 'सभी को सेक्शन C में भेजें' : 'Allocate All to Section C'}</option>
            </select>
          </div>

          {/* Roll Numbering Strategy */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'hi' ? 'अनुक्रमांक क्रम (Roll Strategy)' : 'Roll Number Strategy'}</span>
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={rollNumberingStrategy}
                onChange={(e) => {
                  const strat = e.target.value as 'alpha' | 'current' | 'same';
                  setRollNumberingStrategy(strat);
                  setStudentRows(prev => {
                    const updated = [...prev];
                    reorderRollNumbers(updated, strat);
                    return updated;
                  });
                }}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="alpha">{language === 'hi' ? 'वर्णमाला क्रमानुसार (A-Z)' : 'Alphabetical (A-Z)'}</option>
                <option value="current">{language === 'hi' ? 'वर्तमान रोल नंबर क्रम' : 'Current Roll Order'}</option>
                <option value="same">{language === 'hi' ? 'समान रोल नंबर रखें' : 'Retain Exact Same Roll'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 3: Student Roster Table with Individual Actions */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
        {/* Table Top Controls Bar */}
        <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">3</span>
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {language === 'hi' ? 'छात्र-वार पदोन्नति एवं मूल्यांकन ग्रिड:' : 'Student Evaluation & Promotion Matrix:'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
              {filteredRows.length} / {studentRows.length} {language === 'hi' ? 'छात्र' : 'Students'}
            </span>
          </div>

          {/* Quick Bulk Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleBulkSetAction('PROMOTE')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Promote all selected to next class"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'सभी को पदोन्नत करें (Pass)' : 'Promote All'}</span>
            </button>

            <button
              onClick={handleAutoEvaluateFromMarks}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs transition-all cursor-pointer"
              title="Automatically calculate pass/fail based on annual exam marks"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'अंकों से स्वतः तय करें (Auto Eval)' : 'Auto-Evaluate Marks'}</span>
            </button>

            <button
              onClick={() => handleBulkSetAction('RETAIN')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold transition-all cursor-pointer"
              title="Retain all in same class"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'सभी रोकें (Retain)' : 'Retain All'}</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Sub-bar */}
        <div className="px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'नाम, रोल या प्रवेश संख्या से खोजें...' : 'Search student by name, roll, adm no...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-700"
            >
              <option value="all">{language === 'hi' ? 'सभी स्थितियां (All Actions)' : 'All Actions'}</option>
              <option value="PROMOTE">🟢 {language === 'hi' ? 'पदोन्नत (Promote)' : 'Promoted'}</option>
              <option value="RETAIN">🔴 {language === 'hi' ? 'रोके गए (Retained)' : 'Retained'}</option>
              <option value="TRANSFER">🟡 {language === 'hi' ? 'टीसी (Transfer)' : 'Transferred'}</option>
              <option value="GRADUATE">🎓 {language === 'hi' ? 'उत्तीर्ण (Graduated)' : 'Graduated'}</option>
            </select>

            {/* Gender Filter */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-700"
            >
              <option value="all">{language === 'hi' ? 'सभी छात्र/छात्राएं' : 'All Genders'}</option>
              <option value="Male">{language === 'hi' ? 'बालक (Boys)' : 'Boys Only'}</option>
              <option value="Female">{language === 'hi' ? 'बालिका (Girls)' : 'Girls Only'}</option>
            </select>
          </div>
        </div>

        {/* The Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-y border-slate-200 text-[11px] font-black text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={studentRows.length > 0 && studentRows.every(r => r.selected)}
                    onChange={(e) => handleToggleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-16">{language === 'hi' ? 'वर्तमान रोल' : 'Cur. Roll'}</th>
                <th className="py-3 px-3 min-w-[180px]">{language === 'hi' ? 'विद्यार्थी का नाम व विवरण' : 'Student & Details'}</th>
                <th className="py-3 px-3 min-w-[120px]">{language === 'hi' ? 'वार्षिक अंक/प्रदर्शन' : 'Annual Exam %'}</th>
                <th className="py-3 px-3 min-w-[180px]">{language === 'hi' ? 'पदोन्नति निर्णय (Action)' : 'Promotion Decision'}</th>
                <th className="py-3 px-3 min-w-[110px]">{language === 'hi' ? 'नवीन कक्षा/वर्ग' : 'Target Class/Sec'}</th>
                <th className="py-3 px-3 w-20">{language === 'hi' ? 'नवीन रोल' : 'New Roll'}</th>
                <th className="py-3 px-3 min-w-[200px]">{language === 'hi' ? 'टिप्पणी (Remarks)' : 'Progression Remarks'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-bold">{language === 'hi' ? 'कोई छात्र रिकॉर्ड नहीं मिला' : 'No students found in this class filter'}</p>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const s = row.student;
                  const isPromoted = row.action === 'PROMOTE';
                  const isRetained = row.action === 'RETAIN';
                  const isTransferred = row.action === 'TRANSFER';
                  const isGraduated = row.action === 'GRADUATE';

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isRetained ? 'bg-rose-50/20' : isTransferred ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => handleToggleSelectRow(s.id)}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>

                      {/* Current Roll & Adm */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        <div className="bg-slate-100 px-2 py-0.5 rounded text-center text-[11px]">
                          {s.rollNumber}
                        </div>
                        <div className="text-[9px] text-slate-400 text-center mt-0.5">
                          {s.admissionNumber}
                        </div>
                      </td>

                      {/* Student Details */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                            s.gender === 'Female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{s.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                s.gender === 'Female' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {s.gender === 'Female' ? 'F' : 'M'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {language === 'hi' ? 'पिता:' : 'Father:'} {s.fatherName || 'N/A'} • Sec {s.sectionName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Annual Exam Score & Grade */}
                      <td className="py-3 px-3">
                        {row.hasExamRecord && row.avgPercentage !== undefined ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                row.avgPercentage >= 60 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : row.avgPercentage >= 33 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {row.avgPercentage}%
                              </span>
                              <span className="text-[10px] font-bold text-slate-600">
                                Grade {row.grade}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 block font-medium">
                              {row.avgPercentage >= 33 
                                ? (language === 'hi' ? '✓ उत्तीर्ण (Passed)' : '✓ Passed') 
                                : (language === 'hi' ? '⚠ अनुत्तीर्ण (Below Cutoff)' : '⚠ Needs Remedial')}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-500 font-medium">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold block w-fit">
                              {language === 'hi' ? 'RTE पदोन्नति' : 'RTE Direct Pass'}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5 block">
                              {language === 'hi' ? 'CCE आधारित' : 'Continuous Eval'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Action Decision Selector */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRowActionChange(s.id, 'PROMOTE')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              isPromoted
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                            title="Promote to next class"
                          >
                            {language === 'hi' ? 'पदोन्नत' : 'Promote'}
                          </button>

                          <button
                            onClick={() => handleRowActionChange(s.id, 'RETAIN')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              isRetained
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                            title="Retain in same class"
                          >
                            {language === 'hi' ? 'रोकें' : 'Retain'}
                          </button>

                          {sourceClassNumber === 8 ? (
                            <button
                              onClick={() => handleRowActionChange(s.id, 'GRADUATE')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                isGraduated
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                              }`}
                              title="Mark as Class 8 Graduated"
                            >
                              {language === 'hi' ? 'उत्तीर्ण' : 'Graduate'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRowActionChange(s.id, 'TRANSFER')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                isTransferred
                                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                              }`}
                              title="Issue Transfer Certificate"
                            >
                              {language === 'hi' ? 'टीसी' : 'TC'}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Target Class & Section */}
                      <td className="py-3 px-3">
                        {isPromoted ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 text-[11px]">
                              Cl {row.targetClassNumber}
                            </span>
                            <span className="text-slate-400">-</span>
                            <select
                              value={row.targetSectionName}
                              onChange={(e) => handleRowSectionChange(s.id, e.target.value)}
                              className="px-1.5 py-0.5 text-[11px] font-bold bg-white border border-slate-200 rounded text-slate-800"
                            >
                              {targetSectionsForClass.length > 0 ? (
                                targetSectionsForClass.map(sec => (
                                  <option key={sec.id} value={sec.sectionName}>
                                    Sec {sec.sectionName}
                                  </option>
                                ))
                              ) : (
                                <>
                                  <option value="A">Sec A</option>
                                  <option value="B">Sec B</option>
                                </>
                              )}
                            </select>
                          </div>
                        ) : isRetained ? (
                          <div className="text-[11px] font-bold text-rose-700">
                            Class {sourceClassNumber}-{row.targetSectionName} (Repeat)
                          </div>
                        ) : isGraduated ? (
                          <div className="text-[11px] font-bold text-indigo-700 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Alumni</span>
                          </div>
                        ) : (
                          <div className="text-[11px] font-bold text-amber-700">
                            TC Issued
                          </div>
                        )}
                      </td>

                      {/* New Roll Number */}
                      <td className="py-3 px-3">
                        {isPromoted || isRetained ? (
                          <input
                            type="text"
                            value={row.newRollNumber}
                            onChange={(e) => handleRowRollChange(s.id, e.target.value)}
                            className="w-12 px-1.5 py-1 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
                        ) : (
                          <span className="text-slate-400 font-mono text-center block">-</span>
                        )}
                      </td>

                      {/* Remarks */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={row.remarks}
                          onChange={(e) => handleRowRemarksChange(s.id, e.target.value)}
                          placeholder="Remarks / Note..."
                          className="w-full px-2 py-1 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded focus:ring-1 focus:ring-amber-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Review & Execution Strip */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Summary Badges */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <span className="font-black text-slate-800 uppercase tracking-wider">
              {language === 'hi' ? 'सारांश:' : 'Summary:'}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{stats.promoted} {language === 'hi' ? 'पदोन्नत' : 'To Promote'}</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-900 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{stats.retained} {language === 'hi' ? 'रोके गए' : 'Retained'}</span>
            </span>
            {stats.transferred > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{stats.transferred} {language === 'hi' ? 'टीसी जारी' : 'Transferred'}</span>
              </span>
            )}
            {stats.graduated > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-900 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>{stats.graduated} {language === 'hi' ? 'उत्तीर्ण (Alumni)' : 'Graduated'}</span>
              </span>
            )}
            <span className="text-slate-500 font-medium">
              ({stats.boys} {language === 'hi' ? 'बालक' : 'Boys'} / {stats.girls} {language === 'hi' ? 'बालिकाएं' : 'Girls'})
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={studentRows.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {language === 'hi'
                ? `सत्र परिवर्तन एवं पदोन्नति लागू करें (${stats.total} छात्र)`
                : `Execute Annual Promotion (${stats.total} Students)`}
            </span>
          </button>
        </div>
      </div>

      {/* Confirmation & Audit Modal */}
      {isConfirmModalOpen && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title={language === 'hi' ? 'सत्र पदोन्नति की पुष्टि करें (Confirm Bulk Promotion)' : 'Confirm Bulk Student Progression'}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-black">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {language === 'hi'
                    ? 'कृपया सत्र परिवर्तन की अंतिम पुष्टि करें'
                    : 'Institutional Audit Confirmation Required'}
                </span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                {language === 'hi'
                  ? `आप कक्षा ${sourceClassNumber} (${sourceYear}) के कुल ${stats.total} छात्रों को शैक्षणिक सत्र ${targetYear} के लिए स्थानांतरित करने जा रहे हैं।`
                  : `You are about to execute the annual rollover for Class ${sourceClassNumber} (${sourceYear}) into Session ${targetYear}.`}
              </p>
            </div>

            {/* Breakdown List */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
              <div className="text-slate-600">
                {language === 'hi' ? 'पदोन्नत होने वाले छात्र:' : 'Promoted to Next Class:'}
              </div>
              <div className="font-black text-emerald-700 text-right">{stats.promoted}</div>

              <div className="text-slate-600">
                {language === 'hi' ? 'इसी कक्षा में रोके गए:' : 'Retained (Repeat Year):'}
              </div>
              <div className="font-black text-rose-700 text-right">{stats.retained}</div>

              <div className="text-slate-600">
                {language === 'hi' ? 'स्थानांतरण प्रमाणपत्र (TC):' : 'Transfer Certificate (TC):'}
              </div>
              <div className="font-black text-amber-700 text-right">{stats.transferred}</div>

              <div className="text-slate-600">
                {language === 'hi' ? 'कक्षा 8 उत्तीर्ण (Alumni):' : 'Graduated / Alumni:'}
              </div>
              <div className="font-black text-indigo-700 text-right">{stats.graduated}</div>
            </div>

            <div className="text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200">
              {language === 'hi'
                ? '• यह कार्रवाई सभी नामांकित छात्रों के वर्ग, रोल नंबर एवं डेटाबेस को अद्यतन करेगी तथा सुरक्षा लॉग में दर्ज की जाएगी।'
                : '• This action will update student class assignments, sections, roll numbers, and record an audit log in the master institutional register.'}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={handleExecutePromotion}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'hi' ? 'प्रक्रिया जारी है...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === 'hi' ? 'हाँ, पदोन्नति लागू करें' : 'Confirm & Execute'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
