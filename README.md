# AI Scribe - SOAP Notes Generator MVP

An MVP application that processes speech therapy session recordings and generates SOAP notes using AI.

## Features

1. **Recording Upload** - Upload audio files via web interface
2. **Transcription** - Automatic transcription using ElevenLabs API
3. **Summarization** - AI-powered summarization using Claude (via LangChain)
4. **SOAP Formatting** - Automatic formatting into SOAP note structure

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **AI Services**: 
  - ElevenLabs for transcription
  - Claude (Anthropic) for summarization and SOAP formatting
- **Framework**: LangChain for AI orchestration

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `ELEVENLABS_API_KEY` - Your ElevenLabs API key
- `ANTHROPIC_API_KEY` - Your Anthropic (Claude) API key

3. **Set up the database**:
```bash
npx prisma generate
npx prisma db push
```

4. **Run the development server**:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Upload an audio file of a speech therapy session
2. Click "Process Audio"
3. Wait for the pipeline to complete (transcription → summarization → SOAP formatting)
4. Download or view the generated SOAP note

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── process-audio/     # Audio upload and processing endpoint
│   │   └── soap-note/         # SOAP note retrieval endpoint
│   ├── page.tsx               # Main UI
│   └── layout.tsx             # Root layout
├── lib/
│   ├── db.ts                  # Prisma client
│   └── services/
│       ├── transcription.ts   # ElevenLabs transcription service
│       ├── summarization.ts   # Claude summarization service
│       ├── soap-formatting.ts # SOAP formatting service
│       └── pipeline.ts        # Main processing pipeline
└── prisma/
    └── schema.prisma          # Database schema
```

## Pipeline Flow

1. **Recording**: Audio file uploaded and saved
2. **Transcription**: ElevenLabs transcribes the audio
3. **Summarization**: Claude summarizes the transcription
4. **SOAP Formatting**: Claude formats the summary into SOAP structure
5. **Output**: SOAP note saved as .txt file

## Notes

- Audio files are stored in the `uploads/` directory
- SOAP notes are saved in the `output/` directory
- All processing steps are logged in the database for tracking

