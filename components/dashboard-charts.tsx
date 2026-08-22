"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  countByRito,
  countBySetor,
  countBySetorAtual,
  sumEstimadoByNatureza,
} from "@/lib/metrics"
import { formatBRLCompact } from "@/lib/processo-utils"
import type { Processo } from "@/lib/types"

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

function shorten(label: string, max = 22) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

export function DashboardCharts({ processos }: { processos: Processo[] }) {
  const setores = useMemo(() => countBySetor(processos, 10), [processos])
  const ritos = useMemo(() => countByRito(processos), [processos])
  const setoresAtuais = useMemo(() => countBySetorAtual(processos, 10), [processos])
  const naturezas = useMemo(() => sumEstimadoByNatureza(processos), [processos])

  const setorConfig: ChartConfig = { value: { label: "Processos", color: "var(--chart-2)" } }
  const setorAtualConfig: ChartConfig = { value: { label: "Processos", color: "var(--chart-1)" } }
  const naturezaConfig: ChartConfig = { value: { label: "V. Estimado", color: "var(--chart-4)" } }

  const ritoConfig: ChartConfig = useMemo(() => {
    const cfg: ChartConfig = { value: { label: "Processos" } }
    ritos.forEach((r, i) => {
      cfg[r.label] = { label: r.label, color: PALETTE[i % PALETTE.length] }
    })
    return cfg
  }, [ritos])

  const ritoData = useMemo(
    () => ritos.map((r, i) => ({ ...r, fill: PALETTE[i % PALETTE.length] })),
    [ritos],
  )

  return (
    <section aria-label="Gráficos" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Processos por setor atual */}
      <Card>
        <CardHeader>
          <CardTitle>Processos por setor atual</CardTitle>
          <CardDescription>Top 10 setores com mais processos tramitando</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={setorAtualConfig} className="h-[300px] w-full">
            <BarChart data={setoresAtuais} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={140}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => shorten(v, 20)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={4}>
                <LabelList dataKey="value" position="right" className="fill-foreground text-xs" />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Distribuição por rito processual */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por rito processual</CardTitle>
          <CardDescription>Participação de cada rito no total</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={ritoConfig}
            className="mx-auto aspect-square max-h-[300px] w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
              <Pie data={ritoData} dataKey="value" nameKey="label" innerRadius={55} strokeWidth={2}>
                {ritoData.map((entry) => (
                  <Cell key={entry.label} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            {ritoData.map((r) => (
              <li key={r.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className="size-2.5 shrink-0 rounded-[3px]"
                  style={{ backgroundColor: r.fill }}
                  aria-hidden
                />
                <span className="truncate">{r.label}</span>
                <span className="ml-auto font-medium tabular-nums text-foreground">{r.value}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Processos por setor demandante */}
      <Card>
        <CardHeader>
          <CardTitle>Processos por setor demandante</CardTitle>
          <CardDescription>Top 10 setores com mais processos</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={setorConfig} className="h-[300px] w-full">
            <BarChart data={setores} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={140}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => shorten(v, 20)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={4}>
                <LabelList dataKey="value" position="right" className="fill-foreground text-xs" />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* V. estimado por natureza de despesa */}
      <Card>
        <CardHeader>
          <CardTitle>V. estimado por natureza de despesa</CardTitle>
          <CardDescription>Soma do valor estimado agrupado por natureza</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={naturezaConfig} className="h-[300px] w-full">
            <BarChart data={naturezas} layout="vertical" margin={{ left: 8, right: 32 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={140}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => shorten(v, 20)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatBRLCompact(Number(value))}
                  />
                }
              />
              <Bar dataKey="value" fill="var(--color-value)" radius={4}>
                <LabelList
                  dataKey="value"
                  position="right"
                  className="fill-foreground text-xs"
                  formatter={(value) => formatBRLCompact(Number(value))}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  )
}
