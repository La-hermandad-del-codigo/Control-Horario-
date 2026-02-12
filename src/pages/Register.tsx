// useState: manejo de estado del formulario. useMemo: cálculo memorizado de fuerza de contraseña.
import { useState, useMemo } from 'react';

// useAuth: hook de autenticación con función signUp.
import { useAuth } from '../hooks/useAuth';

// Link: navegación declarativa. useNavigate: redirección programática.
import { Link, useNavigate } from 'react-router-dom';

// Íconos de lucide-react:
// Loader2: spinner. Mail: email. Lock: candado. User: persona.
// AlertCircle: alerta. Eye/EyeOff: mostrar/ocultar contraseña.
import { Loader2, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Página de registro de nuevo usuario.
 *
 * Presenta un formulario completo con:
 * - Campos: nombre completo, email, contraseña y confirmación de contraseña.
 * - Indicador visual de fuerza de contraseña (barra de progreso dinámica).
 * - Validaciones: contraseña mínima 6 caracteres, al menos una mayúscula,
 *   y coincidencia con confirmación.
 * - Toggle de visibilidad para ambos campos de contraseña.
 * - Manejo de errores con mensajes en español.
 * - Efectos decorativos glass-card con orbes de luz difusa.
 */
export default function Register() {
    // Estados del formulario.
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Mensaje de error mostrado al usuario (null = sin error).
    const [error, setError] = useState<string | null>(null);

    // Indica si se está procesando el registro.
    const [loading, setLoading] = useState(false);

    // Controlan la visibilidad de los campos de contraseña.
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Extrae la función signUp del hook de autenticación.
    const { signUp } = useAuth();

    // Hook para redirigir al dashboard tras registro exitoso.
    const navigate = useNavigate();

    /**
     * Calcula la fuerza de la contraseña basándose en 4 criterios.
     *
     * Criterios evaluados (1 punto cada uno):
     * 1. Longitud mínima de 6 caracteres.
     * 2. Al menos una letra mayúscula.
     * 3. Al menos un dígito numérico.
     * 4. Al menos un carácter especial (no alfanumérico).
     *
     * Se recalcula solo cuando cambia `password` gracias a `useMemo`.
     *
     * @returns {Object} Objeto con:
     * - `level` {number} - Puntuación de 0 a 4.
     * - `label` {string} - Texto descriptivo (ej: "Muy débil", "Fuerte").
     * - `color` {string} - Clase CSS de color (ej: "bg-red-500", "bg-green-500").
     */
    const passwordStrength = useMemo(() => {
        if (!password) return { level: 0, label: '', color: '' };
        let score = 0;
        if (password.length >= 6) score++;       // Criterio 1: Longitud mínima.
        if (/[A-Z]/.test(password)) score++;     // Criterio 2: Mayúscula.
        if (/[0-9]/.test(password)) score++;     // Criterio 3: Número.
        if (/[^A-Za-z0-9]/.test(password)) score++; // Criterio 4: Carácter especial.

        // Mapeo de puntuación a etiqueta y color visual.
        const levels: Record<number, { label: string; color: string }> = {
            0: { label: 'Muy débil', color: 'bg-red-500' },
            1: { label: 'Débil', color: 'bg-orange-500' },
            2: { label: 'Media', color: 'bg-yellow-500' },
            3: { label: 'Fuerte', color: 'bg-primary-lime' },
            4: { label: 'Muy fuerte', color: 'bg-green-500' },
        };

        const { label, color } = levels[score];
        return { level: score, label, color };
    }, [password]);

    /**
     * Maneja el envío del formulario de registro.
     *
     * Validaciones previas al envío:
     * 1. Las contraseñas deben coincidir.
     * 2. Longitud mínima de 6 caracteres.
     * 3. Al menos una letra mayúscula.
     *
     * Si pasa las validaciones, llama a signUp y redirige al dashboard.
     * Si falla, muestra el mensaje de error apropiado en español.
     *
     * @param {React.FormEvent} e - Evento de envío del formulario.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validación: contraseñas deben coincidir.
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        // Validación: longitud mínima.
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        // Validación: al menos una mayúscula.
        if (!/[A-Z]/.test(password)) {
            setError('La contraseña debe contener al menos una letra mayúscula');
            return;
        }

        setLoading(true);

        try {
            await signUp(email, password, fullName);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            // Traduce mensaje de error de Supabase al español.
            if (err.message?.includes('already registered')) {
                setError('Este email ya está registrado');
            } else {
                setError(err.message || 'Ocurrió un error al registrarse');
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
                    {/* Encabezado */}
                    <h2 className="text-3xl font-bold text-white mb-2 text-center">Crear Cuenta</h2>
                    <p className="text-gray-400 text-center mb-8">Únete para gestionar tu tiempo eficientemente</p>

                    {/* Alerta de error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Formulario de registro */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Campo de nombre completo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    autoComplete="off"
                                    className="w-full bg-dark-bg/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary-lime/50 focus:ring-1 focus:ring-primary-lime/50 transition-all"
                                    placeholder="Juan Pérez"
                                />
                            </div>
                        </div>

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

                        {/* Campo de contraseña con indicador de fuerza */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
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

                            {/* Indicador visual de fuerza de contraseña */}
                            {password && (
                                <div className="mt-2 space-y-1">
                                    {/* Barra de 4 segmentos que se colorean según la fuerza */}
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.level
                                                    ? passwordStrength.color
                                                    : 'bg-gray-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    {/* Etiqueta de texto con el nivel de fuerza */}
                                    <p className={`text-xs font-medium transition-colors ${passwordStrength.level <= 1 ? 'text-red-400'
                                        : passwordStrength.level === 2 ? 'text-yellow-400'
                                            : 'text-green-400'
                                        }`}>
                                        {passwordStrength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Campo de confirmación de contraseña */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    className="w-full bg-dark-bg/50 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-primary-lime/50 focus:ring-1 focus:ring-primary-lime/50 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Botón de envío con estado de carga */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-lime hover:bg-secondary-lime text-dark-bg font-semibold py-3 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Creando cuenta...</span>
                                </>
                            ) : (
                                "Registrarse"
                            )}
                        </button>
                    </form>

                    {/* Link al login para usuarios que ya tienen cuenta */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            ¿Ya tienes una cuenta?{' '}
                            <Link to="/login" className="text-primary-lime hover:underline font-medium">
                                Inicia Sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
