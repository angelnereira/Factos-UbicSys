
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getDocumentById } from '@/lib/firebase/firestore';
import ErrorExplainer from './_components/error-explainer';
import { cn } from '@/lib/utils';
import type { Document } from '@/lib/types';

const statusStyles: { [key in Document['status']]: string } = {
  Processed: 'text-chart-2 border-chart-2 bg-chart-2/10',
  Pending: 'text-chart-4 border-chart-4 bg-chart-4/10',
  Error: 'text-destructive border-destructive bg-destructive/10',
};


export default function DocumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDocument() {
      setIsLoading(true);
      const fetchedDocument = await getDocumentById(params.id);
      if (fetchedDocument) {
        setDocument(fetchedDocument);
      } else {
         // Trigger notFound if document doesn't exist
        notFound();
      }
      setIsLoading(false);
    }
    fetchDocument();
  }, [params.id]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!document) {
    // This will be handled by the notFound() call in useEffect,
    // but as a fallback, we can render nothing or a message.
    return null;
  }

  return (
    <div className="grid flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/documents" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Atrás</span>
        </Link>
        <h1 className="font-headline flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Documento {document.id}
        </h1>
        <Badge variant="outline" className={cn("ml-auto sm:ml-0 capitalize", statusStyles[document.status])}>
          {document.status}
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Documento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <div className="font-semibold">Información de la Factura</div>
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Monto</span>
                      <span>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: document.currency,
                        }).format(document.amount)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Fecha</span>
                      <span>{document.date}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {document.status === 'Error' && document.errorDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Error</CardTitle>
                <CardDescription>
                  Ocurrió el siguiente error durante el procesamiento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm p-4 bg-muted rounded-md">{document.errorDetails}</p>
              </CardContent>
            </Card>
          )}

          {document.status === 'Error' && <ErrorExplainer document={document} />}
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3">
                    <div className="font-semibold">{document.client}</div>
                    <dl className="grid gap-1">
                        <dt className="text-muted-foreground">Tipo de ERP</dt>
                        <dd>{document.erpType}</dd>
                    </dl>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
