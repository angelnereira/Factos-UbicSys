
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
import { z } from 'zod';
import { getAuthToken, submitDocument } from '@/lib/factory-hka/api-client';
import type { FactoryHkaDocumentRequest, CompanyCredentials } from '@/lib/factory-hka/types';
import type { Company, FiscalDocument } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';
import { getCompanyById_admin, adminDb } from '@/app/api/v1/documents/_lib/firebase-admin';


async function getDocumentById_admin(companyId: string, documentId: string): Promise<FiscalDocument | null> {
    if (!adminDb) {
        console.error("Admin SDK not initialized, cannot fetch document.");
        return null;
    }
    try {
        const docRef = adminDb.collection("companies").doc(companyId).collection("documents").doc(documentId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return { id: docSnap.id, ...docSnap.data() } as FiscalDocument;
        } else {
            console.log(`No document found with ID: ${documentId} in company ${companyId}`);
            return null;
        }
    } catch (error) {
        console.error("Error getting document by ID (admin): ", error);
        return null;
    }
}

async function updateDocumentInFlow_admin(
  companyId: string,
  documentId: string,
  data: Partial<FiscalDocument>
): Promise<{ success: boolean; error?: any }> => {
  if (!adminDb) {
    const error = new Error("Admin SDK not initialized, cannot update document.");
    console.error(error);
    return { success: false, error };
  }
  try {
    const docRef = adminDb.collection('companies').doc(companyId).collection('documents').doc(documentId);
    await docRef.update({
      ...data,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error(`Error updating document ${documentId} (admin):`, error);
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
    
    // 1. Fetch company to get environment and credentials
    const companyData = await getCompanyById_admin(companyId);

    if (!companyData) {
        throw new Error(`Company with ID ${companyId} not found.`);
    }
    const env = companyData.status; // 'Demo' or 'Production'
    
    const hkaConfig = env === 'Production' ? companyData.factoryHkaConfig.production : companyData.factoryHkaConfig.demo;
    
    const credentials: CompanyCredentials = {
        nit: hkaConfig.username,
        token: hkaConfig.password!, 
    };

    if (!credentials.nit || !credentials.token) {
        throw new Error(`Credentials for ${env} environment are not configured for company ${companyId}.`);
    }

    // 2. Fetch the document from Firestore using Admin SDK
    const document = await getDocumentById_admin(companyId, documentId);
    if (!document) {
      throw new Error(`Document with ID ${documentId} not found for company ${companyId}.`);
    }
    
    const initialStatusHistory = document.statusHistory || [];

    // 3. Add 'processing' to status history
    await updateDocumentInFlow_admin(companyId, documentId, {
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
    let currentDocument = await getDocumentById_admin(companyId, documentId);
    if (!currentDocument) {
      throw new Error(`Document with ID ${documentId} disappeared during processing.`);
    }

    // 4. Get auth token from HKA using company-specific credentials
    const authResponse = await getAuthToken(credentials, env);
    if (authResponse.error || !authResponse.data) {
        const authErrorMessage = `Error de autenticación con HKA: ${authResponse.error}`;
        await updateDocumentInFlow_admin(companyId, documentId, {
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
    currentDocument = await getDocumentById_admin(companyId, documentId);
    if (!currentDocument) {
      throw new Error(`Document with ID ${documentId} disappeared before final update.`);
    }

    // 6. Handle the response and update Firestore
    if (submitResponse.error || !submitResponse.data) {
      const errorMessage = `Error al enviar documento a HKA: ${submitResponse.error}`;
      await updateDocumentInFlow_admin(companyId, documentId, {
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
    await updateDocumentInFlow_admin(companyId, documentId, {
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
