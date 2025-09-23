
import type { FactoryHkaDocumentRequest } from './integrations/tfhka/tfhka-types';

// Based on Data Connect Schema

export type CompanyStatus = 'Production' | 'Development' | 'Demo';
export type ErpType = 'quickbooks' | 'sap' | 'custom' | 'api' | 'oracle' | 'microsoft-dynamics' | 'claris-filemaker';
export type SubscriptionPlan = 'basic' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'suspended' | 'cancelled';

export interface Company {
  companyId: string;
  name: string;
  taxId?: string;
  email: string;
  phone?: string;
  address?: string;
  authUid: string;
  erpType: ErpType;
  status: CompanyStatus;
  
  // Timestamps
  createdAt: string; // ISO 8601 string date
  updatedAt: string; // ISO 8601 string date
}


export type DocumentStatus = 'pending' | 'processing' | 'sent_to_pac' | 'approved' | 'rejected' | 'cancelled';
export type DocumentType = 'factura' | 'nota_credito' | 'nota_debito' | 'factura_exportacion';

export interface FiscalDocument {
  documentId: string;
  companyId: string;
  
  documentType: DocumentType;
  cufe?: string;
  status: DocumentStatus;
  
  originalData?: any; // JSONB
  
  errorDetails?: string;
  
  // Timestamps
  createdAt: string; // ISO 8601 string date
  updatedAt: string; // ISO 8601 string date
  processedAt?: string;

  // Properties from old Document type to keep UI working temporarily
  client: string;
  amount: number;
  currency: string;
  date: string; // ISO 8601 string date
  erpType: string;

  // This will be mapped from originalData or another source
  statusHistory: ProcessingStep[];
}

export type ProcessingStepStatus = 'success' | 'error' | 'warning';
export type ProcessingStepName = 'received' | 'validated' | 'transformed' | 'sent_to_pac' | 'pac_response' | 'dgi_response';

// Processing Steps for Audit Trail
export interface ProcessingStep {
  step: ProcessingStepName;
  status: ProcessingStepStatus;
  message: string;
  timestamp: string; // ISO 8601 string date
  details?: Record<string, unknown>;
}
