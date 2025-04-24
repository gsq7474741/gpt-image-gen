import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { LoadingSpinner, LoadingImage } from './loading-spinner'
import { Button } from '@/components/ui/button'
import { Copy, Download, Check, ZoomIn } from 'lucide-react'
import { ImageViewer } from './image-viewer'
import { Avatar } from './avatar'

export type MessageRole = 'user' | 'assistant'

export interface MessageImage {
  url: string
  alt?: string
}

export interface Usage {
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  input_tokens_details?: {
    image_tokens?: number
    text_tokens?: number
  }
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  images?: MessageImage[]
  timestamp: number
  created?: number // API 返回的创建时间
  elapsedTime?: number // 请求耗时（毫秒）
  usage?: Usage // 令牌用量信息
}

interface ChatMessageProps {
  message: Message
  isLoading?: boolean
}

// 图片操作组件
interface ImageWithActionsProps {
  image: MessageImage
  index: number
  isAssistant: boolean
}

function ImageWithActions({ image, index, isAssistant }: ImageWithActionsProps) {
  const [copied, setCopied] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  // 复制图片到剪贴板
  const copyImage = async () => {
    try {
      // 从图片URL获取Blob数据
      const response = await fetch(image.url)
      const blob = await response.blob()
      
      // 复制到剪贴板
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])
      
      // 显示复制成功状态
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制图片失败:', error)
      alert('复制图片失败，请重试')
    }
  }

  // 下载图片
  const downloadImage = () => {
    // 创建一个临时链接
    const link = document.createElement('a')
    link.href = image.url
    link.download = `图片_${index + 1}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // 打开图片查看器
  const openViewer = () => {
    setIsViewerOpen(true)
  }

  return (
    <div className="relative group flex flex-col">
      <div className="relative cursor-pointer group/image">
        <img
          src={image.url}
          alt={image.alt || `图片 ${index + 1}`}
          className="max-w-full max-h-[300px] rounded-lg object-contain"
          loading="lazy"
          onClick={openViewer}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/image:bg-black/20 transition-all rounded-lg">
          <Button 
            variant="outline" 
            size="icon"
            className="opacity-0 group-hover/image:opacity-100 transition-opacity bg-background/70"
            onClick={openViewer}
          >
            <ZoomIn size={18} />
          </Button>
        </div>
      </div>
      
      {isAssistant && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2 text-xs" 
            onClick={copyImage}
          >
            {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
            {copied ? '已复制' : '复制'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2 text-xs" 
            onClick={downloadImage}
          >
            <Download size={14} className="mr-1" />
            下载
          </Button>
        </div>
      )}
      
      {isViewerOpen && (
        <ImageViewer 
          imageUrl={image.url} 
          alt={image.alt} 
          onClose={() => setIsViewerOpen(false)} 
        />
      )}
    </div>
  )
}

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const isUser = message.role === 'user'
  
  return (
    <div
      className={cn(
        'flex w-full items-start gap-3 py-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* 头像 */}
      <Avatar role={message.role} />
      
      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-2 p-4 rounded-lg shadow-sm',
          isUser 
            ? 'bg-primary/10 border border-primary/20' 
            : 'bg-muted/50 border border-border'
        )}
      >
        {/* 显示图片或图片加载动画 */}
        {message.role === 'assistant' && isLoading && !message.images ? (
          <LoadingImage 
            className="w-[300px] h-[200px]" 
            text="AI 正在生成图片..."
            showTimer={false}
          />
        ) : message.images && message.images.length > 0 ? (
          <div className="flex flex-wrap gap-4 mb-2">
            {message.images.map((image, index) => (
              <ImageWithActions 
                key={index}
                image={image}
                index={index}
                isAssistant={message.role === 'assistant'}
              />
            ))}
          </div>
        ) : null}
        
        {/* 显示文本内容 */}
        {message.content && (
          <div className="mb-1">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        )}
        
        {/* 显示用量和时间信息 */}
        {message.role === 'assistant' && message.images && message.images.length > 0 && (message.usage || message.elapsedTime || message.created) && (
          <div className="mt-2 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {message.usage && (
                <>
                  {message.usage.input_tokens && (
                    <span>输入令牌: {message.usage.input_tokens}</span>
                  )}
                  {message.usage.output_tokens && (
                    <span>输出令牌: {message.usage.output_tokens}</span>
                  )}
                  {message.usage.total_tokens && (
                    <span>总令牌: {message.usage.total_tokens}</span>
                  )}
                </>
              )}
              {message.elapsedTime && (
                <span>生成耗时: {(message.elapsedTime / 1000).toFixed(2)}s</span>
              )}
              {message.created && (
                <span>生成时间: {new Date(message.created * 1000).toLocaleString('zh-CN')}</span>
              )}
            </div>
          </div>
        )}
        
        {/* 显示加载动画 */}
        {isLoading && message.role === 'assistant' && (
          <div className="flex items-center gap-2 mt-2">
            <LoadingSpinner size="sm" showTimer={true} />
            <span className="text-sm text-muted-foreground">AI 正在思考...</span>
          </div>
        )}
      </div>
    </div>
  )
}
