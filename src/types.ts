export type UserRole = 'admin' | 'teacher' | 'student';

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type AccountStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'disabled';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type StudentStatus = 'active' | 'inactive' | 'transferred';
export type TeacherStatus = 'active' | 'on_leave' | 'inactive';
export type ExamStatus = 'upcoming' | 'ongoing' | 'completed' | 'published';
export type HomeworkStatus = 'assigned' | 'submitted' | 'graded';

// Standard 4-Tier Verification Statuses required by Master Portal Specification
export type DataVerificationStatus = 
  | 'VERIFIED_CURRENT'                 // 🟢 Verified Current (सत्यापित वर्तमान)
  | 'SCHOOL_PROVIDED'                  // 🔵 School-Provided (विद्यालय प्रदत्त)
  | 'HISTORICAL_VERIFICATION_REQUIRED' // 🟡 Historical / Needs Verification (ऐतिहासिक / सत्यापन अपेक्षित)
  | 'NOT_AVAILABLE';                   // ⚪ Not Available (अनुपलब्ध)

export interface VerificationMeta {
  isVerified: boolean;
  status: DataVerificationStatus | 'verified' | 'verification_required' | 'needs_update' | 'archived';
  statusType?: DataVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  source?: string;
  sourceType?: 'GOVERNMENT' | 'SCHOOL_ADMIN' | 'POSTAL' | 'HISTORICAL' | 'PUBLIC_REGISTRY';
  sourceUrl?: string;
  lastUpdated?: string;
  lastVerified?: string;
  dataVersion?: string;
  note?: string;
}

export interface HistoricalRecordItem {
  id: string;
  category: string;
  titleEn: string;
  titleHi: string;
  detailsEn: string;
  detailsHi: string;
  source: string;
  statusLabel: string;
  isCurrent: false;
  recordedPeriod?: string;
}

export interface StudentAggregateStats {
  classNumber: number;
  classNameEn: string;
  classNameHi: string;
  boysCount: number | null;
  girlsCount: number | null;
  totalStudents: number | null;
  verificationStatus: DataVerificationStatus;
  lastUpdated: string;
  source: string;
}

export interface SchoolAggregateOverview {
  totalEnrolment: number | null;
  totalBoys: number | null;
  totalGirls: number | null;
  studentTeacherRatio: string;
  averageAttendanceRate: string;
  status: DataVerificationStatus;
  source: string;
  lastUpdated: string;
  classBreakdown: StudentAggregateStats[];
}

export interface VerificationLog {
  id: string;
  entity: string;
  field: string;
  previousValue: string;
  newValue: string;
  source: string;
  verificationStatus: DataVerificationStatus;
  updatedBy: string;
  updatedAt: string;
  notes?: string;
}

export interface FAQItem {
  id: string;
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
  category: 'Identity & Location' | 'Academics & Admission' | 'Facilities & Schemes' | 'Staff & Contact' | 'Documents';
  verificationStatus: DataVerificationStatus;
  source: string;
}

export interface OfficialSource {
  id: string;
  nameEn: string;
  nameHi: string;
  department: string;
  purposeEn: string;
  purposeHi: string;
  officialUrl: string;
  contactNumber?: string;
  email?: string;
  officeAddress?: string;
  informationProvidedEn: string;
  informationProvidedHi: string;
  lastChecked: string;
}

