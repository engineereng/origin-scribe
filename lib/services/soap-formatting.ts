import { ChatAnthropic } from '@langchain/anthropic'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { SOAP_TEMPLATE } from '@/lib/templates/soap-template'

const model = new ChatAnthropic({
  modelName: 'claude-haiku-4-5-20251001',
  temperature: 0.2,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
})

export async function formatAsSOAP(summary: string): Promise<string> {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a medical documentation specialist. Format the provided summary into a professional SOAP note following the template structure. Ensure all sections are complete and clinically appropriate.'],
    ['human', `Using the following SOAP template, format the session summary into a proper SOAP note:\n\n${SOAP_TEMPLATE}\n\nSession Summary:\n{summary}`],
  ])

  const chain = prompt.pipe(model)
  
  const response = await chain.invoke({
    summary,
  })

  return response.content as string
}

