"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Phone, Send, Loader2 } from "lucide-react"

type Message = { from: "bot" | "user"; text: string }
type Question = { id: string; question: string; answer: string }

type Props = {
  colorPrimary: string
  doctorName: string
  doctorSlug: string
  whatsapp: string | null
  questions: Question[]
}

const MAX_HISTORY = 20

export function AiChatWidget({ colorPrimary, doctorName, doctorSlug, whatsapp, questions }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [requiresAuth, setRequiresAuth] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          from: "bot",
          text: `Olá! Sou a secretária virtual do(a) ${doctorName}. Como posso te ajudar? Posso verificar horários disponíveis e agendar consultas.`,
        },
      ])
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { from: "user", text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)
    setRequiresAuth(false)

    // Keep only the last MAX_HISTORY messages for the API call
    const history = updatedMessages
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }))

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, doctorSlug }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { from: "bot", text: data.message ?? "Desculpe, ocorreu um erro." }])
      if (data.requiresAuth) setRequiresAuth(true)
    } catch {
      setMessages((prev) => [...prev, { from: "bot", text: "Erro de conexão. Tente novamente." }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleFaqClick(q: Question) {
    if (loading) return
    setMessages((prev) => [...prev, { from: "user", text: q.question }])
    setLoading(true)
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: q.answer }])
      setLoading(false)
    }, 800 + Math.random() * 600)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 z-40"
        style={{ backgroundColor: colorPrimary }}
        aria-label="Abrir chat com IA"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6">
          <div
            className="absolute inset-0 bg-black/40 sm:hidden"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full sm:w-[380px] h-[90vh] sm:h-[540px] bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div
              className="px-4 py-3.5 flex items-center justify-between text-white shrink-0"
              style={{ backgroundColor: colorPrimary }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <p className="font-semibold text-sm">Secretária Virtual IA</p>
                  <p className="text-xs opacity-75">Powered by Gemini</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.from === "user"
                        ? "text-white rounded-br-sm"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-bl-sm"
                    }`}
                    style={msg.from === "user" ? { backgroundColor: colorPrimary } : undefined}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-zinc-800 px-3.5 py-2.5 rounded-2xl rounded-bl-sm">
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Auth prompt */}
            {requiresAuth && (
              <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-900 shrink-0">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Para confirmar o agendamento,{" "}
                  <a href="/login" className="font-semibold underline">
                    faça login
                  </a>
                  .
                </p>
              </div>
            )}

            {/* FAQ quick-reply buttons + WhatsApp */}
            {(questions.length > 0 || whatsapp) && (
              <div className="px-3 py-2.5 border-t border-gray-100 dark:border-zinc-800 space-y-1.5 shrink-0">
                {questions.length > 0 && (
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium px-1">
                    Perguntas frequentes:
                  </p>
                )}
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {questions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleFaqClick(q)}
                      disabled={loading}
                      className="w-full text-left text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:text-white transition-all disabled:opacity-50"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colorPrimary
                        e.currentTarget.style.borderColor = colorPrimary
                        e.currentTarget.style.color = "#fff"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = ""
                        e.currentTarget.style.borderColor = ""
                        e.currentTarget.style.color = ""
                      }}
                    >
                      {q.question}
                    </button>
                  ))}

                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      <Phone size={12} />
                      Falar pelo WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t border-gray-200 dark:border-zinc-800 flex gap-2 items-center shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta..."
                maxLength={500}
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{ "--tw-ring-color": colorPrimary } as React.CSSProperties}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: colorPrimary }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}