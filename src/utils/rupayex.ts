// Client-side Rupayex UPI & Payment Gateway Helper Utilities

export interface RupayexOrderParams {
  amount: number;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  reason?: string;
  customReason?: string;
  receiptNumber?: string;
  redirectUrl?: string;
}

export interface RupayexOrderResponse {
  success: boolean;
  orderId?: string;
  paymentUrl?: string;
  amount?: number;
  receiptNumber?: string;
  error?: string;
  message?: string;
}

export interface RupayexStatusResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  paymentStatus?: 'SUCCESS' | 'PENDING' | 'FAILED';
  utr?: string | null;
  method?: string;
  createdAt?: string;
  error?: string;
}

/**
 * Creates an order on Rupayex payment gateway via backend proxy
 */
export async function createRupayexOrder(params: RupayexOrderParams): Promise<RupayexOrderResponse> {
  try {
    const res = await fetch('/api/rupayex/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || data.message || 'Failed to create Rupayex order.'
      };
    }

    return {
      success: true,
      orderId: data.orderId,
      paymentUrl: data.paymentUrl,
      amount: data.amount,
      receiptNumber: data.receiptNumber,
      message: data.message
    };
  } catch (err: any) {
    console.error('[RUPAYEX-CLIENT] Error creating order:', err);
    return {
      success: false,
      error: err?.message || 'Network error while connecting to Rupayex payment gateway.'
    };
  }
}

/**
 * Checks current order payment status from Rupayex gateway
 */
export async function checkRupayexOrderStatus(orderId: string): Promise<RupayexStatusResponse> {
  try {
    const res = await fetch(`/api/rupayex/order-status?order_id=${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Failed to check order status.'
      };
    }

    return {
      success: true,
      orderId: data.orderId,
      amount: data.amount,
      paymentStatus: data.paymentStatus,
      utr: data.utr,
      method: data.method,
      createdAt: data.createdAt
    };
  } catch (err: any) {
    console.error('[RUPAYEX-CLIENT] Error checking order status:', err);
    return {
      success: false,
      error: err?.message || 'Network error while checking status.'
    };
  }
}
