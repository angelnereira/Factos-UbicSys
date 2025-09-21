# Factos UbicSys - Middleware de Facturación Electrónica

Este proyecto es un sistema de middleware diseñado para actuar como un puente robusto y escalable entre los sistemas ERP de los clientes y el proveedor de facturación electrónica de Panamá, The Factory HKA.

La aplicación está siendo construida con Next.js, Firebase y Genkit, optimizada para un desarrollo rápido y seguro, incluyendo funcionalidades de IA para mejorar la experiencia del usuario.

## Características Clave

- **APIs REST Completas:** Endpoints de Next.js que proporcionan una interfaz limpia para que los clientes integren sus sistemas ERP.
- **Procesamiento Asíncrono:** Los documentos se procesan en segundo plano utilizando Cloud Functions, evitando que los sistemas cliente se bloqueen.
- **Monitoreo en Tiempo Real:** Webhooks y listeners de Firestore para actualizaciones instantáneas sobre el estado de los documentos.
- **Seguridad Multi-tenant:** Cada cliente solo tiene acceso a sus propios datos, garantizado por las Reglas de Seguridad de Firestore.
- **Manejo de Errores Inteligente:** El sistema está diseñado para manejar fallos de conectividad, reintentar operaciones y mantener un rastro de auditoría completo.
- **Auditabilidad Completa:** Cada documento fiscal mantiene un historial inmutable de todos los pasos de su procesamiento.
- **Documentación Viva:** La aplicación incluye una sección de documentación que se actualiza con cada cambio significativo en el sistema.

## Pila Tecnológica

- **Framework:** Next.js (con App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS con componentes de ShadCN/UI
- **Backend y Base de Datos:** Firebase (Authentication, Firestore, Cloud Functions, Storage)
- **Inteligencia Artificial:** Google AI con Genkit
- **Autenticación:** Firebase Authentication

## Cómo Empezar

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### 1. Prerrequisitos

- Node.js (versión 20 o superior)
- npm o yarn

### 2. Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone <url-del-repositorio>
cd <nombre-del-repositorio>
npm install
```

### 3. Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto y añade las credenciales de tu proyecto de Firebase y de The Factory HKA.

```env
# Credenciales de Firebase (obtenidas desde la consola de Firebase)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Credenciales de Google AI (Genkit)
GEMINI_API_KEY=...

# Credenciales de The Factory HKA (ambiente de demo)
NEXT_PUBLIC_THE_FACTORY_HKA_API_URL="https://demodte.thefactoryhka.com.pa/api/v2"
THE_FACTORY_HKA_USERNAME=...
THE_FACTORY_HKA_PASSWORD=...
```

### 4. Ejecutar la Aplicación

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:9002`.

## Documentación del Proyecto

Este `README.md` ofrece una visión general. Para una guía completa y actualizada sobre la arquitectura, componentes y flujos de trabajo, por favor consulta la sección **"Documentación"** dentro de la propia aplicación una vez que hayas iniciado sesión.
