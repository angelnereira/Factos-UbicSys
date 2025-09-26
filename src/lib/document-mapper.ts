/**
 * @fileoverview Maps incoming API requests to the FiscalDocument format for Firestore.
 */

import type { FiscalDocument } from '@/lib/types';
import type { FactoryHkaDocumentRequest } from './integrations/tfhka/tfhka-types';
import { Timestamp } from 'firebase/firestore';

/**
 * Maps the raw JSON body from a `POST /api/v1/documents` request
 * to a partial `FiscalDocument` object ready to be saved in Firestore.
 * 
 * @param body - The raw request body, expected to conform to `FactoryHkaDocumentRequest`.
 * @param companyId - The ID of the company submitting the document.
 * @returns A partial `FiscalDocument` object.
 */
export function mapRequestToFiscalDocument(
    body: FactoryHkaDocumentRequest, 
    companyId: string
): Omit<FiscalDocument, 'id'> {

    const { datosTransaccion, totalesSubTotales, cliente } = body.documento;

    const documentTypeMapping = {
        '01': 'factura',
        '05': 'nota_credito',
        '06': 'nota_debito',
        '04': 'factura_exportacion',
    } as const;
    
    const documentType = datosTransaccion.tipoDocumento as keyof typeof documentTypeMapping;

    return {
        companyId,
        documentType: documentTypeMapping[documentType] || 'factura',
        status: 'pending',
        originalData: body,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        statusHistory: [
            {
                step: 'received',
                status: 'success',
                message: 'Documento recibido a través de la API.',
                timestamp: Timestamp.now(),
            }
        ],
        // --- Properties for UI ---
        client: cliente.razonSocial,
        amount: parseFloat(totalesSubTotales.totalFactura),
        currency: 'USD', // Assuming USD, this should come from the request if available
        date: new Date(datosTransaccion.fechaEmision),
        erpType: 'api', // Documents via API are marked as such
    };
}
