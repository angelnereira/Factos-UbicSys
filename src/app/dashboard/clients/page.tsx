
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle } from 'lucide-react';
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
import { clients as initialClients } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { Client } from '@/lib/types';

const statusStyles: { [key in Client['status']]: string } = {
  Production: 'text-chart-2 border-chart-2 bg-chart-2/10',
  Development: 'text-chart-4 border-chart-4 bg-chart-4/10',
  Demo: 'text-muted-foreground border-dashed',
};

const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  erpType: z.enum(['SAP', 'Oracle', 'Microsoft Dynamics', 'Claris FileMaker', 'Custom']),
  status: z.enum(['Production', 'Development', 'Demo']),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit = (values: ClientFormValues) => {
    const newClient: Client = {
      id: `CLI${(clients.length + 1).toString().padStart(3, '0')}`,
      onboarded: new Date().toISOString().split('T')[0],
      ...values,
    };
    setClients(prevClients => [...prevClients, newClient]);
    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <>
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            Clients
          </h1>
          <p className="text-muted-foreground">
            Manage your clients and their ERP integrations.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Client
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Onboard a new client and configure their integration settings.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">Client Name</FormLabel>
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
                      <FormLabel className="text-right">Contact Email</FormLabel>
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
                      <FormLabel className="text-right">ERP Type</FormLabel>
                      <div className="col-span-3">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ERP" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SAP">SAP</SelectItem>
                            <SelectItem value="Oracle">Oracle</SelectItem>
                            <SelectItem value="Microsoft Dynamics">
                              Microsoft Dynamics
                            </SelectItem>
                            <SelectItem value="Claris FileMaker">Claris FileMaker</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
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
                      <FormLabel className="text-right">Environment</FormLabel>
                      <div className="col-span-3">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Environment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Production">Production</SelectItem>
                              <SelectItem value="Development">Development</SelectItem>
                              <SelectItem value="Demo">Demo</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Save Client</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>A list of all onboarded clients.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>ERP Type</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Onboarded</TableHead>
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
        </CardContent>
      </Card>
    </>
  );
}

    