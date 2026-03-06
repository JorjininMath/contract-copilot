import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

interface Document {
  id: string
  filename: string
  status: string
  createdAt: string
  _count: { qaHistory: number }
}

export default function HistoryPage() {
  const { data, isLoading, isError } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: () => api.get('/documents').then((r) => r.data),
  })

  if (isLoading) return <p className="text-gray-500">Loading history...</p>
  if (isError) return <p className="text-red-500">Failed to load history.</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">History</h1>
      {!data?.length ? (
        <p className="text-gray-500">No documents yet.</p>
      ) : (
        <div className="space-y-3">
          {data.map((doc) => (
            <div key={doc.id} className="bg-white border border-gray-200 rounded p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{doc.filename}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(doc.createdAt).toLocaleString()} &middot; {doc._count.qaHistory} Q&amp;As
                </p>
              </div>
              <Link to={`/review/${doc.id}`} className="text-sm text-blue-600 hover:underline">
                Open
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
