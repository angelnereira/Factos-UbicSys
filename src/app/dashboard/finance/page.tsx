
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Loader2, DollarSign, Landmark, Receipt, FileText } from 'lucide-react';
import { getAllDocuments } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import type { Timestamp } from 'firebase/firestore';

const statusStyles: { [key in FiscalDocument['status']]: string } = {
  approved: 'text-chart-2 border-chart-2 bg-chart-2/10',
  pending: 'text-chart-4 border-chart-4 bg-chart-4/10',
  rejected: 'text-destructive border-destructive bg-destructive/10',
  processing: 'text-blue-500 border-blue-500 bg-blue-500/10',
  sent_to_pac: 'text-indigo-500 border-indigo-500 bg-indigo-500/10',
  cancelled: 'text-gray-500 border-gray-500 bg-gray-500/10',
};

// Helper function to extract ITBMS from originalData if available
const getItbmsFromDocument = (doc: FiscalDocument): number => {
    if (doc.originalData && doc.originalData.documento && doc.originalData.documento.totalesSubTotales) {
        const itbms = parseFloat(doc.originalData.documento.totalesSubTotales.totalITBMS);
        return isNaN(itbms) ? 0 : itbms;
    }
    // Fallback or simple calculation if not present
    return doc.amount * 0.07; // Assuming a 7% rate as a fallback
};

export default function FinancePage() {
  const { db } = useAuth();
  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!db) return;
      setIsLoading(true);
      const fetchedDocuments = await getAllDocuments(db);
      setDocuments(fetchedDocuments);
      setIsLoading(false);
    }
    fetchData();
  }, [db]);

  const financialMetrics = useMemo(() => {
    const approvedDocs = documents.filter(d => d.status === 'approved');
    const totalBilled = approvedDocs.reduce((sum, doc) => sum + doc.amount, 0);
    const totalItbms = approvedDocs.reduce((sum, doc) => sum + getItbmsFromDocument(doc), 0);
    
    return {
      totalBilled: totalBilled,
      totalItbms: totalItbms,
      totalTransactions: documents.length,
      averageInvoiceValue: approvedDocs.length > 0 ? totalBilled / approvedDocs.length : 0,
    };
  }, [documents]);

  const getDateFromTimestamp = (date: Date | Timestamp) => {
      if (date && 'seconds' in date) {
        return new Date((date as Timestamp).seconds * 1000);
      }
      return date as Date;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Finanzas</h1>
                <p className="text-muted-foreground">
                    Un resumen financiero de todos los documentos fiscales procesados.
                </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Facturado (Aprobado)
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financialMetrics.totalBilled)}</div>
                  <p className="text-xs text-muted-foreground">
                    Suma de todos los documentos aprobados.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Impuestos (ITBMS)
                  </CardTitle>
                  <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financialMetrics.totalItbms)}</div>
                   <p className="text-xs text-muted-foreground">
                    Suma de ITBMS de documentos aprobados.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Promedio Factura</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financialMetrics.averageInvoiceValue)}</div>
                   <p className="text-xs text-muted-foreground">
                    Basado en documentos aprobados.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transacciones</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{financialMetrics.totalTransactions}</div>
                   <p className="text-xs text-muted-foreground">
                    Todos los documentos recibidos.
                  </p>
                </CardContent>
              </Card>
          </div>
          
          <Card>
            <CardHeader>
                <CardTitle>Desglose de Transacciones</CardTitle>
                <CardDescription>Una lista de todos los documentos con sus valores financieros.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Compañía</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Monto Total</TableHead>
                        <TableHead>ITBMS</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.length > 0 ? (
                        documents.map((doc) => (
                            <TableRow key={doc.id}>
                            <TableCell>
                                <Link
                                href={`/dashboard/documents/${doc.id}`}
                                className="font-medium text-primary hover:underline"
                                >
                                {doc.client}
                                </Link>
                                <div className="text-sm text-muted-foreground">ID: {doc.id.substring(0, 10)}...</div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                variant="outline"
                                className={cn('capitalize', statusStyles[doc.status])}
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
                             <TableCell>
                                {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: doc.currency,
                                }).format(getItbmsFromDocument(doc))}
                            </TableCell>
                            <TableCell>
                                { getDateFromTimestamp(doc.createdAt).toLocaleDateString() }
                            </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                            No se encontraron documentos.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
      </div>
    </>
  );
}

