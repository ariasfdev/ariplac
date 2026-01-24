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
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para recuperación de contraseña
  const [mail, setMail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarNuevaContrasena, setMostrarNuevaContrasena] = useState(false);
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

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
    setFieldErrors({});

    const newFieldErrors: { [key: string]: string } = {};

    if (!nuevaContrasena) {
      newFieldErrors.nuevaContrasena = 'La contraseña es requerida';
    } else if (nuevaContrasena.length < 8) {
      newFieldErrors.nuevaContrasena = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!confirmarContrasena) {
      newFieldErrors.confirmarContrasena = 'Confirma tu contraseña';
    } else if (nuevaContrasena !== confirmarContrasena) {
      newFieldErrors.confirmarContrasena = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setLoading(true);
    try {
      await cambiarContrasena({ mail, nuevaContrasena });
      setError(null);
      setFieldErrors({});
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
                  <div className="relative">
                    <input
                      type={mostrarContrasena ? 'text' : 'password'}
                      placeholder="Ingresa tu contraseña"
                      className="input input-bordered w-full pr-12"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setMostrarContrasena((prev) => !prev)}
                      aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {mostrarContrasena ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.477 10.486A2.5 2.5 0 0112 9.5a2.5 2.5 0 012.5 2.5 2.5 2.5 0 01-.986 1.987m-2.614.454a2.5 2.5 0 001.1.059M4.5 4.5C3.158 5.806 2.03 7.346 1.17 9c2.12 4.24 6.12 7 10.83 7 1.425 0 2.79-.25 4.06-.71m2.82-1.77C20.93 12.83 22 11 22 11c-2.12-4.24-6.12-7-10.83-7-.977 0-1.93.1-2.848.29" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
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
              <form onSubmit={handleResetPassword}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Nueva Contraseña</span>
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarNuevaContrasena ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      className={`input input-bordered w-full pr-12 ${fieldErrors.nuevaContrasena ? 'input-error' : ''}`}
                      value={nuevaContrasena}
                      onChange={(e) => {
                        setNuevaContrasena(e.target.value);
                        setFieldErrors({ ...fieldErrors, nuevaContrasena: '' });
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setMostrarNuevaContrasena(!mostrarNuevaContrasena)}
                      aria-label={mostrarNuevaContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {mostrarNuevaContrasena ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.nuevaContrasena && (
                    <p className="text-error text-xs mt-1">{fieldErrors.nuevaContrasena}</p>
                  )}
                </div>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Confirmar Contraseña</span>
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarConfirmarContrasena ? 'text' : 'password'}
                      placeholder="Repite tu contraseña"
                      className={`input input-bordered w-full pr-12 ${fieldErrors.confirmarContrasena ? 'input-error' : ''}`}
                      value={confirmarContrasena}
                      onChange={(e) => {
                        setConfirmarContrasena(e.target.value);
                        setFieldErrors({ ...fieldErrors, confirmarContrasena: '' });
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
                      aria-label={mostrarConfirmarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {mostrarConfirmarContrasena ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmarContrasena && (
                    <p className="text-error text-xs mt-1">{fieldErrors.confirmarContrasena}</p>
                  )}
                </div>
                {error && (
                  <div className="mb-4">
                    <p className="text-error text-sm">{error}</p>
                  </div>
                )}
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
