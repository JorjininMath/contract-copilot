import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../services/db'

export const feedbackRoutes = Router()

const FeedbackSchema = z.object({
  targetType: z.enum(['summary', 'risk', 'qa']),
  targetId: z.string(),
  label: z.enum(['helpful', 'not_helpful', 'false_positive', 'acceptable', 'needs_review']),
  comment: z.string().optional(),
})

feedbackRoutes.post('/', async (req, res, next) => {
  try {
    const parsed = FeedbackSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }
    const fb = await prisma.feedback.create({ data: parsed.data })
    res.json(fb)
  } catch (err) {
    next(err)
  }
})
