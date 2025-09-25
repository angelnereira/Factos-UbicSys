'use server';
/**
 * @fileOverview A Genkit flow to submit a fiscal document to The Factory HKA,
 * handle the response, and update its status in Firestore.
 *
 * - submitDocumentToHka - A function that orchestrates the document submission process.
 * - SubmitDocumentInput - The input type for the submitDocumentToHka function.
 * - SubmitDocumentOutput - The return type for the submitDocumentToHka function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuthToken, submitDocument } from '@/lib/factory-hka/api-client';
import type { FactoryHkaDocumentRequest } from '@/lib/factory-hka/types';
import type { Company, FiscalDocument } from '@/lib/types';
import { Timestamp, getDoc, doc, updateDoc, getFirestore } from 'firebase/firestore';


async function getDocumentById(companyId: string, documentId: string): Promise<FiscalDocument | null> {
    const db = getFirestore();
    try {
        if (!companyId || !documentId) {
            console.error("companyId and documentId must be provided.");
            return null;
        }
        const docRef = doc(db, "companies", companyId, "documents", documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as FiscalDocument;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document by ID: ", error);
        return null;
    }
}

async function updateDocumentInFlow(
  companyId: string,
  documentId: string,
  data: Partial<FiscalDocument>
): Promise<{ success: boolean; error?: any }> => {
  const db = getFirestore();
  if (!companyId || !documentId) {
    const error = new Error("companyId and documentId must be provided.");
    console.error(error);
    return { success: false, error };
  }
  try {
    const docRef = doc(db, 'companies', companyId, 'documents', documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error(`Error updating document ${documentId}:`, error);
    return { success: false, error };
  }
};


const SubmitDocumentInputSchema = z.object({
  documentId: z.string().describe('The ID of the fiscal document to submit.'),
  companyId: z.string().describe('The ID of the company associated with the document.'),
});
export type SubmitDocumentInput = z.infer<typeof SubmitDocumentInputSchema>;

const SubmitDocumentOutputSchema = z.object({
  success: z.boolean().describe('Whether the submission and update were successful.'),
  message: z.string().describe('A summary of the result.'),
  cufe: z.string().optional().describe('The CUFE returned by The Factory HKA on success.'),
});
export type SubmitDocumentOutput = z.infer<typeof SubmitDocumentOutputSchema>;

export async function submitDocumentToHka(input: SubmitDocumentInput): Promise<SubmitDocumentOutput> {
  return submitDocumentFlow(input);
}

const submitDocumentFlow = ai.defineFlow(
  {
    name: 'submitDocumentFlow',
    inputSchema: SubmitDocumentInputSchema,
    outputSchema: SubmitDocumentOutputSchema,
  },
  async ({ documentId, companyId }) => {
    const db = getFirestore();
    
    // 1. Fetch company to determine the environment
    const companyRef = doc(db, 'companies', companyId);
    const companySnap = await getDoc(companyRef);
    if (!companySnap.exists()) {
        throw new Error(`Company with ID ${companyId} not found.`);
    }
    const companyData = companySnap.data() as Company;
    const env = companyData.status;

    // 2. Fetch the document from Firestore
    const document = await getDocumentById(companyId, documentId);
    if (!document) {
      throw new Error(`Document with ID ${documentId} not found for company ${companyId}.`);
    }
    
    const initialStatusHistory = document.statusHistory || [];

    // 3. Add 'processing' to status history
    await updateDocumentInFlow(companyId, documentId, {
      status: 'processing',
      statusHistory: [
        ...initialStatusHistory,
        {
          step: 'sent_to_pac',
          status: 'warning',
          message: 'Iniciando el envío del documento al PAC.',
          timestamp: Timestamp.now(),
        },
      ],
    });

    // Refresh document state to get the latest statusHistory
    let currentDocument = await getDocumentById(companyId, documentId);
    if (!currentDocument) {
      // This should not happen, but as a safeguard.
      throw new Error(`Document with ID ${documentId} disappeared during processing.`);
    }

    // 4. Get auth token from HKA
    const authResponse = await getAuthToken(env);
    if (authResponse.error || !authResponse.data) {
        const authErrorMessage = `Error de autenticación con HKA: ${authResponse.error}`;
        await updateDocumentInFlow(companyId, documentId, {
            status: 'rejected',
            errorDetails: authErrorMessage,
            statusHistory: [
                ...currentDocument.statusHistory,
                { step: 'pac_response', status: 'error', message: authErrorMessage, timestamp: Timestamp.now() }
            ]
        });
        return { success: false, message: authErrorMessage };
    }
    const { token } = authResponse.data;

    // 5. Submit the document to HKA
    const submissionData = document.originalData as unknown as FactoryHkaDocumentRequest;

    const submitResponse = await submitDocument(submissionData, token, env);
    
    // Refresh document state again before final update
    currentDocument = await getDocumentById(companyId, documentId);
    if (!currentDocument) {
      throw new Error(`Document with ID ${documentId} disappeared before final update.`);
    }

    // 6. Handle the response and update Firestore
    if (submitResponse.error || !submitResponse.data) {
      const errorMessage = `Error al enviar documento a HKA: ${submitResponse.error}`;
      await updateDocumentInFlow(companyId, documentId, {
        status: 'rejected',
        errorDetails: errorMessage,
        statusHistory: [
          ...currentDocument.statusHistory,
          { step: 'pac_response', status: 'error', message: errorMessage, timestamp: Timestamp.now() }
        ]
      });
      return { success: false, message: errorMessage };
    }
    
    const { cufe, message } = submitResponse.data;
    await updateDocumentInFlow(companyId, documentId, {
      status: 'sent_to_pac',
      cufe: cufe,
      processedAt: Timestamp.now(),
      statusHistory: [
        ...currentDocument.statusHistory,
        { step: 'pac_response', status: 'success', message: `Documento enviado exitosamente a HKA. ${message}`, timestamp: Timestamp.now(), details: { cufe } }
      ]
    });

    return { success: true, message: 'Documento enviado y estado actualizado correctamente.', cufe };
  }
);
