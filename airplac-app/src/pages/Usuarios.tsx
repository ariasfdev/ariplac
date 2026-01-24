import React, { useState, useEffect } from 'react';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, toggleUserStatus, resetearContraseña, Usuario, obtenerRoles, Rol, RegistrarUsuarioDto } from '../services/usuarios.service';
import Modal from '../componets/Modal';
import SuccessModal from '../componets/SuccessModal';
import ErrorModal from '../componets/ErrorModal';

interface PasswordRequirement {
  label: string;
  met: boolean;
  regex: RegExp;
}

const getPasswordRequirements = (password: string): PasswordRequirement[] => {
  return [
    {
      label: 'Mínimo 8 caracteres',
      met: password.length >= 8,
      regex: /.{8,}/,
    },
    {
      label: 'Una mayúscula (A-Z)',
      met: /[A-Z]/.test(password),
      regex: /[A-Z]/,
    },
    {
      label: 'Una minúscula (a-z)',
      met: /[a-z]/.test(password),
      regex: /[a-z]/,
    },
    {
      label: 'Un número (0-9)',
      met: /[0-9]/.test(password),
      regex: /[0-9]/,
    },
    {
      label: 'Un carácter especial (!@#$%^&*)',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    },
  ];
};

const Usuarios: React.FC = () => {
  const DEFAULT_SUCURSAL_ID = '696bf44f76430ec803078081';
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditando, setIsEditando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ usuarioId: string; action: string; razon?: string } | null>(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({ usuarioId: '', newPassword: '', confirmPassword: '' });
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Formulario para crear/editar usuario
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    razonSocial: '',
    domicilio: '',
    telefono: '',
    mail: '',
    contrasena: '',
    confirmarContrasena: '',
    rolId: '',
  });

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const data = await obtenerUsuarios();
      setUsuarios(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await obtenerRoles();
      setRoles(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar roles');
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setFieldErrors({});

    const newFieldErrors: { [key: string]: string } = {};

    // Validar todos los campos requeridos
    if (!formData.nombreUsuario) newFieldErrors.nombreUsuario = 'Este campo es requerido';
    if (!formData.razonSocial) newFieldErrors.razonSocial = 'Este campo es requerido';
    if (!formData.domicilio) newFieldErrors.domicilio = 'Este campo es requerido';
    if (!formData.telefono) newFieldErrors.telefono = 'Este campo es requerido';
    if (!formData.mail) newFieldErrors.mail = 'Este campo es requerido';
    if (!formData.rolId) newFieldErrors.rolId = 'Selecciona un rol';

    // Si es nuevo usuario, validar contraseña
    if (!isEditando) {
      if (!formData.contrasena) {
        newFieldErrors.contrasena = 'La contraseña es requerida';
      } else if (formData.contrasena.length < 8) {
        newFieldErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
      }
      
      if (formData.contrasena && !formData.confirmarContrasena) {
        newFieldErrors.confirmarContrasena = 'Confirma tu contraseña';
      } else if (formData.contrasena !== formData.confirmarContrasena) {
        newFieldErrors.confirmarContrasena = 'Las contraseñas no coinciden';
      }
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    // Validar rol contra la lista disponible
    const rolValido = roles.find((rol) => rol._id === formData.rolId);
    if (!rolValido) {
      setFieldErrors({ rolId: 'Selecciona un rol válido' });
      return;
    }

    setIsCreating(true);
    try {
      if (isEditando && usuarioEditandoId) {
        // Actualizar usuario
        const actualizaciones: any = {
          nombreUsuario: formData.nombreUsuario,
          razonSocial: formData.razonSocial,
          domicilio: formData.domicilio,
          telefono: formData.telefono,
          mail: formData.mail,
          rolId: rolValido._id,
        };
        await actualizarUsuario(usuarioEditandoId, actualizaciones);
        setSuccess('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        const nuevoUsuario: RegistrarUsuarioDto = {
          nombreUsuario: formData.nombreUsuario,
          razonSocial: formData.razonSocial,
          domicilio: formData.domicilio,
          telefono: formData.telefono,
          mail: formData.mail,
          contrasena: formData.contrasena,
          rolId: rolValido._id,
          sucursalId: DEFAULT_SUCURSAL_ID,
        };
        await crearUsuario(nuevoUsuario);
        setSuccess('Usuario creado exitosamente');
      }

      setFormData({
        nombreUsuario: '',
        razonSocial: '',
        domicilio: '',
        telefono: '',
        mail: '',
        contrasena: '',
        confirmarContrasena: '',
        rolId: '',
      });
      setModalError(null);
      setFieldErrors({});
      setIsModalOpen(false);
      setIsEditando(false);
      setUsuarioEditandoId(null);
      await fetchUsuarios();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || '';
      
      // Detectar errores de duplicación
      if (errorMsg.includes('E11000') || errorMsg.includes('duplicate key')) {
        const newFieldErrors: { [key: string]: string } = {};
        
        if (errorMsg.includes('nombreUsuario')) {
          newFieldErrors.nombreUsuario = 'Este nombre de usuario ya existe';
        }
        if (errorMsg.includes('mail')) {
          newFieldErrors.mail = 'Este correo electrónico ya está registrado';
        }
        if (errorMsg.includes('telefono')) {
          newFieldErrors.telefono = 'Este número de teléfono ya está registrado';
        }
        
        setFieldErrors(newFieldErrors);
      } else {
        // Para otros errores del servidor, intentar asignar a un campo relevante o mostrar como error general
        setFieldErrors({ general: errorMsg || 'Error al guardar usuario' });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (usuarioId: string, isActive: boolean) => {
    setConfirmAction({ usuarioId, action: 'toggle', razon: '' });
    setShowConfirmModal(true);
  };

  const handleModificar = (usuario: Usuario) => {
    setFormData({
      nombreUsuario: usuario.nombreUsuario,
      razonSocial: usuario.razonSocial || '',
      domicilio: usuario.domicilio || '',
      telefono: usuario.telefono || '',
      mail: usuario.mail,
      contrasena: '',
      confirmarContrasena: '',
      rolId: usuario.rolId || '',
    });
    setIsEditando(true);
    setUsuarioEditandoId(usuario._id || null);
    setIsModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmAction) return;

    try {
      await toggleUserStatus(confirmAction.usuarioId, !usuarios.find(u => u._id === confirmAction.usuarioId)?.isActive, confirmAction.razon);
      setSuccess(`Usuario ${usuarios.find(u => u._id === confirmAction.usuarioId)?.isActive ? 'desactivado' : 'activado'} exitosamente`);
      setShowConfirmModal(false);
      setConfirmAction(null);
      await fetchUsuarios();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cambiar estado del usuario');
    }
  };

  const handleResetPassword = async (usuarioId: string) => {
    setResetPasswordData({ usuarioId, newPassword: '', confirmPassword: '' });
    setResetPasswordError(null);
    setShowResetPasswordModal(true);
  };

  const handleConfirmResetPassword = async () => {
    setResetPasswordError(null);

    if (!resetPasswordData.newPassword || resetPasswordData.newPassword.length < 8) {
      setResetPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setResetPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      await resetearContraseña(resetPasswordData.usuarioId, resetPasswordData.newPassword);
      setSuccess('Contraseña reseteada exitosamente');
      setShowResetPasswordModal(false);
      setResetPasswordData({ usuarioId: '', newPassword: '', confirmPassword: '' });
      await fetchUsuarios();
    } catch (err: any) {
      setResetPasswordError(err?.response?.data?.message || 'Error al resetear contraseña');
    }
  };

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.mail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {success && <SuccessModal message={success} onClose={() => setSuccess(null)} />}
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}

      <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-focus px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-primary-content text-2xl font-bold">Gestión de Usuarios</h2>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar usuario..."
              className="input input-bordered input-sm flex-1 sm:flex-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={() => {
              setIsEditando(false);
              setUsuarioEditandoId(null);
              setFormData({
                nombreUsuario: '',
                razonSocial: '',
                domicilio: '',
                telefono: '',
                mail: '',
                contrasena: '',
                confirmarContrasena: '',
                rolId: '',
              });
              setModalError(null);
              setFieldErrors({});
              setIsModalOpen(true);
            }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-base-content/60">No hay usuarios registrados</p>
            </div>
          ) : (
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200">
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Estado</th>
                  <th>Último Login</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario._id} className="hover:bg-base-200">
                    <td className="font-medium">{usuario.nombreUsuario}</td>
                    <td>{usuario.mail}</td>
                    <td>
                      <span
                        className={`badge ${
                          usuario.isActive ? 'badge-success' : 'badge-error'
                        }`}
                      >
                        {usuario.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="text-sm text-base-content/70">
                      {usuario.lastLogin
                        ? new Date(usuario.lastLogin).toLocaleDateString('es-AR')
                        : 'Nunca'}
                    </td>
                    <td>
                      <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="btn btn-sm btn-ghost">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-[9999]">
                          <li>
                            <button onClick={() => handleModificar(usuario)}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Modificar
                            </button>
                          </li>
                          <li>
                            <button onClick={() => handleResetPassword(usuario._id!)}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                />
                              </svg>
                              Resetear Contraseña
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => handleToggleStatus(usuario._id!, usuario.isActive)}
                              className={usuario.isActive ? 'text-error' : 'text-success'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={usuario.isActive ? 'M6 18L18 6M6 6l12 12' : 'M5 13l4 4L19 7'}
                                />
                              </svg>
                              {usuario.isActive ? 'Desactivar' : 'Activar'}
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de crear usuario */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-base-200 p-6 rounded-lg max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">{isEditando ? 'Modificar Usuario' : 'Crear Nuevo Usuario'}</h2>
          
          <form onSubmit={handleCrearUsuario}>
            {/* Primera columna */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nombre de Usuario *</span>
                </label>
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  className={`input input-bordered ${fieldErrors.nombreUsuario ? 'input-error' : ''}`}
                  value={formData.nombreUsuario}
                  onChange={(e) => {
                    setFormData({ ...formData, nombreUsuario: e.target.value });
                    setFieldErrors({ ...fieldErrors, nombreUsuario: '' });
                  }}
                  required
                />
                {fieldErrors.nombreUsuario && (
                  <p className="text-error text-xs mt-1">{fieldErrors.nombreUsuario}</p>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nombre y Apellido *</span>
                </label>
                <input
                  type="text"
                  placeholder="Nombre y apellido"
                  className={`input input-bordered ${fieldErrors.razonSocial ? 'input-error' : ''}`}
                  value={formData.razonSocial}
                  onChange={(e) => {
                    setFormData({ ...formData, razonSocial: e.target.value });
                    setFieldErrors({ ...fieldErrors, razonSocial: '' });
                  }}
                  required
                />
                {fieldErrors.razonSocial && (
                  <p className="text-error text-xs mt-1">{fieldErrors.razonSocial}</p>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Domicilio *</span>
                </label>
                <input
                  type="text"
                  placeholder="Domicilio"
                  className={`input input-bordered ${fieldErrors.domicilio ? 'input-error' : ''}`}
                  value={formData.domicilio}
                  onChange={(e) => {
                    setFormData({ ...formData, domicilio: e.target.value });
                    setFieldErrors({ ...fieldErrors, domicilio: '' });
                  }}
                  required
                />
                {fieldErrors.domicilio && (
                  <p className="text-error text-xs mt-1">{fieldErrors.domicilio}</p>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Teléfono *</span>
                </label>
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className={`input input-bordered ${fieldErrors.telefono ? 'input-error' : ''}`}
                  value={formData.telefono}
                  onChange={(e) => {
                    setFormData({ ...formData, telefono: e.target.value });
                    setFieldErrors({ ...fieldErrors, telefono: '' });
                  }}
                  required
                />
                {fieldErrors.telefono && (
                  <p className="text-error text-xs mt-1">{fieldErrors.telefono}</p>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Correo *</span>
                </label>
                <input
                  type="email"
                  placeholder="usuario@email.com"
                  className={`input input-bordered ${fieldErrors.mail ? 'input-error' : ''}`}
                  value={formData.mail}
                  onChange={(e) => {
                    setFormData({ ...formData, mail: e.target.value });
                    setFieldErrors({ ...fieldErrors, mail: '' });
                  }}
                  required
                />
                {fieldErrors.mail && (
                  <p className="text-error text-xs mt-1">{fieldErrors.mail}</p>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Rol *</span>
                </label>
                <select
                  className={`select select-bordered ${fieldErrors.rolId ? 'select-error' : ''}`}
                  value={formData.rolId}
                  onChange={(e) => {
                    setFormData({ ...formData, rolId: e.target.value });
                    setFieldErrors({ ...fieldErrors, rolId: '' });
                  }}
                  required
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((rol) => (
                    <option key={rol._id} value={rol._id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
                {fieldErrors.rolId && (
                  <p className="text-error text-xs mt-1">{fieldErrors.rolId}</p>
                )}
              </div>

              {!isEditando && (
                <>
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text">Contraseña *</span>
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarContrasena ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        className={`input input-bordered w-full pr-12 ${fieldErrors.contrasena ? 'input-error' : ''}`}
                        value={formData.contrasena}
                        onChange={(e) => {
                          setFormData({ ...formData, contrasena: e.target.value });
                          setFieldErrors({ ...fieldErrors, contrasena: '' });
                        }}
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
                    {fieldErrors.contrasena && (
                      <p className="text-error text-xs mt-1">{fieldErrors.contrasena}</p>
                    )}
                    {!fieldErrors.contrasena && (
                      <p className="text-xs text-base-content/70 mt-1">
                        Requisitos: mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo.
                      </p>
                    )}
                  </div>

                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text">Confirmar Contraseña *</span>
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarConfirmar ? 'text' : 'password'}
                        placeholder="Repite la contraseña"
                        className={`input input-bordered w-full pr-12 ${fieldErrors.confirmarContrasena ? 'input-error' : ''}`}
                        value={formData.confirmarContrasena}
                        onChange={(e) => {
                          setFormData({ ...formData, confirmarContrasena: e.target.value });
                          setFieldErrors({ ...fieldErrors, confirmarContrasena: '' });
                        }}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setMostrarConfirmar((prev) => !prev)}
                        aria-label={mostrarConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                    {mostrarConfirmar ? (
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
                    {fieldErrors.confirmarContrasena && (
                      <p className="text-error text-xs mt-1">{fieldErrors.confirmarContrasena}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {fieldErrors.general && (
              <div className="mt-4">
                <p className="text-error text-sm">{fieldErrors.general}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button type="button" className="btn btn-ghost" onClick={() => {
                setIsModalOpen(false);
                setIsEditando(false);
                setUsuarioEditandoId(null);
                setModalError(null);
                setFieldErrors({});
              }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={isCreating}>
                {isCreating ? (isEditando ? 'Guardando...' : 'Creando...') : (isEditando ? 'Guardar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-4">
              ¿{usuarios.find(u => u._id === confirmAction?.usuarioId)?.isActive ? 'Desactivar' : 'Activar'} usuario?
            </h3>
            <p className="text-base-content/70 mb-4">
              ¿Estás seguro de que deseas {usuarios.find(u => u._id === confirmAction?.usuarioId)?.isActive ? 'desactivar' : 'activar'} a {usuarios.find(u => u._id === confirmAction?.usuarioId)?.nombreUsuario}?
            </p>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-sm">Razón (opcional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Motivo..."
                value={confirmAction?.razon || ''}
                onChange={(e) =>
                  setConfirmAction(confirmAction ? { ...confirmAction, razon: e.target.value } : null)
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-error" onClick={handleConfirmToggle}>
                {usuarios.find(u => u._id === confirmAction?.usuarioId)?.isActive ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de resetear contraseña */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg shadow-xl p-6 max-w-md mx-4 w-full">
            <h3 className="text-lg font-bold mb-4">Resetear Contraseña</h3>
            
            <p className="text-base-content/70 mb-4">
              Ingresa la nueva contraseña para {usuarios.find(u => u._id === resetPasswordData.usuarioId)?.nombreUsuario}
            </p>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Nueva Contraseña</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarNuevaPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  className="input input-bordered w-full pr-12"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => {
                    setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value });
                    setResetPasswordError(null);
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setMostrarNuevaPassword(!mostrarNuevaPassword)}
                  aria-label={mostrarNuevaPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarNuevaPassword ? (
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
              {resetPasswordError && resetPasswordData.newPassword.length < 8 && (
                <p className="text-error text-xs mt-1">{resetPasswordError}</p>
              )}
              {!resetPasswordError && resetPasswordData.newPassword && (
                <div className="text-xs mt-2 space-y-1">
                  <p className="font-semibold text-base-content/80">Verificando requisitos:</p>
                  {getPasswordRequirements(resetPasswordData.newPassword).map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className={`${req.met ? 'text-success' : 'text-error'}`}>
                        {req.met ? '✓' : '✗'}
                      </span>
                      <span className={req.met ? 'text-success' : 'text-error'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {!resetPasswordError && !resetPasswordData.newPassword && (
                <div className="text-xs text-base-content/70 mt-2 space-y-1">
                  <p className="font-semibold">Requisitos:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Mínimo 8 caracteres</li>
                    <li>Una mayúscula (A-Z)</li>
                    <li>Una minúscula (a-z)</li>
                    <li>Un número (0-9)</li>
                    <li>Un carácter especial (!@#$%^&*)</li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Confirmar Contraseña</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarConfirmarPassword ? 'text' : 'password'}
                  placeholder="Repite la contraseña"
                  className="input input-bordered w-full pr-12"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => {
                    setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value });
                    setResetPasswordError(null);
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
                  aria-label={mostrarConfirmarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarConfirmarPassword ? (
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
              {resetPasswordError && resetPasswordData.newPassword !== resetPasswordData.confirmPassword && (
                <p className="text-error text-xs mt-1">{resetPasswordError}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => {
                setShowResetPasswordModal(false);
                setResetPasswordError(null);
                setResetPasswordData({ usuarioId: '', newPassword: '', confirmPassword: '' });
                setMostrarNuevaPassword(false);
                setMostrarConfirmarPassword(false);
              }}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleConfirmResetPassword}>
                Resetear Contraseña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
