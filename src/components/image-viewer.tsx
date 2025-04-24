import React, { useEffect, useState } from 'react'
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageViewerProps {
  imageUrl: string
  alt?: string
  onClose: () => void
}

export function ImageViewer({ imageUrl, alt, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  // 处理按ESC键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  
  // 放大图片
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }
  
  // 缩小图片
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }
  
  // 下载图片
  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `图片_${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // 开始拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }
  
  // 拖动中
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }
  
  // 结束拖动
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  // 阻止滚动穿透
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
  }
  
  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
      onClick={onClose}
      onWheel={handleWheel}
    >
      <div 
        className="absolute top-4 right-4 flex gap-2"
        onClick={e => e.stopPropagation()}
      >
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-background/20 hover:bg-background/40"
          onClick={zoomIn}
        >
          <ZoomIn size={20} />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-background/20 hover:bg-background/40"
          onClick={zoomOut}
        >
          <ZoomOut size={20} />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-background/20 hover:bg-background/40"
          onClick={downloadImage}
        >
          <Download size={20} />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-background/20 hover:bg-background/40"
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>
      
      <div 
        className={cn(
          "relative cursor-grab overflow-hidden",
          isDragging && "cursor-grabbing"
        )}
        onClick={e => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
          src={imageUrl} 
          alt={alt || "查看图片"} 
          className="max-h-[90vh] max-w-[90vw] object-contain transition-transform"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center'
          }}
          draggable={false}
        />
      </div>
    </div>
  )
}
