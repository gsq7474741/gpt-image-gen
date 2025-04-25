import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const prompt = formData.get('prompt') as string
    const apiKey = formData.get('apiKey') as string
    const apiBase = formData.get('apiBase') as string
    const imageFiles = formData.getAll('images') as File[]
    const hasMask = formData.has('mask')

    if (!apiKey) {
      return NextResponse.json(
        { error: '缺少 API 密钥' },
        { status: 400 }
      )
    }

    if (!prompt) {
      return NextResponse.json(
        { error: '缺少提示词' },
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: apiBase || 'https://api.openai.com/v1'
    })

    let result

    // 如果有图像文件，则使用编辑模式
    if (imageFiles.length > 0) {
      // 如果有掩码文件
      if (hasMask) {
        const maskFile = formData.get('mask') as File

        result = await openai.images.edit({
          model: 'gpt-image-1',
          image: imageFiles[0],
          mask: maskFile,
          prompt,
        })
      } else {
        // 多图像编辑模式
        result = await openai.images.edit({
          model: 'gpt-image-1',
          image: imageFiles,
          prompt,
        })
      }
    } else {
      // 生成模式
      const size = formData.get('size') as string || 'auto'
      const quality = formData.get('quality') as string || 'auto'
      const background = formData.get('background') as string || undefined

      result = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        size: size as any,
        quality: quality as any,
        background: background as any,
      })
    }
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('图像API错误:', error)
    return NextResponse.json(
      { error: error.message || '处理请求时出错' },
      { status: 500 }
    )
  }
}
