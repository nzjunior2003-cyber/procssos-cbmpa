"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LoadStatus, SourceKind } from "@/lib/types"
import { RefreshCw, Database, FlaskConical } from "lucide-react"

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

interface DashboardHeaderProps {
  source: SourceKind
  status: LoadStatus
  lastUpdated: Date | null
  onRefresh: () => void
}

export function DashboardHeader({
  source,
  status,
  lastUpdated,
  onRefresh,
}: DashboardHeaderProps) {
  const loading = status === "loading"
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE_PATH}/dal-badge.png`}
            alt="Brasão da Seção de Apoio e Suprimento - DAL"
            className="h-16 w-auto shrink-0"
          />
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
