import type { Company } from './types';

export const mockCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'Juan Pérez',
    taxId: '12345678-1',
    email: 'juan.perez@example.com',
    phone: '555-0101',
    address: 'Ciudad de Panamá, Panamá',
    authUid: 'auth-uid-juan',
    factoryHkaConfig: {
      demo: {
        username: 'juan_demo',
        isActive: true,
        maxDocumentsPerMonth: 100,
        documentsUsedThisMonth: 12,
      },
      production: {
        username: 'juan_prod',
        isActive: false,
      },
    },
    integrationConfig: {
      erpType: 'sap',
      notificationSettings: {
        emailNotifications: true,
        webhookNotifications: false,
        smsNotifications: false,
      },
    },
    status: 'Development',
    onboarded: new Date('2023-01-15'),
    createdAt: new Date('2023-01-15') as any,
    updatedAt: new Date('2023-09-01') as any,
  },
  {
    id: 'comp-2',
    name: 'Jose Rodriguez',
    taxId: '87654321-2',
    email: 'jose.rodriguez@example.com',
    phone: '555-0102',
    address: 'Colón, Panamá',
    authUid: 'auth-uid-jose',
    factoryHkaConfig: {
      demo: {
        username: 'jose_demo',
        isActive: false,
        maxDocumentsPerMonth: 500,
        documentsUsedThisMonth: 0,
      },
      production: {
        username: 'jose_prod',
        isActive: true,
      },
    },
    integrationConfig: {
      erpType: 'oracle',
      notificationSettings: {
        emailNotifications: true,
        webhookNotifications: true,
        smsNotifications: false,
      },
    },
    status: 'Production',
    onboarded: new Date('2022-11-20'),
    createdAt: new Date('2022-11-20') as any,
    updatedAt: new Date('2023-08-15') as any,
  },
  {
    id: 'comp-3',
    name: 'Maria Gonzalez',
    taxId: '11223344-3',
    email: 'maria.gonzalez@example.com',
    phone: '555-0103',
    address: 'David, Chiriquí',
    authUid: 'auth-uid-maria',
    factoryHkaConfig: {
      demo: {
        username: 'maria_demo',
        isActive: true,
        maxDocumentsPerMonth: 1000,
        documentsUsedThisMonth: 250,
      },
      production: {
        username: 'maria_prod',
        isActive: false,
      },
    },
    integrationConfig: {
      erpType: 'custom',
      notificationSettings: {
        emailNotifications: true,
        webhookNotifications: false,
        smsNotifications: true,
      },
    },
    status: 'Demo',
    onboarded: new Date('2023-05-10'),
    createdAt: new Date('2023-05-10') as any,
    updatedAt: new Date('2023-09-10') as any,
  },
];

    