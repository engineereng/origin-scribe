import { ChatAnthropic } from '@langchain/anthropic'
import { ChatPromptTemplate } from '@langchain/core/prompts'

const model = new ChatAnthropic({
  modelName: 'claude-haiku-4-5-20251001',
  temperature: 0.3,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
})

export async function summarizeTranscription(transcription: string): Promise<string> {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a medical assistant helping to summarize speech therapy sessions for children with developmental disabilities. Create a comprehensive summary that captures all important details from the transcription.'],
    ['human', 'Please summarize the following speech therapy session transcription:\n\n{transcription}'],
  ])

  const chain = prompt.pipe(model)
  
  const response = await chain.invoke({
    transcription,
  })

  return response.content as string
}

