import { prisma } from '@/lib/db'
import { transcribeAudio } from './transcription'
import { summarizeTranscription } from './summarization'
import { formatAsSOAP } from './soap-formatting'
import * as fs from 'fs-extra'
import * as path from 'path'

export interface PipelineResult {
  recordingId: string
  transcriptionId: string
  summaryId: string
  soapNoteId: string
  soapFilePath: string
}

export async function processAudioPipeline(
  recordingId: string,
  audioFilePath: string
): Promise<PipelineResult> {
  try {
    // Step 1: Recording is already uploaded (audioFilePath provided)
    console.log('Step 1: Recording uploaded', { recordingId, audioFilePath })

    // Step 2: Transcribe using ElevenLabs
    console.log('Step 2: Transcribing audio...')
    const transcriptionText = await transcribeAudio(audioFilePath)
    
    const transcription = await prisma.transcription.create({
      data: {
        recordingId,
        text: transcriptionText,
      },
    })
    console.log('Transcription completed:', transcription.id)

    // Step 3: Summarize using Claude
    console.log('Step 3: Summarizing transcription...')
    const summaryText = await summarizeTranscription(transcriptionText)
    
    const summary = await prisma.summary.create({
      data: {
        transcriptionId: transcription.id,
        text: summaryText,
      },
    })
    console.log('Summary completed:', summary.id)

    // Step 4: Format as SOAP note
    console.log('Step 4: Formatting as SOAP note...')
    const soapContent = await formatAsSOAP(summaryText)
    
    // Save SOAP note to file
    const outputDir = path.join(process.cwd(), 'output')
    await fs.ensureDir(outputDir)
    const soapFilePath = path.join(outputDir, `soap-${recordingId}.txt`)
    await fs.writeFile(soapFilePath, soapContent, 'utf-8')
    
    const soapNote = await prisma.soapNote.create({
      data: {
        recordingId,
        summaryId: summary.id,
        content: soapContent,
        filePath: soapFilePath,
      },
    })
    console.log('SOAP note completed:', soapNote.id)

    return {
      recordingId,
      transcriptionId: transcription.id,
      summaryId: summary.id,
      soapNoteId: soapNote.id,
      soapFilePath,
    }
  } catch (error) {
    console.error('Pipeline error:', error)
    throw error
  }
}

