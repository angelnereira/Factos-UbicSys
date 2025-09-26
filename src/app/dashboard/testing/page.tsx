
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FlaskConical, Loader2, Send, Upload, File as FileIcon, Building, ChevronsUpDown, Check, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Company } from '@/lib/types';
import { getCompanies, addCompany as addCompanyToDb } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';


type Endpoint = 'ConsultarEmpresa' | 'CrearFactura' | 'ConsultarEstatusDocumento' | 'AnularDocumento';
type Environment = 'Demo' | 'Production';

const examplePayloads: Record<Endpoint, any> = {
  ConsultarEmpresa: {}, // This endpoint often uses credentials from headers
  CrearFactura: {
    documento: {
      codigoSucursalEmisor: "001",
      datosTransaccion: {
        tipoDocumento: "01",
        numeroDocumentoFiscal: `TEST-${Math.floor(Date.now() / 1000)}`,
        fechaEmision: new Date().toISOString(),
        cliente: {
          tipoClienteFE: "02",
          tipoContribuyente: "01",
          numeroRUC: "123456-7-890123",
          digitoVerificadorRUC: "45",
          razonSocial: "Cliente de Prueba",
          direccion: "Ciudad de Panamá",
          correoElectronico1: "cliente@prueba.com",
          pais: "PA"
        }
      },
      listaItems: [{
        descripcion: "Producto de prueba",
        cantidad: "1.00",
        precioUnitario: "1.00",
        valorTotal: "1.07",
        tasaITBMS: "0.07",
        valorITBMS: "0.07"
      }],
      totalesSubTotales: {
        totalPrecioNeto: "1.00",
        totalITBMS: "0.07",
        totalMontoGravado: "1.00",
        totalFactura: "1.07",
      }
    }
  },
  ConsultarEstatusDocumento: {
    cufe: 'e1c2b3d4-a5f6-7890-1234-abcdef123456'
  },
  AnularDocumento: {
    cufe: 'e1c2b3d4-a5f6-7890-1234-abcdef123456',
    motivoAnulacion: '01',
  }
};

