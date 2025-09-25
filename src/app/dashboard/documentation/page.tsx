
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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function DocumentationPage() {
  return (
    <div className="flex-1 space-y-4">
       <div className="flex items-center">
        <div className="flex-1">
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            Documentación del Sistema
          </h1>
          <p className="text-muted-foreground">
            Aquí encontrarás guías de integración, manuales de API y un historial de cambios del sistema.
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Manual de Integración y API</CardTitle>
            <CardDescription>
                Guía para conectar tu ERP y utilizar la API de Factos UbicSys.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue="item-2">
            <AccordionItem value="item-1">
                <AccordionTrigger>Introducción al Middleware</AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>¿Qué es Factos UbicSys?</h4>
                    <p>
                        Factos UbicSys es una plataforma de middleware diseñada para simplificar la facturación electrónica en Panamá. Actuamos como un puente robusto y escalable entre tu sistema de planificación de recursos empresariales (ERP) y el Proveedor de Autorización Calificado (PAC), The Factory HKA.
                    </p>
                    <h4>Flujo de Trabajo General</h4>
                    <ol>
                        <li>Tu sistema ERP envía los datos de la factura a nuestra API usando una clave de cliente generada en esta plataforma.</li>
                        <li>Nosotros validamos, transformamos y almacenamos ese documento en nuestra base de datos con estado "pendiente".</li>
                        <li>Un proceso asíncrono (orquestado por IA con Genkit) toma el documento, se autentica contra The Factory HKA usando las credenciales que configuraste y lo envía para su aprobación.</li>
                        <li>Registramos la respuesta del PAC (aprobado o rechazado) y actualizamos el estado del documento, el CUFE y cualquier detalle de error en nuestro sistema.</li>
                         <li>Puedes monitorear el estado de cada documento en tiempo real a través de nuestro dashboard.</li>
                    </ol>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-2">
                <AccordionTrigger>Guía de Configuración de API (Paso a Paso)</AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>Paso 1: Obtener Credenciales de The Factory HKA</h4>
                    <p>
                        Antes de poder enviar documentos, necesitas tus credenciales de acceso para los entornos de <strong>Demo (pruebas)</strong> y <strong>Producción</strong> de The Factory HKA. Estas credenciales te las debe proporcionar tu contacto comercial o de soporte en HKA. Necesitarás dos datos clave por cada ambiente:
                    </p>
                    <ul>
                      <li><strong>Nit:</strong> Es tu identificador de usuario en la plataforma de HKA.</li>
                      <li><strong>Token:</strong> Es tu contraseña o clave secreta.</li>
                    </ul>

                    <h4>Paso 2: Acceder a la Configuración de API</h4>
                    <p>
                        Navega a la sección de configuración de API en nuestro dashboard. Aquí es donde guardarás de forma segura las credenciales de HKA y generarás las claves para que tu ERP se conecte con nosotros.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard/settings/api">
                            Ir a Configuración de API (Asistido)
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    
                    <h4>Paso 3: Ingresar Credenciales del PAC</h4>
                    <p>
                      En la página de configuración, verás una tarjeta llamada <strong>"Credenciales del PAC (The Factory HKA)"</strong>. Rellena los campos para los ambientes de "Demo" y "Producción" con los datos que obtuviste en el Paso 1.
                    </p>
                     
                    <h4>Paso 4: Generar y Usar tu Clave de Cliente</h4>
                    <p>
                        En la misma página, en la sección <strong>"Claves de API del Cliente"</strong>, genera una nueva clave. <strong>Esta es la clave que tu sistema ERP debe usar</strong> en el encabezado de autorización para enviar documentos a Factos UbicSys.
                    </p>
                    <pre><code>Authorization: Bearer TU_CLAVE_GENERADA_AQUI</code></pre>

                    <h4>Paso 5: Guardar y Probar</h4>
                     <p>
                       Guarda toda la configuración. Una vez guardada, te recomendamos ir a la sección de <strong>"Pruebas"</strong> para simular el envío de un documento usando el ambiente de Demo y verificar que la conexión funciona correctamente.
                    </p>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>Endpoint de Envío de Documentos</AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>Endpoint</h4>
                    <p>Para enviar un nuevo documento (factura, nota de crédito, etc.), tu sistema debe realizar una solicitud <code>POST</code> a la siguiente URL:</p>
                    <pre><code>POST /api/v1/documents</code></pre>
                    <h4>Autenticación</h4>
                    <p>La solicitud debe incluir el encabezado <code>Authorization</code> con la clave de API que generaste en la configuración (Paso 4 de la guía).</p>
                    <pre><code>Authorization: Bearer fk_live_...</code></pre>
                    <h4>Cuerpo de la Solicitud (Body)</h4>
                    <p>El cuerpo de la solicitud debe ser un objeto JSON que contenga los datos de tu documento. La estructura debe seguir el formato especificado por The Factory HKA. Puedes usar la sección de "Pruebas" para ver y experimentar con un payload de ejemplo.</p>
                     <h4>Respuesta Asíncrona</h4>
                    <p>Si la solicitud es exitosa (API Key válida y JSON bien formado), nuestra API responderá con un código <code>202 Accepted</code>. Esto <strong>no significa que la factura fue aprobada por la DGI</strong>, sino que ha sido aceptada por nuestro sistema para ser procesada. El estado final se podrá consultar en el dashboard.</p>
                </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Historial de Cambios y Arquitectura</CardTitle>
            <CardDescription>
                Cada cambio importante en el sistema se documenta aquí.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue="item-6">
            <AccordionItem value="item-6">
                <AccordionTrigger>
                    Propuesta de Mejoras y Roadmap de Desarrollo (25/09/2025)
                </AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>Descripción General</h4>
                    <p>
                        Se ha definido una hoja de ruta de desarrollo detallada para la evolución de la plataforma Factos UbicSys. Este plan abarca mejoras críticas en la integración con el PAC, la inteligencia artificial con Genkit, la interfaz de usuario, y la seguridad.
                    </p>
                    <h4>Fases Principales del Roadmap</h4>
                    <ul>
                        <li>
                            <strong>Fase 1 - Validación y Robustez (1 semana):</strong> Fortalecimiento del cliente API para The Factory HKA con lógica de reintentos, y optimización de índices de base de datos para consultas de alto rendimiento.
                        </li>
                         <li>
                            <strong>Fase 2 - Expansión Funcional (2 semanas):</strong> Implementación de nuevos flujos Genkit para operaciones como cancelación y consulta de documentos, y mejoras significativas en el dashboard de monitoreo y la gestión de documentos.
                        </li>
                        <li>
                            <strong>Fase 3 - Inteligencia y Optimización (2 semanas):</strong> Desarrollo de un análisis de errores con IA más avanzado, un asistente de configuración inteligente, y la implementación de rate limiting y caché en la API.
                        </li>
                         <li>
                            <strong>Fase 4 - Calidad y Producción (1 semana):</strong> Creación de una suite de pruebas automatizadas, mejoras en la seguridad de la API y expansión de la estructura de datos para soportar nuevos tipos de documentos.
                        </li>
                    </ul>
                    <h4>Impacto Estimado</h4>
                     <p>
                        El plan completo se estima en <strong>198 horas</strong> de desarrollo, con un enfoque prioritario en las mejoras de integración API y la expansión de los flujos de Genkit para asegurar la funcionalidad core del sistema.
                    </p>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
                <AccordionTrigger>
                    Mejoras de UI/UX y Funcionalidad del Dashboard (24/09/2025)
                </AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>Descripción General</h4>
                    <p>
                        Se implementó una serie de mejoras significativas en la interfaz y la experiencia de usuario del dashboard para hacerlo más informativo, funcional y fácil de usar, de acuerdo con la visión del producto.
                    </p>
                    <h4>Especificaciones Técnicas</h4>
                    <ul>
                        <li>
                            <strong>Dashboard Principal:</strong> La página de inicio (<code>/dashboard/documents</code>) fue rediseñada para funcionar como un dashboard con KPIs (tarjetas de resumen de documentos) y un gráfico de volumen mensual.
                        </li>
                         <li>
                            <strong>Página de Configuración Avanzada:</strong> Se creó una nueva sección en <code>/dashboard/settings</code> con un layout de navegación lateral. Incluye subsecciones para "Cuenta", "Apariencia", y un "Baúl de Secretos" para gestionar credenciales de API de forma dinámica.
                        </li>
                        <li>
                            <strong>Barra de Búsqueda Global:</strong> Se añadió una barra de búsqueda en la cabecera principal (<code>dashboard/layout.tsx</code>) para permitir un acceso rápido a la información en el futuro.
                        </li>
                         <li>
                            <strong>Indicador de Ambiente:</strong> Se agregó una insignia de estado (Demo, Producción, Desarrollo) junto al perfil de usuario para una clara identificación del ambiente de trabajo.
                        </li>
                         <li>
                            <strong>Menú de Navegación Extendido:</strong> Se añadieron enlaces a las futuras secciones de "Registros", "Monitoreo" y "Finanzas".
                        </li>
                        <li>
                            <strong>Corrección de Tema:</strong> Se solucionó un error en el `ThemeProvider` y en `globals.css` que impedía el correcto funcionamiento del cambio entre modo claro y oscuro. El interruptor de tema se simplificó a un solo botón de toggle.
                        </li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
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
            <AccordionItem value="item-3">
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
                            <strong>Sincronización:</strong> Se ha establecido la práctica de mantener este archivo alineado con la documentation interna. El README ahora redirige a los usuarios a esta sección para obtener detalles más exhaustivos y actualizados.
                        </li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
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
            <AccordionItem value="item-1">
                <AccordionTrigger>Ajuste de Flujo de Registro y Sincronización de UID (20/09/2025)</AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>Descripción General</h4>
                    <p>
                        Se ha corregido el flujo de registro para asegurar que el identificador único de usuario (UID) de Firebase Authentication se capture y se almacene correctamente en el perfil de la compañía en Firestore. Este enlace es fundamental para la seguridad y la arquitectura multi-tenant del sistema.
                    </p>
                    <h4>Especificaciones Técnicas</h4>
                    <ul>
                        <li><strong>Archivos Modificados:</strong> <code>src/app/page.tsx</code>, <code>src/app/signup/complete-profile/page.tsx</code>, <code>src/lib/types.ts</code>, <code>src/lib/firebase/firestore.ts</code>.</li>
                        <li><strong>Lógica de Registro:</strong> Al crear una cuenta, el UID del usuario se pasa como parámetro en la URL a la página de completar perfil.</li>
                        <li><strong>Almacenamiento en Firestore:</strong> El UID se guarda en el nuevo campo <code>authUid</code> del documento de la compañía, estableciendo una relación directa entre el usuario autenticado y sus datos.</li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
