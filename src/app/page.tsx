'use client'

import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Trash2, Image as ImageIcon, Send, Settings, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatInput } from '@/components/chat-input'
import { ChatMessage, Message, MessageImage } from '@/components/chat-message'
import { SettingsDialog } from '@/components/settings-dialog'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Sidebar, SidebarToggle } from '@/components/sidebar'
import { useAppStore } from '@/lib/store'

export default function Home() {
  const {
    apiKey,
    apiBase,
    conversations,
    activeConversationId,
    isLoading,
    setApiKey,
    setApiBase,
    addMessage,
    setMessages,
    setIsLoading,
    clearMessages,
    createConversation,
    getActiveMessages
  } = useAppStore()
  
  // 添加图片生成状态
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // 获取当前对话的消息
  const messages = getActiveMessages()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 处理API设置保存
  const handleSaveSettings = (newApiKey: string, newApiBase: string) => {
    setApiKey(newApiKey)
    setApiBase(newApiBase)
  }
  
  // 确保有活跃的对话
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation('新对话')
    } else if (!activeConversationId) {
      // 如果有对话但没有活跃对话，选择第一个
      const firstConversationId = conversations[0].id
      useAppStore.getState().setActiveConversation(firstConversationId)
    }
  }, [conversations, activeConversationId, createConversation])

  // 处理消息提交
  const handleSubmit = async (text: string, imageFiles: File[]) => {
    if (!apiKey) {
      setError('请先设置 OpenAI API 密钥')
      return
    }

    setError(null)
    setIsLoading(true)
    
    // 如果有图片，设置图片生成状态
    if (imageFiles.length > 0 || true) {
      setIsGeneratingImage(true)
    }
    
    // 记录开始时间
    const startTime = Date.now()

    try {
      // 创建用户消息
      const userMessageId = uuidv4()
      const userImages: MessageImage[] = []

      // 处理图片上传
      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i]
          const reader = new FileReader()
          
          await new Promise<void>((resolve) => {
            reader.onload = (e) => {
              userImages.push({
                url: e.target?.result as string,
                alt: `用户上传图片 ${i + 1}`
              })
              resolve()
            }
            reader.readAsDataURL(file)
          })
        }
      }

      // 添加用户消息到聊天
      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content: text,
        images: userImages,
        timestamp: Date.now()
      }
      addMessage(userMessage)

      // 如果有图片，使用图像API
      if (imageFiles.length > 0 || true) {
        // 准备要发送的表单数据
        const formData = new FormData()
        formData.append('prompt', text || '描述这些图片')
        formData.append('apiKey', apiKey)
        formData.append('apiBase', apiBase)
        
        // 添加所有图片
        imageFiles.forEach((file) => {
          formData.append('images', file)
        })

        // 发送请求到图像API
        const response = await fetch('/api/image', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '图像生成失败')
        }

        const result = await response.json()
        
        // 计算耗时
        const endTime = Date.now()
        const elapsedTime = endTime - startTime
        
        // 添加AI响应消息
        const aiMessageId = uuidv4()
        const aiImages: MessageImage[] = []
        
        // 处理返回的图像
        if (result.data && result.data.length > 0) {
          result.data.forEach((item: any, index: number) => {
            if (item.b64_json) {
              aiImages.push({
                url: `data:image/png;base64,${item.b64_json}`,
                alt: `AI生成图片 ${index + 1}`
              })
            } else if (item.url) {
              aiImages.push({
                url: item.url,
                alt: `AI生成图片 ${index + 1}`
              })
            }
          })
        }

        const aiMessage: Message = {
          id: aiMessageId,
          role: 'assistant',
          content: '',
          images: aiImages,
          timestamp: Date.now(),
          created: result.created,
          elapsedTime: elapsedTime,
          usage: result.usage
        }
        addMessage(aiMessage)
      } else {
        // 纯文本聊天请求
        // 准备聊天历史
        const chatHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))

        // 添加新的用户消息
        chatHistory.push({
          role: 'user',
          content: text
        })

        // 发送请求到聊天API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: chatHistory,
            apiKey,
            apiBase
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '聊天请求失败')
        }

        const result = await response.json()
        
        // 添加AI响应消息
        if (result.choices && result.choices.length > 0) {
          const aiContent = result.choices[0].message.content
          const aiMessageId = uuidv4()
          
          const aiMessage: Message = {
            id: aiMessageId,
            role: 'assistant',
            content: aiContent,
            timestamp: Date.now()
          }
          addMessage(aiMessage)
        }
      }
    } catch (err: any) {
      console.error('提交消息错误:', err)
      setError(err.message || '处理请求时出错')
    } finally {
      setIsLoading(false)
      setIsGeneratingImage(false)
    }
  }

  // 处理图像生成
  const handleGenerateImage = async (prompt: string) => {
    if (!apiKey) {
      setError('请先设置 OpenAI API 密钥')
      return
    }

    setError(null)
    setIsLoading(true)
    setIsGeneratingImage(true)
    
    // 记录开始时间
    const startTime = Date.now()

    try {
      // 添加用户消息
      const userMessageId = uuidv4()
      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content: `生成图片: ${prompt}`,
        timestamp: Date.now()
      }
      addMessage(userMessage)

      // 准备表单数据
      const formData = new FormData()
      formData.append('prompt', prompt)
      formData.append('apiKey', apiKey)
      formData.append('apiBase', apiBase)

      // 发送请求到图像API
      const response = await fetch('/api/image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '图像生成失败')
      }

      const result = await response.json()
      
      // 计算耗时
      const endTime = Date.now()
      const elapsedTime = endTime - startTime
      
      // 添加AI响应消息
      const aiMessageId = uuidv4()
      const aiImages: MessageImage[] = []
      
      // 处理返回的图像
      if (result.data && result.data.length > 0) {
        result.data.forEach((item: any, index: number) => {
          if (item.b64_json) {
            aiImages.push({
              url: `data:image/png;base64,${item.b64_json}`,
              alt: `AI生成图片 ${index + 1}`
            })
          } else if (item.url) {
            aiImages.push({
              url: item.url,
              alt: `AI生成图片 ${index + 1}`
            })
          }
        })
      }

      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        images: aiImages,
        timestamp: Date.now(),
        created: result.created,
        elapsedTime: elapsedTime,
        usage: result.usage
      }
      addMessage(aiMessage)
    } catch (err: any) {
      console.error('图像生成错误:', err)
      setError(err.message || '处理请求时出错')
    } finally {
      setIsLoading(false)
      setIsGeneratingImage(false)
    }
  }

  return (
    <div className="flex h-screen max-h-screen overflow-hidden">
      {/* 移动端侧边栏 */}
      {isSidebarOpen && (
        <div className="md:hidden">
          <Sidebar 
            isMobile 
            onMobileClose={() => setIsSidebarOpen(false)}
            isGeneratingImage={isGeneratingImage}
          />
        </div>
      )}
      
      {/* 桌面端侧边栏 */}
      <div className="hidden md:block">
        <Sidebar isGeneratingImage={isGeneratingImage} />
      </div>
      
      <div className="flex flex-col flex-1 h-full overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarToggle onClick={() => setIsSidebarOpen(true)} />
          <h1 className="text-xl font-bold">GPT 图像生成</h1>
        </div>
        <div className="flex items-center gap-2">
          <SettingsDialog 
            apiKey={apiKey} 
            apiBase={apiBase} 
            onSave={handleSaveSettings} 
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => clearMessages()}
            title="清空当前对话"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ImageIcon size={48} className="mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">欢迎使用 GPT Image 1 图像生成</h2>
            <p className="text-muted-foreground max-w-md ">
              发送消息或上传图片开始对话。
            </p>
            <p className="text-muted-foreground max-w-md mb-4">
              您可以使用最新的 gpt-image-1 模型生成和编辑图像。
            </p>
            <div className="bg-muted p-4 rounded-lg max-w-md mb-6 text-left">
              <h3 className="font-medium mb-2 flex items-center">
                <ImageIcon size={16} className="mr-2" />
                图片上传功能
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>点击聊天框左侧的图片图标上传图片</li>
                <li>支持多选或直接拖放图片到聊天框</li>
                <li>上传图片后可以添加文字描述进行编辑</li>
                <li>支持上传多张图片进行组合创作</li>
                <li>可以上传一张图片和一张蒙版进行局部编辑</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-md">
              <Button 
                onClick={() => handleGenerateImage('一只可爱的卡通猫咪，在阳光明媚的花园里玩耍')}
                className="w-full"
                variant="outline"
                disabled={isLoading || isGeneratingImage}
              >
                {isGeneratingImage ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" showTimer={false} />
                    生成中...
                  </>
                ) : '生成一只可爱的猫咪图片'}
              </Button>
              <Button 
                onClick={() => handleGenerateImage('一个未来风格的科技城市，霓虹灯光，高楼大厦')}
                className="w-full"
                variant="outline"
                disabled={isLoading || isGeneratingImage}
              >
                {isGeneratingImage ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" showTimer={false} />
                    生成中...
                  </>
                ) : '生成未来城市图片'}
              </Button>
              <div className="mt-4 pt-4 border-t border-border w-full">
                <Button
                  onClick={() => {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.multiple = true;
                    fileInput.accept = 'image/*';
                    fileInput.onchange = (e) => {
                      const files = Array.from((e.target as HTMLInputElement).files || []);
                      if (files.length > 0) {
                        handleSubmit('请编辑这些图片', files);
                      }
                    };
                    fileInput.click();
                  }}
                  className="w-full"
                  variant="outline"
                  disabled={isLoading || isGeneratingImage}
                >
                  {isGeneratingImage ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" showTimer={false} />
                      处理中...
                    </>
                  ) : '上传图片进行编辑'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <ChatMessage
                message={{
                  id: 'loading',
                  role: 'assistant',
                  content: '',
                  timestamp: Date.now()
                }}
                isLoading={true}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {error && (
        <div className="p-2 bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      <footer className="p-4 border-t relative">
        {isGeneratingImage ? (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-1 bg-primary/10 text-primary text-sm">
            <LoadingSpinner size="sm" className="mr-2" showTimer={false} />
            <span>AI 正在生成图片，请耐心等待...</span>
          </div>
        ) : <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />}
      </footer>
      </div>
    </div>
  )
}
