"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/status-badge"
import { formatBRL, formatDateBR } from "@/lib/processo-utils"
import type { Processo } from "@/lib/types"
import { ChevronRight } from "lucide-react"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children || "—"}</dd>
    </div>
  )
}

function Money({ value }: { value: number | null }) {
  return <span className="tabular-nums">{formatBRL(value)}</span>
}

export function ProcessoDetailSheet({
  processo,
  open,
  onOpenChange,
}: {
  processo: Processo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {processo && (
          <>
            <SheetHeader className="gap-2 border-b border-border">
              <div className="flex items-center gap-2">
                <StatusBadge status={processo.status} />
                {processo.taxaProg != null && (
                  <span className="text-xs text-muted-foreground">
                    Progresso {processo.taxaProg}%
                  </span>
                )}
              </div>
              <SheetTitle className="font-mono text-base">{processo.pae || "—"}</SheetTitle>
              <SheetDescription className="text-pretty leading-relaxed">
                {processo.objeto || "Sem descrição"}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 p-4">
              {/* Localização atual como breadcrumb */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Setor atual</span>
                {processo.setorAtualPath.length > 0 ? (
                  <nav
                    aria-label="Caminho do setor atual"
                    className="flex flex-wrap items-center gap-1 rounded-lg bg-muted px-2.5 py-2"
                  >
                    {processo.setorAtualPath.map((seg, i) => (
                      <span key={`${seg}-${i}`} className="flex items-center gap-1">
                        {i > 0 && (
                          <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
                        )}
                        <span
                          className={
                            i === processo.setorAtualPath.length - 1
                              ? "text-sm font-medium text-foreground"
                              : "text-sm text-muted-foreground"
                          }
                        >
                          {seg}
                        </span>
                      </span>
                    ))}
                  </nav>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Field label="Andamento">{processo.andamento}</Field>
                <Field label="Dias no andamento">
                  {processo.diasUltimoAndamento != null ? (
                    <span className="tabular-nums">{processo.diasUltimoAndamento} dias</span>
                  ) : (
                    "—"
                  )}
                </Field>
                <Field label="Setor demandante">{processo.setorDemandante}</Field>
                <Field label="Natureza de despesa">{processo.naturezaDespesa}</Field>
                <Field label="Rito processual">{processo.ritoProcessual}</Field>
                <Field label="Fonte">{processo.fonte}</Field>
                <Field label="Previsão no PCA">{processo.previsaoPca}</Field>
                <Field label="Taxa de progresso">
                  {processo.taxaProg != null ? `${processo.taxaProg}%` : "—"}
                </Field>
              </dl>

              <Separator />

              <div>
                <span className="text-xs font-medium text-muted-foreground">Valores</span>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-4">
                  <Field label="V. PCA">
                    <Money value={processo.vPca} />
                  </Field>
                  <Field label="V. Estimado">
                    <Money value={processo.vEstimado} />
                  </Field>
                  <Field label="V. Homologado">
                    <Money value={processo.vHomologado} />
                  </Field>
                  <Field label="V. Executado">
                    <Money value={processo.vExecutado} />
                  </Field>
                </dl>
              </div>

              <Separator />

              <div>
                <span className="text-xs font-medium text-muted-foreground">Datas</span>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-4">
                  <Field label="Data de entrada">
                    {formatDateBR(processo.dataEntrada, processo.dataEntradaRaw || "—")}
                  </Field>
                  <Field label="Última tramitação">
                    {formatDateBR(processo.ultimaTramitacao, processo.ultimaTramitacaoRaw || "—")}
                  </Field>
                  <Field label="Tempo total">
                    {processo.tempoTotalDias != null ? `${processo.tempoTotalDias} dias` : "—"}
                  </Field>
                </dl>
              </div>

              <Separator />

              <Field label="Observação">
                <p className="text-pretty leading-relaxed whitespace-pre-wrap">
                  {processo.observacao || "—"}
                </p>
              </Field>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
