import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Student, 
  Teacher, 
  SchoolClass, 
  Section, 
  Subject, 
  TeacherAssignment, 
  AttendanceRecord, 
  Examination, 
  Mark, 
  Homework, 
  Submission, 
  TimetableItem, 
  Notice, 
  StudentDocument, 
  AuditLog, 
  SchoolSettings,
  FacilityItem,
  GovernmentScheme,
  GalleryItem,
  PublicDocument,
  AttendanceStatus,
  HistoricalRecordItem,
  SchoolAggregateOverview,
  OfficialSource,
  FAQItem,
  VerificationLog,
  DataVerificationStatus,
  PromotionDecision,
  PromotionBatchSummary
} from '../types';
import { 
  initialClasses, 
  initialSections, 
  initialTeachers, 
  initialSubjects, 
  initialTeacherAssignments, 
  initialStudents, 
  initialAttendance, 
  initialExaminations, 
  initialMarks, 
  initialHomework, 
  initialSubmissions, 
  initialTimetable, 
  initialNotices, 
  initialDocuments, 
  initialAuditLogs, 
  initialSettings,
  initialFacilities,
  initialGovernmentSchemes,
  initialGallery,
  initialPublicDocuments,
  initialHistoricalRecords,
  initialAggregateOverview,
  initialOfficialSources,
  initialFAQ,
  initialVerificationLogs
} from '../data/seedData';
import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from '../lib/firebase';
import { useAuth } from './AuthContext';

interface SchoolContextType {
  // Language Support
  language: 'hi' | 'en';
  setLanguage: (lang: 'hi' | 'en') => void;

  // Data Collections
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  sections: Section[];
  subjects: Subject[];
  teacherAssignments: TeacherAssignment[];
  attendance: AttendanceRecord[];
  examinations: Examination[];
  marks: Mark[];
  homeworkList: Homework[];
  submissions: Submission[];
  timetable: TimetableItem[];
  notices: Notice[];
  documents: StudentDocument[];
  auditLogs: AuditLog[];
  settings: SchoolSettings;
  facilities: FacilityItem[];
  governmentSchemes: GovernmentScheme[];
  gallery: GalleryItem[];
  publicDocuments: PublicDocument[];
  historicalRecords: HistoricalRecordItem[];
  aggregateOverview: SchoolAggregateOverview;
  officialSources: OfficialSource[];
  faqList: FAQItem[];
  verificationLogs: VerificationLog[];
  loading: boolean;

  // Verification & Logs Actions
  addVerificationLog: (log: Omit<VerificationLog, 'id' | 'updatedAt'>) => Promise<string>;
  updateSchoolSettingsWithAudit: (
    newSettings: Partial<SchoolSettings>, 
    logInfo?: { field: string; previousValue: string; newValue: string; source: string; status: DataVerificationStatus; notes?: string }
  ) => Promise<void>;
  updateAggregateOverview: (
    overview: Partial<SchoolAggregateOverview>,
    logInfo?: { field: string; previousValue: string; newValue: string; source: string; status: DataVerificationStatus; notes?: string }
  ) => Promise<void>;

  // Facility Actions
  updateFacility: (id: string, data: Partial<FacilityItem>) => Promise<void>;
  addFacility: (facility: Omit<FacilityItem, 'id'>) => Promise<string>;

  // Government Scheme Actions
  updateGovernmentScheme: (id: string, data: Partial<GovernmentScheme>) => Promise<void>;
  addGovernmentScheme: (scheme: Omit<GovernmentScheme, 'id'>) => Promise<string>;

  // Gallery Actions
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => Promise<string>;
  updateGalleryItem: (id: string, data: Partial<GalleryItem>) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;
  reorderGalleryItems: (items: GalleryItem[]) => Promise<void>;

  // Public Documents Actions
  addPublicDocument: (docData: Omit<PublicDocument, 'id'>) => Promise<string>;
  deletePublicDocument: (id: string) => Promise<void>;

  // Student Actions
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => Promise<string>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deactivateStudent: (id: string) => Promise<void>;
  activateStudent: (id: string) => Promise<void>;
  bulkPromoteStudents: (
    decisions: PromotionDecision[],
    metadata: {
      sourceClassNumber: number;
      sourceAcademicYear?: string;
      targetAcademicYear: string;
      promotedBy: string;
    }
  ) => Promise<{ successCount: number; failedCount: number }>;

  // Teacher Actions
  addTeacher: (teacher: Omit<Teacher, 'id' | 'createdAt'>) => Promise<string>;
  updateTeacher: (id: string, data: Partial<Teacher>) => Promise<void>;
  deactivateTeacher: (id: string) => Promise<void>;

  // Class & Section Actions
  addClass: (cls: Omit<SchoolClass, 'id' | 'createdAt'>) => Promise<string>;
  addSection: (sec: Omit<Section, 'id'>) => Promise<string>;
  updateSection: (id: string, data: Partial<Section>) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;

  // Subject Actions
  addSubject: (subj: Omit<Subject, 'id'>) => Promise<string>;
  updateSubject: (id: string, data: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // Teacher Assignment Actions
  assignTeacher: (asgn: Omit<TeacherAssignment, 'id'>) => Promise<string>;
  removeAssignment: (id: string) => Promise<void>;

  // Attendance Actions
  saveBulkAttendance: (
    records: any[],
    classId?: string,
    sectionId?: string,
    date?: string,
    subjectId?: string,
    teacherId?: string
  ) => Promise<{ success: boolean; error?: string; count?: number }>;
  getStudentAttendanceStats: (studentId: string) => { total: number; present: number; absent: number; late: number; percentage: number };
  getClassAttendanceSummary: (classId: string, sectionId: string, date: string) => { total: number; present: number; absent: number; late: number; percentage: number };

  // Exam & Marks Actions
  addExam: (exam: Omit<Examination, 'id' | 'createdAt'>) => Promise<string>;
  updateExam: (id: string, data: Partial<Examination>) => Promise<void>;
  saveStudentMarks: (marksData: Omit<Mark, 'id' | 'createdAt' | 'grade' | 'percentage'>[]) => Promise<void>;
  calculateGrade: (percentage: number) => { grade: string; remarks: string };

  // Homework Actions
  addHomework: (hw: Omit<Homework, 'id' | 'createdAt'>) => Promise<string>;
  submitHomework: (submission: Omit<Submission, 'id' | 'submittedAt'>) => Promise<string>;
  gradeSubmission: (submissionId: string, marks: number, feedback: string) => Promise<void>;

  // Timetable Actions
  addTimetableItem: (item: Omit<TimetableItem, 'id'>) => Promise<string>;
  deleteTimetableItem: (id: string) => Promise<void>;

  // Notice Actions
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt'>) => Promise<string>;
  updateNotice: (id: string, data: Partial<Notice>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;

  // Document Actions
  addDocument: (docData: Omit<StudentDocument, 'id' | 'createdAt'>) => Promise<string>;
  updateDocument: (id: string, data: Partial<StudentDocument>) => Promise<void>;
  verifyDocument: (id: string, verifiedStatus: 'VERIFIED' | 'REJECTED', notes?: string, verifiedByName?: string) => Promise<void>;
  requestDocumentUpdate: (id: string, updateData: { fileURL: string; fileName?: string; fileSize?: string; fileType?: string; notes?: string; requestedBy?: string }) => Promise<void>;
  approveDocumentUpdate: (id: string, notes?: string, approvedByName?: string) => Promise<void>;
  rejectDocumentUpdate: (id: string, rejectionReason: string, rejectedByName?: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  // System & Logs
  addAuditLog: (action: string, entity: string, entityId?: string, details?: string) => Promise<void>;
  updateSettings: (newSettings: Partial<SchoolSettings>) => Promise<void>;
  resetToDefaultSeedData: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'sms_gov_';

function loadOrInitial<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : initial;
  } catch (e) {
    return initial;
  }
}

function loadSettingsOrInitial(): SchoolSettings {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'settings');
    if (!item) return initialSettings;
    const parsed = JSON.parse(item);
    return {
      ...initialSettings,
      ...parsed,
      village: (parsed.village && parsed.village !== 'undefined') ? parsed.village : initialSettings.village,
      villageHi: (parsed.villageHi && parsed.villageHi !== 'undefined') ? parsed.villageHi : initialSettings.villageHi,
      post: (parsed.post && parsed.post !== 'undefined') ? parsed.post : initialSettings.post,
      postHi: (parsed.postHi && parsed.postHi !== 'undefined') ? parsed.postHi : initialSettings.postHi,
      postOffice: (parsed.postOffice && parsed.postOffice !== 'undefined') ? parsed.postOffice : (initialSettings.postOffice || initialSettings.post),
      postOfficeHi: (parsed.postOfficeHi && parsed.postOfficeHi !== 'undefined') ? parsed.postOfficeHi : (initialSettings.postOfficeHi || initialSettings.postHi),
      block: (parsed.block && parsed.block !== 'undefined') ? parsed.block : initialSettings.block,
      blockHi: (parsed.blockHi && parsed.blockHi !== 'undefined') ? parsed.blockHi : initialSettings.blockHi,
      district: (parsed.district && parsed.district !== 'undefined' && parsed.district !== 'Rampur') ? parsed.district : initialSettings.district,
      districtHi: (parsed.districtHi && parsed.districtHi !== 'undefined' && parsed.districtHi !== 'रामपुर') ? parsed.districtHi : initialSettings.districtHi,
      state: (parsed.state && parsed.state !== 'undefined') ? parsed.state : initialSettings.state,
      stateHi: (parsed.stateHi && parsed.stateHi !== 'undefined') ? parsed.stateHi : initialSettings.stateHi,
      address: (parsed.address && parsed.address !== 'undefined') ? parsed.address : initialSettings.address,
      addressHi: (parsed.addressHi && parsed.addressHi !== 'undefined') ? parsed.addressHi : initialSettings.addressHi,
      pincode: (parsed.pincode && parsed.pincode !== 'undefined') ? parsed.pincode : initialSettings.pincode,
      pinCode: (parsed.pinCode && parsed.pinCode !== 'undefined') ? parsed.pinCode : initialSettings.pinCode,
    };
  } catch (e) {
    return initialSettings;
  }
}

