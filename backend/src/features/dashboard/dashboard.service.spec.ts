import { describe, expect, it } from 'vitest';
import { overdueOnboardingDealIds } from './dashboard.service';

describe('overdueOnboardingDealIds', () => {
  it('marks only incomplete onboarding tasks past their due date as overdue', () => {
    const now = new Date('2026-09-27T12:00:00.000Z');
    const ids = overdueOnboardingDealIds([
      { dealId: 'future', status: 'TODO', dueDate: new Date('2026-09-28T12:00:00.000Z') },
      { dealId: 'overdue', status: 'IN_PROGRESS', dueDate: new Date('2026-09-26T12:00:00.000Z') },
      { dealId: 'done', status: 'DONE', dueDate: new Date('2026-09-26T12:00:00.000Z') },
      { dealId: null, status: 'TODO', dueDate: new Date('2026-09-26T12:00:00.000Z') }
    ], now);
    expect([...ids]).toEqual(['overdue']);
  });
});
