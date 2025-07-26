"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "./ui/button";
import { useOverlayInputStore } from "@/store/useEditorAIStore";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { experimental_useObject as useObject, useChat } from "@ai-sdk/react";
import { getState } from "@/lib/print";

import { applyAIOperation } from "@/lib/functions/applyOperations";
import { Editor } from "@tiptap/react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useHistoryState } from "@/store/useHistoryStore";
import { generateSchema } from "@/lib/schema";

interface BlockInfo {
  position: {
    to: number;
    from: number;
  };
  content: string;
}

export function TextOverlayAi() {
  const qc = useQueryClient();
  const id = useSearchParams().get("id");
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const { show, position, editor, docsPos, hideInput } = useOverlayInputStore();
  // const docId = useHistoryState(s => s.activeDocId)
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blocksRef = useRef(new Map<string, BlockInfo>());
  const docId = useHistoryState((s) => s.activeDocId);
  const addEntry = useHistoryState((s) => s.addBatchedEntry);
  const { submit, object, isLoading, error } = useObject({
    api: "/api/generate",
    schema: generateSchema,
    onFinish: (result) => {
      console.log(result.object);

      addEntry(docId as string, {
        prompt: input,
        content: result.object?.content as string,
        createdAt: new Date().toISOString(),
        type: result.object?.chartType
          ? "chart"
          : result.object?.operation === "insertReactive" ||
            result.object?.dependencyScope
          ? "reactive"
          : "text",
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: result.object?.content,
        },
      ]);
      setInput("");
      hideInput();

      applyAIOperation(
        editor as Editor,
        result?.object as any,
        docsPos as number,
        blocksRef
      );
    },
  });

  useEffect(() => {
    if (show && textareaRef.current) {
      textareaRef.current.focus();
    }
    if (editor && editor.view && editor.view.dom) {
      if (show) {
        editor.view.dom.classList.add("ai-overlay-active");
      } else {
        editor.view.dom.classList.remove("ai-overlay-active");
      }
    }
    return () => {
      if (editor && editor.view && editor.view.dom) {
        editor.view.dom.classList.remove("ai-overlay-active");
      }
    };
  }, [show, editor]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hideInput();
        if (editor && typeof docsPos === "number") {
          queueMicrotask(() => {
            editor.commands.focus(docsPos);
          });
        }
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        hideInput();
        if (editor && typeof docsPos === "number") {
          queueMicrotask(() => {
            editor.commands.focus(docsPos);
          });
        }
      }
    };
    if (show) {
      document.addEventListener("keydown", handleKey);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, hideInput, editor, docsPos, input]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;

    const { context, blocksByIds } = getState(editor?.state.doc);
    console.log(context);
    const userPrompt = `USER QUERY : ${input}`;
    const senMessages = context + userPrompt;
    // positionsRef.current = blocksByIds;
    blocksRef.current = blocksByIds;
    const newUserMessage = {
      role: "user" as const,
      content: senMessages,
    };

    const allMessages = [...messages, newUserMessage];
    setMessages(allMessages);

    submit({ messages: allMessages });
    // setInput("");
  };

  if (!show) return null;

  let editorRect = { left: 0, top: 0, width: 600 };
  if (editor && editor.view && editor.view.dom) {
    const rect = editor.view.dom.getBoundingClientRect();
    editorRect = { left: rect.left, top: rect.top, width: rect.width };
  }
  const overlayWidth = Math.max(400, Math.min(editorRect.width, 900));

  return createPortal(
    isLoading ? (
      <div
        className="fixed z-[9999]"
        style={{
          left: editorRect.left,
          top: editorRect.top + 32,
          width: overlayWidth,
          minWidth: 400,
          maxWidth: 900,
        }}
      >
        <div className="flex items-center bg-secondary rounded-md px-4 py-3 text-sm w-full justify-center gap-2 shadow-lg border border-border">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-foreground font-medium">
            Cooking the block…
          </span>
        </div>
      </div>
    ) : (
      <div
        ref={containerRef}
        className="fixed z-[9999]"
        style={{
          left: editorRect.left,
          top: editorRect.top + 32,
          width: overlayWidth,
          minWidth: 400,
          maxWidth: 900,
        }}
      >
        <div className="bg-secondary rounded-md shadow-lg border border-border flex flex-col w-full p-0">
          <div className="flex items-center justify-between px-3 pt-3 pb-1">
            <span className="text-foreground font-medium text-sm">
              Ask AI to insert content
            </span>
          </div>
          <div className="flex flex-row items-end px-3 pb-3 gap-2">
            <Textarea
              ref={textareaRef}
              placeholder="Type and ask AI"
              className="min-h-10 max-h-30 w-full text-foreground bg-background border border-border focus:ring-0 focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ margin: 0, width: "100%" }}
            />
            <Button className="ml-2 h-10 px-3" onClick={handleSubmit}>
              <Send className="size-4" />
            </Button>
          </div>
          <p>{docId}</p>
          <button
            onClick={() => {
              const data = useHistoryState
                .getState()
                .getBatchedEntries(id as string);
              console.log(data);
            }}
          >
            click
          </button>
        </div>
      </div>
    ),
    document.body
  );
}
