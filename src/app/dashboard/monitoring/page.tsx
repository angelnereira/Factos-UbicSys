
'use client';

import { useMemo, useState } from 'react';
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
import { FileText, Clock, CheckCircle, XCircle, FileJson } from 'lucide-react';
import { OverviewChart } from '../documents/_components/overview-chart';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const statusStyles: { [key in FiscalDocument['status']]: string } = {
  approved: 'text-chart-2 border-chart-2 bg-chart-2/10',
  pending: 'text-chart-4 border-chart-4 bg-chart-4/10',
  rejected: 'text-destructive border-destructive bg-destructive/10',
  processing: 'text-blue-500 border-blue-500 bg-blue-500/10',
  sent_to_pac: 'text-indigo-500 border-indigo-500 bg-indigo-500/10',
  cancelled: 'text-gray-500 border-gray-500 bg-gray-500/10',
};

// --- Static Data ---
const staticDocuments: (FiscalDocument & { apiResponse?: any })[] = [
  { 
    id: 'doc-1', companyId: 'comp-1', client: 'Constructora del Istmo', amount: 1500.75, currency: 'USD', date: Timestamp.now(), erpType: 'sap', status: 'approved', createdAt: Timestamp.fromDate(new Date('2023-09-25T10:00:00Z')), documentType: 'factura', statusHistory: [], cufe: 'e1c2b3d4-a5f6-7890-1234-abcdef123456', processedAt: Timestamp.fromDate(new Date('2023-09-25T10:01:15Z')),
    originalData: { documento: { datosTransaccion: { tipoDocumento: '01' }, cliente: { razonSocial: 'Constructora del Istmo' } } },
    apiResponse: { Codigo: 200, Resultado: "Success", Mensaje: "Documento recibido y aprobado.", cufe: "e1c2b3d4-a5f6-7890-1234-abcdef123456" }
  },
  { 
    id: 'doc-2', companyId: 'comp-2', client: 'Logística Global', amount: 850.00, currency: 'USD', date: Timestamp.now(), erpType: 'oracle', status: 'pending', createdAt: Timestamp.fromDate(new Date('2023-09-25T11:30:00Z')), documentType: 'factura', statusHistory: [],
    originalData: { documento: { datosTransaccion: { tipoDocumento: '01' }, cliente: { razonSocial: 'Logística Global' } } },
  },
  { 
    id: 'doc-3', companyId: 'comp-1', client: 'Constructora del Istmo', amount: 250.00, currency: 'USD', date: Timestamp.now(), erpType: 'sap', status: 'rejected', createdAt: Timestamp.fromDate(new Date('2023-09-24T14:00:00Z')), documentType: 'factura', statusHistory: [], errorDetails: 'Error 500: El RUC del receptor no es válido.', processedAt: Timestamp.fromDate(new Date('2023-09-24T14:00:45Z')),
    originalData: { documento: { datosTransaccion: { tipoDocumento: '01' }, cliente: { razonSocial: 'Constructora del Istmo', numeroRUC: '123-INVALID' } } },
    apiResponse: { Codigo: 500, Resultado: "Error", Mensaje: "El RUC del receptor no es válido.", errors: { "documento.cliente.numeroRUC": "Formato inválido." } }
  },
  { 
    id: 'doc-4', companyId: 'comp-3', client: 'Café de las Cumbres', amount: 75.50, currency: 'USD', date: Timestamp.now(), erpType: 'custom', status: 'approved', createdAt: Timestamp.fromDate(new Date('2023-08-15T09:00:00Z')), documentType: 'factura', statusHistory: [], cufe: 'f6e5d4c3-b2a1-0987-6543-fedcba987654', processedAt: Timestamp.fromDate(new Date('2023-08-15T09:01:05Z')),
    originalData: { documento: { datosTransaccion: { tipoDocumento: '01' }, cliente: { razonSocial: 'Café de las Cumbres' } } },
    apiResponse: { Codigo: 200, Resultado: "Success", Mensaje: "Documento recibido y aprobado.", cufe: "f6e5d4c3-b2a1-0987-6543-fedcba987654" }
  },
  { 
    id: 'doc-5', companyId: 'comp-2', client: 'Logística Global', amount: 1200.00, currency: 'USD', date: Timestamp.now(), erpType: 'oracle', status: 'approved', createdAt: Timestamp.fromDate(new Date('2023-08-20T16:00:00Z')), documentType: 'factura', statusHistory: [], cufe: 'a1b2c3d4-e5f6-7890-fedc-ba9876543210', processedAt: Timestamp.fromDate(new Date('2023-08-20T16:01:20Z')),
    originalData: { documento: { datosTransaccion: { tipoDocumento: '01' }, cliente: { razonSocial: 'Logística Global' } } },
    apiResponse: { Codigo: 200, Resultado: "Success", Mensaje: "Documento recibido y aprobado.", cufe: "a1b2c3d4-e5f6-7890-fedc-ba9876543210" }
  },
  { id: 'doc-6', companyId: 'comp-1', client: 'Constructora del Istmo', amount: 5000.00, currency: 'USD', date: Timestamp.now(), erpType: 'sap', status: 'pending', createdAt: Timestamp.fromDate(new Date('2023-07-05T12:00:00Z')), documentType: 'factura', statusHistory: [] },
  { 
    id: 'doc-7', companyId: 'comp-3', client: 'Café de las Cumbres', amount: 150.25, currency: 'USD', date: Timestamp.now(), erpType: 'custom', status: 'rejected', createdAt: Timestamp.fromDate(new Date('2023-07-10T08:30:00Z')), documentType: 'factura', statusHistory: [], errorDetails: 'Error 401: El token de autenticación ha expirado.', processedAt: Timestamp.fromDate(new Date('2023-07-10T08:30:55Z')),
    originalData: { documento: { datosTransaccion: { tipoDocumento: '01' }, cliente: { razonSocial: 'Café de las Cumbres' } } },
    apiResponse: { Codigo: 401, Resultado: "Error", Mensaje: "Token de autenticación inválido o expirado." }
  },
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
  
  const getDateString = (date: Date | Timestamp | string | undefined) => {
    if (!date) return 'N/A';
    if (typeof date === 'string') return new Date(date).toLocaleString();
    if (date && 'seconds' in date) return new Date((date as Timestamp).seconds * 1000).toLocaleString();
    if (date instanceof Date) return date.toLocaleString();
    return 'N/A';
  };

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
          <div className="grid grid-cols-1 gap-4">
              <Card>
                  <CardHeader>
                      <CardTitle>Documentos Recientes</CardTitle>
                      <CardDescription>
                          Las últimas 5 transacciones enviadas a la API de HKA.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                       <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Compañía / Documento</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead>CUFE / Detalles</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentDocuments.map(doc => (
                              <TableRow key={doc.id}>
                                <TableCell>
                                    <Link href={`/dashboard/documents/${doc.id}`} className="hover:underline">
                                        <div className="font-medium">{doc.client}</div>
                                        <div className="text-sm text-muted-foreground font-mono">ID: {doc.id.substring(0, 8)}...</div>
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
                                    {doc.status === 'approved' && doc.cufe && (
                                      <div>
                                          <div className="font-medium font-mono text-xs">CUFE: {doc.cufe.substring(0,12)}...</div>
                                          <div className="text-sm text-muted-foreground">{getDateString(doc.processedAt)}</div>
                                      </div>
                                    )}
                                    {doc.status === 'rejected' && (
                                      <div>
                                          <div className="font-medium text-destructive text-xs truncate" title={doc.errorDetails}>{doc.errorDetails}</div>
                                          <div className="text-sm text-muted-foreground">{getDateString(doc.processedAt)}</div>
                                      </div>
                                    )}
                                    {doc.status === 'pending' && (
                                      <div>
                                          <div className="font-medium text-muted-foreground text-xs">Aún no procesado</div>
                                          <div className="text-sm text-muted-foreground">{getDateString(doc.createdAt)}</div>
                                      </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={!doc.originalData}>
                                                <FileJson className="h-4 w-4" />
                                                <span className="sr-only">Ver JSON</span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl">
                                            <DialogHeader>
                                                <DialogTitle>Detalles de la Transacción API</DialogTitle>
                                                <DialogDescription>
                                                    JSON enviado a The Factory HKA y la respuesta recibida.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div>
                                                    <h4 className="font-semibold mb-2">Payload Enviado (Request)</h4>
                                                    <pre className="mt-2 h-[200px] w-full overflow-auto rounded-md bg-muted p-4 text-xs">
                                                        <code>{JSON.stringify(doc.originalData, null, 2)}</code>
                                                    </pre>
                                                </div>
                                                 <div>
                                                    <h4 className="font-semibold mb-2">Respuesta de la API (Response)</h4>
                                                    <pre className="mt-2 h-[200px] w-full overflow-auto rounded-md bg-muted p-4 text-xs">
                                                        <code>{doc.apiResponse ? JSON.stringify(doc.apiResponse, null, 2) : 'No hay respuesta de la API para este estado.'}</code>
                                                    </pre>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle>Visión General</CardTitle>
                      <CardDescription>Volumen de documentos procesados por mes.</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                      <OverviewChart documents={staticDocuments} />
                  </CardContent>
              </Card>
          </div>
      </div>
    </>
  );
}

    