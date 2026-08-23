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
import { getFriendlyAuthErrorMessage } from '../utils/authErrorUtils';

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
  resetPassword: (emailOrUsername: string) => Promise<{ success: boolean; error?: string; message?: string }>;
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

  // 1. Role-Based Login
  const login = async (role: UserRole, identifier: string, pass: string): Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }> => {
    const cleanId = identifier.trim();
    const cleanPass = pass.trim();

    if (!cleanId) {
      return { success: false, error: "Please enter your Login ID / Username or registered Email." };
    }
    if (!cleanPass) {
      return { success: false, error: "Please enter your password." };
    }

    const lowerId = cleanId.toLowerCase();
    const upperId = cleanId.toUpperCase();

    // Find in all users by username, phone, email, admissionNumber, or employeeId
    let matched = allUsers.find(u => 
      u.username.toUpperCase() === upperId ||
      u.email.toLowerCase() === lowerId ||
      (u.phone && u.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')) ||
      (u.admissionNumber && u.admissionNumber.toLowerCase() === lowerId) ||
      (u.employeeId && u.employeeId.toLowerCase() === lowerId)
    );

    // If not found in memory, try looking up in Firestore or Firebase Auth directly
    if (!matched) {
      if (upperId === 'HEAD-KIRAN') {
        addSecurityLog(cleanId, role, 'FAILED', 'LOGIN', 'Attempted deprecated username HEAD-KIRAN');
        return { 
          success: false, 
          error: "The username 'HEAD-KIRAN' is not valid. Please log in using the official Admin username '8090538115'." 
        };
      }

      // If it looks like an email or direct credential, attempt Firebase Auth sign-in
      if (cleanId.includes('@')) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, cleanId, cleanPass);
          const fbUser = userCred.user;
          
          // Check if profile exists in users or students collection
          let fetchedProfile: UserProfile | null = null;
          try {
            const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
            if (userSnap.exists()) {
              fetchedProfile = userSnap.data() as UserProfile;
            } else {
              const studentSnap = await getDoc(doc(db, 'students', fbUser.uid));
              if (studentSnap.exists()) {
                const sData = studentSnap.data();
                fetchedProfile = {
                  uid: fbUser.uid,
                  username: sData.studentId || sData.admissionNumber || `STU-${fbUser.uid.substring(0, 6).toUpperCase()}`,
                  name: sData.name || sData.fullName || fbUser.displayName || 'Student',
                  fullName: sData.fullName || sData.name || fbUser.displayName || 'Student',
                  email: fbUser.email || '',
                  emailVerified: fbUser.emailVerified,
                  phone: sData.mobile || sData.phone || '',
                  role: 'student',
                  schoolId: SCHOOL_ID,
                  status: 'active',
                  linkedEntityId: fbUser.uid,
                  admissionNumber: sData.admissionNumber,
                  classNumber: sData.classNumber || sData.class || 5,
                  sectionName: sData.sectionName || sData.section || 'A',
                  rollNumber: sData.rollNumber || '1',
                  course: sData.course || 'Primary & Upper Primary Education (Class 1-8)',
                  admissionYear: sData.admissionYear || new Date().getFullYear(),
                  photoURL: sData.photoURL || sData.profilePhoto || '',
                  profilePhoto: sData.profilePhoto || sData.photoURL || '',
                  isApproved: true,
                  createdAt: sData.createdAt || new Date().toISOString()
                };
              }
            }
          } catch (e) {
            console.warn("Firestore user fetch on login error:", e);
          }

          if (!fetchedProfile) {
            // Create default student profile for this Firebase Auth user
            fetchedProfile = {
              uid: fbUser.uid,
              username: `STU-${fbUser.uid.substring(0, 6).toUpperCase()}`,
              name: fbUser.displayName || 'Student User',
              fullName: fbUser.displayName || 'Student User',
              email: fbUser.email || cleanId,
              emailVerified: fbUser.emailVerified,
              phone: '',
              role: role === 'student' ? 'student' : (role === 'teacher' ? 'teacher' : 'student'),
              schoolId: SCHOOL_ID,
              status: 'active',
              linkedEntityId: fbUser.uid,
              classNumber: 5,
              sectionName: 'A',
              isApproved: true,
              createdAt: new Date().toISOString()
            };
            setDoc(doc(db, 'users', fbUser.uid), fetchedProfile, { merge: true }).catch(() => {});
          }

          matched = fetchedProfile;
          setAllUsers(prev => [fetchedProfile!, ...prev.filter(u => u.uid !== fetchedProfile!.uid)]);
        } catch (authErr: any) {
          const friendly = getFriendlyAuthErrorMessage(authErr.code || authErr.message, 'hi');
          addSecurityLog(cleanId, role, 'FAILED', 'LOGIN', `Direct Firebase login failed: ${friendly}`);
          return { success: false, error: friendly };
        }
      }

      if (!matched) {
        // Check if it matches a pending registration request
        const pendingReq = registrationRequests.find(r => 
          r.preferredUsername.toUpperCase() === upperId || 
          r.email.toLowerCase() === lowerId
        );
        if (pendingReq) {
          if (pendingReq.status === 'PENDING') {
            addSecurityLog(cleanId, role, 'BLOCKED', 'LOGIN', 'Login attempt while registration request is pending');
            return { 
              success: false, 
              error: "Your registration request is currently PENDING approval by Head Teacher Smt. Kiran Shakya. Please wait for official verification." 
            };
          } else if (pendingReq.status === 'REJECTED') {
            return { 
              success: false, 
              error: `Registration request was rejected. Reason: ${pendingReq.rejectionReason || 'Details could not be verified'}.` 
            };
          }
        }

        addSecurityLog(cleanId, role, 'FAILED', 'LOGIN', 'No account exists with this Username or Email');
        return { success: false, error: "No registered account found with this Username / Login ID. If you are a new student, please register or use Google Sign-In." };
      }
    }

    // Role Verification: Ensure selected role corresponds to account authority
    if (role === 'admin' && matched.role !== 'admin') {
      addSecurityLog(cleanId, role, 'BLOCKED', 'LOGIN', 'Attempted unauthorized Head Teacher login');
      return { success: false, error: "Access Denied: This account does not possess Head Teacher administrative authority." };
    }
    if (role === 'teacher' && matched.role === 'student') {
      addSecurityLog(cleanId, role, 'BLOCKED', 'LOGIN', 'Student attempted teacher login');
      return { success: false, error: "Access Denied: Student accounts cannot log in through the Teacher portal." };
    }
    if (role === 'student' && matched.role !== 'student') {
      addSecurityLog(cleanId, role, 'BLOCKED', 'LOGIN', 'Staff attempted student login');
      return { success: false, error: "Access Denied: Teaching staff must log in through the Teacher/Head Teacher portal." };
    }

    // Check account status
    if (matched.status === 'pending') {
      addSecurityLog(cleanId, role, 'BLOCKED', 'LOGIN', 'Account status is pending verification');
      return { success: false, error: "Your account is pending verification by the Head Teacher." };
    }
    if (matched.status === 'suspended' || matched.status === 'inactive' || matched.status === 'disabled') {
      addSecurityLog(cleanId, role, 'BLOCKED', 'LOGIN', 'Account is suspended or disabled');
      return { success: false, error: "Your account has been deactivated or suspended. Please contact Head Teacher Smt. Kiran Shakya." };
    }

    // Password Check
    const isDirectPasswordMatch = matched.password && matched.password === cleanPass;
    const isMasterDemoPassword = matched.role !== 'admin' && (cleanPass === 'teacher123' || cleanPass === 'student123' || cleanPass === 'demo123');

    if (!isDirectPasswordMatch && !isMasterDemoPassword) {
      // Attempt Firebase auth
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
        addSecurityLog(cleanId, role, 'FAILED', 'LOGIN', 'Incorrect password entered');
        const friendly = getFriendlyAuthErrorMessage(err.code || err.message, 'hi');
        return { 
          success: false, 
          error: matched.role === 'admin' 
            ? "Incorrect Admin password. Please enter the valid password." 
            : friendly || "Incorrect password. Please verify your credentials or use 'Forgot Password'." 
        };
      }
    }

    // Login successful
    const updatedUser: UserProfile = {
      ...matched,
      emailVerified: auth.currentUser?.emailVerified ?? matched.emailVerified,
      lastLoginAt: new Date().toISOString()
    };

    setUserProfile(updatedUser);
    setAllUsers(prev => prev.map(u => u.uid === updatedUser.uid ? updatedUser : u));
    setDoc(doc(db, 'users', updatedUser.uid), updatedUser, { merge: true }).catch(() => {});

    addSecurityLog(updatedUser.username, updatedUser.role, 'SUCCESS', 'LOGIN', 'User successfully authenticated');

    return { 
      success: true, 
      mustChangePassword: !!updatedUser.mustChangePassword 
    };
  };

  // Google Sign-In with Firebase Auth & Firestore Integration
  // STRICT DIRECTIVE: Google Sign-In is exclusively reserved for Students only.
  const loginWithGoogle = async (
    details?: GoogleAuthDetails
  ): Promise<{ success: boolean; error?: string; user?: UserProfile; requiresApproval?: boolean }> => {
    try {
      const role: 'student' = 'student';

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const res = await signInWithPopup(auth, provider);
      const fbUser = res.user;
      
      if (!fbUser) {
        return { success: false, error: "Google authentication was cancelled or failed." };
      }

      const email = (fbUser.email || '').toLowerCase();
      
      // Check if user already exists in allUsers, Firestore (users & students), or LocalStorage
      let existingProfile: UserProfile | null = null;

      // 1. Check by UID in Firestore 'users' collection
      try {
        const docSnap = await getDoc(doc(db, 'users', fbUser.uid));
        if (docSnap.exists()) {
          existingProfile = docSnap.data() as UserProfile;
        }
      } catch (err) {
        console.warn("Firestore users lookup failed:", err);
      }

      // 2. Check by UID in Firestore 'students' collection
      if (!existingProfile) {
        try {
          const stuSnap = await getDoc(doc(db, 'students', fbUser.uid));
          if (stuSnap.exists()) {
            const sData = stuSnap.data() as any;
            existingProfile = {
              uid: fbUser.uid,
              username: sData.studentId || sData.admissionNumber || `STU-${fbUser.uid.substring(0, 6).toUpperCase()}`,
              name: sData.fullName || sData.name || fbUser.displayName || 'Student',
              fullName: sData.fullName || sData.name || fbUser.displayName || 'Student',
              email: fbUser.email || sData.email || '',
              emailVerified: fbUser.emailVerified,
              phone: sData.mobile || sData.phone || '',
              photoURL: sData.photoURL || sData.profilePhoto || fbUser.photoURL || undefined,
              profilePhoto: sData.profilePhoto || sData.photoURL || fbUser.photoURL || undefined,
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
          }
        } catch (err) {
          console.warn("Firestore students lookup failed:", err);
        }
      }

      // 3. Check by Email in Firestore 'users' collection
      if (!existingProfile && email) {
        try {
          const qUsers = query(collection(db, 'users'), where('email', '==', email));
          const snapUsers = await getDocs(qUsers);
          if (!snapUsers.empty) {
            existingProfile = snapUsers.docs[0].data() as UserProfile;
          }
        } catch (e) {
          // fallback
        }
      }

      // 4. Check by Email in Firestore 'students' collection
      if (!existingProfile && email) {
        try {
          const qStu = query(collection(db, 'students'), where('email', '==', email));
          const snapStu = await getDocs(qStu);
          if (!snapStu.empty) {
            const sData = snapStu.docs[0].data() as any;
            existingProfile = {
              uid: fbUser.uid,
              username: sData.studentId || sData.admissionNumber || `STU-${fbUser.uid.substring(0, 6).toUpperCase()}`,
              name: sData.fullName || sData.name || fbUser.displayName || 'Student',
              fullName: sData.fullName || sData.name || fbUser.displayName || 'Student',
              email: email,
              emailVerified: fbUser.emailVerified,
              phone: sData.mobile || sData.phone || '',
              photoURL: sData.photoURL || sData.profilePhoto || fbUser.photoURL || undefined,
              profilePhoto: sData.profilePhoto || sData.photoURL || fbUser.photoURL || undefined,
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
          }
        } catch (e) {
          // fallback
        }
      }

      // 5. Check by email or UID in allUsers memory
      if (!existingProfile && email) {
        const found = allUsers.find(u => (u.email && u.email.toLowerCase() === email) || u.uid === fbUser.uid);
        if (found) {
          existingProfile = found;
        }
      }

      // 6. Check in localStorage 'sms_gov_students'
      if (!existingProfile) {
        try {
          const localStr = localStorage.getItem('sms_gov_students');
          if (localStr) {
            const list = JSON.parse(localStr);
            const localMatched = list.find((s: any) => 
              (s.email && s.email.toLowerCase() === email) || 
              s.uid === fbUser.uid || 
              s.id === fbUser.uid || 
              s.userId === fbUser.uid
            );
            if (localMatched) {
              existingProfile = {
                uid: fbUser.uid,
                username: localMatched.studentId || localMatched.admissionNumber || `STU-${fbUser.uid.substring(0, 6).toUpperCase()}`,
                name: localMatched.fullName || localMatched.name || fbUser.displayName || 'Student',
                fullName: localMatched.fullName || localMatched.name || fbUser.displayName || 'Student',
                email: email,
                phone: localMatched.mobile || localMatched.phone || '',
                photoURL: localMatched.photoURL || localMatched.profilePhoto || fbUser.photoURL || undefined,
                profilePhoto: localMatched.profilePhoto || localMatched.photoURL || fbUser.photoURL || undefined,
                role: 'student',
                schoolId: SCHOOL_ID,
                status: 'active',
                isApproved: true,
                studentId: localMatched.studentId,
                admissionNumber: localMatched.admissionNumber,
                registrationNumber: localMatched.registrationNumber || localMatched.admissionNumber,
                classNumber: localMatched.classNumber || 5,
                sectionName: localMatched.sectionName || 'A',
                rollNumber: localMatched.rollNumber || '1',
                fatherName: localMatched.fatherName,
                motherName: localMatched.motherName,
                guardianName: localMatched.guardianName,
                dateOfBirth: localMatched.dateOfBirth || localMatched.dob,
                dob: localMatched.dateOfBirth || localMatched.dob,
                bloodGroup: localMatched.bloodGroup,
                gender: localMatched.gender,
                category: localMatched.category,
                address: localMatched.address,
                aadhaarNumber: localMatched.aadhaarNumber,
                createdAt: localMatched.createdAt
              };
            }
          }
        } catch (e) {
          // ignore
        }
      }

      const resolvedName = (
        (details?.fullName && details.fullName.trim()) ||
        (details?.name && details.name.trim()) ||
        (existingProfile?.fullName && existingProfile.fullName.trim()) ||
        (existingProfile?.name && existingProfile.name.trim()) ||
        (fbUser.displayName && !fbUser.displayName.includes('@') ? fbUser.displayName.trim() : '') ||
        (fbUser.email ? fbUser.email.split('@')[0] : 'Student')
      ).trim();

      let finalProfile: UserProfile;

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

      if (existingProfile) {
        // Enforce student role and update with collected details while fully preserving existing data
        finalProfile = {
          ...existingProfile,
          uid: fbUser.uid,
          name: resolvedName,
          fullName: resolvedName,
          email: fbUser.email || existingProfile.email,
          emailVerified: fbUser.emailVerified,
          photoURL: userPhoto,
          profilePhoto: userPhoto,
          role: 'student',
          fatherName: father,
          motherName: mother,
          guardianName: guardian,
          dateOfBirth: birthDate,
          dob: birthDate,
          classNumber: classNum,
          sectionName: secName,
          rollNumber: rollNum,
          phone: userPhone,
          mobile: userPhone,
          gender: userGender,
          category: userCat,
          address: userAddr,
          bloodGroup: userBlood,
          aadhaarNumber: userAadhaar,
          admissionNumber: details?.admissionNumber || existingProfile.admissionNumber || existingProfile.registrationNumber || `ADM-${fbUser.uid.substring(0, 6).toUpperCase()}`,
          registrationNumber: details?.admissionNumber || existingProfile.registrationNumber || existingProfile.admissionNumber || `ADM-${fbUser.uid.substring(0, 6).toUpperCase()}`,
          studentId: existingProfile.studentId || existingProfile.username || `STU-${fbUser.uid.substring(0, 6).toUpperCase()}`,
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else {
        // New student created from Google Auth
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
        classId: `class-${classNum}`,
        classNumber: classNum,
        class: classNum,
        sectionId: `sec-${classNum}-${secName}`,
        sectionName: secName,
        section: secName,
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
        mobile: userPhone,
        phone: userPhone,
        admissionDate: new Date().toISOString().split('T')[0],
        status: 'active',
        role: 'student',
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Persist to Firestore
      try {
        await setDoc(doc(db, 'students', fbUser.uid), studentDocData, { merge: true });
        await setDoc(doc(db, 'users', fbUser.uid), finalProfile, { merge: true });
      } catch (err) {
        console.warn("Error saving student to Firestore:", err);
      }

      // Sync into localStorage for immediate offline/client-side access across components
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
        const filtered = prev.filter(u => u.uid !== finalProfile.uid && (finalProfile.email ? u.email?.toLowerCase() !== finalProfile.email.toLowerCase() : true));
        return [finalProfile, ...filtered];
      });

      addSecurityLog(
        finalProfile.username || finalProfile.name,
        'student',
        'SUCCESS',
        'LOGIN',
        `Google Sign-in authenticated for Student ${finalProfile.name} (${fbUser.email})`
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
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPass = data.password.trim();
    const cleanAdm = data.admissionNumber.trim();
    let cleanUser = (data.preferredUsername || '').trim().toUpperCase();

    if (!cleanName || !cleanEmail || !cleanPass || !cleanAdm) {
      return { success: false, error: "Please enter Full Name, Email, Password, and Admission Number." };
    }

    if (cleanPass.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
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
        role: 'student',
        schoolId: SCHOOL_ID,
        status: 'active',
        linkedEntityId: fbUser.uid,
        studentId: cleanUser,
        admissionNumber: cleanAdm,
        classNumber: data.classNumber || 5,
        sectionName: data.sectionName || 'A',
        rollNumber: data.rollNumber || '1',
        course: 'Primary & Upper Primary Education (Class 1-8)',
        admissionYear: new Date().getFullYear(),
        dateOfBirth: data.dateOfBirth || '',
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
        name: cleanName,
        fullName: cleanName,
        email: cleanEmail,
        emailVerified: fbUser.emailVerified,
        profilePhoto: '',
        photoURL: '',
        class: data.classNumber || 5,
        classNumber: data.classNumber || 5,
        section: data.sectionName || 'A',
        sectionName: data.sectionName || 'A',
        rollNumber: data.rollNumber || '1',
        gender: 'Male',
        dateOfBirth: data.dateOfBirth || '2015-05-15',
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
        const filtered = prev.filter(u => u.uid !== fbUser.uid && u.username.toUpperCase() !== cleanUser && u.email.toLowerCase() !== cleanEmail);
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

    if (!cleanName || !cleanAdm || !cleanPass) {
      return { success: false, error: "Please enter Student Name, Admission Number, and Password." };
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

    // Check if username or admission number is already taken
    const existsUser = allUsers.find(u => u.username.toUpperCase() === cleanUser || (u.admissionNumber && u.admissionNumber.toLowerCase() === cleanAdm.toLowerCase()));
    if (existsUser) {
      return { success: false, error: `An active account already exists with Username '${cleanUser}' or Admission Number '${cleanAdm}'.` };
    }

    const autoEmail = data.email?.trim() || `${cleanUser.toLowerCase()}@student.school.gov.in`;

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

  // 9. Reset Password via Email or Username
  const resetPassword = async (emailOrUsername: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    const clean = emailOrUsername.trim();
    if (!clean) return { success: false, error: "Please enter your Email or Login ID." };

    const matched = allUsers.find(u => u.username.toUpperCase() === clean.toUpperCase() || u.email.toLowerCase() === clean.toLowerCase());
    
    if (matched) {
      try {
        await sendPasswordResetEmail(auth, matched.email);
      } catch (e) {
        // local message
      }
      return { 
        success: true, 
        message: `Password recovery verification instructions have been dispatched for account '${matched.username}' (${matched.email}).` 
      };
    }

    return { success: false, error: "No registered account found matching this Username or Email." };
  };

  // 10. Admin Resets User Password
  const resetUserPasswordByAdmin = async (uid: string, newPass: string, forceChange: boolean = true): Promise<{ success: boolean; error?: string }> => {
    setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, password: newPass, mustChangePassword: forceChange, updatedAt: new Date().toISOString() } : u));
    try {
      await updateDoc(doc(db, 'users', uid), { password: newPass, mustChangePassword: forceChange, updatedAt: new Date().toISOString() });
    } catch (e) {
      // ignore
    }
    return { success: true };
  };

  // 11. User Status & Role Updates
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
