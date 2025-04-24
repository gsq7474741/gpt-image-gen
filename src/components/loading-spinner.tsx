import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showTimer?: boolean
}

export function LoadingSpinner({ size = 'md', className, showTimer = false }: LoadingSpinnerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  
  // 计时器逻辑
  useEffect(() => {
    if (!showTimer) return
    
    const startTime = Date.now()
    const timer = setInterval(() => {
      const currentTime = Date.now()
      const elapsed = (currentTime - startTime) / 1000 // 转换为秒
      setElapsedTime(elapsed)
    }, 10) // 每10毫秒更新一次，以获得较平滑的效果
    
    return () => clearInterval(timer)
  }, [])
  
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-t-transparent border-primary',
          sizeClasses[size]
        )}
      />
      {showTimer && (
        <span className="ml-2 text-xs font-mono">
          {elapsedTime.toFixed(2)}s
        </span>
      )}
    </div>
  )
}

interface LoadingImageProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showTimer?: boolean
}

export function LoadingImage({ text = '图片生成中...', size = 'md', className, showTimer = true }: LoadingImageProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  
  // 计时器逻辑
  useEffect(() => {
    if (!showTimer) return
    
    const startTime = Date.now()
    const timer = setInterval(() => {
      const currentTime = Date.now()
      const elapsed = (currentTime - startTime) / 1000 // 转换为秒
      setElapsedTime(elapsed)
    }, 10) // 每10毫秒更新一次，以获得较平滑的效果
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-6 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/30',
      className
    )}>
      <LoadingSpinner size={size} />
      {text && (
        <div className="mt-3 text-center">
          <p className="text-sm text-muted-foreground">{text}</p>
          {showTimer && (
            <p className="text-xs font-mono text-muted-foreground mt-1">
              已用时间: {elapsedTime.toFixed(2)}s
            </p>
          )}
        </div>
      )}
    </div>
  )
}
