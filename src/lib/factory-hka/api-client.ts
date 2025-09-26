
/**
 * @fileoverview API Client for The Factory HKA.
 * This service encapsulates all communication with The Factory HKA's API,
 * handling authentication and data submission.
 */

import type { FactoryHkaAuthSuccess, FactoryHkaDocumentRequest, FactoryHkaDocumentResponse, FactoryHkaError, CompanyCredentials } from './types';

// The base URLs for The Factory HKA API.
const DEMO_API_URL = process.env.NEXT_PUBLIC_THE_FACTORY_HKA_API_URL;
const PROD_API_URL = process.env.NEXT_PUBLIC_THE_FACTORY_HKA_PROD_API_URL;

type Environment = 'Production' | 'Development' | 'Demo';

function getApiUrl(env: Environment): string | undefined {
  if (env === 'Production') {
    return PROD_API_URL;
  }
  // Default to Demo for 'Development' and 'Demo'
  return DEMO_API_URL;
}

/**
 * Retrieves an authentication token from The Factory HKA API using company-specific credentials.
 * 
 * @param credentials - The company's credentials (nit and token).
 * @param env - The environment (Demo or Production) to target.
 * @returns A promise that resolves with the authentication data or an error object.
 */
export async function getAuthToken(
  credentials: CompanyCredentials,
  env: Environment
): Promise<{ data: FactoryHkaAuthSuccess | null; error: string | null; }> {
  const apiUrl = getApiUrl(env);

  if (!apiUrl) {
    const errorMsg = `The Factory HKA API URL for ${env} environment is not configured in environment variables (NEXT_PUBLIC_THE_FACTORY_HKA_..._API_URL).`;
    console.warn(errorMsg);
    return { data: null, error: errorMsg };
  }
  if (!credentials.nit || !credentials.token) {
    const errorMsg = `The Factory HKA credentials (nit, token) for ${env} environment were not provided.`;
    console.error(errorMsg);
    return { data: null, error: errorMsg };
  }

  try {
    const response = await fetch(`${apiUrl}/ConsultarEmpresa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        Nit: credentials.nit,
        TokenEmpresa: credentials.token,
        TokenClave: credentials.token, // Per docs, seems to be the same.
        Plataforma: 'TFHKA'
      }),
    });

    if (!response.ok) {
      const errorResponse: FactoryHkaError = await response.json();
      const errorMessage = `Failed to authenticate with The Factory HKA (${env}): ${errorResponse.message || response.statusText}`;
      console.error(errorMessage, errorResponse.errors);
      return { data: null, error: errorMessage };
    }

    const data: FactoryHkaAuthSuccess = await response.json();
    
    if (data.Codigo === 200 && data.Resultado === 'Success') {
         // The token for subsequent calls is the one from the credentials, not from the response.
         return { data: { ...data, token: credentials.token }, error: null };
    }
    
    return { data: null, error: `Authentication failed: ${data.Mensaje}` };

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown network error occurred.';
    console.error(`Error during authentication request (${env}):`, errorMessage);
    return { data: null, error: `Network error: ${errorMessage}` };
  }
}

/**
 * Submits a fiscal document to The Factory HKA API.
 * 
 * @param documentData - The document data to be sent.
 * @param token - The authentication token (company password/token).
 * @param env - The environment (Demo or Production) to target.
 * @returns A promise that resolves with the API response or an error object.
 */
export async function submitDocument(
    documentData: FactoryHkaDocumentRequest,
    token: string,
    env: Environment
): Promise<{ data: FactoryHkaDocumentResponse | null; error: string | null; }> {
    const apiUrl = getApiUrl(env);
    if (!apiUrl) {
        return { data: null, error: `The Factory HKA API URL for ${env} is not configured.` };
    }

    try {
        const response = await fetch(`${apiUrl}/CrearFactura`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'TokenEmpresa': token,
                'TokenClave': token,
            },
            body: JSON.stringify(documentData),
        });

        if (!response.ok) {
            const errorResponse: FactoryHkaError = await response.json();
            const errorMessage = `Failed to submit document to The Factory HKA (${env}): ${errorResponse.message || response.statusText}`;
            console.error(errorMessage, errorResponse.errors);
            return { data: null, error: errorMessage };
        }

        const data: FactoryHkaDocumentResponse = await response.json();
        return { data, error: null };

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown network error occurred.';
        console.error(`Error during document submission (${env}):`, errorMessage);
        return { data: null, error: `Network error: ${errorMessage}` };
    }
}

/**
 * Downloads documents from The Factory HKA based on a date range.
 * 
 * @param criteria - The download criteria, including date range.
 * @param token - The authentication token.
 * @param env - The environment (Demo or Production).
 * @returns A promise that resolves with the file blob or an error object.
 */
export async function downloadDocumentsByDate(
    criteria: { FechaDesde: string; FechaHasta: string },
    token: string,
    env: Environment
): Promise<{ data: Blob | null; error: string | null; }> {
    const apiUrl = getApiUrl(env);
    if (!apiUrl) {
        return { data: null, error: `The Factory HKA API URL for ${env} is not configured.` };
    }

    try {
        const response = await fetch(`${apiUrl}/DescargarDocumentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, application/zip',
                'TokenEmpresa': token,
                'TokenClave': token,
            },
            body: JSON.stringify(criteria),
        });

        if (!response.ok) {
            const errorResponse: FactoryHkaError = await response.json();
            const errorMessage = `Failed to download documents from HKA (${env}): ${errorResponse.message || response.statusText}`;
            console.error(errorMessage, errorResponse.errors);
            return { data: null, error: errorMessage };
        }

        // The response should be a zip file
        const blob = await response.blob();
        if (blob.type !== 'application/zip') {
             return { data: null, error: `La API no devolvió un archivo ZIP. Tipo de contenido recibido: ${blob.type}` };
        }
        
        return { data: blob, error: null };

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown network error occurred.';
        console.error(`Error during document download (${env}):`, errorMessage);
        return { data: null, error: `Network error: ${errorMessage}` };
    }
}
