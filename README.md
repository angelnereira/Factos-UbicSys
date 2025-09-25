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

La aplicación estará disponible en `http://localhost:9002` o el puerto que asigne el entorno de ejecución.

## Guía de Configuración de Autenticación

Para que el registro e inicio de sesión de usuarios con Google funcione correctamente, se requieren dos configuraciones que deben estar sincronizadas: una en la consola de Google Cloud y otra en el código fuente.

### 1. Configuración en la Consola de Google Cloud

Firebase Authentication utiliza OAuth 2.0 para manejar inicios de sesión con proveedores como Google. Esto requiere configurar un "Cliente OAuth" para tu aplicación.

1.  **Navega a la sección de Credenciales:** En la [Consola de Google Cloud](https://console.cloud.google.com/apis/credentials), selecciona tu proyecto.
2.  **Busca tu Cliente OAuth:** Deberías ver un cliente en la sección "OAuth 2.0 Client IDs", usualmente llamado "Web client (auto created by Google Service)".
3.  **Configura los Orígenes y URIs de Redirección:**
    *   **Authorized JavaScript origins:** Son las URLs desde donde se permitirán las solicitudes de inicio de sesión. Es crucial añadir las URLs de tu entorno de desarrollo local y la de producción/vista previa.
        *   `http://localhost`
        *   `http://localhost:9002` (o el puerto que uses localmente)
        *   `https://[TU_PROYECTO_ID].firebaseapp.com`
        *   La URL de tu entorno de Firebase Studio (ej: `https://*.cloudworkstations.dev`)
    *   **Authorized redirect URIs:** Es la URL a la que Google redirigirá al usuario después de un inicio de sesión exitoso. Firebase gestiona esto automáticamente.
        *   `https://[TU_PROYECTO_ID].firebaseapp.com/__/auth/handler`

### 2. Configuración en el Código Fuente

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

## Documentación del Proyecto

Este `README.md` ofrece una visión general. Para una guía completa y actualizada sobre la arquitectura, componentes y flujos de trabajo, por favor consulta la sección **"Documentación"** dentro de la propia aplicación una vez que hayas iniciado sesión.
