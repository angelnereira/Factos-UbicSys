/**
 * @fileoverview Type definitions for The Factory HKA API.
 * This file contains the interfaces for the data structures
 * used when communicating with The Factory HKA services.
 */

/**
 * Represents the successful response from The Factory HKA authentication endpoint.
 */
export interface FactoryHkaAuthSuccess {
  token: string;
  exp: string; // Expiration date string, e.g., "2024-12-31 23:59:59"
  user: {
    id: number;
    username: string;
    // ... any other user properties returned
  };
}

/**
 * Represents an error response from The Factory HKA API.
 */
export interface FactoryHkaError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
