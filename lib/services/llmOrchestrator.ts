
// src/services/llmOrchestrator.ts

import { sha256 } from "js-sha256";
import DOMPurify from "dompurify";
import { Editor } from "@tiptap/react";
import { Node as ProseMirrorNode } from "prosemirror-model";

// --- Types ---
interface LlmRequest {
  nodePos: number;
  nodeType: string;
  prompt: string;
  dependentContent: string;
  currentContentHash: string;
}

interface ReactiveTextAttrs {
  prompt: string;
  sourceHash: string; // Hash of the computed content itself
  dependencyHash: string; // Hash of the dependent content when last computed
  status: "idle" | "computing" | "error";
  dependencyScope: string | string[];
  computedContent?: string;
  errorMessage?: string;
}

const llmRequestQueue: LlmRequest[] = [];
let isProcessingQueue = false;

let intervalRef: NodeJS.Timeout | null = null;
let idleTimerRef: NodeJS.Timeout | null = null;

const callLlmApi = async (
  prompt: string,
  dependentContent: string
): Promise<string> => {
  console.log(
    `[LLM Mock] Request: Prompt="${prompt}", ContentSnippet="${dependentContent.substring(
      0,
      Math.min(dependentContent.length, 50)
    )}..."`
  );
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.15) {
        reject(
          new Error("Simulated LLM API error: Could not generate content.")
        );
      } else {
        let mockHtml = `<p><strong>Response for "${prompt}"</strong></p>`;
        if (
          prompt.toLowerCase().includes("list") ||
          prompt.toLowerCase().includes("items")
        ) {
          mockHtml += `<ul><li>Item A based on: ${dependentContent.substring(
            0,
            Math.min(dependentContent.length, 20)
          )}</li><li>Item B (Time: ${new Date().toLocaleTimeString()})</li></ul>`;
        } else if (prompt.toLowerCase().includes("summary")) {
          mockHtml += `<p>Here's a <em>concise summary</em> of your text: "${dependentContent.substring(
            0,
            Math.min(dependentContent.length, 50)
          )}..."</p>`;
        } else {
          mockHtml += `"${dependentContent}...`;
        }
        mockHtml += ``;
        resolve(mockHtml);
      }
    }, 5000);
  });
};

