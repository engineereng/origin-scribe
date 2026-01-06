import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { processAudioPipeline } from '@/lib/services/pipeline'
import * as fs from 'fs-extra'
import * as path from 'path'

// Allow this API route to run for up to 60 minutes (for long video processing)
export const maxDuration = 3600 // 60 minutes in seconds

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('audio') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Save uploaded file
    const uploadsDir = path.join(process.cwd(), 'uploads')
    await fs.ensureDir(uploadsDir)
    
    const filePath = path.join(uploadsDir, `${Date.now()}-${file.name}`)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await fs.writeFile(filePath, buffer)

    // Create recording record
    const recording = await prisma.recording.create({
      data: {
        filename: file.name,
        filePath,
      },
    })

    // Process the pipeline
    const result = await processAudioPipeline(recording.id, filePath)

    return NextResponse.json({
      success: true,
      recordingId: result.recordingId,
      soapNoteId: result.soapNoteId,
      soapFilePath: result.soapFilePath,
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process audio' },
      { status: 500 }
    )
  }
}

