/**
 * Stripe Connect Service
 * 
 * This is scaffolded for Stripe Connect marketplace payments.
 * 
 * SETUP REQUIRED:
 * 1. Add your Stripe keys to .env:
 *    EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
 *    STRIPE_SECRET_KEY=sk_test_...
 * 
 * 2. Install Stripe SDK:
 *    npx expo install @stripe/stripe-react-native
 * 
 * 3. Deploy Firebase Cloud Functions (see functions/ folder)
 * 
 * HOW MARKETPLACE PAYMENTS WORK:
 * ──────────────────────────────
 * Customer pays $55 for a job:
 *   → Stripe holds the full $55 (PaymentIntent)
 *   → Job gets completed by Pro
 *   → Stripe splits:
 *       - Pro receives: $46.75 (85%)
 *       - Mowblo keeps: $8.25 (15% platform fee)
 *   → Funds transfer to Pro's connected Stripe account
 * 
 * Pro Onboarding:
 *   → Pro signs up → Stripe Connect Express link generated
 *   → Pro fills out Stripe's identity/banking form
 *   → stripeConnectId saved to users/{userId}.stripeConnectId
 */

const PLATFORM_FEE_RATE = 0.15; // 15% platform fee

/**
 * Create a payment intent for a job posting.
 * This would normally call a Firebase Cloud Function.
 */
export async function createPaymentIntent(jobId: string, amount: number) {
    // TODO: Call Firebase function
    // const response = await fetch(CLOUD_FUNCTION_URL + '/createPaymentIntent', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ jobId, amount }),
    // });
    // return response.json();
    console.log(`[Stripe] Would create PaymentIntent for job ${jobId}: $${amount}`);
    return { clientSecret: 'placeholder', paymentIntentId: 'pi_placeholder' };
}

/**
 * Complete a job payout — transfers funds to the Pro's connected account.
 */
export async function completeJobPayout(jobId: string, proStripeId: string, amount: number) {
    const platformFee = Math.round(amount * PLATFORM_FEE_RATE * 100) / 100;
    const proEarnings = amount - platformFee;

    // TODO: Call Firebase function
    // const response = await fetch(CLOUD_FUNCTION_URL + '/completeJobPayout', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ jobId, proStripeId, amount, platformFee, proEarnings }),
    // });
    console.log(`[Stripe] Would payout: Pro gets $${proEarnings}, Platform keeps $${platformFee}`);
    return { proEarnings, platformFee };
}

/**
 * Generate a Stripe Connect Express onboarding link for a Pro.
 */
export async function getStripeOnboardingLink(userId: string) {
    // TODO: Call Firebase function
    // const response = await fetch(CLOUD_FUNCTION_URL + '/onboardProStripe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId }),
    // });
    console.log(`[Stripe] Would generate onboarding link for user ${userId}`);
    return { url: 'https://connect.stripe.com/express/onboarding/placeholder' };
}

export { PLATFORM_FEE_RATE };
