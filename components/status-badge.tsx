import { cn } from "@/lib/utils"
import { STATUS_META } from "@/lib/status"
import type { StatusKey } from "@/lib/types"

export function StatusBadge({ status, className }: { status: StatusKey; className?: string }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        meta.className,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}
