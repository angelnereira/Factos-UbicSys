/**
 * @fileoverview Type definitions for The Factory HKA API.
 * This file contains the interfaces for the data structures
 * used when communicating with The Factory HKA services.
 */

/**
 * Represents the successful response from The Factory HKA authentication endpoint.
 */
export interface FactoryHkaAuthSuccess {
  codigo: string;
  mensaje: string;
  token: string;
  expiracion: string; // Expiration date string, e.g., "2025-09-22T15:26:55.2510335Z"
}

/**
 * Represents an error response from The Factory HKA API.
 */
export interface FactoryHkaError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Represents the response from the document submission endpoint.
 */
export interface FactoryHkaDocumentResponse {
    // This is a placeholder. The actual structure should be updated
    // once a successful response is available.
    success: boolean;
    message: string;
    documentId?: string;
    cufe?: string;
}


// --- Document Submission Types ---

/**
 * Represents the main document structure sent to The Factory HKA API.
 */
export interface FactoryHkaDocumentRequest {
  documento: Documento;
}

export interface Documento {
  codigoSucursalEmisor: string;
  tipoSucursal: string;
  datosTransaccion: DatosTransaccion;
  listaItems: ListaItem[];
  totalesSubTotales: TotalesSubTotales;
  pedidoComercialGlobal: PedidoComercialGlobal;
  infoLogistica: InfoLogistica;
  infoEntrega: InfoEntrega;
  usoPosterior: UsoPosterior;
  listaExtras: ListaExtra[];
  serialDispositivo: string;
}

export interface DatosTransaccion {
  tipoEmision: string;
  fechaInicioContingencia: string;
  motivoContingencia: string;
  tipoDocumento: string;
  numeroDocumentoFiscal: string;
  puntoFacturacionFiscal: string;
  fechaEmision: string;
  fechaSalida: string;
  naturalezaOperacion: string;
  tipoOperacion: string;
  destinoOperacion: string;
  formatoCAFE: string;
  entregaCAFE: string;
  envioContenedor: string;
  procesoGeneracion: string;
  tipoVenta: string;
  informacionInteres: string;
  cliente: Cliente;
  datosFacturaExportacion: DatosFacturaExportacion;
  listaDocsFiscalReferenciados: ListaDocsFiscalReferenciado[];
  listaAutorizadosDescargaFEyEventos: ListaAutorizadosDescargaFEyEvento[];
}

export interface Cliente {
  tipoClienteFE: string;
  tipoContribuyente: string;
  numeroRUC: string;
  digitoVerificadorRUC: string;
  razonSocial: string;
  direccion: string;
  codigoUbicacion: string;
  provincia: string;
  distrito: string;
  corregimiento: string;
  tipoIdentificacion: string;
  nroIdentificacionExtranjero: string;
  paisExtranjero: string;
  telefono1: string;
  telefono2: string;
  telefono3: string;
  correoElectronico1: string;
  correoElectronico2: string;
  correoElectronico3: string;
  pais: string;
paisOtro: string;
}

export interface DatosFacturaExportacion {
  condicionesEntrega: string;
  monedaOperExportacion: string;
  monedaOperExportacionNonDef: string;
  tipoDeCambio: string;
  montoMonedaExtranjera: string;
  puertoEmbarque: string;
}

export interface ListaDocsFiscalReferenciado {
  fechaEmisionDocFiscalReferenciado: string;
  cufeFEReferenciada: string;
  nroFacturaPapel: string;
  nroFacturaImpFiscal: string;
}

export interface ListaAutorizadosDescargaFEyEvento {
  tipoContribuyente: string;
  rucReceptor: string;
  digitoVerifRucReceptor: string;
}

