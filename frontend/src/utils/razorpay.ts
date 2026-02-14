/**
 * Razorpay Checkout integration for web.
 * Loads the checkout script and opens the payment modal.
 */

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/** Error message when user closes the Razorpay modal without paying. Use to detect dismiss vs payment failure. */
export const RAZORPAY_CANCELLED_MESSAGE = 'Payment cancelled';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  prefill?: { email?: string; contact?: string; name?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
    document.body.appendChild(script);
  });
}

export interface OpenRazorpayOptions {
  key: string;
  orderId: string;
  amount: number; // paise
  currency?: string;
  name?: string;
  description?: string;
}

export interface RazorpayPaymentResult {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

/**
 * Opens Razorpay checkout modal. Returns a promise that resolves with payment
 * details on success, or rejects on failure/cancel.
 */
export function openRazorpayCheckout(options: OpenRazorpayOptions): Promise<RazorpayPaymentResult> {
  const {
    key,
    orderId,
    amount,
    currency = 'INR',
    name = 'KO Fitness',
    description = 'Payment for membership / product',
  } = options;

  return loadScript().then(() => {
    return new Promise<RazorpayPaymentResult>((resolve, reject) => {
      const handler = (response: RazorpaySuccessResponse) => {
        resolve({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
      };

      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        order_id: orderId,
        name,
        description,
        theme: { color: '#84cc16' },
        handler,
        modal: {
          ondismiss: () => {
            reject(new Error(RAZORPAY_CANCELLED_MESSAGE));
          },
        },
      });

      rzp.on('payment.failed', (response: any) => {
        reject(new Error(response?.error?.description || 'Payment failed'));
      });

      rzp.open();
    });
  });
}

/**
 * Returns true if Razorpay is configured with a real key (rzp_live_* or rzp_test_*).
 * Placeholder/empty keys from backend when Razorpay env is not set should return false.
 */
export function isRazorpayConfigured(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const placeholder = key === 'rzp_auto' || key === 'rzp_test_placeholder' || key.length < 20;
  return !placeholder && (key.startsWith('rzp_live_') || key.startsWith('rzp_test_'));
}