export interface UserProfile {
  uid: string;
  username: string; // e.g. 'HEAD-KIRAN', 'TCH-2026-001', 'STU-2026-0001'
  name: string;
  fullName?: string;
  email: string;
  emailVerified?: boolean;
  phone?: string;
  mobile?: string;
  showPhonePublicly?: boolean;
  showOnWebsite?: boolean;
  role: UserRole;
  schoolId: string; // e.g. '09290205902'
  status: AccountStatus;
  mustChangePassword?: boolean;
  photoURL?: string;
  profilePhoto?: string;
  linkedEntityId?: string; // studentId or teacherId
  studentId?: string;
  admissionNumber?: string;
  employeeId?: string;
  classNumber?: number;
  sectionName?: string;
  rollNumber?: string;
  course?: string;
  admissionYear?: number;
  dateOfBirth?: string;
  dob?: string;
  fatherName?: string;
  guardianName?: string;
  motherName?: string;
  category?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  bloodGroup?: string;
  aadhaarNumber?: string;
  registrationNumber?: string;
  designation?: string;
  subject?: string;
  qualification?: string;
  specialization?: string;
  isApproved?: boolean;
  password?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegistrationRequest {
  id: string;
  schoolId: string; // '09290205902'
  requestedRole: 'teacher' | 'student';
  fullName: string;
  email: string;
  phone?: string;
  preferredUsername: string; // e.g. 'TCH-2026-004' or 'STU-2026-0005'
  password?: string;
  
  // Student Specific
  admissionNumber?: string;
  classNumber?: number;
  sectionName?: string;
  dateOfBirth?: string;
  fatherName?: string;
  guardianName?: string;
  category?: string;

  // Teacher Specific
  employeeId?: string;
  designation?: string;
  subject?: string;
  qualification?: string;
  specialization?: string;

  status: RegistrationStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface SecurityLog {
  id: string;
  schoolId: string;
  username: string;
  role: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'FORCE_PASSWORD_CHANGE' | 'ACCOUNT_LOCKED' | 'REGISTRATION_SUBMITTED';
  details: string;
  timestamp: string;
}

export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  username?: string;
  phone?: string;
  admissionNumber?: string;
  employeeId?: string;
  classNumber?: number;
  sectionName?: string;
  fatherName?: string;
  guardianName?: string;
  dateOfBirth?: string;
  category?: string;
  designation?: string;
  qualification?: string;
  specialization?: string;
  adminPasscode?: string;
}

export interface Student {
  id: string; // Firestore doc ID
  uid?: string;
  studentId: string; // e.g., 'STU-2025-0101'
  userId?: string;
  admissionNumber: string;
  registrationNumber?: string;
  name: string;
  fullName?: string;
  dateOfBirth: string;
  dob?: string;
  gender: 'Male' | 'Female' | 'Other';
  classId: string; // e.g. 'class-1', 'class-5'
  classNumber: number; // 1 to 8
  class?: number;
  sectionId: string; // e.g. 'sec-1-A'
  sectionName: string; // 'A', 'B', 'C'
  section?: string;
  rollNumber: string;
  course?: string;
  admissionYear?: number;
  fatherName: string;
  fatherOccupation?: string;
  motherName: string;
  motherOccupation?: string;
  guardianName?: string;
  mobile: string;
  phone?: string;
  alternateMobile?: string;
  email?: string;
  emailVerified?: boolean;
  address: string;
  village?: string;
  postOffice?: string;
  block?: string;
  district?: string;
  pincode?: string;
  photoURL?: string;
  profilePhoto?: string;
  admissionDate: string;
  bloodGroup?: string;
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  religion?: string;
  motherTongue?: string;
  aadhaarNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  dbtStatus?: 'Linked' | 'Pending' | 'Rejected' | string;
  rationCardNo?: string;
  rationCardType?: 'BPL' | 'APL' | 'Antyodaya' | 'None';
  cwsnStatus?: 'Yes' | 'No' | string;
  cwsnDetails?: string;
  previousSchool?: string;
  mediumOfInstruction?: 'Hindi' | 'English';
  distanceFromSchoolKm?: number | string;
  annualFamilyIncome?: string;
  heightCm?: number | string;
  weightKg?: number | string;
  status: StudentStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Teacher {
  id: string;
  userId?: string;
  username?: string;
  employeeId: string; // e.g., 'TCH-001', 'EHMS-104928'
  name: string;
  email: string;
  phone: string;
  showPhonePublicly?: boolean; // If true, mobile number is shown on website teacher directory
  showOnWebsite?: boolean;     // If true, teacher is listed in public website
  address?: string;
  designation: string; // 'Head Teacher / Headmaster', 'Assistant Teacher (Primary)', 'Assistant Teacher (Upper Primary)', 'Shiksha Mitra'
  qualification: string;
  specialization?: string;
  assignedClasses?: string;
  assignedSubjects?: string;
  joiningDate: string;
  experience?: string;
  gender?: 'Male' | 'Female' | 'Other';
  status: TeacherStatus;
  verificationStatus?: DataVerificationStatus;
  source?: string;
  isHistorical?: boolean;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolClass {
  id: string;
  classNumber: number; // 1 to 8
  name: string; // 'Class 1', 'Class 8'
  stage: 'Primary (1-5)' | 'Upper Primary (6-8)';
  academicYear: string; // '2025-2026'
  status: 'active' | 'inactive';
  syllabusOverviewEn?: string;
  syllabusOverviewHi?: string;
  textbooksList?: string[];
  createdAt: string;
}

export type PromotionAction = 'PROMOTE' | 'RETAIN' | 'TRANSFER' | 'GRADUATE';

export interface PromotionDecision {
  studentId: string;
  action: PromotionAction;
  targetClassNumber: number;
  targetClassId: string;
  targetSectionName: string;
  targetSectionId: string;
  newRollNumber: string;
  academicYear: string;
  remarks?: string;
  percentage?: number;
  isPassed?: boolean;
}

export interface PromotionBatchSummary {
  id: string;
  sourceClassNumber: number;
  sourceAcademicYear?: string;
  targetAcademicYear: string;
  promotedCount: number;
  retainedCount: number;
  transferredCount: number;
  graduatedCount: number;
  totalProcessed: number;
  promotedBy: string;
  timestamp: string;
}

export interface Section {
  id: string;
  classId: string;
  classNumber: number;
  sectionName: string; // 'A', 'B', 'C'
  classTeacherId?: string;
  classTeacherName?: string;
  roomNumber?: string;
  capacity?: number;
  maxCapacity?: number;
  academicYear: string;
  status: 'active' | 'inactive';
}

export interface Subject {
  id: string;
  name: string; // 'Mathematics', 'Hindi', 'English', 'Science', 'Social Studies', 'EVS', 'Sanskrit'
  nameHi?: string;
  classId: string;
  classNumber: number;
  subjectCode: string;
  totalMarks: number;
  passingMarks: number;
  curriculumEn?: string;
  curriculumHi?: string;
  textbookName?: string;
  verificationStatus?: DataVerificationStatus;
  status: 'active' | 'inactive';
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  designation?: string;
  classId: string;
  classNumber: number | string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  academicYear: string;
  verificationStatus: DataVerificationStatus;
  status: 'active' | 'inactive';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  teacherId: string;
  teacherName?: string;
  classId: string;
  classNumber: number;
  sectionId: string;
  sectionName: string;
  subjectId?: string;
  subjectName?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Examination {
  id: string;
  name: string;
  nameHi?: string;
  classId: string;
  classNumber?: number;
  academicYear: string;
  startDate: string;
  endDate: string;
  maxMarks: number;
  status: ExamStatus;
  isPublished: boolean;
  instructionsEn?: string;
  instructionsHi?: string;
  description?: string;
  createdAt: string;
}

export interface Mark {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  examId: string;
  examName: string;
  classId: string;
  classNumber: number;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  marksObtained: number;
  maximumMarks: number;
  grade: string;
  percentage: number;
  remarks?: string;
  enteredByTeacherId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Homework {
  id: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  classNumber: number;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  dueDate: string;
  attachmentURL?: string;
  createdAt: string;
  status: 'active' | 'archived';
}

export interface Submission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  fileURL?: string;
  content?: string;
  submittedAt: string;
  status: 'submitted' | 'graded';
  marks?: number;
  maxMarks?: number;
  feedback?: string;
}

export type MarkRecord = Mark;
export type TimetableSlot = TimetableItem;

export interface TimetableItem {
  id: string;
  classId: string;
  classNumber: number;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNumber: number;
  startTime: string;
  endTime: string;
  room: string;
}

export interface Notice {
  id: string;
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  createdBy: string;
  authorName: string;
  authorRole: string;
  targetRole: 'all' | 'admin' | 'teacher' | 'student';
  targetClassId?: string;
  targetSectionId?: string;
  category: 'Admission' | 'Examination' | 'Holiday' | 'Government' | 'Academic' | 'Event' | 'Emergency' | 'General';
  publishDate: string;
  expiryDate?: string;
  attachmentURL?: string;
  attachmentName?: string;
  priority: 'normal' | 'important' | 'urgent';
  isPublic: boolean;
  status: 'active' | 'expired';
  verificationStatus?: DataVerificationStatus;
  source?: string;
  createdAt: string;
}

export interface StudentDocument {
  id: string;
  studentId: string;
  studentName: string;
  documentType: 'Birth Certificate' | 'Aadhaar Card' | 'Transfer Certificate' | 'Previous Marksheet' | 'Caste/Income Certificate' | 'Medical Record' | 'Photo ID' | 'Bank Passbook Copy' | 'Ration Card' | 'Other' | string;
  title: string;
  fileURL: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string; // 'image/jpeg', 'image/png', 'application/pdf'
  documentNumber?: string; // e.g. UID / Certificate ID
  uploadedBy: string;
  uploadedByName: string;
  uploaderRole?: 'admin' | 'teacher' | 'student';
  verificationStatus?: 'VERIFIED' | 'PENDING' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  uploadDate?: string;
  type?: string; // backwards compatibility
  verified?: boolean; // backwards compatibility
  createdAt: string;

  // Staged / Pending Update workflow:
  // When a student requests to update/replace their document, the new file is staged here until final approval by Admin:
  hasPendingUpdate?: boolean;
  pendingUpdateUrl?: string;
  pendingUpdateFileName?: string;
  pendingUpdateFileSize?: string;
  pendingUpdateFileType?: string;
  pendingUpdateDate?: string;
  pendingUpdateNotes?: string;
  pendingUpdateRequestedBy?: string;
  updateRejectionReason?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  timestamp: string;
}

export interface FacilityItem {
  id: string;
  nameEn: string;
  nameHi: string;
  category: 'Infrastructure' | 'Water & Sanitation' | 'Digital & ICT' | 'Nutrition & Health' | 'Accessibility & Sports' | 'Safety & Hygiene';
  status: 'Available' | 'Not Available' | 'Under Maintenance' | 'Verification Required';
  verificationStatus: DataVerificationStatus;
  source: string;
  sourceUrl?: string;
  lastUpdated: string;
  verification: VerificationMeta;
  descriptionEn: string;
  descriptionHi: string;
  iconName: string;
  isHistorical?: boolean;
}

export interface GovernmentScheme {
  id: string;
  nameEn: string;
  nameHi: string;
  department: string;
  descriptionEn: string;
  descriptionHi: string;
  eligibilityEn: string;
  eligibilityHi: string;
  mealInfoEn?: string;
  mealInfoHi?: string;
  officialGuidelinesEn?: string;
  officialGuidelinesHi?: string;
  applicationInfoEn?: string;
  applicationInfoHi?: string;
  beneficiariesCount?: string;
  distributionStatus: 'Active & Ongoing' | 'Scheduled Distribution' | 'Completed for Session' | 'Verification Required';
  academicYear: string;
  documentsRequired: string[];
  officialLinks?: { title: string; url: string }[];
  verificationStatus: DataVerificationStatus;
  source: string;
  lastUpdated: string;
  verification: VerificationMeta;
}

export interface GalleryItem {
  id: string;
  titleEn: string;
  titleHi: string;
  captionEn?: string;
  captionHi?: string;
  category: 'School Building' | 'Classroom & Learning' | 'Sports & Playground' | 'Cultural Activities' | 'Independence & Republic Day' | 'Mid-Day Meal' | 'Teachers' | 'National Celebrations' | 'Facilities' | string;
  mediaType?: 'photo' | 'video';
  imageURL: string;
  imageUrl?: string;
  videoURL?: string;
  videoSource?: 'upload' | 'youtube' | 'drive' | 'link';
  youtubeId?: string;
  duration?: string;
  thumbnailURL?: string;
  date: string;
  isPublic: boolean;
  uploadedBy?: string;
  uploaderRole?: 'Admin' | 'Teacher' | 'Headmaster';
  uploaderName?: string;
  privacyApproved: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  tags?: string[];
  albumName?: string;
  targetClass?: 'Class 1-3' | 'Class 4-5' | 'Class 6-8' | 'Class 1-8' | string;
  ageGroup?: string;
}

export interface PublicDocument {
  id: string;
  titleEn: string;
  titleHi: string;
  category: 'School Documents' | 'Government Orders' | 'Circulars' | 'Academic Calendar' | 'Holiday List' | 'Exam Documents' | 'Admission Forms' | 'Government Scheme Documents' | 'Official Forms' | 'Other Documents';
  documentNumber?: string;
  publishDate: string;
  fileURL: string;
  fileSize?: string;
  fileType: 'PDF' | 'DOC' | 'XLS' | 'IMG';
  source: string;
  isPublic: boolean;
  verificationStatus: DataVerificationStatus;
  verification: VerificationMeta;
}

export interface SchoolSettings {
  schoolName: string;
  schoolNameHi: string;
  schoolCode: string; // UDISE Code: 09290205902
  village: string;
  villageHi: string;
  post: string;
  postHi: string;
  postOffice?: string;
  postOfficeHi?: string;
  block: string;
  blockHi: string;
  district: string;
  districtHi: string;
  state: string;
  stateHi: string;
  address?: string;
  addressHi?: string;
  country: string;
  schoolType: string;
  schoolLevel: string;
  management: string;
  classesOffered: string;
  areaType: 'Rural' | 'Urban';
  medium: string;
  mediumVerification: VerificationMeta;
  pincode: string;
  pinCode?: string;
  pincodeVerification: VerificationMeta;
  phone: string;
  phoneVerification: VerificationMeta;
  email: string;
  emailVerification: VerificationMeta;
  headTeacherName: string;
  headTeacherDesignation: string;
  headTeacherVerification: VerificationMeta;
  runningWaterSource: string;
  runningWaterVerification: VerificationMeta;
  academicYear: string;
  gradingScale: {
    grade: string;
    minPercentage: number;
    maxPercentage: number;
    gradePoint: number;
    remarks: string;
  }[];
  workingDays: string[];
  periodsPerDay: number;
  // Hero Banner Settings
  heroBannerImage?: string;
  heroBannerAspectRatio?: '21:9' | '16:9' | '3:1' | '4:3' | '1:1' | 'free';
  heroBannerLayout?: 'panoramic_header' | 'dual_column' | 'ambient_background';
  heroBannerTextColor?: 'light' | 'dark'; // 'light' for white text with dark overlay, 'dark' for dark text with light overlay
  heroBannerOverlayOpacity?: number; // 0 to 100
  heroBannerHeadlineHi?: string;
  heroBannerHeadlineEn?: string;
  heroBannerSubtitleHi?: string;
  heroBannerSubtitleEn?: string;
  heroBannerCarouselEnabled?: boolean;
  heroBannerCarouselImages?: string[];
  heroBannerCarouselInterval?: number; // rotation interval in seconds (e.g., 3, 5, 8, 10)
  // Hero Banner CTA (Call-to-Action) Action Buttons
  heroBannerCtaEnabled?: boolean;
  heroBannerCtaTextHi?: string;
  heroBannerCtaTextEn?: string;
  heroBannerCtaLink?: string; // target page id (e.g. 'admission', 'gallery', 'facilities', 'schemes') or URL
  heroBannerCtaIcon?: string; // 'GraduationCap' | 'Images' | 'Building2' | 'Gift' | 'FileText' | 'Phone' | 'ArrowRight' | 'Sparkles'
  heroBannerSecondaryCtaEnabled?: boolean;
  heroBannerSecondaryCtaTextHi?: string;
  heroBannerSecondaryCtaTextEn?: string;
  heroBannerSecondaryCtaLink?: string;
  heroBannerSecondaryCtaIcon?: string;
  // Teacher Video & Media Upload Permissions
  allowTeacherVideoUpload?: boolean;
  teacherVideoApprovalRequired?: boolean;
  teacherVideoMaxDurationMinutes?: number;
  teacherVideoAllowedFormats?: string[];
  // Live Notice Ticker & Flash Alerts
  noticeTicker?: NoticeTickerConfig;
  // Homepage 6 Facilities Customization
  homepageFacilities?: HomepageFacilityItem[];
  // Cohesive Portal Theme Palette
  themePalette?: 'government_professional' | 'tricolor_vibrant' | 'royal_navy' | 'modern_emerald';
}

export interface HomepageFacilityItem {
  id: string;
  nameHi: string;
  nameEn: string;
  descHi: string;
  descEn: string;
  icon: string; // e.g. 'Building2', 'BookOpen', 'Laptop', 'Trophy', 'Droplets', 'Utensils', 'Monitor', etc.
}

export interface NoticeTickerAlert {
  id: string;
  textEn: string;
  textHi: string;
  badgeLabelEn?: string; // e.g. "FLASH NEWS", "ADMISSION", "HOLIDAY", "EXAMS", "MDM", "IMPORTANT", "EMERGENCY"
  badgeLabelHi?: string; // e.g. "ताज़ा खबर", "प्रवेश", "अवकाश", "परीक्षा", "मिड-डे मील", "महत्वपूर्ण", "आपातकालीन"
  priority?: 'normal' | 'important' | 'urgent';
  linkTarget?: string; // e.g., 'notices', 'admission', 'schemes', 'facilities', 'contact', 'gallery', 'documents' or URL
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  order?: number;
  createdAt?: string;
}

export interface NoticeTickerConfig {
  enabled: boolean;
  speed: 'slow' | 'medium' | 'fast'; // slow: 45s, medium: 28s, fast: 16s
  pauseOnHover: boolean;
  themeStyle: 'amber_gold' | 'crimson_alert' | 'emerald_gov' | 'navy_classic' | 'modern_dark';
  mode: 'custom_alerts' | 'auto_sync_notices' | 'combined'; // custom alerts, public circulars, or merged
  customAlerts: NoticeTickerAlert[];
  headerLabelEn?: string; // default: "Flash Update"
  headerLabelHi?: string; // default: "नवीनतम सूचना"
}


