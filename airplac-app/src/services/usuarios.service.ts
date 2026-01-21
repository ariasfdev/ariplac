import { api } from './api';

export interface Usuario {
  _id?: string;
  nombreUsuario: string;
  razonSocial: string;
  domicilio: string;
  telefono: string;
  mail: string;
  isActive: boolean;
  rolId?: string;
  rol?: string;
  lastLogin?: string;
}

export interface RegistrarUsuarioDto {
  nombreUsuario: string;
  razonSocial: string;
  domicilio: string;
  telefono: string;
  mail: string;
  contrasena: string;
  rolId: string;
  sucursalId: string;
}

export interface Rol {
  _id: string;
  nombre: string;
}

export async function obtenerUsuarios() {
  const { data } = await api.get('/auth/usuarios');
  return data;
}

export async function obtenerRoles() {
  const { data } = await api.get('/auth/roles');
  return data;
}

export async function crearUsuario(usuario: RegistrarUsuarioDto) {
  const { data } = await api.post('/auth/registrar', usuario);
  return data;
}

export async function actualizarUsuario(usuarioId: string, usuario: Partial<RegistrarUsuarioDto>) {
  const { data } = await api.put(`/auth/usuarios/${usuarioId}`, usuario);
  return data;
}

export async function toggleUserStatus(usuarioId: string, isActive: boolean, razon?: string) {
  const { data } = await api.post(`/auth/toggle-status/${usuarioId}`, {
    isActive,
    razon: razon || '',
  });
  return data;
}

export async function resetearContraseña(usuarioId: string, nuevaContrasena: string) {
  const { data } = await api.post(`/auth/reset-password/${usuarioId}`, {
    nuevaContrasena,
  });
  return data;
}
