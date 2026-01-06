import { ElevenLabsClient } from 'elevenlabs'
import { createReadStream } from 'fs'

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

export async function transcribeAudio(filePath: string): Promise<string> {
  try {
    // Validate API key is set
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY environment variable is not set')
    }

    console.log('Starting transcription for file:', filePath)
    
    // Create a read stream from the file
    // ElevenLabs API accepts File, ReadStream, Blob, or Buffer
    const fileStream = createReadStream(filePath)
    
    // ElevenLabs speech-to-text API - requires model_id and file
    // Set a long timeout for large video files (30 minutes = 1800 seconds)
    // For a 14-minute video, this should be sufficient
    console.log('Calling ElevenLabs API with 30-minute timeout...')
    const response = await client.speechToText.convert(
      {
        file: fileStream,
        model_id: 'scribe_v1', // Required: 'scribe_v1' or 'scribe_v1_experimental'
      },
      {
        timeoutInSeconds: 1800, // 30 minutes - adjust based on your needs
      }
    )
    
    console.log('Transcription completed successfully')
    // The response is a chunk model with text property
    return response.text || ''
  } catch (error: any) {
    console.error('Transcription error:', error)
    
    // Provide more helpful error messages
    if (error.message?.includes('API key')) {
      throw new Error('Invalid or missing ELEVENLABS_API_KEY')
    }
    if (error.status === 401) {
      throw new Error('Unauthorized: Check your ELEVENLABS_API_KEY')
    }
    if (error.status === 400) {
      throw new Error(`Bad request: ${error.message || 'Invalid file format or parameters'}`)
    }
    // Handle timeout errors specifically
    if (error.message?.toLowerCase().includes('timeout') || error.message === 'timeout') {
      throw new Error('Transcription timed out. The video file may be too long or the API is taking longer than expected. Try a shorter video or increase the timeout.')
    }
    
    throw new Error(`Failed to transcribe audio: ${error.message || 'Unknown error'}`)
  }
}

