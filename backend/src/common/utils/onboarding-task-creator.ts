export interface OnboardingTaskCreator {
  createForWonDeal(ownerId: string, dealId: string, contactId: string | null): Promise<void>;
}
