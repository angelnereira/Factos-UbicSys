/**
 * @fileoverview API Client for The Factory HKA.
 * This service encapsulates all communication with The Factory HKA's API,
 * handling authentication and data submission.
 */

import type { FactoryHkaAuthSuccess, FactoryHkaDocumentRequest, FactoryHkaDocumentResponse, FactoryHkaError } from './types';

// The base URLs for The Factory HKA API, configured via environment variables.
const DEMO_API_URL = process.env.NEXT_PUBLIC_THE_FACTORY_HKA_DEMO_API_URL;
const PROD_API_URL = process.env.NEXT_PUBLIC_THE_FACTORY_HKA_PROD_API_URL;

type Environment = 'Production' | 'Development' | 'Demo';

function getApiConfig(env: Environment) {
  if (env === 'Production') {
    return {
      apiUrl: PROD_API_URL,
      username: process.env.THE_FACTORY_HKA_PROD_USERNAME,
      password: process.env.THE_FACTORY_HKA_PROD_PASSWORD,
    };
  }
  // Default to Demo for 'Development' and 'Demo'
  return {
    apiUrl: DEMO_API_URL,
    username: process.env.THE_FACTORY_HKA_DEMO_USERNAME,
    password: process.env.THE_FACTORY_HKA_DEMO_PASSWORD,
  };
}

/**
 * Retrieves an authentication token from The Factory HKA API.
 * This token is required for all subsequent API requests.
 * 
 * @returns A promise that resolves with the authentication data or an error object.
 */
export async function getAuthToken(env: Environment): Promise<{
  data: FactoryHkaAuthSuccess | null;
  error: string | null;
}> {
  const config = getApiConfig(env);

  if (!config.apiUrl) {
    return { data: null, error: `The Factory HKA API URL for ${env} is not configured.` };
  }
  if (!config.username || !config.password) {
    return { data: null, error: `The Factory HKA credentials for ${env} are not configured.` };
  }

  try {
    const response = await fetch(`${config.apiUrl}/api/v2/login/autenticacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        Username: config.username,
        Password: config.password,
      }),
    });

    if (!response.ok) {
      const errorResponse: FactoryHkaError = await response.json();
      const errorMessage = `Failed to authenticate with The Factory HKA (${env}): ${errorResponse.message || response.statusText}`;
      console.error(errorMessage, errorResponse.errors);
      return { data: null, error: errorMessage };
    }

    const data: FactoryHkaAuthSuccess = await response.json();
    return { data, error: null };

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
 * @param token - The authentication token obtained from getAuthToken.
 * @param env - The environment (Demo or Production) to target.
 * @returns A promise that resolves with the API response or an error object.
 */
export async function submitDocument(
    documentData: FactoryHkaDocumentRequest,
    token: string,
    env: Environment
): Promise<{ data: FactoryHkaDocumentResponse | null; error: string | null; }> {
    const config = getApiConfig(env);
    if (!config.apiUrl) {
        return { data: null, error: `The Factory HKA API URL for ${env} is not configured.` };
    }

    try {
        const response = await fetch(`${config.apiUrl}/api/Enviar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
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
