import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey, apiBase } = await req.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: '缺少 API 密钥' },
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: apiBase || 'https://api.openai.com/v1'
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('聊天API错误:', error)
    return NextResponse.json(
      { error: error.message || '处理请求时出错' },
      { status: 500 }
    )
  }
}
