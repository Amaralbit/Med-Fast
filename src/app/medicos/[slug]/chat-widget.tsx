"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Phone } from "lucide-react"

type Question = { id: string; question: string; answer: string }
type Message = { from: "bot" | "user"; text: string }

type Props = {
  colorPrimary: string
  doctorName: string
  whatsapp: string | null
  questions: Question[]
}

export function ChatWidget({ colorPrimary, doctorName, whatsapp, questions }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function openChat() {
    setMessages((prev) =>
      prev.length > 0
        ? prev
        : [{ from: "bot", text: `Olá! Sou a secretária virtual do(a) ${doctorName}. Como posso te ajudar?` }]
    )
    setOpen(true)
  }

  function handleQuestion(q: Question) {
    setMessages((prev) => [
      ...prev,
      { from: "user", text: q.question },
      { from: "bot", text: q.answer },
    ])
  }

  const showButtons = messages.length > 0 && (questions.length > 0 || whatsapp)

  return (
    <>
      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 z-40"
        style={{ backgroundColor: colorPrimary }}
        aria-label="Abrir chat"
      >
        <MessageCircle size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6">
          <div className="absolute inset-0 bg-black/40 sm:hidden" onClick={() => setOpen(false)} />

          <div className="relative w-full sm:w-[380px] h-[90vh] sm:h-[520px] bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div
              className="px-4 py-3.5 flex items-center justify-between text-white shrink-0"
              style={{ backgroundColor: colorPrimary }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <p className="font-semibold text-sm">Secretária Virtual</p>
                  <p className="text-xs opacity-75">Resposta imediata</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

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
              <div ref={bottomRef} />
            </div>

            {showButtons && (
              <div className="px-3 py-3 border-t border-gray-200 dark:border-zinc-800 space-y-2 shrink-0">
                <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium px-1">
                  Selecione uma opção:
                </p>

                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {questions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleQuestion(q)}
                      className="w-full text-left text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-transparent hover:text-white transition-all"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colorPrimary
                        e.currentTarget.style.borderColor = colorPrimary
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
                      className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      <Phone size={14} />
                      Falar pelo WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
