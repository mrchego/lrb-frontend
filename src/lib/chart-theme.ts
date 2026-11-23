// lib/chart-theme.ts
//
// HOW CHARTS FOLLOW THE COMPANY THEME
// The theme engine writes five CSS variables, --chart-1 ... --chart-5, from the owner's
// brand color (and the "chart colors" style they chose). Everything that is drawn with
// those variables recolors itself when the theme changes, in light and dark mode.
//
// RULES FOR ANY NEW CHART
//   1. Never write a literal color (#hex, rgb(), hsl(), oklch(), bg-[#...]). A lint rule
//      enforces this in chart files.
//   2. Give each series chartColor(i), where i is the series number starting at 0.
//   3. Build charts with <ChartContainer> from "@/components/ui/chart": axis text, grid
//      lines and tooltips already use the theme's text and border colors.
//   4. Libraries that cannot read CSS variables (canvas, maps, image export) should use
//      the useChartPalette() hook from "@/lib/use-chart-palette" instead.
//
// BAR / LINE CHART (series colors go through the chart config)
//
//   const config = {
//     orders:  { label: "Orders",  color: chartColor(0) },
//     returns: { label: "Returns", color: chartColor(1) },
//   } satisfies ChartConfig;
//
//   <ChartContainer config={config} className="h-[240px] w-full">
//     <BarChart data={data}>
//       <CartesianGrid vertical={false} />
//       <XAxis dataKey="month" tickLine={false} axisLine={false} />
//       <ChartTooltip content={<ChartTooltipContent />} />
//       <Bar dataKey="orders"  fill="var(--color-orders)"  radius={4} />
//       <Bar dataKey="returns" fill="var(--color-returns)" radius={4} />
//     </BarChart>
//   </ChartContainer>
//
// PIE / DONUT (one color per slice)
//
//   <Pie data={rows} dataKey="value" nameKey="name">
//     {rows.map((_, i) => <Cell key={i} fill={chartColor(i)} />)}
//   </Pie>

export const CHART_SERIES_COUNT = 5;

/** CSS color for the nth series (0-based). Wraps around after five series. */
export function chartColor(index: number): string {
  const i = ((Math.trunc(index) % CHART_SERIES_COUNT) + CHART_SERIES_COUNT) % CHART_SERIES_COUNT;
  return `var(--chart-${i + 1})`;
}

/** The first `count` series colors, e.g. chartColors(3). */
export const chartColors = (count: number = CHART_SERIES_COUNT): string[] =>
  Array.from({ length: count }, (_, i) => chartColor(i));