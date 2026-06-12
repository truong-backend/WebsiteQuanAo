import { useState, useRef, useEffect } from 'react'
import { apiClient } from '@shared/api/client'
import type { ApiResponse } from '@shared/types'

interface Message {
  role: 'user' | 'bot'
  text: string
}

// Session ID cố định theo tab — reset khi reload
const SESSION_ID = `session_${Date.now()}`

export function ChatBot() {
  const [open, setOpen]         = useState(false)
  const [input, setInput]       = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Xin chào! Tôi là trợ lý thời trang của LUXE. Tôi có thể giúp gì cho bạn? 👗' },
  ])
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Xoá session khi unmount (đóng tab)
  useEffect(() => {
    return () => {
      apiClient.delete(`/chat/${SESSION_ID}`).catch(() => {})
    }
  }, [])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await apiClient.post<ApiResponse<string>>(
        `/chat?sessionId=${SESSION_ID}`,
        { message: text }
      )
      setMessages((m) => [...m, { role: 'bot', text: res.data.data }])
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: 'Xin lỗi, Đã hết quota, yêu cầu thêm thanh toán vì k còn free từ 2024.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Nút mở chat */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-gold transition-colors"
        aria-label="Mở chat tư vấn"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Cửa sổ chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col bg-white border border-brand-light shadow-2xl rounded-none">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-brand-black text-white">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <div>
              <p className="text-sm font-medium tracking-wide">LUXE Assistant</p>
              <p className="text-xs text-white/60">Tư vấn thời trang</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 h-80 overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-brand-cream/30">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-brand-black text-white'
                      : 'bg-white border border-brand-light text-brand-black'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-brand-light px-3 py-2 text-sm text-brand-mid">
                  <span className="animate-pulse">Đang soạn...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 px-3 py-3 border-t border-brand-light bg-white">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="flex-1 resize-none border border-brand-light px-3 py-2 text-sm focus:outline-none focus:border-brand-black max-h-24"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-3 py-2 bg-brand-black text-white text-xs uppercase tracking-wider hover:bg-brand-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  )
}