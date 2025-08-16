import React from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { BarChartComponent } from "@/components/bar-chart";
import { PieChartComponent } from "@/components/pie-chart";
export const ChartView = (props: NodeViewProps) => {
  const { node } = props;
  const { computedContent, status, errorMessage, type, isReactive, prompt } =
    node.attrs;
  console.log(type, " ", isReactive);

  const renderContent = () => {
    if (status === "error") {
      return (
        <div className="text-red-500">
          <p>Error: {errorMessage || "Failed to generate chart."}</p>
        </div>
      );
    }

    let chartData: any[] = [];
    try {
      chartData = JSON.parse(computedContent);
    } catch (error) {
      console.error("Failed to parse chart data:", error);
      return <p>Invalid chart data format.</p>;
    }

    if (!chartData || chartData.length === 0) {
      return <p>Generated chart will appear here.</p>;
    }

    if (type === "bar") {
      return <BarChartComponent chartData={chartData} />;
    }

    if (type === "pie") {
      return <PieChartComponent chartData={chartData} />;
    }

    return <p>Unsupported chart type: {type}</p>;
  };

  return (
    <NodeViewWrapper
      className="reactive-chart-node-wrapper my-4 border border-px rounded-lg group px-6"
      draggable="true"
      data-drag-handle
    >
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
        ) : (
          <></>
        )}
      </div>
      <div className="reactive-chart-content p-4 bg-transparent flex justify-center">
        {renderContent()}
      </div>
    </NodeViewWrapper>
  );
};
