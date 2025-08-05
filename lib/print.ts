import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { BlockInfo, GetStateResult } from "./types";

export function getState(doc: any): GetStateResult {
  const customNode = ["TextBlock", "ChartBlock"];
  let context = "Current document context :\n\nDocument blocks :\n";

  const blocksByIds = new Map<string, BlockInfo>();

  doc.descendants(
    (node: ProseMirrorNode, pos: number, parent?: ProseMirrorNode) => {
      if (!node.type.isBlock) return;
      console.log(node);
      if (node.type.name === "paragraph" && parent?.type?.name === "listItem")
        return;

      const id = node.attrs.id;
      const blockName =
        node.type.name === "heading" ? `h${node.attrs.level}` : node.type.name;

      let data = "";

      if (node.type.name === "listItem") {
        const paragraph = node.content.content.find(
          (n) => n.type.name === "paragraph"
        );
        if (paragraph) {
          paragraph.content.forEach((child) => {
            if (child.type.name === "text") data += child.text || "";
            else if (child.type.name === "hardBreak") data += "\n";
          });
        }
      } else {
        node.content.content.forEach((element) => {
          if (element.type.name === "text") {
            data += element.text || "";
          } else if (element.type.name === "hardBreak") {
            data += "\n";
          }
        });
      }

      if (id) {
        blocksByIds.set(id, {
          position: { from: pos, to: pos + node.nodeSize },
          content: data,
        });
      }

      const isCustomNode = customNode.includes(node.type.name);

      if (data.trim() === "" && !isCustomNode) {
        return;
      }

      if (blockName === "bulletList" || blockName === "orderedList") {
        context += `[${id}] ${blockName}:\n`;
      } else context += `[${id}] ${blockName}:\n${data}\n\n`;
    }
  );

  return { context, blocksByIds };
}
