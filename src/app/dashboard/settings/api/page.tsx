
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, PlusCircle, Trash2, Eye, EyeOff, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const apiKeySchema = z.object({
  key: z.string().min(1, "La clave no puede estar vacía."),
  status: z.enum(['active', 'revoked']),
});

const hkaCredentialsSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

const apiConfigSchema = z.object({
  companyId: z.string().min(1, "Debes seleccionar una compañía."),
  clientApiKeys: z.array(apiKeySchema),
  pacDemoCredentials: hkaCredentialsSchema,
  pacProdCredentials: hkaCredentialsSchema.optional(),
});

type ApiConfigFormValues = z.infer<typeof apiConfigSchema>;

export default function ApiSettingsPage() {
  const { toast } = useToast();
  const [showDemoPass, setShowDemoPass] = useState(false);
  const [showProdPass, setShowProdPass] = useState(false);

  // Mock data, in a real app this would come from your DB
  const companies = [
    { id: 'comp-1', name: 'Constructora del Istmo, S.A.' },
    { id: 'comp-2', name: 'Logística Global de Carga' },
  ];

  const form = useForm<ApiConfigFormValues>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      companyId: '',
      clientApiKeys: [{ key: `fk_live_${crypto.randomUUID()}`, status: 'active' }],
      pacDemoCredentials: { username: '', password: '' },
      pacProdCredentials: { username: '', password: '' },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "clientApiKeys",
  });

  const onSubmit = (values: ApiConfigFormValues) => {
    console.log(values);
    toast({
      title: 'Configuración Guardada',
      description: 'Las credenciales de API para la compañía seleccionada han sido actualizadas.',
    });
  };
  
  const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast({
            title: "Copiado",
            description: "La clave de API ha sido copiada al portapapeles.",
        });
    } catch (err) {
        console.error('Failed to copy:', err);
         toast({
            title: "Error al Copiar",
            description: "No se pudo copiar la clave.",
            variant: "destructive",
        });
    }
  };


  return (
    <div className="grid flex-1 auto-rows-max gap-4">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/dashboard/settings">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Atrás</span>
            </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Configuración de API por Compañía
        </h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar Compañía</CardTitle>
                    <CardDescription>
                        Elige la compañía para la cual deseas configurar las credenciales de API.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                      control={form.control}
                      name="companyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compañía</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una compañía..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies.map(company => (
                                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Claves de API del Cliente</CardTitle>
                    <CardDescription>
                       Estas son las claves que tu cliente usará para autenticarse contra la API de Factos UbicSys.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2">
                             <FormField
                                control={form.control}
                                name={`clientApiKeys.${index}.key`}
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormLabel>Clave de API {index + 1}</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input {...field} readOnly className="pr-16" />
                                            </FormControl>
                                             <div className="absolute right-1 top-1/2 -translate-y-1/2 flex">
                                                <Button variant="ghost" size="icon" type="button" onClick={() => copyToClipboard(field.value)}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                <Trash2 />
                                <span className="sr-only">Eliminar clave</span>
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ key: `fk_live_${crypto.randomUUID()}`, status: 'active' })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Generar Nueva Clave
                    </Button>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Credenciales del PAC (The Factory HKA)</CardTitle>
                    <CardDescription>
                        Credenciales necesarias para conectar Factos UbicSys con el proveedor de autorización.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Ambiente de Demo / Pruebas</h3>
                         <FormField
                            control={form.control}
                            name="pacDemoCredentials.username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username (Demo)</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="pacDemoCredentials.password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password (Demo)</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input type={showDemoPass ? 'text' : 'password'} {...field} />
                                        </FormControl>
                                        <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowDemoPass(!showDemoPass)}>
                                            {showDemoPass ? <EyeOff /> : <Eye />}
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Ambiente de Producción</h3>
                         <FormField
                            control={form.control}
                            name="pacProdCredentials.username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username (Producción)</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="pacProdCredentials.password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password (Producción)</FormLabel>
                                     <div className="relative">
                                        <FormControl>
                                            <Input type={showProdPass ? 'text' : 'password'} {...field} />
                                        </FormControl>
                                        <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowProdPass(!showProdPass)}>
                                            {showProdPass ? <EyeOff /> : <Eye />}
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit">Guardar Configuración de API</Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
