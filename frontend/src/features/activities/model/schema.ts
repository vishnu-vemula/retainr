import { z } from 'zod'

export const activityFormSchema = z.object({
  type: z.enum(['NOTE', 'CALL', 'EMAIL', 'MEETING']),
  title: z.string().trim().min(1, 'Title is required').max(160, 'Keep the title under 160 characters'),
  occurredAt: z.string().min(1, 'Occurred at is required').refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date and time'),
  durationMin: z
    .string()
    .refine((value) => value === '' || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 1440), 'Enter 1 to 1440 whole minutes'),
  body: z.string().optional().or(z.literal('')),
  contactId: z.string().optional().or(z.literal('')),
  dealId: z.string().optional().or(z.literal('')),
})

export type ActivityFormValues = z.infer<typeof activityFormSchema>
