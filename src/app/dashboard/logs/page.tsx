
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { Timestamp, collectionGroup, getDocs, query, type Firestore } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';

interface LogEntry extends ProcessingStep {
  documentId: string;
  companyId: string;
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


export default function LogsPage() {
  const { db } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stepFilter, setStepFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      if (!db) return;
      setIsLoading(true);
      const fetchedLogs = await getAllLogs(db);
      setLogs(fetchedLogs);
      setIsLoading(false);
    }
    fetchData();
  }, [db]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const searchMatch =
        log.documentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = statusFilter === 'all' || log.status === statusFilter;
      const stepMatch = stepFilter === 'all' || log.step === stepFilter;
      return searchMatch && statusMatch && stepMatch;
    });
  }, [logs, searchQuery, statusFilter, stepFilter]);

  const uniqueSteps = useMemo(() => {
    const steps = new Set(logs.map(log => log.step));
    return ['all', ...Array.from(steps)];
  }, [logs]);

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
            Registros del Sistema
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
            <div className="flex gap-2 w-full sm:w-auto">
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
              <Select value={stepFilter} onValueChange={setStepFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrar por Paso" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueSteps.map(step => (
                    <SelectItem key={step} value={step} className="capitalize">
                      {step === 'all' ? 'Todos los Pasos' : step}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          ) : (
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
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No se encontraron registros que coincidan con tus filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

    