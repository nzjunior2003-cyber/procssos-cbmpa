import type { Processo } from "./types"
import { formatBRL, groupRito, setorAtualLabel } from "./processo-utils"
import { isAtivo } from "./metrics"

export interface Insight {
  id: string
  tone: "info" | "warn" | "danger" | "ok"
  text: string
}

const SEM_INFO = "(não informado)"

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

/**
 * Gera insights automáticos (baseados em regras, sem IA) sobre os processos
 * ativos. Cada regra só aparece quando há dado suficiente para ser relevante.
 */
export function computeInsights(processos: Processo[]): Insight[] {
  const insights: Insight[] = []
  const ativos = processos.filter(isAtivo)
  if (ativos.length === 0) return insights

  const atrasados = ativos.filter((p) => p.status === "atrasado")

  // 1. Setor atual que mais concentra processos atrasados (+30 dias).
  if (atrasados.length > 0) {
    const porSetor = new Map<string, number>()
    for (const p of atrasados) {
      const setor = setorAtualLabel(p.setorAtualPath) || SEM_INFO
      porSetor.set(setor, (porSetor.get(setor) ?? 0) + 1)
    }
    const [setor, qtd] = [...porSetor.entries()].sort((a, b) => b[1] - a[1])[0]
    // Só vale como "concentração" quando o setor tem pelo menos 2 processos.
    if (qtd >= 2) {
      insights.push({
        id: "setor-atrasados",
        tone: "danger",
        text: `${setor} concentra ${qtd} dos ${atrasados.length} processos atrasados (+30 dias no mesmo setor).`,
      })
    }
  }

  // 2. Processo ativo parado há mais tempo no setor atual (exclui contratados).
  const candidatosParados = ativos.filter(
    (p) => p.status !== "contratado" && p.diasUltimoAndamento != null,
  )
  if (candidatosParados.length > 0) {
    const maisAntigo = [...candidatosParados].sort(
      (a, b) => (b.diasUltimoAndamento ?? 0) - (a.diasUltimoAndamento ?? 0),
    )[0]
    const dias = maisAntigo.diasUltimoAndamento ?? 0
    if (dias > 30) {
      const setor = setorAtualLabel(maisAntigo.setorAtualPath) || SEM_INFO
      insights.push({
        id: "mais-antigo-parado",
        tone: "danger",
        text: `Processo parado há mais tempo: ${maisAntigo.pae} (${truncate(maisAntigo.objeto, 60)}) — ${dias} dias em ${setor}.`,
      })
    }
  }

  // 3. Valor estimado em processos atrasados.
  const valorAtivos = ativos.reduce((acc, p) => acc + (p.vEstimado ?? 0), 0)
  const valorAtrasados = atrasados.reduce((acc, p) => acc + (p.vEstimado ?? 0), 0)
  if (atrasados.length > 0 && valorAtrasados > 0 && valorAtivos > 0) {
    const pct = (valorAtrasados / valorAtivos) * 100
    insights.push({
      id: "valor-atrasado",
      tone: "warn",
      text: `${formatBRL(valorAtrasados)} (${pct.toFixed(0)}% do valor estimado dos processos ativos) está em processos atrasados.`,
    })
  }

  // 4. Rito com maior tempo médio total (mínimo de 3 processos para evitar ruído).
  const porRito = new Map<string, number[]>()
  for (const p of ativos) {
    if (p.tempoTotalDias == null || p.tempoTotalDias <= 0) continue
    const rito = groupRito(p.ritoProcessual)
    if (!rito) continue
    porRito.set(rito, [...(porRito.get(rito) ?? []), p.tempoTotalDias])
  }
  const ritosElegiveis = [...porRito.entries()]
    .filter(([, dias]) => dias.length >= 3)
    .map(([rito, dias]) => ({
      rito,
      n: dias.length,
      media: dias.reduce((a, b) => a + b, 0) / dias.length,
    }))
    .sort((a, b) => b.media - a.media)
  if (ritosElegiveis.length > 0) {
    const top = ritosElegiveis[0]
    insights.push({
      id: "rito-mais-lento",
      tone: "info",
      text: `O rito ${top.rito} tem o maior tempo médio total entre os processos ativos: ${top.media.toFixed(0)} dias (${top.n} processos).`,
    })
  }

  // 5. Processos ativos sem previsão no PCA.
  const semPca = ativos.filter((p) => p.previsaoPca.trim().toUpperCase() === "NÃO")
  if (semPca.length > 0) {
    const valor = semPca.reduce((acc, p) => acc + (p.vEstimado ?? 0), 0)
    insights.push({
      id: "sem-previsao-pca",
      tone: "warn",
      text: `${semPca.length} ${semPca.length === 1 ? "processo ativo não tem" : "processos ativos não têm"} previsão no PCA${valor > 0 ? `, somando ${formatBRL(valor)}` : ""}.`,
    })
  }

  return insights.slice(0, 5)
}
