// Client-side Cashfree Payment Gateway (PG v3) helper utilities
import { apiUrl, safeParseJson } from './apiClient';
import { auth } from '../lib/firebase';

export interface CashfreeOrderResponse {
  success: boolean;
  code?: string;
  orderId?: string;
  cfOrderId?: string;
  paymentSessionId?: string;
  environment?: 'sandbox' | 'production';
  amount?: number;
  currency?: string;
  receiptNumber?: string;
  error?: string;
}

export interface CashfreeVerificationResponse {
  success: boolean;
  verified?: boolean;
  orderId?: string;
  cfOrderId?: string;
  amount?: number;
  currency?: string;
  orderStatus?: string;
  paymentStatus?: 'SUCCESS' | 'PENDING' | 'FAILED';
  cfPaymentId?: string;
  bankReference?: string;
  paymentMethod?: string;
  paymentTime?: string;
  error?: string;
}

export interface CashfreePublicConfigResponse {
  success: boolean;
  isEnabled: boolean;
  isConfigured: boolean;
  environment: 'sandbox' | 'production';
  merchantName: string;
  minAmount: number;
}

export interface SecureCashfreeVaultData {
  success: boolean;
  hasAppId: boolean;
  maskedAppId: string;
  hasSecretKey: boolean;
  maskedSecretKey: string;
  environment: 'sandbox' | 'production';
  isEnabled: boolean;
  isConfigured: boolean;
  merchantName: string;
  minAmount: number;
  taxExemptionNumber: string;
  lastUpdated: string;
  updatedBy: string;
  error?: string;
}

const CASHFREE_SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

export const isCashfreeSdkLoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof (window as any).Cashfree === 'function';
};

/**
 * Dynamically loads the official Cashfree JS v3 Checkout SDK.
 */
