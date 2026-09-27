import assert from 'node:assert/strict'
import { test } from 'node:test'
import { safeHttpUrl } from '../src/shared/lib/safe-http-url.ts'

test('allows absolute HTTP and HTTPS links', () => {
  assert.equal(safeHttpUrl('https://example.com/path'), 'https://example.com/path')
  assert.equal(safeHttpUrl('http://example.com'), 'http://example.com')
})

test('does not render stored executable or relative links as anchors', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,<h1>x</h1>', '/admin', 'example.com', 'https://user:secret@example.com']) {
    assert.equal(safeHttpUrl(value), null)
  }
})
