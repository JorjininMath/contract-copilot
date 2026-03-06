import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

interface Document {
  id: string
  filename: string
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: () => api.get('/documents').then((r) => r.data),
  })

  if (isLoading) return <p className="text-gray-500">Loading documents...</p>
  if (isError) return <p className="text-red-500">Failed to load documents.</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
        <Link
          to="/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          Upload contract
        </Link>
      </div>
      {!data?.length ? (
        <p className="text-gray-500">No documents yet. Upload a contract to get started.</p>
      ) : (
        <table className="w-full text-sm bg-white rounded border border-gray-200">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="text-left px-4 py-3">Filename</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Uploaded</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((doc) => (
              <tr key={doc.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{doc.filename}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      doc.status === 'analyzed'
                        ? 'bg-green-100 text-green-700'
                        : doc.status === 'parsed'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/review/${doc.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
