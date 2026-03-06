import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

interface Summary {
  contractType: string
  parties: string[]
  effectiveDate: string | null
  terminationDate: string | null
  paymentTerms: string | null
  governingLaw: string | null
}

interface Risk {
  id: string
  riskType: string
  severity: 'low' | 'medium' | 'high'
  clauseReference: string
  explanation: string
  suggestedRevision: string
}

interface QaResponse {
  answer: string
  citations: { chunkId: string; snippet: string }[]
}

const SEVERITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [question, setQuestion] = useState('')
  const [qaResult, setQaResult] = useState<QaResponse | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const { data: doc } = useQuery<{ id: string; filename: string; status: string }>({
    queryKey: ['document', id],
    queryFn: () => api.get(`/documents/${id}`).then((r) => r.data),
  })

  const { data: summary } = useQuery<Summary>({
    queryKey: ['summary', id],
    queryFn: () => api.get(`/documents/${id}/summary`).then((r) => r.data),
    enabled: doc?.status === 'analyzed',
  })

  const { data: risks } = useQuery<Risk[]>({
    queryKey: ['risks', id],
    queryFn: () => api.get(`/documents/${id}/risks`).then((r) => r.data),
    enabled: doc?.status === 'analyzed',
  })

  async function analyze() {
    setAnalyzing(true)
    try {
      await api.post(`/documents/${id}/analyze`)
      await qc.invalidateQueries({ queryKey: ['document', id] })
      await qc.invalidateQueries({ queryKey: ['summary', id] })
      await qc.invalidateQueries({ queryKey: ['risks', id] })
    } finally {
      setAnalyzing(false)
    }
  }

  const qaMutation = useMutation({
    mutationFn: (q: string) =>
      api.post(`/documents/${id}/qa`, { question: q }).then((r) => r.data),
    onSuccess: (data) => setQaResult(data),
  })

  async function submitFeedback(targetType: string, targetId: string, label: string) {
    await api.post('/feedback', { targetType, targetId, label })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{doc?.filename ?? 'Loading...'}</h1>
        {doc?.status !== 'analyzed' && (
          <button
            onClick={analyze}
            disabled={analyzing || doc?.status === 'pending'}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {analyzing ? 'Analyzing...' : 'Run analysis'}
          </button>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <section>
          <h2 className="text-lg font-medium text-gray-800 mb-3">Summary</h2>
          <div className="bg-white border border-gray-200 rounded p-4 grid grid-cols-2 gap-3 text-sm">
            {Object.entries(summary).map(([key, val]) => (
              <div key={key}>
                <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                <span className="text-gray-900">{Array.isArray(val) ? val.join(', ') : (val ?? '—')}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => submitFeedback('summary', id!, 'helpful')}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Helpful
          </button>{' '}
          <button
            onClick={() => submitFeedback('summary', id!, 'not_helpful')}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Not helpful
          </button>
        </section>
      )}

      {/* Risks */}
      {risks && (
        <section>
          <h2 className="text-lg font-medium text-gray-800 mb-3">Risks</h2>
          {risks.length === 0 ? (
            <p className="text-gray-500 text-sm">No risks identified.</p>
          ) : (
            <div className="space-y-3">
              {risks.map((risk) => (
                <details key={risk.id} className="bg-white border border-gray-200 rounded p-4">
                  <summary className="flex items-center gap-3 cursor-pointer text-sm font-medium">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${SEVERITY_COLORS[risk.severity]}`}>
                      {risk.severity}
                    </span>
                    <span>{risk.riskType}</span>
                    <span className="text-gray-400 font-normal ml-auto">{risk.clauseReference}</span>
                  </summary>
                  <div className="mt-3 text-sm space-y-2 text-gray-700">
                    <p>{risk.explanation}</p>
                    <p className="text-gray-500 italic">Suggested: {risk.suggestedRevision}</p>
                    <div className="flex gap-3">
                      <button onClick={() => submitFeedback('risk', risk.id, 'acceptable')} className="text-xs text-gray-400 hover:text-gray-600">Acceptable</button>
                      <button onClick={() => submitFeedback('risk', risk.id, 'false_positive')} className="text-xs text-gray-400 hover:text-gray-600">False positive</button>
                      <button onClick={() => submitFeedback('risk', risk.id, 'needs_review')} className="text-xs text-gray-400 hover:text-gray-600">Needs review</button>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Q&A */}
      {doc?.status === 'analyzed' && (
        <section>
          <h2 className="text-lg font-medium text-gray-800 mb-3">Ask a question</h2>
          <div className="flex gap-3">
            <input
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. What are the termination conditions?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && question.trim()) qaMutation.mutate(question) }}
            />
            <button
              onClick={() => qaMutation.mutate(question)}
              disabled={!question.trim() || qaMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {qaMutation.isPending ? 'Asking...' : 'Ask'}
            </button>
          </div>

          {qaResult && (
            <div className="mt-4 bg-white border border-gray-200 rounded p-4 text-sm space-y-3">
              <p className="text-gray-900">{qaResult.answer}</p>
              {qaResult.citations.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium uppercase">Citations</p>
                  {qaResult.citations.map((c, i) => (
                    <blockquote key={i} className="border-l-2 border-gray-300 pl-3 text-gray-600 italic text-xs">
                      <span className="text-gray-400 not-italic">[{c.chunkId}] </span>{c.snippet}
                    </blockquote>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => submitFeedback('qa', id!, 'helpful')} className="text-xs text-gray-400 hover:text-gray-600">Helpful</button>
                <button onClick={() => submitFeedback('qa', id!, 'not_helpful')} className="text-xs text-gray-400 hover:text-gray-600">Not helpful</button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
