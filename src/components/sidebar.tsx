import React, { useState } from 'react'
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore, Conversation } from '@/lib/store'

interface SidebarProps {
  isMobile?: boolean
  onMobileClose?: () => void
  isGeneratingImage?: boolean
}

export function Sidebar({ isMobile, onMobileClose, isGeneratingImage = false }: SidebarProps) {
  const { 
    conversations, 
    activeConversationId, 
    createConversation, 
    setActiveConversation, 
    updateConversationTitle, 
    deleteConversation 
  } = useAppStore()

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  // 创建新对话
  const handleCreateConversation = () => {
    // 如果正在生成图片，禁止创建新对话
    if (isGeneratingImage) return
    
    createConversation()
    if (isMobile && onMobileClose) {
      onMobileClose()
    }
  }

  // 选择对话
  const handleSelectConversation = (id: string) => {
    // 如果正在生成图片，禁止切换对话
    if (isGeneratingImage) return
    
    setActiveConversation(id)
    if (isMobile && onMobileClose) {
      onMobileClose()
    }
  }

  // 开始编辑对话标题
  const handleStartEdit = (conv: Conversation) => {
    setEditingId(conv.id)
    setEditTitle(conv.title)
  }

  // 保存对话标题
  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      updateConversationTitle(editingId, editTitle.trim())
      setEditingId(null)
      setEditTitle('')
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  // 删除对话
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteConversation(id)
  }

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 如果折叠，只显示图标
  if (isCollapsed) {
    return (
      <div className={cn(
        "h-full flex flex-col bg-muted/50 border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(false)}
            className="ml-auto"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto py-2">
          {conversations.map(conv => (
            <Button
              key={conv.id}
              variant={conv.id === activeConversationId ? "secondary" : "ghost"}
              className="w-full justify-center mb-1 px-2"
              onClick={() => handleSelectConversation(conv.id)}
              disabled={isGeneratingImage}
            >
              <MessageSquare size={18} />
            </Button>
          ))}
        </div>
        
        <div className="p-4 border-t border-border">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCreateConversation}
            className="w-full"
            disabled={isGeneratingImage}
          >
            <Plus size={18} />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "h-full flex flex-col bg-muted/50 border-r border-border transition-all duration-300",
      isMobile ? "absolute inset-y-0 left-0 z-50 w-64" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4">
        <h2 className="font-semibold">对话列表</h2>
        <div className="flex items-center">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMobileClose}
              className="mr-1"
            >
              <X size={18} />
            </Button>
          )}
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronLeft size={18} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-2 px-2">
        {conversations.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            <p>没有对话</p>
            <p className="text-sm mt-2">点击下方按钮创建新对话</p>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              className={cn(
                "group flex flex-col rounded-lg mb-2 p-2 cursor-pointer hover:bg-muted transition-colors",
                conv.id === activeConversationId && "bg-muted"
              )}
              onClick={() => handleSelectConversation(conv.id)}
            >
              {editingId === conv.id ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {isGeneratingImage && (
                    <span className="text-yellow-500 font-medium">正在生成图片，无法切换对话</span>
                  )}
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 bg-background border border-input rounded-md px-2 py-1 text-sm"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit()
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSaveEdit()
                    }}
                  >
                    <Check size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCancelEdit()
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1">
                    {conv.title}
                  </span>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isGeneratingImage) return
                        handleStartEdit(conv)
                      }}
                      disabled={isGeneratingImage}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      disabled={isGeneratingImage}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {formatDate(conv.updatedAt)}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-border">
        <Button 
          variant="outline" 
          onClick={handleCreateConversation}
          className="w-full"
          disabled={isGeneratingImage}
        >
          <Plus size={16} className="mr-2" />
          新对话
        </Button>
      </div>
    </div>
  )
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={onClick}
      className="md:hidden"
    >
      <Menu size={20} />
    </Button>
  )
}
