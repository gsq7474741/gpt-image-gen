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

// 存储图片数据的键前缀
const IMAGE_STORAGE_PREFIX = 'gpt-image-chat-img-';

// 辅助函数：保存图片数据到localStorage
const saveImageToStorage = (imageId: string, imageUrl: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    // 只保存base64格式的图片
    if (imageUrl.startsWith('data:')) {
      localStorage.setItem(`${IMAGE_STORAGE_PREFIX}${imageId}`, imageUrl);
    }
  } catch (e) {
    console.error('保存图片数据失败:', e);
  }
};

// 辅助函数：从localStorage获取图片数据
const getImageFromStorage = (imageId: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(`${IMAGE_STORAGE_PREFIX}${imageId}`);
  } catch (e) {
    console.error('获取图片数据失败:', e);
    return null;
  }
};

// 辅助函数：清理消息中的图片数据
const cleanMessagesForStorage = (conversations: Conversation[]): Conversation[] => {
  return conversations.map(conv => ({
    ...conv,
    messages: conv.messages.map(msg => {
      // 如果消息没有图片，直接返回
      if (!msg.images || msg.images.length === 0) {
        return msg;
      }
      
      // 对于有图片的消息，保存图片数据并替换为占位符
      return {
        ...msg,
        images: msg.images.map((img, index) => {
          // 生成唯一的图片ID
          const imageId = `${msg.id}-${index}`;
          
          // 如果图片URL是base64格式，保存到localStorage并替换为占位符
          if (img.url.startsWith('data:')) {
            // 保存图片数据
            saveImageToStorage(imageId, img.url);
            
            return {
              ...img,
              url: `[图片数据:${imageId}]`, // 占位符中包含图片ID
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
              const data = localStorage.getItem(name);
              if (!data) return null;
              
              // 解析存储的数据
              const parsedData = JSON.parse(data);
              
              // 如果有conversations，尝试恢复图片数据
              if (parsedData && parsedData.state && parsedData.state.conversations) {
                parsedData.state.conversations.forEach((conv: Conversation) => {
                  conv.messages.forEach(msg => {
                    if (msg.images && msg.images.length > 0) {
                      msg.images = msg.images.map((img, index) => {
                        // 检查是否是占位符格式
                        const match = typeof img.url === 'string' && img.url.match(/\[图片数据:(.+?)\]/);
                        if (match) {
                          const imageId = match[1];
                          const imageData = getImageFromStorage(imageId);
                          
                          // 如果找到了图片数据，恢复URL
                          if (imageData) {
                            return {
                              ...img,
                              url: imageData
                            };
                          }
                        }
                        return img;
                      });
                    }
                  });
                });
              }
              
              return JSON.stringify(parsedData);
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
