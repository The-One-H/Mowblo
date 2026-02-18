import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { signInWithCustomToken } from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    addDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

// ============================================================
// Firebase Auth Bridge (Clerk → Firebase)
// ============================================================

export function useFirebaseAuth() {
    const { getToken, userId, isSignedIn } = useAuth();
    const [synced, setSynced] = useState(false);

    useEffect(() => {
        if (!isSignedIn || !userId) {
            setSynced(false);
            return;
        }

        const syncAuth = async () => {
            try {
                const token = await getToken({ template: 'integration_firebase' });
                if (token) {
                    await signInWithCustomToken(auth, token);
                    setSynced(true);
                }
            } catch (err) {
                console.warn('Firebase auth sync failed:', err);
            }
        };

        syncAuth();
    }, [isSignedIn, userId]);

    return { synced, userId };
}

// ============================================================
// User Profile
// ============================================================

export interface UserProfile {
    role: 'customer' | 'pro';
    name: string;
    email: string;
    avatarUrl?: string;
    onboardingComplete: boolean;
    proProfile?: {
        rating: number;
        jobsCompleted: number;
        tokens: number;
        level: number;
        equipment: string[];
        serviceArea?: string;
    };
    stripeCustomerId?: string;
    stripeConnectId?: string;
    createdAt: any;
}

export function useUserProfile() {
    const { userId } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setProfile(null);
            setLoading(false);
            return;
        }

        const unsub = onSnapshot(doc(db, 'users', userId), (snap) => {
            if (snap.exists()) {
                setProfile(snap.data() as UserProfile);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return unsub;
    }, [userId]);

    const createProfile = useCallback(
        async (data: Partial<UserProfile>) => {
            if (!userId) return;
            await setDoc(doc(db, 'users', userId), {
                ...data,
                onboardingComplete: false,
                createdAt: serverTimestamp(),
            }, { merge: true });
        },
        [userId]
    );

    const updateProfile = useCallback(
        async (data: Partial<UserProfile>) => {
            if (!userId) return;
            await setDoc(doc(db, 'users', userId), data, { merge: true });
        },
        [userId]
    );

    return { profile, loading, createProfile, updateProfile };
}

// ============================================================
// Jobs
// ============================================================

export type JobStatus = 'posted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
    id?: string;
    customerId: string;
    proId?: string;
    type: 'lawn' | 'snow';
    status: JobStatus;
    title: string;
    location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    schedule: {
        date: string;
        startTime: string;
        endTime: string;
        frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    };
    tasks: { label: string; completed: boolean }[];
    addons: string[];
    toolsProvided: string[];
    photos: string[];
    instructions: string;
    price: number;
    platformFee: number;
    proEarnings: number;
    paymentIntentId?: string;
    createdAt: any;
    updatedAt: any;
}

/**
 * Real-time listener for jobs filtered by role and status.
 */
export function useJobs(
    role: 'customer' | 'pro',
    userId: string | null | undefined,
    statusFilter?: JobStatus[]
) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setJobs([]);
            setLoading(false);
            return;
        }

        const field = role === 'customer' ? 'customerId' : 'proId';
        const constraints = [
            where(field, '==', userId),
            orderBy('createdAt', 'desc'),
        ];

        const q = query(collection(db, 'jobs'), ...constraints);

        const unsub = onSnapshot(q, (snap) => {
            const results: Job[] = [];
            snap.forEach((doc) => {
                const data = doc.data() as Job;
                data.id = doc.id;
                if (!statusFilter || statusFilter.includes(data.status)) {
                    results.push(data);
                }
            });
            setJobs(results);
            setLoading(false);
        });

        return unsub;
    }, [userId, role, statusFilter?.join(',')]);

    return { jobs, loading };
}

/**
 * All available (posted) jobs for Pros to browse.
 */
export function useAvailableJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'jobs'),
            where('status', '==', 'posted'),
            orderBy('createdAt', 'desc')
        );

        const unsub = onSnapshot(q, (snap) => {
            const results: Job[] = [];
            snap.forEach((doc) => {
                const data = doc.data() as Job;
                data.id = doc.id;
                results.push(data);
            });
            setJobs(results);
            setLoading(false);
        });

        return unsub;
    }, []);

    return { jobs, loading };
}

/**
 * Create a new job posting.
 */
export async function createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) {
    const PLATFORM_FEE_RATE = 0.15;
    const platformFee = Math.round(jobData.price * PLATFORM_FEE_RATE * 100) / 100;
    const proEarnings = jobData.price - platformFee;

    return addDoc(collection(db, 'jobs'), {
        ...jobData,
        platformFee,
        proEarnings,
        status: 'posted',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

/**
 * Update job status (e.g. accept, start, complete).
 */
export async function updateJobStatus(jobId: string, status: JobStatus, extraData?: Record<string, any>) {
    return updateDoc(doc(db, 'jobs', jobId), {
        status,
        ...extraData,
        updatedAt: serverTimestamp(),
    });
}

// ============================================================
// Reviews
// ============================================================

export interface Review {
    id?: string;
    jobId: string;
    fromUserId: string;
    toUserId: string;
    rating: number;
    comment: string;
    createdAt: any;
}

export function useReviews(userId: string | null | undefined) {
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        if (!userId) return;

        const q = query(
            collection(db, 'reviews'),
            where('toUserId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const unsub = onSnapshot(q, (snap) => {
            const results: Review[] = [];
            snap.forEach((doc) => {
                const data = doc.data() as Review;
                data.id = doc.id;
                results.push(data);
            });
            setReviews(results);
        });

        return unsub;
    }, [userId]);

    return { reviews };
}

export async function createReview(review: Omit<Review, 'id' | 'createdAt'>) {
    return addDoc(collection(db, 'reviews'), {
        ...review,
        createdAt: serverTimestamp(),
    });
}
