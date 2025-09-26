
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, PlusCircle, Trash2, Eye, EyeOff, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/auth-context';
import { getCompanies, updateCompany, getCompanyById } from '@/lib/firebase/firestore';
import type { Company } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Timestamp } from 'firebase/firestore';

const apiKeySchema = z.object({
  key: z.string().min(1, "La clave no puede estar vacía."),
  status: z.enum(['active', 'revoked']),
  createdAt: z.instanceof(Timestamp),
});

const hkaCredentialsSchema = z.object({
  username: z.string().min(1, "El Nit (nombre de usuario) es requerido."),
  password: z.string().min(1, "El Token (contraseña) es requerido."),
});

const apiConfigSchema = z.object({
  companyId: z.string().min(1, "Debes seleccionar una compañía."),
  clientApiKeys: z.array(apiKeySchema),
  pacDemoCredentials: hkaCredentialsSchema,
  pacProdCredentials: hkaCredentialsSchema,
});

type ApiConfigFormValues = z.infer<typeof apiConfigSchema>;

export default function ApiSettingsPage() {
  const { toast } = useToast();
  const { db } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [isCompaniesLoading, setIsCompaniesLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showDemoToken, setShowDemoToken] = useState(false);
  const [showProdToken, setShowProdToken] = useState(false);

  const form = useForm<ApiConfigFormValues>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      companyId: '',
      clientApiKeys: [],
      pacDemoCredentials: { username: '', password: '' },
      pacProdCredentials: { username: '', password: '' },
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "clientApiKeys",
  });
  
  // Fetch all companies for the selector
  useEffect(() => {
    async function fetchCompanies() {
      if (!db) return;
      setIsCompaniesLoading(true);
      const fetchedCompanies = await getCompanies(db);
      setCompanies(fetchedCompanies);
      setIsCompaniesLoading(false);
    }
    fetchCompanies();
  }, [db]);

  // When a company is selected, fetch its data and populate the form
  const handleCompanyChange = useCallback(async (companyId: string) => {
    if (!db || !companyId) return;
    setIsFormLoading(true);
    setSelectedCompanyId(companyId);
    
    const companyData = await getCompanyById(db, companyId);
    
    if (companyData) {
      form.reset({
        companyId: companyData.id,
        clientApiKeys: companyData.apiKeys || [], 
        pacDemoCredentials: {
          username: companyData.factoryHkaConfig?.demo?.username || '',
          password: companyData.factoryHkaConfig?.demo?.password || '',
        },
        pacProdCredentials: {
          username: companyData.factoryHkaConfig?.production?.username || '',
          password: companyData.factoryHkaConfig?.production?.password || '',
        }
      });
      // useFieldArray's `replace` is needed to update the array in the form state
      replace(companyData.apiKeys || []);
    } else {
        form.reset({
            companyId,
            clientApiKeys: [],
            pacDemoCredentials: { username: '', password: '' },
            pacProdCredentials: { username: '', password: '' },
        });
        replace([]);
    }
    setIsFormLoading(false);
  }, [db, form, replace]);

  const onSubmit = async (values: ApiConfigFormValues) => {
    if (!db) {
        toast({ title: "Error", description: "La base de datos no está disponible.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    
    const companyToUpdate = companies.find(c => c.id === values.companyId);

    if (!companyToUpdate) {
        toast({ title: "Error", description: "No se encontró la compañía seleccionada.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    const dataToUpdate: Partial<Company> = {
        apiKeys: values.clientApiKeys,
        factoryHkaConfig: {
            ...companyToUpdate.factoryHkaConfig,
            demo: {
                ...companyToUpdate.factoryHkaConfig.demo,
                username: values.pacDemoCredentials.username,
                password: values.pacDemoCredentials.password,
            },
            production: {
                ...companyToUpdate.factoryHkaConfig.production,
                username: values.pacProdCredentials.username,
                password: values.pacProdCredentials.password,
            }
        }
    };

    const { success, error } = await updateCompany(db, values.companyId, dataToUpdate);

    if (success) {
      toast({
        title: 'Configuración Guardada',
        description: 'Las credenciales de API para la compañía seleccionada han sido actualizadas.',
      });
    } else {
       toast({
        title: 'Error al Guardar',
        description: `No se pudo actualizar la configuración: ${error?.message}`,
        variant: 'destructive',
      });
      console.error(error);
    }
    setIsSubmitting(false);
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
    <TooltipProvider>
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
                            <Select onValueChange={handleCompanyChange} value={field.value} disabled={isCompaniesLoading || isFormLoading}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona una compañía..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isCompaniesLoading ? (
                                    <SelectItem value="loading" disabled>Cargando compañías...</SelectItem>
                                ) : (
                                    companies.map(company => (
                                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                                    ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </CardContent>
              </Card>
              
              {isFormLoading && (
                  <div className="space-y-8">
                      <Card><CardContent className="p-6 space-y-4">
                          <Skeleton className="h-8 w-1/3" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                      </CardContent></Card>
                      <Card><CardContent className="p-6 space-y-4">
                          <Skeleton className="h-8 w-1/3" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                      </CardContent></Card>
                  </div>
              )}

              <div className={isFormLoading || !selectedCompanyId ? 'hidden' : 'space-y-8'}>
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
                                                      <Tooltip>
                                                        <TooltipTrigger asChild>
                                                          <Button variant="ghost" size="icon" type="button" onClick={() => copyToClipboard(field.value)}>
                                                              <Copy className="h-4 w-4" />
                                                          </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                          <p>Copiar clave de API</p>
                                                        </TooltipContent>
                                                      </Tooltip>
                                                  </div>
                                              </div>
                                              <FormMessage />
                                          </FormItem>
                                      )}
                                  />
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                          <Trash2 />
                                          <span className="sr-only">Eliminar clave</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Eliminar esta clave de API</p>
                                    </TooltipContent>
                                  </Tooltip>
                              </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={() => append({ key: `fk_live_${crypto.randomUUID().replace(/-/g, '')}`, status: 'active', createdAt: Timestamp.now() })}>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Generar Nueva Clave
                          </Button>
                      </CardContent>
                  </Card>
                  
                  <Card>
                      <CardHeader>
                          <CardTitle>Credenciales del PAC (The Factory HKA)</CardTitle>
                          <CardDescription>
                              Credenciales necesarias para conectar Factos UbicSys con el proveedor de autorización, según su documentación.
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
                                          <FormLabel>Nit (Usuario Demo)</FormLabel>
                                          <FormControl><Input placeholder="Nit de prueba proporcionado por HKA" {...field} /></FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="pacDemoCredentials.password"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Token (Contraseña Demo)</FormLabel>
                                          <div className="relative">
                                              <FormControl>
                                                  <Input type={showDemoToken ? 'text' : 'password'} placeholder="Token de prueba proporcionado por HKA" {...field} />
                                              </FormControl>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowDemoToken(!showDemoToken)}>
                                                      {showDemoToken ? <EyeOff /> : <Eye />}
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>{showDemoToken ? 'Ocultar' : 'Mostrar'} token</p>
                                                </TooltipContent>
                                              </Tooltip>
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
                                          <FormLabel>Nit (Usuario Producción)</FormLabel>
                                          <FormControl><Input placeholder="Nit de producción proporcionado por HKA" {...field} /></FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="pacProdCredentials.password"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Token (Contraseña Producción)</FormLabel>
                                           <div className="relative">
                                              <FormControl>
                                                  <Input type={showProdToken ? 'text' : 'password'} placeholder="Token de producción proporcionado por HKA" {...field} />
                                              </FormControl>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowProdToken(!showProdToken)}>
                                                      {showProdToken ? <EyeOff /> : <Eye />}
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>{showProdToken ? 'Ocultar' : 'Mostrar'} token</p>
                                                </TooltipContent>
                                              </Tooltip>
                                          </div>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                          </div>
                      </CardContent>
                  </Card>

                  <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting || isFormLoading || !selectedCompanyId}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Configuración de API
                      </Button>
                  </div>
              </div>
          </form>
        </Form>
      </div>
    </TooltipProvider>
  );
}
