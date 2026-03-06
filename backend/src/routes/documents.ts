import { Router } from 'express'
import multer from 'multer'
import { prisma } from '../services/db'
import { parseAndChunk } from '../services/parser'
import { runAnalysis } from '../services/llm'
import { answerQuestion } from '../services/qa'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are supported.'))
    } else {
      cb(null, true)
    }
  },
})

export const documentRoutes = Router()

// POST /api/documents/upload
documentRoutes.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' })
      return
    }
    const filename = req.file.originalname
    const buffer = req.file.buffer
    const { text, chunks } = await parseAndChunk(buffer)

    const doc = await prisma.document.create({
      data: {
        filename,
        status: 'parsed',
        rawText: text,
        chunks: {
          create: chunks.map((c, i) => ({
            chunkIndex: i,
            content: c.content,
            sectionTitle: c.sectionTitle ?? null,
            metadata: {},
          })),
        },
      },
    })

    res.json({ id: doc.id, filename: doc.filename, status: doc.status, preview: text.slice(0, 500) })
  } catch (err) {
    next(err)
  }
})

// GET /api/documents
documentRoutes.get('/', async (_req, res, next) => {
  try {
    const docs = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { qaHistory: true } } },
    })
    res.json(docs)
  } catch (err) {
    next(err)
  }
})

// GET /api/documents/:id
documentRoutes.get('/:id', async (req, res, next) => {
  try {
    const doc = await prisma.document.findUniqueOrThrow({ where: { id: req.params.id } })
    res.json(doc)
  } catch (err) {
    next(err)
  }
})

// POST /api/documents/:id/analyze
documentRoutes.post('/:id/analyze', async (req, res, next) => {
  try {
    const doc = await prisma.document.findUniqueOrThrow({
      where: { id: req.params.id },
      include: { chunks: { orderBy: { chunkIndex: 'asc' } } },
    })
    await runAnalysis(doc)
    await prisma.document.update({ where: { id: doc.id }, data: { status: 'analyzed' } })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// GET /api/documents/:id/summary
documentRoutes.get('/:id/summary', async (req, res, next) => {
  try {
    const summary = await prisma.contractSummary.findUniqueOrThrow({
      where: { documentId: req.params.id },
    })
    res.json(summary.data)
  } catch (err) {
    next(err)
  }
})

// GET /api/documents/:id/risks
documentRoutes.get('/:id/risks', async (req, res, next) => {
  try {
    const risks = await prisma.risk.findMany({ where: { documentId: req.params.id } })
    res.json(risks)
  } catch (err) {
    next(err)
  }
})

// POST /api/documents/:id/qa
documentRoutes.post('/:id/qa', async (req, res, next) => {
  try {
    const { question } = req.body
    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'question is required.' })
      return
    }
    const result = await answerQuestion(req.params.id, question)
    res.json(result)
  } catch (err) {
    next(err)
  }
})
