/**
 * @fileoverview API Client for The Factory HKA.
 * This service encapsulates all communication with The Factory HKA's API,
 * handling authentication and data submission.
 */

import type { FactoryHkaAuthSuccess, FactoryHkaError } from './types';

// The base URL for The Factory HKA API, configured via environment variables.
const API_BASE_URL = process.env.NEXT_PUBLIC_THE_FACTORY_HKA_API_URL;

/**
 * Retrieves an authentication token from The Factory HKA API.
 * This token is required for all subsequent API requests.
 * 
 * @returns A promise that resolves with the authentication data or an error object.
 */
export async function getAuthToken(): Promise<{
  data: FactoryHkaAuthSuccess | null;
  error: string | null;
}> {
  const username = process.env.THE_FACTORY_HKA_USERNAME;
  const password = process.env.THE_FACTORY_HKA_PASSWORD;

  if (!API_BASE_URL) {
    return { data: null, error: 'The Factory HKA API URL is not configured.' };
  }
  if (!username || !password) {
    return { data: null, error: 'The Factory HKA credentials are not configured.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v2/login/autenticacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        Username: username,
        Password: password,
      }),
    });

    if (!response.ok) {
      const errorResponse: FactoryHkaError = await response.json();
      const errorMessage = `Failed to authenticate with The Factory HKA: ${errorResponse.message || response.statusText}`;
      console.error(errorMessage, errorResponse.errors);
      return { data: null, error: errorMessage };
    }

    const data: FactoryHkaAuthSuccess = await response.json();
    return { data, error: null };

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown network error occurred.';
    console.error('Error during authentication request:', errorMessage);
    return { data: null, error: `Network error: ${errorMessage}` };
  }
}

// Future functions for document processing will be added here, e.g.:
// export async function submitDocument(documentData: any, token: string) { ... }
