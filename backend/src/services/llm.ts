import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { prisma } from './db'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001'

// ---- Schemas ----

const SummarySchema = z.object({
  contractType: z.string(),
  parties: z.array(z.string()),
  effectiveDate: z.string().nullable(),
  terminationDate: z.string().nullable(),
  paymentTerms: z.string().nullable(),
  governingLaw: z.string().nullable(),
})

const RisksSchema = z.array(
  z.object({
    riskType: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    clauseReference: z.string(),
    explanation: z.string(),
    suggestedRevision: z.string(),
  }),
)

type DocumentWithChunks = {
  id: string
  rawText: string
  chunks: { id: string; content: string; chunkIndex: number }[]
}

// ---- Helper ----

async function chatJSON<T>(schema: z.ZodType<T>, prompt: string): Promise<T> {
  async function attempt(repairHint?: string): Promise<T> {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: repairHint
            ? `${prompt}\n\nPrevious attempt failed validation: ${repairHint}. Return valid JSON only, no markdown.`
            : `${prompt}\n\nRespond with valid JSON only, no markdown or explanation.`,
        },
      ],
    })
    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    const parsed = schema.safeParse(JSON.parse(jsonMatch[0]))
    if (!parsed.success) throw new Error(JSON.stringify(parsed.error.flatten()))
    return parsed.data
  }

  try {
    return await attempt()
  } catch (err: any) {
    return await attempt(err.message)
  }
}

// ---- Analysis ----

export async function runAnalysis(doc: DocumentWithChunks) {
  const fullText = doc.chunks.map((c) => c.content).join('\n\n')

  // Summary
  const summaryData = await chatJSON(
    SummarySchema,
    `You are a legal contract analyst. Extract structured metadata from this contract.

Contract text:
${fullText.slice(0, 12000)}

Return a JSON object with these fields: contractType (string), parties (array of strings), effectiveDate (string or null), terminationDate (string or null), paymentTerms (string or null), governingLaw (string or null). Use null for missing fields.`,
  )

  await prisma.contractSummary.upsert({
    where: { documentId: doc.id },
    create: { documentId: doc.id, data: summaryData as any },
    update: { data: summaryData as any },
  })

  // Risks
  const risksData = await chatJSON(
    z.object({ risks: RisksSchema }),
    `You are a legal contract analyst. Identify risks in this contract.

Contract text:
${fullText.slice(0, 12000)}

Return a JSON object with a "risks" array. Each risk must have: riskType (string), severity ("low", "medium", or "high"), clauseReference (string), explanation (string), suggestedRevision (string). Return {"risks": []} if no risks found.`,
  )

  await prisma.risk.deleteMany({ where: { documentId: doc.id } })
  for (const risk of risksData.risks) {
    await prisma.risk.create({ data: { documentId: doc.id, ...risk } })
  }
}
