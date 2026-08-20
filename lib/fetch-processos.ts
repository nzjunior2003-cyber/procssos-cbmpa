import Papa from "papaparse"
import { normalizeRows } from "./processo-utils"
import type { Processo, RawRow } from "./types"

// URL do CSV publicado da planilha do Google Sheets (aba "Processos 2026").
export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1deakLqP8-enEgY384EkFyYedgo5WYSONjvYIBJDwqXE/gviz/tq?tqx=out:csv&sheet=Processos%202026"

/**
 * Busca o CSV real do Google Sheets, faz o parse com papaparse e
 * retorna os processos normalizados. Lanca erro em caso de falha de rede.
 */
export async function fetchProcessos(signal?: AbortSignal): Promise<Processo[]> {
  const response = await fetch(CSV_URL, { signal, cache: "no-store" })
  if (!response.ok) {
    throw new Error(`Falha ao carregar a planilha (HTTP ${response.status}).`)
  }
  const csv = await response.text()

  const result = Papa.parse<RawRow>(csv, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  })

  if (!result.data || result.data.length === 0) {
    throw new Error("A planilha retornou vazia ou em formato inesperado.")
  }

  return normalizeRows(result.data)
}
