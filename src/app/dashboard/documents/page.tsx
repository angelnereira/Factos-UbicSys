
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
import { getDocuments, getCompanies } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import type { FiscalDocument, Company } from '@/lib/types';
import { Loader2, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OverviewChart } from './_components/overview-chart';
import type { Timestamp } from 'firebase/firestore';

const statusStyles: { [key in FiscalDocument['status']]: string } = {
  approved: 'text-chart-2 border-chart-2 bg-chart-2/10',
  pending: 'text-chart-4 border-chart-4 bg-chart-4/10',
  rejected: 'text-destructive border-destructive bg-destructive/10',
  processing: 'text-blue-500 border-blue-500 bg-blue-500/10',
  sent_to_pac: 'text-indigo-500 border-indigo-500 bg-indigo-500/10',
  cancelled: 'text-gray-500 border-gray-500 bg-gray-500/10',
};


export default function DocumentsPage() {
  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [fetchedDocuments] = await Promise.all([
        getDocuments(),
      ]);
      setDocuments(fetchedDocuments as FiscalDocument[]);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const documentMetrics = useMemo(() => {
    return {
      total: documents.length,
      pending: documents.filter(d => d.status === 'pending').length,
      approved: documents.filter(d => d.status === 'approved').length,
      rejected: documents.filter(d => d.status === 'rejected').length,
    };
  }, [documents]);

  const recentDocuments = useMemo(() => {
    return [...documents]
      .sort((a, b) => {
          const dateA = a.createdAt as Timestamp;
          const dateB = b.createdAt as Timestamp;
          return dateB.seconds - dateA.seconds;
      })
      .slice(0, 5);
  }, [documents]);

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
            <h1 className="font-headline text-3xl font-bold tracking-tight">Dashboard</h1>
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
                      <OverviewChart documents={documents} />
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
