import { describe, expect, it } from 'vitest';
import { createContactSchema, updateContactSchema } from './contacts.schemas';

describe('contact website validation', () => {
  it('rejects executable and relative website links', () => {
    for (const website of ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', '/admin', 'example.com', 'https://user:secret@example.com']) {
      expect(createContactSchema.safeParse({ name: 'Test', website }).success).toBe(false);
      expect(updateContactSchema.safeParse({ website }).success).toBe(false);
    }
  });

  it('accepts absolute HTTP and HTTPS websites', () => {
    expect(createContactSchema.safeParse({ name: 'Test', website: 'https://example.com' }).success).toBe(true);
    expect(updateContactSchema.safeParse({ website: 'http://example.com' }).success).toBe(true);
  });
});
