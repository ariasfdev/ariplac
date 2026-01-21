import { api } from './api';

export async function login(usuario: string, contrasena: string) {
  const { data } = await api.post('/auth/login', { usuario, contrasena });
  return data; // { message, accessToken, refreshToken }
}

export async function refresh() {
  const { data } = await api.post('/auth/refresh');
  return data; // { message, accessToken }
}

export async function logout() {
  await api.post('/auth/logout');
}
export async function enviarCodigoRecuperacion(dto: { mail: string }) {
  const { data } = await api.post('/auth/recuperar', dto);
  return data; // { message }
}

export async function verificarCodigo(dto: { mail: string; codigo: string }) {
  const { data } = await api.post('/auth/verificar-codigo', dto);
  return data; // { message }
}

export async function cambiarContrasena(dto: { mail: string; nuevaContrasena: string }) {
  const { data } = await api.post('/auth/cambiar-contrasena', dto);
  return data; // { message }
}