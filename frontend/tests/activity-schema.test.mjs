import assert from 'node:assert/strict'
import { test } from 'node:test'
import { activityFormSchema } from '../src/features/activities/model/schema.ts'

const validActivity = {
  type: 'CALL',
  title: 'Client check-in',
  occurredAt: '2026-09-27T10:30',
  durationMin: '30',
  body: '',
  contactId: '',
  dealId: '',
}

test('accepts activity durations at the API boundaries', () => {
  assert.equal(activityFormSchema.safeParse({ ...validActivity, durationMin: '' }).success, true)
  assert.equal(activityFormSchema.safeParse({ ...validActivity, durationMin: '1' }).success, true)
  assert.equal(activityFormSchema.safeParse({ ...validActivity, durationMin: '1440' }).success, true)
})

test('rejects durations the API cannot save', () => {
  for (const durationMin of ['0', '1441', '-1', '1.5', 'noon']) {
    assert.equal(activityFormSchema.safeParse({ ...validActivity, durationMin }).success, false, durationMin)
  }
})

test('rejects titles longer than the API limit', () => {
  assert.equal(activityFormSchema.safeParse({ ...validActivity, title: 'a'.repeat(160) }).success, true)
  assert.equal(activityFormSchema.safeParse({ ...validActivity, title: 'a'.repeat(161) }).success, false)
  assert.equal(activityFormSchema.safeParse({ ...validActivity, title: '   ' }).success, false)
})

test('rejects invalid occurrence dates before submission', () => {
  assert.equal(activityFormSchema.safeParse({ ...validActivity, occurredAt: 'not-a-date' }).success, false)
})
