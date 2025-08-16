import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

interface PieChartComponentProps {
  chartData: any[];
  compact?: boolean;
}

export const PieChartComponent: React.FC<PieChartComponentProps> = ({
  chartData,
  compact = false,
}) => {
  const dataKeys = Object.keys(chartData[0]).filter((key) => key !== "name");
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#84cc16",
    "#ec4899",
    "#6366f1",
  ];

  type ChartConfigItem = {
    label: string;
    color: string;
  };

  const chartConfig = dataKeys.reduce(
    (config: Record<string, ChartConfigItem>, key, index) => {
      config[key] = {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        color: colors[index % colors.length],
      };
      return config;
    },
    {} as Record<string, ChartConfigItem>
  );

  let pieData: any[] = [];

  if (dataKeys.length === 1) {
    pieData = chartData.map((item, index) => ({
      name: item.name,
      value: item[dataKeys[0]],
      fill: colors[index % colors.length],
    }));
  } else {
    pieData = [];
    dataKeys.forEach((key, keyIndex) => {
      chartData.forEach((item) => {
        pieData.push({
          name: `${item.name} - ${key}`,
          value: item[key],
          fill: colors[
            (keyIndex * chartData.length + pieData.length) % colors.length
          ],
        });
      });
    });
  }

  return (
    <ChartContainer
      config={chartConfig}
      className={
        compact ? "h-[120px] w-full" : "max-h-[350px] min-h-[300px] w-full"
      }
    >
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={
            compact
              ? false
              : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={compact ? 50 : 80}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        {!compact && <ChartTooltip content={<ChartTooltipContent />} />}
        {!compact && <ChartLegend content={<ChartLegendContent />} />}
      </PieChart>
    </ChartContainer>
  );
};
