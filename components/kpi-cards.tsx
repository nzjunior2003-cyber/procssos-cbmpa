"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatBRLCompact } from "@/lib/processo-utils"
import type { Kpis } from "@/lib/metrics"
import {
  Activity,
  FileCheck2,
  CalendarCheck2,
  AlarmClock,
  Wallet,
  TriangleAlert,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface KpiDef {
  key: string
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone: "neutral" | "info" | "ok" | "muted" | "danger" | "warn"
  clickable?: boolean
}

const TONES: Record<KpiDef["tone"], string> = {
  neutral: "bg-secondary text-secondary-foreground",
  info: "bg-status-progress text-status-progress-foreground",
  ok: "bg-status-ok text-status-ok-foreground",
  muted: "bg-status-archived text-status-archived-foreground",
  danger: "bg-status-late text-status-late-foreground",
  warn: "bg-status-warn text-status-warn-foreground",
}

interface KpiCardsProps {
  kpis: Kpis
  loading: boolean
  contratadoFilterActive: boolean
  onToggleContratadoFilter: () => void
}

export function KpiCards({
  kpis,
  loading,
  contratadoFilterActive,
  onToggleContratadoFilter,
}: KpiCardsProps) {
  const cards: KpiDef[] = [
    {
      key: "ativos",
      label: "Processos ativos",
      value: String(kpis.ativos),
      hint: `${kpis.total} no total`,
      icon: Activity,
      tone: "info",
    },
    {
      key: "contratado",
      label: "Contratado/Aditivado",
      value: String(kpis.contratadosAditivados),
      hint: "clique para filtrar a lista",
      icon: FileCheck2,
      tone: "ok",
      clickable: true,
    },
    {
      key: "previstoPca",
      label: "Previstos no PCA",
      value: String(kpis.previstosPca),
      icon: CalendarCheck2,
      tone: "muted",
    },
    {
      key: "parados",
      label: "Parados +30 dias",
      value: String(kpis.parados30),
      hint: "no mesmo andamento",
      icon: AlarmClock,
      tone: "danger",
    },
    {
      key: "estimado",
      label: "V. estimado (ativos)",
      value: formatBRLCompact(kpis.somaEstimadoAtivos),
      hint: "soma dos ativos",
      icon: Wallet,
      tone: "neutral",
    },
    {
      key: "semPca",
      label: "Sem previsão no PCA",
      value: String(kpis.semPrevisaoPca),
      hint: "requer atenção",
      icon: TriangleAlert,
      tone: "warn",
    },
  ]

  return (
    <section aria-label="Indicadores principais">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => {
          const isActive = c.key === "contratado" && contratadoFilterActive
          const content = (
            <>
              <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 pt-4 pb-0">
                <CardTitle className="text-xs font-medium text-muted-foreground text-pretty">
                  {c.label}
                </CardTitle>
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg",
                    TONES[c.tone],
                  )}
                >
                  <c.icon className="size-4" aria-hidden />
                </span>
              </CardHeader>
              <CardContent className="px-4 pt-1 pb-4">
                {loading ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <div className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {c.value}
                  </div>
                )}
                {c.hint && <p className="mt-0.5 text-xs text-muted-foreground">{c.hint}</p>}
              </CardContent>
            </>
          )

          if (c.clickable) {
            return (
              <Card
                key={c.key}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                onClick={onToggleContratadoFilter}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onToggleContratadoFilter()
                  }
                }}
                className={cn(
                  "gap-0 py-0 cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "ring-2 ring-primary",
                )}
              >
                {content}
              </Card>
            )
          }

          return (
            <Card key={c.key} className="gap-0 py-0">
              {content}
            </Card>
          )
        })}
      </div>
    </section>
  )
}