function loadStudentsOrInitial(): Student[] {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'students');
    if (!item) return initialStudents;
    const parsed: Student[] = JSON.parse(item);
    if (!Array.isArray(parsed) || parsed.length === 0) return initialStudents;
    const existingIds = new Set(parsed.map(s => s.id));
    const missingSeedItems = initialStudents.filter(s => !existingIds.has(s.id));
    return [...parsed, ...missingSeedItems];
  } catch (e) {
    return initialStudents;
  }
}

function loadDocumentsOrInitial(): StudentDocument[] {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'documents');
    if (!item) return initialDocuments;
    const parsed: StudentDocument[] = JSON.parse(item);
    if (!Array.isArray(parsed) || parsed.length === 0) return initialDocuments;
    const existingIds = new Set(parsed.map(d => d.id));
    const missingSeedDocs = initialDocuments.filter(d => !existingIds.has(d.id));
    return [...parsed, ...missingSeedDocs];
  } catch (e) {
    return initialDocuments;
  }
}

function loadGalleryOrInitial(): GalleryItem[] {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'gallery');
    if (!item) return initialGallery;
    const parsed: GalleryItem[] = JSON.parse(item);
    if (!Array.isArray(parsed) || parsed.length === 0) return initialGallery;
    
    // Map existing items with updated initialGallery attributes for seed items
    const seedMap = new Map(initialGallery.map(g => [g.id, g]));
    const updatedParsed = parsed.map(p => {
      const seedMatch = seedMap.get(p.id);
      if (seedMatch) {
        // Keep updated titles/videos from seedData
        return {
          ...p,
          titleEn: seedMatch.titleEn,
          titleHi: seedMatch.titleHi,
          captionEn: seedMatch.captionEn,
          captionHi: seedMatch.captionHi,
          category: seedMatch.category,
          mediaType: seedMatch.mediaType,
          videoURL: seedMatch.videoURL || p.videoURL,
          youtubeId: seedMatch.youtubeId || p.youtubeId,
          thumbnailURL: seedMatch.thumbnailURL || p.thumbnailURL,
          duration: seedMatch.duration || p.duration,
          imageURL: seedMatch.imageURL || p.imageURL,
          imageUrl: seedMatch.imageUrl || p.imageUrl,
          tags: seedMatch.tags || p.tags,
          albumName: seedMatch.albumName || p.albumName,
          targetClass: seedMatch.targetClass || p.targetClass,
          ageGroup: seedMatch.ageGroup || p.ageGroup,
          sortOrder: seedMatch.sortOrder !== undefined ? seedMatch.sortOrder : p.sortOrder
        };
      }
      return p;
    });

    const existingIds = new Set(updatedParsed.map(g => g.id));
    const missingSeedItems = initialGallery.filter(g => !existingIds.has(g.id));
    return [...missingSeedItems, ...updatedParsed].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (e) {
    return initialGallery;
  }
}

