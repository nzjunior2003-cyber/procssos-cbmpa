import type { StatusKey } from "./types"

export interface StatusMeta {
  label: string
  className: string
  dot: string
}

export const STATUS_META: Record<StatusKey, StatusMeta> = {
  finalizado: {
    label: "Finalizado",
    className: "bg-status-ok text-status-ok-foreground",
    dot: "bg-status-ok-foreground",
  },
  arquivado: {
    label: "Arquivado",
    className: "bg-status-archived text-status-archived-foreground",
    dot: "bg-status-archived-foreground",
  },
  contratado: {
    label: "Contratado/Aditivado",
    className: "bg-status-ok text-status-ok-foreground",
    dot: "bg-status-ok-foreground",
  },
  atrasado: {
    label: "Atrasado (+30d)",
    className: "bg-status-late text-status-late-foreground",
    dot: "bg-status-late-foreground",
  },
  atencao: {
    label: "Atenção (15–30d)",
    className: "bg-status-warn text-status-warn-foreground",
    dot: "bg-status-warn-foreground",
  },
  andamento: {
    label: "Em andamento",
    className: "bg-status-progress text-status-progress-foreground",
    dot: "bg-status-progress-foreground",
  },
}
