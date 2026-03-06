import pdfParse from 'pdf-parse'

const CHUNK_SIZE = 1500 // chars
const CHUNK_OVERLAP = 200

interface Chunk {
  content: string
  sectionTitle?: string
}

export async function parseAndChunk(buffer: Buffer): Promise<{ text: string; chunks: Chunk[] }> {
  const { text } = await pdfParse(buffer)
  const cleaned = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  const chunks = splitIntoChunks(cleaned)
  return { text: cleaned, chunks }
}

function splitIntoChunks(text: string): Chunk[] {
  const chunks: Chunk[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length)
    const content = text.slice(start, end).trim()
    if (content) {
      const sectionTitle = detectSectionTitle(content)
      chunks.push({ content, sectionTitle })
    }
    start += CHUNK_SIZE - CHUNK_OVERLAP
  }

  return chunks
}

// Heuristic: if the chunk starts with an all-caps or numbered heading, use it as title
function detectSectionTitle(content: string): string | undefined {
  const firstLine = content.split('\n')[0].trim()
  if (/^(\d+[\.\)]|[A-Z][A-Z\s]{3,})/.test(firstLine) && firstLine.length < 80) {
    return firstLine
  }
  return undefined
}
