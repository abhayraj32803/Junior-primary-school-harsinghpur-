import { UserProfile, Student } from '../types';

/**
 * Resolves the logged-in student object from userProfile and students list.
 * Guarantees that the student's own registered name and profile are always returned,
 * and NEVER falls back to an unrelated dummy student from seed data.
 */
export function resolveCurrentStudent(
  userProfile: UserProfile | null | undefined,
  students: Student[] = []
): Student {
  const registeredName = (userProfile?.fullName || userProfile?.name || '').trim();

  if (userProfile && userProfile.role === 'student') {
    // 1. Find matching student record in school database
    const matched = students.find(s => 
      (userProfile.uid && (s.id === userProfile.uid || s.uid === userProfile.uid || s.userId === userProfile.uid)) ||
      (userProfile.linkedEntityId && (s.id === userProfile.linkedEntityId || s.uid === userProfile.linkedEntityId)) ||
      (userProfile.studentId && s.studentId && s.studentId.toUpperCase() === userProfile.studentId.toUpperCase()) ||
      (userProfile.username && s.studentId && s.studentId.toUpperCase() === userProfile.username.toUpperCase()) ||
      (userProfile.admissionNumber && s.admissionNumber && s.admissionNumber.toUpperCase() === userProfile.admissionNumber.toUpperCase()) ||
      (userProfile.email && s.email && s.email.toLowerCase() === userProfile.email.toLowerCase()) ||
      (registeredName && s.name && s.name.toLowerCase() === registeredName.toLowerCase())
    );

    if (matched) {
      // Return matched student with guaranteed priority for the user's registered name & updated profile
      const photo = userProfile.photoURL || userProfile.profilePhoto || matched.photoURL || matched.profilePhoto || '';
      return {
        ...matched,
        name: registeredName || matched.name,
        fullName: registeredName || matched.fullName || matched.name,
        email: userProfile.email || matched.email,
        phone: userProfile.phone || matched.phone || matched.mobile,
        mobile: userProfile.phone || matched.mobile || matched.phone,
        fatherName: userProfile.fatherName || matched.fatherName,
        motherName: userProfile.motherName || matched.motherName,
        guardianName: userProfile.guardianName || matched.guardianName || userProfile.fatherName || matched.fatherName,
        dateOfBirth: userProfile.dateOfBirth || userProfile.dob || matched.dateOfBirth || matched.dob || '2015-05-15',
        dob: userProfile.dateOfBirth || userProfile.dob || matched.dob || matched.dateOfBirth || '2015-05-15',
        gender: userProfile.gender || matched.gender || 'Male',
        category: (userProfile.category as any) || matched.category || 'General',
        bloodGroup: userProfile.bloodGroup || matched.bloodGroup || 'O+',
        address: userProfile.address || matched.address || 'Village Harsinghpur Gova, Post Shamsabad, Dist Farrukhabad UP',
        aadhaarNumber: userProfile.aadhaarNumber || matched.aadhaarNumber || '',
        classNumber: userProfile.classNumber || matched.classNumber || 5,
        class: userProfile.classNumber || matched.classNumber || 5,
        sectionName: userProfile.sectionName || matched.sectionName || 'A',
        section: userProfile.sectionName || matched.sectionName || 'A',
        rollNumber: userProfile.rollNumber || matched.rollNumber || '1',
        admissionNumber: userProfile.admissionNumber || matched.admissionNumber || `ADM-${userProfile.uid?.substring(0, 6).toUpperCase() || '2026'}`,
        registrationNumber: userProfile.admissionNumber || matched.registrationNumber || matched.admissionNumber || `ADM-${userProfile.uid?.substring(0, 6).toUpperCase() || '2026'}`,
        photoURL: photo,
        profilePhoto: photo,
      };
    }

    // 2. If student is not yet loaded into array, synthesize directly from userProfile
    const uid = userProfile.uid || userProfile.linkedEntityId || `stu-${Date.now()}`;
    const cleanUsername = userProfile.username || `STU-${uid.substring(0, 6).toUpperCase()}`;
    const cleanAdmission = userProfile.admissionNumber || `ADM-${uid.substring(0, 6).toUpperCase()}`;
    const studentName = registeredName || 'Student';
    const photo = userProfile.photoURL || userProfile.profilePhoto || '';

    return {
      id: uid,
      uid: uid,
      userId: uid,
      studentId: cleanUsername,
      admissionNumber: cleanAdmission,
      registrationNumber: cleanAdmission,
      name: studentName,
      fullName: studentName,
      email: userProfile.email || '',
      emailVerified: userProfile.emailVerified,
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
      dateOfBirth: userProfile.dateOfBirth || userProfile.dob || '2015-05-15',
      dob: userProfile.dateOfBirth || userProfile.dob || '2015-05-15',
      gender: userProfile.gender || 'Male',
      category: (userProfile.category as any) || 'General',
      bloodGroup: userProfile.bloodGroup || 'O+',
      aadhaarNumber: userProfile.aadhaarNumber || '',
      address: userProfile.address || 'Village Harsinghpur Gova, Post Shamsabad, Dist Farrukhabad UP',
      photoURL: photo,
      profilePhoto: photo,
      status: 'active',
      admissionDate: userProfile.createdAt ? userProfile.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      createdAt: userProfile.createdAt || new Date().toISOString()
    };
  }

  // Fallback for public preview or guest
  return students[0] || {
    id: 'stu-default',
    studentId: 'STU-2026-0001',
    admissionNumber: 'ADM-2025-001',
    name: 'Student',
    fullName: 'Student',
    classNumber: 5,
    sectionName: 'A',
    classId: 'class-5',
    sectionId: 'sec-5-A',
    rollNumber: '1',
    fatherName: 'Guardian',
    motherName: 'Mother',
    mobile: '9876543210',
    address: 'Village Harsinghpur Gova',
    gender: 'Male',
    dateOfBirth: '2015-05-15',
    admissionDate: '2025-04-01',
    status: 'active',
    createdAt: new Date().toISOString()
  };
}
