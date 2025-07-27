import React from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { Button } from "@/components/ui/button";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export const ChartView = (props: NodeViewProps) => {
  const { node } = props;
  const { computedContent, status, errorMessage, type, isReactive, prompt } =
    node.attrs;
  console.log(type," ", isReactive);
  const renderContent = () => {
    if (status === "error") {
      return (
        <div className="text-red-500">
          <p>Error: {errorMessage || "Failed to generate chart."}</p>
        </div>
      );
    }

    let chartData = [];
    try {
      chartData = JSON.parse(computedContent);
    } catch (error) {
      console.error("Failed to parse chart data:", error);
      return <p>Invalid chart data format.</p>;
    }

    if (!chartData || chartData.length === 0) {
      return <p>Generated chart will appear here.</p>;
    }

    const dataKeys = Object.keys(chartData[0]).filter((key) => key !== "name");
    const colors = [
      "#3b82f6", // Blue
      "#10b981", // Green
      "#f59e0b", // Yellow
      "#ef4444", // Red
      "#8b5cf6", // Purple
      "#06b6d4", // Cyan
      "#f97316", // Orange
      "#84cc16", // Lime
      "#ec4899", // Pink
      "#6366f1", // Indigo
    ];

    const chartConfig = dataKeys.reduce((config, key, index) => {
      config[key] = {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        color: colors[index % colors.length],
      };
      return config;
    }, {});

    // Render Bar Chart
    if (type === "bar") {
      return (
        <ChartContainer
          config={chartConfig}
          className="max-h-[350px] min-h-[300px] w-full"
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                maxBarSize={40}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      );
    }

    if (type === "pie") {
      console.log("hello");

      let pieData;

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
          className="max-h-[350px] min-h-[300px] w-full"
        >
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      );
    }

    return <p>Unsupported chart type: {type}</p>;
  };

  return (
    <NodeViewWrapper
      className="reactive-chart-node-wrapper my-4 border border-px rounded-lg group px-6"
      draggable="true"
      data-drag-handle
    >
      {/* <div className="flex justify-end items-center mb-1 gap-1">
        <Button className="px-2" size={"sm"} variant={"ghost"}>
          Edit
        </Button>
      </div> */}
      <div className="flex group-hover:justify-between justify-end py-2 items-center">
        <span className="hidden group-hover:inline text-neutral-500">
          {prompt}
        </span>
        {isReactive ? (
          <>
            <div className="status-dot-container">
              <div
                className={`status-dot ${
                  status === "computing"
                    ? "status-dot-red"
                    : status === "error"
                    ? "status-dot-error"
                    : "status-dot-green"
                }`}
              />

              {(status === "computing" || status === "idle") && (
                <>
                  <div
                    className={`status-ripple ${
                      status === "computing"
                        ? "status-ripple-red"
                        : "status-ripple-green"
                    }`}
                  />
                  <div
                    className={`status-ripple ${
                      status === "computing"
                        ? "status-ripple-red"
                        : "status-ripple-green"
                    }`}
                  />
                  <div
                    className={`status-ripple ${
                      status === "computing"
                        ? "status-ripple-red"
                        : "status-ripple-green"
                    }`}
                  />
                  <div
                    className={`status-ripple ${
                      status === "computing"
                        ? "status-ripple-red"
                        : "status-ripple-green"
                    }`}
                  />
                </>
              )}
            </div>
          </> 
        ) : <></>}
      </div>
      <div className="reactive-chart-content p-4  bg-transparent flex justify-center">
        {renderContent()}
      </div>
    </NodeViewWrapper>
  );
};
