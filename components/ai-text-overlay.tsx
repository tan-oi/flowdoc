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
  console.log(docsPos);
  console.log(position);
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
                to: null,
                changePayload: message.content,
                type: "insert",
              })
            );
            // editor.chain().insertContentAt(docsPos,`${message.content}`).run()
            // editor.chain().insertContent(`<p>Hello there!</p><p>🚀 Powered by rockets and dreams!</p>`).run()
            console.log(docsPos);
          });
        }
      },
    });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (show && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [show]);

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

  return createPortal(
    isLoading ? (
      <div
        className="flex items-center bg-secondary rounded-md px-3 py-2 text-sm fixed"
        style={{ left: position.x - 10, top: position.y, zIndex: 9999 }}
      >
        <div className="md:w-[150px] lg:w-[180px] flex items-center min-h-7 gap-2">
          <Loader2 className="size-5 animate-spin" />
          <p>Cooking the block </p>
        </div>
      </div>
    ) : (
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          left: position.x - 10,
          top: position.y,
          zIndex: 9999,
          width: "100%",
        }}
      >
        <div className="md:max-w-lg lg:max-w-xl space-x-1 flex justify-center items-center w-full bg-secondary rounded-md relative">
          <Textarea
            ref={textareaRef}
            placeholder="Type and ask AI"
            className="min-h-10 max-h-30 pb-12 w-full mr-0"
            value={input}
            onChange={handleInputChange}
          />

          <Button
            className="absolute bottom-2 right-2 cursor-pointer"
            onClick={handleSubmit}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    ),
    document.body
  );
}
