"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatBRLCompact } from "@/lib/processo-utils"
import type { Kpis } from "@/lib/metrics"
import {
  Activity,
  CheckCircle2,
  Archive,
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
}

const TONES: Record<KpiDef["tone"], string> = {
  neutral: "bg-secondary text-secondary-foreground",
  info: "bg-status-progress text-status-progress-foreground",
  ok: "bg-status-ok text-status-ok-foreground",
  muted: "bg-status-archived text-status-archived-foreground",
  danger: "bg-status-late text-status-late-foreground",
  warn: "bg-status-warn text-status-warn-foreground",
}

export function KpiCards({ kpis, loading }: { kpis: Kpis; loading: boolean }) {
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
      key: "finalizados",
      label: "Finalizados",
      value: String(kpis.finalizados),
      hint: `${kpis.arquivados} arquivados`,
      icon: CheckCircle2,
      tone: "ok",
    },
    {
      key: "arquivados",
      label: "Arquivados",
      value: String(kpis.arquivados),
      icon: Archive,
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
        {cards.map((c) => (
          <Card key={c.key} className="gap-0 py-0">
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
          </Card>
        ))}
      </div>
    </section>
  )
}
