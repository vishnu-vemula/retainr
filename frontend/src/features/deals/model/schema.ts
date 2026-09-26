import { z } from 'zod'

export const dealFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.coerce.number().min(0, 'Value must be zero or more'),
  stage: z.enum(['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR']).optional(),
  probability: z.coerce
    .number()
    .int('Probability must be a whole number')
    .min(0, 'Probability must be between 0 and 100')
    .max(100, 'Probability must be between 0 and 100'),
  source: z.enum(['INBOUND', 'OUTBOUND', 'REFERRAL', 'PARTNER', 'EVENT', 'OTHER']).optional().or(z.literal('')),
  nextStep: z.string().optional().or(z.literal('')),
  lostReason: z.string().optional().or(z.literal('')),
  churnReason: z.string().optional().or(z.literal('')),
  engagementType: z.enum(['PROJECT', 'RETAINER']),
  oneTimeValue: z.coerce.number().min(0),
  monthlyRecurringValue: z.coerce.number().min(0),
  serviceStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  renewalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  renewalHealth: z.enum(['HEALTHY', 'AT_RISK', 'UNKNOWN']),
  renewalProbability: z.union([z.literal(''), z.coerce.number().int().min(0).max(100)]),
  nextReviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  contactId: z.string().optional().or(z.literal('')),
  companyId: z.string().optional().or(z.literal('')),
  expectedCloseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export type DealFormValues = z.infer<typeof dealFormSchema>
