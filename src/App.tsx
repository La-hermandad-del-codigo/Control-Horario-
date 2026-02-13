// BrowserRouter: provee el contexto de enrutamiento basado en el historial del navegador.
// Routes: contenedor que agrupa las definiciones de rutas.
// Route: define una ruta individual con su path y elemento a renderizar.
// Navigate: redirige programáticamente a otra ruta.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout: componente de estructura con Navbar y contenedor principal.
import { Layout } from './components/layout/Layout';

// ProtectedRoute: componente que protege rutas requiriendo autenticación.
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Páginas de la aplicación.
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import { useAuth } from './hooks/useAuth';

/**
 * Componente que define la estructura de rutas de la aplicación.
 *
 * Maneja tres tipos de rutas:
 * 1. **Rutas públicas** (`/login`, `/register`): Accesibles solo si NO hay usuario autenticado.
 *    Si el usuario ya inició sesión, se redirige a `/`.
 * 2. **Rutas protegidas** (dentro de `<ProtectedRoute>`): Solo accesibles si hay usuario autenticado.
 *    La ruta raíz `/` muestra el Dashboard envuelto en el Layout.
 *    `/dashboard` redirige a `/` para evitar duplicados.
 * 3. **Ruta comodín** (`*`): Cualquier ruta no definida redirige a `/`.
 */
function AppRoutes() {
  // Obtiene el usuario actual y el estado de carga desde el contexto de autenticación.
  const { user, loading } = useAuth();

  // Mientras se verifica la autenticación, no renderiza nada para evitar parpadeos.
  if (loading) return null;

  return (
    <Routes>
      {/* Rutas públicas: si el usuario ya está autenticado, redirige al inicio */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

      {/* Rutas protegidas: requieren autenticación (envueltas en ProtectedRoute) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/sessions" element={
          <Layout>
            <Sessions />
          </Layout>
        } />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
      </Route>

      {/* Ruta comodín: cualquier ruta no reconocida redirige al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Componente raíz de la aplicación.
 *
 * Envuelve toda la app en `BrowserRouter` para habilitar el enrutamiento
 * basado en el historial del navegador (URLs limpias sin hash).
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