export default function TestingPage() {
  const { db, user } = useAuth();
  const { toast } = useToast();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [environment, setEnvironment] = useState<Environment>('Demo');
  const [endpoint, setEndpoint] = useState<Endpoint>('CrearFactura');
  const [payload, setPayload] = useState(JSON.stringify(examplePayloads.CrearFactura, null, 2));
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [openCompanySelector, setOpenCompanySelector] = useState(false);

  const fetchCompanies = useCallback(async () => {
      if (!db) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const fetchedCompanies = await getCompanies(db);
      setCompanies(fetchedCompanies);

      if (fetchedCompanies.length > 0 && !selectedCompany) {
        setSelectedCompany(fetchedCompanies[0]);
      }
      setIsLoading(false);
  }, [db, selectedCompany]);

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db]);
  
  const addCompany = async (companyName: string) => {
    if (!db || !user) return;
    setIsLoading(true);
    const newCompanyData: Omit<Company, 'id'> = {
      name: companyName,
      email: user.email || `${companyName.toLowerCase().replace(/\s/g, '_')}@example.com`,
      authUid: user.uid,
      status: 'Demo',
      onboarded: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      integrationConfig: { erpType: 'api', notificationSettings: { emailNotifications: true, webhookNotifications: false, smsNotifications: false } },
      factoryHkaConfig: {
        demo: { username: "user_demo", isActive: true, maxDocumentsPerMonth: 100, documentsUsedThisMonth: 0 },
        production: { username: "user_prod", isActive: false },
      },
    };
    const { id, error } = await addCompanyToDb(db, newCompanyData);
    if (id && !error) {
        const newCompany = { ...newCompanyData, id } as Company;
        toast({ title: "Compañía Creada", description: `La compañía '${companyName}' ha sido registrada.` });
        await fetchCompanies();
        setSelectedCompany(newCompany);
    } else {
        toast({ title: "Error", description: "No se pudo crear la compañía.", variant: "destructive" });
    }
    setIsLoading(false);
  }


  const handleEndpointChange = (value: string) => {
    const newEndpoint = value as Endpoint;
    setEndpoint(newEndpoint);
    const newPayload = newEndpoint === 'ConsultarEmpresa' ? {} : examplePayloads[newEndpoint];
    setPayload(JSON.stringify(newPayload, null, 2));
    setResponse(null);
    setFileName(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const fileType = file.type;
        const fileName = file.name;

        if (fileType === 'application/json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result;
                if (typeof content === 'string') {
                    try {
                        const parsed = JSON.parse(content);
                        setPayload(JSON.stringify(parsed, null, 2));
                        setFileName(fileName);
                        toast({
                            title: "Archivo JSON cargado",
                            description: `El contenido de ${fileName} se ha cargado en el payload.`
                        });
                    } catch (error) {
                         toast({
                            title: "Error al leer el archivo",
                            description: "El archivo JSON no tiene un formato válido.",
                            variant: "destructive"
                        });
                    }
                }
            };
            reader.readAsText(file);
        } else if (fileType === 'application/xml' || fileType === 'text/xml' || fileType.startsWith('application/vnd.')) {
            setFileName(fileName);
            toast({
                title: "Archivo Recibido",
                description: `Se cargó ${fileName}. La conversión automática a JSON para este formato estará disponible próximamente.`
            });
            setPayload(JSON.stringify({ "message": `Contenido del archivo ${fileName} será procesado aquí.`}, null, 2));

        } else {
             toast({
                title: "Archivo no soportado",
                description: "Por favor, selecciona un archivo .json, .xml, .xls, .xlsx o .pdf.",
                variant: "destructive"
            });
        }
    }
  };
  
  const handleTest = async () => {
    if (!selectedCompany) {
      toast({
        title: "Compañía no seleccionada",
        description: "Por favor, selecciona o crea una compañía para la prueba.",
        variant: "destructive",
      });
      return;
    }

    let parsedPayload;
    try {
        parsedPayload = JSON.parse(payload);
    } catch (error) {
        toast({
            title: "JSON Inválido",
            description: "El payload de la solicitud no es un JSON válido.",
            variant: "destructive",
        });
        return;
    }

    setIsSubmitting(true);
    setResponse(null);

    try {
        const apiResponse = await fetch('/api/v1/testing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                companyId: selectedCompany.id,
                environment,
                endpoint,
                payload: parsedPayload,
            }),
        });

        const data = await apiResponse.json();
        setResponse(data);

        if (!apiResponse.ok) {
            toast({
                title: `Error de la API de HKA (Código: ${apiResponse.status})`,
                description: data.message || data.Mensaje || 'La API devolvió una respuesta de error.',
                variant: 'destructive',
            });
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error de red desconocido";
        setResponse({ message: `Error al conectar con el servidor proxy: ${errorMessage}` });
        toast({
            title: "Error de Conexión",
            description: "No se pudo conectar con el servidor de pruebas local.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
      <div className="flex-1 space-y-4">
        <div className="flex items-center">
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight">
              Centro de Pruebas de API
            </h1>
            <p className="text-muted-foreground">
              Ejecuta llamadas reales a la API de The Factory HKA en un ambiente controlado.
            </p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Configuración de la Solicitud</CardTitle>
              <CardDescription>
                Selecciona la compañía, ambiente, endpoint y ajusta el payload.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="company">Compañía (Credenciales)</Label>
                        <Popover open={openCompanySelector} onOpenChange={setOpenCompanySelector}>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openCompanySelector}
                                className="w-full justify-between"
                                disabled={isLoading}
                                >
                                {selectedCompany
                                    ? <span className="truncate">{selectedCompany.name}</span>
                                    : "Seleccionar compañía..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command filter={(value, search) => {
                                    const company = companies.find(c => c.id === value);
                                    if (company?.name.toLowerCase().includes(search.toLowerCase())) return 1;
                                    return 0;
                                }}>
                                    <CommandInput placeholder="Buscar o crear compañía..." />
                                    <CommandList>
                                        <CommandEmpty>
                                            <Button variant="ghost" className="w-full justify-start" onClick={() => {
                                                const searchInput = document.querySelector('input[cmdk-input]') as HTMLInputElement;
                                                if (searchInput.value) {
                                                    addCompany(searchInput.value);
                                                    setOpenCompanySelector(false);
                                                }
                                            }}>
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Crear nueva compañía
                                            </Button>
                                        </CommandEmpty>
                                        <CommandGroup>
                                        {companies.map((company) => (
                                            <CommandItem
                                            key={company.id}
                                            value={company.id}
                                            onSelect={(currentValue) => {
                                                const company = companies.find(c => c.id === currentValue);
                                                setSelectedCompany(company || null);
                                                setOpenCompanySelector(false);
                                            }}
                                            >
                                            <Check
                                                className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedCompany?.id === company.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {company.name}
                                            </CommandItem>
                                        ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="environment">Ambiente</Label>
                        <Select onValueChange={(v) => setEnvironment(v as Environment)} defaultValue={environment}>
                            <SelectTrigger id="environment">
                                <SelectValue placeholder="Seleccionar ambiente" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Demo">Demo</SelectItem>
                                <SelectItem value="Production">Producción</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint de la API</Label>
                <Select onValueChange={handleEndpointChange} defaultValue={endpoint}>
                    <SelectTrigger id="endpoint">
                        <SelectValue placeholder="Seleccionar endpoint" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ConsultarEmpresa">/ConsultarEmpresa</SelectItem>
                        <SelectItem value="CrearFactura">/CrearFactura</SelectItem>
                        <SelectItem value="ConsultarEstatusDocumento">/ConsultarEstatusDocumento</SelectItem>
                        <SelectItem value="AnularDocumento">/AnularDocumento</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                  <Label>Cargar Payload desde Archivo</Label>
                  <div className="flex items-center justify-center w-full">
                      <Label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haz clic para cargar</span> o arrastra y suelta</p>
                              <p className="text-xs text-muted-foreground">JSON, XML, XLS, XLSX, PDF</p>
                          </div>
                          <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="application/json, application/xml, text/xml, .xls, .xlsx, application/pdf" />
                      </Label>
                  </div>
                  {fileName && (
                      <div className="flex items-center text-sm text-muted-foreground p-2 border rounded-md">
                          <FileIcon className="h-4 w-4 mr-2" />
                          <span>{fileName}</span>
                      </div>
                  )}
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="payload">Payload (JSON)</Label>
                  <Textarea 
                      id="payload"
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      rows={15}
                      className="font-mono text-xs"
                  />
              </div>

              <Button 
                onClick={handleTest} 
                disabled={isSubmitting || isLoading}
                className="w-full bg-chart-4 text-black hover:bg-chart-4/90 dark:bg-chart-4 dark:hover:bg-chart-4/90"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Ejecutar Prueba Real
              </Button>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Respuesta de la API</CardTitle>
              <CardDescription>
                Aquí se mostrará el resultado real de la llamada a la API de HKA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitting && !response && (
                <div className="flex items-center justify-center h-full p-8">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isSubmitting && !response && (
                <div className="flex flex-col items-center justify-center text-center p-8 border-dashed border-2 rounded-lg h-full">
                  <FlaskConical className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    La respuesta de la API aparecerá aquí después de ejecutar una prueba.
                  </p>
                </div>
              )}
              {response && (
                   <div className="space-y-4">
                      <Alert variant={(response.Codigo === 200 || response.Resultado === 'Success') ? 'default' : 'destructive'}>
                          <AlertTitle>{(response.Codigo === 200 || response.Resultado === 'Success') ? 'Éxito' : 'Error'}</AlertTitle>
                          <AlertDescription>{response.Mensaje || response.message || 'La respuesta no contiene un mensaje estándar.'}</AlertDescription>
                      </Alert>
                      <div>
                           <Label>Respuesta Completa (JSON)</Label>
                          <pre className="mt-2 h-[400px] w-full overflow-auto rounded-md bg-muted p-4 text-xs font-mono">
                              <code>{JSON.stringify(response, null, 2)}</code>
                          </pre>
                      </div>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
