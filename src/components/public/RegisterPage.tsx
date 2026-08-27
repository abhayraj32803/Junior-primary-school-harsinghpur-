import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  GraduationCap, 
  School, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  LogIn, 
  Home, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  Building2,
  Users,
  Award,
  BookOpen
} from 'lucide-react';
import { RegisterStepIndicator, REGISTRATION_STEPS } from './register/RegisterStepIndicator';
import { Step1BasicInfo, Step1Data } from './register/Step1BasicInfo';
import { Step2ParentsInfo, Step2Data } from './register/Step2ParentsInfo';
import { Step3AcademicInfo, Step3Data } from './register/Step3AcademicInfo';
import { Step4Documents, Step4Data, UploadedDocSlot } from './register/Step4Documents';
import { Step5AccountReview, Step5Data } from './register/Step5AccountReview';
import { RegisterSuccessReceipt } from './register/RegisterSuccessReceipt';
import { 
  sendStudentEmailVerificationCode, 
  verifyStudentEmailCode 
} from '../../services/verificationCodeService';
import { UserProfile } from '../../types';

interface RegisterPageProps {
  onSuccess?: () => void;
  onNavigateLogin?: () => void;
  onNavigateHome?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onNavigateLogin,
  onNavigateHome
}) => {
  const { registerStudentWithAuth, allUsers } = useAuth();
  const { settings, language, addDocument } = useSchool();

  // Multi-step Wizard Navigation State (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // Submission & Post-Registration State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [registeredProfile, setRegisteredProfile] = useState<UserProfile | null>(null);

  // Form State Split per Step
  const [step1, setStep1] = useState<Step1Data>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '2016-05-15',
    gender: 'Male',
    category: 'General',
    bloodGroup: 'Unknown',
    aadhaarNumber: '',
    photoURL: '',
    photoFileName: ''
  });

  const [step2, setStep2] = useState<Step2Data>({
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    guardianName: '',
    guardianPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: 'ग्राम हरसिंहपुर गोवा, पोस्ट शमसाबाद',
    village: 'हरसिंहपुर गोवा',
    postOffice: 'शमसाबाद',
    block: 'शमसाबाद',
    district: 'Farrukhabad',
    pincode: '209503',
    distanceFromSchoolKm: '0.5'
  });

  const [step3, setStep3] = useState<Step3Data>({
    classNumber: 1,
    sectionName: 'A',
    admissionNumber: `ADM-2026-${Math.floor(100 + Math.random() * 900)}`,
    rollNumber: '1',
    mediumOfInstruction: 'Hindi',
    previousSchool: '',
    previousClassPassed: '',
    admissionQuota: 'General',
    cwsnDetails: ''
  });

  const [step4, setStep4] = useState<Step4Data>({
    documents: {},
    isSelfDeclared: true,
    declarationDate: new Date().toISOString().split('T')[0]
  });

  const [step5, setStep5] = useState<Step5Data>({
    preferredUsername: `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    password: '',
    confirmPassword: ''
  });

  // Sync photo from Step 1 to Step 4 if photo was uploaded
  useEffect(() => {
    if (step1.photoURL && !step4.documents['photoId']) {
      setStep4(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          photoId: {
            type: 'Passport Photo',
            titleHi: 'छात्र पासपोर्ट फोटो (Passport Photo)',
            titleEn: 'Passport Size Photo',
            descriptionHi: 'छात्र का रंगीन पासपोर्ट साइज फोटो',
            descriptionEn: 'Color passport photograph of student',
            isRequired: false,
            fileURL: step1.photoURL,
            fileName: step1.photoFileName || 'passport_photo.jpg',
            fileSize: 'Uploaded',
            fileType: 'image/jpeg'
          }
        }
      }));
    }
  }, [step1.photoURL, step1.photoFileName]);

  // Validation function per step
  const validateStep = (stepNum: number): boolean => {
    const errors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!step1.fullName.trim()) {
        errors.fullName = language === 'hi' ? 'कृपया छात्र का पूरा नाम दर्ज करें।' : 'Please enter student full name.';
      }
      if (!step1.email.trim()) {
        errors.email = language === 'hi' ? 'ईमेल आईडी अनिवार्य है (OTP कोड प्राप्त करने हेतु)।' : 'Email is required for OTP code.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1.email)) {
        errors.email = language === 'hi' ? 'कृपया एक वैध ईमेल पता दर्ज करें।' : 'Please enter a valid email address.';
      }
      if (!step1.phone.trim()) {
        errors.phone = language === 'hi' ? 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter mobile number.';
      } else if (step1.phone.replace(/\D/g, '').length < 10) {
        errors.phone = language === 'hi' ? 'मोबाइल नंबर कम से कम 10 अंकों का होना चाहिए।' : 'Mobile must be 10 digits.';
      }
      if (!step1.dateOfBirth) {
        errors.dateOfBirth = language === 'hi' ? 'कृपया जन्म तिथि चुनें।' : 'Please select date of birth.';
      }
    }

    if (stepNum === 2) {
      if (!step2.fatherName.trim()) {
        errors.fatherName = language === 'hi' ? 'कृपया पिता का नाम दर्ज करें।' : 'Please enter father\'s name.';
      }
      if (!step2.motherName.trim()) {
        errors.motherName = language === 'hi' ? 'कृपया माता का नाम दर्ज करें।' : 'Please enter mother\'s name.';
      }
      if (!step2.address.trim()) {
        errors.address = language === 'hi' ? 'कृपया स्थानीय निवास का पता दर्ज करें।' : 'Please enter residential address.';
      }
    }

    if (stepNum === 3) {
      if (!step3.classNumber || step3.classNumber < 1 || step3.classNumber > 8) {
        errors.classNumber = language === 'hi' ? 'कृपया मान्य प्रवेश कक्षा (1 से 8) चुनें।' : 'Please select class 1 to 8.';
      }
    }

    if (stepNum === 4) {
      if (!step4.isSelfDeclared) {
        errors.isSelfDeclared = language === 'hi' ? 'कृपया अभिभावक स्व-घोषणा वचन को स्वीकार करें।' : 'Please accept the parent self-declaration.';
      }
    }

    if (stepNum === 5) {
      if (!step5.password) {
        errors.password = language === 'hi' ? 'कृपया पोर्टल पासवर्ड दर्ज करें।' : 'Please enter a password.';
      } else if (step5.password.length < 6) {
        errors.password = language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.';
      }
      if (!step5.confirmPassword) {
        errors.confirmPassword = language === 'hi' ? 'कृपया पासवर्ड की पुष्टि करें।' : 'Please confirm password.';
      } else if (step5.password !== step5.confirmPassword) {
        errors.confirmPassword = language === 'hi' ? 'दोनों पासवर्ड मेल नहीं खा रहे हैं।' : 'Passwords do not match.';
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Next step handler
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setGeneralError(null);
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Previous step handler
  const handlePrevStep = () => {
    setGeneralError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct step jump handler
  const handleStepJump = (targetStep: number) => {
    if (targetStep < currentStep || completedSteps.includes(targetStep - 1)) {
      setGeneralError(null);
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Registration Submission Handler
  const handleFinalSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    setGeneralError(null);

    try {
      // 1. Submit Student Registration to AuthContext
      const regRes = await registerStudentWithAuth({
        fullName: step1.fullName,
        email: step1.email,
        password: step5.password,
        admissionNumber: step3.admissionNumber,
        classNumber: step3.classNumber,
        sectionName: step3.sectionName,
        rollNumber: step3.rollNumber || '1',
        phone: step1.phone,
        dateOfBirth: step1.dateOfBirth,
        fatherName: step2.fatherName,
        guardianName: step2.guardianName || step2.fatherName,
        category: step1.category,
        preferredUsername: step5.preferredUsername
      });

      if (!regRes.success) {
        setGeneralError(regRes.error || (language === 'hi' ? 'पंजीकरण में त्रुटि हुई।' : 'Registration failed.'));
        setIsSubmitting(false);
        return;
      }

      const createdUser = regRes.profile || {
        uid: `stu-${Date.now()}`,
        username: step5.preferredUsername,
        name: step1.fullName,
        fullName: step1.fullName,
        email: step1.email,
        phone: step1.phone,
        role: 'student',
        schoolId: settings.schoolCode || '09290205902',
        status: 'active',
        studentId: step5.preferredUsername,
        admissionNumber: step3.admissionNumber,
        classNumber: step3.classNumber,
        sectionName: step3.sectionName,
        fatherName: step2.fatherName,
        motherName: step2.motherName,
        dateOfBirth: step1.dateOfBirth,
        category: step1.category,
        profilePhoto: step1.photoURL
      } as UserProfile;

      setRegisteredProfile(createdUser);

      // 2. Persist any uploaded documents to SchoolContext
      const docsToSave: UploadedDocSlot[] = Object.values(step4.documents || {});
      for (const doc of docsToSave) {
        if (doc.fileURL) {
          try {
            await addDocument({
              studentId: createdUser.studentId || createdUser.username,
              studentName: createdUser.name,
              documentType: doc.type as any,
              title: `${doc.titleHi || doc.type} - ${createdUser.name}`,
              fileURL: doc.fileURL,
              fileName: doc.fileName,
              fileSize: doc.fileSize,
              fileType: doc.fileType,
              uploadedBy: createdUser.uid,
              uploadedByName: createdUser.name,
              uploaderRole: 'student',
              verificationStatus: 'PENDING',
              uploadDate: new Date().toISOString().split('T')[0]
            });
          } catch (docErr) {
            console.warn("Could not stage document:", docErr);
          }
        }
      }

      // 3. Dispatch OTP Verification Code strictly to registered student email
      await sendStudentEmailVerificationCode(step1.email, {
        studentName: step1.fullName,
        studentId: step5.preferredUsername,
        uid: createdUser.uid
      }).catch(e => console.warn("OTP dispatch warning:", e));

      // 4. Transition to OTP Verification View
      setIsSubmitted(true);
      setIsOtpStep(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      console.error("Registration error:", err);
      setGeneralError(err?.message || (language === 'hi' ? 'सर्वर त्रुटि। कृपया पुनः प्रयास करें।' : 'Server error. Please retry.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Verification Handler
  const handleVerifyOtp = async (code: string): Promise<boolean> => {
    const res = await verifyStudentEmailCode(step1.email, code);
    if (res.success) {
      setIsOtpStep(false);
      return true;
    }
    return false;
  };

  // OTP Resend Handler
  const handleResendOtp = async () => {
    await sendStudentEmailVerificationCode(step1.email, {
      studentName: step1.fullName,
      studentId: step5.preferredUsername,
      uid: registeredProfile?.uid || 'temp'
    });
  };

  // If already submitted and in verification/receipt stage
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6">
        <RegisterSuccessReceipt
          studentProfile={registeredProfile}
          registeredEmail={step1.email}
          isOtpStep={isOtpStep}
          onVerifyOtp={handleVerifyOtp}
          onResendOtp={handleResendOtp}
          onNavigateLogin={() => {
            if (onNavigateLogin) onNavigateLogin();
            else if (onSuccess) onSuccess();
          }}
          onNavigateHome={() => {
            if (onNavigateHome) onNavigateHome();
          }}
          language={language}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      
      {/* Top Portal Banner */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
              title={language === 'hi' ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Back to Home'}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
                <School className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xs sm:text-sm font-black text-white leading-tight">
                  {language === 'hi' ? 'प्राथमिक विद्यालय हरसिंहपुर गोवा' : 'Primary School Harsinghpur Gova'}
                </h1>
                <span className="text-[10px] text-slate-400 font-mono">
                  {language === 'hi' ? 'नया छात्र प्रवेश व पंजीकरण पोर्टल' : 'Student Admission & Registration Portal'}
                </span>
              </div>
            </div>
          </div>

          {/* Direct Login CTA */}
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs text-slate-400">
              {language === 'hi' ? 'पहले से नामांकित हैं?' : 'Already enrolled?'}
            </span>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="min-h-[40px] px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'लॉगिन करें' : 'Login'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Multi-Step Wizard Progress Indicator */}
      <RegisterStepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepJump}
        language={language}
      />

      {/* Main Form Content Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-8">
          
          {/* General Error Banner */}
          {generalError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{generalError}</span>
            </div>
          )}

          {/* Active Step Renderer */}
          {currentStep === 1 && (
            <Step1BasicInfo
              data={step1}
              onChange={(updates) => setStep1(prev => ({ ...prev, ...updates }))}
              errors={stepErrors}
              language={language}
            />
          )}

          {currentStep === 2 && (
            <Step2ParentsInfo
              data={step2}
              onChange={(updates) => setStep2(prev => ({ ...prev, ...updates }))}
              errors={stepErrors}
              language={language}
            />
          )}

          {currentStep === 3 && (
            <Step3AcademicInfo
              data={step3}
              onChange={(updates) => setStep3(prev => ({ ...prev, ...updates }))}
              errors={stepErrors}
              language={language}
            />
          )}

          {currentStep === 4 && (
            <Step4Documents
              data={step4}
              onChange={(updates) => setStep4(prev => ({ ...prev, ...updates }))}
              errors={stepErrors}
              language={language}
            />
          )}

          {currentStep === 5 && (
            <Step5AccountReview
              step1Data={step1}
              step2Data={step2}
              step3Data={step3}
              step4Data={step4}
              data={step5}
              onChange={(updates) => setStep5(prev => ({ ...prev, ...updates }))}
              onEditStep={(stepNum) => handleStepJump(stepNum)}
              errors={stepErrors}
              language={language}
              isSubmitting={isSubmitting}
              onSubmit={handleFinalSubmit}
            />
          )}

          {/* Stepper Navigation Buttons (Steps 1 to 4) */}
          {currentStep < 5 && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
              
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="min-h-[48px] px-5 sm:px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'hi' ? 'पिछला चरण (Back)' : 'Previous Step'}</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="min-h-[48px] px-6 sm:px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-black rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer hover:scale-[1.02]"
              >
                <span>
                  {language === 'hi' 
                    ? `आगे बढ़ें (चरण ${currentStep + 1})` 
                    : `Next (Step ${currentStep + 1})`}
                </span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

            </div>
          )}

        </div>

        {/* Teacher Account Info Card */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5 text-xs text-slate-300">
          <div className="p-2 bg-slate-800 rounded-xl text-amber-400 shrink-0 mt-0.5">
            <Users className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <span className="font-bold text-white block">
              {language === 'hi' ? 'शिक्षक एवं स्टॉफ खाता सूचना:' : 'Teacher & Staff Account Notice:'}
            </span>
            <p className="text-slate-400 leading-relaxed">
              {language === 'hi'
                ? 'यह पोर्टल केवल छात्रों के प्रवेश व पंजीकरण हेतु है। शिक्षक एवं अनुदेशक खाते सुरक्षा कारणों से सीधे प्रधानाध्यापिका (School Administrator) द्वारा अधिकृत किए जाते हैं।'
                : 'This portal is exclusively for student admissions. Teacher and staff credentials are officially provisioned by the School Headmaster / Admin.'}
            </p>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-4 text-center text-xs text-slate-500">
        <p>
          {language === 'hi'
            ? '© 2026 प्राथमिक विद्यालय हरसिंहपुर गोवा • बेसिक शिक्षा परिषद, उत्तर प्रदेश • निःशुल्क एवं अनिवार्य बाल शिक्षा अधिकार अधिनियम'
            : '© 2026 Primary School Harsinghpur Gova • UP Basic Education Department • Right to Free & Compulsory Education Act'}
        </p>
      </footer>

    </div>
  );
};
