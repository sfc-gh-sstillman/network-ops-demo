import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Loader2 } from 'lucide-react'
import { api } from '../lib/api.js'

export default function FabChat({ context = 'general' }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    const q = input.trim()
    if (!q) return
    setInput('')
    const newMsgs = [...messages, { role: 'user', content: q }]
    setMessages(newMsgs)
    setLoading(true)
    try {
      const res = await api.chat(q, messages)
      setMessages([...newMsgs, { role: 'assistant', content: res.answer || res.text || res.message }])
    } catch {
      setMessages([...newMsgs, { role: 'assistant', content: 'Could not reach the analytics backend. Ensure the Express server is running.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-80 flex flex-col" style={{ height: 420 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-brand-blue rounded-t-2xl">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Network Intelligence</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-4">Ask a question about network performance</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`text-xs px-3 py-2 rounded-xl leading-relaxed ${m.role === 'user' ? 'bg-brand-blue text-white ml-6' : 'bg-gray-50 text-gray-700 mr-6'}`}>
                {m.content}
              </div>
            ))}
            {loading && <div className="bg-gray-50 text-gray-400 text-xs px-3 py-2 rounded-xl mr-6 animate-pulse">Thinking...</div>}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-3 border-t border-gray-100 flex gap-2">
            <input
              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-blue"
              placeholder="Ask anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={loading}
            />
            <button onClick={send} disabled={loading || !input.trim()} className="p-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark disabled:opacity-40">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-12 h-12 bg-brand-blue text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-blue-dark transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
