
'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FiscalDocument } from '@/lib/types';
import { FileText, Clock, CheckCircle, XCircle, FileJson, Download, Loader2, AlertTriangle } from 'lucide-react';
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
import { useAuth } from '@/contexts/auth-context';
import { getAllDocumentsForUser, getAllDocuments } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const statusStyles: { [key in FiscalDocument['status']]: string } = {
  approved: 'text-chart-2 border-chart-2 bg-chart-2/10',
  pending: 'text-chart-4 border-chart-4 bg-chart-4/10',
  rejected: 'text-destructive border-destructive bg-destructive/10',
  processing: 'text-blue-500 border-blue-500 bg-blue-500/10',
  sent_to_pac: 'text-indigo-500 border-indigo-500 bg-indigo-500/10',
  cancelled: 'text-gray-500 border-gray-500 bg-gray-500/10',
};

export default function MonitoringPage() {
  const { db, user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   const fetchData = useCallback(async () => {
    if (!db) {
      setError("La conexión con la base de datos no está disponible.");
      setIsLoading(false);
      return;
    }
     // In a real multi-tenant app, you'd use the user's auth UID.
     // For development, we're bypassing this to show all documents.
    const uid = user?.uid;
     if (!uid && process.env.NODE_ENV !== 'development') {
        setError("No se pudo identificar al usuario. No se pueden cargar los documentos.");
        setIsLoading(false);
        return;
     }

    setIsLoading(true);
    try {
      // Use getAllDocuments for dev to see everything, otherwise scope to user.
      const fetchedDocuments = process.env.NODE_ENV === 'development'
        ? await getAllDocuments(db)
        : await getAllDocumentsForUser(db, uid!);

      fetchedDocuments.sort((a, b) => {
        const timeA = (a.createdAt as Timestamp)?.seconds || 0;
        const timeB = (b.createdAt as Timestamp)?.seconds || 0;
        return timeB - timeA;
      });
      setDocuments(fetchedDocuments);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("No se pudieron cargar los documentos. Revisa las reglas de seguridad de Firestore.");
      toast({
        title: "Error de Carga",
        description: "No se pudieron obtener los documentos desde Firestore.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [db, user, toast]);

   useEffect(() => {
    fetchData();
  }, [fetchData]);

  const documentMetrics = useMemo(() => {
    return documents.reduce(
      (acc, doc) => {
        acc.total++;
        if (doc.status === 'approved') acc.approved++;
        if (doc.status === 'pending') acc.pending++;
        if (doc.status === 'rejected') acc.rejected++;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [documents]);

  const recentDocuments = useMemo(() => {
    return documents.slice(0, 5);
  }, [documents]);
  
  const getDateString = (date: Date | Timestamp | string | undefined) => {
    if (!date) return 'N/A';
    if (typeof date === 'string') return new Date(date).toLocaleString();
    if (date && 'seconds' in date) return new Date((date as Timestamp).seconds * 1000).toLocaleString();
    if (date instanceof Date) return date.toLocaleString();
    return 'N/A';
  };

  const handleDownloadJson = (jsonData: any, docId: string) => {
    if (!jsonData) return;
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `request-${docId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          {error && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Documentos Totales
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{documentMetrics.total}</div>}
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
                   {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{documentMetrics.approved}</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                   {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{documentMetrics.pending}</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
                  <XCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                   {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{documentMetrics.rejected}</div>}
                </CardContent>
              </Card>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Documentos Recientes</CardTitle>
                    <CardDescription>
                        Las últimas 5 transacciones procesadas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                     ) : documents.length === 0 ? (
                         <div className="text-center text-muted-foreground py-10">
                            No hay documentos recientes.
                         </div>
                     ) : (
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
                                  {doc.status === 'rejected' && doc.errorDetails && (
                                    <div>
                                        <div className="font-medium text-destructive text-xs truncate" title={doc.errorDetails}>{doc.errorDetails}</div>
                                        <div className="text-sm text-muted-foreground">{getDateString(doc.processedAt)}</div>
                                    </div>
                                  )}
                                  {(doc.status === 'pending' || doc.status === 'processing' || doc.status === 'sent_to_pac') && (
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
                                                  <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-semibold">Payload Enviado (Request)</h4>
                                                    <Button variant="outline" size="sm" onClick={() => handleDownloadJson(doc.originalData, doc.id)}>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Descargar JSON
                                                    </Button>
                                                  </div>
                                                  <pre className="mt-2 h-[200px] w-full overflow-auto rounded-md bg-muted p-4 text-xs">
                                                      <code>{JSON.stringify(doc.originalData, null, 2)}</code>
                                                  </pre>
                                              </div>
                                                <div>
                                                  <h4 className="font-semibold mb-2">Respuesta de la API (Response)</h4>
                                                  <pre className="mt-2 h-[200px] w-full overflow-auto rounded-md bg-muted p-4 text-xs">
                                                      <code>{'Aún no implementado.'}</code>
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
                     )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Visión General</CardTitle>
                    <CardDescription>Volumen de documentos procesados por mes.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    {isLoading ? (
                         <div className="flex justify-center items-center h-[350px]">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                         <OverviewChart documents={documents} />
                    )}
                </CardContent>
            </Card>
          </div>
      </div>
    </>
  );
}

    

    