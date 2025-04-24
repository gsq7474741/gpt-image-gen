import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Message, MessageImage } from '@/components/chat-message'

// 对话接口
export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

interface AppState {
  apiKey: string
  apiBase: string
  conversations: Conversation[]
  activeConversationId: string | null
  isLoading: boolean
  
  // API 设置
  setApiKey: (apiKey: string) => void
  setApiBase: (apiBase: string) => void
  
  // 对话管理
  createConversation: (title?: string) => string
  setActiveConversation: (id: string) => void
  updateConversationTitle: (id: string, title: string) => void
  deleteConversation: (id: string) => void
  
  // 消息管理
  addMessage: (message: Message) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  clearMessages: (conversationId?: string) => void
  
  // 状态管理
  setIsLoading: (isLoading: boolean) => void
  
  // 工具方法
  getActiveConversation: () => Conversation | null
  getActiveMessages: () => Message[]
}

// 辅助函数：清理消息中的图片数据
const cleanMessagesForStorage = (conversations: Conversation[]): Conversation[] => {
  return conversations.map(conv => ({
    ...conv,
    messages: conv.messages.map(msg => {
      // 如果消息没有图片，直接返回
      if (!msg.images || msg.images.length === 0) {
        return msg;
      }
      
      // 对于有图片的消息，只保留图片的引用信息，不保存base64数据
      return {
        ...msg,
        images: msg.images.map(img => {
          // 如果图片URL是base64格式，替换为占位符
          if (img.url.startsWith('data:')) {
            return {
              ...img,
              url: '[图片数据]', // 替换为占位符
              originalUrl: undefined // 不保存原始URL
            };
          }
          return img;
        })
      };
    })
  }));
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      apiKey: 'sk-Sx9OrE7d6LIUVmfFJDLtwXy23pCfntJ2ArHve9Hh6L9rx1Z',
      apiBase: 'http://api.openai-proxy.org/v1',
      conversations: [],
      activeConversationId: null,
      isLoading: false,
      
      // API 设置
      setApiKey: (apiKey) => set({ apiKey }),
      setApiBase: (apiBase) => set({ apiBase }),
      
      // 对话管理
      createConversation: (title = '新对话') => {
        const id = uuidv4()
        const newConversation: Conversation = {
          id,
          title,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        
        set((state) => ({
          conversations: [...state.conversations, newConversation],
          activeConversationId: id
        }))
        
        return id
      },
      
      setActiveConversation: (id) => set({ activeConversationId: id }),
      
      updateConversationTitle: (id, title) => set((state) => ({
        conversations: state.conversations.map(conv => 
          conv.id === id 
            ? { ...conv, title, updatedAt: Date.now() } 
            : conv
        )
      })),
      
      deleteConversation: (id) => set((state) => {
        const newConversations = state.conversations.filter(conv => conv.id !== id)
        const newActiveId = state.activeConversationId === id 
          ? (newConversations.length > 0 ? newConversations[0].id : null)
          : state.activeConversationId
          
        return {
          conversations: newConversations,
          activeConversationId: newActiveId
        }
      }),
      
      // 消息管理
      addMessage: (message) => set((state) => {
        const activeId = state.activeConversationId
        if (!activeId) return state
        
        return {
          conversations: state.conversations.map(conv => 
            conv.id === activeId 
              ? { 
                  ...conv, 
                  messages: [...conv.messages, message],
                  updatedAt: Date.now(),
                  title: conv.messages.length === 0 && message.role === 'user' 
                    ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
                    : conv.title
                } 
              : conv
          )
        }
      }),
      
      setMessages: (conversationId, messages) => set((state) => ({
        conversations: state.conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, messages, updatedAt: Date.now() } 
            : conv
        )
      })),
      
      clearMessages: (conversationId) => set((state) => {
        const targetId = conversationId || state.activeConversationId
        if (!targetId) return state
        
        return {
          conversations: state.conversations.map(conv => 
            conv.id === targetId 
              ? { ...conv, messages: [], updatedAt: Date.now() } 
              : conv
          )
        }
      }),
      
      // 状态管理
      setIsLoading: (isLoading) => set({ isLoading }),
      
      // 工具方法
      getActiveConversation: () => {
        const state = get()
        if (!state.activeConversationId) return null
        return state.conversations.find(conv => conv.id === state.activeConversationId) || null
      },
      
      getActiveMessages: () => {
        const state = get()
        const activeConv = state.conversations.find(conv => conv.id === state.activeConversationId)
        return activeConv ? activeConv.messages : []
      }
    }),
    {
      name: 'gpt-image-chat-storage',
      partialize: (state) => ({ 
        apiKey: state.apiKey,
        apiBase: state.apiBase,
        conversations: cleanMessagesForStorage(state.conversations),
        activeConversationId: state.activeConversationId
      }),
      // 添加错误处理
      storage: createJSONStorage(() => {
        // 检查是否在浏览器环境中
        const isServer = typeof window === 'undefined';
        
        return {
          getItem: (name) => {
            if (isServer) return null;
            
            try {
              return localStorage.getItem(name);
            } catch (e) {
              console.error('读取本地存储失败:', e);
              return null;
            }
          },
          setItem: (name, value) => {
            if (isServer) return;
            
            try {
              localStorage.setItem(name, value);
            } catch (e) {
              console.error('写入本地存储失败:', e);
              // 如果存储失败，尝试清理旧数据
              try {
                localStorage.clear();
                localStorage.setItem(name, value);
              } catch (clearError) {
                console.error('清理存储后仍然失败:', clearError);
              }
            }
          },
          removeItem: (name) => {
            if (isServer) return;
            
            try {
              localStorage.removeItem(name);
            } catch (e) {
              console.error('删除本地存储失败:', e);
            }
          }
        };
      })
    }
  )
)
