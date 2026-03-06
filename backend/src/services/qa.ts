import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { prisma } from './db'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001'

const QaResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(z.object({ chunkId: z.string(), snippet: z.string() })),
})

function retrieveTopChunks(
  chunks: { id: string; content: string; chunkIndex: number }[],
  question: string,
  topK = 5,
) {
  const terms = question.toLowerCase().split(/\W+/).filter((t) => t.length > 3)

  const scored = chunks.map((chunk) => {
    const lower = chunk.content.toLowerCase()
    const score = terms.reduce((acc, term) => acc + (lower.split(term).length - 1), 0)
    return { ...chunk, score }
  })

  return scored
    .sort((a, b) => b.score - a.score || a.chunkIndex - b.chunkIndex)
    .slice(0, topK)
}

export async function answerQuestion(documentId: string, question: string) {
  const chunks = await prisma.documentChunk.findMany({
    where: { documentId },
    orderBy: { chunkIndex: 'asc' },
  })

  const topChunks = retrieveTopChunks(chunks, question)
  const context = topChunks.map((c) => `[CHUNK:${c.id}]\n${c.content}`).join('\n\n---\n\n')

  const prompt = `You are a legal contract analyst. Answer the question strictly based on the contract excerpts below.
If the answer is not found in the excerpts, say so clearly instead of guessing.

Contract excerpts:
${context}

Question: ${question}

Return a JSON object: { "answer": string, "citations": [{ "chunkId": string, "snippet": string }] }
Only cite chunks that directly support your answer. Respond with valid JSON only, no markdown.`

  async function attempt(repairHint?: string) {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: repairHint
            ? `${prompt}\n\nPrevious attempt failed: ${repairHint}. Return valid JSON only.`
            : prompt,
        },
      ],
    })
    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    const parsed = QaResponseSchema.safeParse(JSON.parse(jsonMatch[0]))
    if (!parsed.success) throw new Error(JSON.stringify(parsed.error.flatten()))
    return parsed.data
  }

  let result
  try {
    result = await attempt()
  } catch (err: any) {
    result = await attempt(err.message)
  }

  await prisma.qAHistory.create({
    data: {
      documentId,
      question,
      answer: result.answer,
      citations: result.citations as any,
    },
  })

  return result
}
