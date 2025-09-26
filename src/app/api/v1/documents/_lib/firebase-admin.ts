import * as admin from 'firebase-admin';
import type { Company } from '@/lib/types';

if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            const serviceAccount = JSON.parse(
                process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
            );
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } catch (e) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON string.', e);
        }
    } else {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK initialization skipped.');
    }
}

export const adminDb = admin.apps.length ? admin.firestore() : null;

// This is a simulation. In a real system, API Keys would be stored in Firestore
// and validated here.
const MOCK_API_KEYS: { [key: string]: string } = {
    "test-api-key-1": "comp-1",
    "test-api-key-2": "comp-2",
};

export async function validateApiKey(authHeader: string | null): Promise<{ companyId?: string; error?: string }> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Authorization header is missing or malformed.' };
    }
    const apiKey = authHeader.split(' ')[1];
    
    // In a real app, you would query Firestore for a company with this apiKey.
    // For now, we simulate with a mock object.
    const companyId = MOCK_API_KEYS[apiKey];
    
    if (!companyId) {
        return { error: 'Invalid API key.' };
    }
    
    return { companyId };
}

/**
 * Fetches a company by its ID using the Firebase Admin SDK.
 * @param companyId - The ID of the company to fetch.
 * @returns The company data or null if not found.
 */
export async function getCompanyById_admin(companyId: string): Promise<Company | null> {
    if (!adminDb) {
        console.error("Admin SDK not initialized, cannot fetch company.");
        return null;
    }
    try {
        const docRef = adminDb.collection('companies').doc(companyId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return { id: docSnap.id, ...docSnap.data() } as Company;
        } else {
            console.log(`No company found with ID: ${companyId}`);
            return null;
        }
    } catch (error) {
        console.error(`Error getting company by ID (admin): ${companyId}`, error);
        return null;
    }
}
