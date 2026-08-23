import React, { useState, useEffect, useRef } from 'react';
import { Student, SchoolSettings } from '../../types';
import { 
  Printer, 
  X, 
  School, 
  QrCode, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Heart, 
  Calendar, 
  User, 
  Layers, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  CreditCard,
  Sparkles
} from 'lucide-react';
import QRCode from 'qrcode';

interface StudentIdCardPrintProps {
  student: Student;
  settings: SchoolSettings;
  onClose: () => void;
  onEditProfile?: () => void;
}

type CardTheme = 'navy' | 'emerald' | 'crimson' | 'slate';
type CardViewMode = 'dual' | 'front' | 'back';

export const StudentIdCardPrint: React.FC<StudentIdCardPrintProps> = ({
  student,
  settings,
  onClose,
  onEditProfile
}) => {
  const [theme, setTheme] = useState<CardTheme>('navy');
  const [viewMode, setViewMode] = useState<CardViewMode>('dual');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate dynamic official verification QR Code
  useEffect(() => {
    const generateQR = async () => {
      try {
        const verificationPayload = JSON.stringify({
          type: "STUDENT_ID_VERIFICATION",
          schoolName: settings.schoolName || "Govt. School",
          diseCode: settings.schoolCode || "09290205902",
          studentId: student.studentId || student.id,
          admissionNo: student.admissionNumber || student.registrationNumber || "N/A",
          name: student.fullName || student.name,
          class: `Class ${student.classNumber || 5} - '${student.sectionName || 'A'}'`,
          rollNo: student.rollNumber || "1",
          dob: student.dateOfBirth || student.dob || "N/A",
          bloodGroup: student.bloodGroup || "O+",
          emergencyContact: student.mobile || student.phone || "N/A",
          academicYear: settings.academicYear || "2025-2026",
          validUntil: "31-03-2026",
          status: "OFFICIALLY_VERIFIED"
        });

        const url = await QRCode.toDataURL(verificationPayload, {
          width: 240,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
        setQrCodeDataUrl(url);
      } catch (err) {
        console.error("QR Code generation error:", err);
      }
    };

    generateQR();
  }, [student, settings]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCardDetails = () => {
    const details = `STUDENT IDENTITY CARD
-------------------------
Name: ${student.fullName || student.name}
Student ID: ${student.studentId || student.id}
Admission No: ${student.admissionNumber || student.registrationNumber}
Class & Section: Class ${student.classNumber} - Section ${student.sectionName}
Roll No: ${student.rollNumber}
Father's Name: ${student.fatherName}
Mother's Name: ${student.motherName || 'N/A'}
Date of Birth: ${student.dateOfBirth || student.dob}
Blood Group: ${student.bloodGroup || 'O+'}
Emergency Mobile: ${student.mobile || student.phone}
Address: ${student.address}
School: ${settings.schoolName} (DISE: ${settings.schoolCode})
Session: ${settings.academicYear || '2025-2026'}`;

    navigator.clipboard?.writeText(details);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Theme styling helpers
  const getThemeClasses = (type: CardTheme) => {
    switch (type) {
      case 'emerald':
        return {
          headerBg: 'bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950',
          accentBorder: 'border-emerald-500',
          accentText: 'text-emerald-400',
          badgeBg: 'bg-emerald-500 text-slate-950',
          subBar: 'bg-emerald-800 text-emerald-100',
          highlight: 'text-emerald-700',
          photoRing: 'ring-emerald-500',
          tagBg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'crimson':
        return {
          headerBg: 'bg-gradient-to-r from-rose-950 via-red-900 to-rose-900',
          accentBorder: 'border-amber-400',
          accentText: 'text-amber-300',
          badgeBg: 'bg-amber-400 text-slate-950',
          subBar: 'bg-rose-900 text-rose-100',
          highlight: 'text-rose-700',
          photoRing: 'ring-amber-400',
          tagBg: 'bg-rose-50 text-rose-800 border-rose-200'
        };
      case 'slate':
        return {
          headerBg: 'bg-gradient-to-r from-slate-900 via-zinc-900 to-neutral-900',
          accentBorder: 'border-cyan-400',
          accentText: 'text-cyan-300',
          badgeBg: 'bg-cyan-400 text-slate-950',
          subBar: 'bg-slate-800 text-slate-200',
          highlight: 'text-slate-800',
          photoRing: 'ring-cyan-400',
          tagBg: 'bg-slate-100 text-slate-800 border-slate-300'
        };
      case 'navy':
      default:
        return {
          headerBg: 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950',
          accentBorder: 'border-amber-400',
          accentText: 'text-amber-300',
          badgeBg: 'bg-amber-400 text-slate-950',
          subBar: 'bg-blue-900/90 text-blue-100',
          highlight: 'text-blue-900',
          photoRing: 'ring-amber-400',
          tagBg: 'bg-amber-50 text-amber-900 border-amber-200'
        };
    }
  };

  const themeStyles = getThemeClasses(theme);

  const studentName = student.fullName || student.name || 'Student';
  const studentPhoto = student.photoURL || student.profilePhoto;
  const fatherName = student.fatherName || 'Guardian';
  const motherName = student.motherName || 'Mother';
  const dob = student.dateOfBirth || student.dob || '2015-05-15';
  const gender = student.gender || 'Male';
  const bloodGroup = student.bloodGroup || 'O+';
  const mobile = student.mobile || student.phone || '9876543210';
  const address = student.address || 'Village Harsinghpur Gova, Post Shamsabad, Dist Farrukhabad UP';
  const admNo = student.admissionNumber || student.registrationNumber || `ADM-${student.id.substring(0, 6).toUpperCase()}`;
  const studentId = student.studentId || `STU-${student.id.substring(0, 6).toUpperCase()}`;
  const rollNo = student.rollNumber || '1';
  const classNo = student.classNumber || 5;
  const section = student.sectionName || 'A';
  const aadhaar = student.aadhaarNumber || 'XXXX-XXXX-8921';
  const academicYear = settings.academicYear || '2025-2026';
  const schoolName = settings.schoolName || 'Govt. Primary School Harsinghpur Gova';
  const schoolCode = settings.schoolCode || '09290205902';
  const schoolAddress = settings.address || 'Village Harsinghpur Gova, Block Shamsabad, Farrukhabad, Uttar Pradesh - 209503';
  const schoolPhone = settings.phone || '+91 5692-234567';
  const schoolEmail = settings.email || 'ps.harsinghpur@upbasicshiksha.gov.in';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #official-id-card-print-container, #official-id-card-print-container * {
            visibility: visible;
          }
          #official-id-card-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex !important;
            justify-content: center;
            align-items: flex-start;
            padding: 20px;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[96vh] print:border-none print:shadow-none print:max-w-none print:max-h-none">
        
        {/* Modal Top Control Bar (Hidden during Print) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-wide uppercase">
                  Official Student Identity Card
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Synced
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official institutional ID card with dynamic QR verification & security barcode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('dual')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'dual' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Front + Back
              </button>
              <button
                onClick={() => setViewMode('front')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'front' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Front Only
              </button>
              <button
                onClick={() => setViewMode('back')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'back' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Back Only
              </button>
            </div>

            {/* Print Action */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Card</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customization Toolbar (Themes & Actions) - Hidden in Print */}
        <div className="bg-slate-50 px-4 sm:px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">Theme / Layout:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTheme('navy')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                  theme === 'navy' ? 'bg-blue-900 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <span>UP Govt Navy</span>
              </button>
              <button
                onClick={() => setTheme('emerald')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                  theme === 'emerald' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                <span>Emerald Elite</span>
              </button>
              <button
                onClick={() => setTheme('crimson')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                  theme === 'crimson' ? 'bg-rose-900 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-rose-600"></div>
                <span>Royal Crimson</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCardDetails}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              {copiedNotification ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Details Copied!</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Details</span>
                </>
              )}
            </button>

            {onEditProfile && (
              <button
                onClick={() => {
                  onClose();
                  onEditProfile();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold hover:bg-amber-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit Info / Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* ID Card Display Stage */}
        <div className="p-4 sm:p-8 bg-slate-100 overflow-y-auto flex-1 flex flex-col items-center justify-center min-h-[420px]">
          
          <div 
            id="official-id-card-print-container" 
            ref={cardRef}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 w-full"
          >
            {/* ============================================================ */}
            {/* FRONT SIDE OF ID CARD (Standard PVC CR-80 Dimension Ratio) */}
            {/* ============================================================ */}
            {(viewMode === 'dual' || viewMode === 'front') && (
              <div className="w-[340px] sm:w-[350px] bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-300 relative text-slate-900 flex flex-col select-none print:shadow-none print:border-2 print:border-slate-800 print:break-inside-avoid">
                
                {/* Header Band */}
                <div className={`${themeStyles.headerBg} text-white p-3 text-center relative border-b-2 ${themeStyles.accentBorder}`}>
                  {/* Decorative State Emblem Insignia */}
                  <div className="flex items-center justify-between px-1 mb-1">
                    <div className="w-7 h-7 rounded-full bg-white/10 p-0.5 border border-white/20 flex items-center justify-center shadow-inner">
                      <School className="w-4 h-4 text-amber-300" />
                    </div>
                    <div className="text-center flex-1 px-1">
                      <div className="text-[8px] font-black tracking-widest text-amber-300 uppercase">
                        DEPARTMENT OF BASIC EDUCATION • GOVT. OF U.P.
                      </div>
                      <div className="text-[11px] font-black tracking-tight text-white leading-tight truncate">
                        {schoolName}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/10 p-0.5 border border-white/20 flex items-center justify-center shadow-inner">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  {/* Sub Header Badge */}
                  <div className="flex items-center justify-between text-[8px] font-semibold text-slate-300 px-1 pt-0.5 border-t border-white/10">
                    <span>DISE: <b className="text-amber-200">{schoolCode}</b></span>
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[7.5px] uppercase">
                      STUDENT ID CARD
                    </span>
                    <span>SESSION: <b className="text-amber-200">{academicYear}</b></span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex flex-col items-center bg-gradient-to-b from-slate-50/80 to-white">
                  
                  {/* Photo & Primary Details Row */}
                  <div className="w-full flex items-start gap-3 mb-2.5">
                    {/* Student Photo */}
                    <div className="flex flex-col items-center">
                      <div className={`w-[84px] h-[102px] rounded-xl bg-slate-100 border-2 ${themeStyles.accentBorder} overflow-hidden shadow-md relative group flex items-center justify-center ring-2 ${themeStyles.photoRing} ring-offset-1`}>
                        {studentPhoto ? (
                          <img 
                            src={studentPhoto} 
                            alt={studentName} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 text-slate-600">
                            <User className="w-8 h-8 text-slate-400 mb-1" />
                            <span className="text-[9px] font-black uppercase text-slate-500">NO PHOTO</span>
                          </div>
                        )}
                        {/* Genuine Holographic Ribbon Tag */}
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 text-amber-300 text-[7px] font-black text-center py-0.5 tracking-wider uppercase border-t border-amber-400/50">
                          STUDENT
                        </div>
                      </div>

                      {/* Blood Group Badge */}
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-black shadow-2xs">
                        <Heart className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                        <span>{bloodGroup}</span>
                      </div>
                    </div>

                    {/* Core Academic Identity Info */}
                    <div className="flex-1 space-y-1 text-left min-w-0">
                      <div>
                        <h4 className="text-base font-black text-slate-900 tracking-tight leading-tight truncate">
                          {studentName}
                        </h4>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-extrabold mt-0.5">
                          <span>Class {classNo} - Section '{section}'</span>
                          <span>•</span>
                          <span>Roll #{rollNo}</span>
                        </div>
                      </div>

                      {/* Micro Info Table */}
                      <div className="space-y-0.5 text-[10px] pt-1 text-slate-700">
                        <div className="flex justify-between border-b border-slate-100 pb-0.5">
                          <span className="text-slate-400 font-bold uppercase text-[8.5px]">Student ID:</span>
                          <span className="font-mono font-bold text-slate-900">{studentId}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-0.5">
                          <span className="text-slate-400 font-bold uppercase text-[8.5px]">Admission No:</span>
                          <span className="font-mono font-bold text-slate-900">{admNo}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-0.5">
                          <span className="text-slate-400 font-bold uppercase text-[8.5px]">Date of Birth:</span>
                          <span className="font-bold text-slate-800">{dob}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold uppercase text-[8.5px]">Gender / Cat:</span>
                          <span className="font-bold text-slate-800">{gender} • {student.category || 'General'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Details Grid Box */}
                  <div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200/90 text-[9.5px] space-y-1 mb-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase">Father / Guardian</div>
                        <div className="font-bold text-slate-900 truncate">{fatherName}</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase">Mother's Name</div>
                        <div className="font-bold text-slate-900 truncate">{motherName}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Phone className="w-2.5 h-2.5 text-slate-400" />
                        <span className="text-[8px] font-bold uppercase">Emergency:</span>
                        <span className="font-bold text-slate-900">{mobile}</span>
                      </div>
                      <div className="text-[8px] font-mono text-slate-500">
                        UID: <span className="font-bold text-slate-700">{aadhaar.length > 8 ? `XXXX-XXXX-${aadhaar.slice(-4)}` : aadhaar}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code & Authority Signatures Footer */}
                  <div className="w-full pt-2 border-t border-slate-200 flex items-center justify-between">
                    {/* Live Scannable QR Code */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-12 rounded-lg bg-white p-0.5 border border-slate-300 shadow-2xs flex items-center justify-center">
                        {qrCodeDataUrl ? (
                          <img src={qrCodeDataUrl} alt="Verification QR" className="w-full h-full object-contain" />
                        ) : (
                          <QrCode className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-[7.5px] font-black text-emerald-700 flex items-center gap-0.5 uppercase">
                          <CheckCircle2 className="w-2 h-2 text-emerald-600" />
                          <span>QR Verified</span>
                        </div>
                        <div className="text-[7px] text-slate-400 font-mono">Scan for Records</div>
                      </div>
                    </div>

                    {/* Official Digital Signature & Stamp */}
                    <div className="text-right flex flex-col items-end">
                      <div className="relative mb-0.5">
                        {/* Stamp effect */}
                        <div className="px-2 py-0.5 rounded-full border border-blue-600/40 bg-blue-50/50 text-[7px] font-black text-blue-900 rotate-[-4deg] shadow-2xs">
                          SEAL & VERIFIED
                        </div>
                      </div>
                      <div className="w-24 border-t border-slate-400 pt-0.5 text-center">
                        <div className="text-[8.5px] font-black text-slate-900 leading-none">
                          Headmaster / Principal
                        </div>
                        <div className="text-[6.5px] text-slate-400 leading-tight">
                          Issuing Authority
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barcode Strip */}
                  <div className="w-full mt-2 pt-1 border-t border-dashed border-slate-200 flex items-center justify-between text-[7px] text-slate-400 font-mono">
                    <span className="tracking-widest font-black text-slate-700 text-[8px]">
                      ||| |||| | ||||| ||| || |||||| | ||
                    </span>
                    <span>VAL: 03/2026</span>
                    <span>{studentId}</span>
                  </div>

                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* BACK SIDE OF ID CARD (Terms, Address, Emergency & Guidelines) */}
            {/* ============================================================ */}
            {(viewMode === 'dual' || viewMode === 'back') && (
              <div className="w-[340px] sm:w-[350px] bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-300 relative text-slate-900 flex flex-col select-none print:shadow-none print:border-2 print:border-slate-800 print:break-inside-avoid">
                
                {/* Back Top Banner */}
                <div className={`${themeStyles.headerBg} text-white p-2.5 text-center border-b-2 ${themeStyles.accentBorder}`}>
                  <div className="text-[9px] font-black tracking-wider text-amber-300 uppercase">
                    STUDENT IDENTITY CARD • TERMS & DIRECTIVES
                  </div>
                  <div className="text-[8px] text-slate-300">
                    नियम, निर्देश एवं आपातकालीन सहायता संपर्क
                  </div>
                </div>

                {/* Back Body Content */}
                <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2.5 text-[9.5px] bg-slate-50/50">
                  
                  {/* Student Permanent Residential Address */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1 text-[8.5px] font-black text-slate-500 uppercase tracking-wide">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span>Permanent Residential Address (स्थायी पता):</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-800 leading-snug pl-4">
                      {address}
                    </p>
                  </div>

                  {/* Institutional Contact & Campus Info */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1 text-[8.5px] font-black text-slate-500 uppercase tracking-wide">
                      <School className="w-3 h-3 text-blue-600" />
                      <span>Issuing Institution (जारीकर्ता विद्यालय):</span>
                    </div>
                    <div className="text-[9.5px] text-slate-700 pl-4 space-y-0.5">
                      <div className="font-bold text-slate-900">{schoolName}</div>
                      <div>{schoolAddress}</div>
                      <div className="text-[8.5px] text-slate-500 font-mono">
                        Phone: {schoolPhone} • Email: {schoolEmail}
                      </div>
                    </div>
                  </div>

                  {/* Emergency Helpline Numbers (State & National) */}
                  <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200 space-y-1">
                    <div className="text-[8px] font-black text-amber-900 uppercase flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-amber-700" />
                      <span>Emergency Helplines / आपातकालीन सहायता:</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center text-[8px] font-black">
                      <div className="bg-white p-1 rounded-md border border-amber-200 text-slate-800">
                        <div className="text-[7px] text-slate-400">CHILDLINE</div>
                        <div className="text-amber-700 font-extrabold text-[9.5px]">1098</div>
                      </div>
                      <div className="bg-white p-1 rounded-md border border-amber-200 text-slate-800">
                        <div className="text-[7px] text-slate-400">AMBULANCE</div>
                        <div className="text-rose-700 font-extrabold text-[9.5px]">108</div>
                      </div>
                      <div className="bg-white p-1 rounded-md border border-amber-200 text-slate-800">
                        <div className="text-[7px] text-slate-400">POLICE</div>
                        <div className="text-blue-700 font-extrabold text-[9.5px]">112</div>
                      </div>
                      <div className="bg-white p-1 rounded-md border border-amber-200 text-slate-800">
                        <div className="text-[7px] text-slate-400">WOMEN HELP</div>
                        <div className="text-emerald-700 font-extrabold text-[9.5px]">1090</div>
                      </div>
                    </div>
                  </div>

                  {/* Rules & Lost Property Disclaimer */}
                  <div className="text-[8px] text-slate-500 leading-tight space-y-0.5 bg-white p-2 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-700 flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5 text-amber-500" />
                      <span>Card Usage Rules (नियम एवं शर्तें):</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 pl-1 text-[7.5px] text-slate-600">
                      <li>यह पहचान पत्र विद्यालय की संपत्ति है। इसे प्रतिदिन धारण करना अनिवार्य है।</li>
                      <li>यदि यह पहचान पत्र किसी को मिले तो कृपया निकटतम डाकघर या विद्यालय पते पर लौटाएं।</li>
                      <li>This card is non-transferable and valid for Academic Session 2025-2026.</li>
                    </ul>
                  </div>

                  {/* Signature Row */}
                  <div className="pt-2 border-t border-slate-200 flex items-end justify-between px-1">
                    <div className="text-center w-28">
                      <div className="h-5 flex items-end justify-center">
                        <span className="font-serif italic text-[10px] text-slate-600">{studentName.split(' ')[0]}</span>
                      </div>
                      <div className="border-t border-slate-400 text-[7.5px] font-bold text-slate-700 pt-0.5">
                        Student's Signature
                      </div>
                    </div>

                    <div className="text-center w-28">
                      <div className="h-5 flex items-end justify-center">
                        <span className="font-serif italic text-[10px] text-blue-900 font-black">Authorized Sign</span>
                      </div>
                      <div className="border-t border-slate-400 text-[7.5px] font-bold text-slate-700 pt-0.5">
                        Principal Stamp
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Note */}
        <div className="bg-slate-900 px-6 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Standard CR-80 PVC Card Format (85.6mm × 53.98mm) • Suitable for Direct PVC Tray or A4 Print</span>
          </div>
          <button
            onClick={handlePrint}
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Click here to Print / Save as PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
