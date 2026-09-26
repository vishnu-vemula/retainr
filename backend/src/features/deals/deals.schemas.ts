import { z } from 'zod';

export const listDealsQuerySchema = z.object({
  stage: z.enum(['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).optional(),
  contactId: z.string().min(1).optional(),
  companyId: z.string().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  sort: z.enum(['position', 'recent']).default('position'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(100)
});

const dealBodySchema = z.object({
  title: z.string().trim().min(1).max(160),
  value: z.coerce.number().min(0).max(1_000_000_000),
  stage: z.enum(['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR']).optional(),
  probability: z.coerce.number().int().min(0).max(100).optional(),
  source: z.enum(['INBOUND', 'OUTBOUND', 'REFERRAL', 'PARTNER', 'EVENT', 'OTHER']).nullish(),
  nextStep: z.string().trim().max(200).nullish(),
  lostReason: z.string().trim().max(200).nullish(),
  churnReason: z.string().trim().max(200).nullish(),
  engagementType: z.enum(['PROJECT', 'RETAINER']).optional(),
  oneTimeValue: z.coerce.number().min(0).max(1_000_000_000).optional(),
  monthlyRecurringValue: z.coerce.number().min(0).max(1_000_000_000).optional(),
  serviceStartDate: z.coerce.date().nullish(),
  renewalDate: z.coerce.date().nullish(),
  renewalHealth: z.enum(['HEALTHY', 'AT_RISK', 'UNKNOWN']).optional(),
  renewalProbability: z.coerce.number().int().min(0).max(100).nullish(),
  nextReviewDate: z.coerce.date().nullish(),
  contactId: z.string().min(1).nullish(),
  companyId: z.string().min(1).nullish(),
  expectedCloseDate: z.coerce.date().nullish(),
  notes: z.string().trim().max(2000).nullish()
});

export const createDealSchema = dealBodySchema;
export const updateDealSchema = dealBodySchema.partial();

export const setDealTagsSchema = z.object({
  tagIds: z.array(z.string().min(1)).max(50).default([])
});

export const reorderDealsSchema = z.object({
  updates: z
    .array(
      z.object({
        id: z.string().min(1),
        stage: z.enum(['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']),
        position: z.coerce.number().int().min(0)
      })
    )
    .min(1)
    .max(100)
    .superRefine((updates, context) => {
      const ids = new Set<string>();
      const positions = new Set<string>();
      updates.forEach((update, index) => {
        if (ids.has(update.id)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'A deal can only be reordered once per request',
            path: [index, 'id']
          });
        }
        ids.add(update.id);

        const positionKey = `${update.stage}:${update.position}`;
        if (positions.has(positionKey)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Each stage position can only be assigned once per request',
            path: [index, 'position']
          });
        }
        positions.add(positionKey);
      });
    })
});

export const createDealItemSchema = z.object({
  productId: z.string().min(1).nullish(),
  description: z.string().trim().min(1).max(200),
  quantity: z.coerce.number().int().min(1).max(1000).default(1),
  unitPrice: z.coerce.number().min(0).max(1_000_000_000).default(0),
  kind: z.enum(['BASE', 'PACKAGE', 'ADD_ON']).default('BASE')
});

export const applyDealTemplateSchema = z.object({
  templateId: z.enum(['PAID_ADS', 'SEO', 'WEBSITE'])
});

export const updateDealItemSchema = createDealItemSchema.partial();

export type ListDealsQuery = z.infer<typeof listDealsQuerySchema>;
export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type SetDealTagsInput = z.infer<typeof setDealTagsSchema>;
export type ReorderDealsInput = z.infer<typeof reorderDealsSchema>;
export type CreateDealItemInput = z.infer<typeof createDealItemSchema>;
export type UpdateDealItemInput = z.infer<typeof updateDealItemSchema>;
