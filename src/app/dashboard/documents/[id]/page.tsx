
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getDocumentById, getDocuments } from '@/lib/firebase/firestore';
import ErrorExplainer from './_components/error-explainer';
import { cn } from '@/lib/utils';
import type { FiscalDocument } from '@/lib/types';
import type { Timestamp } from 'firebase/firestore';

const statusStyles: { [key in FiscalDocument['status']]: string } = {
  approved: 'text-chart-2 border-chart-2 bg-chart-2/10',
  pending: 'text-chart-4 border-chart-4 bg-chart-4/10',
  rejected: 'text-destructive border-destructive bg-destructive/10',
  processing: 'text-blue-500 border-blue-500 bg-blue-500/10',
  sent_to_pac: 'text-indigo-500 border-indigo-500 bg-indigo-500/10',
  cancelled: 'text-gray-500 border-gray-500 bg-gray-500/10',
};


export default function DocumentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [document, setDocument] = useState<FiscalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDocument() {
      if (!id) return;
      setIsLoading(true);
      
      const allDocuments = await getDocuments();
      const targetDocument = allDocuments.find(doc => doc.id === id);

      if (targetDocument) {
        const fetchedDocument = await getDocumentById(targetDocument.companyId, id);
        if (fetchedDocument) {
            setDocument(fetchedDocument as FiscalDocument);
        } else {
            notFound();
        }
      } else {
        notFound();
      }

      setIsLoading(false);
    }
    fetchDocument();
  }, [id]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!document) {
    return null;
  }
  
  const getDateString = (date: Date | Timestamp | string) => {
    if (typeof date === 'string') return new Date(date).toLocaleDateString();
    if ('seconds' in date) return new Date((date as Timestamp).seconds * 1000).toLocaleDateString();
    return date.toLocaleDateString();
  };

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
                      <span>{getDateString(document.date)}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {(document.status === 'rejected' || document.status === 'cancelled') && document.errorDetails && (
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

          {(document.status === 'rejected' || document.status === 'cancelled') && <ErrorExplainer document={document} />}
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Compañía</CardTitle>
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
