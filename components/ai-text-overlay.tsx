"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "./ui/button";
import { useOverlayInputStore } from "@/store/useEditorAIStore";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles, Zap, CornerDownLeft } from "lucide-react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { getState } from "@/lib/print";

import { applyAIOperation } from "@/lib/functions/applyOperations";
import { Editor } from "@tiptap/react";

import { useSearchParams } from "next/navigation";
import { useHistoryState } from "@/store/useHistoryStore";
import { reactiveBlockSchema, staticBlockSchema } from "@/lib/schema";
import { toast } from "sonner";

export interface BlockInfo {
  position: {
    to: number;
    from: number;
  };
  content: string;
}

export default function TextOverlayAi() {
  const id = useSearchParams().get("id");
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const { show, editor, docsPos, hideInput, type } = useOverlayInputStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blocksRef = useRef(new Map<string, BlockInfo>());
  const docId = useHistoryState((s) => s.activeDocId);
  const [prevDocId, setPrevDocId] = useState(docId);

  const addEntry = useHistoryState((s) => s.addBatchedEntry);

  useEffect(() => {
    if (prevDocId && docId && prevDocId !== docId) {
      console.log("Document changed, clearing conversation context");
      setMessages([]);
    }
    setPrevDocId(docId);
  }, [docId, prevDocId]);

  const { submit, isLoading } = useObject({
    id: id as string,
    api: "/api/generate",

    schema:
      type === "static" ? staticBlockSchema : (reactiveBlockSchema as any),
    onFinish: (result) => {
      console.log(result.object);

      // @ts-nocheck
      const obj = result.object as any;
      addEntry(docId as string, {
        prompt: input,
        
        content: obj?.content as string,
        createdAt: new Date().toISOString(),

        type: obj?.chartType
          ? obj?.chartType
          : obj?.operation === "insertReactive" || obj?.dependencyScope
          ? "reactive"
          : "text",
      });

      // @ts-nocheck
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,

          content: obj?.content,
        },
      ]);
      setInput("");
      hideInput();

      applyAIOperation(
        editor as Editor,
        result?.object as any,
        docsPos as number,
        blocksRef.current
      );
    },
    onError(error) {
      try {
        const errorData = JSON.parse(error.message);

        if (errorData.error === "daily_limit_exceeded") {
          toast.error(
            `Daily limit exceeded (${errorData.used}/${errorData.limit})`
          );
          return;
        } else {
          toast.error(errorData.message);
          return;
        }
      } catch {}

      toast.error("Failed to generate!");
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

    submit({ messages: allMessages, type: type });
    // setInput("");
  };

  if (!show) return null;

  let editorRect = { left: 0, top: 0, width: 600 };
  if (editor && editor.view && editor.view.dom) {
    const rect = editor.view.dom.getBoundingClientRect();
    editorRect = { left: rect.left, top: rect.top, width: rect.width };
  }
  const overlayWidth = Math.max(400, Math.min(editorRect.width, 900));

  const isReactive = type === "reactive";
  const Icon = isReactive ? Zap : Sparkles;

  const surface =
    "relative bg-[#161618]/95 backdrop-blur-xl rounded-[10px] " +
    "ring-1 ring-white/[0.06] " +
    "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_8px_16px_-4px_rgba(0,0,0,0.4),0_24px_48px_-12px_rgba(0,0,0,0.6)]";

  const topHighlight =
    "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px " +
    "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:rounded-t-[10px]";

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
        <div className={`${surface} ${topHighlight} flex items-center gap-2.5 px-3.5 py-2.5`}>
          <div className="relative size-3.5">
            <Loader2 className="size-3.5 animate-spin text-neutral-400" />
          </div>
          <span className="text-[13px] text-neutral-300 tracking-tight">
            Generating
          </span>
          <span className="inline-flex gap-0.5 ml-0.5">
            <span className="size-1 rounded-full bg-neutral-500 animate-[pulse_1.4s_ease-in-out_infinite]" />
            <span className="size-1 rounded-full bg-neutral-500 animate-[pulse_1.4s_ease-in-out_0.2s_infinite]" />
            <span className="size-1 rounded-full bg-neutral-500 animate-[pulse_1.4s_ease-in-out_0.4s_infinite]" />
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
        <div className={`${surface} ${topHighlight} flex flex-col w-full overflow-hidden`}>
          <div className="flex items-center gap-2 px-3.5 pt-2.5 pb-2">
            <span className="flex items-center justify-center size-[18px] rounded-md bg-white/[0.04] ring-1 ring-white/[0.06]">
              <Icon size={11} className="text-neutral-300" />
            </span>
            <span className="text-[12px] text-neutral-200 font-medium tracking-tight">
              {isReactive ? "Reactive block" : "Insert or replace"}
            </span>
            <span className="text-[11px] text-neutral-500 tracking-tight">
              {isReactive ? "· uses document context" : "· with AI"}
            </span>
          </div>

          <div className="px-3 pb-2.5">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder={
                  isReactive
                    ? "Describe what should react…"
                    : "Ask AI to write or replace…"
                }
                className="min-h-[40px] max-h-40 w-full text-[13px] text-neutral-100 bg-black/20 border border-white/[0.06] placeholder:text-neutral-600 focus-visible:ring-0 focus-visible:border-white/15 rounded-md resize-none pr-10 leading-relaxed"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ margin: 0, width: "100%" }}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim()}
                aria-label="Send"
                className="absolute right-1.5 bottom-1.5 inline-flex items-center justify-center size-7 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 hover:text-white ring-1 ring-white/[0.08] transition-colors disabled:opacity-40 disabled:hover:bg-white/[0.06] disabled:hover:text-neutral-300"
              >
                <CornerDownLeft size={12} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-3.5 py-1.5 border-t border-white/[0.04] bg-white/[0.01]">
            <div className="flex items-center gap-1.5 text-[10.5px] text-neutral-500 tracking-tight">
              <kbd className="px-1 py-px rounded bg-white/[0.05] ring-1 ring-white/[0.06] text-neutral-400 font-mono text-[10px] leading-none">
                ↵
              </kbd>
              <span>send</span>
              <span className="text-neutral-700">·</span>
              <kbd className="px-1 py-px rounded bg-white/[0.05] ring-1 ring-white/[0.06] text-neutral-400 font-mono text-[10px] leading-none">
                esc
              </kbd>
              <span>cancel</span>
            </div>
            <span className="text-[10.5px] text-neutral-600 tracking-tight">
              AI may be inaccurate
            </span>
          </div>
        </div>
      </div>
    ),
    document.body
  );
}
