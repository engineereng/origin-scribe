'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function SoapNotePage() {
  const params = useParams()
  const id = params.id as string
  const [soapNote, setSoapNote] = useState<{
    content: string
    createdAt: string
    recording: { filename: string }
    transcription: string | null
  } | null>(null)
  const [showTranscription, setShowTranscription] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSoapNote() {
      try {
        const response = await fetch(`/api/soap-note/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch SOAP note')
        }

        setSoapNote(data)
      } catch (err: any) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSoapNote()
    }
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">Loading SOAP note...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </main>
    )
  }

  if (!soapNote) {
    return null
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Home
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              SOAP Note
            </h1>
            <p className="text-sm text-gray-600">
              Recording: {soapNote.recording.filename}
            </p>
            <p className="text-sm text-gray-600">
              Created: {new Date(soapNote.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 bg-gray-50 p-6 rounded-md border">
              {soapNote.content}
            </pre>
          </div>

          {soapNote.transcription && (
            <div className="mt-8">
              <button
                onClick={() => setShowTranscription(!showTranscription)}
                className="text-blue-600 hover:text-blue-800 underline mb-4"
              >
                {showTranscription ? 'Hide' : 'Show'} Transcription
              </button>
              {showTranscription && (
                <div className="mt-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Transcription
                  </h2>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-800 bg-gray-50 p-6 rounded-md border">
                      {soapNote.transcription}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <a
              href={`/api/soap-note/${id}/download`}
              download
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Download as .txt
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

