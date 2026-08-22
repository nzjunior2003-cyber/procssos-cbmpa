import { groupRito, setorAtualLabel, isContratadoAditivado, isPrevistoPca } from "./processo-utils"
import type { Processo } from "./types"

export interface Kpis {
  total: number
  ativos: number
  emAndamento: number
  finalizados: number
  arquivados: number
  parados30: number
  somaEstimadoAtivos: number
  semPrevisaoPca: number
  contratadosAditivados: number
  previstosPca: number
}

/** Processo "ativo" = nem finalizado nem arquivado. */
export function isAtivo(p: Processo): boolean {
  return !p.finalizado && !p.arquivado
}

export function computeKpis(processos: Processo[]): Kpis {
  const ativos = processos.filter(isAtivo)
  return {
    total: processos.length,
    ativos: ativos.length,
    emAndamento: ativos.length,
    finalizados: processos.filter((p) => p.finalizado).length,
    arquivados: processos.filter((p) => p.arquivado).length,
    parados30: processos.filter(
      (p) => isAtivo(p) && p.diasUltimoAndamento != null && p.diasUltimoAndamento > 30,
    ).length,
    somaEstimadoAtivos: ativos.reduce((acc, p) => acc + (p.vEstimado ?? 0), 0),
    semPrevisaoPca: processos.filter((p) => p.previsaoPca.trim().toUpperCase() === "NÃO").length,
    contratadosAditivados: processos.filter(isContratadoAditivado).length,
    previstosPca: processos.filter(isPrevistoPca).length,
  }
}

export interface CountItem {
  label: string
  value: number
}

function tally(processos: Processo[], key: (p: Processo) => string): CountItem[] {
  const map = new Map<string, number>()
  for (const p of processos) {
    const label = key(p).trim() || "(não informado)"
    map.set(label, (map.get(label) ?? 0) + 1)
  }
  return Array.from(map, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

/** Top N setores demandantes por quantidade. */
export function countBySetor(processos: Processo[], top = 10): CountItem[] {
  return tally(processos, (p) => p.setorDemandante).slice(0, top)
}

/** Garante que "(não informado)" sempre apareça por último, independente da contagem. */
function withUnknownLast(items: CountItem[]): CountItem[] {
  return [...items].sort((a, b) => {
    if (a.label === "(não informado)") return 1
    if (b.label === "(não informado)") return -1
    return b.value - a.value
  })
}

/**
 * Distribuição por rito processual, agrupando categorias correlatas
 * (dispensas, aditivos, inexigibilidades) — ver groupRito().
 */
export function countByRito(processos: Processo[]): CountItem[] {
  return withUnknownLast(tally(processos, (p) => groupRito(p.ritoProcessual)))
}

/** Top N setores atuais (onde o processo está tramitando) por quantidade. */
export function countBySetorAtual(processos: Processo[], top = 10): CountItem[] {
  return tally(processos, (p) => setorAtualLabel(p.setorAtualPath)).slice(0, top)
}

/** Soma de V. ESTIMADO por natureza de despesa. */
export function sumEstimadoByNatureza(processos: Processo[]): CountItem[] {
  const map = new Map<string, number>()
  for (const p of processos) {
    const label = p.naturezaDespesa.trim() || "(não informado)"
    map.set(label, (map.get(label) ?? 0) + (p.vEstimado ?? 0))
  }
  return Array.from(map, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

/** Extrai valores únicos de um campo para popular filtros. */
export function uniqueValues(processos: Processo[], key: (p: Processo) => string): string[] {
  const set = new Set<string>()
  for (const p of processos) {
    const v = key(p).trim()
    if (v) set.add(v)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"))
}
