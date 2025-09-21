
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
          <Accordion type="single" collapsible className="w-full" defaultValue="item-3">
            <AccordionItem value="item-3">
                <AccordionTrigger>
                    Definición de Tipos para la Carga de Documentos (23/09/2025)
                </AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>Descripción General</h4>
                    <p>
                        Para preparar el sistema para la transformación y el envío de documentos a The Factory HKA, se han añadido las definiciones de tipo de TypeScript que corresponden a la estructura JSON esperada por su API. Esto es fundamental para asegurar que los datos se envían en el formato correcto.
                    </p>
                    <h4>Especificaciones Técnicas</h4>
                    <ul>
                        <li>
                            <strong>Archivo Modificado:</strong> <code>src/lib/factory-hka/types.ts</code>.
                        </li>
                        <li>
                            <strong>Tipos Añadidos:</strong> Se ha creado un conjunto completo de interfaces de TypeScript (<code>FactoryHkaDocumentRequest</code>, <code>Documento</code>, <code>DatosTransaccion</code>, <code>Cliente</code>, etc.) que reflejan la estructura anidada del JSON proporcionado.
                        </li>
                        <li>
                            <strong>Beneficios:</strong> Esto proporciona seguridad de tipos estática, previene errores de formato en los datos y facilita el desarrollo de las funciones de transformación de datos, ya que los desarrolladores y la IA pueden usar estas interfaces como una guía precisa.
                        </li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>
                    Sincronización de README con Documentación Interna (22/09/2025)
                </AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>Descripción General</h4>
                    <p>
                        Para asegurar que los desarrolladores tengan una fuente de información coherente tanto dentro como fuera de la aplicación, se ha actualizado el archivo <code>README.md</code> para que refleje la arquitectura, objetivos y estado actual del proyecto.
                    </p>
                    <h4>Especificaciones Técnicas</h4>
                    <ul>
                        <li>
                            <strong>Archivo Modificado:</strong> <code>README.md</code>.
                        </li>
                        <li>
                            <strong>Contenido Añadido:</strong> Se ha incluido una descripción del proyecto, lista de características clave, la pila tecnológica y una guía de inicio rápido para nuevos desarrolladores.
                        </li>
                        <li>
                            <strong>Sincronización:</strong> Se ha establecido la práctica de mantener este archivo alineado con la documentación interna. El README ahora redirige a los usuarios a esta sección para obtener detalles más exhaustivos y actualizados.
                        </li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
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
