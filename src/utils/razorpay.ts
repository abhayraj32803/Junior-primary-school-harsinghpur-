// Client-side Razorpay Gateway helper utilities

export interface RazorpayOrderResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  isSimulation?: boolean;
  message?: string;
  error?: string;
}

export interface RazorpayVerificationResponse {
  success: boolean;
  verified?: boolean;
  orderId?: string;
  paymentId?: string;
  isSimulation?: boolean;
  error?: string;
}

/**
 * Dynamically loads the Razorpay checkout script if not already present in document.
 * Handles timeouts, ad-blockers, and offline/sandbox environments gracefully.
 */
export const isRazorpayAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof (window as any).Razorpay !== 'undefined';
};

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Already loaded and ready
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag was already injected
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => {
        console.warn('[RAZORPAY] Razorpay CDN script was blocked or failed to load. Simulation & direct modes available.');
        resolve(false);
      }, { once: true });
      
      // Also fallback if it hangs
      setTimeout(() => {
        resolve(isRazorpayAvailable());
      }, 3000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    let hasSettled = false;

    // Safety timeout in case an adblocker silently blocks or network hangs
    const timer = setTimeout(() => {
      if (!hasSettled) {
        hasSettled = true;
        const available = isRazorpayAvailable();
        if (!available) {
          console.warn('[RAZORPAY] Script load timed out or blocked by client. Falling back to built-in checkout mode.');
        }
        resolve(available);
      }
    }, 4000);

    script.onload = () => {
      if (!hasSettled) {
        hasSettled = true;
        clearTimeout(timer);
        resolve(true);
      }
    };

    script.onerror = () => {
      if (!hasSettled) {
        hasSettled = true;
        clearTimeout(timer);
        console.warn('[RAZORPAY] Failed to load checkout script from Razorpay CDN (may be blocked by adblocker/browser shield). Built-in checkout fallback enabled.');
        resolve(false);
      }
    };

    document.head.appendChild(script);
  });
};

/**
 * Creates a payment order via the backend Express server.
 * Passes the admin-configured API Key ID and Key Secret if customized in settings.
 */
export const createRazorpayOrder = async (params: {
  amount: number;
  currency?: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  reason: string;
  receipt?: string;
  customKeyId?: string;
  customKeySecret?: string;
}): Promise<RazorpayOrderResponse> => {
  try {
    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error('[RAZORPAY] Network error creating order:', error);
    return {
      success: false,
      error: error?.message || 'Network connection failed while connecting to payment server.'
    };
  }
};

/**
 * Verifies the payment cryptographic signature via the backend Express server.
 */
export const verifyRazorpayPayment = async (params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  customKeySecret?: string;
  isSimulation?: boolean;
}): Promise<RazorpayVerificationResponse> => {
  try {
    const res = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error('[RAZORPAY] Network error verifying payment signature:', error);
    return {
      success: false,
      error: error?.message || 'Network error during signature verification.'
    };
  }
};

/**
 * Tests Razorpay API Key ID and Secret directly with Razorpay server.
 */
export const testRazorpayApiKeys = async (params: {
  keyId: string;
  keySecret: string;
}): Promise<{ success: boolean; message?: string; keyMode?: string; error?: string }> => {
  try {
    const res = await fetch('/api/razorpay/test-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Server connection failed while validating Razorpay credentials.'
    };
  }
};

// -------------------------------------------------------------
// SECURE SUPER ADMIN VAULT CLIENT FUNCTIONS
// -------------------------------------------------------------

export interface SecureRazorpayVaultData {
  success: boolean;
  keyId: string;
  hasKeySecret: boolean;
  maskedKeySecret: string;
  isEnabled: boolean;
  isLiveMode: boolean;
  merchantName: string;
  currency: string;
  taxExemptionNumber: string;
  lastUpdated?: string;
  updatedBy?: string;
  error?: string;
}

export const fetchSecureRazorpayConfig = async (authData?: {
  token?: string;
  adminEmail?: string;
  userRole?: string;
}): Promise<SecureRazorpayVaultData> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (authData?.token) headers['Authorization'] = `Bearer ${authData.token}`;
    if (authData?.adminEmail) headers['x-admin-email'] = authData.adminEmail;
    if (authData?.userRole) headers['x-user-role'] = authData.userRole;

    const res = await fetch('/api/admin/razorpay-secure-config', {
      method: 'GET',
      headers
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('[RAZORPAY-VAULT-CLIENT] Error fetching secure config:', err);
    return {
      success: false,
      keyId: '',
      hasKeySecret: false,
      maskedKeySecret: '',
      isEnabled: true,
      isLiveMode: false,
      merchantName: '',
      currency: 'INR',
      taxExemptionNumber: '',
      error: err?.message || 'Network error fetching secure gateway configuration.'
    };
  }
};

export const saveSecureRazorpayConfig = async (
  payload: {
    keyId: string;
    keySecret?: string;
    isEnabled: boolean;
    isLiveMode: boolean;
    merchantName: string;
    taxExemptionNumber: string;
    adminEmail?: string;
    userRole?: string;
    sessionToken?: string;
  }
): Promise<{ success: boolean; message?: string; config?: any; error?: string }> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (payload.sessionToken) headers['Authorization'] = `Bearer ${payload.sessionToken}`;
    if (payload.adminEmail) headers['x-admin-email'] = payload.adminEmail;
    if (payload.userRole) headers['x-user-role'] = payload.userRole;

    const res = await fetch('/api/admin/razorpay-secure-config', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('[RAZORPAY-VAULT-CLIENT] Error saving secure config:', err);
    return {
      success: false,
      error: err?.message || 'Failed to securely update credentials on server.'
    };
  }
};

export const testSecureRazorpayConnection = async (
  payload: {
    keyId?: string;
    keySecret?: string;
    adminEmail?: string;
    userRole?: string;
    sessionToken?: string;
  }
): Promise<{ success: boolean; message?: string; mode?: string; error?: string }> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (payload.sessionToken) headers['Authorization'] = `Bearer ${payload.sessionToken}`;
    if (payload.adminEmail) headers['x-admin-email'] = payload.adminEmail;
    if (payload.userRole) headers['x-user-role'] = payload.userRole;

    const res = await fetch('/api/admin/razorpay-test-connection', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Connection test failed to communicate with server.'
    };
  }
};
