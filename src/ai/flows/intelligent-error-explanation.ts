'use server';

/**
 * @fileOverview A flow that uses generative AI to explain the root cause of electronic document processing errors and suggest precise actions to correct them, including tool usage for specific documentation or code snippets.
 *
 * - intelligentErrorExplanation - A function that handles the intelligent explanation of integration errors.
 * - IntelligentErrorExplanationInput - The input type for the intelligentErrorExplanation function.
 * - IntelligentErrorExplanationOutput - The return type for the intelligentErrorExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentErrorExplanationInputSchema = z.object({
  documentId: z.string().describe('The ID of the electronic document that has an error.'),
  clientId: z.string().describe('The ID of the client associated with the document.'),
  errorDetails: z.string().describe('Detailed information about the error that occurred during processing.'),
  erpType: z.string().describe('The type of ERP system the client is using (e.g., SAP, Oracle).'),
});
export type IntelligentErrorExplanationInput = z.infer<typeof IntelligentErrorExplanationInputSchema>;

const IntelligentErrorExplanationOutputSchema = z.object({
  rootCauseExplanation: z.string().describe('A detailed explanation of the root cause of the error.'),
  suggestedActions: z.string().describe('Specific actions the administrator should take to correct the error.'),
  relevantDocumentation: z.string().optional().describe('Links to relevant documentation that can help resolve the issue.'),
  relevantCodeSnippet: z.string().optional().describe('A relevant code snippet that can help resolve the issue.'),
});
export type IntelligentErrorExplanationOutput = z.infer<typeof IntelligentErrorExplanationOutputSchema>;

const getRelevantDocumentation = ai.defineTool(
  {
    name: 'getRelevantDocumentation',
    description: 'Retrieves documentation relevant to the specified error and ERP type.',
    inputSchema: z.object({
      erpType: z.string().describe('The type of ERP system (e.g., SAP, Oracle).'),
      errorDetails: z.string().describe('Detailed information about the error.'),
    }),
    outputSchema: z.string().describe('Link to relevant documentation.'),
  },
  async (input) => {
    // Placeholder implementation: Replace with actual documentation retrieval logic
    return `https://example.com/docs/${input.erpType}/${input.errorDetails.substring(0, 20).replace(/\s+/g, '-')}`;
  }
);

const getRelevantCodeSnippet = ai.defineTool(
  {
    name: 'getRelevantCodeSnippet',
    description: 'Retrieves a code snippet relevant to the specified error and ERP type.',
    inputSchema: z.object({
      erpType: z.string().describe('The type of ERP system (e.g., SAP, Oracle).'),
      errorDetails: z.string().describe('Detailed information about the error.'),
    }),
    outputSchema: z.string().describe('A relevant code snippet.'),
  },
  async (input) => {
    // Placeholder implementation: Replace with actual code snippet retrieval logic
    return `// Example code snippet for ${input.erpType}: ${input.errorDetails.substring(0, 20)}`
  }
);

export async function intelligentErrorExplanation(input: IntelligentErrorExplanationInput): Promise<IntelligentErrorExplanationOutput> {
  return intelligentErrorExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentErrorExplanationPrompt',
  input: {schema: IntelligentErrorExplanationInputSchema},
  output: {schema: IntelligentErrorExplanationOutputSchema},
  tools: [getRelevantDocumentation, getRelevantCodeSnippet],
  prompt: `You are an expert in electronic document processing and ERP integration.

  Your task is to explain the root cause of errors that occur during the processing of electronic documents submitted by clients, and to suggest precise actions to correct them. You can use tools to retrieve documentation and code snippets.

  Here are the details of the error:

  Document ID: {{{documentId}}}
  Client ID: {{{clientId}}}
  ERP Type: {{{erpType}}}
  Error Details: {{{errorDetails}}}

  Explain the root cause of this error and suggest specific actions the administrator should take to correct it. Use the available tools to provide relevant documentation and code snippets if applicable.

  Response:
  `,
});

const intelligentErrorExplanationFlow = ai.defineFlow(
  {
    name: 'intelligentErrorExplanationFlow',
    inputSchema: IntelligentErrorExplanationInputSchema,
    outputSchema: IntelligentErrorExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
