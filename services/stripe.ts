/**
 * Stripe Connect Service
 *
 * Handles Stripe Connect onboarding, payouts, and balance for Pros.
 *
 * ARCHITECTURE:
 * - All Stripe API calls go through backend endpoints (Cloud Functions)
 * - No Stripe secret key on the client
 * - Client handles UI flow + calls backend endpoints
 *
 * SETUP REQUIRED:
 * 1. EXPO_PUBLIC_API_URL in .env pointing to your Cloud Functions
 * 2. Deploy Cloud Functions that implement the endpoints below
 * 3. EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY for client-side Stripe SDK
 *
 * MARKETPLACE FLOW:
 *   Customer pays $55 → Stripe holds full amount
 *   → Pro completes job → Stripe splits:
 *       - Pro: $46.75 (85%)
 *       - Mowblo: $8.25 (15% platform fee)
 *   → Pro can withdraw to bank/card via Connect
 */

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';
const PLATFORM_FEE_RATE = 0.15;

// ============================================================
// Types
// ============================================================

export interface StripeBalance {
    available: number;   // in dollars
    pending: number;     // in dollars
    currency: string;
}

export interface PayoutMethod {
    id: string;
    type: 'bank_account' | 'card';
    last4: string;
    bankName?: string;
    brand?: string;
    isDefault: boolean;
}

export interface PayoutResult {
    id: string;
    amount: number;
    status: 'paid' | 'pending' | 'in_transit' | 'canceled' | 'failed';
    arrivalDate: string;
    method: 'instant' | 'standard';
}

// ============================================================
// Connect Onboarding
// ============================================================

/**
 * Creates a Stripe Connect Express account + onboarding link.
 * Saves stripeConnectId to user's Firestore profile.
 */
export async function createConnectAccount(userId: string, email: string): Promise<{
    accountId: string;
    onboardingUrl: string;
}> {
    if (!API_BASE) {
        // Development fallback — no backend deployed yet
        console.log(`[Stripe] createConnectAccount for ${userId}`);
        return {
            accountId: `acct_dev_${userId.slice(0, 8)}`,
            onboardingUrl: 'https://connect.stripe.com/express/onboarding/dev',
        };
    }

    const res = await fetch(`${API_BASE}/createConnectAccount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
    });

    if (!res.ok) throw new Error('Failed to create Connect account');
    const data = await res.json();

    // Persist account ID
    await updateDoc(doc(db, 'users', userId), {
        stripeConnectId: data.accountId,
    });

    return data;
}

/**
 * Get a new onboarding/update link for an existing Connect account.
 */
export async function getOnboardingLink(accountId: string): Promise<string> {
    if (!API_BASE) {
        return 'https://connect.stripe.com/express/onboarding/dev';
    }

    const res = await fetch(`${API_BASE}/getOnboardingLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
    });

    if (!res.ok) throw new Error('Failed to get onboarding link');
    const data = await res.json();
    return data.url;
}

// ============================================================
// Balance & Payouts
// ============================================================

/**
 * Fetches real Stripe balance for a connected account.
 */
export async function getBalance(accountId: string): Promise<StripeBalance> {
    if (!API_BASE) {
        // Dev fallback with realistic mock
        return { available: 352.00, pending: 87.50, currency: 'usd' };
    }

    const res = await fetch(`${API_BASE}/getBalance?accountId=${accountId}`);
    if (!res.ok) throw new Error('Failed to fetch balance');
    return res.json();
}

/**
 * Fetches payout methods (bank accounts, debit cards).
 */
export async function getPayoutMethods(accountId: string): Promise<PayoutMethod[]> {
    if (!API_BASE) {
        return [
            { id: 'ba_dev_1', type: 'bank_account', last4: '4242', bankName: 'Chase', isDefault: true },
        ];
    }

    const res = await fetch(`${API_BASE}/getPayoutMethods?accountId=${accountId}`);
    if (!res.ok) throw new Error('Failed to fetch payout methods');
    const data = await res.json();
    return data.methods;
}

/**
 * Initiates a real payout to the pro's bank/card.
 */
export async function createPayout(
    accountId: string,
    amount: number,
    speed: 'instant' | 'standard',
    methodId?: string
): Promise<PayoutResult> {
    if (!API_BASE) {
        return {
            id: `po_dev_${Date.now()}`,
            amount,
            status: 'pending',
            arrivalDate: speed === 'instant' ? 'Within minutes' : '1-2 business days',
            method: speed,
        };
    }

    const res = await fetch(`${API_BASE}/createPayout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, amount, speed, methodId }),
    });

    if (!res.ok) throw new Error('Failed to create payout');
    return res.json();
}

/**
 * Fetches payout history for a connected account.
 */
export async function getPayoutHistory(accountId: string): Promise<PayoutResult[]> {
    if (!API_BASE) {
        return [
            { id: 'po_1', amount: 218.50, status: 'paid', arrivalDate: 'Feb 14, 2026', method: 'standard' },
            { id: 'po_2', amount: 345.00, status: 'paid', arrivalDate: 'Feb 7, 2026', method: 'instant' },
            { id: 'po_3', amount: 189.25, status: 'paid', arrivalDate: 'Jan 31, 2026', method: 'standard' },
        ];
    }

    const res = await fetch(`${API_BASE}/getPayoutHistory?accountId=${accountId}`);
    if (!res.ok) throw new Error('Failed to fetch payout history');
    const data = await res.json();
    return data.payouts;
}

/**
 * Create a payment intent for a customer job payment.
 */
export async function createPaymentIntent(jobId: string, amount: number) {
    if (!API_BASE) {
        return { clientSecret: 'placeholder', paymentIntentId: 'pi_placeholder' };
    }

    const res = await fetch(`${API_BASE}/createPaymentIntent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, amount }),
    });

    if (!res.ok) throw new Error('Failed to create payment intent');
    return res.json();
}

/**
 * Complete job payout — transfer funds to Pro's connected account.
 */
export async function completeJobPayout(jobId: string, proStripeId: string, amount: number) {
    const platformFee = Math.round(amount * PLATFORM_FEE_RATE * 100) / 100;
    const proEarnings = amount - platformFee;

    if (!API_BASE) {
        return { proEarnings, platformFee };
    }

    const res = await fetch(`${API_BASE}/completeJobPayout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, proStripeId, amount, platformFee, proEarnings }),
    });

    if (!res.ok) throw new Error('Failed to complete payout');
    return res.json();
}

export { PLATFORM_FEE_RATE };
