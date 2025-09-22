
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { addDocument } from '@/lib/firebase/firestore';
import { FactoryHkaDocumentRequestSchema } from '@/lib/integrations/tfhka/tfhka-zod-schemas';
import { mapRequestToFiscalDocument } from '@/lib/document-mapper';
import { getCompanies } from '@/lib/firebase/firestore';

// Placeholder for API key validation
async function validateApiKey(apiKey: string | null): Promise<{ companyId: string | null; error: string | null }> {
    if (!apiKey) {
        return { companyId: null, error: 'Authorization header is missing.' };
    }
    
    const token = apiKey.replace('Bearer ', '');

    // In a real application, you would query your database to find the company
    // associated with this API key. For now, we'll simulate it by assigning
    // keys to mock companies or assuming a default company.
    
    // For demonstration, let's assume the key is the company's ID.
    // This is NOT secure and is for placeholder purposes only.
    const companies = await getCompanies(); // We use mock data here under the hood for now
    const company = companies.find(c => c.id === token);

    if (company) {
        return { companyId: company.id, error: null };
    }

    // A real implementation might look something like this:
    /*
    const q = query(collection(db, 'companies'), where('apiKey', '==', token));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return { companyId: null, error: 'Invalid API key.' };
    }
    const companyDoc = querySnapshot.docs[0];
    return { companyId: companyDoc.id, error: null };
    */
    
    // For now, if no direct match, return an error.
    return { companyId: null, error: 'Invalid API key.' };
}


export async function POST(request: Request) {
    // 1. Authenticate the request
    const authHeader = request.headers.get('Authorization');
    const { companyId, error: authError } = await validateApiKey(authHeader);

    if (authError) {
        return NextResponse.json({ success: false, message: authError }, { status: 401 });
    }
    if (!companyId) {
        return NextResponse.json({ success: false, message: 'Could not determine company from API key.' }, { status: 401 });
    }

    // 2. Validate the request body
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
        // 3. Map and save the document to Firestore with 'pending' status
        const documentToSave = mapRequestToFiscalDocument(validatedData, companyId);
        
        const { newDocument, error: dbError } = await addDocument(documentToSave);

        if (dbError) {
            console.error('[API] Error saving document to Firestore:', dbError);
            return NextResponse.json({ success: false, message: 'Failed to save document.' }, { status: 500 });
        }
        
        if (!newDocument) {
             return NextResponse.json({ success: false, message: 'Failed to create new document.' }, { status: 500 });
        }
        
        // 4. (Future step) Trigger an async background process (e.g., a Cloud Function)
        // to process the document (submit to HKA, etc.).
        // For now, we just return a success response.

        // 5. Respond with 202 Accepted
        return NextResponse.json(
            { 
                success: true, 
                message: 'Document accepted for processing.',
                documentId: newDocument.id,
            }, 
            { status: 202 }
        );

    } catch (error) {
        console.error('[API] Unexpected error in POST /api/v1/documents:', error);
        return NextResponse.json({ success: false, message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}
