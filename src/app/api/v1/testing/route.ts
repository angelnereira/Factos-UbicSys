
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCompanyById_admin, adminDb } from '../documents/_lib/firebase-admin';
import type { CompanyCredentials } from '@/lib/factory-hka/types';
import soapRequest from 'easy-soap-request';

// Define endpoints allowed for testing to prevent abuse
const ALLOWED_ENDPOINTS = [
    'Enviar',
    'EstadoDocumento',
    'AnulacionDocumento',
    'DescargaXML',
    'FoliosRestantes',
    'EnvioCorreo',
    'DescargaPDF',
    'RastreoCorreo',
    'ConsultarRucDV'
];

const SOAP_API_URLS = {
    Demo: "https://demoemision.thefactoryhka.com.pa/ws/obj/v1.0/Service.svc",
    Production: "https://produccionemision.thefactoryhka.com.pa/ws/obj/v1.0/Service.svc" // Asumido, cambiar si es diferente
};


const testApiSchema = z.object({
    companyId: z.string().min(1, "El ID de la compañía es requerido."),
    environment: z.enum(['Demo', 'Production']),
    endpoint: z.string().refine(val => ALLOWED_ENDPOINTS.includes(val), {
        message: "Endpoint no válido o no permitido para pruebas."
    }),
    payloadXml: z.string().min(1, "El payload XML es requerido."),
});

export async function POST(request: Request) {
    if (!adminDb) {
        return NextResponse.json({ success: false, message: 'La configuración del servidor de base de datos no está disponible.' }, { status: 500 });
    }

    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ success: false, message: 'Cuerpo de la solicitud JSON inválido.' }, { status: 400 });
    }

    const validation = testApiSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json({ success: false, message: 'Datos de la solicitud inválidos.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { companyId, environment, endpoint, payloadXml } = validation.data;

    const company = await getCompanyById_admin(companyId);
    if (!company) {
        return NextResponse.json({ success: false, message: `Compañía con ID '${companyId}' no encontrada.` }, { status: 404 });
    }

    const hkaConfig = environment === 'Production' ? company.factoryHkaConfig.production : company.factoryHkaConfig.demo;
    
    if (!hkaConfig?.username || !hkaConfig?.password) {
        return NextResponse.json({ success: false, message: `Las credenciales para el ambiente '${environment}' no están configuradas para esta compañía.` }, { status: 400 });
    }

    const credentials: CompanyCredentials = {
        nit: hkaConfig.username,
        token: hkaConfig.password,
    };

    const url = SOAP_API_URLS[environment];
    const soapAction = `"http://tempuri.org/IService/${endpoint}"`;

    // Replace placeholders in the user-provided XML
    const finalXml = payloadXml
        .replace(/TOKENEMPRESA/g, credentials.nit)
        .replace(/TOKENPASSWORD/g, credentials.token);

    try {
        const { response } = await soapRequest({ url, headers: { 'Content-Type': 'text/xml', 'SOAPAction': soapAction }, xml: finalXml });
        const { body: responseBody, statusCode } = response;

        // Aquí, idealmente, convertiríamos el XML de respuesta a JSON para un manejo más fácil en el frontend.
        // Por ahora, devolvemos el cuerpo como texto. Una librería como 'xml-js' podría usarse aquí.
        return NextResponse.json({ success: true, statusCode, body: responseBody }, { status: 200 });

    } catch (error: any) {
        console.error(`[API Test Proxy] Error calling HKA endpoint '${endpoint}':`, error);
        const errorMessage = error.message || 'Error de red desconocido.';
        // 'error.response' puede contener el cuerpo de la respuesta SOAP con el error
        const errorBody = error.response?.body;
        return NextResponse.json({ success: false, message: `Ocurrió un error al contactar la API SOAP de HKA: ${errorMessage}`, details: errorBody }, { status: 502 });
    }
}
