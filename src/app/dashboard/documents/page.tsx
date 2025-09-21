import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { documents } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { Document } from '@/lib/types';

const statusStyles: { [key in Document['status']]: string } = {
  Processed: 'text-chart-2 border-chart-2 bg-chart-2/10',
  Pending: 'text-chart-4 border-chart-4 bg-chart-4/10',
  Error: 'text-destructive border-destructive bg-destructive/10',
};

function DocumentsTable({ status }: { status?: Document['status'] }) {
  const filteredDocuments = status
    ? documents.filter(doc => doc.status === status)
    : documents;
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document ID</TableHead>
              <TableHead className="hidden sm:table-cell">Client</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map(doc => (
              <TableRow key={doc.id} className="cursor-pointer">
                <TableCell className="font-medium">
                  <Link href={`/dashboard/documents/${doc.id}`}>{doc.id}</Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Link href={`/dashboard/documents/${doc.id}`}>{doc.client}</Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Link href={`/dashboard/documents/${doc.id}`}>
                    <Badge
                      className={cn('capitalize', statusStyles[doc.status])}
                      variant="outline"
                    >
                      {doc.status}
                    </Badge>
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Link href={`/dashboard/documents/${doc.id}`}>{doc.date}</Link>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/documents/${doc.id}`}>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: doc.currency,
                    }).format(doc.amount)}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function DocumentsPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-2xl font-bold tracking-tight">Documents</h1>
      </div>
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="error">Error</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all">
          <DocumentsTable />
        </TabsContent>
        <TabsContent value="pending">
          <DocumentsTable status="Pending" />
        </TabsContent>
        <TabsContent value="error">
          <DocumentsTable status="Error" />
        </TabsContent>
      </Tabs>
    </>
  );
}
