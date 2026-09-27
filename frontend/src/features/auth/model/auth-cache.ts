import type { QueryClient } from '@tanstack/react-query'

export function clearQueriesOnIdentityChange(client: QueryClient, previousUid: string | null | undefined, nextUid: string | null): void {
  if (previousUid !== undefined && previousUid !== nextUid) client.clear()
}
