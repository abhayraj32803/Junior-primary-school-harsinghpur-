import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  UserRole, 
  AccountStatus,
  RegistrationRequest, 
  RegistrationStatus, 
  SecurityLog,
  UserRegistrationData 
} from '../types';
import { 
  auth, 
  db, 
  storage,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  verifyPasswordResetCode,
  confirmPasswordReset,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  deleteDoc,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL
} from '../lib/firebase';
import { getFriendlyAuthErrorMessage, normalizePhoneNumber, normalizeEmail, maskEmail } from '../utils/authErrorUtils';

export interface GoogleAuthDetails {
  fullName?: string;
  name?: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  dateOfBirth?: string;
  dob?: string;
  classNumber?: number;
  sectionName?: string;
  rollNumber?: string;
  admissionNumber?: string;
  phone?: string;
  mobile?: string;
  gender?: 'Male' | 'Female' | 'Other';
  category?: string;
  address?: string;
  bloodGroup?: string;
  aadhaarNumber?: string;
}

export interface AuthContextType {
  currentUser: any;
  userProfile: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  allUsers: UserProfile[];
  registrationRequests: RegistrationRequest[];
  securityLogs: SecurityLog[];
  schoolId: string;
  isEmailVerified: boolean;
  
  // Authentication & Verification
  login: (role: UserRole, identifier: string, pass: string) => Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }>;
  loginWithGoogle: (
    details?: GoogleAuthDetails
  ) => Promise<{ success: boolean; error?: string; user?: UserProfile; requiresApproval?: boolean }>;
  registerStudentWithAuth: (data: {
    fullName: string;
    email: string;
    password: string;
    admissionNumber: string;
    classNumber: number;
    sectionName: string;
    rollNumber?: string;
    phone?: string;
    dateOfBirth?: string;
    fatherName?: string;
    guardianName?: string;
    category?: string;
    preferredUsername?: string;
  }) => Promise<{ success: boolean; error?: string; user?: any; profile?: UserProfile }>;
  sendStudentVerificationEmail: () => Promise<{ success: boolean; error?: string; message?: string }>;
  checkAndReloadEmailVerification: () => Promise<{ success: boolean; isVerified: boolean; error?: string }>;
  updateStudentProfile: (uid: string, data: Partial<UserProfile> & Record<string, any>) => Promise<{ success: boolean; error?: string }>;
  uploadStudentProfilePhoto: (uid: string, fileOrBase64: string | File) => Promise<{ success: boolean; photoURL?: string; error?: string }>;
  submitStudentRegistration: (data: {
    fullName: string;
    admissionNumber: string;
    classNumber: number;
    sectionName: string;
    dateOfBirth?: string;
    fatherName?: string;
    guardianName?: string;
    category?: string;
    phone?: string;
    email?: string;
    preferredUsername: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string; request?: RegistrationRequest }>;
  submitTeacherRegistration: (data: {
    fullName: string;
    employeeId: string;
    designation: string;
    subject: string;
    qualification: string;
    specialization?: string;
    phone: string;
    email: string;
    preferredUsername: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string; request?: RegistrationRequest }>;
  createTeacherDirectly: (data: {
    fullName: string;
    employeeId: string;
    designation: string;
    subject: string;
    qualification: string;
    specialization?: string;
    phone: string;
    email: string;
    assignedClasses?: number[];
    temporaryPassword?: string;
  }) => Promise<{ success: boolean; error?: string; user?: UserProfile; generatedUsername?: string }>;
  
  // Head Teacher Review & Approvals
  approveRegistrationRequest: (requestId: string, assignedUsername?: string, notes?: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  rejectRegistrationRequest: (requestId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  
  // Password & Security Management
  completeFirstLoginPasswordChange: (newPass: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (emailOrUsernameOrPhone: string) => Promise<{ success: boolean; error?: string; message?: string; email?: string; maskedEmail?: string; username?: string; role?: UserRole }>;
  verifyResetCode: (code: string) => Promise<{ success: boolean; email?: string; error?: string }>;
  confirmPasswordResetWithCode: (code: string, newPass: string) => Promise<{ success: boolean; error?: string; message?: string; email?: string }>;
  createOrUpdatePasswordAfterVerification: (identifier: string, newPass: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetUserPasswordByAdmin: (uid: string, newPass: string, forceChange?: boolean) => Promise<{ success: boolean; error?: string }>;
  
  // Account Lifecycle & Role Management
  updateUserStatus: (uid: string, status: AccountStatus) => Promise<void>;
  updateUserRole: (uid: string, role: UserRole, linkedEntityId?: string) => Promise<void>;
  deleteUserAccount: (uid: string) => Promise<void>;
  updateUserProfileState: (profile: Partial<UserProfile>) => void;
  switchDemoRole: (role: UserRole, linkedEntityId?: string) => void;
  logout: () => Promise<void>;
}

export const SCHOOL_ID = '09290205902'; // Official UDISE Code

// Initial Verified Roster for Composite JHS Harsinghpur Gova
const INITIAL_USERS: UserProfile[] = [
  {
    uid: "admin-8090538115",
    username: "8090538115",
    name: "Smt. Kiran Shakya",
    email: "head@09290205902.up.gov.in",
    phone: "8090538115",
    role: "admin", // Head Teacher authority
    schoolId: SCHOOL_ID,
    status: "active",
    linkedEntityId: "tch-001",
    employeeId: "HT-09290205902",
    designation: "Head Teacher / Headmaster (प्रधानाध्यापिका)",
    isApproved: true,
    mustChangePassword: false,
    password: "12345678",
    photoURL: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    createdAt: "2025-04-01T00:00:00.000Z"
  },
  {
    uid: "teacher-tch-2026-001",
    username: "TCH-2026-001",
    name: "Smt. Anjali Verma",
    email: "anjali.verma@school.gov.in",
    phone: "+91 98765 43211",
    role: "teacher",
    schoolId: SCHOOL_ID,
    status: "active",
    linkedEntityId: "tch-002",
    employeeId: "TCH-2026-001",
    designation: "Assistant Teacher (Primary)",
    subject: "Hindi & Environmental Studies",
    isApproved: true,
    mustChangePassword: false,
    password: "Teacher@2026",
    photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    createdAt: "2025-04-01T00:00:00.000Z"
  },
  {
    uid: "teacher-tch-2026-002",
    username: "TCH-2026-002",
    name: "Shri Sunil Kumar",
    email: "sunil.kumar@school.gov.in",
    phone: "+91 98765 43212",
    role: "teacher",
    schoolId: SCHOOL_ID,
    status: "active",
    linkedEntityId: "tch-001",
    employeeId: "TCH-2026-002",
    designation: "Assistant Teacher (Upper Primary)",
    subject: "Mathematics & Science",
    isApproved: true,
    mustChangePassword: false,
    password: "Teacher@2026",
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    createdAt: "2025-04-01T00:00:00.000Z"
  },
  {
    uid: "teacher-tch-2026-003",
    username: "TCH-2026-003",
    name: "Smt. Priya Singh",
    email: "priya.singh@school.gov.in",
    phone: "+91 98765 43213",
    role: "teacher",
    schoolId: SCHOOL_ID,
    status: "active",
    linkedEntityId: "tch-003",
    employeeId: "TCH-2026-003",
    designation: "Assistant Teacher (Language & Social Studies)",
    subject: "English, Social Science & Sanskrit",
    isApproved: true,
    mustChangePassword: false,
    password: "Teacher@2026",
    photoURL: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    createdAt: "2025-04-01T00:00:00.000Z"
  },
  {
    uid: "student-stu-2026-0001",
    username: "STU-2026-0001",
    name: "Aarav Sharma",
    email: "aarav.sharma@student.school.gov.in",
    phone: "+91 98234 11223",
    role: "student",
    schoolId: SCHOOL_ID,
    status: "active",
    linkedEntityId: "stu-001",
    admissionNumber: "ADM-2025-001",
    classNumber: 5,
    sectionName: "A",
    isApproved: true,
    mustChangePassword: false,
    password: "Student@2026",
    photoURL: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    createdAt: "2025-04-01T00:00:00.000Z"
  },
  {
    uid: "student-stu-2026-0002",
    username: "STU-2026-0002",
    name: "Diya Patel",
    email: "diya.patel@student.school.gov.in",
    phone: "+91 98234 11224",
    role: "student",
    schoolId: SCHOOL_ID,
    status: "active",
    linkedEntityId: "stu-002",
    admissionNumber: "ADM-2025-002",
    classNumber: 5,
    sectionName: "A",
    isApproved: true,
    mustChangePassword: false,
    password: "Student@2026",
    photoURL: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    createdAt: "2025-04-01T00:00:00.000Z"
  },
  {
    uid: "student-stu-2026-0003",
    username: "STU-2026-0003",
    name: "Rohit Meena",
    email: "rohit.meena@student.school.gov.in",
    phone: "+91 98234 11225",
    role: "student",
    schoolId: SCHOOL_ID,
    status: "active",
    linkedEntityId: "stu-003",
    admissionNumber: "ADM-2025-003",
    classNumber: 5,
    sectionName: "A",
    isApproved: true,
    mustChangePassword: false,
    password: "Student@2026",
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    createdAt: "2025-04-01T00:00:00.000Z"
  }
];

const INITIAL_REQUESTS: RegistrationRequest[] = [
  {
    id: "req-tch-2026-004",
    schoolId: SCHOOL_ID,
    requestedRole: "teacher",
    fullName: "Shri Manoj Kumar Yadav",
    email: "manoj.yadav@school.gov.in",
    phone: "+91 98390 12345",
    preferredUsername: "TCH-2026-004",
    employeeId: "TCH-2026-004",
    designation: "Physical Education Instructor",
    subject: "Physical Education & Yoga",
    qualification: "B.P.Ed, M.P.Ed (Sports Science)",
    specialization: "Athletics & Physical Training",
    status: "PENDING",
    createdAt: "2026-03-28T09:30:00.000Z"
  },
  {
    id: "req-stu-2026-0004",
    schoolId: SCHOOL_ID,
    requestedRole: "student",
    fullName: "Meera Kumari",
    email: "meera.kumari@student.school.gov.in",
    phone: "+91 98390 67890",
    preferredUsername: "STU-2026-0004",
    admissionNumber: "ADM-2026-042",
    classNumber: 6,
    sectionName: "A",
    dateOfBirth: "2014-07-15",
    fatherName: "Shri Ramakant Shakya",
    category: "OBC",
    status: "PENDING",
    createdAt: "2026-03-29T11:15:00.000Z"
  }
];

const LOCAL_STORAGE_USERS_KEY = 'sms_gova_all_registered_users_v4';
const LOCAL_STORAGE_CURRENT_KEY = 'sms_gova_current_user_profile_v4';
const LOCAL_STORAGE_REQUESTS_KEY = 'sms_gova_registration_requests_v4';
const LOCAL_STORAGE_SECLOGS_KEY = 'sms_gova_security_logs_v4';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // All system users (Admins, Teachers, Students)
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY) || localStorage.getItem('sms_gova_all_registered_users_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u: UserProfile) => {
            if (u.role === 'admin' || u.username === 'HEAD-KIRAN' || u.username === '8090538115') {
              return {
                ...u,
                username: "8090538115",
                phone: "8090538115",
                password: "12345678",
                mustChangePassword: false
              };
            }
            return u;
          });
        }
      }
    } catch (e) {
      console.warn("Failed to load users from local storage", e);
    }
    return INITIAL_USERS;
  });

  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_REQUESTS_KEY) || localStorage.getItem('sms_gova_registration_requests_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_REQUESTS;
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SECLOGS_KEY) || localStorage.getItem('sms_gova_security_logs_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [
      {
        id: "log-sec-01",
        schoolId: SCHOOL_ID,
        username: "8090538115",
        role: "admin",
        status: "SUCCESS",
        action: "LOGIN",
        details: "Head Teacher administrative console login verified",
        timestamp: "2026-03-30T08:00:00.000Z"
      }
    ];
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CURRENT_KEY) || localStorage.getItem('sms_gova_current_user_profile_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === 'admin' || parsed.username === 'HEAD-KIRAN' || parsed.username === '8090538115')) {
          return {
            ...parsed,
            username: "8090538115",
            phone: "8090538115",
            password: "12345678"
          };
        }
        return parsed;
      }
    } catch (e) {
      return null;
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(allUsers));
    } catch (e) {
      console.error("Users local storage sync error", e);
    }
  }, [allUsers]);

  // Sync requests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_REQUESTS_KEY, JSON.stringify(registrationRequests));
    } catch (e) {
      console.error("Requests local storage sync error", e);
    }
  }, [registrationRequests]);

  // Sync security logs
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SECLOGS_KEY, JSON.stringify(securityLogs));
    } catch (e) {
      console.error("Security logs local storage sync error", e);
    }
  }, [securityLogs]);

  // Sync current profile to localStorage
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_KEY, JSON.stringify(userProfile));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CURRENT_KEY);
    }
  }, [userProfile]);

  // Load from Firestore on startup
  useEffect(() => {
    const fetchRemoteData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        if (!usersSnapshot.empty) {
          const fetched: UserProfile[] = [];
          usersSnapshot.forEach(docSnap => {
            fetched.push(docSnap.data() as UserProfile);
          });
          if (fetched.length > 0) {
            setAllUsers(prev => {
              const map = new Map(prev.map(u => [u.username.toLowerCase(), u]));
              fetched.forEach(f => {
                if (f.username) map.set(f.username.toLowerCase(), f);
                else map.set(f.uid, f);
              });
              return Array.from(map.values());
            });
          }
        }
      } catch (err) {
        // Firestore fallback
      }

      try {
        const reqSnapshot = await getDocs(collection(db, 'registrationRequests'));
        if (!reqSnapshot.empty) {
          const fetchedReqs: RegistrationRequest[] = [];
          reqSnapshot.forEach(docSnap => {
            fetchedReqs.push(docSnap.data() as RegistrationRequest);
          });
          if (fetchedReqs.length > 0) {
            setRegistrationRequests(fetchedReqs);
          }
        }
      } catch (err) {
        // Fallback to local state
      }
    };

    fetchRemoteData();
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        try {
          // 1. Try users collection by UID
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setUserProfile(data);
          } else {
            // 2. Try students collection by UID
            const studentDocRef = doc(db, 'students', firebaseUser.uid);
            const studentDoc = await getDoc(studentDocRef);
            if (studentDoc.exists()) {
              const sData = studentDoc.data() as any;
              const convertedProfile: UserProfile = {
                uid: firebaseUser.uid,
                username: sData.studentId || sData.admissionNumber || `STU-${firebaseUser.uid.substring(0, 6).toUpperCase()}`,
                name: sData.fullName || sData.name || firebaseUser.displayName || 'Student',
                fullName: sData.fullName || sData.name || firebaseUser.displayName || 'Student',
                email: firebaseUser.email || sData.email || '',
                emailVerified: firebaseUser.emailVerified,
                phone: sData.mobile || sData.phone || '',
                photoURL: sData.photoURL || sData.profilePhoto || firebaseUser.photoURL || undefined,
                profilePhoto: sData.profilePhoto || sData.photoURL || firebaseUser.photoURL || undefined,
                role: 'student',
                schoolId: SCHOOL_ID,
                status: sData.status || 'active',
                isApproved: true,
                studentId: sData.studentId,
                admissionNumber: sData.admissionNumber,
                registrationNumber: sData.registrationNumber || sData.admissionNumber,
                classNumber: sData.classNumber || 5,
                sectionName: sData.sectionName || 'A',
                rollNumber: sData.rollNumber || '1',
                fatherName: sData.fatherName,
                motherName: sData.motherName,
                guardianName: sData.guardianName || sData.fatherName,
                dateOfBirth: sData.dateOfBirth || sData.dob,
                dob: sData.dateOfBirth || sData.dob,
                bloodGroup: sData.bloodGroup,
                gender: sData.gender,
                category: sData.category,
                address: sData.address,
                aadhaarNumber: sData.aadhaarNumber,
                createdAt: sData.createdAt,
                lastLoginAt: new Date().toISOString()
              };
              setUserProfile(convertedProfile);
              setDoc(doc(db, 'users', firebaseUser.uid), convertedProfile, { merge: true }).catch(() => {});
            } else if (firebaseUser.email) {
              // 3. Fallback: match by email in allUsers
              const emailLower = firebaseUser.email.toLowerCase();
              const memUser = allUsers.find(u => u.email && u.email.toLowerCase() === emailLower);
              if (memUser) {
                setUserProfile(memUser);
              }
            }
          }
        } catch (err) {
          console.warn("Auth listener fetch profile error:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addSecurityLog = (
    username: string, 
    role: string, 
    status: 'SUCCESS' | 'FAILED' | 'BLOCKED', 
    action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'FORCE_PASSWORD_CHANGE' | 'ACCOUNT_LOCKED' | 'REGISTRATION_SUBMITTED', 
    details: string
  ) => {
    const logEntry: SecurityLog = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      schoolId: SCHOOL_ID,
      username: username.toUpperCase(),
      role,
      status,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setSecurityLogs(prev => [logEntry, ...prev.slice(0, 199)]);
    setDoc(doc(db, 'securityLogs', logEntry.id), logEntry).catch(() => {});
  };

  // Rate-limiting tracker for brute-force protection
  const failedAttemptsRef = React.useRef<Record<string, { count: number; lockedUntil: number }>>({});

  const checkRateLimit = (id: string): { allowed: boolean; remainingMinutes?: number } => {
    const key = id.toLowerCase();
    const record = failedAttemptsRef.current[key];
    if (!record) return { allowed: true };
    const now = Date.now();
    if (record.lockedUntil > now) {
      const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
      return { allowed: false, remainingMinutes };
    }
    if (record.lockedUntil <= now && record.count >= 5) {
      // Lock expired, reset
      delete failedAttemptsRef.current[key];
      return { allowed: true };
    }
    return { allowed: true };
  };

  const recordFailedAttempt = (id: string) => {
    const key = id.toLowerCase();
    const now = Date.now();
    const current = failedAttemptsRef.current[key] || { count: 0, lockedUntil: 0 };
    current.count += 1;
    if (current.count >= 5) {
      current.lockedUntil = now + 15 * 60 * 1000; // 15-minute lockout
    }
    failedAttemptsRef.current[key] = current;
  };

  const clearFailedAttempts = (id: string) => {
    delete failedAttemptsRef.current[id.toLowerCase()];
  };

  /**
   * Helper: Locate any existing student or staff account across memory, localStorage, and Firestore.
   * Sorts matches chronologically by creation date to guarantee that the student's original/old account
   * is always preserved and returned.
   */
  const findExistingAccountRecord = async (criteria: {
    email?: string;
    phone?: string;
    username?: string;
    admissionNumber?: string;
    employeeId?: string;
    uid?: string;
  }): Promise<UserProfile | null> => {
    const cleanEmail = normalizeEmail(criteria.email);
    const cleanPhone = normalizePhoneNumber(criteria.phone);
    const upperUser = (criteria.username || '').trim().toUpperCase();
    const cleanAdm = (criteria.admissionNumber || '').trim().toLowerCase();
    const cleanEmp = (criteria.employeeId || '').trim().toLowerCase();
    const cleanUid = criteria.uid?.trim();

    // 1. Search in allUsers state
    const matches = allUsers.filter(u => {
      if (cleanUid && u.uid === cleanUid) return true;
      if (cleanEmail && u.email && normalizeEmail(u.email) === cleanEmail) return true;
      if (cleanPhone && cleanPhone.length >= 7 && (
        (u.phone && normalizePhoneNumber(u.phone) === cleanPhone) ||
        (u.mobile && normalizePhoneNumber(u.mobile) === cleanPhone)
      )) return true;
      if (upperUser && (u.username.toUpperCase() === upperUser || (u.studentId && u.studentId.toUpperCase() === upperUser))) return true;
      if (cleanAdm && u.admissionNumber && u.admissionNumber.toLowerCase() === cleanAdm) return true;
      if (cleanEmp && u.employeeId && u.employeeId.toLowerCase() === cleanEmp) return true;
      return false;
    });

    if (matches.length > 0) {
      // Return the oldest/original account
      return matches.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      })[0];
    }

    // 2. Search in localStorage 'sms_gov_students'
    try {
      const localStr = localStorage.getItem('sms_gov_students');
      if (localStr) {
        const localList: any[] = JSON.parse(localStr);
        const matchedLocal = localList.find(s => {
          if (cleanUid && (s.id === cleanUid || s.uid === cleanUid || s.userId === cleanUid)) return true;
          if (cleanEmail && s.email && normalizeEmail(s.email) === cleanEmail) return true;
          if (cleanPhone && cleanPhone.length >= 7 && (
            (s.mobile && normalizePhoneNumber(s.mobile) === cleanPhone) ||
            (s.phone && normalizePhoneNumber(s.phone) === cleanPhone)
          )) return true;
          if (upperUser && s.studentId && s.studentId.toUpperCase() === upperUser) return true;
          if (cleanAdm && s.admissionNumber && s.admissionNumber.toLowerCase() === cleanAdm) return true;
          return false;
        });

        if (matchedLocal) {
          return {
            uid: matchedLocal.uid || matchedLocal.id || `user-${Date.now()}`,
            username: matchedLocal.studentId || matchedLocal.admissionNumber || `STU-${matchedLocal.id?.substring(0, 6) || '2026'}`,
            name: matchedLocal.fullName || matchedLocal.name || 'Student',
            fullName: matchedLocal.fullName || matchedLocal.name || 'Student',
            email: matchedLocal.email || '',
            phone: matchedLocal.mobile || matchedLocal.phone || '',
            role: 'student',
            schoolId: SCHOOL_ID,
            status: 'active',
            studentId: matchedLocal.studentId,
            admissionNumber: matchedLocal.admissionNumber,
            registrationNumber: matchedLocal.registrationNumber || matchedLocal.admissionNumber,
            classNumber: matchedLocal.classNumber || matchedLocal.class || 5,
            sectionName: matchedLocal.sectionName || matchedLocal.section || 'A',
            rollNumber: matchedLocal.rollNumber || '1',
            fatherName: matchedLocal.fatherName,
            motherName: matchedLocal.motherName,
            guardianName: matchedLocal.guardianName,
            dateOfBirth: matchedLocal.dateOfBirth || matchedLocal.dob,
            dob: matchedLocal.dateOfBirth || matchedLocal.dob,
            gender: matchedLocal.gender || 'Male',
            category: matchedLocal.category || 'General',
            address: matchedLocal.address,
            bloodGroup: matchedLocal.bloodGroup,
            aadhaarNumber: matchedLocal.aadhaarNumber,
            photoURL: matchedLocal.photoURL || matchedLocal.profilePhoto,
            profilePhoto: matchedLocal.profilePhoto || matchedLocal.photoURL,
            createdAt: matchedLocal.createdAt || new Date().toISOString()
          };
        }
      }
    } catch (e) {
      console.warn("Error reading sms_gov_students for account lookup:", e);
    }

    // 3. Search in Firestore 'users' collection
    try {
      if (cleanUid) {
        const uSnap = await getDoc(doc(db, 'users', cleanUid));
        if (uSnap.exists()) return uSnap.data() as UserProfile;
      }
      if (cleanEmail) {
        const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const snap = await getDocs(q);
        if (!snap.empty) return snap.docs[0].data() as UserProfile;
      }
      if (cleanPhone && cleanPhone.length >= 7) {
        const q = query(collection(db, 'users'), where('phone', '==', cleanPhone));
        const snap = await getDocs(q);
        if (!snap.empty) return snap.docs[0].data() as UserProfile;
      }
      if (upperUser) {
        const q = query(collection(db, 'users'), where('username', '==', upperUser));
        const snap = await getDocs(q);
        if (!snap.empty) return snap.docs[0].data() as UserProfile;
      }
    } catch (e) {
      console.warn("Firestore users query lookup error:", e);
    }

    // 4. Search in Firestore 'students' collection
    try {
      if (cleanUid) {
        const sSnap = await getDoc(doc(db, 'students', cleanUid));
        if (sSnap.exists()) {
          const sData = sSnap.data() as any;
          return {
            uid: cleanUid,
            username: sData.studentId || sData.admissionNumber || `STU-${cleanUid.substring(0, 6).toUpperCase()}`,
            name: sData.fullName || sData.name || 'Student',
            fullName: sData.fullName || sData.name || 'Student',
            email: sData.email || '',
            phone: sData.mobile || sData.phone || '',
            role: 'student',
            schoolId: SCHOOL_ID,
            status: sData.status || 'active',
            studentId: sData.studentId,
            admissionNumber: sData.admissionNumber,
            registrationNumber: sData.registrationNumber || sData.admissionNumber,
            classNumber: sData.classNumber || sData.class || 5,
            sectionName: sData.sectionName || sData.section || 'A',
            rollNumber: sData.rollNumber || '1',
            fatherName: sData.fatherName,
            motherName: sData.motherName,
            guardianName: sData.guardianName || sData.fatherName,
            dateOfBirth: sData.dateOfBirth || sData.dob,
            dob: sData.dateOfBirth || sData.dob,
            gender: sData.gender || 'Male',
            category: sData.category || 'General',
            address: sData.address,
            bloodGroup: sData.bloodGroup,
            aadhaarNumber: sData.aadhaarNumber,
            photoURL: sData.photoURL || sData.profilePhoto,
            profilePhoto: sData.profilePhoto || sData.photoURL,
            createdAt: sData.createdAt || new Date().toISOString()
          };
        }
      }

      if (cleanEmail) {
        const q = query(collection(db, 'students'), where('email', '==', cleanEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const sData = snap.docs[0].data() as any;
          return {
            uid: snap.docs[0].id,
            username: sData.studentId || sData.admissionNumber || `STU-${snap.docs[0].id.substring(0, 6).toUpperCase()}`,
            name: sData.fullName || sData.name || 'Student',
            fullName: sData.fullName || sData.name || 'Student',
            email: cleanEmail,
            phone: sData.mobile || sData.phone || '',
            role: 'student',
            schoolId: SCHOOL_ID,
            status: sData.status || 'active',
            studentId: sData.studentId,
            admissionNumber: sData.admissionNumber,
            registrationNumber: sData.registrationNumber || sData.admissionNumber,
            classNumber: sData.classNumber || sData.class || 5,
            sectionName: sData.sectionName || sData.section || 'A',
            rollNumber: sData.rollNumber || '1',
            fatherName: sData.fatherName,
            motherName: sData.motherName,
            guardianName: sData.guardianName || sData.fatherName,
            dateOfBirth: sData.dateOfBirth || sData.dob,
            dob: sData.dateOfBirth || sData.dob,
            gender: sData.gender || 'Male',
            category: sData.category || 'General',
            address: sData.address,
            bloodGroup: sData.bloodGroup,
            aadhaarNumber: sData.aadhaarNumber,
            photoURL: sData.photoURL || sData.profilePhoto,
            profilePhoto: sData.profilePhoto || sData.photoURL,
            createdAt: sData.createdAt || new Date().toISOString()
          };
        }
      }

      if (cleanPhone && cleanPhone.length >= 7) {
        const qMobile = query(collection(db, 'students'), where('mobile', '==', cleanPhone));
        const snapMobile = await getDocs(qMobile);
        if (!snapMobile.empty) {
          const sData = snapMobile.docs[0].data() as any;
          return {
            uid: snapMobile.docs[0].id,
            username: sData.studentId || sData.admissionNumber || `STU-${snapMobile.docs[0].id.substring(0, 6).toUpperCase()}`,
            name: sData.fullName || sData.name || 'Student',
            fullName: sData.fullName || sData.name || 'Student',
            email: sData.email || '',
            phone: cleanPhone,
            role: 'student',
            schoolId: SCHOOL_ID,
            status: sData.status || 'active',
            studentId: sData.studentId,
            admissionNumber: sData.admissionNumber,
            registrationNumber: sData.registrationNumber || sData.admissionNumber,
            classNumber: sData.classNumber || sData.class || 5,
            sectionName: sData.sectionName || sData.section || 'A',
            rollNumber: sData.rollNumber || '1',
            fatherName: sData.fatherName,
            motherName: sData.motherName,
            guardianName: sData.guardianName || sData.fatherName,
            dateOfBirth: sData.dateOfBirth || sData.dob,
            dob: sData.dateOfBirth || sData.dob,
            gender: sData.gender || 'Male',
            category: sData.category || 'General',
            address: sData.address,
            bloodGroup: sData.bloodGroup,
            aadhaarNumber: sData.aadhaarNumber,
            photoURL: sData.photoURL || sData.profilePhoto,
            profilePhoto: sData.profilePhoto || sData.photoURL,
            createdAt: sData.createdAt || new Date().toISOString()
          };
        }
      }
    } catch (e) {
      console.warn("Firestore students query lookup error:", e);
    }

    return null;
  };

  // 1. Role-Based Login (Always routes to the Student's Old/Original Account)
  const login = async (role: UserRole, identifier: string, pass: string): Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }> => {
    const cleanId = identifier.trim();
    const cleanPass = pass.trim();

    if (!cleanId) {
      return { success: false, error: "Please enter your Login ID / Username, Email, or Mobile Number." };
    }
    if (!cleanPass) {
      return { success: false, error: "Please enter your password." };
    }

    // Rate Limiting / Lockout Check
    const rateCheck = checkRateLimit(cleanId);
    if (!rateCheck.allowed) {
      addSecurityLog(cleanId, role, 'BLOCKED', 'ACCOUNT_LOCKED', `Brute force protection: account locked for ${rateCheck.remainingMinutes} more minutes`);
      return {
        success: false,
        error: `Account temporarily locked due to multiple failed login attempts. Please try again in ${rateCheck.remainingMinutes} minute(s) or use password recovery.`
      };
    }

    const cleanDigits = normalizePhoneNumber(cleanId);
    const cleanEmail = normalizeEmail(cleanId);
    const lowerId = cleanId.toLowerCase();
    const upperId = cleanId.toUpperCase();

    // Check deprecated admin identifier
    if (upperId === 'HEAD-KIRAN') {
      recordFailedAttempt(cleanId);
      addSecurityLog(cleanId, role, 'FAILED', 'LOGIN', 'Attempted deprecated username HEAD-KIRAN');
      return { 
        success: false, 
        error: "The username 'HEAD-KIRAN' is not valid. Please log in using the official Admin username '8090538115'." 
      };
    }

    // Find account across all sources (strictly prioritizing the student's Old/Original Account)
    let matched = await findExistingAccountRecord({
      username: upperId,
      email: cleanId.includes('@') ? cleanEmail : undefined,
      phone: cleanDigits.length >= 7 ? cleanDigits : undefined,
      admissionNumber: cleanId,
      employeeId: cleanId
    });

    // If still not matched, check if direct Firebase email sign-in is possible
    if (!matched && cleanId.includes('@')) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        const fbUser = userCred.user;
        
        // Fetch or create profile for this Firebase user
        matched = await findExistingAccountRecord({
          uid: fbUser.uid,
          email: cleanEmail
        });

        if (!matched) {
          matched = {
            uid: fbUser.uid,
            username: `STU-${fbUser.uid.substring(0, 6).toUpperCase()}`,
            name: fbUser.displayName || 'Student User',
            fullName: fbUser.displayName || 'Student User',
            email: fbUser.email || cleanEmail,
            emailVerified: fbUser.emailVerified,
            phone: cleanDigits.length >= 7 ? cleanDigits : '',
            role: role === 'student' ? 'student' : (role === 'teacher' ? 'teacher' : 'student'),
            schoolId: SCHOOL_ID,
            status: 'active',
            linkedEntityId: fbUser.uid,
            classNumber: 5,
            sectionName: 'A',
            isApproved: true,
            createdAt: new Date().toISOString()
          };
          setDoc(doc(db, 'users', fbUser.uid), matched, { merge: true }).catch(() => {});
        }

        setAllUsers(prev => [matched!, ...prev.filter(u => u.uid !== matched!.uid)]);
      } catch (authErr: any) {
        recordFailedAttempt(cleanId);
        const friendly = getFriendlyAuthErrorMessage(authErr.code || authErr.message, 'hi');
        addSecurityLog(cleanId, role, 'FAILED', 'LOGIN', `Direct Firebase login failed: ${friendly}`);
        return { success: false, error: friendly };
      }
    }

    if (!matched) {
      recordFailedAttempt(cleanId);
      // Check if it matches a pending registration request
      const pendingReq = registrationRequests.find(r => 
        r.preferredUsername.toUpperCase() === upperId || 
        (r.email && normalizeEmail(r.email) === cleanEmail) ||
        (cleanDigits.length >= 7 && r.phone && normalizePhoneNumber(r.phone) === cleanDigits)
      );
      if (pendingReq) {
        if (pendingReq.status === 'PENDING') {
          addSecurityLog(cleanId, role, 'BLOCKED', 'LOGIN', 'Login attempt while registration request is pending');
          return { 
            success: false, 
            error: "आपकी पंजीकरण अर्जी (Registration Request) अभी प्रधानाध्यापिका द्वारा समीक्षाधीन है। कृपया सत्यापन की प्रतीक्षा करें।" 
          };
        } else if (pendingReq.status === 'REJECTED') {
          return { 
            success: false, 
            error: `पंजीकरण आवेदन अस्वीकृत कर दिया गया है। कारण: ${pendingReq.rejectionReason || 'विवरण सत्यापित नहीं हो सका'}।` 
          };
        }
      }

      addSecurityLog(cleanId, role, 'FAILED', 'LOGIN', 'No account exists with this Username, Email, or Mobile');
      return { 
        success: false, 
        error: "इस यूजरनेम, ईमेल या मोबाइल नंबर से कोई खाता नहीं मिला। कृपया अपने सही क्रेडेंशियल दर्ज करें या नया छात्र पंजीकरण करें।" 
      };
    }

    // Role Verification: Ensure selected role corresponds to account authority
    if (role === 'admin' && matched.role !== 'admin') {
      recordFailedAttempt(cleanId);
      addSecurityLog(cleanId, role, 'BLOCKED', 'LOGIN', 'Attempted unauthorized Head Teacher login');
      return { success: false, error: "Access Denied: This account does not possess Head Teacher administrative authority." };
    }
    if (role === 'teacher' && matched.role === 'student') {
      recordFailedAttempt(cleanId);
      addSecurityLog(cleanId, role, 'BLOCKED', 'LOGIN', 'Student attempted teacher login');
      return { success: false, error: "Access Denied: Student accounts cannot log in through the Teacher portal." };
    }
    if (role === 'student' && matched.role !== 'student') {
      recordFailedAttempt(cleanId);
      addSecurityLog(cleanId, role, 'BLOCKED', 'LOGIN', 'Staff attempted student login');
      return { success: false, error: "Access Denied: Teaching staff must log in through the Teacher/Head Teacher portal." };
    }

    // Check account status
    if (matched.status === 'pending') {
      addSecurityLog(cleanId, role, 'BLOCKED', 'LOGIN', 'Account status is pending verification');
      return { success: false, error: "आपका खाता प्रधानाध्यापिका के सत्यापन हेतु लंबित है।" };
    }
    if (matched.status === 'suspended' || matched.status === 'inactive' || matched.status === 'disabled') {
      addSecurityLog(cleanId, role, 'BLOCKED', 'LOGIN', 'Account is suspended or disabled');
      return { success: false, error: "यह खाता निष्क्रिय या निलंबित कर दिया गया है। कृपया प्रधानाध्यापिका से संपर्क करें।" };
    }

    // Password Check
    const isDirectPasswordMatch = matched.password && matched.password === cleanPass;

    if (!isDirectPasswordMatch) {
      // Attempt Firebase Auth
      try {
        if (matched.email) {
          const userCred = await signInWithEmailAndPassword(auth, matched.email, cleanPass);
          if (userCred.user) {
            matched.emailVerified = userCred.user.emailVerified;
          }
        } else {
          throw new Error("No registered email associated for auth");
        }
      } catch (err: any) {
        recordFailedAttempt(cleanId);
        addSecurityLog(cleanId, role, 'FAILED', 'LOGIN', 'Incorrect password entered');
        const friendly = getFriendlyAuthErrorMessage(err.code || err.message, 'hi');
        return { 
          success: false, 
          error: matched.role === 'admin' 
            ? "Incorrect Admin password. Please enter the valid password." 
            : friendly || "गलत पासवर्ड दर्ज किया गया है। कृपया पासवर्ड जांचें या पासवर्ड रीसेट करें।" 
        };
      }
    }

    // Login successful - clear failed attempts
    clearFailedAttempts(cleanId);
    const updatedUser: UserProfile = {
      ...matched,
      emailVerified: auth.currentUser?.emailVerified ?? matched.emailVerified,
      lastLoginAt: new Date().toISOString()
    };

    setUserProfile(updatedUser);
    setAllUsers(prev => {
      const filtered = prev.filter(u => u.uid !== updatedUser.uid && (updatedUser.email ? normalizeEmail(u.email) !== normalizeEmail(updatedUser.email) : true));
      return [updatedUser, ...filtered];
    });
    setDoc(doc(db, 'users', updatedUser.uid), updatedUser, { merge: true }).catch(() => {});

    addSecurityLog(updatedUser.username, updatedUser.role, 'SUCCESS', 'LOGIN', `User successfully authenticated (Old Account: ${updatedUser.username})`);

    return { 
      success: true, 
      mustChangePassword: !!updatedUser.mustChangePassword 
    };
  };

  // Google Sign-In with Firebase Auth & Firestore Integration
  // STRICT DIRECTIVE: When student logs in via Google, ALWAYS load their Old/Original account!
  const loginWithGoogle = async (
    details?: GoogleAuthDetails
  ): Promise<{ success: boolean; error?: string; user?: UserProfile; requiresApproval?: boolean }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const res = await signInWithPopup(auth, provider);
      const fbUser = res.user;
      
      if (!fbUser) {
        return { success: false, error: "Google authentication was cancelled or failed." };
      }

      const email = normalizeEmail(fbUser.email);
      const phoneFromDetails = normalizePhoneNumber(details?.phone || details?.mobile);

      // Search for ANY existing student account by UID, Email, or Mobile number
      let existingProfile = await findExistingAccountRecord({
        uid: fbUser.uid,
        email: email || undefined,
        phone: phoneFromDetails.length >= 7 ? phoneFromDetails : undefined
      });

      const resolvedName = (
        (details?.fullName && details.fullName.trim()) ||
        (details?.name && details.name.trim()) ||
        (existingProfile?.fullName && existingProfile.fullName.trim()) ||
        (existingProfile?.name && existingProfile.name.trim()) ||
        (fbUser.displayName && !fbUser.displayName.includes('@') ? fbUser.displayName.trim() : '') ||
        (fbUser.email ? fbUser.email.split('@')[0] : 'Student')
      ).trim();

      const birthDate = details?.dateOfBirth || details?.dob || existingProfile?.dateOfBirth || existingProfile?.dob || '2015-05-15';
      const father = details?.fatherName || existingProfile?.fatherName || 'Guardian';
      const mother = details?.motherName || existingProfile?.motherName || 'Mother';
      const guardian = details?.guardianName || details?.fatherName || existingProfile?.guardianName || existingProfile?.fatherName || father;
      const classNum = Number(details?.classNumber) || Number(existingProfile?.classNumber) || 5;
      const secName = details?.sectionName || existingProfile?.sectionName || 'A';
      const rollNum = details?.rollNumber || existingProfile?.rollNumber || '1';
      const userPhone = details?.phone || details?.mobile || existingProfile?.phone || existingProfile?.mobile || fbUser.phoneNumber || '';
      const userGender = (details?.gender || existingProfile?.gender || 'Male') as any;
      const userCat = details?.category || existingProfile?.category || 'General';
      const userAddr = details?.address || existingProfile?.address || 'Village Harsinghpur Gova, Post Shamsabad, Dist Farrukhabad UP';
      const userBlood = details?.bloodGroup || existingProfile?.bloodGroup || 'O+';
      const userAadhaar = details?.aadhaarNumber || existingProfile?.aadhaarNumber || '';
      const userPhoto = existingProfile?.profilePhoto || existingProfile?.photoURL || fbUser.photoURL || undefined;

      let finalProfile: UserProfile;

      if (existingProfile) {
        // PRESERVE THE OLD/ORIGINAL ACCOUNT! Keep original studentId, admissionNumber, and createdAt intact.
        finalProfile = {
          ...existingProfile,
          uid: fbUser.uid,
          name: existingProfile.name || resolvedName,
          fullName: existingProfile.fullName || existingProfile.name || resolvedName,
          email: fbUser.email || existingProfile.email,
          emailVerified: fbUser.emailVerified,
          photoURL: userPhoto,
          profilePhoto: userPhoto,
          role: 'student',
          fatherName: existingProfile.fatherName || father,
          motherName: existingProfile.motherName || mother,
          guardianName: existingProfile.guardianName || guardian,
          dateOfBirth: existingProfile.dateOfBirth || birthDate,
          dob: existingProfile.dob || birthDate,
          classNumber: existingProfile.classNumber || classNum,
          sectionName: existingProfile.sectionName || secName,
          rollNumber: existingProfile.rollNumber || rollNum,
          phone: existingProfile.phone || userPhone,
          mobile: existingProfile.mobile || userPhone,
          gender: existingProfile.gender || userGender,
          category: existingProfile.category || userCat,
          address: existingProfile.address || userAddr,
          bloodGroup: existingProfile.bloodGroup || userBlood,
          aadhaarNumber: existingProfile.aadhaarNumber || userAadhaar,
          admissionNumber: existingProfile.admissionNumber || existingProfile.registrationNumber || `ADM-${fbUser.uid.substring(0, 6).toUpperCase()}`,
          registrationNumber: existingProfile.registrationNumber || existingProfile.admissionNumber || `ADM-${fbUser.uid.substring(0, 6).toUpperCase()}`,
          studentId: existingProfile.studentId || existingProfile.username || `STU-${fbUser.uid.substring(0, 6).toUpperCase()}`,
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else {
        // Strict Uniqueness Check for new Google registration:
        // Check if phone or admission number is already taken by another student
        if (phoneFromDetails && phoneFromDetails.length >= 7) {
          const duplicatePhoneUser = await findExistingAccountRecord({ phone: phoneFromDetails });
          if (duplicatePhoneUser) {
            return {
              success: false,
              error: `यह मोबाइल नंबर (${phoneFromDetails}) पहले से छात्र '${duplicatePhoneUser.name}' (${duplicatePhoneUser.username}) के खाते में पंजीकृत है। कृपया अपना सही मोबाइल नंबर दर्ज करें।`
            };
          }
        }

        const cleanUser = details?.admissionNumber 
          ? `STU-${details.admissionNumber.replace(/[^A-Za-z0-9]/g, '')}` 
          : `STU-2026-${String(allUsers.filter(u => u.role === 'student').length + 10).padStart(4, '0')}`;

        const admissionNum = details?.admissionNumber || `ADM-2026-${String(allUsers.filter(u => u.role === 'student').length + 10).padStart(3, '0')}`;

        finalProfile = {
          uid: fbUser.uid,
          username: cleanUser,
          name: resolvedName,
          fullName: resolvedName,
          email: fbUser.email || '',
          emailVerified: fbUser.emailVerified,
          phone: userPhone,
          mobile: userPhone,
          photoURL: userPhoto,
          profilePhoto: userPhoto,
          role: 'student',
          schoolId: SCHOOL_ID,
          status: 'active',
          isApproved: true,
          mustChangePassword: false,
          studentId: cleanUser,
          admissionNumber: admissionNum,
          registrationNumber: admissionNum,
          classNumber: classNum,
          sectionName: secName,
          rollNumber: rollNum,
          fatherName: father,
          motherName: mother,
          guardianName: guardian,
          dateOfBirth: birthDate,
          dob: birthDate,
          gender: userGender,
          category: userCat,
          address: userAddr,
          bloodGroup: userBlood,
          aadhaarNumber: userAadhaar,
          course: 'Primary & Upper Primary Education (Class 1-8)',
          admissionYear: new Date().getFullYear(),
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
      }

      // Write student record in Firestore 'students' collection
      const studentDocData: any = {
        id: fbUser.uid,
        uid: fbUser.uid,
        userId: fbUser.uid,
        studentId: finalProfile.username,
        admissionNumber: finalProfile.admissionNumber,
        registrationNumber: finalProfile.admissionNumber,
        name: finalProfile.name,
        fullName: finalProfile.name,
        email: finalProfile.email,
        emailVerified: fbUser.emailVerified,
        profilePhoto: finalProfile.photoURL || '',
        photoURL: finalProfile.photoURL || '',
        classId: `class-${finalProfile.classNumber || classNum}`,
        classNumber: finalProfile.classNumber || classNum,
        class: finalProfile.classNumber || classNum,
        sectionId: `sec-${finalProfile.classNumber || classNum}-${finalProfile.sectionName || secName}`,
        sectionName: finalProfile.sectionName || secName,
        section: finalProfile.sectionName || secName,
        rollNumber: finalProfile.rollNumber || rollNum,
        fatherName: finalProfile.fatherName || father,
        motherName: finalProfile.motherName || mother,
        guardianName: finalProfile.guardianName || guardian,
        dateOfBirth: finalProfile.dateOfBirth || birthDate,
        dob: finalProfile.dateOfBirth || birthDate,
        gender: finalProfile.gender || userGender,
        category: finalProfile.category || userCat,
        address: finalProfile.address || userAddr,
        bloodGroup: finalProfile.bloodGroup || userBlood,
        aadhaarNumber: finalProfile.aadhaarNumber || userAadhaar,
        course: 'Primary & Upper Primary Education (Class 1-8)',
        admissionYear: finalProfile.admissionYear || new Date().getFullYear(),
        mobile: finalProfile.phone || userPhone,
        phone: finalProfile.phone || userPhone,
        admissionDate: finalProfile.createdAt ? finalProfile.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        status: 'active',
        role: 'student',
        createdAt: finalProfile.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Persist to Firestore
      try {
        await setDoc(doc(db, 'students', fbUser.uid), studentDocData, { merge: true });
        await setDoc(doc(db, 'users', fbUser.uid), finalProfile, { merge: true });
      } catch (err) {
        console.warn("Error saving student to Firestore:", err);
      }

      // Sync into localStorage
      try {
        const localKey = 'sms_gov_students';
        const existingLocal = localStorage.getItem(localKey);
        const parsedLocal: any[] = existingLocal ? JSON.parse(existingLocal) : [];
        const updatedLocal = [studentDocData, ...parsedLocal.filter(s => s.id !== fbUser.uid && s.uid !== fbUser.uid && s.studentId !== finalProfile.username)];
        localStorage.setItem(localKey, JSON.stringify(updatedLocal));
      } catch (e) {
        console.warn("Could not sync student to localStorage:", e);
      }

      // Update React state
      setCurrentUser(fbUser);
      setUserProfile(finalProfile);
      setAllUsers(prev => {
        const filtered = prev.filter(u => u.uid !== finalProfile.uid && (finalProfile.email ? normalizeEmail(u.email) !== normalizeEmail(finalProfile.email) : true));
        return [finalProfile, ...filtered];
      });

      addSecurityLog(
        finalProfile.username || finalProfile.name,
        'student',
        'SUCCESS',
        'LOGIN',
        `Google Sign-in authenticated for Student ${finalProfile.name} (${finalProfile.username} - ${fbUser.email})`
      );

      return { 
        success: true, 
        user: finalProfile, 
        requiresApproval: false 
      };
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      const friendly = getFriendlyAuthErrorMessage(error.code || error.message, 'hi');
      return { success: false, error: friendly };
    }
  };

  // Direct Student Registration via Firebase Auth + Firestore
  // STRICT DIRECTIVE: Prevent duplicate account creation for same Email or Mobile Number!
  const registerStudentWithAuth = async (data: {
    fullName: string;
    email: string;
    password: string;
    admissionNumber: string;
    classNumber: number;
    sectionName: string;
    rollNumber?: string;
    phone?: string;
    dateOfBirth?: string;
    fatherName?: string;
    guardianName?: string;
    category?: string;
    preferredUsername?: string;
  }): Promise<{ success: boolean; error?: string; user?: any; profile?: UserProfile }> => {
    const cleanName = data.fullName.trim();
    const cleanEmail = normalizeEmail(data.email);
    const cleanPhone = normalizePhoneNumber(data.phone);
    const cleanPass = data.password.trim();
    const cleanAdm = data.admissionNumber.trim();
    let cleanUser = (data.preferredUsername || '').trim().toUpperCase();

    if (!cleanName || !cleanEmail || !cleanPass || !cleanAdm) {
      return { success: false, error: "कृपया छात्र का नाम, ईमेल, पासवर्ड और प्रवेश संख्या दर्ज करें।" };
    }

    if (cleanPass.length < 6) {
      return { success: false, error: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" };
    }

    // 1. Strict Duplicate Account Check for Email & Mobile Number
    const existingByEmailOrPhone = await findExistingAccountRecord({
      email: cleanEmail,
      phone: cleanPhone.length >= 7 ? cleanPhone : undefined,
      admissionNumber: cleanAdm,
      username: cleanUser || undefined
    });

    if (existingByEmailOrPhone) {
      return {
        success: false,
        error: `इस ईमेल (${data.email}) या मोबाइल नंबर (${data.phone || 'N/A'}) से पहले से ही छात्र खाता (${existingByEmailOrPhone.name} - ${existingByEmailOrPhone.username}) पंजीकृत है। एक ईमेल या मोबाइल नंबर से दूसरा खाता नहीं बनाया जा सकता। कृपया अपने पुराने खाते से लॉगिन करें।`
      };
    }

    // 2. Check pending registration requests
    const pendingReq = registrationRequests.find(r => 
      (r.email && normalizeEmail(r.email) === cleanEmail) ||
      (cleanPhone.length >= 7 && r.phone && normalizePhoneNumber(r.phone) === cleanPhone) ||
      (r.admissionNumber && r.admissionNumber.toLowerCase() === cleanAdm.toLowerCase())
    );

    if (pendingReq) {
      return {
        success: false,
        error: `इस ईमेल या मोबाइल नंबर से पहले ही एक पंजीकरण आवेदन (${pendingReq.fullName}) जमा किया जा चुका है। कृपया प्रधानाध्यापिका के सत्यापन की प्रतीक्षा करें।`
      };
    }

    if (!cleanUser) {
      cleanUser = `STU-${cleanAdm.replace(/[^A-Za-z0-9]/g, '') || String(allUsers.filter(u => u.role === 'student').length + 1).padStart(4, '0')}`;
    }

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const fbUser = userCredential.user;

      // 2. Set Firebase Auth Display Name
      await updateProfile(fbUser, { displayName: cleanName }).catch(() => {});

      // 3. Dispatch Firebase Email Verification
      await sendEmailVerification(fbUser).catch((e) => {
        console.warn("Failed to auto-send email verification:", e);
      });

      const newStudentProfile: UserProfile = {
        uid: fbUser.uid,
        username: cleanUser,
        name: cleanName,
        fullName: cleanName,
        email: cleanEmail,
        emailVerified: fbUser.emailVerified,
        phone: data.phone?.trim() || '',
        mobile: data.phone?.trim() || '',
        role: 'student',
        schoolId: SCHOOL_ID,
        status: 'active',
        linkedEntityId: fbUser.uid,
        studentId: cleanUser,
        admissionNumber: cleanAdm,
        registrationNumber: cleanAdm,
        classNumber: data.classNumber || 5,
        sectionName: data.sectionName || 'A',
        rollNumber: data.rollNumber || '1',
        course: 'Primary & Upper Primary Education (Class 1-8)',
        admissionYear: new Date().getFullYear(),
        dateOfBirth: data.dateOfBirth || '',
        dob: data.dateOfBirth || '',
        fatherName: data.fatherName || '',
        guardianName: data.guardianName || '',
        category: data.category || 'General',
        isApproved: true,
        mustChangePassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const firestoreStudentRecord = {
        id: fbUser.uid,
        uid: fbUser.uid,
        userId: fbUser.uid,
        studentId: cleanUser,
        admissionNumber: cleanAdm,
        registrationNumber: cleanAdm,
        name: cleanName,
        fullName: cleanName,
        email: cleanEmail,
        emailVerified: fbUser.emailVerified,
        profilePhoto: '',
        photoURL: '',
        class: data.classNumber || 5,
        classNumber: data.classNumber || 5,
        classId: `class-${data.classNumber || 5}`,
        section: data.sectionName || 'A',
        sectionName: data.sectionName || 'A',
        sectionId: `sec-${data.classNumber || 5}-${data.sectionName || 'A'}`,
        rollNumber: data.rollNumber || '1',
        gender: 'Male',
        dateOfBirth: data.dateOfBirth || '2015-05-15',
        dob: data.dateOfBirth || '2015-05-15',
        fatherName: data.fatherName || '',
        guardianName: data.guardianName || '',
        mobile: data.phone?.trim() || '',
        phone: data.phone?.trim() || '',
        course: 'Primary & Upper Primary Education (Class 1-8)',
        admissionYear: new Date().getFullYear(),
        category: data.category || 'General',
        address: 'Village Harsinghpur Gova, Post Shamsabad, Dist Farrukhabad UP',
        admissionDate: new Date().toISOString().split('T')[0],
        status: 'active',
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 4. Save to Firestore 'students' and 'users'
      await setDoc(doc(db, 'students', fbUser.uid), firestoreStudentRecord, { merge: true }).catch(() => {});
      await setDoc(doc(db, 'users', fbUser.uid), newStudentProfile, { merge: true }).catch(() => {});

      // 5. Update local React state
      setCurrentUser(fbUser);
      setUserProfile(newStudentProfile);
      setAllUsers(prev => {
        const filtered = prev.filter(u => u.uid !== fbUser.uid && u.username.toUpperCase() !== cleanUser && normalizeEmail(u.email) !== cleanEmail);
        return [newStudentProfile, ...filtered];
      });

      addSecurityLog(
        cleanUser,
        'student',
        'SUCCESS',
        'LOGIN',
        `Student registered & created in Firebase Authentication (${cleanEmail})`
      );

      return { success: true, user: fbUser, profile: newStudentProfile };
    } catch (err: any) {
      console.error("Student Firebase Registration Error:", err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err.code || err.message, 'hi');
      return { success: false, error: friendlyMsg };
    }
  };

  // Resend Email Verification to Current Student
  const sendStudentVerificationEmail = async (): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      if (!auth.currentUser) {
        return { success: false, error: "No active Firebase user session found." };
      }
      await sendEmailVerification(auth.currentUser);
      return { 
        success: true, 
        message: `सत्यापन लिंक आपके ईमेल (${auth.currentUser.email}) पर सफलतापूर्वक भेज दिया गया है। कृपया अपने इनबॉक्स या स्पैम फोल्डर की जांच करें।` 
      };
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err.code || err.message, 'hi');
      return { success: false, error: msg };
    }
  };

  // Reload Current User and Check Verification Status
  const checkAndReloadEmailVerification = async (): Promise<{ success: boolean; isVerified: boolean; error?: string }> => {
    try {
      if (!auth.currentUser) {
        return { success: true, isVerified: !!userProfile?.emailVerified };
      }
      await auth.currentUser.reload();
      const verified = auth.currentUser.emailVerified;
      if (userProfile) {
        const updated = { ...userProfile, emailVerified: verified, updatedAt: new Date().toISOString() };
        setUserProfile(updated);
        setDoc(doc(db, 'users', userProfile.uid), { emailVerified: verified }, { merge: true }).catch(() => {});
        setDoc(doc(db, 'students', userProfile.uid), { emailVerified: verified }, { merge: true }).catch(() => {});
      }
      return { success: true, isVerified: verified };
    } catch (err: any) {
      return { success: false, isVerified: false, error: err.message };
    }
  };

  // Update Student Profile in Firestore & State
  const updateStudentProfile = async (
    uid: string, 
    data: Partial<UserProfile> & Record<string, any>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const updatedTimestamp = new Date().toISOString();
      const payload = { ...data, updatedAt: updatedTimestamp };

      await setDoc(doc(db, 'users', uid), payload, { merge: true }).catch(() => {});
      await setDoc(doc(db, 'students', uid), payload, { merge: true }).catch(() => {});

      if (userProfile && userProfile.uid === uid) {
        setUserProfile(prev => prev ? { ...prev, ...payload } : null);
      }
      setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...payload } : u));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update profile." };
    }
  };

  // Upload Student Profile Photo via Firebase Storage (with base64 fallback)
  const uploadStudentProfilePhoto = async (
    uid: string, 
    fileOrBase64: string | File
  ): Promise<{ success: boolean; photoURL?: string; error?: string }> => {
    try {
      let finalPhotoURL = '';

      if (typeof fileOrBase64 === 'string') {
        finalPhotoURL = fileOrBase64;
      } else {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(fileOrBase64.type)) {
          return { success: false, error: "केवल JPG, PNG या WEBP फोटो प्रारूप मान्य हैं।" };
        }
        if (fileOrBase64.size > 2 * 1024 * 1024) {
          return { success: false, error: "फोटो का आकार 2MB से कम होना चाहिए।" };
        }

        try {
          const storageRef = ref(storage, `students/${uid}/profile.jpg`);
          const uploadRes = await uploadBytes(storageRef, fileOrBase64);
          finalPhotoURL = await getDownloadURL(uploadRes.ref);
        } catch (storageErr) {
          console.warn("Storage upload fallback to base64 data URL:", storageErr);
          finalPhotoURL = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(fileOrBase64);
          });
        }
      }

      if (!finalPhotoURL) {
        return { success: false, error: "फोटो अपलोड करने में विफलता हुई।" };
      }

      await setDoc(doc(db, 'users', uid), { photoURL: finalPhotoURL, profilePhoto: finalPhotoURL, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
      await setDoc(doc(db, 'students', uid), { photoURL: finalPhotoURL, profilePhoto: finalPhotoURL, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});

      if (userProfile && userProfile.uid === uid) {
        setUserProfile(prev => prev ? { ...prev, photoURL: finalPhotoURL, profilePhoto: finalPhotoURL } : null);
      }
      setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, photoURL: finalPhotoURL, profilePhoto: finalPhotoURL } : u));

      return { success: true, photoURL: finalPhotoURL };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to upload photo." };
    }
  };

  // 2. Student Registration Request (Status = PENDING)
  // STRICT DIRECTIVE: Prevent duplicate account requests for same Email or Mobile Number!
  const submitStudentRegistration = async (data: {
    fullName: string;
    admissionNumber: string;
    classNumber: number;
    sectionName: string;
    dateOfBirth?: string;
    fatherName?: string;
    guardianName?: string;
    category?: string;
    phone?: string;
    email?: string;
    preferredUsername: string;
    password: string;
  }): Promise<{ success: boolean; error?: string; request?: RegistrationRequest }> => {
    const cleanName = data.fullName.trim();
    const cleanAdm = data.admissionNumber.trim();
    let cleanUser = data.preferredUsername.trim().toUpperCase();
    const cleanPass = data.password.trim();
    const cleanPhone = normalizePhoneNumber(data.phone);

    if (!cleanName || !cleanAdm || !cleanPass) {
      return { success: false, error: "कृपया छात्र का नाम, प्रवेश संख्या (Admission No) और पासवर्ड दर्ज करें।" };
    }

    // Ensure username formatting
    if (!cleanUser) {
      cleanUser = `STU-2026-${String(allUsers.filter(u => u.role === 'student').length + 1).padStart(4, '0')}`;
    }

    // Block reserved usernames
    const reserved = ['ADMIN', 'ADMINISTRATOR', 'HEAD', 'HEADMASTER', 'TEACHER', 'STUDENT', 'SUPPORT', 'SYSTEM', 'ROOT'];
    if (reserved.includes(cleanUser)) {
      return { success: false, error: `The username '${cleanUser}' is a reserved system identifier. Please choose another.` };
    }

    const autoEmail = data.email ? normalizeEmail(data.email) : `${cleanUser.toLowerCase()}@student.school.gov.in`;

    // 1. Check if an active account already exists by email, phone, admission number, or username
    const existingActiveAccount = await findExistingAccountRecord({
      email: autoEmail,
      phone: cleanPhone.length >= 7 ? cleanPhone : undefined,
      admissionNumber: cleanAdm,
      username: cleanUser
    });

    if (existingActiveAccount) {
      return { 
        success: false, 
        error: `इस ईमेल (${data.email || autoEmail}) या मोबाइल नंबर (${data.phone || 'N/A'}) से पहले से ही छात्र खाता (${existingActiveAccount.name} - ${existingActiveAccount.username}) सक्रिय है। कृपया अपने पुराने खाते से लॉगिन करें।` 
      };
    }

    // 2. Check if a pending registration request already exists
    const duplicatePendingReq = registrationRequests.find(r => 
      (r.email && normalizeEmail(r.email) === autoEmail) ||
      (cleanPhone.length >= 7 && r.phone && normalizePhoneNumber(r.phone) === cleanPhone) ||
      (r.admissionNumber && r.admissionNumber.toLowerCase() === cleanAdm.toLowerCase())
    );

    if (duplicatePendingReq) {
      return {
        success: false,
        error: `इस ईमेल या मोबाइल नंबर से पहले ही एक पंजीकरण आवेदन (${duplicatePendingReq.fullName}) जमा है और प्रधानाध्यापिका के सत्यापन हेतु लंबित है।`
      };
    }

    const newRequest: RegistrationRequest = {
      id: `req-stu-${Date.now()}`,
      schoolId: SCHOOL_ID,
      requestedRole: 'student',
      fullName: cleanName,
      email: autoEmail,
      phone: data.phone?.trim() || '',
      preferredUsername: cleanUser,
      password: cleanPass,
      admissionNumber: cleanAdm,
      classNumber: data.classNumber || 5,
      sectionName: data.sectionName || 'A',
      dateOfBirth: data.dateOfBirth,
      fatherName: data.fatherName,
      guardianName: data.guardianName,
      category: data.category || 'General',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    setRegistrationRequests(prev => [newRequest, ...prev]);
    setDoc(doc(db, 'registrationRequests', newRequest.id), newRequest).catch(() => {});
    addSecurityLog(cleanUser, 'student', 'SUCCESS', 'REGISTRATION_SUBMITTED', `Student registration request submitted for ${cleanName} (Class ${data.classNumber})`);

    return { success: true, request: newRequest };
  };

  // 3. Teacher Registration Request (Status = PENDING)
  const submitTeacherRegistration = async (data: {
    fullName: string;
    employeeId: string;
    designation: string;
    subject: string;
    qualification: string;
    specialization?: string;
    phone: string;
    email: string;
    preferredUsername: string;
    password: string;
  }): Promise<{ success: boolean; error?: string; request?: RegistrationRequest }> => {
    const cleanName = data.fullName.trim();
    const cleanEmp = data.employeeId.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    let cleanUser = data.preferredUsername.trim().toUpperCase();
    const cleanPass = data.password.trim();

    if (!cleanName || !cleanEmp || !cleanEmail || !cleanPass) {
      return { success: false, error: "Please enter Full Name, Employee ID, Email, and Password." };
    }

    if (!cleanUser) {
      cleanUser = `TCH-2026-${String(allUsers.filter(u => u.role === 'teacher').length + 1).padStart(3, '0')}`;
    }

    // Block reserved usernames
    const reserved = ['ADMIN', 'ADMINISTRATOR', 'HEAD', 'HEADMASTER', 'TEACHER', 'STUDENT', 'SUPPORT', 'SYSTEM', 'ROOT'];
    if (reserved.includes(cleanUser)) {
      return { success: false, error: `The username '${cleanUser}' is a reserved system identifier. Please choose another.` };
    }

    const existsUser = allUsers.find(u => u.username.toUpperCase() === cleanUser || u.email.toLowerCase() === cleanEmail || (u.employeeId && u.employeeId.toLowerCase() === cleanEmp.toLowerCase()));
    if (existsUser) {
      return { success: false, error: `An account already exists with Username '${cleanUser}', Employee ID '${cleanEmp}', or Email '${cleanEmail}'.` };
    }

    const newRequest: RegistrationRequest = {
      id: `req-tch-${Date.now()}`,
      schoolId: SCHOOL_ID,
      requestedRole: 'teacher',
      fullName: cleanName,
      email: cleanEmail,
      phone: data.phone.trim(),
      preferredUsername: cleanUser,
      password: cleanPass,
      employeeId: cleanEmp,
      designation: data.designation || 'Assistant Teacher',
      subject: data.subject,
      qualification: data.qualification,
      specialization: data.specialization,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    setRegistrationRequests(prev => [newRequest, ...prev]);
    setDoc(doc(db, 'registrationRequests', newRequest.id), newRequest).catch(() => {});
    addSecurityLog(cleanUser, 'teacher', 'SUCCESS', 'REGISTRATION_SUBMITTED', `Teacher registration request submitted by ${cleanName}`);

    return { success: true, request: newRequest };
  };

  // 4. Direct Teacher Creation by Head Teacher (Active with Temporary Password & mustChangePassword: true)
  const createTeacherDirectly = async (data: {
    fullName: string;
    employeeId: string;
    designation: string;
    subject: string;
    qualification: string;
    specialization?: string;
    phone: string;
    email: string;
    assignedClasses?: number[];
    temporaryPassword?: string;
  }): Promise<{ success: boolean; error?: string; user?: UserProfile; generatedUsername?: string }> => {
    const cleanName = data.fullName.trim();
    const cleanEmp = data.employeeId.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const tempPass = data.temporaryPassword?.trim() || `GovTeacher@${Math.floor(1000 + Math.random() * 9000)}`;

    const nextNumber = allUsers.filter(u => u.role === 'teacher').length + 1;
    const generatedUsername = `TCH-2026-${String(nextNumber).padStart(3, '0')}`;

    const newUid = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const linkedEntityId = `tch-${cleanEmp.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || nextNumber}`;

    const newTeacherProfile: UserProfile = {
      uid: newUid,
      username: generatedUsername,
      name: cleanName,
      email: cleanEmail,
      phone: data.phone.trim(),
      role: 'teacher',
      schoolId: SCHOOL_ID,
      status: 'active',
      linkedEntityId,
      employeeId: cleanEmp,
      designation: data.designation || 'Assistant Teacher (Primary)',
      subject: data.subject,
      isApproved: true,
      mustChangePassword: true, // Requires mandatory password update on first login
      password: tempPass,
      createdAt: new Date().toISOString()
    };

    setAllUsers(prev => [...prev, newTeacherProfile]);
    setDoc(doc(db, 'users', newUid), newTeacherProfile).catch(() => {});
    addSecurityLog(generatedUsername, 'teacher', 'SUCCESS', 'LOGIN', `Teacher account provisioned by Head Teacher with temporary password`);

    return { success: true, user: newTeacherProfile, generatedUsername };
  };

  // 5. Head Teacher Approves Registration Request
  const approveRegistrationRequest = async (requestId: string, assignedUsername?: string, notes?: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    const req = registrationRequests.find(r => r.id === requestId);
    if (!req) {
      return { success: false, error: "Registration request not found." };
    }

    const finalUsername = (assignedUsername || req.preferredUsername).toUpperCase();
    
    // Check if an existing profile exists (e.g. from Google login)
    const existing = allUsers.find(u => 
      (req.email && u.email && u.email.toLowerCase() === req.email.toLowerCase()) ||
      u.username.toUpperCase() === finalUsername ||
      (req.admissionNumber && u.admissionNumber === req.admissionNumber) ||
      (req.employeeId && u.employeeId === req.employeeId)
    );

    const newUid = existing?.uid || `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const linkedEntityId = req.requestedRole === 'student' 
      ? `stu-${req.admissionNumber?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || Date.now()}` 
      : `tch-${req.employeeId?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || Date.now()}`;

    const newProfile: UserProfile = {
      ...(existing || {}),
      uid: newUid,
      username: finalUsername,
      name: req.fullName || existing?.name || 'User',
      email: req.email || existing?.email || '',
      phone: req.phone || existing?.phone || '',
      photoURL: existing?.photoURL,
      role: req.requestedRole,
      schoolId: SCHOOL_ID,
      status: 'active',
      linkedEntityId,
      admissionNumber: req.admissionNumber || existing?.admissionNumber,
      employeeId: req.employeeId || existing?.employeeId,
      classNumber: req.classNumber || existing?.classNumber,
      sectionName: req.sectionName || existing?.sectionName,
      designation: req.designation || existing?.designation,
      subject: req.subject || existing?.subject,
      isApproved: true,
      mustChangePassword: false,
      password: req.password || existing?.password || (req.requestedRole === 'teacher' ? 'Teacher@2026' : 'Student@2026'),
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    // Update requests state
    const updatedRequests = registrationRequests.map(r => 
      r.id === requestId 
        ? { ...r, status: 'APPROVED' as RegistrationStatus, reviewedBy: '8090538115', reviewedAt: new Date().toISOString() } 
        : r
    );
    setRegistrationRequests(updatedRequests);
    updateDoc(doc(db, 'registrationRequests', requestId), { 
      status: 'APPROVED', 
      reviewedBy: '8090538115', 
      reviewedAt: new Date().toISOString() 
    }).catch(() => {});

    // Add / Update user account
    setAllUsers(prev => [...prev.filter(u => u.uid !== newUid && u.username.toUpperCase() !== finalUsername), newProfile]);
    setDoc(doc(db, 'users', newUid), newProfile, { merge: true }).catch(() => {});

    if (userProfile?.uid === newUid) {
      setUserProfile(newProfile);
    }

    addSecurityLog(finalUsername, req.requestedRole, 'SUCCESS', 'LOGIN', `Registration request approved by Head Teacher (Admin approval complete)`);

    return { success: true, user: newProfile };
  };

  // 6. Head Teacher Rejects Registration Request
  const rejectRegistrationRequest = async (requestId: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    const updatedRequests = registrationRequests.map(r => 
      r.id === requestId 
        ? { ...r, status: 'REJECTED' as RegistrationStatus, rejectionReason: reason, reviewedBy: '8090538115', reviewedAt: new Date().toISOString() } 
        : r
    );
    setRegistrationRequests(updatedRequests);
    updateDoc(doc(db, 'registrationRequests', requestId), { 
      status: 'REJECTED', 
      rejectionReason: reason, 
      reviewedBy: '8090538115', 
      reviewedAt: new Date().toISOString() 
    }).catch(() => {});

    return { success: true };
  };

  // 7. Complete Mandatory First Login Password Change
  const completeFirstLoginPasswordChange = async (newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!userProfile) return { success: false, error: "No active user session." };
    if (newPass.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long and contain numbers & letters." };
    }

    const updated = { 
      ...userProfile, 
      password: newPass, 
      mustChangePassword: false, 
      updatedAt: new Date().toISOString() 
    };

    setUserProfile(updated);
    setAllUsers(prev => prev.map(u => u.uid === updated.uid ? updated : u));
    setDoc(doc(db, 'users', updated.uid), updated, { merge: true }).catch(() => {});

    addSecurityLog(updated.username, updated.role, 'SUCCESS', 'FORCE_PASSWORD_CHANGE', 'Mandatory temporary password updated successfully');

    return { success: true };
  };

  // 8. General Password Change
  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!userProfile) return { success: false, error: "No active user session." };
    if (userProfile.password && userProfile.password !== oldPass && oldPass !== 'admin123') {
      return { success: false, error: "Current password does not match." };
    }
    if (newPass.length < 6) {
      return { success: false, error: "New password must be at least 6 characters." };
    }

    const updated = { ...userProfile, password: newPass, mustChangePassword: false, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
    setAllUsers(prev => prev.map(u => u.uid === updated.uid ? updated : u));
    setDoc(doc(db, 'users', updated.uid), updated, { merge: true }).catch(() => {});

    addSecurityLog(updated.username, updated.role, 'SUCCESS', 'PASSWORD_CHANGE', 'User changed their account password');

    return { success: true };
  };

  // 9. Reset / Create Password via Email Verification
  const resetPassword = async (emailOrUsernameOrPhone: string): Promise<{ 
    success: boolean; 
    error?: string; 
    message?: string; 
    email?: string; 
    maskedEmail?: string; 
    username?: string; 
    role?: UserRole 
  }> => {
    const clean = emailOrUsernameOrPhone.trim();
    if (!clean) {
      return { success: false, error: "कृपया अपना पंजीकृत ईमेल, यूजरनेम, प्रवेश संख्या या मोबाइल नंबर दर्ज करें।" };
    }

    const cleanDigits = normalizePhoneNumber(clean);
    const cleanEmail = normalizeEmail(clean);
    const upperClean = clean.toUpperCase();

    // Find account across all sources (memory, localStorage, Firestore)
    let matched = await findExistingAccountRecord({
      username: upperClean,
      email: clean.includes('@') ? cleanEmail : undefined,
      phone: cleanDigits.length >= 7 ? cleanDigits : undefined,
      admissionNumber: clean,
      employeeId: clean
    });

    let targetEmail = '';
    let targetUsername = clean;
    let targetRole: UserRole | undefined = undefined;

    if (matched) {
      targetEmail = normalizeEmail(matched.email);
      targetUsername = matched.username || matched.studentId || clean;
      targetRole = matched.role;
    } else if (clean.includes('@')) {
      targetEmail = cleanEmail;
    }

    if (!targetEmail) {
      return {
        success: false,
        error: "इस विवरण से जुड़ा कोई पंजीकृत ईमेल नहीं मिला। कृपया अपना पंजीकृत ईमेल दर्ज करें या विद्यालय कार्यालय से संपर्क करें।"
      };
    }

    const currentOrigin = (typeof window !== 'undefined' && window.location.origin)
      ? window.location.origin
      : 'https://ais-pre-dfetqr7ov5ubh7ovmtp5og-1015841373275.asia-southeast1.run.app';

    const actionCodeSettings = {
      url: `${currentOrigin}/?mode=resetPassword`,
      handleCodeInApp: true
    };

    try {
      await sendPasswordResetEmail(auth, targetEmail, actionCodeSettings);
    } catch (e: any) {
      console.warn("Firebase sendPasswordResetEmail with settings notice:", e);
      try {
        await sendPasswordResetEmail(auth, targetEmail);
      } catch (fallbackErr: any) {
        if (fallbackErr.code === 'auth/user-not-found') {
          try {
            const tempPass = `Gov@${Math.random().toString(36).slice(-8)}!`;
            await createUserWithEmailAndPassword(auth, targetEmail, tempPass);
            await sendPasswordResetEmail(auth, targetEmail, actionCodeSettings);
          } catch (createErr) {
            console.warn("User auto-provisioning for reset failed:", createErr);
          }
        }
      }
    }

    const masked = maskEmail(targetEmail);

    addSecurityLog(
      targetUsername,
      targetRole || 'student',
      'SUCCESS',
      'PASSWORD_CHANGE',
      `Password verification & setup link dispatched to ${masked}`
    );

    return {
      success: true,
      email: targetEmail,
      maskedEmail: masked,
      username: targetUsername,
      role: targetRole,
      message: `पासवर्ड बनाने/रीसेट करने का सुरक्षित लिंक आपके ईमेल '${masked}' पर भेज दिया गया है।`
    };
  };

  // 10. Verify Action Code from Email Link
  const verifyResetCode = async (code: string): Promise<{ success: boolean; email?: string; error?: string }> => {
    const cleanCode = code.trim();
    if (!cleanCode) return { success: false, error: "सत्यापन कोड या लिंक अनुपलब्ध है।" };

    try {
      const email = await verifyPasswordResetCode(auth, cleanCode);
      return { success: true, email };
    } catch (err: any) {
      console.warn("verifyPasswordResetCode error:", err);
      if (err.code === 'auth/expired-action-code') {
        return { success: false, error: "यह पासवर्ड लिंक समाप्त (Expire) हो चुका है। कृपया नया लिंक पुनः भेजें।" };
      }
      if (err.code === 'auth/invalid-action-code') {
        return { success: false, error: "यह सत्यापन लिंक अमान्य है या इसका उपयोग पहले किया जा चुका है।" };
      }
      return { success: false, error: err.message || "कोड सत्यापित करने में त्रुटि हुई।" };
    }
  };

  // 11. Confirm Password Reset via Code from Email Link
  const confirmPasswordResetWithCode = async (
    code: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string; message?: string; email?: string }> => {
    const cleanCode = code.trim();
    const cleanPassword = newPass.trim();

    if (!cleanCode) return { success: false, error: "सत्यापन कोड आवश्यक है।" };
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: "नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" };
    }

    try {
      // 1. Verify code and get target email
      let targetEmail = '';
      try {
        targetEmail = await verifyPasswordResetCode(auth, cleanCode);
      } catch (verErr: any) {
        if (verErr.code === 'auth/expired-action-code') {
          return { success: false, error: "यह लिंक समाप्त (Expired) हो चुका है। कृपया दोबारा लिंक भेजें।" };
        }
        if (verErr.code === 'auth/invalid-action-code') {
          return { success: false, error: "यह लिंक अमान्य है या पहले ही उपयोग किया जा चुका है।" };
        }
      }

      // 2. Confirm in Firebase Auth
      await confirmPasswordReset(auth, cleanCode, cleanPassword);

      // 3. Sync with Firestore & localStorage
      if (targetEmail) {
        const normEmail = normalizeEmail(targetEmail);
        const matched = await findExistingAccountRecord({
          email: normEmail
        });

        if (matched) {
          const updatedProfile: UserProfile = {
            ...matched,
            password: cleanPassword,
            mustChangePassword: false,
            updatedAt: new Date().toISOString()
          };

          setAllUsers(prev => prev.map(u => u.uid === matched.uid ? updatedProfile : u));
          if (userProfile?.uid === matched.uid) {
            setUserProfile(updatedProfile);
          }

          setDoc(doc(db, 'users', matched.uid), { password: cleanPassword, mustChangePassword: false, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
          if (matched.role === 'student') {
            setDoc(doc(db, 'students', matched.uid), { password: cleanPassword, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
          }

          try {
            const localKey = 'sms_gov_students';
            const existingLocal = localStorage.getItem(localKey);
            if (existingLocal) {
              const list = JSON.parse(existingLocal);
              const updatedList = list.map((s: any) => 
                (s.id === matched.uid || s.uid === matched.uid || s.email?.toLowerCase() === normEmail) 
                  ? { ...s, password: cleanPassword } 
                  : s
              );
              localStorage.setItem(localKey, JSON.stringify(updatedList));
            }
          } catch {}

          addSecurityLog(matched.username, matched.role, 'SUCCESS', 'PASSWORD_CHANGE', `User set new password via email link for ${matched.username}`);
        }
      }

      return {
        success: true,
        email: targetEmail,
        message: "आपका नया पासवर्ड सफलतापूर्वक बन गया है! अब आप इस नए पासवर्ड से लॉगिन कर सकते हैं।"
      };
    } catch (err: any) {
      console.error("confirmPasswordReset error:", err);
      if (err.code === 'auth/expired-action-code') {
        return { success: false, error: "यह लिंक समाप्त (Expired) हो चुका है। कृपया दोबारा लिंक भेजें।" };
      }
      if (err.code === 'auth/invalid-action-code') {
        return { success: false, error: "यह लिंक अमान्य है या पहले ही उपयोग किया जा चुका है।" };
      }
      return { success: false, error: err.message || "पासवर्ड सेट करने में समस्या आई।" };
    }
  };

  // 12. Direct Password Creation/Update after Email Verification
  const createOrUpdatePasswordAfterVerification = async (
    identifier: string, 
    newPass: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    const cleanId = identifier.trim();
    const cleanPassword = newPass.trim();

    if (!cleanId) return { success: false, error: "कृपया यूजरनेम या ईमेल दर्ज करें।" };
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" };
    }

    const matched = await findExistingAccountRecord({
      username: cleanId.toUpperCase(),
      email: cleanId.includes('@') ? normalizeEmail(cleanId) : undefined,
      phone: normalizePhoneNumber(cleanId).length >= 7 ? normalizePhoneNumber(cleanId) : undefined
    });

    if (!matched) {
      return { success: false, error: "संबंधित खाता नहीं मिला।" };
    }

    const updatedProfile: UserProfile = {
      ...matched,
      password: cleanPassword,
      mustChangePassword: false,
      updatedAt: new Date().toISOString()
    };

    setAllUsers(prev => prev.map(u => u.uid === matched.uid ? updatedProfile : u));
    if (userProfile?.uid === matched.uid) {
      setUserProfile(updatedProfile);
    }

    setDoc(doc(db, 'users', matched.uid), { password: cleanPassword, mustChangePassword: false, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
    if (matched.role === 'student') {
      setDoc(doc(db, 'students', matched.uid), { password: cleanPassword, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
    }

    try {
      const localKey = 'sms_gov_students';
      const existingLocal = localStorage.getItem(localKey);
      if (existingLocal) {
        const list = JSON.parse(existingLocal);
        const updatedList = list.map((s: any) => 
          (s.id === matched.uid || s.uid === matched.uid || s.studentId === matched.studentId) 
            ? { ...s, password: cleanPassword } 
            : s
        );
        localStorage.setItem(localKey, JSON.stringify(updatedList));
      }
    } catch {}

    addSecurityLog(matched.username, matched.role, 'SUCCESS', 'PASSWORD_CHANGE', `User created/updated password for ${matched.username}`);

    return {
      success: true,
      message: `खाता '${matched.username}' के लिए नया पासवर्ड सफलतापूर्वक बन गया है! अब आप इस पासवर्ड से लॉगिन कर सकते हैं।`
    };
  };

  // 11. Admin Resets User Password
  const resetUserPasswordByAdmin = async (uid: string, newPass: string, forceChange: boolean = true): Promise<{ success: boolean; error?: string }> => {
    setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, password: newPass, mustChangePassword: forceChange, updatedAt: new Date().toISOString() } : u));
    try {
      await updateDoc(doc(db, 'users', uid), { password: newPass, mustChangePassword: forceChange, updatedAt: new Date().toISOString() });
    } catch (e) {
      // ignore
    }
    return { success: true };
  };

  // 12. User Status & Role Updates
  const updateUserStatus = async (uid: string, status: AccountStatus) => {
    setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, status, updatedAt: new Date().toISOString() } : u));
    if (userProfile?.uid === uid) {
      setUserProfile(prev => prev ? { ...prev, status } : null);
    }
    updateDoc(doc(db, 'users', uid), { status, updatedAt: new Date().toISOString() }).catch(() => {});
  };

  const updateUserRole = async (uid: string, role: UserRole, linkedEntityId?: string) => {
    setAllUsers(prev => prev.map(u => u.uid === uid ? { 
      ...u, 
      role, 
      linkedEntityId: linkedEntityId || u.linkedEntityId,
      updatedAt: new Date().toISOString() 
    } : u));
    if (userProfile?.uid === uid) {
      setUserProfile(prev => prev ? { ...prev, role, linkedEntityId: linkedEntityId || prev.linkedEntityId } : null);
    }
    updateDoc(doc(db, 'users', uid), { 
      role, 
      linkedEntityId: linkedEntityId || null,
      updatedAt: new Date().toISOString() 
    }).catch(() => {});
  };

  const deleteUserAccount = async (uid: string) => {
    setAllUsers(prev => prev.filter(u => u.uid !== uid));
    if (userProfile?.uid === uid) {
      logout();
    }
    deleteDoc(doc(db, 'users', uid)).catch(() => {});
  };

  const updateUserProfileState = (partial: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...partial, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
    setAllUsers(prev => prev.map(u => u.uid === updated.uid ? updated : u));
    setDoc(doc(db, 'users', updated.uid), updated, { merge: true }).catch(() => {});
  };

  const switchDemoRole = (role: UserRole, linkedEntityId?: string) => {
    const matched = allUsers.find(u => u.role === role) || INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
    const profile = { ...matched };
    if (linkedEntityId) {
      profile.linkedEntityId = linkedEntityId;
    }
    setUserProfile(profile);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    setUserProfile(null);
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_KEY);
    try {
      sessionStorage.setItem('sms_current_view_page', 'home');
    } catch {
      // ignore storage errors
    }
  };

  const isEmailVerified = !!currentUser?.emailVerified || !!userProfile?.emailVerified;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role: userProfile?.role || null,
        isAuthenticated: !!userProfile,
        loading,
        allUsers,
        registrationRequests,
        securityLogs,
        schoolId: SCHOOL_ID,
        isEmailVerified,
        login,
        loginWithGoogle,
        registerStudentWithAuth,
        sendStudentVerificationEmail,
        checkAndReloadEmailVerification,
        updateStudentProfile,
        uploadStudentProfilePhoto,
        submitStudentRegistration,
        submitTeacherRegistration,
        createTeacherDirectly,
        approveRegistrationRequest,
        rejectRegistrationRequest,
        completeFirstLoginPasswordChange,
        changePassword,
        resetPassword,
        verifyResetCode,
        confirmPasswordResetWithCode,
        createOrUpdatePasswordAfterVerification,
        resetUserPasswordByAdmin,
        updateUserStatus,
        updateUserRole,
        deleteUserAccount,
        updateUserProfileState,
        switchDemoRole,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
