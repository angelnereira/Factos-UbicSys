/**
 * @fileoverview Zod schemas for validating The Factory HKA API request structures.
 */

import { z } from 'zod';

const ClienteSchema = z.object({
  tipoClienteFE: z.string(),
  tipoContribuyente: z.string(),
  numeroRUC: z.string(),
  digitoVerificadorRUC: z.string(),
  razonSocial: z.string(),
  direccion: z.string(),
  codigoUbicacion: z.string(),
  provincia: z.string(),
  distrito: z.string(),
  corregimiento: z.string(),
  tipoIdentificacion: z.string().optional(),
  nroIdentificacionExtranjero: z.string().optional(),
  paisExtranjero: z.string().optional(),
  telefono1: z.string(),
  telefono2: z.string().optional(),
  telefono3: z.string().optional(),
  correoElectronico1: z.string().email(),
  correoElectronico2: z.string().email().optional(),
  correoElectronico3: z.string().email().optional(),
  pais: z.string(),
  paisOtro: z.string().optional(),
});

const DatosFacturaExportacionSchema = z.object({
  condicionesEntrega: z.string(),
  monedaOperExportacion: z.string(),
  monedaOperExportacionNonDef: z.string().optional(),
  tipoDeCambio: z.string(),
  montoMonedaExtranjera: z.string(),
  puertoEmbarque: z.string(),
}).optional();

const ListaDocsFiscalReferenciadoSchema = z.object({
  fechaEmisionDocFiscalReferenciado: z.string(),
  cufeFEReferenciada: z.string(),
  nroFacturaPapel: z.string().optional(),
  nroFacturaImpFiscal: z.string().optional(),
});

const ListaAutorizadosDescargaFEyEventoSchema = z.object({
  tipoContribuyente: z.string(),
  rucReceptor: z.string(),
  digitoVerifRucReceptor: z.string(),
});

const DatosTransaccionSchema = z.object({
  tipoEmision: z.string(),
  fechaInicioContingencia: z.string().optional(),
  motivoContingencia: z.string().optional(),
  tipoDocumento: z.string(),
  numeroDocumentoFiscal: z.string(),
  puntoFacturacionFiscal: z.string(),
  fechaEmision: z.string(),
  fechaSalida: z.string(),
  naturalezaOperacion: z.string(),
  tipoOperacion: z.string(),
  destinoOperacion: z.string(),
  formatoCAFE: z.string(),
  entregaCAFE: z.string(),
  envioContenedor: z.string(),
  procesoGeneracion: z.string(),
  tipoVenta: z.string().optional(),
  informacionInteres: z.string().optional(),
  cliente: ClienteSchema,
  datosFacturaExportacion: DatosFacturaExportacionSchema,
  listaDocsFiscalReferenciados: z.array(ListaDocsFiscalReferenciadoSchema).optional(),
  listaAutorizadosDescargaFEyEventos: z.array(ListaAutorizadosDescargaFEyEventoSchema).optional(),
});

const ListaItemSchema = z.object({
  descripcion: z.string(),
  codigo: z.string(),
  unidadMedida: z.string(),
  cantidad: z.string(),
  precioUnitario: z.string(),
  precioItem: z.string(),
  valorTotal: z.string(),
  tasaITBMS: z.string(),
  valorITBMS: z.string(),
  // Adding other optional fields from the type definition
  fechaFabricacion: z.string().optional(),
  fechaCaducidad: z.string().optional(),
  codigoCPBSAbrev: z.string().optional(),
  codigoCPBS: z.string().optional(),
  unidadMedidaCPBS: z.string().optional(),
  infoItem: z.string().optional(),
  precioUnitarioDescuento: z.string().optional(),
  precioAcarreo: z.string().optional(),
  precioSeguro: z.string().optional(),
  codigoGTIN: z.string().optional(),
  cantGTINCom: z.string().optional(),
  codigoGTINInv: z.string().optional(),
  cantGTINComInv: z.string().optional(),
  tasaISC: z.string().optional(),
  valorISC: z.string().optional(),
  listaItemOTI: z.array(z.any()).optional(), // Define more strictly if needed
  vehiculo: z.any().optional(), // Define more strictly if needed
  medicina: z.any().optional(), // Define more strictly if needed
  pedidoComercialItem: z.any().optional(), // Define more strictly if needed
});

const TotalesSubTotalesSchema = z.object({
  totalPrecioNeto: z.string(),
  totalITBMS: z.string(),
  totalISC: z.string().optional(),
  totalMontoGravado: z.string(),
  totalFactura: z.string(),
  nroItems: z.string(),
  totalTodosItems: z.string(),
  // Adding other optional fields
  totalDescuento: z.string().optional(),
  totalAcarreoCobrado: z.string().optional(),
  valorSeguroCobrado: z.string().optional(),
  totalValorRecibido: z.string().optional(),
  vuelto: z.string().optional(),
  tiempoPago: z.string().optional(),
  listaDescBonificacion: z.array(z.any()).optional(),
  listaFormaPago: z.array(z.any()).optional(),
  retencion: z.any().optional(),
  listaPagoPlazo: z.array(z.any()).optional(),
  listaTotalOTI: z.array(z.any()).optional(),
});

const DocumentoSchema = z.object({
  codigoSucursalEmisor: z.string(),
  tipoSucursal: z.string(),
  datosTransaccion: DatosTransaccionSchema,
  listaItems: z.array(ListaItemSchema).min(1),
  totalesSubTotales: TotalesSubTotalesSchema,
  // Adding other optional fields
  pedidoComercialGlobal: z.any().optional(),
  infoLogistica: z.any().optional(),
  infoEntrega: z.any().optional(),
  usoPosterior: z.any().optional(),
  listaExtras: z.array(z.any()).optional(),
  serialDispositivo: z.string().optional(),
});

export const FactoryHkaDocumentRequestSchema = z.object({
  documento: DocumentoSchema,
});
