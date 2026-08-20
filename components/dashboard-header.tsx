"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LoadStatus, SourceKind } from "@/lib/types"
import { Flame, RefreshCw, Database, FlaskConical } from "lucide-react"

interface DashboardHeaderProps {
  source: SourceKind
  status: LoadStatus
  lastUpdated: Date | null
  onRefresh: () => void
  onUseMock: () => void
}

export function DashboardHeader({
  source,
  status,
  lastUpdated,
  onRefresh,
  onUseMock,
}: DashboardHeaderProps) {
  const loading = status === "loading"
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Flame className="size-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground text-balance md:text-xl">
              Painel de Processos Administrativos
            </h1>
            <p className="text-sm text-muted-foreground">
              CBMPA • Compras e Licitações — Processos 2026
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                source === "live"
                  ? "bg-status-ok text-status-ok-foreground"
                  : "bg-status-warn text-status-warn-foreground",
              )}
            >
              {source === "live" ? (
                <Database className="size-3.5" aria-hidden />
              ) : (
                <FlaskConical className="size-3.5" aria-hidden />
              )}
              {source === "live" ? "Dados reais" : "Dados de exemplo"}
            </span>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Atualizado às {lastUpdated.toLocaleTimeString("pt-BR")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {source === "live" && (
              <Button variant="outline" size="sm" onClick={onUseMock} disabled={loading}>
                <FlaskConical data-icon="inline-start" />
                Usar exemplo
              </Button>
            )}
            <Button size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw data-icon="inline-start" className={cn(loading && "animate-spin")} />
              {loading ? "Atualizando…" : "Atualizar dados"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
