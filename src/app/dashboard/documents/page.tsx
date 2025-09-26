
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { FiscalDocument } from '@/lib/types';
import { Loader2, Search, ArrowUpDown, RefreshCw } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { getAllDocumentsForUser, getAllDocuments } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const statusStyles: { [key in FiscalDocument['status']]: string } = {
  approved: 'text-chart-2 border-chart-2 bg-chart-2/10',
  pending: 'text-chart-4 border-chart-4 bg-chart-4/10',
  rejected: 'text-destructive border-destructive bg-destructive/10',
  processing: 'text-blue-500 border-blue-500 bg-blue-500/10',
  sent_to_pac: 'text-indigo-500 border-indigo-500 bg-indigo-500/10',
  cancelled: 'text-gray-500 border-gray-500 bg-gray-500/10',
};

type SortKey = keyof FiscalDocument | '';

export default function DocumentsListPage() {
  const { db, user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchData = useCallback(async () => {
    if (!db) {
        toast({
            title: "Error de Conexión",
            description: "La base de datos no está disponible. No se pueden cargar los documentos.",
            variant: "destructive"
        });
        return;
    };
     const uid = user?.uid;
     if (!uid && process.env.NODE_ENV !== 'development') {
        toast({ title: "Error de Autenticación", description: "No se pudo identificar al usuario.", variant: "destructive" });
        return;
     }

    setIsLoading(true);
    try {
      const fetchedDocuments = process.env.NODE_ENV === 'development'
        ? await getAllDocuments(db)
        : await getAllDocumentsForUser(db, uid!);

      setDocuments(fetchedDocuments);
      setHasLoaded(true);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error al Cargar Documentos",
        description: "No se pudieron obtener los documentos. Revisa las reglas de seguridad de Firestore.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [db, user, toast]);

  useEffect(() => {
    // Automatically fetch data when the component mounts
    fetchData();
  }, [fetchData]);


  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const getDateFromTimestamp = (date: Date | Timestamp) => {
      if (date && 'seconds' in date) {
        return new Date((date as Timestamp).seconds * 1000);
      }
      return date as Date;
  }

  const sortedAndFilteredDocuments = useMemo(() => {
    let result = [...documents];

    if (searchQuery) {
      result = result.filter(doc =>
        doc.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.cufe && doc.cufe.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(doc => doc.status === statusFilter);
    }

    if (sortKey) {
       result.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (aValue === undefined || bValue === undefined) return 0;

        let valA = aValue;
        let valB = bValue;
        
        if (sortKey === 'createdAt' || sortKey === 'date') {
            valA = getDateFromTimestamp(aValue as Date | Timestamp).getTime();
            valB = getDateFromTimestamp(bValue as Date | Timestamp).getTime();
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        
        return 0;
      });
    }

    return result;
  }, [documents, searchQuery, statusFilter, sortKey, sortDirection]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(documents.map(doc => doc.status));
    return ['all', ...Array.from(statuses)];
  }, [documents]);

  return (
    <TooltipProvider>
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            Documentos Fiscales
          </h1>
          <p className="text-muted-foreground">
            Explora y gestiona todos los documentos procesados.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              <CardTitle>Todos los Documentos</CardTitle>
              <CardDescription>
                Busca y filtra a través de todos los documentos.
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                      variant="default"
                      className="bg-chart-4 text-black hover:bg-chart-4/90 dark:bg-chart-4 dark:hover:bg-chart-4/90"
                      size="sm"
                      onClick={fetchData}
                      disabled={isLoading}
                  >
                      {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                          <RefreshCw className="h-4 w-4" />
                      )}
                      <span className="ml-2 hidden sm:inline">Actualizar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Volver a cargar los documentos desde la base de datos.</p>
                </TooltipContent>
              </Tooltip>
              <div className="relative flex-1 sm:flex-initial">
                 <Tooltip>
                   <TooltipTrigger className="w-full text-left">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Buscar por cliente, ID o CUFE..."
                          className="w-full bg-background pl-8"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                      </div>
                   </TooltipTrigger>
                   <TooltipContent>
                     <p>Busca por nombre de cliente, ID de documento o CUFE.</p>
                   </TooltipContent>
                 </Tooltip>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por Estado" />
                    </SelectTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filtrar la lista por estado del documento.</p>
                  </TooltipContent>
                </Tooltip>
                <SelectContent>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status === 'all' ? 'Todos los Estados' : status}
                    </SelectItem>
                  ))}
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
          ) : !hasLoaded ? (
             <div className="h-24 text-center text-muted-foreground flex items-center justify-center">
                  Presiona "Actualizar" para cargar los documentos.
              </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('client')}>
                        Cliente
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                  </TableHead>
                  <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('status')}>
                        Estado
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                  </TableHead>
                  <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('amount')}>
                        Monto
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                  </TableHead>
                  <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('createdAt')}>
                        Fecha Creación
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredDocuments.length > 0 ? (
                  sortedAndFilteredDocuments.map((doc) => (
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
                        { getDateFromTimestamp(doc.createdAt).toLocaleDateString() }
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                       No se encontraron documentos que coincidan con tus filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
