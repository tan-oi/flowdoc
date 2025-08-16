import React from "react";
import {
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
} from "recharts";

interface BarChartComponentProps {
  chartData: any[];
  compact?: boolean;
}

export const BarChartComponent: React.FC<BarChartComponentProps> = ({ chartData, compact = false }) => {
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
  
  const chartConfig = dataKeys.reduce((config: Record<string, ChartConfigItem>, key, index) => {
    config[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: colors[index % colors.length],
    };
    return config;
  }, {} as Record<string, ChartConfigItem>);

  return (
    <ChartContainer
      config={chartConfig}
      className={compact ? "h-[120px] w-full" : "max-h-[350px] min-h-[300px] w-full"}
    >
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        {!compact && (
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
        )}
        {!compact && (
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
        )}
        {!compact && <ChartTooltip content={<ChartTooltipContent />} />}
        {!compact && <ChartLegend content={<ChartLegendContent />} />}
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            maxBarSize={compact ? 20 : 40}
            radius={[2, 2, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
};