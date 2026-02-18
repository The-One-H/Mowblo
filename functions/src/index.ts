import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// ============================================================
// STRIPE CONNECT - Marketplace Payment Functions
// ============================================================
// SETUP: Add your Stripe secret key to Firebase config:
// firebase functions:config:set stripe.secret="sk_test_..."
// firebase functions:config:set stripe.webhook_secret="whsec_..."

// const stripe = require('stripe')(functions.config().stripe?.secret);
const PLATFORM_FEE_RATE = 0.15;

/**
 * Create a PaymentIntent when a customer posts a job.
 * Holds the funds until the job is completed.
 */
export const createPaymentIntent = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

    const { jobId, amount } = data;

    // TODO: Uncomment when Stripe is configured
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // cents
    //   currency: 'cad',
    //   metadata: { jobId },
    //   capture_method: 'manual', // Hold, don't charge yet
    // });

    // await db.doc(`jobs/${jobId}`).update({
    //   paymentIntentId: paymentIntent.id,
    // });

    // return { clientSecret: paymentIntent.client_secret };
    return { clientSecret: 'placeholder', message: 'Stripe not configured yet' };
});

/**
 * Complete a job and transfer funds to the Pro's connected account.
 */
export const completeJobPayout = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

    const { jobId } = data;
    const jobDoc = await db.doc(`jobs/${jobId}`).get();
    if (!jobDoc.exists) throw new functions.https.HttpsError('not-found', 'Job not found');

    const job = jobDoc.data()!;
    const platformFee = Math.round(job.price * PLATFORM_FEE_RATE * 100) / 100;
    const proEarnings = job.price - platformFee;

    // TODO: Uncomment when Stripe is configured
    // Get Pro's Stripe connected account
    // const proDoc = await db.doc(`users/${job.proId}`).get();
    // const proStripeId = proDoc.data()?.stripeConnectId;
    //
    // if (proStripeId) {
    //   // Capture the held payment
    //   await stripe.paymentIntents.capture(job.paymentIntentId);
    //
    //   // Transfer to Pro
    //   await stripe.transfers.create({
    //     amount: Math.round(proEarnings * 100),
    //     currency: 'cad',
    //     destination: proStripeId,
    //     transfer_group: jobId,
    //   });
    // }

    // Update job with final amounts
    await db.doc(`jobs/${jobId}`).update({
        status: 'completed',
        platformFee,
        proEarnings,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { proEarnings, platformFee };
});

/**
 * Generate a Stripe Connect Express onboarding link for Pros.
 */
export const onboardProStripe = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

    const userId = context.auth.uid;

    // TODO: Uncomment when Stripe is configured
    // const account = await stripe.accounts.create({
    //   type: 'express',
    //   country: 'CA',
    //   capabilities: { transfers: { requested: true } },
    //   metadata: { userId },
    // });
    //
    // await db.doc(`users/${userId}`).update({
    //   stripeConnectId: account.id,
    // });
    //
    // const accountLink = await stripe.accountLinks.create({
    //   account: account.id,
    //   refresh_url: 'myapp://stripe-refresh',
    //   return_url: 'myapp://stripe-complete',
    //   type: 'account_onboarding',
    // });
    //
    // return { url: accountLink.url };
    return { url: 'https://stripe.com/placeholder', message: 'Stripe not configured yet' };
});

/**
 * Stripe webhook handler for payment events.
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
    // TODO: Uncomment when Stripe is configured
    // const sig = req.headers['stripe-signature'];
    // const endpointSecret = functions.config().stripe?.webhook_secret;
    //
    // try {
    //   const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    //
    //   switch (event.type) {
    //     case 'payment_intent.succeeded':
    //       // Payment captured successfully
    //       break;
    //     case 'account.updated':
    //       // Pro's Stripe account status changed
    //       break;
    //   }
    //
    //   res.json({ received: true });
    // } catch (err) {
    //   res.status(400).send(`Webhook Error: ${err.message}`);
    // }
    res.json({ received: true, message: 'Webhook placeholder' });
});

/**
 * Update Pro stats when a job is completed.
 */
export const onJobCompleted = functions.firestore
    .document('jobs/{jobId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        // Only run when status changes to 'completed'
        if (before.status !== 'completed' && after.status === 'completed' && after.proId) {
            const proRef = db.doc(`users/${after.proId}`);
            await proRef.update({
                'proProfile.jobsCompleted': admin.firestore.FieldValue.increment(1),
                'proProfile.tokens': admin.firestore.FieldValue.increment(10),
            });
        }
    });
