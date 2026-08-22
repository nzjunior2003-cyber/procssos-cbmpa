import { COLUMNS, type Processo, type RawRow, type StatusKey } from "./types"

/**
 * Converte um valor monetário em texto brasileiro para número.
 * Aceita "R$ 1.234,56", "1.234,56", "---", "-", "" etc.
 * Retorna null quando ausente/invalido (nunca quebra).
 */
export function parseMoney(input: string | undefined | null): number | null {
  if (input == null) return null
  const cleaned = input
    .replace(/r\$/i, "")
    .replace(/\s/g, "")
    .trim()
  if (!cleaned || /^-+%?$/.test(cleaned) || cleaned === "---") return null
  // Remove separador de milhar (.) e troca decimal (,) por ponto.
  const normalized = cleaned.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")
  if (!normalized || normalized === "-") return null
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

/**
 * Converte "75%" -> 75, "-%" / vazio -> null.
 */
export function parsePercent(input: string | undefined | null): number | null {
  if (input == null) return null
  const cleaned = input.replace("%", "").replace(",", ".").trim()
  if (!cleaned || cleaned === "-") return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

/**
 * Converte "DD/MM/AAAA" para Date. Datas incompletas ("19/08" sem ano)
 * ou invalidas retornam null silenciosamente.
 */
export function parseDateBR(input: string | undefined | null): Date | null {
  if (input == null) return null
  const cleaned = input.trim()
  const parts = cleaned.split("/")
  if (parts.length !== 3) return null
  const [d, m, y] = parts.map((p) => Number(p))
  if (!d || !m || !y) return null
  const year = y < 100 ? 2000 + y : y
  const date = new Date(year, m - 1, d)
  if (Number.isNaN(date.getTime())) return null
  return date
}

/** Converte inteiro em texto -> number | null. */
export function parseInteger(input: string | undefined | null): number | null {
  if (input == null) return null
  const cleaned = input.replace(/[^\d-]/g, "").trim()
  if (!cleaned || cleaned === "-") return null
  const value = Number.parseInt(cleaned, 10)
  return Number.isFinite(value) ? value : null
}

/** "8 PAGAMENTO" -> { ordem: 8, label: "PAGAMENTO" } */
export function parseSubfase(input: string | undefined | null): {
  ordem: number | null
  label: string
} {
  const raw = (input ?? "").trim()
  if (!raw) return { ordem: null, label: "" }
  const match = raw.match(/^(\d+)\s*(.*)$/)
  if (match) {
    return { ordem: Number(match[1]), label: match[2].trim() || raw }
  }
  return { ordem: null, label: raw }
}

/**
 * Verdadeiro quando a subfase do processo (coluna Q da planilha) for "CONTRATADO".
 * Usado para o KPI/filtro "Contratado/Aditivado".
 */
export function isContratadoAditivado(p: { subfaseLabel: string }): boolean {
  return (p.subfaseLabel ?? "").trim().toUpperCase() === "CONTRATADO"
}

/**
 * Verdadeiro quando a coluna Y (PREVISÃO NO PCA) estiver marcada como "SIM".
 */
export function isPrevistoPca(p: { previsaoPca: string }): boolean {
  return (p.previsaoPca ?? "").trim().toUpperCase() === "SIM"
}

/** "CBM > SETOR > LOCAL" -> ["CBM", "SETOR", "LOCAL"] */
export function parseSetorPath(input: string | undefined | null): string[] {
  if (!input) return []
  return input
    .split(">")
    .map((s) => s.trim())
    .filter(Boolean)
}

const norm = (s: string) => (s ?? "").trim().toUpperCase()

const RITO_GROUPS: Record<string, string> = {
  "DISPENSA": "DISPENSA",
  "DISPENSA POR VALOR": "DISPENSA",
  "DISPENSA POR VALOR IRRISÓRIO": "DISPENSA",
  "ACRÉSCIMO": "ADITIVOS",
  "REAJUSTE": "ADITIVOS",
  "PRORROGAÇÃO": "ADITIVOS",
  "ACRÉSCIMO E PRORROGAÇÃO": "ADITIVOS",
  "INEXIGIBILIDADE": "INEXIGIBILIDADE",
  "INEXIGIBILIDADE (P/ CURSO)": "INEXIGIBILIDADE",
}

/**
 * Agrupa ritos processuais correlatos (dispensas, aditivos, inexigibilidades)
 * em categorias únicas. Ritos fora do mapa mantêm o valor original.
 * PREGÃO ELETRÔNICO / PREGÃO ELETRÔNICO PARA REGISTRO DE PREÇOS e
 * ADESÃO À ATA / GERENCIADOR DA ATA / PARTICIPAÇÃO EM ATA ficam separados.
 */
export function groupRito(rito: string | undefined | null): string {
  const r = norm(rito ?? "")
  if (!r) return ""
  return RITO_GROUPS[r] ?? (rito ?? "").trim()
}

/** Rótulo curto do setor atual: segundo segmento de "CBM > SETOR > LOCAL". */
export function setorAtualLabel(path: string[]): string {
  if (path.length >= 2) return path[1]
  if (path.length === 1) return path[0]
  return ""
}

/** Deriva o status colorido a partir do andamento e dias parado. */
export function deriveStatus(andamento: string, dias: number | null): StatusKey {
  const a = norm(andamento)
  if (a === "FINALIZADO") return "finalizado"
  if (a === "ARQUIVADO") return "arquivado"
  if (dias != null && dias > 30) return "atrasado"
  if (dias != null && dias >= 15 && dias <= 30) return "atencao"
  return "andamento"
}

/** Verdadeiro se a linha inteira estiver vazia. */
function isEmptyRow(row: RawRow): boolean {
  return Object.values(row).every((v) => !v || String(v).trim() === "")
}

/** Normaliza uma linha bruta em um Processo. */
export function normalizeRow(row: RawRow): Processo | null {
  if (isEmptyRow(row)) return null

  const pae = (row[COLUMNS.pae] ?? "").trim()
  const objeto = (row[COLUMNS.objeto] ?? "").trim()
  // Ignora linhas sem identificador nem objeto (ruido de rodape/cabecalho).
  if (!pae && !objeto) return null

  const andamento = (row[COLUMNS.andamento] ?? "").trim()
  const dias = parseInteger(row[COLUMNS.diasUltimoAndamento])
  const { ordem, label } = parseSubfase(row[COLUMNS.subfaseProcesso])
  const status = deriveStatus(andamento, dias)

  return {
    pae,
    objeto,
    taxaProg: parsePercent(row[COLUMNS.taxaProg]),
    observacao: (row[COLUMNS.observacao] ?? "").trim(),
    setorDemandante: (row[COLUMNS.setorDemandante] ?? "").trim(),
    naturezaDespesa: (row[COLUMNS.naturezaDespesa] ?? "").trim(),
    fonte: (row[COLUMNS.fonte] ?? "").trim(),
    vPca: parseMoney(row[COLUMNS.vPca]),
    vEstimado: parseMoney(row[COLUMNS.vEstimado]),
    vHomologado: parseMoney(row[COLUMNS.vHomologado]),
    vExecutado: parseMoney(row[COLUMNS.vExecutado]),
    ritoProcessual: (row[COLUMNS.ritoProcessual] ?? "").trim(),
    faseProcesso: (row[COLUMNS.faseProcesso] ?? "").trim(),
    subfaseOrdem: ordem,
    subfaseLabel: label,
    subfaseRaw: (row[COLUMNS.subfaseProcesso] ?? "").trim(),
    setorAtualPath: parseSetorPath(row[COLUMNS.setorAtual]),
    andamento,
    ultimaTramitacao: parseDateBR(row[COLUMNS.ultimaTramitacao]),
    ultimaTramitacaoRaw: (row[COLUMNS.ultimaTramitacao] ?? "").trim(),
    diasUltimoAndamento: dias,
    dataEntrada: parseDateBR(row[COLUMNS.dataEntrada]),
    dataEntradaRaw: (row[COLUMNS.dataEntrada] ?? "").trim(),
    tempoTotalDias: parseInteger(row[COLUMNS.tempoTotalDias]),
    previsaoPca: (row[COLUMNS.previsaoPca] ?? "").trim(),
    status,
    arquivado: status === "arquivado",
    finalizado: status === "finalizado",
  }
}

export function normalizeRows(rows: RawRow[]): Processo[] {
  return rows.map(normalizeRow).filter((p): p is Processo => p !== null)
}

/** Formata número para moeda brasileira. Null -> "—". */
export function formatBRL(value: number | null): string {
  if (value == null) return "—"
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Formato compacto para KPIs (ex: R$ 1,2 mi). */
export function formatBRLCompact(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  })
}

/** Formata Date para DD/MM/AAAA. Null -> valor bruto (fallback) ou "—". */
export function formatDateBR(date: Date | null, fallback = "—"): string {
  if (!date) return fallback
  return date.toLocaleDateString("pt-BR")
}
