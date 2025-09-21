
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getDocuments } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import type { Document } from '@/lib/types';
import { Loader2, ArrowUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const statusStyles: { [key in Document['status']]: string } = {
  Processed: 'text-chart-2 border-chart-2 bg-chart-2/10',
  Pending: 'text-chart-4 border-chart-4 bg-chart-4/10',
  Error: 'text-destructive border-destructive bg-destructive/10',
};

type SortKey = keyof Document | '';

function DocumentsTable({ 
  documents, 
  isLoading, 
  status,
  searchQuery,
}: { 
  documents: Document[], 
  isLoading: boolean, 
  status?: Document['status'],
  searchQuery: string,
}) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredDocuments = useMemo(() => {
    let result = status ? documents.filter(doc => doc.status === status) : documents;

    if (searchQuery) {
        result = result.filter(doc =>
            doc.client.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (sortKey) {
        result.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue === undefined || bValue === undefined) return 0;

            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    return result;
  }, [documents, status, searchQuery, sortKey, sortDirection]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (sortedAndFilteredDocuments.length === 0) {
    return (
        <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
                No se encontraron documentos.
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                 <Button variant="ghost" onClick={() => handleSort('id')}>
                    ID de Documento
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                 <Button variant="ghost" onClick={() => handleSort('client')}>
                    Cliente
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <Button variant="ghost" onClick={() => handleSort('status')}>
                    Estado
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Button variant="ghost" onClick={() => handleSort('date')}>
                    Fecha
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => handleSort('amount')}>
                    Monto
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredDocuments.map(doc => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/documents/${doc.id}`} className="hover:underline">{doc.id}</Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {doc.client}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                    <Badge
                      className={cn('capitalize', statusStyles[doc.status])}
                      variant="outline"
                    >
                      {doc.status}
                    </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {doc.date}
                </TableCell>
                <TableCell className="text-right">
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
  );
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchDocuments() {
      setIsLoading(true);
      const fetchedDocuments = await getDocuments();
      setDocuments(fetchedDocuments);
      setIsLoading(false);
    }
    fetchDocuments();
  }, []);

  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-2xl font-bold tracking-tight">Documentos</h1>
      </div>
      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="error">Error</TabsTrigger>
          </TabsList>
           <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar por cliente..."
                    className="w-full bg-background pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
        <TabsContent value="all">
          <DocumentsTable documents={documents} isLoading={isLoading} searchQuery={searchQuery} />
        </TabsContent>
        <TabsContent value="pending">
          <DocumentsTable documents={documents} isLoading={isLoading} status="Pending" searchQuery={searchQuery} />
        </TabsContent>
        <TabsContent value="error">
          <DocumentsTable documents={documents} isLoading={isLoading} status="Error" searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>
    </>
  );
}
