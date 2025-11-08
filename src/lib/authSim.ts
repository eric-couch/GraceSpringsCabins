import type { Session, UserRole } from '../types/models';

const SESSION_KEY = 'cabinPortalSession';

/**
 * Get current session from localStorage
 */
export function getSession(): Session | null {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as Session;
  } catch {
    return null;
  }
}

/**
 * Set session in localStorage
 */
export function setSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Clear session from localStorage
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Check if current user has required role
 */
export function hasRole(role: UserRole): boolean {
  const session = getSession();
  return session?.role === role;
}

/**
 * Check if current user has any of the required roles
 */
export function hasAnyRole(roles: UserRole[]): boolean {
  const session = getSession();
  return session ? roles.includes(session.role) : false;
}

/**
 * Get current user ID
 */
export function getCurrentUserId(): string | null {
  const session = getSession();
  return session?.userId ?? null;
}

/**
 * Get current property ID
 */
export function getCurrentPropertyId(): string | null {
  const session = getSession();
  return session?.propertyId ?? null;
}

/**
 * Get current cabin ID
 */
export function getCurrentCabinId(): string | null {
  const session = getSession();
  return session?.cabinId ?? null;
}

/**
 * Initialize demo session (for first-time users)
 */
export function initializeDemoSession(): void {
  if (!isAuthenticated()) {
    // Default to Renter role with Cabin 14
    setSession({
      role: 'Renter',
      userId: 'U-1001',
      propertyId: 'P-001',
      cabinId: 'C-014',
    });
  }
}
