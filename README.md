# Factos UbicSys - Middleware de Facturación Electrónica

Este proyecto es un sistema de middleware diseñado para actuar como un puente robusto y escalable entre los sistemas ERP de los clientes y el proveedor de facturación electrónica de Panamá, The Factory HKA.

La aplicación está siendo construida con Next.js, Firebase y Genkit, optimizada para un desarrollo rápido y seguro, incluyendo funcionalidades de IA para mejorar la experiencia del usuario.

## Resumen de la Arquitectura Técnica

A continuación se detalla la arquitectura actual del sistema, sus componentes principales y flujos de trabajo.

### **1. Pila Tecnológica Principal (Stack)**

*   **Framework Frontend:** **Next.js 15** con **App Router**.
*   **Lenguaje:** **TypeScript**.
*   **UI y Estilos:**
    *   **Tailwind CSS** para el diseño de utilidades.
    *   **ShadCN/UI** como biblioteca de componentes preconstruidos y personalizables.
    *   **Lucide-React** para la iconografía.
    *   **Recharts** para la visualización de datos (gráficos).
*   **Base de Datos y Backend (BaaS):**
    *   **Firebase Firestore** como base de datos NoSQL principal para almacenar datos de compañías, documentos fiscales e historiales.
    *   **Firebase Authentication** para la gestión de usuarios (inicio de sesión con Google y correo/contraseña).
*   **Inteligencia Artificial (GenAI):**
    *   **Google AI (Gemini)** a través de **Genkit** para flujos de IA, como la explicación inteligente de errores y la orquestación de procesos.
*   **Validación de Datos:** **Zod** para la validación de esquemas tanto en el frontend como en el backend.

### **2. Estructura y Flujo de Datos**

#### **Conexiones Externas**

1.  **Sistemas ERP del Cliente:** Sistemas externos (SAP, Oracle, etc.) que envían datos de facturas a nuestra API.
2.  **The Factory HKA (PAC):** El Proveedor de Autorización Calificado. Nuestra aplicación se comunica con su API para:
    *   Autenticarse y obtener tokens.
    *   Enviar los documentos fiscales para su validación y procesamiento.

#### **Base de Datos (Firestore)**

La estructura de datos principal en Firestore es:

```
/companies/{companyId}/documents/{documentId}
```

*   **Colección `companies`:** Almacena la información de cada compañía cliente (nombre, RUC, configuración, etc.).
*   **Subcolección `documents`:** Anidada dentro de cada compañía, almacena los documentos fiscales (facturas, notas de crédito) con su estado, historial y los datos originales recibidos. Esta estructura garantiza el aislamiento de datos (multi-tenant).

#### **Flujo de Recepción de Documentos**

1.  Un sistema ERP externo realiza una solicitud `POST` a `/api/v1/documents`.
2.  La API, construida con **Next.js Route Handlers**, recibe la solicitud.
3.  Valida la `API Key` del cliente para identificar la compañía (`companyId`).
4.  Valida el cuerpo de la solicitud (JSON) contra un esquema de Zod (`FactoryHkaDocumentRequestSchema`).
5.  Mapea los datos recibidos a la estructura `FiscalDocument` de Firestore.
6.  Guarda el nuevo documento en la subcolección `documents` de la compañía correspondiente con un estado inicial de `"pending"`.
7.  Responde al cliente con un estado `202 Accepted` y el ID del documento, confirmando que ha sido aceptado para procesamiento asíncrono.

#### **Flujo de Procesamiento (Orquestado por Genkit)**

*   Un flujo de Genkit (`submitDocumentFlow`) se encarga del procesamiento asíncrono:
    1.  Obtiene el documento desde Firestore.
    2.  Actualiza el estado del documento a `"processing"`.
    3.  Se autentica contra la API de The Factory HKA.
    4.  Envía el documento al PAC.
    5.  Recibe la respuesta (aprobado/rechazado) y actualiza el documento en Firestore con el estado final, el CUFE (si aplica) y los detalles del error (si ocurre).
    6.  Cada paso queda registrado en el campo `statusHistory` del documento, creando un rastro de auditoría completo.

### **3. Secciones y Páginas Clave de la Aplicación**

