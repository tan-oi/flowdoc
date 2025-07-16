import { useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { getState } from "@/lib/print";

export const useUpdateTimer = (
  editor: Editor | null,
  idleTimeout: number = 10000
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!editor) return;

    const startInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        console.log("🔄 Interval sync triggered!");
        console.log("Editor content:", editor.getText());
        console.log("Editor JSON:", editor.getJSON());
        const {context} = getState(editor.state.doc)
        console.log(context);
      }, 8000);
    };

    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log("⏸️ Stopped interval - editor is idle");
      }
    };

    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      idleTimerRef.current = setTimeout(() => {
        console.log("💤 Editor has been idle - stopping sync");
        stopInterval();
      }, idleTimeout);
    };

    const handleUpdate = () => {
      console.log("📝 Editor updated - ensuring interval is running");

      if (!intervalRef.current) {
        startInterval();
      }

      resetIdleTimer();
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
      stopInterval();
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [editor, idleTimeout]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);
};
