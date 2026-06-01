import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import { api } from '../lib/api.js'

const STARTERS = [
  'Which cells have RRC success rate below 95%?',
  'Show top 10 most congested sites by PRB utilization',
  'Compare 4G vs 5G throughput by region',
  'How many sites are currently below SLA targets?',
  'What is our overall network availability?',
  'Which city has the worst network performance?',
  'Show PRB utilization trend for Lisboa',
  'Which regions need the most investment?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-brand-blue text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
        {msg.content}
        {msg.sql && (
          <details className="mt-2">
            <summary className="text-xs opacity-60 cursor-pointer">View SQL</summary>
            <pre className="text-xs mt-1 opacity-70 whitespace-pre-wrap font-mono">{msg.sql}</pre>
          </details>
        )}
      </div>
    </div>
  )
}

export default function IntelligenceChat() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi! I'm your Network Operations AI. Ask me anything about your 450 cell sites in Portugal — performance, alarms, SLA compliance, capacity planning."
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const q = text || input.trim()
    if (!q) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: q }])
    setLoading(true)
    try {
      const res = await api.chat(q, messages)
      setMessages(m => [...m, { role: 'assistant', content: res.answer || res.text || res.message, sql: res.sql }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "I couldn't connect to the analytics backend. Check that the Express server is running and your Snowflake credentials are configured." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-5 border-b border-gray-100 bg-white flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Network Intelligence Chat</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ask questions in plain English · Powered by Snowflake Cortex Agent</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-gray-50">
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center">
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
              <span className="text-xs text-gray-400 animate-pulse">Querying network data...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-8 pb-4 bg-gray-50 grid grid-cols-2 gap-2 flex-shrink-0">
          {STARTERS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-left text-xs text-gray-600 bg-white border border-gray-100 rounded-xl px-3 py-2.5 hover:bg-brand-blue-light hover:border-brand-blue hover:text-brand-blue transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="px-8 py-4 border-t border-gray-100 bg-white flex-shrink-0">
        <div className="flex gap-3">
          <input
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            placeholder="Ask about network performance, alarms, SLA status..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} className="btn-primary px-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
