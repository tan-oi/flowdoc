import { Editor } from "@tiptap/react";
interface Result {
  content: string;
  position: "before" | "after" | "replace";
  operation: "replace" | "insert";
  targetBlock?: string;
  replaceType?: "normal" | "inplace" | "insertReactive";
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
    const onEditorPosition = capturedPositions.current;

    const range = onEditorPosition.get(blockId);
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
        console.log(result);
        console.log();

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
