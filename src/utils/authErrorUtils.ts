/**
 * Utility functions for clean, user-friendly authentication messages without technical backend leaks
 */

export function getFriendlyAuthErrorMessage(errorCodeOrMsg: string, lang: 'hi' | 'en' = 'hi'): string {
  const raw = errorCodeOrMsg || '';
  const code = raw.toLowerCase();

  if (code.includes('auth/email-already-in-use') || code.includes('email-already-in-use')) {
    return lang === 'hi'
      ? 'यह ईमेल पता पहले से पंजीकृत है। कृपया लॉगिन करें या दूसरा ईमेल दर्ज करें।'
      : 'This email address is already registered. Please sign in or use a different email.';
  }

  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password') || code.includes('wrong-password')) {
    return lang === 'hi'
      ? 'गलत पासवर्ड या क्रेडेंशियल। कृपया सही विवरण दर्ज करें।'
      : 'Incorrect password or credentials. Please check your details and try again.';
  }

  if (code.includes('auth/user-not-found') || code.includes('user-not-found')) {
    return lang === 'hi'
      ? 'इस विवरण से कोई पंजीकृत छात्र खाता नहीं मिला। कृपया पहले पंजीकरण करें।'
      : 'No registered student account found with this detail. Please register first.';
  }

  if (code.includes('auth/weak-password') || code.includes('weak-password')) {
    return lang === 'hi'
      ? 'पासवर्ड बहुत छोटा है। कृपया कम से कम 6 अक्षरों का सुरक्षित पासवर्ड दर्ज करें।'
      : 'Password is too short. Please use at least 6 characters.';
  }

  if (code.includes('auth/invalid-email') || code.includes('invalid-email')) {
    return lang === 'hi'
      ? 'अमान्य ईमेल प्रारूप। कृपया सही ईमेल दर्ज करें।'
      : 'Invalid email format. Please enter a valid email address.';
  }

  if (code.includes('auth/too-many-requests') || code.includes('too-many-requests')) {
    return lang === 'hi'
      ? 'सुरक्षा कारणों से कुछ समय बाद पुनः प्रयास करें।'
      : 'Too many attempts. Please try again in a few moments.';
  }

  if (code.includes('auth/user-disabled') || code.includes('user-disabled')) {
    return lang === 'hi'
      ? 'यह खाता निष्क्रिय है। कृपया विद्यालय प्रशासन से संपर्क करें।'
      : 'This account has been disabled. Please contact the school administration.';
  }

  if (code.includes('auth/network-request-failed') || code.includes('network-request-failed') || code.includes('network')) {
    return lang === 'hi'
      ? 'इंटरनेट कनेक्शन में समस्या है। कृपया नेटवर्क जांचकर पुनः प्रयास करें।'
      : 'Network connection issue. Please check your connection and try again.';
  }

  if (code.includes('auth/popup-closed-by-user') || code.includes('popup-closed-by-user') || code.includes('closed-by-user')) {
    return lang === 'hi'
      ? 'Google प्रमाणीकरण विंडो बंद कर दी गई थी।'
      : 'Google Sign-In window was closed before completing.';
  }

  if (code.includes('auth/popup-blocked') || code.includes('popup-blocked')) {
    return lang === 'hi'
      ? 'ब्राउज़र द्वारा पॉपअप विंडो रोक दी गई। कृपया पॉपअप की अनुमति दें और पुनः प्रयास करें।'
      : 'Pop-up window was blocked. Please allow pop-ups and try again.';
  }

  if (code.includes('auth/cancelled-popup-request') || code.includes('cancelled-popup-request')) {
    return lang === 'hi'
      ? 'लॉगिन अनुरोध रद्द कर दिया गया था।'
      : 'Sign-in request was cancelled.';
  }

  // Filter out any technical error references (Firebase, Firestore, Database, RPC, etc.)
  if (code.includes('firebase') || code.includes('firestore') || code.includes('permission') || code.includes('backend') || code.includes('quota') || code.includes('rpc') || code.includes('internal')) {
    return lang === 'hi'
      ? 'प्रमाणीकरण सफल नहीं हो सका। कृपया पुनः प्रयास करें।'
      : 'Authentication could not be completed. Please try again.';
  }

  if (code.startsWith('auth/')) {
    return lang === 'hi'
      ? 'प्रमाणीकरण असफल रहा। कृपया विवरण जांचकर पुनः प्रयास करें।'
      : 'Authentication failed. Please verify your details and try again.';
  }

  return raw;
}

