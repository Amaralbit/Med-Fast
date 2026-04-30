import Link from "next/link"
import {
  Activity,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle,
  Clock,
  MessageCircle,
  MousePointer2,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  Zap,
} from "lucide-react"
import { HeroDecorations } from "./hero-decorations"

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

const liveCards = [
  { icon: MessageCircle, label: "Mensagem recebida", value: "Consulta para amanhã?", color: "text-emerald-500" },
  { icon: Activity, label: "IA conferindo agenda", value: "3 horários livres", color: "text-blue-500" },
  { icon: CheckCircle, label: "Agendamento confirmado", value: "09:30 - Dra. Camila", color: "text-cyan-500" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-zinc-950 dark:text-white">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 shadow-sm shadow-blue-950/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="group flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
              <Zap size={17} />
            </span>
            <span className="text-xl font-black tracking-tight text-blue-600 dark:text-cyan-300">MedFast</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 dark:text-zinc-300 dark:hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-blue-500/35 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-200"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(37,99,235,0.20),transparent_26%),radial-gradient(circle_at_84%_18%,rgba(34,211,238,0.22),transparent_24%),linear-gradient(135deg,#eff6ff_0%,#ffffff_42%,#ecfeff_100%)] dark:bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_84%_18%,rgba(37,99,235,0.18),transparent_24%),linear-gradient(135deg,#09090b_0%,#0f172a_52%,#082f49_100%)]" />
        <div className="kinetic-grid absolute inset-0 opacity-70" />
        <div className="absolute -left-28 top-28 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -right-24 bottom-8 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl" />
        <HeroDecorations />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_420px]">
          <div className="text-center lg:text-left">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-blue-700 shadow-sm backdrop-blur dark:border-cyan-300/20 dark:bg-white/10 dark:text-cyan-200"
              style={{ animation: "fade-up 0.6s ease 0.1s both" }}
            >
              <Sparkles size={13} />
              Secretária virtual com IA
            </div>
            <h1
              className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.06em] text-slate-950 sm:text-7xl lg:text-8xl dark:text-white"
              style={{ animation: "fade-up 0.7s ease 0.25s both" }}
            >
              Consultas no
              <span className="shimmer-text block">piloto automático</span>
            </h1>
            <p
              className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl lg:mx-0 dark:text-zinc-300"
              style={{ animation: "fade-up 0.7s ease 0.45s both" }}
            >
              O MedFast troca o vai-e-volta do WhatsApp por uma página pública com IA:
              ela atende, confere disponibilidade e agenda consultas enquanto você cuida dos pacientes.
            </p>
            <div
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
              style={{ animation: "fade-up 0.7s ease 0.6s both" }}
            >
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-blue-600 px-7 py-4 font-black text-white shadow-2xl shadow-blue-600/30 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-slate-950 dark:bg-cyan-400 dark:text-slate-950 dark:shadow-cyan-400/20 dark:hover:bg-white"
              >
                <span className="button-sheen" />
                Quero minha secretária virtual
                <ArrowRight size={19} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-6 py-4 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:text-blue-700 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:border-cyan-300/40 dark:hover:text-cyan-200"
              >
                <MousePointer2 size={16} />
                Já tenho conta
              </Link>
            </div>
            <p
              className="mt-4 text-xs font-medium text-slate-400 dark:text-zinc-500"
              style={{ animation: "fade-up 0.6s ease 0.75s both" }}
            >
              Gratuito para começar · Sem cartão de crédito
            </p>
          </div>

          <div
            className="hero-console relative mx-auto w-full max-w-[420px] rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-2xl shadow-blue-950/15 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/70"
            style={{ animation: "fade-up 0.8s ease 0.35s both" }}
          >
            <div className="absolute -right-6 -top-6 rotate-3 rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-xl shadow-blue-950/20 dark:bg-white dark:text-slate-950">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300 dark:text-blue-600">ao vivo</p>
              <p className="text-sm font-black">24h online</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white dark:bg-black">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">MedFast AI</p>
                  <p className="text-2xl font-black tracking-tight">Agenda inteligente</p>
                </div>
                <div className="grid size-12 place-items-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/40">
                  <Bot size={24} />
                </div>
              </div>
              <div className="space-y-3">
                {liveCards.map(({ icon: Icon, label, value, color }, i) => (
                  <div
                    key={label}
                    className="live-card flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur"
                    style={{ animationDelay: `${0.9 + i * 0.16}s` }}
                  >
                    <div className="grid size-10 place-items-center rounded-xl bg-white text-slate-950">
                      <Icon size={19} className={color} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">{label}</p>
                      <p className="font-bold">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-300 p-4 text-slate-950">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em]">Próxima consulta</p>
                    <p className="text-3xl font-black">09:30</p>
                  </div>
                  <p className="rounded-full bg-white/80 px-3 py-1 text-xs font-black">Confirmada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative overflow-hidden border-y border-blue-100 bg-slate-950 py-3 text-white dark:border-white/10">
        <div className="ticker-track flex w-max gap-8 text-sm font-black uppercase tracking-[0.24em] text-cyan-200">
          {Array.from({ length: 2 }).map((_, loop) => (
            <div key={loop} className="flex gap-8">
              <span>IA atendendo</span>
              <span>Agenda sem conflito</span>
              <span>Perfil público</span>
              <span>Confirmação automática</span>
              <span>Menos WhatsApp</span>
            </div>
          ))}
        </div>
      </div>

      <div className="scroll-reveal border-b border-gray-100 bg-white/80 py-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-10 px-4">
          {[
            { icon: Users,       number: "500+",   text: "Médicos cadastrados"          },
            { icon: Star,        number: "10 mil+", text: "Agendamentos realizados"      },
            { icon: CheckCircle, number: "< 10min", text: "Para configurar seu perfil"  },
          ].map(({ icon: Icon, number, text }) => (
            <div key={text} className="group flex items-center gap-3 transition-transform duration-300 hover:-translate-y-0.5">
              <div className="grid size-9 place-items-center rounded-xl bg-blue-50 transition-all duration-300 group-hover:bg-blue-600 dark:bg-cyan-950">
                <Icon size={15} className="text-blue-600 transition-colors duration-300 group-hover:text-white dark:text-cyan-300 dark:group-hover:text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">{number}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="scroll-reveal mb-16 text-center">
            <h2 className="mb-3 text-4xl font-black tracking-tight">Como funciona</h2>
            <p className="text-slate-500 dark:text-zinc-400">Configure uma vez. A IA cuida do resto.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="scroll-reveal group relative"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+2rem)] right-0 top-8 hidden h-px bg-gradient-to-r from-blue-200 to-transparent md:block dark:from-cyan-900" />
                )}
                <div className="text-center">
                  <div className="relative mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 shadow-lg shadow-blue-500/10 transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-3 group-hover:bg-blue-600 dark:bg-cyan-950">
                    <span
                      className="absolute inset-0 rounded-2xl bg-blue-500"
                      style={{ animation: `badge-ping 2.4s ease-out ${i * 0.8}s infinite` }}
                    />
                    <span className="relative text-2xl font-black text-blue-600 transition-colors group-hover:text-white dark:text-cyan-300">{step.number}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-slate-50 px-4 py-24 dark:bg-zinc-900">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent dark:from-zinc-950" />
        <div className="relative mx-auto max-w-5xl">
          <div className="scroll-reveal mb-16 text-center">
            <h2 className="mb-3 text-4xl font-black tracking-tight">Tudo que você precisa</h2>
            <p className="text-slate-500 dark:text-zinc-400">Um sistema completo para substituir o atendimento manual</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="scroll-reveal group relative overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-600/10 dark:border-white/10 dark:bg-zinc-800/50"
                style={{ animationDelay: `${(i % 3) * 80}ms` }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 dark:bg-cyan-950">
                  <Icon size={20} className="text-blue-600 dark:text-cyan-300" />
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="scroll-reveal mb-16 text-center">
            <h2 className="mb-3 text-4xl font-black tracking-tight">O que os médicos dizem</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="scroll-reveal group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-cyan-900"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {/* Gradient top bar on hover */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {/* Decorative quote mark */}
                <div className="pointer-events-none absolute right-5 top-3 select-none text-8xl font-black leading-none text-slate-100 dark:text-zinc-800">&ldquo;</div>

                <div className="relative mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="relative mb-6 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-black text-white shadow-md shadow-blue-500/25">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="scroll-reveal relative overflow-hidden bg-slate-950 px-4 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(37,99,235,0.45),transparent_28%),radial-gradient(circle_at_75%_65%,rgba(34,211,238,0.38),transparent_30%)]" />
        <div className="kinetic-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-3xl text-center text-white">
          <h2 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
            Comece hoje mesmo
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-blue-100">
            Configure seu perfil em menos de 10 minutos e compartilhe o link
            com seus pacientes ainda hoje.
          </p>
          <div className="relative inline-block">
            <span
              className="absolute inset-0 rounded-2xl bg-white"
              style={{ animation: "cta-pulse 2.2s ease-out infinite" }}
            />
            <span
              className="absolute inset-0 rounded-2xl bg-white"
              style={{ animation: "cta-pulse 2.2s ease-out 1.1s infinite" }}
            />
            <Link
              href="/register"
              className="group relative inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-black text-blue-700 shadow-2xl shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-cyan-100"
            >
              Criar minha conta grátis
              <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-4 py-8 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-400 sm:flex-row dark:text-zinc-600">
          <span className="font-bold text-blue-600 dark:text-cyan-300">MedFast</span>
          <div className="flex items-center gap-4">
            <Link href="/privacidade" className="transition-colors hover:text-slate-600 dark:hover:text-zinc-400">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="transition-colors hover:text-slate-600 dark:hover:text-zinc-400">
              Termos de Uso
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
