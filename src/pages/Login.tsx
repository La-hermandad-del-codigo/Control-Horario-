// useState: maneja los estados del formulario (email, contraseña, error, loading).
import { useState } from 'react';

// useAuth: hook que provee las funciones de autenticación (signIn, signInWithGoogle).
import { useAuth } from '../hooks/useAuth';

// Link: navegación declarativa. useNavigate: redirección programática.
import { Link, useNavigate } from 'react-router-dom';

// Íconos de lucide-react:
// Loader2: spinner de carga. Mail: ícono de email. Lock: ícono de candado.
// AlertCircle: ícono de error/alerta. Eye/EyeOff: mostrar/ocultar contraseña.
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Página de inicio de sesión (Login).
 *
 * Presenta un formulario con campos de email y contraseña para que el usuario
 * inicie sesión en la aplicación. Incluye:
 * - Validación de formulario HTML nativa (campos required).
 * - Toggle de visibilidad de contraseña.
 * - Manejo de errores con mensajes traducidos al español.
 * - Estado de carga con spinner mientras se procesa el login.
 * - Link de navegación al registro para usuarios nuevos.
 * - Efectos decorativos (orbes de luz con blur) y estilo glass-card.
 */
export default function Login() {
    // Estados del formulario.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Mensaje de error mostrado al usuario (null = sin error).
    const [error, setError] = useState<string | null>(null);

    // Indica si se está procesando el inicio de sesión.
    const [loading, setLoading] = useState(false);

    // Controla si la contraseña es visible (texto) u oculta (puntos).
    const [showPassword, setShowPassword] = useState(false);

    // Indica si se está procesando el inicio de sesión con Google.
    const [googleLoading, setGoogleLoading] = useState(false);

    // Extrae las funciones signIn y signInWithGoogle del hook de autenticación.
    const { signIn, signInWithGoogle } = useAuth();

    // Hook para redirigir al dashboard tras login exitoso.
    const navigate = useNavigate();

    /**
     * Maneja el inicio de sesión con Google OAuth.
     * Redirige al usuario a la pantalla de consentimiento de Google.
     */
    const handleGoogleSignIn = async () => {
        setError(null);
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Ocurrió un error al iniciar sesión con Google');
            setGoogleLoading(false);
        }
    };

    /**
     * Maneja el envío del formulario de login.
     *
     * Flujo:
     * 1. Previene el envío por defecto del formulario.
     * 2. Limpia errores previos y activa el estado de carga.
     * 3. Llama a signIn con email y contraseña.
     * 4. Si es exitoso, redirige a /dashboard.
     * 5. Si falla, muestra un mensaje de error descriptivo en español.
     *
     * @param {React.FormEvent} e - Evento de envío del formulario.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signIn(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            // Traduce el mensaje de error genérico de Supabase al español.
            if (err.message === 'Invalid login credentials') {
                setError('Credenciales incorrectas. Por favor intenta de nuevo.');
            } else {
                setError(err.message || 'Ocurrió un error al iniciar sesión');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="glass-card w-full max-w-md p-8 md:p-10 relative overflow-hidden">
                {/* Elementos decorativos: orbes de luz difusa en las esquinas */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-lime/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-lime/5 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    {/* Encabezado del formulario */}
                    <h2 className="text-3xl font-bold text-white mb-2 text-center">Bienvenido de nuevo</h2>
                    <p className="text-gray-400 text-center mb-8">Ingresa a tu cuenta para continuar</p>

                    {/* Alerta de error: se muestra solo si hay un error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Botón de inicio de sesión con Google */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6"
                    >
                        {googleLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Conectando con Google...</span>
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Iniciar sesión con Google</span>
                            </>
                        )}
                    </button>

                    {/* Separador visual */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-gray-500 text-sm">o continúa con email</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    {/* Formulario de login */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Campo de email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="off"
                                    className="w-full bg-dark-bg/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary-lime/50 focus:ring-1 focus:ring-primary-lime/50 transition-all"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        {/* Campo de contraseña con toggle de visibilidad */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="off"
                                    className="w-full bg-dark-bg/50 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-primary-lime/50 focus:ring-1 focus:ring-primary-lime/50 transition-all"
                                    placeholder="••••••••"
                                />
                                {/* Botón para mostrar/ocultar contraseña */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Botón de envío con estado de carga */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-lime hover:bg-secondary-lime text-dark-bg font-semibold py-3 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Iniciando...</span>
                                </>
                            ) : (
                                "Iniciar Sesión"
                            )}
                        </button>
                    </form>

                    {/* Link de navegación al registro */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            ¿No tienes una cuenta?{' '}
                            <Link to="/register" className="text-primary-lime hover:underline font-medium">
                                Regístrate
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
