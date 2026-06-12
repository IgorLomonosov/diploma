'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Що таке Fireball?',
  'Розкажи про ельфів',
  'Які переваги класу Паладин?',
  'Як працює ініціатива в бою?',
  'Що робить Vorpal Sword?',
  'Розкажи про передісторію Acolyte',
]

const mdComponents = {
  p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }: any) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }: any) => <li>{children}</li>,
  code: ({ children }: any) => (
    <code className="bg-slate-800 px-1 rounded text-xs font-mono text-slate-300">
      {children}
    </code>
  ),
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim()
    if (!content || loading) return
    setMessages((prev) => [...prev, { role: 'user', content }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-10),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Виникла помилка. Спробуй ще раз.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white">AI Асистент</h1>
        <p className="text-slate-400 mt-1">
          Запитуй про монстрів, заклинання, раси, класи та правила D&D
        </p>
      </div>

      {/* Чат */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
              <p className="text-5xl mb-3">🐉</p>
              <p className="font-medium text-white">Привіт, мандрівнику!</p>
              <p className="text-sm text-slate-400 mt-1">
                Я знаю все про монстрів, заклинання, раси та класи з нашої бази.
                Запитуй що завгодно!
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-sm p-3 rounded-xl border border-slate-700 bg-slate-900/40 hover:bg-slate-800 hover:border-red-800 text-slate-300 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-red-800 text-white rounded-br-sm'
                  : 'bg-slate-800 text-slate-300 rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown components={mdComponents}>
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Інпут */}
      <div className="flex gap-2 pt-3 border-t border-slate-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          placeholder="Запитай про D&D..."
          disabled={loading}
          className="flex-1 h-10 rounded-md border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 px-3 text-sm"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm rounded-md bg-red-800 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-40"
        >
          Надіслати
        </button>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            disabled={loading}
            className="px-3 py-2 text-sm rounded-md border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Очистити
          </button>
        )}
      </div>
    </div>
  )
}
