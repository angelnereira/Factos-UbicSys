'use server';

/**
 * @fileOverview A flow that uses generative AI to explain the root cause of electronic document processing errors and suggest precise actions to correct them.
 *
 * - explainIntegrationError - A function that handles the explanation of integration errors.
 * - ExplainIntegrationErrorInput - The input type for the explainIntegrationError function.
 * - ExplainIntegrationErrorOutput - The return type for the explainIntegrationError function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainIntegrationErrorInputSchema = z.object({
  documentId: z.string().describe('The ID of the electronic document that has an error.'),
  clientId: z.string().describe('The ID of the client associated with the document.'),
  errorDetails: z.string().describe('Detailed information about the error that occurred during processing.'),
  erpType: z.string().describe('The type of ERP system the client is using (e.g., SAP, Oracle).'),
});
export type ExplainIntegrationErrorInput = z.infer<typeof ExplainIntegrationErrorInputSchema>;

const ExplainIntegrationErrorOutputSchema = z.object({
  rootCauseExplanation: z.string().describe('A detailed explanation of the root cause of the error.'),
  suggestedActions: z.string().describe('Specific actions the administrator should take to correct the error.'),
  relevantDocumentation: z.string().optional().describe('Links to relevant documentation or code snippets that can help resolve the issue.'),
});
export type ExplainIntegrationErrorOutput = z.infer<typeof ExplainIntegrationErrorOutputSchema>;

export async function explainIntegrationError(input: ExplainIntegrationErrorInput): Promise<ExplainIntegrationErrorOutput> {
  return explainIntegrationErrorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainIntegrationErrorPrompt',
  input: {schema: ExplainIntegrationErrorInputSchema},
  output: {schema: ExplainIntegrationErrorOutputSchema},
  prompt: `You are an expert in electronic document processing and ERP integration.

  Your task is to explain the root cause of errors that occur during the processing of electronic documents submitted by clients, and to suggest precise actions to correct them.

  Here are the details of the error:

  Document ID: {{{documentId}}}
  Client ID: {{{clientId}}}
  ERP Type: {{{erpType}}}
  Error Details: {{{errorDetails}}}

  Explain the root cause of this error and suggest specific actions the administrator should take to correct it. If possible, provide links to relevant documentation or code snippets.

  Response:
  `,
});

const explainIntegrationErrorFlow = ai.defineFlow(
  {
    name: 'explainIntegrationErrorFlow',
    inputSchema: ExplainIntegrationErrorInputSchema,
    outputSchema: ExplainIntegrationErrorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
