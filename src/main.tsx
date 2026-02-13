/**
 * Punto de entrada principal de la aplicación React.
 *
 * Este archivo:
 * 1. Inicializa Sentry para monitoreo de errores (solo en producción y si el DSN está configurado).
 * 2. Monta el componente raíz `<App />` en el elemento HTML con id "root".
 *
 * Nota: `StrictMode` está comentado intencionalmente. StrictMode ejecuta los efectos
 * dos veces en desarrollo para detectar efectos secundarios impuros, lo cual puede
 * causar doble ejecución no deseada en hooks como useSession.
 */

// createRoot: API moderna de React 18 para montar la aplicación en el DOM.
/**import { StrictMode } from 'react';**/
import { createRoot } from 'react-dom/client';

// Sentry: servicio de monitoreo de errores en tiempo real.
import * as Sentry from "@sentry/react";

// Componente raíz de la aplicación.
import App from './App.tsx';

// Estilos globales (Tailwind CSS, fuentes, utilidades glass).
import './index.css';

// Inicializa Sentry SOLO en producción y si la variable de entorno VITE_SENTRY_DSN está definida.
// Esto evita enviar reportes de errores durante el desarrollo local.
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [],
  });
}

// Monta la aplicación React en el elemento DOM con id "root".
// El operador "!" (non-null assertion) indica a TypeScript que el elemento siempre existirá.
createRoot(document.getElementById('root')!).render(
  /**<StrictMode>
  </StrictMode>,**/
  <App />
);
