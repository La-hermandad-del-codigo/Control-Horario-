import { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { signUp } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const passwordStrength = useMemo(() => {
        if (!password) return { level: 0, label: '', color: '' };
        let score = 0;
        if (password.length >= 8 && password.length <= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const levels: Record<number, { label: string; color: string }> = {
            0: { label: 'Muy débil', color: 'bg-red-500' },
            1: { label: 'Débil', color: 'bg-orange-500' },
            2: { label: 'Media', color: 'bg-yellow-500' },
            3: { label: 'Fuerte', color: 'bg-blue-600' },
            4: { label: 'Muy fuerte', color: 'bg-green-500' },
        };

        const { label, color } = levels[score];
        return { level: score, label, color };
    }, [password]);

    const passwordRequirements = useMemo(() => {
        return [
            { label: 'Entre 8 y 12 caracteres', met: password.length >= 8 && password.length <= 12 },
            { label: 'Al menos una letra mayúscula', met: /[A-Z]/.test(password) },
            { label: 'Al menos un número', met: /[0-9]/.test(password) },
            { label: 'Al menos un carácter especial', met: /[^A-Za-z0-9]/.test(password) },
        ];
    }, [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 8 || password.length > 12) {
            setError('La contraseña debe tener entre 8 y 12 caracteres');
            return;
        }
        if (!/[A-Z]/.test(password)) {
            setError('La contraseña debe contener al menos una letra mayúscula');
            return;
        }

        setLoading(true);

        try {
            await signUp(email, password, fullName);
            showToast('¡Cuenta creada exitosamente!', 'success');
            navigate('/dashboard');
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'Error desconocido';

            if (message?.includes('already registered')) {
                setError('Este email ya está registrado');
            } else {
                setError(message || 'Ocurrió un error al registrarse');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">CH</span>
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                    Crear Cuenta
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Únete para gestionar tu tiempo eficientemente
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="py-8 px-4 sm:px-10">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="relative">
                            <Input
                                id="fullName"
                                name="fullName"
                                label="Nombre Completo"
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Juan Pérez"
                                className="pl-10"
                            />
                            <User className="absolute left-3 top-[34px] text-gray-400" size={18} />
                        </div>

                        <div className="relative">
                            <Input
                                id="email"
                                name="email"
                                label="Email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="pl-10"
                            />
                            <Mail className="absolute left-3 top-[34px] text-gray-400" size={18} />
                        </div>

                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                label="Contraseña"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10 pr-10"
                            />
                            <Lock className="absolute left-3 top-[34px] text-gray-400" size={18} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>

                            {/* Strength Indicator */}
                            {password && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.level
                                                    ? passwordStrength.color
                                                    : 'bg-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs font-medium ${passwordStrength.level <= 1 ? 'text-red-500'
                                        : passwordStrength.level === 2 ? 'text-yellow-500'
                                            : 'text-green-600'
                                        }`}>
                                        {passwordStrength.label}
                                    </p>

                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-1.5">
                                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Requisitos</p>
                                        {passwordRequirements.map((req, idx) => (
                                            <div key={idx} className={`flex items-center gap-2 ${req.met ? 'opacity-100' : 'opacity-70'}`}>
                                                <div className={`flex items-center justify-center w-4 h-4 rounded-full ${req.met
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {req.met ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                                                </div>
                                                <span className={`text-xs ${req.met ? 'text-green-700' : 'text-gray-500'}`}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Confirmar Contraseña"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10 pr-10"
                            />
                            <Lock className="absolute left-3 top-[34px] text-gray-400" size={18} />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <Button className="w-full justify-center" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Creando cuenta...
                                </>
                            ) : (
                                "Registrarse"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes una cuenta?{' '}
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Inicia Sesión
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}