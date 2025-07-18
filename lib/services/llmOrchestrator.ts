import { sha256 } from "js-sha256";
import DOMPurify from "dompurify";
import { Editor } from "@tiptap/react";
import { Node as ProseMirrorNode } from "prosemirror-model";

import debounce from "lodash.debounce";

interface LlmRequest {
  nodePos: number;
  nodeType: string;
  prompt: string;
  dependentContent: string;
  currentContentHash: string;
}

interface ReactiveTextAttrs {
  prompt: string;
  sourceHash: string;
  dependencyHash: string;
  status: "idle" | "computing" | "error";
  dependencyScope: string[];
  computedContent?: string;
  errorMessage?: string;
}

const llmRequestQueue: LlmRequest[] = [];
let isProcessingQueue = false;


let debouncedScanRef: ReturnType<typeof debounce> | null = null;

const callLlmApi = async (
  prompt: string,
  dependentContent: string
): Promise<string> => {
 
  try {
    const res = await fetch("/api/reactive", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body : JSON.stringify({
        message : `Based on this document content:\n\n${dependentContent}\n\ User query: ${prompt}`
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
    const { nodePos, nodeType, prompt, dependentContent, currentContentHash } =
      request;

    try {
      const currentNode = editor.state.doc.nodeAt(nodePos);
      if (!currentNode || currentNode.type.name !== nodeType) {
        console.warn(
          `[Orchestrator] Node at position ${nodePos} no longer exists or changed type. Skipping LLM call.`
        );
        return;
      }

      const generatedHtml = await callLlmApi(prompt, dependentContent);

      const sanitizedHtml = DOMPurify.sanitize(generatedHtml, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ["script", "iframe"],
        FORBID_ATTR: ["onerror", "onload"],
      });

      const newComputedHash = sha256(sanitizedHtml);

      editor.view.dispatch(
        editor.state.tr.setNodeMarkup(nodePos, undefined, {
          ...currentNode.attrs,
          computedContent: sanitizedHtml,
          sourceHash: newComputedHash,
          dependencyHash: currentContentHash,
          status: "idle",
          errorMessage: "",
        })
      );

      console.log(
        `[Orchestrator] Node at pos ${nodePos} updated successfully with HTML.`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred.";
      console.error(
        `[Orchestrator] LLM call failed for node at pos ${nodePos}:`,
        error
      );

      const errorNode = editor.state.doc.nodeAt(nodePos);
      if (editor.isDestroyed || !errorNode) {
        console.warn(
          `[Orchestrator] Editor destroyed or node at position ${nodePos} no longer exists for error update.`
        );
        return;
      }

      editor.view.dispatch(
        editor.state.tr.setNodeMarkup(nodePos, undefined, {
          ...errorNode.attrs,
          status: "error",
          errorMessage: errorMessage,
          computedContent: `<p style="color: red;">Error: ${errorMessage}</p>`,
        })
      );
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
    if (node.type.name === "ReactiveTextBlock") {
      const attrs = node.attrs as ReactiveTextAttrs;
      const { prompt, sourceHash, dependencyHash, status, dependencyScope } =
        attrs;

      let dependentContent = "";
      let dependencyFound = true;

      if (dependencyScope[0] === "document") {
        doc.descendants((n: ProseMirrorNode, p: number) => {
          if (n.type.name !== "ReactiveTextBlock" && n.isTextblock) {
            const content = n.textContent.trim();
            if (content !== "") {
              dependentContent += content + "\n";
            }
          }
        });
      } else if (Array.isArray(dependencyScope)) {
        const contents: string[] = [];
        dependencyScope.forEach((blockId: string) => {
          let found = false;
          doc.descendants((n: ProseMirrorNode, p: number) => {
            if (n.attrs && n.attrs.id === blockId) {
              if (typeof n.textContent === "string") {
                contents.push(n.textContent);
              }
              found = true;
              return false;
            }
          });
          if (!found) {
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

      if (
        ((currentContentHash !== dependencyHash && dependencyFound) ||
          status === "error" ||
          !dependencyFound) &&
        status !== "computing" &&
        !llmRequestQueue.some((req) => req.nodePos === pos)
      ) {
        console.log(
          `[Orchestrator] Queueing node at pos ${pos} for re-evaluation. Dependency changed: ${
            currentContentHash !== dependencyHash
          }`
        );

        nodesToQueue.push({
          nodePos: pos,
          nodeType: node.type.name,
          prompt,
          dependentContent,
          currentContentHash,
        });

        editor.view.dispatch(
          editor.state.tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            status: "computing",
            errorMessage: "",
          })
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

export const forceNodeReevaluation = (editor: Editor, pos: number): void => {
  if (!editor || editor.isDestroyed) {
    console.warn(
      "[Orchestrator] Editor not available for manual re-evaluation."
    );
    return;
  }
  const node = editor.state.doc.nodeAt(pos);
  if (node && node.type.name === "ReactiveTextBlock") {
    console.log(
      `[Orchestrator] Manual re-evaluation triggered for node at pos ${pos}.`
    );

    editor.view.dispatch(
      editor.state.tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        dependencyHash: "MANUAL_TRIGGER_" + Date.now(),
        status: "computing",
        errorMessage: "",
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


//todo: add max retries, make queue better, modularize as well. also add a way such that we can do before and after block updates and not just specifics.