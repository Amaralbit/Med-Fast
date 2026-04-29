import Link from "next/link"
import { FileText } from "lucide-react"

export const metadata = {
  title: "Termos de Uso — MedFast",
  description: "Leia os Termos de Uso do MedFast antes de utilizar a plataforma.",
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-white">
      {/* Nav */}
      <header className="border-b border-gray-100 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-500 dark:text-cyan-400">MedFast</Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-lg bg-blue-500 dark:bg-cyan-500 hover:bg-blue-600 dark:hover:bg-cyan-600 text-white text-sm font-medium transition-colors">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-cyan-950 flex items-center justify-center">
            <FileText size={20} className="text-blue-500 dark:text-cyan-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Última atualização: 29 de abril de 2026</p>
        </div>
        <h1 className="text-3xl font-extrabold mb-4">Termos de Uso</h1>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-12">
          Ao criar uma conta ou utilizar o <strong className="text-gray-700 dark:text-gray-300">MedFast</strong>, você concorda com estes Termos de Uso. Leia com atenção antes de utilizar a plataforma.
        </p>

        <div className="space-y-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Sobre o MedFast</h2>
            <p className="text-gray-600 dark:text-gray-400">
              O MedFast é uma plataforma de software como serviço (SaaS) que fornece ferramentas de agendamento automatizado com inteligência artificial para consultórios médicos. O MedFast é uma ferramenta de gestão e agendamento — <strong>não é um serviço de saúde, não fornece diagnósticos, orientações médicas ou qualquer forma de assistência clínica</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Elegibilidade</h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>Você deve ter no mínimo 18 anos para criar uma conta.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>Médicos devem possuir registro válido no Conselho Regional de Medicina (CRM) para utilizar a plataforma como prestadores de serviço.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>Ao se cadastrar, você declara que as informações fornecidas são verdadeiras e atualizadas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Conta e responsabilidades</h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>Você é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas em sua conta.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>Notifique-nos imediatamente em caso de acesso não autorizado à sua conta pelo e-mail <a href="mailto:turingdevlv@gmail.com" className="text-blue-500 dark:text-cyan-400 hover:underline">turingdevlv@gmail.com</a>.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>É proibido compartilhar sua conta com terceiros.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>Uma conta por usuário — é vedado criar múltiplas contas para contornar limitações do plano.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Planos e pagamentos</h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p><strong className="text-gray-700 dark:text-gray-300">Plano Free:</strong> gratuito com funcionalidades básicas, limitado a 30 agendamentos por mês. Sem acesso ao chat com IA.</p>
              <p><strong className="text-gray-700 dark:text-gray-300">Planos pagos (Pro e Clínica):</strong> cobrados mensalmente via cartão de crédito através da Stripe. Os preços estão disponíveis na página de planos e podem ser alterados com aviso prévio de 30 dias.</p>
              <p><strong className="text-gray-700 dark:text-gray-300">Cancelamento:</strong> você pode cancelar sua assinatura a qualquer momento. O acesso às funcionalidades pagas é mantido até o fim do período já pago. Não há reembolso proporcional por períodos não utilizados.</p>
              <p><strong className="text-gray-700 dark:text-gray-300">Inadimplência:</strong> em caso de falha no pagamento, a conta é automaticamente rebaixada para o Plano Free.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Uso aceitável</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">É proibido utilizar o MedFast para:</p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex gap-2"><span className="text-red-500 shrink-0">✕</span>Divulgar informações falsas, enganosas ou fraudulentas sobre serviços médicos.</li>
              <li className="flex gap-2"><span className="text-red-500 shrink-0">✕</span>Violar direitos de terceiros, incluindo privacidade e propriedade intelectual.</li>
              <li className="flex gap-2"><span className="text-red-500 shrink-0">✕</span>Enviar spam, mensagens não solicitadas ou conteúdo abusivo pelo chat.</li>
              <li className="flex gap-2"><span className="text-red-500 shrink-0">✕</span>Tentar acessar dados de outros usuários ou comprometer a segurança da plataforma.</li>
              <li className="flex gap-2"><span className="text-red-500 shrink-0">✕</span>Realizar engenharia reversa, scraping automatizado ou sobrecarregar os servidores.</li>
              <li className="flex gap-2"><span className="text-red-500 shrink-0">✕</span>Utilizar a IA do chat para fins que não sejam agendamento de consultas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Responsabilidades do médico</h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>O médico é o único responsável pelo conteúdo do seu perfil público, horários, preços e informações de convênios.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>O médico é responsável por honrar os agendamentos realizados pela plataforma.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>Documentos médicos enviados pela plataforma são de responsabilidade exclusiva do médico emissor.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>O MedFast não se responsabiliza por atos médicos, diagnósticos ou qualquer relação clínica entre médico e paciente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Inteligência Artificial</h2>
            <p className="text-gray-600 dark:text-gray-400">
              O chat de agendamento utiliza a API do Google Gemini para processar mensagens. As respostas geradas pela IA são automatizadas e têm finalidade exclusiva de auxiliar no agendamento de consultas. O MedFast <strong>não garante a precisão, completude ou adequação</strong> das respostas da IA para qualquer finalidade médica ou clínica. A IA não substitui orientação médica profissional.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Disponibilidade e interrupções</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Nos esforçamos para manter a plataforma disponível 24 horas por dia, 7 dias por semana. Porém, não garantimos disponibilidade ininterrupta. Podemos realizar manutenções programadas ou sofrer interrupções por fatores fora do nosso controle. Não seremos responsáveis por danos decorrentes de indisponibilidade da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Propriedade intelectual</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Todo o código, design, marca e conteúdo do MedFast são propriedade do MedFast e protegidos por leis de propriedade intelectual. É vedada a reprodução, distribuição ou criação de obras derivadas sem autorização expressa. Os dados inseridos por você (perfil, agendamentos, documentos) pertencem a você — o MedFast possui apenas licença para processá-los conforme necessário para prestar o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">10. Limitação de responsabilidade</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Na máxima extensão permitida pela lei brasileira, o MedFast não será responsável por danos indiretos, incidentais, especiais ou consequentes, incluindo lucros cessantes, decorrentes do uso ou impossibilidade de uso da plataforma. Nossa responsabilidade máxima em qualquer hipótese será limitada ao valor pago pelo usuário nos últimos 3 meses.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">11. Encerramento de conta</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Você pode solicitar o encerramento da sua conta a qualquer momento pelo e-mail <a href="mailto:turingdevlv@gmail.com" className="text-blue-500 dark:text-cyan-400 hover:underline">turingdevlv@gmail.com</a>. O MedFast pode suspender ou encerrar contas que violem estes Termos, com ou sem aviso prévio, dependendo da gravidade da violação.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">12. Alterações nos Termos</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Podemos atualizar estes Termos periodicamente. Notificaremos usuários ativos por e-mail com pelo menos 15 dias de antecedência em caso de mudanças materiais. O uso continuado da plataforma após a vigência das alterações constitui aceitação dos novos Termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">13. Lei aplicável e foro</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer conflitos decorrentes deste instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">14. Contato</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Para dúvidas sobre estes Termos: <a href="mailto:turingdevlv@gmail.com" className="text-blue-500 dark:text-cyan-400 hover:underline">turingdevlv@gmail.com</a><br />
              Para questões de privacidade: <a href="mailto:turingdevlv@gmail.com" className="text-blue-500 dark:text-cyan-400 hover:underline">turingdevlv@gmail.com</a>
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-100 dark:border-zinc-800 py-8 px-4 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400 dark:text-gray-600">
          <Link href="/" className="font-bold text-blue-500 dark:text-cyan-400">MedFast</Link>
          <div className="flex items-center gap-4">
            <Link href="/privacidade" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}