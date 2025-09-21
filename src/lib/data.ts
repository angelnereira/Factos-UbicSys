import { Client, Document, Analytics } from '@/lib/types';

export const clients: Client[] = [
  { id: 'CLI001', name: 'Innovate Corp', email: 'contact@innovatecorp.com', erpType: 'SAP', onboarded: '2023-01-15', status: 'Active' },
  { id: 'CLI002', name: 'Solutions Inc.', email: 'accounts@solutionsinc.com', erpType: 'Oracle', onboarded: '2023-02-20', status: 'Active' },
  { id: 'CLI003', name: 'Tech Giants LLC', email: 'billing@techgiants.com', erpType: 'Microsoft Dynamics', onboarded: '2023-03-10', status: 'Active' },
  { id: 'CLI004', name: 'Eco Goods', email: 'finance@ecogoods.com', erpType: 'Custom', onboarded: '2023-04-05', status: 'Inactive' },
  { id: 'CLI005', name: 'HealthFirst', email: 'invoices@healthfirst.com', erpType: 'SAP', onboarded: '2023-05-21', status: 'Active' },
];

export const documents: Document[] = [
  { id: 'INV001', client: 'Innovate Corp', clientId: 'CLI001', erpType: 'SAP', amount: 2500, currency: 'USD', date: '2023-10-01', status: 'Processed' },
  { id: 'INV002', client: 'Solutions Inc.', clientId: 'CLI002', erpType: 'Oracle', amount: 1500, currency: 'USD', date: '2023-10-02', status: 'Processed' },
  { id: 'INV003', client: 'Tech Giants LLC', clientId: 'CLI003', erpType: 'Microsoft Dynamics', amount: 3500, currency: 'USD', date: '2023-10-02', status: 'Error', errorDetails: 'Invalid VAT ID. The provided VAT ID `123456789` does not match the expected format for the country. It should be 2 letters followed by 9 digits.' },
  { id: 'INV004', client: 'Innovate Corp', clientId: 'CLI001', erpType: 'SAP', amount: 750, currency: 'USD', date: '2023-10-03', status: 'Pending' },
  { id: 'INV005', client: 'Eco Goods', clientId: 'CLI004', erpType: 'Custom', amount: 4500, currency: 'USD', date: '2023-10-04', status: 'Processed' },
  { id: 'INV006', client: 'HealthFirst', clientId: 'CLI005', erpType: 'SAP', amount: 1200, currency: 'USD', date: '2023-10-05', status: 'Pending' },
  { id: 'INV007', client: 'Solutions Inc.', clientId: 'CLI002', erpType: 'Oracle', amount: 800, currency: 'USD', date: '2023-10-05', status: 'Processed' },
  { id: 'INV008', client: 'Innovate Corp', clientId: 'CLI001', erpType: 'SAP', amount: 1800, currency: 'USD', date: '2023-10-06', status: 'Error', errorDetails: 'Missing required field: `purchaseOrderNumber`. The invoice must include a purchase order number for this client.' },
  { id: 'INV009', client: 'Tech Giants LLC', clientId: 'CLI003', erpType: 'Microsoft Dynamics', amount: 2200, currency: 'USD', date: '2023-10-07', status: 'Processed' },
  { id: 'INV010', client: 'HealthFirst', clientId: 'CLI005', erpType: 'SAP', amount: 3100, currency: 'USD', date: '2023-10-08', status: 'Pending' },
];

const processedCount = documents.filter(d => d.status === 'Processed').length;
const pendingCount = documents.filter(d => d.status === 'Pending').length;
const errorCount = documents.filter(d => d.status === 'Error').length;
const totalDocuments = documents.length;

export const analytics: Analytics = {
  totalDocuments: totalDocuments,
  pendingDocuments: pendingCount,
  errorRate: totalDocuments > 0 ? (errorCount / totalDocuments) * 100 : 0,
  documentsByStatus: [
    { name: 'Processed', value: processedCount, fill: 'var(--color-processed)' },
    { name: 'Pending', value: pendingCount, fill: 'var(--color-pending)' },
    { name: 'Error', value: errorCount, fill: 'var(--color-error)' },
  ],
  volumeLast6Months: [
    { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Oct', total: totalDocuments },
  ],
};
