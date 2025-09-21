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
import { getDocumentById, updateDocument } from '@/lib/firebase/firestore';
import { getAuthToken, submitDocument } from '@/lib/factory-hka/api-client';
import type { FactoryHkaDocumentRequest } from '@/lib/factory-hka/types';
import type { Company, FiscalDocument } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

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
    // 1. Fetch the document from Firestore
    const document = await getDocumentById(companyId, documentId);
    if (!document) {
      throw new Error(`Document with ID ${documentId} not found for company ${companyId}.`);
    }

    // 2. Add 'processing' to status history
    await updateDocument(companyId, documentId, {
      status: 'processing',
      statusHistory: [
        ...document.statusHistory,
        {
          step: 'sent_to_pac',
          status: 'warning',
          message: 'Iniciando el envío del documento al PAC.',
          timestamp: Timestamp.now(),
        },
      ],
    });

    // 3. Get auth token from HKA
    const env = (document as any).status === 'Production' ? 'Production' : 'Demo';
    const authResponse = await getAuthToken(env);
    if (authResponse.error || !authResponse.data) {
        await updateDocument(companyId, documentId, {
            status: 'rejected',
            errorDetails: `Error de autenticación con HKA: ${authResponse.error}`,
            statusHistory: [
                ...document.statusHistory,
                { step: 'pac_response', status: 'error', message: `Error de autenticación: ${authResponse.error}`, timestamp: Timestamp.now() }
            ]
        });
        return { success: false, message: `Error de autenticación con HKA: ${authResponse.error}` };
    }
    const { token } = authResponse.data;

    // 4. Submit the document to HKA
    // The document.originalData should be transformed into the correct format here.
    // For now, we assume it's already in the correct format as a placeholder.
    const submissionData = document.originalData as unknown as FactoryHkaDocumentRequest;

    const submitResponse = await submitDocument(submissionData, token, env);

    // 5. Handle the response and update Firestore
    if (submitResponse.error || !submitResponse.data) {
      const errorMessage = `Error al enviar documento a HKA: ${submitResponse.error}`;
      await updateDocument(companyId, documentId, {
        status: 'rejected',
        errorDetails: errorMessage,
        statusHistory: [
          ...document.statusHistory,
          { step: 'pac_response', status: 'error', message: errorMessage, timestamp: Timestamp.now() }
        ]
      });
      return { success: false, message: errorMessage };
    }
    
    // If successful
    const { cufe, message } = submitResponse.data;
    await updateDocument(companyId, documentId, {
      status: 'sent_to_pac', // Or 'approved' if HKA gives final confirmation
      cufe: cufe,
      processedAt: Timestamp.now(),
      statusHistory: [
        ...document.statusHistory,
        { step: 'pac_response', status: 'success', message: `Documento enviado exitosamente a HKA. ${message}`, timestamp: Timestamp.now(), details: { cufe } }
      ]
    });

    return { success: true, message: 'Documento enviado y estado actualizado correctamente.', cufe };
  }
);
