
'use client';

import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';

const statusStyles: { [key in Document['status']]: string } = {
  Processed: 'text-chart-2 border-chart-2 bg-chart-2/10',
  Pending: 'text-chart-4 border-chart-4 bg-chart-4/10',
  Error: 'text-destructive border-destructive bg-destructive/10',
};

function DocumentsTable({ documents, isLoading, status }: { documents: Document[], isLoading: boolean, status?: Document['status'] }) {
  const filteredDocuments = status
    ? documents.filter(doc => doc.status === status)
    : documents;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (filteredDocuments.length === 0) {
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
              <TableHead>ID de Documento</TableHead>
              <TableHead className="hidden sm:table-cell">Cliente</TableHead>
              <TableHead className="hidden sm:table-cell">Estado</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map(doc => (
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
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="error">Error</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all">
          <DocumentsTable documents={documents} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="pending">
          <DocumentsTable documents={documents} isLoading={isLoading} status="Pending" />
        </TabsContent>
        <TabsContent value="error">
          <DocumentsTable documents={documents} isLoading={isLoading} status="Error" />
        </TabsContent>
      </Tabs>
    </>
  );
}
