"use client"

import { useMemo, useState } from "react"
import { useProcessos } from "@/hooks/use-processos"
import { computeKpis } from "@/lib/metrics"
import { isContratadoAditivado } from "@/lib/processo-utils"
import type { Processo } from "@/lib/types"
import { DashboardHeader } from "@/components/dashboard-header"
import { KpiCards } from "@/components/kpi-cards"
import { DashboardCharts } from "@/components/dashboard-charts"
import { ProcessosTable } from "@/components/processos-table"
import { ProcessoDetailSheet } from "@/components/processo-detail-sheet"
import { ContentSkeleton } from "@/components/dashboard-skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TriangleAlert, RotateCw, X } from "lucide-react"

export default function Page() {
  const { processos, source, status, error, lastUpdated, refresh } = useProcessos()
  const [selected, setSelected] = useState<Processo | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [contratadoFilterActive, setContratadoFilterActive] = useState(false)

  const kpis = useMemo(() => computeKpis(processos), [processos])
  const loading = status === "loading"

  const processosDaTabela = useMemo(
    () => (contratadoFilterActive ? processos.filter(isContratadoAditivado) : processos),
    [processos, contratadoFilterActive],
  )

  function handleRowClick(processo: Processo) {
    setSelected(processo)
    setSheetOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        source={source}
        status={status}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />

      <main className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-5 md:px-6">
        {source === "mock" && status !== "loading" && (
          <Alert>
            <TriangleAlert />
            <AlertTitle>Exibindo dados de exemplo</AlertTitle>
            <AlertDescription>
              O layout está sendo validado com dados fictícios. Clique em{" "}
              <strong>Atualizar dados</strong> para carregar a planilha real do Google Sheets.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Não foi possível carregar os dados</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
              <span>{error}</span>
              <Button size="sm" variant="outline" onClick={refresh}>
                <RotateCw data-icon="inline-start" />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <KpiCards
          kpis={kpis}
          loading={loading}
          contratadoFilterActive={contratadoFilterActive}
          onToggleContratadoFilter={() => setContratadoFilterActive((v) => !v)}
        />

        {loading ? (
          <ContentSkeleton />
        ) : (
          <>
            {contratadoFilterActive && (
              <Alert>
                <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Mostrando apenas processos <strong>Contratado/Aditivado</strong> (
                    {processosDaTabela.length} de {processos.length}).
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setContratadoFilterActive(false)}
                  >
                    <X data-icon="inline-start" />
                    Limpar filtro
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <ProcessosTable processos={processosDaTabela} onRowClick={handleRowClick} />
            <DashboardCharts processos={processos} />
          </>
        )}
      </main>

      <ProcessoDetailSheet processo={selected} open={sheetOpen} onOpenChange={setSheetOpen} />

      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-[1400px] px-4 text-center text-xs text-muted-foreground md:px-6">
          <p>Corpo de Bombeiros Militar do Pará</p>
          <p>Departamento Geral de Administração</p>
          <p>Diretoria de Apoio Logístico</p>
        </div>
      </footer>
    </div>
  )
}
