import type { H3Event } from 'h3'
import type { User } from '#auth-utils'

/**
 * Require an authenticated admin-panel user; optionally restrict to roles.
 * `admin` passes every check.
 */
export async function requireRole(
  event: H3Event,
  roles?: Array<User['role']>,
): Promise<User> {
  const session = await requireUserSession(event)
  const user = session.user as User
  if (roles && user.role !== 'admin' && !roles.includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return user
}
