"use client";

import React from "react";
import { TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";

interface DistrictData {
  district: string;
  count: number;
  high: number;
  medium: number;
  low: number;
}

interface ChartsProps {
  data: DistrictData[];
}

const chartConfig = {
  desktop: {
    label: "Count",
    color: "var(--chart-2)",
  },
  high: {
    label: "High",
    color: "var(--chart-2)",
  },
  medium: {
    label: "Medium",
    color: "var(--chart-2)",
  },
  low: {
    label: "Low",
    color: "var(--chart-2)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig;

export const Charts = ({ data }: ChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <div className="p-6">
        <Card className="bg-white/80 shadow-none border-0">
          <CardHeader className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-lg font-bold text-slate-800">
              Количество школ по районам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={data}
                layout="vertical"
                margin={{
                  right: 16,
                }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="district"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                  hide
                />
                <XAxis dataKey="count" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar
                  dataKey="count"
                  layout="vertical"
                  fill="var(--color-desktop)"
                  radius={4}
                >
                  <LabelList
                    dataKey="district"
                    position="insideLeft"
                    offset={8}
                    className="fill-(--color-label)"
                    fontSize={12}
                  />
                  <LabelList
                    dataKey="count"
                    position="right"
                    offset={8}
                    className="gray"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="p-6">
        <Card className="bg-white/80 shadow-none border-0">
          <CardHeader className="flex items-center space-x-3">
            <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-lg font-bold text-slate-800">
              Рейтинг школ по районам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="district"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend
                  className="text-black"
                  content={<ChartLegendContent />}
                />
                <Bar
                  dataKey="high"
                  stackId="a"
                  fill="#41e14eff"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="medium"
                  stackId="a"
                  fill="#e4e591ff"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="low"
                  stackId="a"
                  fill="#de664eff"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
