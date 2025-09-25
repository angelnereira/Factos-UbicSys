
'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FlaskConical, Loader2, Send, Upload, File as FileIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Endpoint = 'consultarEmpresa' | 'crearFactura' | 'consultarEstatusDocumento' | 'anularDocumento';

const examplePayloads: Record<Endpoint, any> = {
  consultarEmpresa: {
    Nit: 'J000000000',
    TokenEmpresa: 'tu-token-empresa',
    TokenClave: 'tu-token-clave',
    Plataforma: 'TFHKA'
  },
  crearFactura: {
    documento: {
      codigoSucursalEmisor: "001",
      tipoSucursal: "01",
      datosTransaccion: {
        tipoEmision: "01",
        tipoDocumento: "01",
        numeroDocumentoFiscal: "000000001",
        puntoFacturacionFiscal: "001",
        fechaEmision: new Date().toISOString(),
        fechaSalida: new Date().toISOString(),
        naturalezaOperacion: "01",
        tipoOperacion: "01",
        destinoOperacion: "01",
        formatoCAFE: "01",
        entregaCAFE: "01",
        envioContenedor: "01",
        procesoGeneracion: "01",
        cliente: {
          tipoClienteFE: "02",
          tipoContribuyente: "01",
          numeroRUC: "123456-7-890123",
          digitoVerificadorRUC: "45",
          razonSocial: "Cliente de Prueba",
          direccion: "Ciudad de Panamá",
          codigoUbicacion: "7-7-7",
          provincia: "Panamá",
          distrito: "Panamá",
          corregimiento: "Ancón",
          telefono1: "123-4567",
          correoElectronico1: "cliente@prueba.com",
          pais: "PA"
        }
      },
      listaItems: [
        {
          descripcion: "Producto de prueba",
          codigo: "P-001",
          unidadMedida: "und",
          cantidad: "1.00",
          precioUnitario: "100.00",
          precioItem: "100.00",
          valorTotal: "107.00",
          tasaITBMS: "0.07",
          valorITBMS: "7.00"
        }
      ],
      totalesSubTotales: {
        totalPrecioNeto: "100.00",
        totalITBMS: "7.00",
        totalMontoGravado: "100.00",
        totalFactura: "107.00",
        nroItems: "1",
        totalTodosItems: "1"
      }
    }
  },
  consultarEstatusDocumento: {
    cufe: 'e1c2b3d4-a5f6-7890-1234-abcdef123456'
  },
  anularDocumento: {
    cufe: 'e1c2b3d4-a5f6-7890-1234-abcdef123456',
    motivoAnulacion: '01', // '01' para 'Anulación de la operación'
  }
};

export default function TestingPage() {
  const [endpoint, setEndpoint] = useState<Endpoint>('crearFactura');
  const [payload, setPayload] = useState(JSON.stringify(examplePayloads.crearFactura, null, 2));
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEndpointChange = (value: string) => {
    const newEndpoint = value as Endpoint;
    setEndpoint(newEndpoint);
    setPayload(JSON.stringify(examplePayloads[newEndpoint], null, 2));
    setResponse(null);
    setFileName(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.type !== 'application/json') {
            toast({
                title: "Archivo no válido",
                description: "Por favor, selecciona un archivo JSON.",
                variant: "destructive"
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content === 'string') {
                try {
                    const parsed = JSON.parse(content);
                    setPayload(JSON.stringify(parsed, null, 2));
                    setFileName(file.name);
                    toast({
                        title: "Archivo cargado",
                        description: `El contenido de ${file.name} se ha cargado en el payload.`
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
    }
  };
  
  const handleTest = async () => {
    setIsLoading(true);
    setResponse(null);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let simulatedResponse;
    switch (endpoint) {
      case 'consultarEmpresa':
        simulatedResponse = {
          Codigo: 200,
          Resultado: "Success",
          Mensaje: "Empresa consultada exitosamente.",
          Nit: "J000000000",
          idEmpresa: "emp-12345",
        };
        break;
      case 'crearFactura':
        simulatedResponse = {
            Codigo: 200,
            Resultado: "Success",
            Mensaje: "Documento recibido y en proceso de validación.",
            cufe: `test-cufe-${crypto.randomUUID()}`
        };
        break;
      case 'consultarEstatusDocumento':
        simulatedResponse = {
          Codigo: 200,
          Resultado: "Success",
          Mensaje: "Documento encontrado.",
          status: "Aprobado",
          cufe: JSON.parse(payload).cufe,
          fechaProcesamiento: new Date().toISOString()
        };
        break;
      case 'anularDocumento':
        simulatedResponse = {
          Codigo: 200,
          Resultado: "Success",
          Mensaje: "Solicitud de anulación recibida correctamente.",
          cufe: JSON.parse(payload).cufe,
        };
        break;
      default:
        simulatedResponse = {
          Codigo: 500,
          Resultado: "Error",
          Mensaje: "Endpoint no reconocido en la simulación."
        };
    }

    setResponse(simulatedResponse);
    setIsLoading(false);
  };

  return (
    <TooltipProvider>
      <div className="flex-1 space-y-4">
        <div className="flex items-center">
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight">
              Centro de Pruebas de API
            </h1>
            <p className="text-muted-foreground">
              Simula llamadas a la API de The Factory HKA en el entorno de demostración.
            </p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Configuración de la Solicitud</CardTitle>
              <CardDescription>
                Selecciona el endpoint y ajusta el payload de la solicitud.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint de la API</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select onValueChange={handleEndpointChange} defaultValue={endpoint}>
                      <SelectTrigger id="endpoint">
                        <SelectValue placeholder="Seleccionar endpoint" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultarEmpresa">/ConsultarEmpresa</SelectItem>
                        <SelectItem value="crearFactura">/CrearFactura</SelectItem>
                        <SelectItem value="consultarEstatusDocumento">/ConsultarEstatusDocumento</SelectItem>
                        <SelectItem value="anularDocumento">/AnularDocumento</SelectItem>
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Elige el endpoint de la API de HKA que deseas probar.</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-2">
                  <Label>Cargar Payload desde Archivo</Label>
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <div className="flex items-center justify-center w-full">
                          <Label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haz clic para cargar</span> o arrastra y suelta</p>
                                  <p className="text-xs text-muted-foreground">Archivo JSON</p>
                              </div>
                              <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="application/json" />
                          </Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Carga un archivo JSON para usarlo como payload de la solicitud.</p>
                    </TooltipContent>
                  </Tooltip>
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
                      rows={20}
                      className="font-mono text-xs"
                  />
              </div>

              <Button onClick={handleTest} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Ejecutar Prueba
              </Button>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Respuesta de la API</CardTitle>
              <CardDescription>
                Aquí se mostrará el resultado de la llamada a la API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center h-full p-8">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isLoading && !response && (
                <div className="flex flex-col items-center justify-center text-center p-8 border-dashed border-2 rounded-lg h-full">
                  <FlaskConical className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    La respuesta de la API aparecerá aquí después de ejecutar una prueba.
                  </p>
                </div>
              )}
              {response && (
                   <div className="space-y-4">
                      <Alert variant={response.Codigo === 200 ? 'default' : 'destructive'}>
                          <AlertTitle>{response.Codigo === 200 ? 'Éxito (Código 200)' : 'Error'}</AlertTitle>
                          <AlertDescription>{response.Mensaje}</AlertDescription>
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
    </TooltipProvider>
  );
}
