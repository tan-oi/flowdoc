"use client";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, SaveIcon } from "lucide-react";

import { useEditorContext } from "./editor-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DocumentEntry, useHistoryState } from "@/store/useHistoryStore";
import { sha256 } from "js-sha256";
import { toast } from "sonner";
import { JSONContent } from "@tiptap/react";
import { DisabledSave } from "./disabled-autosave";

interface ToolbarProps {
  children?: React.ReactNode;
  id: string;
}

export function Toolbar({ children, id }: ToolbarProps) {
  console.log(id);
  const previousSaveRef = useRef<string | null>(null);
  const { editor } = useEditorContext();

  const qc = useQueryClient();

  useEffect(() => {
    if (editor && previousSaveRef.current === null) {
      const initialText = editor.getText();
      if (initialText) {
        previousSaveRef.current = sha256(initialText);
      }
    }
  }, [editor]);

  const { mutate: saveDocument, isPending: isSaving } = useMutation({
    mutationFn: async (data: { id: any; entries: DocumentEntry[] | null; editorState: JSONContent | null }) => {
      console.log(id);
      const res = await fetch(`/api/doc/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: data.entries,
          docState: data.editorState,
        }),
      });
      return res.json();
    },
    onSuccess(data, variables) {
      console.log(data);
      console.log(variables);
      qc.setQueryData<DocumentEntry[] | null>(["doc", "history", `${variables.id}`], (oldData) => {
        const currentData = Array.isArray(oldData) ? oldData : [];
        const newData = Array.isArray(variables.entries) ? variables.entries : []
        return [...currentData, ...newData];
      });

      useHistoryState.getState().clearBatchedEntries(variables.id);
    },
  });

  const saveDocs = () => {
    console.log("saved!");
    console.log(id);

    const batchedEntries = useHistoryState.getState().getBatchedEntries(id);
    const getText = editor?.getText();

    if (!getText) {
      toast.info("Can't save the editor is empty!");
      return;
    }

    const hashText = sha256(getText);
    const hasEditorChanges = previousSaveRef.current !== hashText;
    const hasHistoryChanges = batchedEntries.length > 0;

    if (!hasEditorChanges && !hasHistoryChanges) {
      toast.info(
        "There seems to be no changes, please make changes and then try to save!"
      );
      return;
    }

    let entriesToSave = null;
    let editorStateToSave = null;

    if (hasHistoryChanges) {
      entriesToSave = batchedEntries;
      console.log("Saving history changes");
    }

    if (hasEditorChanges) {
      editorStateToSave = editor?.getJSON();
      console.log("Saving editor changes");
      console.log(editor?.getText());
    }

    saveDocument({
      id,
      entries: entriesToSave,
      editorState: editorStateToSave ?? null,
    });

    if (hasEditorChanges) {
      previousSaveRef.current = hashText;
    }
  };

  if (!editor) return null;

  return (
    <div className="flex items-center justify-between gap-2 p-[8px] backdrop-blur-md border-b border-neutral-800 bg-transparent">
      <div className="flex items-center">{children}</div>

    <DisabledSave/>
      <div className="flex items-center gap-2">
        <Button
          size={"sm"}
          className="cursor-pointer"
          onClick={saveDocs}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Saving..
            </>
          ) : (
            <>
              Save
              <SaveIcon />
            </>
          )}
        </Button>

        <div className="font-mono text-xs font-extralight"></div>
      </div>
    </div>
  );
}
