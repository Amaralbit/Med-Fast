import Link from "next/link"
import {
  Bot, Calendar, Clock, Shield, Star, ArrowRight,
  CheckCircle, Stethoscope, Users, Zap,
} from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "Chatbot com IA",
    description: "A IA atende os pacientes 24h por dia, verifica horários disponíveis e agenda automaticamente.",
  },
  {
    icon: Calendar,
    title: "Agenda inteligente",
    description: "Configure seus horários de atendimento e bloqueios. A IA nunca agenda em conflito.",
  },
  {
    icon: Stethoscope,
    title: "Perfil público personalizável",
    description: "Página com suas cores, especialidade, convênios e bio. Compartilhe o link com qualquer paciente.",
  },
  {
    icon: Shield,
    title: "Convênios e preços",
    description: "Liste os planos que aceita e o valor da consulta particular. Tudo visível no perfil.",
  },
  {
    icon: Clock,
    title: "Histórico completo",
    description: "Confirme, conclua ou cancele consultas pelo painel. Pacientes acompanham o status em tempo real.",
  },
  {
    icon: Zap,
    title: "Zero atendimento manual",
    description: "Substitui o atendimento no WhatsApp. Você trabalha enquanto o sistema agenda.",
  },
]

const steps = [
  {
    number: "01",
    title: "Médico cria o perfil",
    description: "Cadastre especialidade, horários, convênios e personalize as cores da sua página pública.",
  },
  {
    number: "02",
    title: "Paciente acessa o link",
    description: "O paciente abre seu perfil, vê suas informações e clica em Agendar consulta.",
  },
  {
    number: "03",
    title: "IA agenda na hora",
    description: "A secretária virtual verifica a disponibilidade e registra a consulta automaticamente.",
  },
]

const testimonials = [
  {
    name: "Dra. Camila Souza",
    role: "Dermatologista",
    text: "Reduzi 90% das mensagens de WhatsApp. Os pacientes chegam com a consulta marcada e confirmada.",
  },
  {
    name: "Dr. Rafael Mendes",
    role: "Clínico Geral",
    text: "Em menos de 10 minutos configurei tudo e já tinha meu perfil no ar. Incrivelmente simples.",
  },
  {
    name: "Dra. Ana Lima",
    role: "Pediatra",
    text: "Meus pacientes adoram. Conseguem agendar à meia-noite sem precisar me ligar.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white">

      {/* Nav */}
      <header className="border-b border-gray-100 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-500 dark:text-cyan-400">MedFast</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-blue-500 dark:bg-cyan-500 hover:bg-blue-600 dark:hover:bg-cyan-600 text-white text-sm font-medium transition-colors"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-cyan-950 text-blue-600 dark:text-cyan-400 text-xs font-medium mb-6">
            <Zap size={12} />
            Secretária Virtual com IA para Médicos
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Chega de{" "}
            <span className="text-blue-500 dark:text-cyan-400">WhatsApp</span>
            <br />
            para agendar consultas
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            O MedFast cria uma página pública para o seu consultório com uma IA que atende,
            verifica disponibilidade e agenda consultas automaticamente — 24 horas por dia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-500 dark:bg-cyan-500 hover:bg-blue-600 dark:hover:bg-cyan-600 text-white font-semibold transition-colors"
            >
              Quero minha secretária virtual
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-zinc-500 font-medium transition-colors text-sm"
            >
              Já tenho conta
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
            Gratuito para começar · Sem cartão de crédito
          </p>
        </div>
      </section>

      {/* Social proof strip */}
      <div className="border-y border-gray-100 dark:border-zinc-800 py-5 bg-gray-50 dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
          {[
            { icon: Users, text: "Médicos de todas as especialidades" },
            { icon: Star, text: "Agendamentos automáticos" },
            { icon: CheckCircle, text: "Configuração em menos de 10 minutos" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={15} className="text-blue-500 dark:text-cyan-400" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3">Como funciona</h2>
            <p className="text-gray-500 dark:text-gray-400">Configure uma vez. A IA cuida do resto.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px bg-gradient-to-r from-blue-200 dark:from-cyan-900 to-transparent" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 dark:bg-cyan-950 mb-4">
                    <span className="text-2xl font-extrabold text-blue-500 dark:text-cyan-400">{step.number}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3">Tudo que você precisa</h2>
            <p className="text-gray-500 dark:text-gray-400">Um sistema completo para substituir o atendimento manual</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-200 dark:border-zinc-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-cyan-950 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-blue-500 dark:text-cyan-400" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3">O que os médicos dizem</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-extrabold mb-4">
            Comece hoje mesmo
          </h2>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            Configure seu perfil em menos de 10 minutos e compartilhe o link
            com seus pacientes ainda hoje.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-600 font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Criar minha conta grátis
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-zinc-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400 dark:text-gray-600">
          <span className="font-bold text-blue-500 dark:text-cyan-400">MedFast</span>
          <div className="flex items-center gap-4">
            <Link href="/privacidade" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}