*   **Autenticación (`/src/app/page.tsx`):** Página de inicio de sesión y registro. Utiliza **Firebase Authentication**. Se ha configurado un bypass para el entorno de desarrollo local (`NODE_ENV === 'development'`) en `private-route.tsx` para agilizar el desarrollo del dashboard.
*   **Dashboard (`/src/app/dashboard/`):**
    *   **Layout Principal (`layout.tsx`):** Define la estructura del dashboard con navegación lateral, cabecera (con búsqueda global y perfil de usuario) y el contenido principal.
    *   **Monitoreo (`monitoring/page.tsx`):** Es la página de inicio del dashboard. Muestra un resumen visual del estado del sistema con KPIs (documentos totales, aprobados, pendientes, rechazados) y un gráfico del volumen de documentos.
    *   **Documentos (`documents/page.tsx`):** Un listado detallado y filtrable de todos los documentos fiscales. Permite la actualización manual de datos para optimizar el rendimiento.
    *   **Detalle de Documento (`documents/[id]/page.tsx`):** Muestra toda la información de un documento específico, incluyendo sus detalles, historial de estados y, si hay un error, permite invocar un flujo de IA (`intelligentErrorExplanation`) para obtener un análisis de la causa raíz.
    *   **Compañías (`clients/page.tsx`):** Gestiona las compañías cliente registradas en el sistema.
    *   **Registros (`logs/page.tsx`):** Proporciona un rastro de auditoría completo, mostrando todos los eventos del `statusHistory` de todos los documentos, agrupados por compañía para una fácil inspección.
    *   **Finanzas (`finance/page.tsx`):** Un dashboard financiero que resume los aspectos monetarios de las transacciones, como el total facturado y los impuestos.
    *   **Configuración (`settings/page.tsx`):** Centro de administración para el perfil de la cuenta, apariencia y, crucialmente, la gestión de credenciales.
    *   **Configuración de API (`settings/api/page.tsx`):** Un formulario dedicado para configurar las claves de API que los clientes usarán y las credenciales (Nit y Token) para conectar con The Factory HKA.

### **4. Guía de Configuración de Autenticación**

Para que el registro e inicio de sesión de usuarios con Google funcione correctamente, se requieren dos configuraciones que deben estar sincronizadas: una en la consola de Google Cloud y otra en el código fuente.

#### **1. Configuración en la Consola de Google Cloud**

Firebase Authentication utiliza OAuth 2.0 para manejar inicios de sesión con proveedores como Google. Esto requiere configurar un "Cliente OAuth" para tu aplicación.

1.  **Navega a la sección de Credenciales:** En la [Consola de Google Cloud](https://console.cloud.google.com/apis/credentials), selecciona tu proyecto.
2.  **Busca tu Cliente OAuth:** Deberías ver un cliente en la sección "OAuth 2.0 Client IDs", usualmente llamado "Web client (auto created by Google Service)".
3.  **Configura los Orígenes y URIs de Redirección:**
    *   **Authorized JavaScript origins:** Son las URLs desde donde se permitirán las solicitudes de inicio de sesión. Es crucial añadir las URLs de tu entorno de desarrollo local y la de producción/vista previa.
        *   `http://localhost`
        *   `http://localhost:3000` (o el puerto que uses localmente)
        *   `https://[TU_PROYECTO_ID].firebaseapp.com`
        *   La URL de tu entorno de Firebase Studio (ej: `https://*.cloudworkstations.dev`)
    *   **Authorized redirect URIs:** Es la URL a la que Google redirigirá al usuario después de un inicio de sesión exitoso. Firebase gestiona esto automáticamente.
        *   `https://[TU_PROYECTO_ID].firebaseapp.com/__/auth/handler`

#### **2. Configuración en el Código Fuente**

El código de la aplicación debe tener un "mapa" para saber a qué proyecto de Firebase conectarse.

*   **Archivo Clave:** `src/lib/firebase/firebase-client.ts`
*   **Implementación:** Dentro de este archivo, se encuentra un objeto `firebaseConfig`. Este objeto contiene las claves públicas que identifican tu proyecto de Firebase. Para garantizar que la conexión siempre funcione, estas claves se han definido directamente en el código.

    ```typescript
    // Ejemplo de la estructura en firebase-client.ts
    const firebaseConfig = {
      apiKey: "AIzaSy...",
      authDomain: "tu-proyecto.firebaseapp.com",
      projectId: "tu-proyecto-id",
      // ...otras claves
    };
    ```

*   **¿Es seguro?** Sí. Estas claves son públicas y su propósito es identificar tu proyecto, no otorgar acceso. La seguridad de los datos está controlada por las **Reglas de Seguridad de Firestore**.

*   **El Disparador:** La función `signInWithGoogle` en `src/lib/firebase/auth.ts` utiliza el SDK de Firebase y esta configuración para iniciar el proceso de autenticación de forma segura cuando el usuario hace clic en el botón "Continuar con Google".

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
# ¡Nota! En la configuración actual, estas credenciales están definidas directamente en el código
# en 'src/lib/firebase/firebase-client.ts' para garantizar el funcionamiento en cualquier entorno.
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

La aplicación estará disponible en `http://localhost:3000`.

## Documentación del Proyecto

Este `README.md` ofrece una visión general. Para una guía completa y actualizada sobre la arquitectura, componentes y flujos de trabajo, por favor consulta la sección **"Documentación"** dentro de la propia aplicación una vez que hayas iniciado sesión.
