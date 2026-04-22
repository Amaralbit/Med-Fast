"use client"

import { useActionState } from "react"
import type { DoctorProfile } from "@prisma/client"
import { saveProfile } from "@/app/actions/doctor"

const DURATIONS = [15, 20, 30, 45, 60, 90, 120]

export function ProfileForm({ profile }: { profile: DoctorProfile }) {
  const [state, action, pending] = useActionState(saveProfile, {})

  return (
    <form action={action} className="space-y-8">

      {/* Dados profissionais */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Dados Profissionais</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Especialidade *
            </label>
            <input
              name="specialty"
              defaultValue={profile.specialty ?? ""}
              required
              placeholder="Ex: Clínica Geral, Cardiologia..."
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CRM
            </label>
            <input
              name="crm"
              defaultValue={profile.crm ?? ""}
              placeholder="Ex: CRM/SP 123456"
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio / Apresentação
          </label>
          <textarea
            name="bio"
            defaultValue={profile.bio ?? ""}
            rows={4}
            placeholder="Fale sobre sua experiência, formação e abordagem..."
            className="input resize-none"
          />
        </div>
      </section>

      {/* Contato e atendimento */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Contato e Atendimento</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              WhatsApp
            </label>
            <input
              name="whatsapp"
              defaultValue={profile.whatsapp ?? ""}
              placeholder="5511999999999"
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1">Formato internacional sem símbolos</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Preço (consulta particular)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
              <input
                name="pricePrivate"
                type="number"
                min="0"
                step="0.01"
                defaultValue={profile.pricePrivate?.toString() ?? ""}
                placeholder="0,00"
                className="input pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duração da consulta
            </label>
            <select name="consultationDurationMinutes" defaultValue={profile.consultationDurationMinutes} className="input">
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d < 60 ? `${d} minutos` : `${d / 60}h`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Endereço */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Endereço do Consultório</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rua / Logradouro</label>
          <input name="addressStreet" defaultValue={profile.addressStreet ?? ""} placeholder="Rua das Flores, 123" className="input" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cidade</label>
            <input name="addressCity" defaultValue={profile.addressCity ?? ""} placeholder="São Paulo" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <input name="addressState" defaultValue={profile.addressState ?? ""} placeholder="SP" maxLength={2} className="input uppercase" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CEP</label>
            <input name="addressZip" defaultValue={profile.addressZip ?? ""} placeholder="00000-000" className="input" />
          </div>
        </div>
      </section>

      {/* Personalização */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Personalização da Página</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor Principal</label>
            <div className="flex items-center gap-3">
              <input type="color" name="colorPrimary" defaultValue={profile.colorPrimary} className="h-10 w-14 rounded cursor-pointer border border-gray-200 dark:border-zinc-700" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Botões e destaques</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor Secundária</label>
            <div className="flex items-center gap-3">
              <input type="color" name="colorAccent" defaultValue={profile.colorAccent} className="h-10 w-14 rounded cursor-pointer border border-gray-200 dark:border-zinc-700" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Acentos e links</span>
            </div>
          </div>
        </div>
      </section>

      {/* Publicar */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Visibilidade</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Ative para aparecer na busca de pacientes
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isPublished"
              value="true"
              defaultChecked={profile.isPublished}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 dark:peer-checked:bg-cyan-500" />
          </label>
        </div>
      </section>

      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-500">Perfil salvo com sucesso!</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-xl bg-blue-500 dark:bg-cyan-500 hover:bg-blue-600 dark:hover:bg-cyan-600 text-white font-medium transition-colors disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar Perfil"}
      </button>
    </form>
  )
}
