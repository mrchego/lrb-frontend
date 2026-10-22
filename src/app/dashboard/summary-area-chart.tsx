"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartPoint } from "./type";

export function SummaryAreaChart({
  title,
  description,
  data,
  dataKey = "value",
  color = "var(--chart-1)",
}: {
  title: string;
  description?: string;
  data: ChartPoint[];
  dataKey?: string;
  color?: string;
}) {
  const chartConfig = {
    [dataKey]: { label: title, color },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(v) => new Date(v).toLocaleDateString()}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="value"
              type="natural"
              fill={`url(#fill-${dataKey})`}
              stroke={color}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}