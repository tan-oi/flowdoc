import { Editor } from "@tiptap/react";
import { sha256 } from "js-sha256";
import { customAlphabet } from "nanoid";

interface Result {
  content: string;
  position: "before" | "after" | "replace";
  operation: "replace" | "insert" | "insertReactive";
  targetBlock?: string | undefined;
  replaceType?: "normal" | "inplace" | undefined | "insertReactive";
  dependencyScope?: string[];
  prompt? : string
}

export function applyAIOperation(
  editor: Editor,
  result: Result,
  docsPos: number,
  capturedPositions
) {
  if (!editor || typeof docsPos !== "number") return;

  queueMicrotask(() => {
    const operationType = result.operation || "insert";
    const content = result.content;
    const blockId = result.targetBlock;
    const position = result.position;
    const replaceType = result.replaceType;
    console.log(operationType);
    const prompt = result.prompt;
    const blocks = capturedPositions.current;

    console.log(blocks);
    const aboutTarget = blockId ? blocks.get(blockId) : undefined;

    const range = aboutTarget?.position;

    console.log(range);
    const from = range?.from ?? docsPos;
    const to = range?.to ?? docsPos;
    console.log(from, " ", to);
    switch (operationType) {
      case "insert":
        const insertAt = position === "after" ? to : from;

        editor.view.dispatch(
          editor.state.tr.setMeta("createDiff", {
            // from: position === "after" && from !== 0 ? to : from,
            // to: position === "after" && from !== 0 ? to : from,
            from: insertAt,
            to: insertAt,
            payload: {
              changePayload: content,
              originalPayload: null,
            },
            type: "insert",
          })
        );
        break;

      case "insertReactive":
        const dependencyScope = result.dependencyScope;
        const nanoid = customAlphabet(
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
          7
        );
        let contentToBeHashed;
        if (dependencyScope) {
          if (dependencyScope[0] === "document") {
            let documentContent = "";
            editor.state.doc.descendants((node, pos) => {
              if (node.type.name !== "ReactiveTextBlock" && node.isTextblock) {
                const c = node.textContent.trim();
                if (c !== "") {
                  documentContent += c + "\n";
                }
              }
            });
            contentToBeHashed = documentContent;
          } else {
            contentToBeHashed = dependencyScope
              .map((id) => blocks.get(id))
              .filter((b) => b !== undefined)
              .map((b) => b.content)
              .join("\n");
          }

          const sourceHash = sha256(result.content);
          const dependencyHash = sha256(contentToBeHashed);

          const toBeAdded: Array<{ type: string; attrs?: any }> = [
            {
              type: "ReactiveTextBlock",
              attrs: {
                id: nanoid(),
                computedContent: result.content,
                prompt : prompt ? prompt : "None",
                sourceHash,
                dependencyHash,
                dependencyScope,
                type: "reactive",
                status: "idle",
                errorMessage: null,
              },
            },
          ];
          const insertAt = position === "after" ? to : from;
          toBeAdded.push({
            type: "paragraph",
            attrs: {},
          });

          editor.chain().focus().insertContentAt(insertAt, toBeAdded).run();
        }
        break;

      case "replace":
        let textBetween;

        textBetween = editor.state.doc.textBetween(from, to, " ");

        editor.view.dispatch(
          editor.state.tr.setMeta("createDiff", {
            from: from,
            to: to,
            payload: {
              changePayload: content,
              originalPayload: textBetween,
            },
            type: "replace",
            replaceType,
          })
        );

        break;
    }
  });
}

//WORKS PRETTY WELL. INFACT.

//** When the document contains only one empty paragraph block or when you want to reference the last empty paragraph(e.g., [abc123] paragraph: with no text), treat the editor as empty. In this case, always return:

// to do make insert reactive work. yeah, by calculation the hashes of its dependent as well as itself
