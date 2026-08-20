"use client"

import { useCallback, useRef, useState } from "react"
import { fetchProcessos } from "@/lib/fetch-processos"
import { MOCK_PROCESSOS } from "@/lib/mock-data"
import type { LoadStatus, Processo, SourceKind } from "@/lib/types"

interface UseProcessosState {
  processos: Processo[]
  source: SourceKind
  status: LoadStatus
  error: string | null
  lastUpdated: Date | null
}

/**
 * Inicia com dados MOCK (para validar o layout imediatamente) e expoe
 * `refresh()` que busca o CSV real do Google Sheets sob demanda — nunca
 * dispara fetch em useEffect, apenas por acao do usuario.
 */
export function useProcessos() {
  const [state, setState] = useState<UseProcessosState>({
    processos: MOCK_PROCESSOS,
    source: "mock",
    status: "idle",
    error: null,
    lastUpdated: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  const refresh = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState((prev) => ({ ...prev, status: "loading", error: null }))
    try {
      const data = await fetchProcessos(controller.signal)
      setState({
        processos: data,
        source: "live",
        status: "idle",
        error: null,
        lastUpdated: new Date(),
      })
    } catch (err) {
      if (controller.signal.aborted) return
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os dados. Verifique sua conexão."
      setState((prev) => ({
        ...prev,
        status: "error",
        error: `${message} Se o erro persistir, pode ser bloqueio de CORS do navegador.`,
      }))
    }
  }, [])

  const useMockData = useCallback(() => {
    abortRef.current?.abort()
    setState({
      processos: MOCK_PROCESSOS,
      source: "mock",
      status: "idle",
      error: null,
      lastUpdated: new Date(),
    })
  }, [])

  return { ...state, refresh, useMockData }
}
