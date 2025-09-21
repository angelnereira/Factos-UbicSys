import type { Timestamp } from 'firebase/firestore';

// Based on The Factory HKA integration document

// Companies Collection
export interface Company {
  id: string;
  name: string;
  taxId: string; // RUC
  email: string;
  phone?: string;
  address: string;
  authUid: string; // Firebase Auth User ID
  
  // The Factory HKA Credentials
  factoryHkaConfig: {
    username: string;
    password: string; // Encrypted
    licenseType: 'basic' | 'professional' | 'enterprise';
    maxDocumentsPerMonth: number;
    documentsUsedThisMonth: number;
    isActive: boolean;
  };
  
  // Integration Settings
  integrationConfig: {
    webhookUrl?: string;
    erpType: 'quickbooks' | 'sap' | 'custom' | 'api' | 'oracle' | 'microsoft-dynamics' | 'claris-filemaker';
    // apiCredentials?: EncryptedCredentials; // Assuming EncryptedCredentials would be defined elsewhere
    notificationSettings: {
      emailNotifications: boolean;
      webhookNotifications: boolean;
      smsNotifications: boolean;
    };
  };
  
  subscription: {
    plan: 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'suspended' | 'cancelled';
    billingEmail: string;
    nextBillingDate: Timestamp;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status?: 'Production' | 'Development' | 'Demo';
  onboarded?: string;
}

// Documents Collection (Sub-collection under each company)
export interface FiscalDocument {
  id: string;
  companyId: string;
  
  // Document Information
  documentType: 'factura' | 'nota_credito' | 'nota_debito' | 'factura_exportacion';
  documentNumber?: string; // Assigned by The Factory HKA
  cufe?: string; // Unique fiscal code from DGI
  
  // Processing Status
  status: 'pending' | 'processing' | 'sent_to_pac' | 'approved' | 'rejected' | 'cancelled';
  statusHistory: ProcessingStep[];
  
  // Original Data (from client ERP)
  originalData: {
    // customer: CustomerInfo; // Assuming CustomerInfo would be defined elsewhere
    // items: DocumentItem[]; // Assuming DocumentItem would be defined elsewhere
    // totals: DocumentTotals; // Assuming DocumentTotals would be defined elsewhere
    additionalInfo?: Record<string, unknown>;
  };
  
  // Transformed Data (sent to The Factory HKA)
  // transformedData?: FactoryHkaDocumentRequest; // Assuming FactoryHkaDocumentRequest would be defined elsewhere
  
  // Responses
  // factoryHkaResponse?: FactoryHkaResponse; // Assuming FactoryHkaResponse would be defined elsewhere
  // dgiResponse?: DgiResponse; // Assuming DgiResponse would be defined elsewhere
  
  // Generated Documents
  generatedDocuments?: {
    pdfUrl?: string;
    xmlUrl?: string;
    qrCode?: string;
  };
  
  // Error Information
  // errors?: ProcessingError[]; // Assuming ProcessingError would be defined elsewhere
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  processedAt?: Timestamp;
  // Properties from old Document type to keep UI working temporarily
  client: string;
  amount: number;
  currency: string;
  date: Date | Timestamp;
  errorDetails?: string;
  erpType: string;
}

// Processing Steps for Audit Trail
export interface ProcessingStep {
  step: 'received' | 'validated' | 'transformed' | 'sent_to_pac' | 'pac_response' | 'dgi_response';
  status: 'success' | 'error' | 'warning';
  message: string;
  timestamp: Timestamp;
  details?: Record<string, unknown>;
}


// --- Old types for reference, to be removed ---
export type Document = {
  id: string;
  client: string;
  clientId: string;
  erpType: string;
  amount: number;
  currency: string;
  date: string;
  status: 'Processed' | 'Pending' | 'Error';
  errorDetails?: string;
};

export type Client = {
  id:string;
  name: string;
  email: string;
  erpType: 'SAP' | 'Oracle' | 'Microsoft Dynamics' | 'Custom' | 'Claris FileMaker';
  onboarded: string;
  status: 'Production' | 'Development' | 'Demo';
  ruc?: string;
  contactNumber?: string;
  location?: string;
  authUid?: string;
};

export type Analytics = {
  totalDocuments: number;
  pendingDocuments: number;
  errorRate: number;
  documentsByStatus: Array<{ name: string; value: number; fill: string }>;
  volumeLast6Months: Array<{ name: string; total: number }>;
};
