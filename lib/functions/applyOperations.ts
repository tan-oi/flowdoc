import { generateSchema } from "@/app/api/generate/route";
import { Editor } from "@tiptap/react";

export function applyAIOperation(editor : Editor, result , docsPos : number, capturedPositions) {
  if (!editor || typeof docsPos !== "number") return;

  queueMicrotask(() => {
    const operationType = result.operation || "insert";
    const content = result.content;
    const blockId = result.targetBlock;
    const position = result.position;
    const replaceType = result.replaceType;

    const onEditorPosition = capturedPositions.current;

    const range = onEditorPosition.get(blockId);
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

      case "insertCustomNode":
        editor.view.dispatch(
          editor.state.tr.setMeta("createDiff", {
            from: docsPos,
            to: docsPos,
            payload: {
              changePayload: content,
              originalPayload: null,
              nodeType: result.object?.nodeType, // "codeBlock", "image", "table", etc.
              nodeAttrs: result.object?.nodeAttrs, // { language: "javascript" } for code blocks
            },
            type: "insertCustomNode",
          })
        );
        break;

      case "replace":
        let textBetween;
        if (replaceType === "normal") {
          textBetween = editor.state.doc.textBetween(from, to, " ");
        }

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
