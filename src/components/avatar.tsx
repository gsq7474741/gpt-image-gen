import React from 'react'
import { User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  role: 'user' | 'assistant'
  className?: string
}

export function Avatar({ role, className }: AvatarProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full",
        role === 'user' 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-foreground",
        className
      )}
    >
      {role === 'user' ? (
        <User size={20} />
      ) : (
        <Bot size={20} />
      )}
    </div>
  )
}
