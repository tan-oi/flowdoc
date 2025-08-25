import { sha256 } from "js-sha256";
import DOMPurify from "dompurify";
import { Editor } from "@tiptap/react";
import { Node as ProseMirrorNode } from "prosemirror-model";

import debounce from "lodash.debounce";
import { LlmRequest, ReactiveTextAttrs } from "../types";

const llmRequestQueue: LlmRequest[] = [];
let isProcessingQueue = false;

let debouncedScanRef: ReturnType<typeof debounce> | null = null;

const findReactiveNodeById = (
  doc: ProseMirrorNode,
  nodeId: string
): { node: ProseMirrorNode; pos: number } | null => {
  let result: { node: ProseMirrorNode; pos: number } | null = null;

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (node.attrs?.isReactive && node.attrs?.id === nodeId) {
      result = { node, pos };
      return false;
    }
  });

  return result;
};

const callLlmApi = async (
  prompt: string,
  dependentContent: string,
  computedContent: string,
  type: "text" | "bar" | "pie"
): Promise<string> => {
  try {
    console.log(computedContent);
    const res = await fetch("/api/reactive", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        message: `Base content:\n\n${dependentContent}\n\n 
       Desired type : ${type} \n\n
        Task: ${prompt}`,
        type,
      }),
    });
    const { htmlContent } = await res.json();

    return htmlContent;
  } catch (error) {
    console.error("[LLM] API call failed:", error);
    throw new Error(
      `LLM API failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

const processQueue = async (editor: Editor): Promise<void> => {
  if (isProcessingQueue || llmRequestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  const batchSize = Math.min(3, llmRequestQueue.length);
  const currentBatch = llmRequestQueue.splice(0, batchSize);

  console.log(
    `[Orchestrator] Processing batch of ${currentBatch.length} requests`
  );

  const batchPromises = currentBatch.map(async (request) => {
    const {
      nodePos,
      nodeId,
      nodeType,
      prompt,
      dependentContent,
      currentContentHash,
      computedContent,
      type,
      newDependencyScope,
    } = request;

    try {
      const nodeData = findReactiveNodeById(editor.state.doc, nodeId);

      if (!nodeData) {
        console.warn(
          `[Orchestrator] Node with ID ${nodeId} no longer exists. Skipping LLM call.`
        );
        return;
      }

      const { node: currentNode, pos: actualPos } = nodeData;
      // console.log(currentNode, "&&" , actualPos)
      if (currentNode.type.name !== nodeType) {
        console.warn(
          `[Orchestrator] Node with ID ${nodeId} changed type from ${nodeType} to ${currentNode.type.name}. Skipping LLM call.`
        );
        return;
      }
      const generatedHtml = await callLlmApi(
        prompt,
        dependentContent,
        computedContent,
        type
      );

      const sanitizedHtml = DOMPurify.sanitize(generatedHtml, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ["script", "iframe"],
        FORBID_ATTR: ["onerror", "onload"],
      });

      const newComputedHash = sha256(sanitizedHtml);
      const nodalData = findReactiveNodeById(editor.state.doc, nodeId);
      if (!nodalData) {
        console.warn(
          `[Orchestrator] Node with ID ${nodeId} no longer exists during update. Skipping.`
        );
        return;
      }

      const { node: currentNod, pos: actualPose } = nodalData;
      editor.view.dispatch(
        editor.state.tr.setNodeMarkup(actualPose, currentNod.type, {
          ...currentNode.attrs,
          computedContent: sanitizedHtml,
          sourceHash: newComputedHash,
          dependencyHash: currentContentHash,
          dependencyScope: newDependencyScope,
          status: "idle",
          errorMessage: "",
          retryCount: 0,
        })
      );

      console.log(
        `[Orchestrator] Node with ID ${nodeId} updated successfully at position ${actualPos}.`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred.";
      console.error(
        `[Orchestrator] LLM call failed for node with ID ${nodeId}:`,
        error
      );

      const errorNodeData = findReactiveNodeById(editor.state.doc, nodeId);

      if (editor.isDestroyed || !errorNodeData) {
        console.warn(
          `[Orchestrator] Editor destroyed or node with ID ${nodeId} no longer exists for error update.`
        );
        return;
      }

      const currentRetryCount = errorNodeData.node.attrs.retryCount || 0;
      const newRetryCount = currentRetryCount + 1;

      try {
        editor.view.dispatch(
          editor.state.tr.setNodeMarkup(errorNodeData.pos, undefined, {
            ...errorNodeData.node.attrs,
            status: "error",
            errorMessage: errorMessage,
            computedContent: `<p style="color: red;">Error: ${errorMessage} (Attempt ${newRetryCount}/2)</p>`,
            retryCount: newRetryCount,
          })
        );

        console.log(
          `[Orchestrator] Node with ID ${nodeId} failed. Retry count: ${newRetryCount}/2`
        );
      } catch (dispatchError) {
        console.error(
          `[Orchestrator] Failed to dispatch error update for node ${nodeId}:`,
          dispatchError
        );
      }
    }
  });

  try {
    await Promise.all(batchPromises);
  } catch (error) {
    console.error("[Orchestrator] Error in batch processing:", error);
  } finally {
    isProcessingQueue = false;

    if (llmRequestQueue.length > 0) {
      setTimeout(() => processQueue(editor), 500);
    }
  }
};

const triggerReevaluationScan = (editor: Editor): void => {
  if (!editor || editor.isDestroyed) {
    console.warn(
      "[Orchestrator] Editor is not available or destroyed during scan."
    );
    return;
  }

  console.log("[Orchestrator] Running debounced re-evaluation scan...");
  const { doc } = editor.state;
  const nodesToQueue: LlmRequest[] = [];

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (node.attrs.isReactive) {
      console.log("works");
      const attrs = node.attrs as ReactiveTextAttrs;
      const {
        prompt,
        sourceHash,
        dependencyHash,
        status,
        dependencyScope,
        computedContent,
        type,
        retryCount = 0,
        id: nodeId,
      } = attrs;
      console.log(dependencyHash, "in llmorc");

      // Skip nodes without IDs
      if (!nodeId) {
        console.warn(
          `[Orchestrator] Reactive node at pos ${pos} missing ID. Skipping.`
        );
        return;
      }

      let dependentContent = "";
      let dependencyFound = true;
      const newDependencyScope: string[] = [];

      if (dependencyScope[0] === "document") {
        newDependencyScope.push("document");
        doc.descendants((n: ProseMirrorNode, p: number) => {
          if (!n.attrs.isReactive && n.isTextblock) {
            const content = n.textContent.trim();
            if (content !== "") {
              console.log(content);
              dependentContent += content + "\n";
            }
          }
        });
        console.log(dependentContent);
      } else if (Array.isArray(dependencyScope)) {
        const contents: string[] = [];
        dependencyScope.forEach((blockId: string) => {
          let found = false;
          doc.descendants((n: ProseMirrorNode) => {
            if (n.attrs && n.attrs.id === blockId) {
              if (typeof n.textContent === "string") {
                console.log(n.attrs.id);
                newDependencyScope.push(n.attrs.id);
                contents.push(n.textContent);
              }
              found = true;
              return false;
            }
          });
          if (!found) {
            console.log(newDependencyScope);
            dependencyFound = false;
            console.warn(
              `[Orchestrator] Dependent block with ID "${blockId}" not found.`
            );
          }
        });
        dependentContent = contents.join("\n");
      } else {
        dependencyFound = false;
        console.warn(
          `[Orchestrator] Unknown dependencyScope:`,
          dependencyScope
        );
      }

      const currentContentHash = sha256(dependentContent);
      console.log(currentContentHash);

      const dependenciesChanged = currentContentHash !== dependencyHash;
      const effectiveRetryCount = dependenciesChanged ? 0 : retryCount;

      // Check if already queued by node ID (not position)
      const alreadyQueued = llmRequestQueue.some(
        (req) => req.nodeId === nodeId
      );

      const shouldReevaluate =
        ((dependenciesChanged && dependencyFound) || !dependencyFound) &&
        status !== "computing" &&
        effectiveRetryCount < 2 &&
        !alreadyQueued;

      if (shouldReevaluate) {
        console.log(
          `[Orchestrator] Queueing node with ID ${nodeId} at pos ${pos} for re-evaluation. Dependency changed: ${dependenciesChanged}, Retry count: ${effectiveRetryCount}/2`
        );

        nodesToQueue.push({
          nodePos: pos, // Store original position for reference
          nodeId, // Store the stable ID
          nodeType: node.type.name,
          prompt,
          dependentContent,
          currentContentHash,
          computedContent,
          newDependencyScope,
          type,
        });

        editor.view.dispatch(
          editor.state.tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            status: "computing",
            errorMessage: "",
            retryCount: effectiveRetryCount,
          })
        );
      } else if (effectiveRetryCount >= 2 && status === "error") {
        console.log(
          `[Orchestrator] Node with ID ${nodeId} at pos ${pos} has exceeded retry limit (${effectiveRetryCount}/2). Stopping retries.`
        );
      }
    }
  });

  nodesToQueue.forEach((req) => llmRequestQueue.push(req));
  processQueue(editor);
};

const cleanupDebounce = (): void => {
  if (debouncedScanRef) {
    debouncedScanRef.cancel();
    debouncedScanRef = null;
    console.log("[Orchestrator] Debounce cleanup completed.");
  }
};

export const setupLlmOrchestrator = (
  editor: Editor,
  debounceDelay: number = 5000
): (() => void) => {
  if (!editor) {
    console.error(
      "[Orchestrator] Editor instance is null. Cannot set up orchestrator."
    );
    return () => {};
  }

  debouncedScanRef = debounce(
    () => triggerReevaluationScan(editor),
    debounceDelay,
    {
      leading: false,
      trailing: true,
      maxWait: debounceDelay * 3,
    }
  );

  const handleEditorUpdate = (): void => {
    console.log("[Orchestrator] Editor updated, scheduling debounced scan...");
    if (debouncedScanRef) {
      debouncedScanRef();
    }
  };

  editor.on("update", handleEditorUpdate);

  console.log(
    `[Orchestrator] Debounced orchestrator setup complete. Delay: ${debounceDelay}ms`
  );

  if (debouncedScanRef) {
    debouncedScanRef();
  }

  return () => {
    console.log("[Orchestrator] Cleaning up debounced orchestrator...");
    editor.off("update", handleEditorUpdate);
    cleanupDebounce();
    llmRequestQueue.length = 0;
    isProcessingQueue = false;
  };
};

export const forceNodeReevaluation = (editor: Editor, nodeId: string): void => {
  if (!editor || editor.isDestroyed) {
    console.warn(
      "[Orchestrator] Editor not available for manual re-evaluation."
    );
    return;
  }

  const nodeData = findReactiveNodeById(editor.state.doc, nodeId);
  if (nodeData && nodeData.node.type.name === "TextBlock") {
    console.log(
      `[Orchestrator] Manual re-evaluation triggered for node with ID ${nodeId} at pos ${nodeData.pos}.`
    );

    editor.view.dispatch(
      editor.state.tr.setNodeMarkup(nodeData.pos, undefined, {
        ...nodeData.node.attrs,
        dependencyHash: "MANUAL_TRIGGER_" + Date.now(),
        status: "computing",
        errorMessage: "",
        retryCount: 0,
      })
    );

    triggerReevaluationScan(editor);
  }
};

export const triggerImmediateScan = (editor: Editor): void => {
  if (debouncedScanRef) {
    debouncedScanRef.flush();
  }
};
