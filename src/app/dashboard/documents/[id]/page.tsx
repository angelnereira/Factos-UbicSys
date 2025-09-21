import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { documents } from '@/lib/data';
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
  const document = documents.find(d => d.id === params.id);

  if (!document) {
    notFound();
  }

  return (
    <div className="grid flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/documents" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
        </Link>
        <h1 className="font-headline flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Document {document.id}
        </h1>
        <Badge variant="outline" className={cn("ml-auto sm:ml-0 capitalize", statusStyles[document.status])}>
          {document.status}
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <div className="font-semibold">Invoice Information</div>
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: document.currency,
                        }).format(document.amount)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Date</span>
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
                <CardTitle>Error Details</CardTitle>
                <CardDescription>
                  The following error occurred during processing.
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
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3">
                    <div className="font-semibold">{document.client}</div>
                    <dl className="grid gap-1">
                        <dt className="text-muted-foreground">ERP Type</dt>
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
