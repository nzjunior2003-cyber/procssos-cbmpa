"use client"

import { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { FilterSelect, ALL_VALUE } from "@/components/filter-select"
import { uniqueValues } from "@/lib/metrics"
import { groupRito, setorAtualLabel } from "@/lib/processo-utils"
import { cn } from "@/lib/utils"
import type { Processo } from "@/lib/types"
import {
  Search,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  FilterX,
} from "lucide-react"

type SortKey = "pae" | "setorAtual" | "ritoProcessual" | "diasUltimoAndamento" | "vEstimado"
type SortDir = "asc" | "desc"

interface Filters {
  rito: string
  natureza: string
  setor: string
  fonte: string
  previsao: string
  demandante: string
}

const INITIAL_FILTERS: Filters = {
  rito: ALL_VALUE,
  natureza: ALL_VALUE,
  setor: ALL_VALUE,
  fonte: ALL_VALUE,
  previsao: ALL_VALUE,
  demandante: ALL_VALUE,
}

const PAGE_SIZE = 10

function compare(a: Processo, b: Processo, key: SortKey): number {
  switch (key) {
    case "diasUltimoAndamento":
      return (a.diasUltimoAndamento ?? -1) - (b.diasUltimoAndamento ?? -1)
    case "vEstimado":
      return (a.vEstimado ?? -1) - (b.vEstimado ?? -1)
    case "setorAtual":
      return setorAtualLabel(a.setorAtualPath).localeCompare(setorAtualLabel(b.setorAtualPath), "pt-BR")
    default:
      return String(a[key]).localeCompare(String(b[key]), "pt-BR")
  }
}

export function ProcessosTable({
  processos,
  onRowClick,
}: {
  processos: Processo[]
  onRowClick: (processo: Processo) => void
}) {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const [sortKey, setSortKey] = useState<SortKey>("diasUltimoAndamento")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(0)

  const options = useMemo(
    () => ({
      rito: uniqueValues(processos, (p) => groupRito(p.ritoProcessual)),
      natureza: uniqueValues(processos, (p) => p.naturezaDespesa),
      setor: uniqueValues(processos, (p) => setorAtualLabel(p.setorAtualPath)),
      fonte: uniqueValues(processos, (p) => p.fonte),
      previsao: uniqueValues(processos, (p) => p.previsaoPca),
      demandante: uniqueValues(processos, (p) => p.setorDemandante),
    }),
    [processos],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const result = processos.filter((p) => {
      if (q) {
        const haystack = `${p.pae} ${p.objeto} ${p.setorDemandante} ${p.naturezaDespesa} ${p.ritoProcessual} ${p.setorAtualPath.join(" ")}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.rito !== ALL_VALUE && groupRito(p.ritoProcessual) !== filters.rito) return false
      if (filters.natureza !== ALL_VALUE && p.naturezaDespesa !== filters.natureza) return false
      if (filters.setor !== ALL_VALUE && setorAtualLabel(p.setorAtualPath) !== filters.setor) return false
      if (filters.fonte !== ALL_VALUE && p.fonte !== filters.fonte) return false
      if (filters.previsao !== ALL_VALUE && p.previsaoPca !== filters.previsao) return false
      if (filters.demandante !== ALL_VALUE && p.setorDemandante !== filters.demandante) return false
      return true
    })
    result.sort((a, b) => {
      const cmp = compare(a, b, sortKey)
      return sortDir === "asc" ? cmp : -cmp
    })
    return result
  }, [processos, search, filters, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const pageItems = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  const activeFilters =
    search.trim() !== "" || Object.values(filters).some((v) => v !== ALL_VALUE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "diasUltimoAndamento" || key === "vEstimado" ? "desc" : "asc")
    }
    setPage(0)
  }

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(0)
  }

  function resetFilters() {
    setSearch("")
    setFilters(INITIAL_FILTERS)
    setPage(0)
  }

  return (
    <Card className="gap-4 p-4">
      {/* Busca */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            placeholder="Buscar por N° PAE, objeto, setor demandante, setor atual, natureza ou rito…"
            className="pl-8"
            aria-label="Buscar processos"
          />
        </div>
        {activeFilters && (
          <Button variant="outline" size="sm" onClick={resetFilters} className="lg:w-auto">
            <FilterX data-icon="inline-start" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        <FilterSelect
          label="Rito"
          value={filters.rito}
          options={options.rito}
          onValueChange={(v) => updateFilter("rito", v)}
        />
        <FilterSelect
          label="Natureza"
          value={filters.natureza}
          options={options.natureza}
          onValueChange={(v) => updateFilter("natureza", v)}
        />
        <FilterSelect
          label="Setor Atual"
          value={filters.setor}
          options={options.setor}
          onValueChange={(v) => updateFilter("setor", v)}
        />
        <FilterSelect
          label="Fonte"
          value={filters.fonte}
          options={options.fonte}
          onValueChange={(v) => updateFilter("fonte", v)}
        />
        <FilterSelect
          label="Previsão PCA"
          value={filters.previsao}
          options={options.previsao}
          onValueChange={(v) => updateFilter("previsao", v)}
        />
        <FilterSelect
          label="Demandante"
          value={filters.demandante}
          options={options.demandante}
          onValueChange={(v) => updateFilter("demandante", v)}
        />
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <SortHeader label="N° PAE" active={sortKey === "pae"} dir={sortDir} onClick={() => toggleSort("pae")} />
              <TableHead className="min-w-[240px]">Objeto</TableHead>
              <SortHeader
                label="Setor Atual"
                active={sortKey === "setorAtual"}
                dir={sortDir}
                onClick={() => toggleSort("setorAtual")}
              />
              <SortHeader
                label="Rito"
                active={sortKey === "ritoProcessual"}
                dir={sortDir}
                onClick={() => toggleSort("ritoProcessual")}
              />
              <SortHeader
                label="Dias parado"
                active={sortKey === "diasUltimoAndamento"}
                dir={sortDir}
                onClick={() => toggleSort("diasUltimoAndamento")}
                align="right"
              />
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Nenhum processo encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((p) => (
                <TableRow
                  key={p.pae || p.objeto}
                  onClick={() => onRowClick(p)}
                  className="cursor-pointer"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onRowClick(p)
                    }
                  }}
                >
                  <TableCell className="font-mono text-xs whitespace-nowrap">{p.pae || "—"}</TableCell>
                  <TableCell className="max-w-[320px]">
                    <span className="line-clamp-2 text-pretty">{p.objeto || "—"}</span>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {setorAtualLabel(p.setorAtualPath) || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{p.ritoProcessual || "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.diasUltimoAndamento ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          {filtered.length} processo(s) • página {currentPage + 1} de {pageCount}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft data-icon="inline-start" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={currentPage >= pageCount - 1}
          >
            Próxima
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
  align?: "left" | "right"
}) {
  return (
    <TableHead className={cn(align === "right" && "text-right")}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 rounded-sm font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ArrowUp className="size-3.5" aria-hidden />
          ) : (
            <ArrowDown className="size-3.5" aria-hidden />
          )
        ) : (
          <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden />
        )}
      </button>
    </TableHead>
  )
}
