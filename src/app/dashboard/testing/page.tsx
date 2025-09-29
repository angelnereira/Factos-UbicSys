
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  SelectSeparator,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import type { Company } from '@/lib/types';
import { getCompanies } from '@/lib/firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

const defaultEnviarXml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:ser="http://schemas.datacontract.org/2004/07/Services.ObjComprobante.v1_0">
\t<soapenv:Header/>
\t<soapenv:Body>
\t\t<tem:Enviar>
\t\t\t<tem:tokenEmpresa>TOKENEMPRESA</tem:tokenEmpresa>
\t\t\t<tem:tokenPassword>TOKENPASSWORD</tem:tokenPassword>
\t\t\t<tem:documento>
\t\t\t\t<ser:codigoSucursalEmisor>0000</ser:codigoSucursalEmisor>
\t\t\t\t<ser:tipoSucursal>1</ser:tipoSucursal>
\t\t\t\t<ser:datosTransaccion>
\t\t\t\t\t<ser:tipoEmision>01</ser:tipoEmision>
\t\t\t\t\t<ser:tipoDocumento>01</ser:tipoDocumento>
\t\t\t\t\t<ser:numeroDocumentoFiscal>51340013</ser:numeroDocumentoFiscal>
\t\t\t\t\t<ser:puntoFacturacionFiscal>001</ser:puntoFacturacionFiscal>
\t\t\t\t\t<ser:fechaEmision>2022-08-03T17:01:28-05:00</ser:fechaEmision>
\t\t\t\t\t<ser:naturalezaOperacion>01</ser:naturalezaOperacion>
\t\t\t\t\t<ser:tipoOperacion>1</ser:tipoOperacion>
\t\t\t\t\t<ser:destinoOperacion>1</ser:destinoOperacion>
\t\t\t\t\t<ser:formatoCAFE>2</ser:formatoCAFE>
\t\t\t\t\t<ser:entregaCAFE>3</ser:entregaCAFE>
\t\t\t\t\t<ser:cliente>
\t\t\t\t\t\t<ser:tipoClienteFE>02</ser:tipoClienteFE>
\t\t\t\t\t\t<ser:razonSocial>CONSUMIDOR FINAL</ser:razonSocial>
\t\t\t\t\t\t<ser:direccion>Ciudad de Panama</ser:direccion>
\t\t\t\t\t\t<ser:pais>PA</ser:pais>
\t\t\t\t\t</ser:cliente>
\t\t\t\t</ser:datosTransaccion>
\t\t\t\t<ser:listaItems>
\t\t\t\t\t<ser:item>
\t\t\t\t\t\t<ser:descripcion>ITEM FACT ELECTRONICA</ser:descripcion>
\t\t\t\t\t\t<ser:codigo>FEL002</ser:codigo>
\t\t\t\t\t\t<ser:unidadMedida>und</ser:unidadMedida>
\t\t\t\t\t\t<ser:cantidad>1.00</ser:cantidad>
\t\t\t\t\t\t<ser:precioUnitario>100.00</ser:precioUnitario>
\t\t\t\t\t\t<ser:valorTotal>107.00</ser:valorTotal>
\t\t\t\t\t\t<ser:tasaITBMS>01</ser:tasaITBMS>
\t\t\t\t\t\t<ser:valorITBMS>7.00</ser:valorITBMS>
\t\t\t\t\t</ser:item>
\t\t\t\t</ser:listaItems>
\t\t\t\t<ser:totalesSubTotales>
\t\t\t\t\t<ser:totalPrecioNeto>100.00</ser:totalPrecioNeto>
\t\t\t\t\t<ser:totalITBMS>7.00</ser:totalITBMS>
\t\t\t\t\t<ser:totalMontoGravado>7.00</ser:totalMontoGravado>
\t\t\t\t\t<ser:totalFactura>107.00</ser:totalFactura>
\t\t\t\t\t<ser:nroItems>1</ser:nroItems>
\t\t\t\t\t<ser:totalTodosItems>107.00</ser:totalTodosItems>
\t\t\t\t\t<ser:listaFormaPago>
\t\t\t\t\t\t<ser:formaPago>
\t\t\t\t\t\t\t<ser:formaPagoFact>01</ser:formaPagoFact>
\t\t\t\t\t\t\t<ser:valorCuotaPagada>107.00</ser:valorCuotaPagada>
\t\t\t\t\t\t</ser:formaPago>
\t\t\t\t\t</ser:listaFormaPago>
\t\t\t\t</ser:totalesSubTotales>
\t\t\t</tem:documento>
\t\t</tem:Enviar>
\t</soapenv:Body>
</soapenv:Envelope>`;

const testApiSchema = z.object({
  companyId: z.string().min(1, 'Debes seleccionar una compañía.'),
  environment: z.enum(['Demo', 'Production'], {
    required_error: 'Debes seleccionar un ambiente.',
  }),
  endpoint: z.string().min(1, 'Debes seleccionar un endpoint.'),
  payloadXml: z.string().min(1, 'El payload XML no puede estar vacío.'),
});

type TestApiFormValues = z.infer<typeof testApiSchema>;

export default function TestingPage() {
  const { toast } = useToast();
  const { db } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isCompaniesLoading, setIsCompaniesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const form = useForm<TestApiFormValues>({
    resolver: zodResolver(testApiSchema),
    defaultValues: {
      companyId: '',
      environment: 'Demo',
      endpoint: 'Enviar',
      payloadXml: defaultEnviarXml,
    },
  });

  useEffect(() => {
    async function fetchCompanies() {
      if (!db) {
        return;
      }
      setIsCompaniesLoading(true);
      try {
        const fetchedCompanies = await getCompanies(db);
        setCompanies(fetchedCompanies);
      } catch (error) {
        toast({
          title: "Error al Cargar Compañías",
          description: "No se pudieron obtener las compañías desde Firestore.",
          variant: "destructive"
        });
      } finally {
        setIsCompaniesLoading(false);
      }
    }
    fetchCompanies();
  }, [db, toast]);

  async function onSubmit(values: TestApiFormValues) {
    setIsSubmitting(true);
    setResponse(null);

    try {
      const res = await fetch('/api/v1/testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      setResponse(data);

      if (!res.ok || !data.success) {
        toast({
          title: 'Error en la Prueba de API',
          description: data.message || 'La solicitud al proxy falló.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Prueba Exitosa',
          description: `La API de HKA respondió con estado ${data.statusCode}.`,
        });
      }
    } catch (error: any) {
      setResponse({ success: false, message: error.message });
      toast({
        title: 'Error de Red',
        description: 'No se pudo conectar con el endpoint de pruebas.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCompanyChange = (value: string) => {
    if (value === 'add-new-company') {
      router.push('/signup/complete-profile');
    } else {
      form.setValue('companyId', value);
    }
  };

  const allowedEndpoints = [
      'Enviar', 'EstadoDocumento', 'AnulacionDocumento', 'DescargaXML', 'FoliosRestantes', 'EnvioCorreo', 'DescargaPDF', 'RastreoCorreo', 'ConsultarRucDV'
  ];

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="font-headline text-2xl font-bold tracking-tight">Centro de Pruebas SOAP</h1>
          <p className="text-muted-foreground">
            Envía solicitudes directas a la API SOAP de The Factory HKA.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de la Solicitud</CardTitle>
            <CardDescription>
              Selecciona la compañía, ambiente y el endpoint SOAP a probar. Los placeholders `TOKENEMPRESA` y `TOKENPASSWORD` serán reemplazados automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compañía</FormLabel>
                        <Select
                          onValueChange={handleCompanyChange}
                          value={field.value}
                          disabled={isCompaniesLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una compañía..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isCompaniesLoading ? (
                                <SelectItem value="loading" disabled>Cargando...</SelectItem>
                            ) : (
                                companies.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                  </SelectItem>
                                ))
                            )}
                            <SelectSeparator />
                             <SelectItem value="add-new-company" className="text-primary focus:text-primary">
                               <div className="flex items-center gap-2">
                                 <PlusCircle className="h-4 w-4" />
                                 <span>Añadir nueva compañía</span>
                               </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ambiente</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un ambiente..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Demo">Demo</SelectItem>
                            <SelectItem value="Production">Producción</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="endpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endpoint SOAP</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un endpoint..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allowedEndpoints.map(ep => (
                             <SelectItem key={ep} value={ep}>{ep}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payloadXml"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payload XML</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Pega tu XML de SOAP aquí..."
                          className="font-mono h-96 text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Enviar Solicitud
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Respuesta de la API</CardTitle>
            <CardDescription>
              Aquí se mostrará la respuesta cruda recibida desde el servidor de HKA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitting ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : response ? (
              <div>
                <Alert variant={response.success ? 'default' : 'destructive'}>
                  <AlertTitle>
                    {response.success ? `Éxito (Código ${response.statusCode})` : 'Error'}
                  </AlertTitle>
                  <AlertDescription>
                    {response.message || 'Se recibió una respuesta de la API.'}
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <Label>Cuerpo de la Respuesta (XML)</Label>
                  <pre className="mt-2 h-auto max-h-[600px] w-full overflow-auto rounded-md bg-muted p-4 text-xs">
                    <code>{response.body || response.details || JSON.stringify(response, null, 2)}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <p>La respuesta de la API aparecerá aquí.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
