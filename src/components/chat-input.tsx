import React, { useState, useRef, useEffect, ChangeEvent, DragEvent, ClipboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Image as ImageIcon, X, Upload, Clipboard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSubmit: (message: string, images: File[]) => void
  isLoading: boolean
  placeholder?: string
}

export function ChatInput({ onSubmit, isLoading, placeholder = '发送消息...' }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)

  // 处理粘贴事件
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    let hasImageItem = false

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // 检查是否是图片
      if (item.type.indexOf('image') !== -1) {
        hasImageItem = true
        const file = item.getAsFile()
        if (file) {
          // 处理图片文件
          const newImages = [...images, file]
          setImages(newImages)
          
          // 创建图片预览
          const reader = new FileReader()
          reader.onload = (e) => {
            setImagePreviews([...imagePreviews, e.target?.result as string])
          }
          reader.readAsDataURL(file)
        }
      }
    }

    // 如果粘贴了图片，显示一个提示
    if (hasImageItem) {
      // 可以添加一个瞬时提示，但这里简化处理
      console.log('图片已粘贴')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() || images.length > 0) {
      onSubmit(message, images)
      setMessage('')
      setImages([])
      setImagePreviews([])
    }
  }

  const processImageFiles = (files: File[]) => {
    if (files.length > 0) {
      // 过滤出图片文件
      const imageFiles = files.filter(file => file.type.startsWith('image/'))
      if (imageFiles.length === 0) return
      
      setImages([...images, ...imageFiles])
      
      // 创建图片预览
      const newPreviews = imageFiles.map(file => URL.createObjectURL(file))
      setImagePreviews([...imagePreviews, ...newPreviews])
    }
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files)
      processImageFiles(newImages)
    }
  }
  
  // 处理拖放事件
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newImages = Array.from(e.dataTransfer.files)
      processImageFiles(newImages)
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    const newPreviews = [...imagePreviews]
    
    // 释放预览URL
    URL.revokeObjectURL(newPreviews[index])
    
    newImages.splice(index, 1)
    newPreviews.splice(index, 1)
    
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  return (
    <div 
      className="w-full"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      ref={dropAreaRef}>
      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img 
                src={preview} 
                alt={`上传图片 ${index + 1}`} 
                className="w-20 h-20 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full relative">
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
            <div className="flex flex-col items-center text-primary">
              <Upload size={24} />
              <span className="text-sm mt-2">拖放图片到这里</span>
            </div>
          </div>
        )}
        <div className="flex w-full items-center gap-2">
          {/* <div className="flex items-center gap-1 h-10"> */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="relative overflow-hidden h-10 w-10"
              title="上传图片 (可多选)"
            >
              <ImageIcon size={20} />
              <span className="sr-only">上传图片</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard.read().then(items => {
                  for (const item of items) {
                    if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
                      item.getType(item.types.find(type => type.startsWith('image/')) || 'image/png').then(blob => {
                        const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: blob.type })
                        const newImages = [...images, file]
                        setImages(newImages)
                        
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setImagePreviews([...imagePreviews, e.target?.result as string])
                        }
                        reader.readAsDataURL(file)
                      })
                    }
                  }
                }).catch(err => {
                  console.error('读取剪贴板失败:', err)
                })
              }}
              disabled={isLoading}
              className="relative overflow-hidden h-10 w-10"
              title="从剪贴板粘贴图片 (Ctrl+V)"
            >
              <Clipboard size={20} />
              <span className="sr-only">粘贴图片</span>
            </Button>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPaste={handlePaste}
              placeholder={placeholder}
              rows={1}
              className={cn(
                "w-full resize-none bg-background px-3 py-2 rounded-md border border-input",
                "focus:outline-none focus:ring-2 focus:ring-primary",
                "h-10 min-h-[40px] max-h-[200px] overflow-y-auto"
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              disabled={isLoading}
            />
          {/* </div> */}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
            multiple
          />
          
          <div className="flex-1">

          </div>
        </div>
        
        <Button 
          type="submit" 
          size="icon" 
          className="h-10 w-10"
          disabled={isLoading || (!message.trim() && images.length === 0)}
        >
          <Send size={20} />
          <span className="sr-only">发送</span>
        </Button>
      </form>
    </div>
  )
}
