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

/**
 * Validates an API key by querying the 'companies' collection.
 * @param authHeader - The Authorization header string (e.g., "Bearer your-api-key").
 * @returns An object with the companyId if valid, or an error string.
 */
export async function validateApiKey(authHeader: string | null): Promise<{ companyId?: string; error?: string }> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Authorization header is missing or malformed.' };
    }
    if (!adminDb) {
        return { error: 'Database connection is not available on the server.' };
    }

    const apiKey = authHeader.split(' ')[1];
    
    try {
        const companiesRef = adminDb.collection('companies');
        // Firestore doesn't support querying nested array objects directly in this manner.
        // A better data model would be a subcollection of apiKeys or a top-level collection.
        // For now, we fetch all and filter in memory. This is NOT scalable for many companies.
        const snapshot = await companiesRef.get();
        
        let foundCompanyId: string | null = null;

        snapshot.forEach(doc => {
            const company = doc.data() as Company;
            // Check if the company has apiKeys and if any key matches and is active
            if (company.apiKeys && Array.isArray(company.apiKeys)) {
                const keyExists = company.apiKeys.some(k => k.key === apiKey && k.status === 'active');
                if (keyExists) {
                    foundCompanyId = doc.id;
                }
            }
        });
        
        if (foundCompanyId) {
            return { companyId: foundCompanyId };
        } else {
            return { error: 'Invalid or inactive API key.' };
        }

    } catch (error) {
        console.error('Error validating API key:', error);
        return { error: 'An internal error occurred during API key validation.' };
    }
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
