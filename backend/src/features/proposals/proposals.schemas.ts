import { z } from 'zod';

export const createProposalSchema = z.object({
  dealId: z.string().min(1),
  expiresInDays: z.coerce.number().int().min(1).max(90).default(14)
});

export const listProposalsSchema = z.object({ dealId: z.string().min(1) });

export const respondProposalSchema = z.discriminatedUnion('decision', [
  z.object({
    decision: z.literal('ACCEPTED'),
    selectedPackageId: z.string().min(1).nullish(),
    selectedAddonIds: z.array(z.string().min(1)).max(25).default([])
  }),
  z.object({ decision: z.literal('DECLINED') })
]);

export const proposalSnapshotSchema = z.object({
  title: z.string(),
  currency: z.string(),
  engagementType: z.enum(['PROJECT', 'RETAINER']),
  oneTimeValue: z.number(),
  monthlyRecurringValue: z.number(),
  serviceStartDate: z.string().nullable(),
  renewalDate: z.string().nullable(),
  items: z.array(z.object({
    id: z.string(),
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    kind: z.enum(['BASE', 'PACKAGE', 'ADD_ON'])
  }))
});

export type ProposalSnapshot = z.infer<typeof proposalSnapshotSchema>;
export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type RespondProposalInput = z.infer<typeof respondProposalSchema>;
