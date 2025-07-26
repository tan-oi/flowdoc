"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, SaveIcon } from "lucide-react";

import { useEditorContext } from "./editor-provider";
import { Toggle } from "./ui/toggle";
import { getState } from "@/lib/print";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useHistoryState } from "@/store/useHistoryStore";

interface ToolbarProps {
  children?: React.ReactNode;
  id: string;
}

export function Toolbar({ children, id }: ToolbarProps) {
  const { editor } = useEditorContext();

  const qc = useQueryClient();

  const [, forceUpdate] = useState({});

  const { mutate: saveDocument, isPending: isSaving } = useMutation({
    mutationFn: async (data: { id: any; entries: any; editorState: any }) => {
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
      qc.setQueryData(["doc", "history", `${variables.id}`], (oldData) => [
        ...(oldData || []),
        ...variables.entries,
      ]);

      useHistoryState.getState().clearBatchedEntries(variables.id);
    },
  });

  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => {
      forceUpdate({});
    };

    editor.on("selectionUpdate", updateHandler);
    editor.on("transaction", updateHandler);

    return () => {
      editor.off("selectionUpdate", updateHandler);
      editor.off("transaction", updateHandler);
    };
  }, [editor]);

  const saveDocs = () => {
    console.log("saved!");
    console.log(id);

    const batchedEntries = useHistoryState.getState().getBatchedEntries(id);

    if (batchedEntries.length === 0) return;
    console.log(batchedEntries);

    saveDocument({
      id,
      entries: batchedEntries,
      editorState: editor?.getJSON(),
    });
  };

  if (!editor) return null;

  return (
    <div className="flex items-center justify-between gap-2 p-[8px] backdrop-blur-md border-b border-neutral-800">
      <div className="flex items-center">{children}</div>

      {/* <div className="flex items-center gap-1">
        <Toggle
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          aria-label="Toggle bold"
        >
          B
        </Toggle>

        <Toggle
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          aria-label="Toggle Italic"
        >
          <LucideItalic />
        </Toggle>

        <Toggle
          className="gap-0"
          pressed={editor.isActive("heading", { level: 1 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          disabled={
            !editor.can().chain().focus().toggleHeading({ level: 1 }).run()
          }
          aria-label="Toggle Heading1"
        >
          H<sub className="text-xs">1</sub>
        </Toggle>

        <Toggle
          className="gap-0"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          disabled={
            !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-label="Toggle Heading2"
        >
          H<sub className="text-xs">2</sub>
        </Toggle>

        <Toggle
          className="gap-0"
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          disabled={
            !editor.can().chain().focus().toggleHeading({ level: 3 }).run()
          }
          aria-label="Toggle Heading3"
        >
          H<sub className="text-xs">3</sub>
        </Toggle>

        <Toggle
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          aria-label="Toggle Underline"
        >
          <span className="underline underline-offset-2">U</span>
        </Toggle>

        <Toggle
          pressed={editor.isActive("link")}
          onPressedChange={() => {
            const previousUrl = editor.getAttributes("link").href;
            const url = window.prompt("Enter URL:", previousUrl);

            // If cancelled
            if (url === null) {
              return;
            }

            // If empty string, remove link
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }

            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }}
          aria-label="Toggle Link"
        >
          <Link />
        </Toggle>

        <Toggle
          pressed={editor.isActive("codeBlock")}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
          aria-label="Toggle Codeblock"
        >
          <Code2 />
        </Toggle>

        <Toggle
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          aria-label="Toggle Ordered List"
        >
          <ListOrderedIcon />
        </Toggle>

        <Toggle
          pressed={editor.isActive("blockquote")}
          onPressedChange={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
          disabled={!editor.can().chain().focus().toggleBlockquote().run()}
          aria-label="Toggle Blockquote"
        >
          <LucideQuote />
        </Toggle>

        <Toggle
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          aria-label="Toggle Bullet List"
        >
          <List />
        </Toggle>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log(editor.getJSON());
            console.log(editor.getHTML());
          }}
        >
          Get Data
        </Button>

        <Button
          size={"sm"}
          onClick={() => {
            const posi = editor.state.selection.from;
            editor
              .chain()
              .focus()
              .insertContentAt(3, "how do it <strong>work?<strong>")
              .run();
          }}
        >
          Add to the editor
        </Button>

        <Button
          size={"sm"}
          onClick={() => {
            editor.commands.insertContent(
              '<react-component count="999"></react-component>'
            );
            // const { to, from } = editor.state.selection;
            // console.log(to + " " + from);
          }}
        >
          show
        </Button>

        <Button
          size={"sm"}
          onClick={() => {
            editor
              .chain()
              .focus()
              .insertContentAt(
                {
                  from: 0,
                  to: 72,
                },
                `Quantum tunneling allows particles to pass through barriers that they classically shouldn’t.`
              )
              .run();
          }}
        >
          replace
        </Button>

        <Button
          onClick={() =>
            editor.view.dispatch(editor.state.tr.setMeta("clearDiff", true))
          }
        >
          cler
        </Button>

        <Button
          onClick={() => {
            const { from } = editor.state.selection;
            const { doc } = editor.state;

            const resolvedPos = doc.resolve(from);
            const currentBlockPos = resolvedPos.start(resolvedPos.depth);
            const currentBlock = resolvedPos.node(resolvedPos.depth);

            const afterCurrentBlock = currentBlockPos + currentBlock.nodeSize;
            const hasContentAfter = afterCurrentBlock < doc.content.size;

            console.log("Current block:", currentBlock.type.name);
            console.log("Has content after:", hasContentAfter);
            console.log("After position:", afterCurrentBlock);
            console.log("Doc size:", doc.content.size);

            const content = [{ type: "reactComponent" }];

            if (!hasContentAfter) {
              content.push({ type: "paragraph" });
            }

            editor.chain().focus().insertContent(content).run();

            if (hasContentAfter) {
              const componentSize = 1;
              const nextBlockPos = from + componentSize;

              editor.commands.setTextSelection(nextBlockPos);
            } else {
              const componentSize = 1;
              const newParagraphPos = from + componentSize;
              editor.commands.setTextSelection(newParagraphPos);
            }
          }}
        >
          dd react
        </Button>

        <Button
          onClick={() => {
            const { from } = editor.state.selection;
            const { doc } = editor.state;

            const resolvedPos = doc.resolve(from);
            const currentBlockPos = resolvedPos.start(resolvedPos.depth);
            const currentBlock = resolvedPos.node(resolvedPos.depth);

            const afterCurrentBlock = currentBlockPos + currentBlock.nodeSize;
            const hasContentAfter = afterCurrentBlock < doc.content.size;

            const content: Array<{ type: string; attrs?: any }> = [
              {
                type: "ReactiveTextBlock",
                attrs: {
                  id: `text-${Date.now()}`,
                  computedContent: `Curiosity fuels learning beyond boundaries`,
                  prompt: "Some prompt",
                  sourceHash:
                    "879a89367fad4899b61c9113c9d3532036992b7e16a4ea835e3184bdef5f1a75",
                  dependencyHash:
                    "879a89367fad4899b61c9113c9d3532036992b7e16a4ea835e3184bdef5f1a75",
                  dependencyScope: "document",
                  type: "user-generated",
                  status: "idle",
                  errorMessage: null,
                },
              },
            ];

            if (!hasContentAfter) {
              content.push({
                type: "paragraph",
                attrs: {},
              });
            }

            editor.chain().focus().insertContent(content).run();

            if (hasContentAfter) {
              const componentSize = 1;
              const nextBlockPos = from + componentSize;
              editor.commands.setTextSelection(nextBlockPos);
            } else {
              const componentSize = 1;
              const newParagraphPos = from + componentSize;
              editor.commands.setTextSelection(newParagraphPos);
            }
          }}
        >
          reactive
        </Button>
      </div> */}
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