const processQueue = async (editor: Editor): Promise<void> => {
  if (isProcessingQueue || llmRequestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;
  const request = llmRequestQueue.shift();

  if (!request) {
    isProcessingQueue = false;
    return;
  }

  const { nodePos, nodeType, prompt, dependentContent, currentContentHash } =
    request;
  console.log(dependentContent, "in llm call before");
  console.log(prompt, "in llm call before");

  try {
    const currentNode = editor.state.doc.nodeAt(nodePos);
    if (!currentNode || currentNode.type.name !== nodeType) {
      console.warn(
        `[Orchestrator] Node at position ${nodePos} no longer exists or changed type. Skipping LLM call.`
      );
      return;
    }
    console.log("reacted mmlml");
    const generatedHtml = await callLlmApi(prompt, dependentContent);

    // --- CRUCIAL: SANITIZE HTML HERE ---
    const sanitizedHtml = DOMPurify.sanitize(generatedHtml as string, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["script", "iframe"],
      FORBID_ATTR: ["onerror", "onload"],
    });

    console.log("before new html");
    const newComputedHash = sha256(sanitizedHtml);
    console.log(newComputedHash, "hello");

    // FIXED: Update both sourceHash (computed content) and dependencyHash (dependent content)
    editor.view.dispatch(
      editor.state.tr.setNodeMarkup(nodePos, undefined, {
        ...currentNode.attrs,
        computedContent: sanitizedHtml,
        sourceHash: newComputedHash, // Hash of the computed content
        dependencyHash: currentContentHash, // Hash of the dependent content used
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

    // Get the current node again for error handling
    const errorNode = editor.state.doc.nodeAt(nodePos);
    if (editor.isDestroyed || !errorNode) {
      console.warn(
        `[Orchestrator] Editor destroyed or node at position ${nodePos} no longer exists for error update.`
      );
      return;
    }

    // FIXED: Use direct transaction to update specific node at position
    editor.view.dispatch(
      editor.state.tr.setNodeMarkup(nodePos, undefined, {
        ...errorNode.attrs,
        status: "error",
        errorMessage: errorMessage,
        computedContent: `<p style="color: red;">Error: ${errorMessage}</p>`,
      })
    );
  } finally {
    isProcessingQueue = false;
    setTimeout(() => processQueue(editor), 500);
  }
};

const triggerReevaluationScan = (editor: Editor): void => {
  if (!editor || editor.isDestroyed) {
    console.warn(
      "[Orchestrator] Editor is not available or destroyed during scan."
    );
    stopPollingInterval();
    return;
  }

  console.log("[Orchestrator] Running periodic re-evaluation scan...");
  const { doc } = editor.state;
  const nodesToQueue: LlmRequest[] = [];

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (node.type.name === "ReactiveTextBlock") {
      const attrs = node.attrs as ReactiveTextAttrs;
      const { prompt, sourceHash, dependencyHash, status, dependencyScope } =
        attrs;
      console.log("scope", dependencyScope);

      let dependentContent = "";
      let dependencyFound = true;

      if (dependencyScope === "document") {
        doc.descendants((n: ProseMirrorNode, p: number) => {
          if (n.type.name !== "ReactiveTextBlock" && n.isTextblock) {
            dependentContent += n.textContent + "\n";
            console.log(dependentContent);
          }
        });
      } else if (Array.isArray(dependencyScope)) {
        // dependencyScope is an array of block IDs
        dependencyScope.forEach((blockId: string) => {
          let found = false;
          doc.descendants((n: ProseMirrorNode, p: number) => {
            if (n.attrs && n.attrs.id === blockId) {
              if (typeof n.textContent === 'string') {
                dependentContent += n.textContent + "\n";
              }
              found = true;
              return false; // stop searching this branch
            }
          });
          if (!found) {
            dependencyFound = false;
            console.warn(
              `[Orchestrator] Dependent block with ID "${blockId}" not found.`
            );
          }
        });
      } else {
        // Unknown dependencyScope type
        dependencyFound = false;
        console.warn(`[Orchestrator] Unknown dependencyScope:`, dependencyScope);
      }

      const currentContentHash = sha256(dependentContent);
      console.log(currentContentHash);

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

const stopPollingInterval = (): void => {
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
    console.log("[Orchestrator] Polling stopped.");
  }
};

export const setupLlmOrchestrator = (
  editor: Editor,
  pollingInterval: number = 8000,
  idleTimeout: number = 30000
): (() => void) => {
  if (!editor) {
    console.error(
      "[Orchestrator] Editor instance is null. Cannot set up orchestrator."
    );
    return () => {};
  }

  const startPollingInterval = (): void => {
    if (intervalRef) {
      clearInterval(intervalRef);
    }
    intervalRef = setInterval(
      () => triggerReevaluationScan(editor),
      pollingInterval
    );
    console.log(
      `[Orchestrator] Polling started: checking every ${
        pollingInterval / 1000
      }s`
    );
  };

  const resetIdleTimer = (): void => {
    if (idleTimerRef) {
      clearTimeout(idleTimerRef);
    }
    idleTimerRef = setTimeout(() => {
      console.log(
        `[Orchestrator] Editor idle for ${
          idleTimeout / 1000
        }s. Stopping polling.`
      );
      stopPollingInterval();
    }, idleTimeout);
  };

  const handleEditorUpdate = (): void => {
    if (!intervalRef) {
      startPollingInterval();
    }
    resetIdleTimer();
    console.log("[Orchestrator] Editor updated, idle timer reset.");
  };

  editor.on("update", handleEditorUpdate);
  editor.on("selectionUpdate", handleEditorUpdate);

  startPollingInterval();
  resetIdleTimer();

  return () => {
    console.log("[Orchestrator] Cleaning up...");
    editor.off("update", handleEditorUpdate);
    editor.off("selectionUpdate", handleEditorUpdate);
    stopPollingInterval();
    if (idleTimerRef) {
      clearTimeout(idleTimerRef);
    }
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
  }
};
