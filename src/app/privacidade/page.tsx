import Link from "next/link"
import { Shield } from "lucide-react"
import { MedicalDecorations } from "../medical-decorations"

export const metadata = {
  title: "Política de Privacidade — MedFast",
  description: "Saiba como o MedFast coleta, usa e protege seus dados pessoais em conformidade com a LGPD.",
}

export default function PrivacidadePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-gray-900 dark:bg-zinc-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(37,99,235,0.12),transparent_24%),radial-gradient(circle_at_88%_36%,rgba(34,211,238,0.12),transparent_24%)]" />
      <MedicalDecorations variant="legal" />

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

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-cyan-950 flex items-center justify-center">
            <Shield size={20} className="text-blue-500 dark:text-cyan-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Última atualização: 29 de abril de 2026</p>
        </div>
        <h1 className="text-3xl font-extrabold mb-4">Política de Privacidade</h1>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-12">
          Esta Política de Privacidade descreve como o <strong className="text-gray-700 dark:text-gray-300">MedFast</strong> coleta, usa, armazena e protege seus dados pessoais, em conformidade com a <strong className="text-gray-700 dark:text-gray-300">Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)</strong>.
        </p>

        <div className="space-y-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Quem somos (Controlador de Dados)</h2>
            <p className="text-gray-600 dark:text-gray-400">
              O MedFast é uma plataforma de secretária virtual com inteligência artificial para consultórios médicos. Para fins da LGPD, o <strong>controlador dos dados</strong> é a pessoa jurídica responsável pela operação do MedFast. Para entrar em contato sobre privacidade, utilize: <a href="mailto:turingdevlv@gmail.com" className="text-blue-500 dark:text-cyan-400 hover:underline">turingdevlv@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Dados que coletamos</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">Coletamos apenas os dados necessários para a prestação dos nossos serviços:</p>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800">
                <p className="font-semibold mb-1">Dados de Cadastro</p>
                <p className="text-gray-500 dark:text-gray-400">Nome completo, endereço de e-mail e senha (armazenada de forma criptografada com bcrypt). Estes dados são coletados no momento do registro.</p>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800">
                <p className="font-semibold mb-1">Dados de Perfil Médico</p>
                <p className="text-gray-500 dark:text-gray-400">Especialidade, endereço do consultório, preços, convênios aceitos, horários de atendimento e foto de perfil (se fornecida). Estes dados são tornados públicos conforme configuração do médico.</p>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800">
                <p className="font-semibold mb-1">Dados de Agendamento (Dados Sensíveis de Saúde)</p>
                <p className="text-gray-500 dark:text-gray-400">Data, horário e motivo da consulta. Documentos médicos enviados pelo médico ao paciente (receitas, atestados, laudos). Estes são <strong>dados sensíveis de saúde</strong> nos termos do Art. 11 da LGPD e são tratados com base no seu consentimento explícito e na execução do contrato de prestação de serviço de saúde.</p>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800">
                <p className="font-semibold mb-1">Dados de Uso e Navegação</p>
                <p className="text-gray-500 dark:text-gray-400">Endereço IP (usado apenas para controle de taxa de requisições e segurança), tipo de dispositivo e navegador. Não utilizamos cookies de rastreamento ou publicidade.</p>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800">
                <p className="font-semibold mb-1">Dados de Pagamento</p>
                <p className="text-gray-500 dark:text-gray-400">O MedFast não armazena dados de cartão de crédito. Os pagamentos são processados diretamente pela <strong>Stripe</strong> (plataforma certificada PCI-DSS). Armazenamos apenas o identificador de assinatura fornecido pela Stripe.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Finalidades do tratamento e bases legais</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-zinc-800 text-left">
                    <th className="px-3 py-2 rounded-tl-lg font-semibold">Finalidade</th>
                    <th className="px-3 py-2 rounded-tr-lg font-semibold">Base Legal (LGPD)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-400">
                  {[
                    ["Criar e gerenciar sua conta", "Execução de contrato (Art. 7º, V)"],
                    ["Realizar e gerenciar agendamentos de consultas", "Execução de contrato + Consentimento (Art. 7º, I e V)"],
                    ["Enviar notificações sobre suas consultas por e-mail", "Execução de contrato + Legítimo interesse (Art. 7º, V e IX)"],
                    ["Disponibilizar documentos médicos ao paciente", "Consentimento + Tutela da saúde (Art. 7º, I; Art. 11, II, f)"],
                    ["Processar pagamentos de assinaturas (médicos)", "Execução de contrato (Art. 7º, V)"],
                    ["Segurança e prevenção a fraudes (rate limiting por IP)", "Legítimo interesse (Art. 7º, IX)"],
                    ["Cumprir obrigações legais e regulatórias", "Cumprimento de obrigação legal (Art. 7º, II)"],
                  ].map(([fin, base], i) => (
                    <tr key={i} className="border-t border-gray-200 dark:border-zinc-800">
                      <td className="px-3 py-2">{fin}</td>
                      <td className="px-3 py-2">{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Compartilhamento de dados</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Não vendemos nem comercializamos seus dados. Compartilhamos dados apenas nas seguintes situações:
            </p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span> <strong>Médico ↔ Paciente:</strong> dados de agendamento são compartilhados entre o médico e o paciente para viabilizar a consulta.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span> <strong>Resend (e-mail):</strong> nome e e-mail são enviados à plataforma Resend exclusivamente para entrega de notificações transacionais. Resend não utiliza seus dados para fins próprios.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span> <strong>Stripe (pagamentos):</strong> e-mail e identificadores são enviados à Stripe para gestão de assinaturas de médicos.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span> <strong>Google (Gemini IA):</strong> mensagens do chat de agendamento são processadas pela API do Google Gemini para gerar respostas. Não são associadas a um perfil pessoal identificável.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span> <strong>Autoridades:</strong> quando exigido por lei, ordem judicial ou regulamentação aplicável.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Armazenamento e segurança</h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>Senhas são armazenadas com hash bcrypt (fator 12) — nunca em texto simples.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>Toda comunicação é protegida por HTTPS/TLS.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>O banco de dados é hospedado em infraestrutura segura com controles de acesso.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span>Acesso aos dados é restrito a sistemas automatizados e, eventualmente, à equipe técnica responsável por operação e suporte.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Retenção de dados</h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span><strong>Conta ativa:</strong> mantemos seus dados enquanto sua conta estiver ativa.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span><strong>Após exclusão:</strong> dados são removidos ou anonimizados em até 30 dias, salvo obrigação legal de retenção.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span><strong>Documentos médicos:</strong> mantidos enquanto o vínculo médico-paciente existir na plataforma.</li>
              <li className="flex gap-2"><span className="text-blue-500 dark:text-cyan-400 shrink-0">•</span><strong>Dados fiscais/financeiros:</strong> retidos pelo prazo legal exigido pela legislação tributária brasileira (5 anos).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Seus direitos (Art. 18 da LGPD)</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">Você tem os seguintes direitos sobre seus dados pessoais:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ["Confirmação e acesso", "Saber se tratamos seus dados e obter uma cópia."],
                ["Correção", "Solicitar a correção de dados incompletos ou incorretos."],
                ["Anonimização ou eliminação", "Solicitar a remoção de dados desnecessários ou tratados em desconformidade."],
                ["Portabilidade", "Receber seus dados em formato estruturado para transferência."],
                ["Revogação do consentimento", "Retirar o consentimento a qualquer momento, sem prejuízo ao tratamento anterior."],
                ["Oposição", "Opor-se ao tratamento realizado com base em legítimo interesse."],
                ["Informação sobre compartilhamento", "Saber com quais terceiros seus dados são compartilhados."],
                ["Revisão de decisões automatizadas", "Solicitar revisão de decisões tomadas exclusivamente por IA."],
              ].map(([titulo, desc]) => (
                <div key={titulo} className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800">
                  <p className="font-semibold mb-1 text-xs">{titulo}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Para exercer qualquer direito, entre em contato pelo e-mail <a href="mailto:turingdevlv@gmail.com" className="text-blue-500 dark:text-cyan-400 hover:underline">turingdevlv@gmail.com</a>. Responderemos em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Cookies</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Utilizamos apenas cookies estritamente necessários para a funcionalidade da plataforma: cookie de sessão autenticada (NextAuth.js) e cookie de preferências de tema (claro/escuro). Não utilizamos cookies de rastreamento, publicidade ou análise de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Menores de idade</h2>
            <p className="text-gray-600 dark:text-gray-400">
              O MedFast não é direcionado a menores de 18 anos. Não coletamos intencionalmente dados de crianças. Caso um responsável legal identifique que coletamos dados de um menor, solicite a exclusão pelo e-mail de privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">10. Alterações nesta política</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Podemos atualizar esta Política periodicamente. Notificaremos usuários ativos por e-mail em caso de mudanças significativas. A data da última atualização está sempre indicada no início desta página.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">11. Contato e Encarregado de Dados (DPO)</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Para dúvidas, solicitações ou reclamações relacionadas ao tratamento de dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados (DPO):<br />
              <a href="mailto:turingdevlv@gmail.com" className="text-blue-500 dark:text-cyan-400 hover:underline">turingdevlv@gmail.com</a>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              Você também pode registrar reclamações perante a <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>: <a href="https://www.gov.br/anpd" className="text-blue-500 dark:text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">www.gov.br/anpd</a>.
            </p>
          </section>

        </div>
      </main>

      <footer className="relative z-10 border-t border-gray-100 dark:border-zinc-800 py-8 px-4 mt-16">
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
