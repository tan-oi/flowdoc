"use client";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, PanelRight, SaveIcon } from "lucide-react";

import { useEditorContext } from "./editor-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useHistoryState } from "@/store/useHistoryStore";
import { DocumentEntry } from "@/lib/types";
import { sha256 } from "js-sha256";
import { toast } from "sonner";
import { JSONContent } from "@tiptap/react";
import { DisabledSave } from "./disabled-autosave";
import { usePanelStore } from "@/store/panelStore";
import { authClient } from "@/lib/auth-client";


interface ToolbarProps {
  children?: React.ReactNode;
  id: string;
}

export function Toolbar({ children, id }: ToolbarProps) {
  console.log(id);
  const previousSaveRef = useRef<string | null>(null);
  const { editor } = useEditorContext();

  const qc = useQueryClient();

  const { data: session } = authClient.useSession();

  const { toggle } = usePanelStore();

  // useAutoSave({
  //   documentId: id,
  //   userId : session?.user?.id,
  //   editor
  // })
    
  useEffect(() => {
    if (editor && previousSaveRef.current === null) {
      const initialText = editor.getText();
      if (initialText) {
        previousSaveRef.current = sha256(initialText);
      }
    }
  }, [editor]);

  const { mutate: saveDocument, isPending: isSaving } = useMutation({
    mutationFn: async (data: {
      id: any;
      entries: DocumentEntry[] | null;
      editorState: JSONContent | null;
    }) => {
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
      if (!res.ok) throw new Error("Couldnt");
      return res.json();
    },

    onSuccess(data, variables, context) {
      console.log(context);
      console.log(data);
      console.log(variables);
      qc.setQueryData<DocumentEntry[] | null>(
        ["doc", "history", `${variables.id}`],
        (oldData) => {
          const currentData = Array.isArray(oldData) ? oldData : [];
          const newData = Array.isArray(variables.entries)
            ? variables.entries
            : [];
          return [...currentData, ...newData];
        }
      );

      qc.setQueryData(
        ["editor-setup", `${variables.id}`, `${session?.user?.id}`],
        (oldData) => {
          console.log(oldData);
        }
      );
      useHistoryState.getState().clearBatchedEntries(variables.id);
    },
    onError(data, variables) {
      toast.error("Couldnt save");
      console.log(data);
      console.log(variables);
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

      <DisabledSave />
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


        <Button variant={"ghost"} size={"sm"} onClick={toggle}>
          <PanelRight />
        </Button>

        <div className="font-mono text-xs font-extralight"></div>
      </div>
    </div>
  );
}
