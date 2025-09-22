
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
import { Loader2, Search, ArrowUpDown } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { getAllDocuments } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/auth-context';


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
  const { db } = useAuth();
  const [documents, setDocuments] = useState<FiscalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
    <>
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
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por cliente, ID o CUFE..."
                  className="w-full bg-background pl-8"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Estado" />
                </SelectTrigger>
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
    </>
  );
}
