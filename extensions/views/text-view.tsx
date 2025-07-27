import React from "react";
import { NodeViewWrapper, Editor, NodeViewProps } from "@tiptap/react";
import { forceNodeReevaluation } from "@/lib/services/llmOrchestrator";
import { Button } from "@/components/ui/button";

export const TextView = (props: NodeViewProps) => {
  const { node, getPos, editor } = props;
  const { prompt, computedContent, status, errorMessage } = node.attrs;
  console.log(status);

  // const handleManualUpdate = () => {
  //   if (editor && getPos) {
  //     const pos = getPos();
  //     if (typeof pos === "number") {
  //       forceNodeReevaluation(editor, pos);
  //     }
  //   }
  // };

  return (
    <NodeViewWrapper
      className="reactive-text-node-wrapper rounded-lg group"
      draggable="true"
      data-drag-handle
    >
      <div className="flex group-hover:justify-between justify-end items-center mb-[1px] gap-1 mt-2 px-2">
         {/* <Button className="px-2 opacity-0 hover:opacity-100" size={"sm"}
        
         variant={"ghost"} onClick={() => console.log("clikk")}>Edit</Button> */}

         
            <span className="text-neutral-500 hidden group-hover:inline m-0">{prompt}</span>
        

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

       
      </div>

      <div className="reactive-text-content">
        {status === "error" && (
          <div
            className="status-indicator error"
            dangerouslySetInnerHTML={{
              __html:
                computedContent ||
                `<p style=\"color: red;\">Error: ${
                  errorMessage || "Failed to generate content."
                }</p>`,
            }}
          ></div>
        )}
        {(status === "idle" || status === "computing") && (
          <div
            className="generated-content-html"
            dangerouslySetInnerHTML={{
              __html:
                computedContent || "<p>Generated content will appear here.</p>",
            }}
          ></div>
        )}
      </div>
    </NodeViewWrapper>
  );
};
