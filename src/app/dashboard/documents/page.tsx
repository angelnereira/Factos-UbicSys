
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
import { getDocuments, getClients, addDocument } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import type { Document, Client } from '@/lib/types';
import { Loader2, ArrowUpDown, Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

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

const documentSchema = z.object({
  clientId: z.string().min(1, "Debes seleccionar un cliente"),
  amount: z.coerce.number().min(0.01, "El monto debe ser mayor que cero"),
  currency: z.enum(['USD', 'EUR', 'GBP']),
});

type DocumentFormValues = z.infer<typeof documentSchema>;


export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
  });

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [fetchedDocuments, fetchedClients] = await Promise.all([
        getDocuments(),
        getClients(),
      ]);
      setDocuments(fetchedDocuments);
      setClients(fetchedClients);
      setIsLoading(false);
    }
    fetchData();
  }, []);
  
  const onSubmit = async (values: DocumentFormValues) => {
    const selectedClient = clients.find(c => c.id === values.clientId);
    if (!selectedClient) {
        toast({ title: "Error", description: "Cliente no encontrado", variant: "destructive"});
        return;
    }

    const newDocumentData = {
        client: selectedClient.name,
        clientId: selectedClient.id,
        erpType: selectedClient.erpType,
        amount: values.amount,
        currency: values.currency,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending' as const,
    };

    const { newDocument, error } = await addDocument(newDocumentData);

    if (error) {
        toast({ title: "Error", description: "No se pudo agregar el documento.", variant: "destructive" });
    } else if (newDocument) {
        setDocuments(prev => [...prev, newDocument]);
        toast({ title: "Éxito", description: "Documento agregado exitosamente." });
        setIsDialogOpen(false);
        form.reset();
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline flex-1 text-2xl font-bold tracking-tight">Documentos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Agregar Documento
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Documento</DialogTitle>
              <DialogDescription>
                Ingrese los detalles para crear un nuevo documento.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                 <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar Cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar Moneda" />
                          </Trigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : "Guardar Documento"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="processed">Procesados</TabsTrigger>
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
        <TabsContent value="processed">
          <DocumentsTable documents={documents} isLoading={isLoading} status="Processed" searchQuery={searchQuery} />
        </TabsContent>
        <TabsContent value="error">
          <DocumentsTable documents={documents} isLoading={isLoading} status="Error" searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>
    </>
  );
}
