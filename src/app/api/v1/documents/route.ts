
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { FactoryHkaDocumentRequestSchema } from '@/lib/integrations/tfhka/tfhka-zod-schemas';
import { mapRequestToFiscalDocument } from '@/lib/document-mapper';
import { collection, getDocs, addDoc, query, where, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';


const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


// Initialize Firebase for server-side usage
if (!getApps().length) {
    initializeApp(firebaseConfig);
}
const db = getFirestore();


async function validateApiKey(apiKey: string | null): Promise<{ companyId: string | null; error: string | null }> {
    if (!apiKey) {
        return { companyId: null, error: 'Authorization header is missing.' };
    }
    
    const token = apiKey.replace('Bearer ', '');

    const q = query(collection(db, 'companies'), where('apiKey', '==', token));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return { companyId: null, error: 'Invalid API key.' };
    }
    
    const companyDoc = querySnapshot.docs[0];
    return { companyId: companyDoc.id, error: null };
}


export async function POST(request: Request) {
    
    const authHeader = request.headers.get('Authorization');
    const { companyId, error: authError } = await validateApiKey(authHeader);

    if (authError) {
        return NextResponse.json({ success: false, message: authError }, { status: 401 });
    }
    if (!companyId) {
        // This is a fallback, but validateApiKey should handle it.
        return NextResponse.json({ success: false, message: 'Could not determine company from API key.' }, { status: 401 });
    }
    
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
    }

    const validation = FactoryHkaDocumentRequestSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(
            { success: false, message: 'Invalid request body.', errors: validation.error.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    
    const validatedData = validation.data;

    try {
        const documentToSave = mapRequestToFiscalDocument(validatedData, companyId);
        
        const docRef = await addDoc(collection(db, "companies", companyId, "documents"), documentToSave);
        
        return NextResponse.json(
            { 
                success: true, 
                message: 'Document accepted for processing.',
                documentId: docRef.id,
            }, 
            { status: 202 }
        );

    } catch (error) {
        console.error('[API] Unexpected error in POST /api/v1/documents:', error);
        return NextResponse.json({ success: false, message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}
