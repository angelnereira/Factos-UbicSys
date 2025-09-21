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
};

export type Analytics = {
  totalDocuments: number;
  pendingDocuments: number;
  errorRate: number;
  documentsByStatus: Array<{ name: string; value: number; fill: string }>;
  volumeLast6Months: Array<{ name: string; total: number }>;
};