export const loadCashfreeSdk = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (isCashfreeSdkLoaded()) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(`script[src*="sdk.cashfree.com/js/v3/cashfree.js"]`);
    if (existingScript) {
      let checks = 0;
      const timer = setInterval(() => {
        checks += 1;
        if (isCashfreeSdkLoaded()) {
          clearInterval(timer);
          resolve(true);
        } else if (checks >= 30) {
          clearInterval(timer);
          resolve(false);
        }
      }, 200);
      return;
    }

    const script = document.createElement('script');
    script.src = CASHFREE_SDK_URL;
    script.async = true;

    const timeout = setTimeout(() => {
      resolve(isCashfreeSdkLoaded());
    }, 10000);

    script.onload = () => {
      clearTimeout(timeout);
      resolve(isCashfreeSdkLoaded());
    };

    script.onerror = () => {
      clearTimeout(timeout);
      console.error('[CASHFREE] Failed to load Cashfree JS v3 SDK.');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Opens official Cashfree Checkout directly for the given paymentSessionId.
 */
export const openCashfreeCheckout = async (params: {
  paymentSessionId: string;
  environment: 'sandbox' | 'production';
  redirectTarget?: '_modal' | '_self' | '_top' | '_blank';
}): Promise<{
  error?: { message?: string };
  redirect?: boolean;
  paymentDetails?: { paymentMessage?: string };
}> => {
  const sdkReady = await loadCashfreeSdk();
  if (!sdkReady || typeof (window as any).Cashfree !== 'function') {
    throw new Error('Cashfree checkout SDK could not be loaded. Please disable ad-blockers or check your internet connection.');
  }

  const cashfree = (window as any).Cashfree({
    mode: params.environment === 'production' ? 'production' : 'sandbox'
  });

  return cashfree.checkout({
    paymentSessionId: params.paymentSessionId,
    redirectTarget: params.redirectTarget || '_modal'
  });
};

export const fetchPublicCashfreeConfig = async (): Promise<CashfreePublicConfigResponse | null> => {
  try {
    const res = await fetch(apiUrl('/api/cashfree/config'), {
      headers: { Accept: 'application/json' }
    });
    const parsed = await safeParseJson<CashfreePublicConfigResponse>(res);
    if (parsed.ok && parsed.data) return parsed.data;
    return null;
  } catch {
    return null;
  }
};

export const createCashfreeOrder = async (params: {
  amount: number;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  reason?: string;
  receiptNumber?: string;
  returnUrl?: string;
}): Promise<CashfreeOrderResponse> => {
  try {
    const res = await fetch(apiUrl('/api/cashfree/create-order'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(params)
    });
    const parsed = await safeParseJson<CashfreeOrderResponse>(res);
    if (parsed.data) return parsed.data;
    return {
      success: false,
      error: 'Payment gateway server did not respond with valid JSON. Please try again.'
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error while creating Cashfree payment order.'
    };
  }
};

export const verifyCashfreeOrderStatus = async (orderId: string): Promise<CashfreeVerificationResponse> => {
  try {
    const res = await fetch(apiUrl(`/api/cashfree/order-status?order_id=${encodeURIComponent(orderId)}`), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const parsed = await safeParseJson<CashfreeVerificationResponse>(res);
    if (parsed.data) return parsed.data;
    return {
      success: false,
      error: 'Unable to verify payment status with server.'
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error while verifying payment status.'
    };
  }
};

async function buildAdminAuthHeaders(authData?: {
  token?: string;
  adminEmail?: string;
  userRole?: string;
}): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  if (authData?.token) {
    headers['Authorization'] = `Bearer ${authData.token}`;
  }

  try {
    const fbToken = await auth.currentUser?.getIdToken?.();
    if (fbToken) {
      headers['X-Firebase-Id-Token'] = fbToken;
      if (!headers['Authorization']) {
        headers['Authorization'] = `Bearer ${fbToken}`;
      }
    }
  } catch {
    // ignore if firebase auth user isn't active
  }

  if (authData?.adminEmail) headers['x-admin-email'] = authData.adminEmail;
  if (authData?.userRole) headers['x-user-role'] = authData.userRole;
  return headers;
}

export const fetchSecureCashfreeConfig = async (authData?: {
  token?: string;
  adminEmail?: string;
  userRole?: string;
}): Promise<SecureCashfreeVaultData> => {
  try {
    const headers = await buildAdminAuthHeaders(authData);
    const res = await fetch(apiUrl('/api/admin/cashfree-secure-config'), {
      method: 'GET',
      headers
    });
    const parsed = await safeParseJson<SecureCashfreeVaultData>(res);
    if (parsed.data) return parsed.data;
    return {
      success: false,
      hasAppId: false,
      maskedAppId: '',
      hasSecretKey: false,
      maskedSecretKey: '',
      environment: 'sandbox',
      isEnabled: true,
      isConfigured: false,
      merchantName: '',
      minAmount: 100,
      taxExemptionNumber: '',
      lastUpdated: '',
      updatedBy: '',
      error: parsed.isHtmlFallback
        ? 'Backend server unreachable. Verify server is running.'
        : 'Invalid response from Cashfree vault.'
    };
  } catch (err: any) {
    return {
      success: false,
      hasAppId: false,
      maskedAppId: '',
      hasSecretKey: false,
      maskedSecretKey: '',
      environment: 'sandbox',
      isEnabled: true,
      isConfigured: false,
      merchantName: '',
      minAmount: 100,
      taxExemptionNumber: '',
      lastUpdated: '',
      updatedBy: '',
      error: err?.message || 'Failed to load Cashfree vault config.'
    };
  }
};

export const saveSecureCashfreeConfig = async (payload: {
  appId?: string;
  secretKey?: string;
  environment?: 'sandbox' | 'production';
  isEnabled?: boolean;
  merchantName?: string;
  minAmount?: number;
  taxExemptionNumber?: string;
  adminEmail?: string;
  userRole?: string;
  sessionToken?: string;
}): Promise<{ success: boolean; message?: string; error?: string; config?: any }> => {
  try {
    const headers = await buildAdminAuthHeaders({
      token: payload.sessionToken,
      adminEmail: payload.adminEmail,
      userRole: payload.userRole
    });
    const res = await fetch(apiUrl('/api/admin/cashfree-secure-config'), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const parsed = await safeParseJson<any>(res);
    return parsed.data || { success: false, error: 'Failed to save Cashfree credentials.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save Cashfree credentials.' };
  }
};

export const testSecureCashfreeConnection = async (payload: {
  appId?: string;
  secretKey?: string;
  environment?: 'sandbox' | 'production';
  adminEmail?: string;
  userRole?: string;
  sessionToken?: string;
}): Promise<{ success: boolean; message?: string; error?: string; environment?: 'sandbox' | 'production' }> => {
  try {
    const headers = await buildAdminAuthHeaders({
      token: payload.sessionToken,
      adminEmail: payload.adminEmail,
      userRole: payload.userRole
    });
    const res = await fetch(apiUrl('/api/admin/cashfree-test-connection'), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const parsed = await safeParseJson<any>(res);
    return parsed.data || { success: false, error: 'Failed to test Cashfree API connection.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to test Cashfree API connection.' };
  }
};
