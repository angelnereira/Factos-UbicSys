import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    // Estas credenciales se deben configurar como variables de entorno en el servidor de despliegue.
    // Por ejemplo, en Vercel o Google Cloud Run.
    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

export const adminDb = admin.firestore();

// Esta es una simulación. En un sistema real, las API Keys se guardarían en Firestore
// y se validarían aquí.
const MOCK_API_KEYS: { [key: string]: string } = {
    "test-api-key-1": "comp-1",
    "test-api-key-2": "comp-2",
};

export async function validateApiKey(authHeader: string | null): Promise<{ companyId?: string; error?: string }> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Authorization header is missing or malformed.' };
    }
    const apiKey = authHeader.split(' ')[1];
    
    // Busca la clave en nuestra simulación
    const companyId = MOCK_API_KEYS[apiKey];
    
    if (!companyId) {
        return { error: 'Invalid API key.' };
    }
    
    return { companyId };
}
