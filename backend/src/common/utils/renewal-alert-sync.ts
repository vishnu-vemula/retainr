export interface RenewalAlertSync {
  syncRenewals(ownerId: string): Promise<void>;
}