function saveLocal<T>(key: string, data: T) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn("Storage quota limit or serialization issue:", e);
  }
}

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();

  const [language, setLanguage] = useState<'hi' | 'en'>(() => {
    const saved = localStorage.getItem('sms_gov_lang');
    return (saved === 'en' || saved === 'hi') ? saved : 'hi';
  });

  const [students, setStudents] = useState<Student[]>(() => loadStudentsOrInitial());
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadOrInitial('teachers', initialTeachers));
  const [classes, setClasses] = useState<SchoolClass[]>(() => loadOrInitial('classes', initialClasses));
  const [sections, setSections] = useState<Section[]>(() => loadOrInitial('sections', initialSections));
  const [subjects, setSubjects] = useState<Subject[]>(() => loadOrInitial('subjects', initialSubjects));
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>(() => loadOrInitial('teacherAssignments', initialTeacherAssignments));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadOrInitial('attendance', initialAttendance));
  const [examinations, setExaminations] = useState<Examination[]>(() => loadOrInitial('examinations', initialExaminations));
  const [marks, setMarks] = useState<Mark[]>(() => loadOrInitial('marks', initialMarks));
  const [homeworkList, setHomeworkList] = useState<Homework[]>(() => loadOrInitial('homework', initialHomework));
  const [submissions, setSubmissions] = useState<Submission[]>(() => loadOrInitial('submissions', initialSubmissions));
  const [timetable, setTimetable] = useState<TimetableItem[]>(() => loadOrInitial('timetable', initialTimetable));
  const [notices, setNotices] = useState<Notice[]>(() => loadOrInitial('notices', initialNotices));
  const [documents, setDocuments] = useState<StudentDocument[]>(() => loadDocumentsOrInitial());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadOrInitial('auditLogs', initialAuditLogs));
  const [settings, setSettings] = useState<SchoolSettings>(() => loadSettingsOrInitial());
  const [facilities, setFacilities] = useState<FacilityItem[]>(() => loadOrInitial('facilities', initialFacilities));
  const [governmentSchemes, setGovernmentSchemes] = useState<GovernmentScheme[]>(() => loadOrInitial('governmentSchemes', initialGovernmentSchemes));
  const [gallery, setGallery] = useState<GalleryItem[]>(() => loadGalleryOrInitial());
  const [publicDocuments, setPublicDocuments] = useState<PublicDocument[]>(() => loadOrInitial('publicDocuments', initialPublicDocuments));
  const [historicalRecords, setHistoricalRecords] = useState<HistoricalRecordItem[]>(() => loadOrInitial('historicalRecords', initialHistoricalRecords));
  const [aggregateOverview, setAggregateOverview] = useState<SchoolAggregateOverview>(() => loadOrInitial('aggregateOverview', initialAggregateOverview));
  const [officialSources, setOfficialSources] = useState<OfficialSource[]>(() => loadOrInitial('officialSources', initialOfficialSources));
  const [faqList, setFaqList] = useState<FAQItem[]>(() => loadOrInitial('faqList', initialFAQ));
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>(() => loadOrInitial('verificationLogs', initialVerificationLogs));
  const [loading, setLoading] = useState<boolean>(false);

  // Sync to localStorage on state changes
  useEffect(() => { localStorage.setItem('sms_gov_lang', language); }, [language]);
  useEffect(() => { saveLocal('students', students); }, [students]);
  useEffect(() => { saveLocal('teachers', teachers); }, [teachers]);
  useEffect(() => { saveLocal('classes', classes); }, [classes]);
  useEffect(() => { saveLocal('sections', sections); }, [sections]);
  useEffect(() => { saveLocal('subjects', subjects); }, [subjects]);
  useEffect(() => { saveLocal('teacherAssignments', teacherAssignments); }, [teacherAssignments]);
  useEffect(() => { saveLocal('attendance', attendance); }, [attendance]);
  useEffect(() => { saveLocal('examinations', examinations); }, [examinations]);
  useEffect(() => { saveLocal('marks', marks); }, [marks]);
  useEffect(() => { saveLocal('homework', homeworkList); }, [homeworkList]);
  useEffect(() => { saveLocal('submissions', submissions); }, [submissions]);
  useEffect(() => { saveLocal('timetable', timetable); }, [timetable]);
  useEffect(() => { saveLocal('notices', notices); }, [notices]);
  useEffect(() => { saveLocal('documents', documents); }, [documents]);
  useEffect(() => { saveLocal('auditLogs', auditLogs); }, [auditLogs]);
  useEffect(() => { saveLocal('settings', settings); }, [settings]);
  useEffect(() => { saveLocal('facilities', facilities); }, [facilities]);
  useEffect(() => { saveLocal('governmentSchemes', governmentSchemes); }, [governmentSchemes]);
  useEffect(() => { saveLocal('gallery', gallery); }, [gallery]);
  useEffect(() => { saveLocal('publicDocuments', publicDocuments); }, [publicDocuments]);
  useEffect(() => { saveLocal('historicalRecords', historicalRecords); }, [historicalRecords]);
  useEffect(() => { saveLocal('aggregateOverview', aggregateOverview); }, [aggregateOverview]);
  useEffect(() => { saveLocal('officialSources', officialSources); }, [officialSources]);
  useEffect(() => { saveLocal('faqList', faqList); }, [faqList]);
  useEffect(() => { saveLocal('verificationLogs', verificationLogs); }, [verificationLogs]);

  // Initial Firestore Data Hydration
  useEffect(() => {
    let isMounted = true;
    const hydrateFromFirestore = async () => {
      if (!db) return;
      setLoading(true);

      // Fetch teachers from Firestore (public)
      try {
        const tchSnap = await getDocs(collection(db, 'teachers'));
        if (!tchSnap.empty && isMounted) {
          const remoteTch: Teacher[] = [];
          tchSnap.forEach(d => remoteTch.push(d.data() as Teacher));
          if (remoteTch.length > 0) {
            setTeachers(prev => {
              const map = new Map(prev.map(t => [t.id, t]));
              remoteTch.forEach(t => map.set(t.id, t));
              return Array.from(map.values());
            });
          }
        }
      } catch (e) {
        // Teacher fetch fallback to local/seed
      }

      // Fetch notices from Firestore (public)
      try {
        const notSnap = await getDocs(collection(db, 'notices'));
        if (!notSnap.empty && isMounted) {
          const remoteNot: Notice[] = [];
          notSnap.forEach(d => remoteNot.push(d.data() as Notice));
          if (remoteNot.length > 0) {
            setNotices(prev => {
              const map = new Map(prev.map(n => [n.id, n]));
              remoteNot.forEach(n => map.set(n.id, n));
              return Array.from(map.values());
            });
          }
        }
      } catch (e) {
        // Notice fetch fallback
      }

      // Fetch settings from Firestore (public)
      try {
        const setSnap = await getDocs(collection(db, 'settings'));
        if (!setSnap.empty && isMounted) {
          const cfg = setSnap.docs.find(d => d.id === 'school_config');
          if (cfg) {
            setSettings(prev => ({ ...prev, ...(cfg.data() as SchoolSettings) }));
          }
        }
      } catch (e) {
        // Settings fetch fallback
      }

      // Fetch students from Firestore (if permission granted / authorized)
      try {
        const stuSnap = await getDocs(collection(db, 'students'));
        if (!stuSnap.empty && isMounted) {
          const remoteStu: Student[] = [];
          stuSnap.forEach(d => remoteStu.push(d.data() as Student));
          if (remoteStu.length > 0) {
            setStudents(prev => {
              const map = new Map(prev.map(s => [s.id, s]));
              remoteStu.forEach(s => map.set(s.id, s));
              return Array.from(map.values());
            });
          }
        }
      } catch (e) {
        // Student fetch fallback for guest/unauthorized state
      }

      if (isMounted) setLoading(false);
    };

    hydrateFromFirestore();
    return () => {
      isMounted = false;
    };
  }, []);

  // Ensure logged-in student's registered profile is seamlessly present and synced in students collection state
  useEffect(() => {
    if (userProfile && userProfile.role === 'student') {
      const studentName = (userProfile.fullName || userProfile.name || '').trim();
      if (studentName) {
        setStudents(prev => {
          const index = prev.findIndex(s =>
            (userProfile.uid && (s.id === userProfile.uid || s.uid === userProfile.uid || s.userId === userProfile.uid)) ||
            (userProfile.linkedEntityId && (s.id === userProfile.linkedEntityId || s.uid === userProfile.linkedEntityId)) ||
            (userProfile.username && s.studentId && s.studentId.toUpperCase() === userProfile.username.toUpperCase()) ||
            (userProfile.admissionNumber && s.admissionNumber && s.admissionNumber.toUpperCase() === userProfile.admissionNumber.toUpperCase()) ||
            (userProfile.email && s.email && s.email.toLowerCase() === userProfile.email.toLowerCase())
          );

          if (index >= 0) {
            // Update existing student with registered name and profile details
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              name: studentName,
              fullName: studentName,
              email: userProfile.email || updated[index].email,
              phone: userProfile.phone || updated[index].phone || updated[index].mobile,
              mobile: userProfile.phone || updated[index].mobile || updated[index].phone,
              fatherName: userProfile.fatherName || updated[index].fatherName,
              motherName: userProfile.motherName || updated[index].motherName,
              guardianName: userProfile.guardianName || userProfile.fatherName || updated[index].guardianName,
              classNumber: userProfile.classNumber || updated[index].classNumber || 5,
              class: userProfile.classNumber || updated[index].class || 5,
              sectionName: userProfile.sectionName || updated[index].sectionName || 'A',
              section: userProfile.sectionName || updated[index].section || 'A',
              rollNumber: userProfile.rollNumber || updated[index].rollNumber || '1',
              dateOfBirth: userProfile.dateOfBirth || updated[index].dateOfBirth || '2015-05-15',
              dob: userProfile.dateOfBirth || updated[index].dob || '2015-05-15',
              gender: userProfile.gender || updated[index].gender || 'Male',
              category: (userProfile.category as any) || updated[index].category || 'General',
              admissionNumber: userProfile.admissionNumber || updated[index].admissionNumber,
              photoURL: userProfile.photoURL || userProfile.profilePhoto || updated[index].photoURL || updated[index].profilePhoto,
              profilePhoto: userProfile.photoURL || userProfile.profilePhoto || updated[index].profilePhoto || updated[index].photoURL,
            };
            return updated;
          } else {
            // Prepend new student record
            const newRecord: Student = {
              id: userProfile.uid || userProfile.linkedEntityId || `stu-${Date.now()}`,
              uid: userProfile.uid,
              userId: userProfile.uid,
              studentId: userProfile.username || `STU-${(userProfile.uid || '2026').substring(0, 6).toUpperCase()}`,
              admissionNumber: userProfile.admissionNumber || `ADM-${(userProfile.uid || '2026').substring(0, 6).toUpperCase()}`,
              name: studentName,
              fullName: studentName,
              email: userProfile.email || '',
              emailVerified: Boolean(userProfile.emailVerified),
              phone: userProfile.phone || '',
              mobile: userProfile.phone || '',
              classNumber: userProfile.classNumber || 5,
              class: userProfile.classNumber || 5,
              classId: `class-${userProfile.classNumber || 5}`,
              sectionName: userProfile.sectionName || 'A',
              section: userProfile.sectionName || 'A',
              sectionId: `sec-${userProfile.classNumber || 5}-${userProfile.sectionName || 'A'}`,
              rollNumber: userProfile.rollNumber || '1',
              fatherName: userProfile.fatherName || 'Guardian',
              motherName: userProfile.motherName || 'Mother',
              guardianName: userProfile.guardianName || userProfile.fatherName || 'Guardian',
              dateOfBirth: userProfile.dateOfBirth || '2015-05-15',
              dob: userProfile.dateOfBirth || '2015-05-15',
              gender: userProfile.gender || 'Male',
              category: (userProfile.category as any) || 'General',
              address: userProfile.address || 'Village Harsinghpur Gova, Post Shamsabad, Dist Farrukhabad UP',
              photoURL: userProfile.photoURL || userProfile.profilePhoto || '',
              profilePhoto: userProfile.photoURL || userProfile.profilePhoto || '',
              status: 'active',
              admissionDate: userProfile.createdAt ? userProfile.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
              createdAt: userProfile.createdAt || new Date().toISOString()
            };
            return [newRecord, ...prev];
          }
        });
      }
    } else if (userProfile && userProfile.role === 'teacher') {
      const teacherName = (userProfile.fullName || userProfile.name || '').trim();
      if (teacherName) {
        setTeachers(prev => {
          const index = prev.findIndex(t =>
            (userProfile.uid && (t.id === userProfile.uid || t.id === userProfile.linkedEntityId)) ||
            (userProfile.employeeId && t.employeeId && t.employeeId.toUpperCase() === userProfile.employeeId.toUpperCase()) ||
            (userProfile.username && t.employeeId && t.employeeId.toUpperCase() === userProfile.username.toUpperCase()) ||
            (userProfile.email && t.email && t.email.toLowerCase() === userProfile.email.toLowerCase())
          );

          if (index >= 0) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              name: teacherName,
              email: userProfile.email || updated[index].email,
              phone: userProfile.phone || updated[index].phone,
              designation: userProfile.designation || updated[index].designation || 'Assistant Teacher (Primary)',
              qualification: userProfile.qualification || updated[index].qualification || 'B.Ed, TET Qualified',
              specialization: userProfile.specialization || userProfile.subject || updated[index].specialization || 'Elementary Education',
              photoURL: userProfile.photoURL || userProfile.profilePhoto || updated[index].photoURL,
              status: 'active'
            };
            return updated;
          } else {
            const newTeacherRecord: Teacher = {
              id: userProfile.linkedEntityId || userProfile.uid || `tch-${Date.now()}`,
              employeeId: userProfile.employeeId || userProfile.username || `TCH-${Date.now().toString().slice(-4)}`,
              name: teacherName,
              email: userProfile.email || '',
              phone: userProfile.phone || '',
              qualification: userProfile.qualification || 'B.Ed, TET Qualified',
              designation: userProfile.designation || 'Assistant Teacher (Primary)',
              specialization: userProfile.specialization || userProfile.subject || 'Elementary Education',
              joiningDate: userProfile.createdAt ? userProfile.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
              address: 'School Residential Campus, District',
              photoURL: userProfile.photoURL || userProfile.profilePhoto || '',
              status: 'active',
              createdAt: userProfile.createdAt || new Date().toISOString()
            };
            return [...prev, newTeacherRecord];
          }
        });
      }
    }
  }, [userProfile]);

  // Verification Log Helper
  const addVerificationLog = async (log: Omit<VerificationLog, 'id' | 'updatedAt'>): Promise<string> => {
    const newLog: VerificationLog = {
      ...log,
      id: `vlog-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      updatedAt: new Date().toISOString()
    };
    setVerificationLogs(prev => [newLog, ...prev]);

    try {
      if (db) {
        await setDoc(doc(db, 'verificationLogs', newLog.id), newLog);
      }
    } catch (e) {
      console.warn("Firestore log save fallback:", e);
    }
    return newLog.id;
  };

  // Update Settings with automatic Verification Log
  const updateSchoolSettingsWithAudit = async (
    newSettings: Partial<SchoolSettings>, 
    logInfo?: { field: string; previousValue: string; newValue: string; source: string; status: DataVerificationStatus; notes?: string }
  ) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    if (logInfo) {
      await addVerificationLog({
        entity: 'School Settings',
        field: logInfo.field,
        previousValue: logInfo.previousValue,
        newValue: logInfo.newValue,
        source: logInfo.source,
        verificationStatus: logInfo.status,
        updatedBy: userProfile?.name || 'Admin',
        notes: logInfo.notes
      });
    }
    try {
      if (db) {
        await setDoc(doc(db, 'settings', 'school_config'), { ...settings, ...newSettings });
      }
    } catch (e) {
      console.warn("Firestore settings update fallback:", e);
    }
  };

  // Update Aggregate Overview with Verification Log
  const updateAggregateOverview = async (
    overview: Partial<SchoolAggregateOverview>,
    logInfo?: { field: string; previousValue: string; newValue: string; source: string; status: DataVerificationStatus; notes?: string }
  ) => {
    setAggregateOverview(prev => ({ ...prev, ...overview }));
    if (logInfo) {
      await addVerificationLog({
        entity: 'Student Statistics',
        field: logInfo.field,
        previousValue: logInfo.previousValue,
        newValue: logInfo.newValue,
        source: logInfo.source,
        verificationStatus: logInfo.status,
        updatedBy: userProfile?.name || 'Admin',
        notes: logInfo.notes
      });
    }
  };

  // Audit Log Helper
  const addAuditLog = async (action: string, entity: string, entityId?: string, details?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: userProfile?.uid || 'system',
      userName: userProfile?.name || 'System User',
      userRole: userProfile?.role || 'admin',
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);

    try {
      if (db) {
        await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
      }
    } catch (e) {
      console.warn("Firestore audit log fallback to local:", e);
    }
  };

  // Grade Calculation based on settings
  const calculateGrade = (percentage: number): { grade: string; remarks: string } => {
    const scale = settings.gradingScale.find(
      s => percentage >= s.minPercentage && percentage <= s.maxPercentage
    );
    if (scale) {
      return { grade: scale.grade, remarks: scale.remarks };
    }
    if (percentage >= 90) return { grade: "A+", remarks: "Outstanding" };
    if (percentage >= 80) return { grade: "A", remarks: "Excellent" };
    if (percentage >= 70) return { grade: "B+", remarks: "Very Good" };
    if (percentage >= 60) return { grade: "B", remarks: "Good" };
    if (percentage >= 50) return { grade: "C", remarks: "Fair" };
    if (percentage >= 33) return { grade: "D", remarks: "Pass" };
    return { grade: "E", remarks: "Needs Improvement" };
  };

  // Student Methods
  const addStudent = async (data: Omit<Student, 'id' | 'createdAt'>): Promise<string> => {
    if (userProfile?.role !== 'admin' && userProfile?.role !== 'teacher') {
      console.warn("Unauthorized attempt to add student.");
      await addAuditLog('UNAUTHORIZED_ACTION', 'Student', 'NEW', 'Blocked unauthorized attempt to create student record');
      return '';
    }
    const id = `stu-${Date.now()}`;
    const newStudent: Student = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    setStudents(prev => [newStudent, ...prev]);
    await addAuditLog('ADD_STUDENT', 'Student', id, `Added student ${newStudent.name} (${newStudent.rollNumber}) to Class ${newStudent.classNumber}-${newStudent.sectionName}`);
    try {
      await setDoc(doc(db, 'students', id), newStudent);
    } catch (e) {
      console.warn("Firestore sync:", e);
    }
    return id;
  };

  const updateStudent = async (id: string, data: Partial<Student>) => {
    // Only Admin, Teacher, or the Student themselves (matching their own UID/linkedEntityId) can update
    const isSelf = userProfile?.role === 'student' && (userProfile.uid === id || userProfile.linkedEntityId === id);
    const isStaff = userProfile?.role === 'admin' || userProfile?.role === 'teacher';

    if (!isStaff && !isSelf) {
      console.warn("Unauthorized attempt to update student record:", id);
      await addAuditLog('UNAUTHORIZED_ACTION', 'Student', id, 'Blocked unauthorized attempt to modify student record');
      return;
    }

    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s));
    const target = students.find(s => s.id === id);
    await addAuditLog('UPDATE_STUDENT', 'Student', id, `Updated student details for ${target?.name || id}`);
    try {
      await updateDoc(doc(db, 'students', id), { ...data, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.warn("Firestore sync:", e);
    }
  };

  const deactivateStudent = async (id: string) => {
    if (userProfile?.role !== 'admin') {
      console.warn("Unauthorized attempt to deactivate student.");
      return;
    }
    await updateStudent(id, { status: 'inactive' });
  };

  const activateStudent = async (id: string) => {
    if (userProfile?.role !== 'admin') {
      console.warn("Unauthorized attempt to activate student.");
      return;
    }
    await updateStudent(id, { status: 'active' });
  };

  const bulkPromoteStudents = async (
    decisions: PromotionDecision[],
    metadata: {
      sourceClassNumber: number;
      sourceAcademicYear?: string;
      targetAcademicYear: string;
      promotedBy: string;
    }
  ): Promise<{ successCount: number; failedCount: number }> => {
    if (userProfile?.role !== 'admin') {
      console.warn("Unauthorized attempt to bulk promote students.");
      await addAuditLog('UNAUTHORIZED_ACTION', 'BulkPromotion', `Class-${metadata.sourceClassNumber}`, 'Blocked non-admin attempt to execute bulk student promotion');
      return { successCount: 0, failedCount: decisions.length };
    }

    let successCount = 0;
    let failedCount = 0;
    const now = new Date().toISOString();

    const decisionMap = new Map<string, PromotionDecision>(decisions.map(d => [d.studentId, d]));

    setStudents(prev => prev.map(student => {
      const decision = decisionMap.get(student.id);
      if (!decision) return student;

      if (decision.action === 'PROMOTE') {
        return {
          ...student,
          classId: decision.targetClassId,
          classNumber: decision.targetClassNumber,
          sectionId: decision.targetSectionId,
          sectionName: decision.targetSectionName,
          rollNumber: decision.newRollNumber || student.rollNumber,
          status: 'active',
          updatedAt: now
        };
      } else if (decision.action === 'RETAIN') {
        return {
          ...student,
          classId: decision.targetClassId || student.classId,
          classNumber: decision.targetClassNumber || student.classNumber,
          sectionId: decision.targetSectionId || student.sectionId,
          sectionName: decision.targetSectionName || student.sectionName,
          rollNumber: decision.newRollNumber || student.rollNumber,
          status: 'active',
          updatedAt: now
        };
      } else if (decision.action === 'TRANSFER') {
        return {
          ...student,
          status: 'transferred',
          updatedAt: now
        };
      } else if (decision.action === 'GRADUATE') {
        return {
          ...student,
          status: 'inactive',
          updatedAt: now
        };
      }
      return student;
    }));

    for (const decision of decisions) {
      try {
        let updatePayload: Partial<Student> = {
          updatedAt: now
        };
        if (decision.action === 'PROMOTE' || decision.action === 'RETAIN') {
          updatePayload = {
            classId: decision.targetClassId,
            classNumber: decision.targetClassNumber,
            sectionId: decision.targetSectionId,
            sectionName: decision.targetSectionName,
            rollNumber: decision.newRollNumber,
            status: 'active',
            updatedAt: now
          };
        } else if (decision.action === 'TRANSFER') {
          updatePayload = {
            status: 'transferred',
            updatedAt: now
          };
        } else if (decision.action === 'GRADUATE') {
          updatePayload = {
            status: 'inactive',
            updatedAt: now
          };
        }

        if (db) {
          await updateDoc(doc(db, 'students', decision.studentId), updatePayload);
        }
        successCount++;
      } catch (err) {
        console.warn(`Failed to sync promotion for student ${decision.studentId}:`, err);
        failedCount++;
      }
    }

    const promotedCount = decisions.filter(d => d.action === 'PROMOTE').length;
    const retainedCount = decisions.filter(d => d.action === 'RETAIN').length;
    const transferredCount = decisions.filter(d => d.action === 'TRANSFER').length;
    const graduatedCount = decisions.filter(d => d.action === 'GRADUATE').length;

    await addAuditLog(
      'BULK_STUDENT_PROMOTION',
      'Student',
      `Class-${metadata.sourceClassNumber}`,
      `Bulk transition executed for Class ${metadata.sourceClassNumber} -> Academic Year ${metadata.targetAcademicYear}. Total: ${decisions.length} (Promoted: ${promotedCount}, Retained: ${retainedCount}, Transferred: ${transferredCount}, Graduated: ${graduatedCount}) by ${metadata.promotedBy}`
    );

    await addVerificationLog({
      entity: 'Academic Session Rollover',
      field: `Class ${metadata.sourceClassNumber} Annual Progression`,
      previousValue: `Class ${metadata.sourceClassNumber} (${metadata.sourceAcademicYear || 'Current'})`,
      newValue: `Processed to Class ${metadata.sourceClassNumber < 8 ? metadata.sourceClassNumber + 1 : '8-Graduated'} (${metadata.targetAcademicYear})`,
      source: 'Principal / Admin Academic Promotion Committee',
      verificationStatus: 'VERIFIED_CURRENT',
      updatedBy: metadata.promotedBy || userProfile?.name || 'Admin',
      notes: `Processed ${decisions.length} student records (Promoted: ${promotedCount}, Retained: ${retainedCount}, Transferred: ${transferredCount}, Graduated: ${graduatedCount})`
    });

    return { successCount: decisions.length - failedCount, failedCount };
  };

  // Teacher Methods
  const addTeacher = async (data: Omit<Teacher, 'id' | 'createdAt'>): Promise<string> => {
    if (userProfile?.role !== 'admin') {
      console.warn("Unauthorized attempt to add teacher.");
      await addAuditLog('UNAUTHORIZED_ACTION', 'Teacher', 'NEW', 'Blocked unauthorized attempt to register faculty');
      return '';
    }
    const id = `tch-${Date.now()}`;
    const newTeacher: Teacher = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    setTeachers(prev => [...prev, newTeacher]);
    await addAuditLog('ADD_TEACHER', 'Teacher', id, `Registered faculty ${newTeacher.name} (${newTeacher.designation})`);
    try {
      await setDoc(doc(db, 'teachers', id), newTeacher);
    } catch (e) {
      console.warn("Firestore sync:", e);
    }
    return id;
  };

  const updateTeacher = async (id: string, data: Partial<Teacher>) => {
    const isSelf = userProfile?.role === 'teacher' && (userProfile.uid === id || userProfile.linkedEntityId === id);
    const isAdmin = userProfile?.role === 'admin';

    if (!isAdmin && !isSelf) {
      console.warn("Unauthorized attempt to update teacher:", id);
      await addAuditLog('UNAUTHORIZED_ACTION', 'Teacher', id, 'Blocked unauthorized attempt to update faculty details');
      return;
    }
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t));
    const target = teachers.find(t => t.id === id);
    await addAuditLog('UPDATE_TEACHER', 'Teacher', id, `Updated faculty details for ${target?.name || id}`);
    try {
      await updateDoc(doc(db, 'teachers', id), { ...data, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.warn("Firestore sync:", e);
    }
  };

  const deactivateTeacher = async (id: string) => {
    if (userProfile?.role !== 'admin') {
      console.warn("Unauthorized attempt to deactivate faculty.");
      return;
    }
    await updateTeacher(id, { status: 'inactive' });
  };

  // Class & Section Methods
  const addClass = async (data: Omit<SchoolClass, 'id' | 'createdAt'>): Promise<string> => {
    const id = `class-${data.classNumber}`;
    const newClass: SchoolClass = { ...data, id, createdAt: new Date().toISOString() };
    setClasses(prev => [...prev, newClass]);
    await addAuditLog('ADD_CLASS', 'Class', id, `Created ${newClass.name}`);
    return id;
  };

  const addSection = async (data: Omit<Section, 'id'>): Promise<string> => {
    const id = `sec-${data.classNumber}-${data.sectionName}-${Date.now().toString().slice(-4)}`;
    const newSec: Section = { ...data, id };
    setSections(prev => [...prev, newSec]);
    await addAuditLog('ADD_SECTION', 'Section', id, `Created Section ${data.sectionName} for Class ${data.classNumber}`);
    try {
      await setDoc(doc(db, 'sections', id), newSec);
    } catch (e) {}
    return id;
  };

  const updateSection = async (id: string, data: Partial<Section>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    try {
      await updateDoc(doc(db, 'sections', id), data);
    } catch (e) {}
  };

  const deleteSection = async (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    try {
      await deleteDoc(doc(db, 'sections', id));
    } catch (e) {}
  };

  // Subject Methods
  const addSubject = async (data: Omit<Subject, 'id'>): Promise<string> => {
    const id = `sub-${data.classNumber}-${Date.now().toString().slice(-4)}`;
    const newSub: Subject = { ...data, id };
    setSubjects(prev => [...prev, newSub]);
    await addAuditLog('ADD_SUBJECT', 'Subject', id, `Added subject ${data.name} to Class ${data.classNumber}`);
    try {
      await setDoc(doc(db, 'subjects', id), newSub);
    } catch (e) {}
    return id;
  };

  const updateSubject = async (id: string, data: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    try {
      await updateDoc(doc(db, 'subjects', id), data);
    } catch (e) {}
  };

  const deleteSubject = async (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    try {
      await deleteDoc(doc(db, 'subjects', id));
    } catch (e) {}
  };

  // Teacher Assignments
  const assignTeacher = async (data: Omit<TeacherAssignment, 'id'>): Promise<string> => {
    const id = `asgn-${Date.now()}`;
    const newAsgn: TeacherAssignment = { ...data, id };
    setTeacherAssignments(prev => [...prev, newAsgn]);
    await addAuditLog('ASSIGN_TEACHER', 'TeacherAssignment', id, `Assigned ${data.teacherName} to Class ${data.classNumber}-${data.sectionName} for ${data.subjectName}`);
    try {
      await setDoc(doc(db, 'teacherAssignments', id), newAsgn);
    } catch (e) {}
    return id;
  };

  const removeAssignment = async (id: string) => {
    setTeacherAssignments(prev => prev.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, 'teacherAssignments', id));
    } catch (e) {}
  };

  // Attendance Methods (Supports duplicate prevention for same date + student + class + subject with strict teacher authorization)
  const saveBulkAttendance = async (
    records: any[],
    classId?: string,
    sectionId?: string,
    date?: string,
    subjectId?: string,
    teacherId?: string
  ): Promise<{ success: boolean; error?: string; count?: number }> => {
    if (!records || records.length === 0) {
      return { success: false, error: 'No attendance records provided to save.' };
    }

    if (userProfile?.role !== 'admin' && userProfile?.role !== 'teacher') {
      console.warn("Unauthorized attempt to record attendance.");
      await addAuditLog('UNAUTHORIZED_ACTION', 'Attendance', `${classId || 'N/A'}-${sectionId || 'N/A'}`, 'Blocked unauthorized attempt to record attendance (User is neither teacher nor admin)');
      return { success: false, error: 'Unauthorized: Only faculty members and administrators are permitted to record attendance.' };
    }

    // Extract contextual metadata from arguments or first record
    const firstRec = records[0] || {};
    const effectiveClassId = classId || firstRec.classId || (firstRec.classNumber ? `class-${firstRec.classNumber}` : 'class-1');
    const effectiveSectionId = sectionId || firstRec.sectionId || (firstRec.sectionName ? `sec-${firstRec.classNumber || 1}-${firstRec.sectionName}` : 'sec-1-A');
    const effectiveDate = date || firstRec.date || new Date().toISOString().split('T')[0];

    const cls = classes.find(c => c.id === effectiveClassId || Number(c.classNumber) === Number(firstRec.classNumber));
    const sec = sections.find(s => s.id === effectiveSectionId || s.sectionName === firstRec.sectionName);
    const subj = subjects.find(s => s.id === subjectId || s.id === firstRec.subjectId);
    
    const targetClassNumber = cls?.classNumber || firstRec.classNumber || 1;
    const targetSectionName = sec?.sectionName || firstRec.sectionName || 'A';

    // Backend-level Authorization for Class Teachers
    if (userProfile?.role === 'teacher') {
      const currentTeacher = teachers.find(t => 
        (userProfile.linkedEntityId && t.id === userProfile.linkedEntityId) ||
        (userProfile.uid && (t.id === userProfile.uid || t.userId === userProfile.uid)) ||
        (userProfile.email && t.email && t.email.toLowerCase() === userProfile.email.toLowerCase()) ||
        (userProfile.name && t.name && t.name.toLowerCase() === userProfile.name.toLowerCase())
      ) || teachers.find(t => t.id === 'tch-kiran-shakya') || teachers[0];

      const teacherAsgns = teacherAssignments.filter(a => a.teacherId === currentTeacher?.id);
      const designationLower = (currentTeacher?.designation || '').toLowerCase();
      const isHeadTeacher = designationLower.includes('head') || 
                            designationLower.includes('principal') ||
                            designationLower.includes('in-charge') ||
                            designationLower.includes('प्रधानाध्यापक') ||
                            designationLower.includes('प्रधानाध्यापिका');
      
      const hasAssignment = teacherAsgns.some(a => 
        a.classId === 'all' || 
        a.classId === effectiveClassId || 
        Number(a.classNumber) === Number(targetClassNumber) ||
        String(a.classNumber).toLowerCase().includes('all') ||
        String(a.classNumber).includes('1–8')
      );

      // If teacher has assigned classes and is not headmaster, enforce class ownership
      if (teacherAsgns.length > 0 && !hasAssignment && !isHeadTeacher) {
        const errorMsg = `Unauthorized Class Access: You are assigned to Class ${teacherAsgns.map(a => a.classNumber).join(', ')}. You are not authorized to mark attendance for Class ${targetClassNumber} Section ${targetSectionName}.`;
        console.warn(errorMsg);
        await addAuditLog(
          'UNAUTHORIZED_ATTENDANCE_ATTEMPT',
          'Attendance',
          `Class-${targetClassNumber}-${targetSectionName}`,
          `Teacher ${currentTeacher?.name || userProfile.name} was blocked from marking attendance for unassigned Class ${targetClassNumber}-${targetSectionName} on ${effectiveDate}.`
        );
        return { success: false, error: errorMsg };
      }
    }

    const currentTeacher = teachers.find(t => 
      (teacherId && t.id === teacherId) ||
      (userProfile?.linkedEntityId && t.id === userProfile.linkedEntityId) ||
      (userProfile?.uid && (t.id === userProfile.uid || t.userId === userProfile.uid))
    ) || teachers[0];

    const updatedRecords: AttendanceRecord[] = [];
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;

    // Filter out existing records matching studentId, date, classId, and subjectId to prevent duplicates
    setAttendance(prev => {
      const filtered = prev.filter(a => {
        const isMatch = (a.classId === effectiveClassId || Number(a.classNumber) === Number(targetClassNumber)) && 
                        (a.sectionId === effectiveSectionId || a.sectionName === targetSectionName) && 
                        a.date === effectiveDate && 
                        (subjectId ? a.subjectId === subjectId : true);
        return !isMatch;
      });

      const newEntries: AttendanceRecord[] = records.map(r => {
        const stu = students.find(s => s.id === r.studentId);
        const normStatus: AttendanceStatus = (r.status === 'half_day' || r.status === 'half-day') 
          ? 'half_day' 
          : r.status === 'absent' 
          ? 'absent' 
          : r.status === 'late' 
          ? 'late' 
          : 'present';

        if (normStatus === 'present') presentCount++;
        else if (normStatus === 'absent') absentCount++;
        else if (normStatus === 'late') lateCount++;
        else if (normStatus === 'half_day') halfDayCount++;

        const entry: AttendanceRecord = {
          id: `att-${r.studentId}-${effectiveDate}-${subjectId || 'day'}-${Date.now().toString().slice(-4)}`,
          studentId: r.studentId,
          studentName: stu?.name || r.studentName || 'Student',
          rollNumber: stu?.rollNumber || r.rollNumber || '',
          teacherId: teacherId || currentTeacher?.id || userProfile?.linkedEntityId || 'tch-001',
          teacherName: currentTeacher?.name || userProfile?.name || 'Class Teacher',
          classId: effectiveClassId,
          classNumber: Number(targetClassNumber),
          sectionId: effectiveSectionId,
          sectionName: targetSectionName,
          subjectId: subjectId || r.subjectId || undefined,
          subjectName: subj?.name || r.subjectName || undefined,
          date: effectiveDate,
          status: normStatus,
          remarks: r.remarks || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updatedRecords.push(entry);
        return entry;
      });

      return [...newEntries, ...filtered];
    });

    // Comprehensive Audit Logging
    await addAuditLog(
      'MARK_ATTENDANCE',
      'Attendance',
      `Class-${targetClassNumber}-${targetSectionName}`,
      `Recorded attendance register for Class ${targetClassNumber} - Section '${targetSectionName}' on ${effectiveDate}. Total: ${records.length} students (Present: ${presentCount}, Absent: ${absentCount}, Late: ${lateCount}, Half-Day: ${halfDayCount}) by ${userProfile?.name || 'Faculty'}`
    );

    // Sync to Firestore
    try {
      if (db) {
        for (const rec of updatedRecords) {
          await setDoc(doc(db, 'attendance', rec.id), rec);
        }
      }
    } catch (e) {
      console.warn("Firestore attendance sync:", e);
    }

    return { success: true, count: updatedRecords.length };
  };

  const getStudentAttendanceStats = (studentId: string) => {
    const stuRecords = attendance.filter(a => a.studentId === studentId);
    const total = stuRecords.length;
    if (total === 0) return { total: 0, present: 0, absent: 0, late: 0, halfDay: 0, percentage: 100 };
    const present = stuRecords.filter(a => a.status === 'present').length;
    const late = stuRecords.filter(a => a.status === 'late').length;
    const halfDay = stuRecords.filter(a => a.status === 'half_day' || a.status === 'half-day').length;
    const absent = stuRecords.filter(a => a.status === 'absent').length;
    // Late counts as 0.8, Half day counts as 0.5 in standard calculation
    const weightedPresent = present + (late * 0.8) + (halfDay * 0.5);
    const percentage = Math.round((weightedPresent / total) * 100);
    return { total, present, absent, late, halfDay, percentage };
  };

  const getClassAttendanceSummary = (classId: string, sectionId: string, date: string) => {
    const dayRecords = attendance.filter(a => 
      (a.classId === classId || String(a.classNumber) === classId.replace('class-', '')) && 
      (a.sectionId === sectionId || a.sectionName === sectionId.replace(/sec-\d+-/, '')) && 
      a.date === date
    );
    const total = dayRecords.length;
    if (total === 0) return { total: 0, present: 0, absent: 0, late: 0, halfDay: 0, percentage: 0 };
    const present = dayRecords.filter(a => a.status === 'present').length;
    const late = dayRecords.filter(a => a.status === 'late').length;
    const halfDay = dayRecords.filter(a => a.status === 'half_day' || a.status === 'half-day').length;
    const absent = dayRecords.filter(a => a.status === 'absent').length;
    const percentage = Math.round(((present + (late * 0.8) + (halfDay * 0.5)) / total) * 100);
    return { total, present, absent, late, halfDay, percentage };
  };

  // Exam & Marks Methods
  const addExam = async (data: Omit<Examination, 'id' | 'createdAt'>): Promise<string> => {
    const id = `exam-${Date.now()}`;
    const newExam: Examination = { ...data, id, createdAt: new Date().toISOString() };
    setExaminations(prev => [newExam, ...prev]);
    await addAuditLog('CREATE_EXAM', 'Examination', id, `Created Examination: ${data.name}`);
    try {
      await setDoc(doc(db, 'examinations', id), newExam);
    } catch (e) {}
    return id;
  };

  const updateExam = async (id: string, data: Partial<Examination>) => {
    setExaminations(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    try {
      await updateDoc(doc(db, 'examinations', id), data);
    } catch (e) {}
  };

  const saveStudentMarks = async (marksData: Omit<Mark, 'id' | 'createdAt' | 'grade' | 'percentage'>[]) => {
    if (userProfile?.role !== 'admin' && userProfile?.role !== 'teacher') {
      console.warn("Unauthorized attempt to record marks.");
      await addAuditLog('UNAUTHORIZED_ACTION', 'Marks', marksData[0]?.examId, 'Blocked unauthorized attempt to enter or modify student marks');
      return;
    }
    const newMarks: Mark[] = marksData.map(m => {
      const percentage = Math.round((m.marksObtained / m.maximumMarks) * 100);
      const gradeInfo = calculateGrade(percentage);
      return {
        ...m,
        id: `mrk-${m.studentId}-${m.examId}-${m.subjectId}`,
        grade: gradeInfo.grade,
        percentage,
        createdAt: new Date().toISOString()
      };
    });

    setMarks(prev => {
      const filtered = prev.filter(p => !newMarks.some(n => n.studentId === p.studentId && n.examId === p.examId && n.subjectId === p.subjectId));
      return [...newMarks, ...filtered];
    });

    await addAuditLog('SAVE_MARKS', 'Marks', marksData[0]?.examId, `Saved marks for ${marksData.length} students in ${marksData[0]?.subjectName}`);

    try {
      for (const m of newMarks) {
        await setDoc(doc(db, 'marks', m.id), m);
      }
    } catch (e) {}
  };

  // Homework Methods
  const addHomework = async (data: Omit<Homework, 'id' | 'createdAt'>): Promise<string> => {
    const id = `hw-${Date.now()}`;
    const newHw: Homework = { ...data, id, createdAt: new Date().toISOString() };
    setHomeworkList(prev => [newHw, ...prev]);
    await addAuditLog('CREATE_HOMEWORK', 'Homework', id, `Assigned homework "${data.title}" to Class ${data.classNumber}-${data.sectionName}`);
    try {
      await setDoc(doc(db, 'homework', id), newHw);
    } catch (e) {}
    return id;
  };

  const submitHomework = async (data: Omit<Submission, 'id' | 'submittedAt'>): Promise<string> => {
    const id = `subm-${data.homeworkId}-${data.studentId}`;
    const newSubm: Submission = {
      ...data,
      id,
      submittedAt: new Date().toISOString()
    };
    setSubmissions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      return [newSubm, ...filtered];
    });
    await addAuditLog('SUBMIT_HOMEWORK', 'Submission', id, `Student ${data.studentName} submitted assignment`);
    try {
      await setDoc(doc(db, 'submissions', id), newSubm);
    } catch (e) {}
    return id;
  };

  const gradeSubmission = async (submissionId: string, marksEarned: number, feedback: string) => {
    setSubmissions(prev => prev.map(s => s.id === submissionId ? {
      ...s,
      status: 'graded',
      marks: marksEarned,
      feedback
    } : s));
    await addAuditLog('GRADE_HOMEWORK', 'Submission', submissionId, `Graded submission: ${marksEarned} marks`);
    try {
      await updateDoc(doc(db, 'submissions', submissionId), {
        status: 'graded',
        marks: marksEarned,
        feedback
      });
    } catch (e) {}
  };

  // Timetable Methods
  const addTimetableItem = async (data: Omit<TimetableItem, 'id'>): Promise<string> => {
    const id = `tt-${data.classNumber}${data.sectionName}-${data.day}-${data.periodNumber}-${Date.now().toString().slice(-4)}`;
    const newItem: TimetableItem = { ...data, id };
    setTimetable(prev => {
      // Remove overlapping slot for same class, section, day and period
      const filtered = prev.filter(t => !(t.classId === data.classId && t.sectionId === data.sectionId && t.day === data.day && t.periodNumber === data.periodNumber));
      return [...filtered, newItem];
    });
    try {
      await setDoc(doc(db, 'timetable', id), newItem);
    } catch (e) {}
    return id;
  };

  const deleteTimetableItem = async (id: string) => {
    setTimetable(prev => prev.filter(t => t.id !== id));
    try {
      await deleteDoc(doc(db, 'timetable', id));
    } catch (e) {}
  };

  // Notice Methods
  const addNotice = async (data: Omit<Notice, 'id' | 'createdAt'>): Promise<string> => {
    const id = `not-${Date.now()}`;
    const newNotice: Notice = { ...data, id, createdAt: new Date().toISOString() };
    setNotices(prev => [newNotice, ...prev]);
    await addAuditLog('CREATE_NOTICE', 'Notice', id, `Published notice: "${data.title}"`);
    try {
      await setDoc(doc(db, 'notices', id), newNotice);
    } catch (e) {}
    return id;
  };

  const updateNotice = async (id: string, data: Partial<Notice>) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
    try {
      await updateDoc(doc(db, 'notices', id), data);
    } catch (e) {}
  };

  const deleteNotice = async (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    try {
      await deleteDoc(doc(db, 'notices', id));
    } catch (e) {}
  };

  // Document Methods
  const addDocument = async (data: Omit<StudentDocument, 'id' | 'createdAt'>): Promise<string> => {
    const id = `doc-${Date.now()}`;
    const newDoc: StudentDocument = { 
      ...data, 
      id, 
      verificationStatus: data.verificationStatus || 'PENDING',
      createdAt: new Date().toISOString() 
    };
    setDocuments(prev => [newDoc, ...prev]);
    await addAuditLog('UPLOAD_DOCUMENT', 'Document', id, `Uploaded ${data.documentType || (data as any).type} for student ${data.studentName}`);
    try {
      await setDoc(doc(db, 'documents', id), newDoc);
    } catch (e) {}
    return id;
  };

  const updateDocument = async (id: string, data: Partial<StudentDocument>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    try {
      await updateDoc(doc(db, 'documents', id), data);
    } catch (e) {}
  };

  const verifyDocument = async (id: string, verifiedStatus: 'VERIFIED' | 'REJECTED', notes?: string, verifiedByName?: string) => {
    const verifiedBy = verifiedByName || 'Smt. Kiran Shakya (Headmaster)';
    const verifiedAt = new Date().toISOString();
    const updateData: Partial<StudentDocument> = {
      verificationStatus: verifiedStatus,
      verified: verifiedStatus === 'VERIFIED',
      verifiedBy,
      verifiedAt,
      verificationNotes: notes || (verifiedStatus === 'VERIFIED' ? 'Officially verified and approved by Headmaster' : 'Requires re-upload / correction')
    };
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updateData } : d));
    await addAuditLog(
      verifiedStatus === 'VERIFIED' ? 'VERIFY_DOCUMENT' : 'REJECT_DOCUMENT',
      'Document',
      id,
      `${verifiedStatus === 'VERIFIED' ? 'Verified' : 'Rejected'} document ID ${id}. Notes: ${notes || 'Standard verification'}`
    );
    try {
      await updateDoc(doc(db, 'documents', id), updateData);
    } catch (e) {}
  };

  const requestDocumentUpdate = async (
    id: string, 
    updateData: { fileURL: string; fileName?: string; fileSize?: string; fileType?: string; notes?: string; requestedBy?: string }
  ) => {
    const now = new Date().toISOString().split('T')[0];
    const dataToApply: Partial<StudentDocument> = {
      hasPendingUpdate: true,
      pendingUpdateUrl: updateData.fileURL,
      pendingUpdateFileName: updateData.fileName || 'updated_document.pdf',
      pendingUpdateFileSize: updateData.fileSize || '1.2 MB',
      pendingUpdateFileType: updateData.fileType || 'application/pdf',
      pendingUpdateDate: now,
      pendingUpdateNotes: updateData.notes || 'Student requested document replacement. Awaiting Admin final approval.',
      pendingUpdateRequestedBy: updateData.requestedBy || 'Student',
      updateRejectionReason: undefined
    };

    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...dataToApply } : d));
    const targetDoc = documents.find(d => d.id === id);
    await addAuditLog(
      'REQUEST_DOCUMENT_UPDATE',
      'Document',
      id,
      `Student submitted document update for "${targetDoc?.title || id}". Staged pending Admin final approval.`
    );
    try {
      await updateDoc(doc(db, 'documents', id), dataToApply);
    } catch (e) {}
  };

  const approveDocumentUpdate = async (id: string, notes?: string, approvedByName?: string) => {
    const targetDoc = documents.find(d => d.id === id);
    if (!targetDoc || !targetDoc.pendingUpdateUrl) return;

    const verifiedBy = approvedByName || 'Smt. Kiran Shakya (Headmaster)';
    const verifiedAt = new Date().toISOString();
    const now = new Date().toISOString().split('T')[0];

    const updatedDocData: Partial<StudentDocument> = {
      fileURL: targetDoc.pendingUpdateUrl,
      fileName: targetDoc.pendingUpdateFileName || targetDoc.fileName,
      fileSize: targetDoc.pendingUpdateFileSize || targetDoc.fileSize,
      fileType: targetDoc.pendingUpdateFileType || targetDoc.fileType,
      uploadDate: now,
      verificationStatus: 'VERIFIED',
      verified: true,
      verifiedBy,
      verifiedAt,
      verificationNotes: notes || targetDoc.pendingUpdateNotes || 'Updated document approved and verified by Headmaster',
      hasPendingUpdate: false,
      pendingUpdateUrl: undefined,
      pendingUpdateFileName: undefined,
      pendingUpdateFileSize: undefined,
      pendingUpdateFileType: undefined,
      pendingUpdateDate: undefined,
      pendingUpdateNotes: undefined,
      pendingUpdateRequestedBy: undefined,
      updateRejectionReason: undefined
    };

    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updatedDocData } : d));
    await addAuditLog(
      'APPROVE_DOCUMENT_UPDATE',
      'Document',
      id,
      `Admin approved updated document for "${targetDoc.title}". New version is now officially active.`
    );
    try {
      await updateDoc(doc(db, 'documents', id), updatedDocData);
    } catch (e) {}
  };

  const rejectDocumentUpdate = async (id: string, rejectionReason: string, rejectedByName?: string) => {
    const targetDoc = documents.find(d => d.id === id);
    if (!targetDoc) return;

    // Discard the staged pending update while keeping the original fileURL and previous verification intact
    const rejectedData: Partial<StudentDocument> = {
      hasPendingUpdate: false,
      pendingUpdateUrl: undefined,
      pendingUpdateFileName: undefined,
      pendingUpdateFileSize: undefined,
      pendingUpdateFileType: undefined,
      pendingUpdateDate: undefined,
      pendingUpdateNotes: undefined,
      pendingUpdateRequestedBy: undefined,
      updateRejectionReason: rejectionReason || 'Updated document was rejected by Admin. Previous approved document remains intact.'
    };

    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...rejectedData } : d));
    await addAuditLog(
      'REJECT_DOCUMENT_UPDATE',
      'Document',
      id,
      `Admin rejected document update request for "${targetDoc.title}". Previous document retained. Reason: ${rejectionReason}`
    );
    try {
      await updateDoc(doc(db, 'documents', id), rejectedData);
    } catch (e) {}
  };

  const deleteDocument = async (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (e) {}
  };

  // Settings & Reset
  const updateSettings = async (newSettings: Partial<SchoolSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await addAuditLog('UPDATE_SETTINGS', 'Settings', 'school_config', 'Updated institutional metadata or grading scales');
    try {
      await setDoc(doc(db, 'settings', 'config'), updated);
    } catch (e) {}
  };

  // Facility Methods
  const updateFacility = async (id: string, data: Partial<FacilityItem>) => {
    setFacilities(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
    await addAuditLog('UPDATE_FACILITY', 'Facilities', id, `Updated facility ${id}`);
    try {
      await updateDoc(doc(db, 'facilities', id), data);
    } catch (e) {}
  };

  const addFacility = async (data: Omit<FacilityItem, 'id'>): Promise<string> => {
    const id = `fac-${Date.now()}`;
    const newFacility: FacilityItem = { ...data, id };
    setFacilities(prev => [...prev, newFacility]);
    await addAuditLog('ADD_FACILITY', 'Facilities', id, `Added facility ${newFacility.nameEn}`);
    try {
      await setDoc(doc(db, 'facilities', id), newFacility);
    } catch (e) {}
    return id;
  };

  // Government Scheme Methods
  const updateGovernmentScheme = async (id: string, data: Partial<GovernmentScheme>) => {
    setGovernmentSchemes(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    await addAuditLog('UPDATE_SCHEME', 'GovernmentSchemes', id, `Updated government scheme ${id}`);
    try {
      await updateDoc(doc(db, 'governmentSchemes', id), data);
    } catch (e) {}
  };

  const addGovernmentScheme = async (data: Omit<GovernmentScheme, 'id'>): Promise<string> => {
    const id = `sch-${Date.now()}`;
    const newScheme: GovernmentScheme = { ...data, id };
    setGovernmentSchemes(prev => [...prev, newScheme]);
    await addAuditLog('ADD_SCHEME', 'GovernmentSchemes', id, `Added government scheme ${newScheme.nameEn}`);
    try {
      await setDoc(doc(db, 'governmentSchemes', id), newScheme);
    } catch (e) {}
    return id;
  };

  // Gallery Methods
  const addGalleryItem = async (data: Omit<GalleryItem, 'id'>): Promise<string> => {
    const id = `gal-${Date.now()}`;
    const newItem: GalleryItem = { ...data, id };
    setGallery(prev => [newItem, ...prev]);
    await addAuditLog('ADD_GALLERY_ITEM', 'Gallery', id, `Added gallery photo ${newItem.titleEn}`);
    try {
      await setDoc(doc(db, 'gallery', id), newItem);
    } catch (e) {}
    return id;
  };

  const updateGalleryItem = async (id: string, data: Partial<GalleryItem>) => {
    setGallery(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    await addAuditLog('UPDATE_GALLERY_ITEM', 'Gallery', id, `Updated gallery photo details ${id}`);
    try {
      await updateDoc(doc(db, 'gallery', id), data);
    } catch (e) {}
  };

  const reorderGalleryItems = async (items: GalleryItem[]) => {
    const normalized = items.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1
    }));
    setGallery(normalized);
    saveLocal('gallery', normalized);
    await addAuditLog('REORDER_GALLERY', 'Gallery', 'all', `Reordered ${items.length} gallery photos to standard sequence`);
    try {
      // update in batches / promises
      for (const item of normalized) {
        await updateDoc(doc(db, 'gallery', item.id), { sortOrder: item.sortOrder });
      }
    } catch (e) {}
  };

  const deleteGalleryItem = async (id: string) => {
    setGallery(prev => prev.filter(g => g.id !== id));
    await addAuditLog('DELETE_GALLERY_ITEM', 'Gallery', id, `Deleted gallery item ${id}`);
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (e) {}
  };

  // Public Document Methods
  const addPublicDocument = async (data: Omit<PublicDocument, 'id'>): Promise<string> => {
    const id = `pdoc-${Date.now()}`;
    const newDoc: PublicDocument = { ...data, id };
    setPublicDocuments(prev => [newDoc, ...prev]);
    await addAuditLog('ADD_PUBLIC_DOCUMENT', 'PublicDocuments', id, `Added circular ${newDoc.titleEn}`);
    try {
      await setDoc(doc(db, 'publicDocuments', id), newDoc);
    } catch (e) {}
    return id;
  };

  const deletePublicDocument = async (id: string) => {
    setPublicDocuments(prev => prev.filter(d => d.id !== id));
    await addAuditLog('DELETE_PUBLIC_DOCUMENT', 'PublicDocuments', id, `Deleted document ${id}`);
    try {
      await deleteDoc(doc(db, 'publicDocuments', id));
    } catch (e) {}
  };

  const resetToDefaultSeedData = async () => {
    setStudents(initialStudents);
    setTeachers(initialTeachers);
    setClasses(initialClasses);
    setSections(initialSections);
    setSubjects(initialSubjects);
    setTeacherAssignments(initialTeacherAssignments);
    setAttendance(initialAttendance);
    setExaminations(initialExaminations);
    setMarks(initialMarks);
    setHomeworkList(initialHomework);
    setSubmissions(initialSubmissions);
    setTimetable(initialTimetable);
    setNotices(initialNotices);
    setDocuments(initialDocuments);
    setAuditLogs(initialAuditLogs);
    setSettings(initialSettings);
    setFacilities(initialFacilities);
    setGovernmentSchemes(initialGovernmentSchemes);
    setGallery(initialGallery);
    setPublicDocuments(initialPublicDocuments);

    localStorage.clear();
    saveLocal('students', initialStudents);
    saveLocal('teachers', initialTeachers);
    saveLocal('classes', initialClasses);
    saveLocal('sections', initialSections);
    saveLocal('subjects', initialSubjects);
    saveLocal('teacherAssignments', initialTeacherAssignments);
    saveLocal('attendance', initialAttendance);
    saveLocal('examinations', initialExaminations);
    saveLocal('marks', initialMarks);
    saveLocal('homework', initialHomework);
    saveLocal('submissions', initialSubmissions);
    saveLocal('timetable', initialTimetable);
    saveLocal('notices', initialNotices);
    saveLocal('documents', initialDocuments);
    saveLocal('auditLogs', initialAuditLogs);
    saveLocal('settings', initialSettings);
    saveLocal('facilities', initialFacilities);
    saveLocal('governmentSchemes', initialGovernmentSchemes);
    saveLocal('gallery', initialGallery);
    saveLocal('publicDocuments', initialPublicDocuments);

    await addAuditLog('SYSTEM_RESET', 'System', 'all', 'Restored verified Composite JHS Harsinghpur Gova dataset');
  };

  return (
    <SchoolContext.Provider
      value={{
        language,
        setLanguage,
        students,
        teachers,
        classes,
        sections,
        subjects,
        teacherAssignments,
        attendance,
        examinations,
        marks,
        homeworkList,
        submissions,
        timetable,
        notices,
        documents,
        auditLogs,
        settings,
        facilities,
        governmentSchemes,
        gallery,
        publicDocuments,
        historicalRecords,
        aggregateOverview,
        officialSources,
        faqList,
        verificationLogs,
        loading,

        addVerificationLog,
        updateSchoolSettingsWithAudit,
        updateAggregateOverview,

        updateFacility,
        addFacility,
        updateGovernmentScheme,
        addGovernmentScheme,
        addGalleryItem,
        updateGalleryItem,
        reorderGalleryItems,
        deleteGalleryItem,
        addPublicDocument,
        deletePublicDocument,

        addStudent,
        updateStudent,
        deactivateStudent,
        activateStudent,
        bulkPromoteStudents,

        addTeacher,
        updateTeacher,
        deactivateTeacher,

        addClass,
        addSection,
        updateSection,
        deleteSection,

        addSubject,
        updateSubject,
        deleteSubject,

        assignTeacher,
        removeAssignment,

        saveBulkAttendance,
        getStudentAttendanceStats,
        getClassAttendanceSummary,

        addExam,
        updateExam,
        saveStudentMarks,
        calculateGrade,

        addHomework,
        submitHomework,
        gradeSubmission,

        addTimetableItem,
        deleteTimetableItem,

        addNotice,
        updateNotice,
        deleteNotice,

        addDocument,
        updateDocument,
        verifyDocument,
        requestDocumentUpdate,
        approveDocumentUpdate,
        rejectDocumentUpdate,
        deleteDocument,

        addAuditLog,
        updateSettings,
        resetToDefaultSeedData
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
