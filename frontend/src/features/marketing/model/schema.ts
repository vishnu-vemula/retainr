import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Tell us your name'),
  email: z.string().trim().email('Enter a valid email address'),
  company: z.string().trim().optional(),
  topic: z.string().min(1, 'Pick a topic'),
  message: z.string().trim().min(10, 'A little more detail helps — at least 10 characters'),
})

export type ContactFormValues = z.infer<typeof contactSchema>
