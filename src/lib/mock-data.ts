import type { Company } from './types';

export const mockCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'Constructora del Istmo, S.A.',
    taxId: '12345678-1-2023',
    email: 'contacto@constructoradistmo.com',
    phone: '555-0101',
    address: 'Ciudad de Panamá, Panamá',
    authUid: 'auth-uid-istmo',
    factoryHkaConfig: {
      demo: {
        username: 'istmo_demo',
        isActive: true,
        maxDocumentsPerMonth: 500,
        documentsUsedThisMonth: 120,
      },
      production: {
        username: 'istmo_prod',
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
    name: 'Logística Global de Carga',
    taxId: '87654321-2-2022',
    email: 'operaciones@logisticaglobal.pa',
    phone: '555-0102',
    address: 'Colón, Panamá',
    authUid: 'auth-uid-logistica',
    factoryHkaConfig: {
      demo: {
        username: 'logistica_demo',
        isActive: false,
        maxDocumentsPerMonth: 2000,
        documentsUsedThisMonth: 0,
      },
      production: {
        username: 'logistica_prod',
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
    name: 'Café de las Cumbres, S.A.',
    taxId: '11223344-3-2021',
    email: 'ventas@cafecumbres.com',
    phone: '555-0103',
    address: 'David, Chiriquí',
    authUid: 'auth-uid-cafe',
    factoryHkaConfig: {
      demo: {
        username: 'cafe_demo',
        isActive: true,
        maxDocumentsPerMonth: 1000,
        documentsUsedThisMonth: 250,
      },
      production: {
        username: 'cafe_prod',
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
