

import type { FactoryHkaDocumentRequest } from './integrations/tfhka/tfhka-types';
import type { Timestamp } from 'firebase/firestore';


export type CompanyStatus = 'Production' | 'Development' | 'Demo';
export type ErpType = 'quickbooks' | 'sap' | 'custom' | 'api' | 'oracle' | 'microsoft-dynamics' | 'claris-filemaker';
export type SubscriptionPlan = 'basic' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'suspended' | 'cancelled';

export interface Company {
  id: string; // Supabase uses 'id' by default
  name: string;
  tax_id?: string;
  email: string;
  phone?: string;
  address?: string;
  auth_uid: string;
  erp_type: ErpType;
  status: CompanyStatus;
  
  // Timestamps from Supabase are ISO 8601 strings
  created_at: string; 
  updated_at: string; 

  // Fields from old type for compatibility, can be removed later
  companyId?: string; 
  createdAt?: string | Timestamp;
  erpType?: ErpType;
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
