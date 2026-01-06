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
      },
    })

    if (!soapNote) {
      return NextResponse.json(
        { error: 'SOAP note not found' },
        { status: 404 }
      )
    }

    // If file exists, return it; otherwise return content from DB
    let content = soapNote.content
    if (soapNote.filePath && await fs.pathExists(soapNote.filePath)) {
      content = await fs.readFile(soapNote.filePath, 'utf-8')
    }

    // Return as text file
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="soap-note-${params.id}.txt"`,
      },
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to download SOAP note' },
      { status: 500 }
    )
  }
}

