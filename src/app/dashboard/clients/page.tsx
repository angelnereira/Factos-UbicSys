
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Loader2, ArrowUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { addClient, getClients } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import type { Company } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const statusStyles: { [key in Company['status']]: string } = {
  Production: 'text-chart-2 border-chart-2 bg-chart-2/10',
  Development: 'text-chart-4 border-chart-4 bg-chart-4/10',
  Demo: 'text-muted-foreground border-dashed',
};

const clientSchema = z.object({
  name: z.string().min(1, 'El nombre de la compañía es requerido'),
  email: z.string().email('Dirección de correo electrónico inválida'),
  erpType: z.enum(['sap', 'oracle', 'microsoft-dynamics', 'custom', 'api', 'quickbooks', 'claris-filemaker']),
  status: z.enum(['Production', 'Development', 'Demo']),
});

type ClientFormValues = z.infer<typeof clientSchema>;
type SortKey = keyof Company | '';

export default function ClientsPage() {
  const [clients, setClients] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchClients() {
      setIsLoading(true);
      const fetchedClients = await getClients();
      setClients(fetchedClients);
      setIsLoading(false);
    }
    fetchClients();
  }, []);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredClients = useMemo(() => {
    let result = [...clients];

    if (searchQuery) {
      result = result.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (aValue === undefined || bValue === undefined) return 0;
        
        const valA = aValue instanceof Object && 'seconds' in aValue ? (aValue as any).seconds : aValue;
        const valB = bValue instanceof Object && 'seconds' in bValue ? (bValue as any).seconds : bValue;


        if (valA < valB) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [clients, searchQuery, sortKey, sortDirection]);

  const onSubmit = async (values: ClientFormValues) => {
    const newClientData = {
      onboarded: new Date(),
      ...values,
    };

    // @ts-ignore
    const { newClient, error } = await addClient(newClientData);

    if (error) {
      toast({
        title: 'Error al agregar compañía',
        description: 'No se pudo guardar la compañía en la base de datos.',
        variant: 'destructive',
      });
    } else if (newClient) {
      setClients(prevClients => [...prevClients, newClient]);
      toast({
        title: 'Compañía agregada',
        description: 'La nueva compañía ha sido guardada exitosamente.',
      });
      setIsDialogOpen(false);
      form.reset();
    }
  };
  
  const renderSortArrow = (key: SortKey) => {
    if (sortKey === key) {
      return sortDirection === 'asc' ? ' 🔼' : ' 🔽';
    }
    return null;
  };


  return (
    <>
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            Compañías
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus compañías y sus integraciones ERP.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Agregar Compañía
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Compañía</DialogTitle>
              <DialogDescription>
                Incorpora una nueva compañía y configura sus ajustes de integración.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">Nombre de la Compañía</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">Email de Contacto</FormLabel>
                       <div className="col-span-3">
                        <FormControl>
                          <Input type="email" placeholder="contact@acme.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="erpType"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">Tipo de ERP</FormLabel>
                      <div className="col-span-3">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar ERP" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sap">SAP</SelectItem>
                            <SelectItem value="oracle">Oracle</SelectItem>
                            <SelectItem value="microsoft-dynamics">
                              Microsoft Dynamics
                            </SelectItem>
                             <SelectItem value="quickbooks">Quickbooks</SelectItem>
                             <SelectItem value="api">API</SelectItem>
                            <SelectItem value="claris-filemaker">Claris FileMaker</SelectItem>
                            <SelectItem value="custom">Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">Ambiente</FormLabel>
                      <div className="col-span-3">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar Ambiente" />
                              </Trigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Production">Producción</SelectItem>
                              <SelectItem value="Development">Desarrollo</SelectItem>
                              <SelectItem value="Demo">Demo</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Guardar Compañía</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Compañías</CardTitle>
              <CardDescription>Una lista de todas las compañías incorporadas.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar compañías..."
                    className="w-full bg-background pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('name')}>
                    Compañía
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('integrationConfig.erpType')}>
                    Tipo de ERP
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('status')}>
                    Ambiente
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('onboarded')}>
                    Incorporado
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredClients.map(client => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {client.email}
                    </div>
                  </TableCell>
                  <TableCell>{client.integrationConfig.erpType}</TableCell>
                  <TableCell>
                    <Badge variant={'outline'} className={cn(statusStyles[client.status!])}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date((client.onboarded as any).seconds * 1000).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

    