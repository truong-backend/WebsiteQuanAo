import type { UserInfo } from '@shared/types'

export type { UserInfo }

export function isAdmin(user: UserInfo | null): boolean {
  return user?.role === 'ROLE_ADMIN'
}
