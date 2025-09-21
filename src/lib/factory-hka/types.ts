/**
 * @fileoverview Type definitions for The Factory HKA API.
 * This file contains the interfaces for the data structures
 * used when communicating with The Factory HKA services.
 */

/**
 * Represents the successful response from The Factory HKA authentication endpoint.
 */
export interface FactoryHkaAuthSuccess {
  codigo: string;
  mensaje: string;
  token: string;
  expiracion: string; // Expiration date string, e.g., "2025-09-22T15:26:55.2510335Z"
}

/**
 * Represents an error response from The Factory HKA API.
 */
export interface FactoryHkaError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
