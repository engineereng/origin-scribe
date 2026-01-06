'use client'

import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{
    recordingId: string
    soapNoteId: string
    soapFilePath: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select an audio file')
      return
    }

    setProcessing(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('audio', file)

      const response = await fetch('/api/process-audio', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process audio')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          AI Scribe - SOAP Notes Generator
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="audio-file"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Upload Audio Recording
              </label>
              <input
                id="audio-file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={processing}
              />
            </div>

            <button
              type="submit"
              disabled={!file || processing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? 'Processing...' : 'Process Audio'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-6">
            <p className="font-semibold mb-2">Processing Complete!</p>
            <p className="text-sm">
              Recording ID: {result.recordingId}
              <br />
              SOAP Note ID: {result.soapNoteId}
              <br />
              File saved to: {result.soapFilePath}
            </p>
            <div className="mt-3 space-x-4">
              <a
                href={`/soap-note/${result.soapNoteId}`}
                className="inline-block text-blue-600 hover:text-blue-800 underline"
              >
                View SOAP Note
              </a>
              <a
                href={`/api/soap-note/${result.soapNoteId}/download`}
                download
                className="inline-block text-blue-600 hover:text-blue-800 underline"
              >
                Download as .txt
              </a>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            How it works
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Upload an audio recording of a speech therapy session</li>
            <li>Audio is transcribed using ElevenLabs</li>
            <li>Transcription is summarized using Claude AI</li>
            <li>Summary is formatted into SOAP notes</li>
            <li>SOAP note is saved as a .txt file</li>
          </ol>
        </div>
      </div>
    </main>
  )
}

