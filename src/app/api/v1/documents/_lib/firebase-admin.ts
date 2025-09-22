import * as admin from 'firebase-admin';

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
    
    // Search for the key in our simulation
    const companyId = MOCK_API_KEYS[apiKey];
    
    if (!companyId) {
        return { error: 'Invalid API key.' };
    }
    
    return { companyId };
}
