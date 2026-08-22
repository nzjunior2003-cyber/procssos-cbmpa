// Cabeçalhos exatos da planilha do Google Sheets.
export const COLUMNS = {
  pae: "N° PAE",
  objeto: "OBJETO",
  taxaProg: "TAXA DE PROG.",
  observacao: "OBSERVAÇÃO",
  setorDemandante: "SETOR DEMANDANTE",
  naturezaDespesa: "NATUREZA DE DESPESA",
  fonte: "FONTE",
  vPca: "V. PCA",
  vEstimado: "V. ESTIMADO",
  vHomologado: "V. HOMOLOGADO",
  vExecutado: "V. EXECUTADO",
  ritoProcessual: "RITO PROCESSUAL",
  faseProcesso: "FASE DO PROCESSO",
  subfaseProcesso: "SUBFASE DO PROCESSO",
  setorAtual: "SETOR ATUAL",
  andamento: "ANDAMENTO",
  ultimaTramitacao: "ÚLTIMA TRAMITAÇÃO",
  diasUltimoAndamento: "DIAS NO ÚLTIMO ANDAMENTO",
  dataEntrada: "DATA DE ENTRADA",
  tempoTotalDias: "TEMPO_TOTAL_DIAS",
  previsaoPca: "PREVISÃO NO PCA",
} as const

// Linha bruta da planilha (chaves = cabeçalhos originais).
export type RawRow = Record<string, string>

export type StatusKey = "finalizado" | "arquivado" | "contratado" | "atrasado" | "atencao" | "andamento"

// Processo normalizado, pronto para consumo pela UI.
export interface Processo {
  pae: string
  objeto: string
  taxaProg: number | null
  observacao: string
  setorDemandante: string
  naturezaDespesa: string
  fonte: string
  vPca: number | null
  vEstimado: number | null
  vHomologado: number | null
  vExecutado: number | null
  ritoProcessual: string
  faseProcesso: string
  subfaseOrdem: number | null
  subfaseLabel: string
  subfaseRaw: string
  setorAtualPath: string[]
  andamento: string
  ultimaTramitacao: Date | null
  ultimaTramitacaoRaw: string
  diasUltimoAndamento: number | null
  dataEntrada: Date | null
  dataEntradaRaw: string
  tempoTotalDias: number | null
  previsaoPca: string
  status: StatusKey
  arquivado: boolean
  finalizado: boolean
}

export type SourceKind = "mock" | "live"
export type LoadStatus = "idle" | "loading" | "error"
