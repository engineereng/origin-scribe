import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as fs from 'fs-extra'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const soapNote = await prisma.soapNote.findUnique({
      where: { id: params.id },
      include: {
        recording: true,
        summary: {
          include: {
            transcription: true,
          },
        },
      },
    })

    if (!soapNote) {
      return NextResponse.json(
        { error: 'SOAP note not found' },
        { status: 404 }
      )
    }

    // If file exists, read it; otherwise return content from DB
    let content = soapNote.content
    if (soapNote.filePath && await fs.pathExists(soapNote.filePath)) {
      content = await fs.readFile(soapNote.filePath, 'utf-8')
    }

    return NextResponse.json({
      id: soapNote.id,
      content,
      filePath: soapNote.filePath,
      createdAt: soapNote.createdAt,
      recording: {
        id: soapNote.recording.id,
        filename: soapNote.recording.filename,
      },
      transcription: soapNote.summary?.transcription?.text || null,
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch SOAP note' },
      { status: 500 }
    )
  }
}

