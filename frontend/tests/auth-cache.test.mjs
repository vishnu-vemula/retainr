import assert from 'node:assert/strict'
import { test } from 'node:test'
import { QueryClient } from '@tanstack/react-query'
import { clearQueriesOnIdentityChange } from '../src/features/auth/model/auth-cache.ts'

test('clears private query data when an account signs out or another account signs in', () => {
  const client = new QueryClient()
  client.setQueryData(['contacts'], [{ name: 'Private Client' }])
  clearQueriesOnIdentityChange(client, 'owner-a', null)
  assert.equal(client.getQueryData(['contacts']), undefined)

  client.setQueryData(['deals'], [{ title: 'Private Deal' }])
  clearQueriesOnIdentityChange(client, 'owner-a', 'owner-b')
  assert.equal(client.getQueryData(['deals']), undefined)
})

test('keeps the cache for a token refresh by the same account', () => {
  const client = new QueryClient()
  client.setQueryData(['contacts'], [{ name: 'Same User' }])
  clearQueriesOnIdentityChange(client, 'owner-a', 'owner-a')
  assert.deepEqual(client.getQueryData(['contacts']), [{ name: 'Same User' }])
})
