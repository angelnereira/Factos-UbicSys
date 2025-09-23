
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { FactoryHkaDocumentRequestSchema } from '@/lib/integrations/tfhka/tfhka-zod-schemas';
import { mapRequestToFiscalDocument } from '@/lib/document-mapper';
import { validateApiKey, adminDb } from './_lib/firebase-admin';

export async function POST(request: Request) {
    // Check for Admin SDK initialization first.
    if (!adminDb) {
        console.error('[API] Firebase Admin SDK is not initialized. This is expected in a local environment without service account keys. The API will not work until deployed.');
        return NextResponse.json({ success: false, message: 'Server is not configured to connect to the database. This is a server-side configuration issue.' }, { status: 500 });
    }

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
        
        const docRef = await adminDb.collection("companies").doc(companyId).collection("documents").add(documentToSave);
        
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
