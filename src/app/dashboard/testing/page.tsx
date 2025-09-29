
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FlaskConical } from 'lucide-react';

export default function TestingPage() {
  return (
      <div className="flex-1 space-y-4 flex items-center justify-center">
        <Alert className="max-w-2xl">
          <FlaskConical className="h-4 w-4" />
          <AlertTitle>Centro de Pruebas en Reconstrucción</AlertTitle>
          <AlertDescription>
              Esta sección está siendo rediseñada para ser compatible con la nueva comunicación SOAP/XML de la API de The Factory HKA.
              <p className="mt-2">
                La funcionalidad principal de envío de documentos a través de la API y el dashboard ya utiliza el nuevo método SOAP y es completamente funcional. Esta página de pruebas volverá a estar disponible pronto.
              </p>
          </AlertDescription>
        </Alert>
      </div>
  );
}
