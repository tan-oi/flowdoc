"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "./ui/button";
import { useOverlayInputStore } from "@/store/useEditorAIStore";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";

export function TextOverlayAi() {
  const { show, position, editor, docsPos, hideInput } = useOverlayInputStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, input, handleInputChange, append, setInput, status } =
    useChat({
     
      id: "4ff5fbbd-16cf-4803-a301-6179f6e1c03",
      onFinish(message, options) {
        console.log(message);
        hideInput();
        if (editor && typeof docsPos === "number") {
          queueMicrotask(() => {
            editor.view.dispatch(
              editor.state.tr.setMeta("createDiff", {
                from: docsPos,
                to: docsPos,
                payload: {
                  changePayload: message.content,
                  originalPayload: null,
                },

                type: "insert",
              })
            );
          });
        }
      },
    });

  const isLoading = status === "submitted" || status === "streaming";

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
    const sendMessage = {
      role: "user" as const,
      content: input,
    };
    append(sendMessage);
    setInput("");
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
              onChange={handleInputChange}
              style={{ margin: 0, width: "100%" }}
            />
            <Button className="ml-2 h-10 px-3" onClick={handleSubmit}>
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    ),
    document.body
  );
}
