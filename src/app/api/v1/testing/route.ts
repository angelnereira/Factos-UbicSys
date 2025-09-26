
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCompanyById_admin, adminDb } from '../documents/_lib/firebase-admin';
import type { CompanyCredentials } from '@/lib/factory-hka/types';

// Define endpoints allowed for testing to prevent abuse
const ALLOWED_ENDPOINTS = [
    'ConsultarEmpresa',
    'CrearFactura',
    'ConsultarEstatusDocumento',
    'AnularDocumento',
];

const testApiSchema = z.object({
    companyId: z.string().min(1, "El ID de la compañía es requerido."),
    environment: z.enum(['Demo', 'Production']),
    endpoint: z.string().refine(val => ALLOWED_ENDPOINTS.includes(val), {
        message: "Endpoint no válido o no permitido para pruebas."
    }),
    payload: z.record(z.unknown()), // The payload to send to HKA
});

// Helper function to get HKA API URL from environment
function getHkaApiUrl(env: 'Demo' | 'Production') {
    if (env === 'Production') {
        return process.env.NEXT_PUBLIC_THE_FACTORY_HKA_PROD_API_URL || 'https://prod.thefactoryhka.com.pa/api/v2'; // Fallback
    }
    return process.env.NEXT_PUBLIC_THE_FACTORY_HKA_API_URL || 'https://demodte.thefactoryhka.com.pa/api/v2'; // Fallback
}


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

    const { companyId, environment, endpoint, payload } = validation.data;

    // 1. Fetch company data securely using Admin SDK
    const company = await getCompanyById_admin(companyId);
    if (!company) {
        return NextResponse.json({ success: false, message: `Compañía con ID '${companyId}' no encontrada.` }, { status: 404 });
    }

    // 2. Get credentials for the selected environment
    const hkaConfig = environment === 'Production' ? company.factoryHkaConfig.production : company.factoryHkaConfig.demo;
    
    if (!hkaConfig?.username || !hkaConfig?.password) {
        return NextResponse.json({ success: false, message: `Las credenciales para el ambiente '${environment}' no están configuradas para esta compañía.` }, { status: 400 });
    }

    const credentials: CompanyCredentials = {
        nit: hkaConfig.username,
        token: hkaConfig.password,
    };

    // 3. Prepare and make the call to The Factory HKA
    const hkaApiUrl = getHkaApiUrl(environment);
    const fullUrl = `${hkaApiUrl}/${endpoint}`;

    try {
        const hkaResponse = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // Add authentication headers required by HKA
                'TokenEmpresa': credentials.token,
                'TokenClave': credentials.token, // As per docs, seems to be the same
            },
            body: JSON.stringify(payload),
        });

        // Forward the response from HKA, whether it's a success or an error
        const responseData = await hkaResponse.json();
        
        return NextResponse.json(responseData, { status: hkaResponse.status });

    } catch (error) {
        console.error(`[API Test Proxy] Error calling HKA endpoint '${endpoint}':`, error);
        const errorMessage = error instanceof Error ? error.message : 'Error de red desconocido.';
        return NextResponse.json({ success: false, message: `Ocurrió un error al contactar la API de HKA: ${errorMessage}` }, { status: 502 }); // 502 Bad Gateway
    }
}
