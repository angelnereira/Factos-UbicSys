
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { FiscalDocument, ProcessingStep, Company } from '@/lib/types';
import { Loader2, Search, RefreshCw, Building } from 'lucide-react';
import Link from 'next/link';
import { Timestamp, collectionGroup, getDocs, query, type Firestore, collection } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LogEntry extends ProcessingStep {
  documentId: string;
  companyId: string;
}

interface GroupedLogs {
    [companyId: string]: LogEntry[];
}

const statusStyles: { [key in ProcessingStep['status']]: string } = {
  success: 'text-chart-2 border-chart-2 bg-chart-2/10',
  error: 'text-destructive border-destructive bg-destructive/10',
  warning: 'text-chart-4 border-chart-4 bg-chart-4/10',
};

async function getAllLogs(db: Firestore): Promise<LogEntry[]> {
    const documentsQuery = query(collectionGroup(db, 'documents'));
    const querySnapshot = await getDocs(documentsQuery);
    
    const allLogs: LogEntry[] = [];
    querySnapshot.forEach((docSnap) => {
        const doc = docSnap.data() as FiscalDocument;
        const companyId = docSnap.ref.parent.parent?.id ?? '';
        
        if (doc.statusHistory && Array.isArray(doc.statusHistory)) {
          doc.statusHistory.forEach(step => {
            allLogs.push({
              ...step,
              documentId: docSnap.id,
              companyId: companyId,
            });
          });
        }
    });
    
    allLogs.sort((a, b) => {
        const timeA = (a.timestamp as unknown as Timestamp)?.seconds || 0;
        const timeB = (b.timestamp as unknown as Timestamp)?.seconds || 0;
        return timeB - timeA;
    });

    return allLogs;
}

async function getCompanies(db: Firestore): Promise<Company[]> {
    const q = collection(db, 'companies');
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
}


export default function LogsPage() {
  const { db } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = useCallback(async () => {
    if (!db) {
        toast({
            title: "Error de Conexión",
            description: "La base de datos no está disponible. No se pueden cargar los registros.",
            variant: "destructive"
        });
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
      const [fetchedLogs, fetchedCompanies] = await Promise.all([
          getAllLogs(db),
          getCompanies(db)
      ]);
      setLogs(fetchedLogs);
      setCompanies(fetchedCompanies);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Error al Cargar Registros",
        description: "No se pudieron obtener los registros de auditoría desde Firestore.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [db, toast]);

   useEffect(() => {
    fetchData();
  }, [fetchData]);

  const groupedAndFilteredLogs = useMemo(() => {
    const filtered = logs.filter(log => {
      const searchMatch =
        log.documentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = statusFilter === 'all' || log.status === statusFilter;
      return searchMatch && statusMatch;
    });

    return filtered.reduce((acc: GroupedLogs, log) => {
        if (!acc[log.companyId]) {
            acc[log.companyId] = [];
        }
        acc[log.companyId].push(log);
        return acc;
    }, {});
  }, [logs, searchQuery, statusFilter]);

  const getCompanyName = (companyId: string) => {
      return companies.find(c => c.id === companyId)?.name || companyId;
  }

  const getDateString = (date: any) => {
    if (date && typeof date === 'object' && 'seconds' in date) {
      return new Date((date as Timestamp).seconds * 1000).toLocaleString();
    }
    if (typeof date === 'string') {
        return new Date(date).toLocaleString();
    }
    return 'N/A';
  }

  return (
    <>
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            System Logs
          </h1>
          <p className="text-muted-foreground">
            Un registro de auditoría de todos los eventos de procesamiento de documentos.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              <CardTitle>Historial de Eventos</CardTitle>
              <CardDescription>
                Busca y filtra a través de todos los registros del sistema.
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto items-center">
              <Button
                variant="default"
                className="bg-chart-4 text-black hover:bg-chart-4/90 dark:bg-chart-4 dark:hover:bg-chart-4/90"
                size="sm"
                onClick={fetchData}
                disabled={isLoading}
              >
                {isLoading ? (
                    <Loader2 className={cn("h-4 w-4 animate-spin")} />
                ) : (
                    <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">Actualizar</span>
              </Button>
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por ID o mensaje..."
                  className="w-full bg-background pl-8"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrar por Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Estados</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : Object.keys(groupedAndFilteredLogs).length === 0 ? (
               <div className="text-center text-muted-foreground py-16">
                  No se encontraron registros de eventos.
              </div>
          ) : (
            <Accordion type="multiple" className="w-full">
                {Object.entries(groupedAndFilteredLogs).map(([companyId, logEntries]) => (
                    <AccordionItem value={companyId} key={companyId}>
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <Building className="h-5 w-5 text-muted-foreground" />
                                <span className="font-semibold">{getCompanyName(companyId)}</span>
                                <Badge variant="secondary">{logEntries.length} eventos</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Documento ID</TableHead>
                                  <TableHead>Paso</TableHead>
                                  <TableHead>Estado</TableHead>
                                  <TableHead>Mensaje</TableHead>
                                  <TableHead>Fecha</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {logEntries.map((log, index) => (
                                  <TableRow key={`${log.documentId}-${index}`}>
                                    <TableCell>
                                      <Link
                                        href={`/dashboard/documents/${log.documentId}`}
                                        className="font-medium text-primary hover:underline"
                                      >
                                        {log.documentId.substring(0, 15)}...
                                      </Link>
                                    </TableCell>
                                    <TableCell className="capitalize">{log.step.replace(/_/g, ' ')}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={cn('capitalize', statusStyles[log.status])}
                                      >
                                        {log.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                                    <TableCell>
                                      {getDateString(log.timestamp)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </>
  );
}