export interface ListaItem {
  descripcion: string;
  codigo: string;
  unidadMedida: string;
  cantidad: string;
  fechaFabricacion: string;
  fechaCaducidad: string;
  codigoCPBSAbrev: string;
  codigoCPBS: string;
  unidadMedidaCPBS: string;
  infoItem: string;
  precioUnitario: string;
  precioUnitarioDescuento: string;
  precioItem: string;
  precioAcarreo: string;
  precioSeguro: string;
  valorTotal: string;
  codigoGTIN: string;
  cantGTINCom: string;
  codigoGTINInv: string;
  cantGTINComInv: string;
  tasaITBMS: string;
  valorITBMS: string;
  tasaISC: string;
  valorISC: string;
  listaItemOTI: ListaItemOTI[];
  vehiculo: Vehiculo;
  medicina: Medicina;
  pedidoComercialItem: PedidoComercialItem;
}

export interface ListaItemOTI {
  tasaOTI: string;
  valorTasa: string;
}

export interface Vehiculo {
  modalidadOperacionVenta: string;
  modalidadOperacionVentaNoDef: string;
  chasis: string;
  codigoColor: string;
  colorNombre: string;
  potenciaMotor: string;
  capacidadMotor: string;
  pesoNeto: string;
  pesoBruto: string;
  tipoCombustible: string;
  tipoCombustibleNoDef: string;
  numeroMotor: string;
  capacidadTraccion: string;
  distanciaEjes: string;
  anoModelo: string;
  anoFabricacion: string;
  tipoPintura: string;
  tipoPinturaNodef: string;
  tipoVehiculo: string;
  usoVehiculo: string;
  condicionVehiculo: string;
  capacidadPasajeros: string;
}

export interface Medicina {
  nroLote: string;
  cantProductosLote: string;
}

export interface PedidoComercialItem {
  nroPedidoCompraItem: string;
  nroItem: string;
  infoItem: string;
}

export interface TotalesSubTotales {
  totalPrecioNeto: string;
  totalITBMS: string;
  totalISC: string;
  totalMontoGravado: string;
  totalDescuento: string;
  totalAcarreoCobrado: string;
  valorSeguroCobrado: string;
  totalFactura: string;
  totalValorRecibido: string;
  vuelto: string;
  tiempoPago: string;
  nroItems: string;
  totalTodosItems: string;
  listaDescBonificacion: ListaDescBonificacion[];
  listaFormaPago: ListaFormaPago[];
  retencion: Retencion;
  listaPagoPlazo: ListaPagoPlazo[];
  listaTotalOTI: ListaTotalOTI[];
}

export interface ListaDescBonificacion {
  descDescuento: string;
  montoDescuento: string;
}

export interface ListaFormaPago {
  formaPagoFact: string;
  descFormaPago: string;
  valorCuotaPagada: string;
}

export interface Retencion {
  codigoRetencion: string;
  montoRetencion: string;
}

export interface ListaPagoPlazo {
  fechaVenceCuota: string;
  valorCuota: string;
  infoPagoCuota: string;
}

export interface ListaTotalOTI {
  codigoTotalOTI: string;
  valorTotalOTI: string;
}

export interface PedidoComercialGlobal {
  nroPedidoCompraGlobal: string;
  listaNroAceptacion: string[];
  codigoReceptor: string;
  codigoSistemaEmisor: string;
  infoPedido: string;
}

export interface InfoLogistica {
  nroVolumenes: string;
  pesoCarga: string;
  unidadPesoTotal: string;
  licVehiculoCarga: string;
  razonSocialTransportista: string;
  tipoRucTransportista: string;
  rucTransportista: string;
  digitoVerifRucTransportista: string;
  infoLogisticaEmisor: string;
}

export interface InfoEntrega {
  tipoRucEntrega: string;
  numeroRucEntrega: string;
  digitoVerifRucEntrega: string;
  razonSocialEntrega: string;
  direccionEntrega: string;
  codigoUbicacionEntrega: string;
  provinciaEntrega: string;
  distritoEntrega: string;
  corregimientoEntrega: string;
  telefonoEntrega: string;
  telefonoEntregaAlt: string;
}

export interface UsoPosterior {
  cufe: string;
}

export interface ListaExtra {
  attribute: string;
  enabled: string;
  id: string;
  orden: string;
  value: string;
}
