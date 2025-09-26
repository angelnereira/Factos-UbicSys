
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const exportSchema = z.object({
  dateRange: z.object(
    {
      from: z.date({
        required_error: 'La fecha de inicio es requerida.',
      }),
      to: z.date({
        required_error: 'La fecha de fin es requerida.',
      }),
    },
    {
      required_error: 'El rango de fechas es requerido.',
    }
  ),
});

type ExportFormValues = z.infer<typeof exportSchema>;

export default function ExportsPage() {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const form = useForm<ExportFormValues>({
    resolver: zodResolver(exportSchema),
  });

  async function onSubmit(values: ExportFormValues) {
    setIsDownloading(true);
    toast({
      title: 'Iniciando Descarga',
      description: 'Preparando la exportación de documentos...',
    });

    const criteria = {
        FechaDesde: format(values.dateRange.from, 'yyyy-MM-dd'),
        FechaHasta: format(values.dateRange.to, 'yyyy-MM-dd'),
    };
    
    // NOTE: This is a placeholder for the actual API call logic.
    // In a real implementation, you would:
    // 1. Get company credentials and environment.
    // 2. Call `getAuthToken`.
    // 3. Call `downloadDocumentsByDate` with the token and criteria.
    // 4. Handle the Blob response to trigger a file download in the browser.
    console.log('Download criteria:', criteria);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Función en Desarrollo',
      description: 'La lógica para conectar con el API y descargar el archivo ZIP aún no está implementada.',
      variant: 'default',
    });

    setIsDownloading(false);
  }

  return (
    <>
      <div className="flex-1 space-y-4">
        <div className="flex items-center">
          <div className="flex-1">
            <h1 className="font-headline text-2xl font-bold tracking-tight">
              Exportar Documentos
            </h1>
            <p className="text-muted-foreground">
              Descarga documentos electrónicos y eventos por rango de fechas.
            </p>
          </div>
        </div>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Seleccionar Criterios</CardTitle>
            <CardDescription>
              Elige el rango de fechas para descargar los documentos
              correspondientes de The Factory HKA. Se generará un archivo ZIP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Rango de Fechas</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              id="date"
                              variant={'outline'}
                              className={cn(
                                'w-[300px] justify-start text-left font-normal',
                                !field.value?.from && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, 'LLL dd, y')} -{' '}
                                    {format(field.value.to, 'LLL dd, y')}
                                  </>
                                ) : (
                                  format(field.value.from, 'LLL dd, y')
                                )
                              ) : (
                                <span>Selecciona un rango</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={{ from: field.value?.from, to: field.value?.to }}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isDownloading}>
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Iniciar Descarga
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
