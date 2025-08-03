import { BlockInfo } from "@/components/ai-text-overlay";
import { Editor } from "@tiptap/react";
import { sha256 } from "js-sha256";
import { customAlphabet } from "nanoid";

interface Result {
  content: string;
  position: "before" | "after" | "replace";
  operation: "replace" | "insert" | "insertReactive";
  targetBlock?: string | undefined;
  replaceType?: "normal" | "inplace" | undefined;
  dependencyScope?: string[];
  prompt?: string;
  chartType?: "bar" | "pie";
  isReactive?: boolean;
}

export function applyAIOperation(
  editor: Editor,
  result: Result,
  docsPos: number,
  capturedPositions: Map<string, BlockInfo>
) {
  if (!editor || typeof docsPos !== "number") return;
  console.log(capturedPositions);
  queueMicrotask(() => {
    const operationType = result.operation || "insert";
    const content = result.content;
    const blockId = result.targetBlock;
    const position = result.position;
    const replaceType = result.replaceType;
    console.log(operationType);
    const prompt = result.prompt;
    const blocks = capturedPositions;

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
        if (result.chartType) {
          const nanoid = customAlphabet(
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            7
          );
          const toBeAdded: Array<{ type: string; attrs?: any }> = [
            {
              type: "ChartBlock",
              attrs: {
                id: nanoid(),
                computedContent: result.content,
                prompt: prompt ? prompt : "None",
                type: result.chartType,
                isReactive: false,
              },
            },
          ];
          toBeAdded.push({
            type: "paragraph",
            attrs: {},
          });

          editor
            .chain()
            .focus()
            .scrollIntoView()
            .insertContentAt(insertAt, toBeAdded)
            .run();
        } else {
          editor.view.dispatch(
            editor.state.tr
              .setMeta("createDiff", {
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
        }
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
              if (!node.attrs.isReactive && node.isTextblock) {
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
          console.log(dependencyHash, "in apply");
          const blockType = result.chartType ? "ChartBlock" : "TextBlock";
          const toBeAdded: Array<{ type: string; attrs?: any }> = [
            {
              type: blockType,
              attrs: {
                id: nanoid(),
                computedContent: result.content,
                prompt: prompt ? prompt : "None",
                sourceHash,
                dependencyHash,
                dependencyScope,
                type: result.chartType || "text",
                status: "idle",
                errorMessage: null,
                isReactive: true,
              },
            },
          ];
          const insertAt = position === "after" ? to : from;
          toBeAdded.push({
            type: "paragraph",
            attrs: {},
          });

          editor
            .chain()
            .focus()
            .scrollIntoView()
            .insertContentAt(insertAt, toBeAdded)
            .run();
        }
        break;

      case "replace":
        const textBetween = editor.state.doc.textBetween(from, to, " ");

        editor.view.dispatch(
          editor.state.tr
            .setMeta("createDiff", {
              from: from,
              to: to,
              payload: {
                changePayload: content,
                originalPayload: textBetween,
              },
              type: "replace",
              replaceType: replaceType ?? "normal",
            })
            .scrollIntoView()
        );

        break;
    }
  });
}

//WORKS PRETTY WELL. INFACT.

//** When the document contains only one empty paragraph block or when you want to reference the last empty paragraph(e.g., [abc123] paragraph: with no text), treat the editor as empty. In this case, always return:

// to do make insert reactive work. yeah, by calculation the hashes of its dependent as well as itself
