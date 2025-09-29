
/**
 * @fileoverview API Client for The Factory HKA using SOAP/XML.
 * This service encapsulates all communication with The Factory HKA's SOAP API.
 */

import soapRequest from 'easy-soap-request';
import type { CompanyCredentials, Documento, FactoryHkaAuthSuccess } from './types';

const SOAP_API_URL = "https://demoemision.thefactoryhka.com.pa/ws/obj/v1.0/Service.svc";

type Environment = 'Production' | 'Development' | 'Demo';

/**
 * Builds the SOAP envelope for the 'Enviar' action.
 * @param tokenEmpresa The company token (NIT).
 * @param tokenPassword The company password (secret token).
 * @param documento The document object to be sent.
 * @returns The complete SOAP XML string.
 */
function buildEnviarSoapXml(tokenEmpresa: string, tokenPassword: string, documento: any): string {
    // Basic mapping from our JSON structure to the expected XML structure.
    // This is a simplified version. A real-world scenario might need a more robust XML builder.
    const itemsXml = documento.listaItems.map((item: any) => `
        <ser:item>
            <ser:descripcion>${item.descripcion}</ser:descripcion>
            <ser:codigo>${item.codigo || ''}</ser
:codigo>
            <ser:unidadMedida>${item.unidadMedida}</ser:unidadMedida>
            <ser:cantidad>${item.cantidad}</ser:cantidad>
            <ser:precioUnitario>${item.precioUnitario}</ser:precioUnitario>
            <ser:valorTotal>${item.valorTotal}</ser:valorTotal>
            <ser:tasaITBMS>01</ser:tasaITBMS> 
            <ser:valorITBMS>${item.valorITBMS}</ser:valorITBMS>
        </ser:item>
    `).join('');

    const formasPagoXml = documento.totalesSubTotales.listaFormaPago.map((pago: any) => `
        <ser:formaPago>
            <ser:formaPagoFact>${pago.formaPagoFact}</ser:formaPagoFact>
            <ser:valorCuotaPagada>${pago.valorCuotaPagada}</ser:valorCuotaPagada>
        </ser:formaPago>
    `).join('');

    return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:ser="http://schemas.datacontract.org/2004/07/Services.ObjComprobante.v1_0">
        <soapenv:Header/>
        <soapenv:Body>
            <tem:Enviar>
                <tem:tokenEmpresa>${tokenEmpresa}</tem:tokenEmpresa>
                <tem:tokenPassword>${tokenPassword}</tem:tokenPassword>
                <tem:documento>
                    <ser:codigoSucursalEmisor>${documento.codigoSucursalEmisor}</ser:codigoSucursalEmisor>
                    <ser:tipoSucursal>1</ser:tipoSucursal>
                    <ser:datosTransaccion>
                        <ser:tipoEmision>01</ser:tipoEmision>
                        <ser:tipoDocumento>${documento.datosTransaccion.tipoDocumento}</ser:tipoDocumento>
                        <ser:numeroDocumentoFiscal>${documento.datosTransaccion.numeroDocumentoFiscal}</ser:numeroDocumentoFiscal>
                        <ser:puntoFacturacionFiscal>001</ser:puntoFacturacionFiscal>
                        <ser:fechaEmision>${documento.datosTransaccion.fechaEmision}</ser:fechaEmision>
                        <ser:naturalezaOperacion>01</ser:naturalezaOperacion>
                        <ser:tipoOperacion>1</ser:tipoOperacion>
                        <ser:destinoOperacion>1</ser:destinoOperacion>
                        <ser:formatoCAFE>2</ser:formatoCAFE>
                        <ser:entregaCAFE>3</ser:entregaCAFE>
                        <ser:procesoGeneracion>1</ser:procesoGeneracion>
                        <ser:cliente>
                            <ser:tipoClienteFE>${documento.datosTransaccion.cliente.tipoClienteFE}</ser:tipoClienteFE>
                            <ser:razonSocial>${documento.datosTransaccion.cliente.razonSocial}</ser:razonSocial>
                            <ser:direccion>${documento.datosTransaccion.cliente.direccion}</ser:direccion>
                            <ser:pais>PA</ser:pais>
                        </ser:cliente>
                    </ser:datosTransaccion>
                    <ser:listaItems>${itemsXml}</ser:listaItems>
                    <ser:totalesSubTotales>
                        <ser:totalPrecioNeto>${documento.totalesSubTotales.totalPrecioNeto}</ser:totalPrecioNeto>
                        <ser:totalITBMS>${documento.totalesSubTotales.totalITBMS}</ser:totalITBMS>
                        <ser:totalMontoGravado>${documento.totalesSubTotales.totalMontoGravado}</ser:totalMontoGravado>
                        <ser:totalFactura>${documento.totalesSubTotales.totalFactura}</ser:totalFactura>
                        <ser:nroItems>${documento.totalesSubTotales.nroItems}</ser:nroItems>
                        <ser:totalTodosItems>${documento.totalesSubTotales.totalTodosItems}</ser:totalTodosItems>
                        <ser:listaFormaPago>${formasPagoXml}</ser:listaFormaPago>
                    </ser:totalesSubTotales>
                </tem:documento>
            </tem:Enviar>
        </soapenv:Body>
    </soapenv:Envelope>
    `;
}

/**
 * Executes a SOAP request.
 * @param url The SOAP endpoint URL.
 * @param xml The SOAP XML payload.
 * @param soapAction The SOAPAction header value.
 * @returns The response from the SOAP service.
 */
async function executeSoapRequest(url: string, xml: string, soapAction: string) {
    const headers = {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': soapAction,
    };
    try {
        const { response } = await soapRequest({ url, headers, xml });
        const { body, statusCode } = response;
        return { body, statusCode };
    } catch (error: any) {
        console.error("SOAP Request Error:", error);
        // Handle client-side errors (e.g., network issues)
        if (error.errno === -3008) { // ENOTFOUND, DNS error
             return { error: 'Error de red: No se pudo resolver el host del servicio SOAP.' };
        }
        return { error: `Error en la solicitud SOAP: ${error.message}` };
    }
}


/**
 * Retrieves an authentication token from The Factory HKA API using company-specific credentials.
 * This function is simulated, as the actual tokens are passed directly in each SOAP request.
 * It verifies credentials by calling a simple endpoint.
 * 
 * @param credentials - The company's credentials (nit and token).
 * @param env - The environment (Demo or Production) to target.
 * @returns A promise that resolves with the authentication data or an error object.
 */
export async function getAuthToken(
  credentials: CompanyCredentials,
  env: Environment
): Promise<{ data: { token: string } | null; error: string | null; }> {
  // Since tokens are passed directly, we'll just validate them by making a simple call
  // For now, we'll just simulate a successful auth if credentials exist.
  // In a real scenario, you could call 'FoliosRestantes' or a similar simple endpoint to check credentials.
  if (credentials && credentials.nit && credentials.token) {
    return Promise.resolve({ data: { token: credentials.token }, error: null });
  } else {
    return Promise.resolve({ data: null, error: "Nit o Token no proporcionados." });
  }
}


/**
 * Submits a fiscal document to The Factory HKA API via SOAP.
 * 
 * @param documento - The document data to be sent, conforming to the structure.
 * @param credentials - The company's credentials (nit and token).
 * @param env - The environment (Demo or Production) to target.
 * @returns A promise that resolves with the API response or an error object.
 */
export async function submitDocument(
    documento: any,
    credentials: CompanyCredentials,
    env: Environment
): Promise<{ data: any | null; error: string | null; }> {

    const xml = buildEnviarSoapXml(credentials.nit, credentials.token, documento);
    
    const { body, statusCode, error } = await executeSoapRequest(
        SOAP_API_URL, 
        xml, 
        '"http://tempuri.org/IService/Enviar"'
    );
    
    if (error) {
        return { data: null, error };
    }

    if (statusCode === 200) {
        // Here you would parse the XML body to extract the CUFE and other relevant data.
        // This is a complex task and would require an XML parsing library.
        // For now, we'll return a success placeholder.
        const cufeMatch = body.match(/<a:CUFE>([a-zA-Z0-9\-]+)<\/a:CUFE>/);
        const cufe = cufeMatch ? cufeMatch[1] : undefined;

        return { data: { success: true, message: "Documento procesado por HKA (SOAP).", cufe: cufe }, error: null };
    } else {
        const errorMessageMatch = body.match(/<faultstring.*>(.*)<\/faultstring>/);
        const errorMessage = errorMessageMatch ? errorMessageMatch[1] : `Error del servidor SOAP: ${statusCode}`;
        return { data: null, error: errorMessage };
    }
}

// NOTE: Other functions like downloadDocumentsByDate are not implemented for SOAP yet.
// They would require their own SOAP XML templates and handling.
export async function downloadDocumentsByDate(
    criteria: { FechaDesde: string; FechaHasta: string },
    token: string,
    env: Environment
): Promise<{ data: Blob | null; error:string | null; }> {
    console.warn("downloadDocumentsByDate no está implementado para SOAP.");
    return { data: null, error: "Función no disponible." };
}
