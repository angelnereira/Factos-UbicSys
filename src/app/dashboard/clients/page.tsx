
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Loader2 } from 'lucide-react';
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
import type { Client } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const statusStyles: { [key in Client['status']]: string } = {
  Production: 'text-chart-2 border-chart-2 bg-chart-2/10',
  Development: 'text-chart-4 border-chart-4 bg-chart-4/10',
  Demo: 'text-muted-foreground border-dashed',
};

const clientSchema = z.object({
  name: z.string().min(1, 'El nombre del cliente es requerido'),
  email: z.string().email('Dirección de correo electrónico inválida'),
  erpType: z.enum(['SAP', 'Oracle', 'Microsoft Dynamics', 'Claris FileMaker', 'Custom']),
  status: z.enum(['Production', 'Development', 'Demo']),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const onSubmit = async (values: ClientFormValues) => {
    const newClientData = {
      onboarded: new Date().toISOString().split('T')[0],
      ...values,
    };

    const { newClient, error } = await addClient(newClientData);

    if (error) {
      toast({
        title: 'Error al agregar cliente',
        description: 'No se pudo guardar el cliente en la base de datos.',
        variant: 'destructive',
      });
    } else if (newClient) {
      setClients(prevClients => [...prevClients, newClient]);
      toast({
        title: 'Cliente agregado',
        description: 'El nuevo cliente ha sido guardado exitosamente.',
      });
      setIsDialogOpen(false);
      form.reset();
    }
  };

  return (
    <>
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            Clientes
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus clientes y sus integraciones ERP.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Agregar Cliente
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
              <DialogDescription>
                Incorpora un nuevo cliente y configura sus ajustes de integración.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">Nombre del Cliente</FormLabel>
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
                            <SelectItem value="SAP">SAP</SelectItem>
                            <SelectItem value="Oracle">Oracle</SelectItem>
                            <SelectItem value="Microsoft Dynamics">
                              Microsoft Dynamics
                            </SelectItem>
                            <SelectItem value="Claris FileMaker">Claris FileMaker</SelectItem>
                            <SelectItem value="Custom">Personalizado</SelectItem>
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
                              </SelectTrigger>
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
                  <Button type="submit">Guardar Cliente</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Una lista de todos los clientes incorporados.</CardDescription>
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
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo de ERP</TableHead>
                <TableHead>Ambiente</TableHead>
                <TableHead>Incorporado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map(client => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {client.email}
                    </div>
                  </TableCell>
                  <TableCell>{client.erpType}</TableCell>
                  <TableCell>
                    <Badge variant={'outline'} className={cn(statusStyles[client.status])}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.onboarded}</TableCell>
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
