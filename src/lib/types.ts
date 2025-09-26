

import type { FactoryHkaDocumentRequest } from './integrations/tfhka/tfhka-types';
import type { Timestamp } from 'firebase/firestore';


export type CompanyStatus = 'Production' | 'Development' | 'Demo';
export type ErpType = 'quickbooks' | 'sap' | 'custom' | 'api' | 'oracle' | 'microsoft-dynamics' | 'claris-filemaker';

export interface Company {
  id: string; 
  name: string;
  taxId?: string;
  email: string;
  phone?: string;
  address?: string;
  authUid: string;
  
  status: CompanyStatus;
  
  // Timestamps
  createdAt: Timestamp; 
  updatedAt: Timestamp;
  onboarded: Timestamp;
  
  // Embedded configuration objects
  integrationConfig: {
    erpType: ErpType,
    notificationSettings: {
      emailNotifications: boolean;
      webhookNotifications: boolean;
      smsNotifications: boolean;
    }
  };
  factoryHkaConfig: {
    demo: {
      username: string;
      password?: string;
      isActive: boolean;
      maxDocumentsPerMonth: number;
      documentsUsedThisMonth: number;
    },
    production: {
      username: string;
      password?: string;
      isActive: boolean;
    }
  }
}


export type DocumentStatus = 'pending' | 'processing' | 'sent_to_pac' | 'approved' | 'rejected' | 'cancelled';
export type DocumentType = 'factura' | 'nota_credito' | 'nota_debito' | 'factura_exportacion';

export interface FiscalDocument {
  id: string; // id is from firestore
  companyId: string;
  
  documentType: DocumentType;
  cufe?: string;
  status: DocumentStatus;
  
  originalData?: any; // JSONB
  
  errorDetails?: string;
  
  // Timestamps
  createdAt: Timestamp; 
  updatedAt: Timestamp;
  processedAt?: Timestamp;

  // Properties for UI - will be populated by the mapper
  client: string;
  amount: number;
  currency: string;
  date: Date; 
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
  timestamp: Timestamp;
  details?: Record<string, unknown>;
}
