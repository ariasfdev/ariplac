import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, enviarCodigoRecuperacion, verificarCodigo, cambiarContrasena } from '../services/auth.service';

type LoginStep = 'login' | 'forgot-email' | 'verify-code' | 'reset-password';

const Login: React.FC = () => {
  const [step, setStep] = useState<LoginStep>('login');
  const navigate = useNavigate();

  // Estados para login
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para recuperación de contraseña
  const [mail, setMail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(usuario, contrasena);

      // Guarda el access token por si el refresco inicial estaba en estado no autenticado
      if (data?.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
      }

      // Fuerza recarga para que el AuthProvider revalide la sesión con las cookies recién emitidas
      window.location.href = '/home/pedidos';
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await enviarCodigoRecuperacion({ mail });
      setStep('verify-code');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al enviar código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verificarCodigo({ mail, codigo });
      setStep('reset-password');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al verificar código');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (nuevaContrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await cambiarContrasena({ mail, nuevaContrasena });
      setError(null);
      // Resetear form y volver a login
      setMail('');
      setCodigo('');
      setNuevaContrasena('');
      setConfirmarContrasena('');
      setStep('login');
      setUsuario('');
      setContrasena('');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const resetRecoveryForm = () => {
    setMail('');
    setCodigo('');
    setNuevaContrasena('');
    setConfirmarContrasena('');
    setError(null);
    setStep('login');
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Pantalla de Login */}
          {step === 'login' && (
            <>
              <h2 className="card-title text-center">Iniciar Sesión</h2>
              {error && (
                <div className="alert alert-error text-sm">{error}</div>
              )}
              <form onSubmit={handleLogin}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Usuario</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa tu usuario"
                    className="input input-bordered"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Contraseña</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    className="input input-bordered"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control mt-6">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                  </button>
                </div>
              </form>
              <div className="divider">O</div>
              <button
                onClick={() => {
                  setStep('forgot-email');
                  setError(null);
                }}
                className="btn btn-link btn-sm text-center"
              >
                ¿Has olvidado tu contraseña?
              </button>
            </>
          )}

          {/* Pantalla de Email para Recuperación */}
          {step === 'forgot-email' && (
            <>
              <h2 className="card-title text-center text-lg">Recuperar Contraseña</h2>
              <p className="text-sm text-base-content/70 text-center mb-4">
                Ingresa tu correo para recibir un código de recuperación
              </p>
              {error && (
                <div className="alert alert-error text-sm">{error}</div>
              )}
              <form onSubmit={handleEnviarCodigo}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Correo</span>
                  </label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="input input-bordered"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control mt-6 gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Código'}
                  </button>
                  <button
                    type="button"
                    onClick={resetRecoveryForm}
                    className="btn btn-ghost"
                  >
                    Volver
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Pantalla de Verificación de Código */}
          {step === 'verify-code' && (
            <>
              <h2 className="card-title text-center text-lg">Verificar Código</h2>
              <p className="text-sm text-base-content/70 text-center mb-4">
                Ingresa el código que recibiste en tu correo
              </p>
              {error && (
                <div className="alert alert-error text-sm">{error}</div>
              )}
              <form onSubmit={handleVerificarCodigo}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Código de Recuperación</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa el código"
                    className="input input-bordered text-center text-lg tracking-widest"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                    maxLength={6}
                  />
                </div>
                <div className="form-control mt-6 gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Verificando...' : 'Verificar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('forgot-email');
                      setError(null);
                      setCodigo('');
                    }}
                    className="btn btn-ghost"
                  >
                    Volver
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Pantalla de Cambiar Contraseña */}
          {step === 'reset-password' && (
            <>
              <h2 className="card-title text-center text-lg">Nueva Contraseña</h2>
              <p className="text-sm text-base-content/70 text-center mb-4">
                Ingresa tu nueva contraseña
              </p>
              {error && (
                <div className="alert alert-error text-sm">{error}</div>
              )}
              <form onSubmit={handleResetPassword}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Nueva Contraseña</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className="input input-bordered"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Confirmar Contraseña</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Repite tu contraseña"
                    className="input input-bordered"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control mt-6 gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                  <button
                    type="button"
                    onClick={resetRecoveryForm}
                    className="btn btn-ghost"
                  >
                    Volver al Login
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
