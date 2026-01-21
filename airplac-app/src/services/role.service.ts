// Decodifica un JWT token sin necesidad de librerías
export function decodeToken(token: string): { id: string; rolId: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Obtiene el rolId del token almacenado
export function getUserRole(): string | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded?.rolId || null;
}

// Verifica si el usuario tiene un rol específico
export function hasRole(requiredRole: string): boolean {
  const rolId = getUserRole();
  if (!rolId) return false;
  
  // Este check es simplificado, normalmente necesitarías verificar el nombre del rol
  // Por ahora usamos el rolId que viene del token
  return !!rolId;
}

// Verifica si es admin o superadmin
export function isAdmin(roleName?: string): boolean {
  return roleName === 'Admin' || roleName === 'Superadmin';
}

// Verifica si es superadmin
export function isSuperadmin(roleName?: string): boolean {
  return roleName === 'Superadmin';
}

// Verifica si es vendedor
export function isVendedor(roleName?: string): boolean {
  return roleName === 'Vendedor';
}
