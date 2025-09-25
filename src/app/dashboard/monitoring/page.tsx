
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FiscalDocument } from '@/lib/types';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { OverviewChart } from '../documents/_components/overview-chart';
import { Timestamp } from 'firebase/firestore';

const statusStyles: { [key in FiscalDocument['status']]: string } = {
  approved: 'text-chart-2 border-chart-2 bg-chart-2/10',
  pending: 'text-chart-4 border-chart-4 bg-chart-4/10',
  rejected: 'text-destructive border-destructive bg-destructive/10',
  processing: 'text-blue-500 border-blue-500 bg-blue-500/10',
  sent_to_pac: 'text-indigo-500 border-indigo-500 bg-indigo-500/10',
  cancelled: 'text-gray-500 border-gray-500 bg-gray-500/10',
};

// --- Static Data ---
const staticDocuments: FiscalDocument[] = [
  { id: 'doc-1', companyId: 'comp-1', client: 'Constructora del Istmo', amount: 1500.75, currency: 'USD', date: Timestamp.now(), erpType: 'sap', status: 'approved', createdAt: Timestamp.fromDate(new Date('2023-09-25T10:00:00Z')), documentType: 'factura', statusHistory: [] },
  { id: 'doc-2', companyId: 'comp-2', client: 'Logística Global', amount: 850.00, currency: 'USD', date: Timestamp.now(), erpType: 'oracle', status: 'pending', createdAt: Timestamp.fromDate(new Date('2023-09-25T11:30:00Z')), documentType: 'factura', statusHistory: [] },
  { id: 'doc-3', companyId: 'comp-1', client: 'Constructora del Istmo', amount: 250.00, currency: 'USD', date: Timestamp.now(), erpType: 'sap', status: 'rejected', createdAt: Timestamp.fromDate(new Date('2023-09-24T14:00:00Z')), documentType: 'factura', statusHistory: [] },
  { id: 'doc-4', companyId: 'comp-3', client: 'Café de las Cumbres', amount: 75.50, currency: 'USD', date: Timestamp.now(), erpType: 'custom', status: 'approved', createdAt: Timestamp.fromDate(new Date('2023-08-15T09:00:00Z')), documentType: 'factura', statusHistory: [] },
  { id: 'doc-5', companyId: 'comp-2', client: 'Logística Global', amount: 1200.00, currency: 'USD', date: Timestamp.now(), erpType: 'oracle', status: 'approved', createdAt: Timestamp.fromDate(new Date('2023-08-20T16:00:00Z')), documentType: 'factura', statusHistory: [] },
  { id: 'doc-6', companyId: 'comp-1', client: 'Constructora del Istmo', amount: 5000.00, currency: 'USD', date: Timestamp.now(), erpType: 'sap', status: 'pending', createdAt: Timestamp.fromDate(new Date('2023-07-05T12:00:00Z')), documentType: 'factura', statusHistory: [] },
  { id: 'doc-7', companyId: 'comp-3', client: 'Café de las Cumbres', amount: 150.25, currency: 'USD', date: Timestamp.now(), erpType: 'custom', status: 'rejected', createdAt: Timestamp.fromDate(new Date('2023-07-10T08:30:00Z')), documentType: 'factura', statusHistory: [] },
];


export default function MonitoringPage() {
  const documentMetrics = useMemo(() => {
    return {
      total: 1345,
      pending: 23,
      approved: 1280,
      rejected: 42,
    };
  }, []);

  const recentDocuments = useMemo(() => {
    return staticDocuments.slice(0, 5);
  }, []);

  return (
    <>
      <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Monitoreo de Actividad</h1>
             <p className="text-muted-foreground">
                Una visión general del estado y volumen de tus documentos.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Documentos Totales
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documentMetrics.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Aprobados
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documentMetrics.approved}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documentMetrics.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
                  <XCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documentMetrics.rejected}</div>
                </CardContent>
              </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                  <CardHeader>
                      <CardTitle>Visión General</CardTitle>
                      <CardDescription>Volumen de documentos procesados por mes.</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                      <OverviewChart documents={staticDocuments} />
                  </CardContent>
              </Card>
              <Card className="col-span-4 lg:col-span-3">
                  <CardHeader>
                      <CardTitle>Documentos Recientes</CardTitle>
                      <CardDescription>
                          Los últimos 5 documentos procesados.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                       <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Compañía</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead>Monto</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentDocuments.map(doc => (
                              <TableRow key={doc.id}>
                                <TableCell>
                                    <Link href={`/dashboard/documents/${doc.id}`} className="hover:underline">
                                        <div className="font-medium">{doc.client}</div>
                                        <div className="text-sm text-muted-foreground">ID: {doc.id.substring(0, 6)}...</div>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={cn('capitalize', statusStyles[doc.status])}
                                        variant="outline"
                                    >
                                        {doc.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: doc.currency,
                                    }).format(doc.amount)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                  </CardContent>
              </Card>
          </div>
      </div>
    </>
  );
}

    