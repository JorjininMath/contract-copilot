import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { documentRoutes } from './routes/documents'
import { feedbackRoutes } from './routes/feedback'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT ?? 4000

app.use(cors())
app.use(express.json())

app.use('/api/documents', documentRoutes)
app.use('/api/feedback', feedbackRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
