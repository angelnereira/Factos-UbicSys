
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function DocumentationPage() {
  return (
    <div className="flex-1 space-y-4">
       <div className="flex items-center">
        <div className="flex-1">
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            Documentación del Sistema
          </h1>
          <p className="text-muted-foreground">
            Una guía completa y actualizada sobre la arquitectura, componentes y flujos de trabajo de Factos UbicSys.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Historial de Cambios y Arquitectura</CardTitle>
            <CardDescription>
                Cada cambio importante en el sistema se documenta aquí.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                Creación de la Sección de Documentación (21/09/2025)
              </AccordionTrigger>
              <AccordionContent className="prose dark:prose-invert max-w-none">
                <h4>Descripción General</h4>
                <p>
                  Se ha creado esta sección con el objetivo de mantener un registro vivo y actualizado de todos los cambios, mejoras y correcciones que se implementan en el proyecto. La idea es que sirva como una fuente de verdad tanto para los desarrolladores como para los usuarios finales.
                </p>
                <h4>Especificaciones Técnicas</h4>
                <ul>
                  <li>
                    <strong>Ruta Creada:</strong> Se ha añadido una nueva página en <code>/dashboard/documentation</code>.
                  </li>
                  <li>
                    <strong>Componente Principal:</strong> El archivo <code>src/app/dashboard/documentation/page.tsx</code> contiene la lógica para renderizar la página.
                  </li>
                   <li>
                    <strong>Navegación:</strong> Se actualizó el componente <code>src/components/dashboard-nav.tsx</code> para incluir un enlace a esta nueva sección, utilizando el ícono <code>BookText</code> de <code>lucide-react</code>.
                  </li>
                  <li>
                    <strong>Estructura de Contenido:</strong> Se utiliza el componente <code>Accordion</code> de ShadCN para organizar los temas de la documentación de manera ordenada y accesible. Cada cambio importante se añadirá como un nuevo <code>AccordionItem</code>.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
