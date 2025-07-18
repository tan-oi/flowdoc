
import { Node as ProseMirrorNode } from "@tiptap/pm/model";

interface BlockInfo {
  position: {
    to: number;
    from: number;
  };
  content: string;
}

interface GetStateResult {
  context: string;
  blocksByIds: Map<string, BlockInfo>;
}

export function getState(doc: any): GetStateResult {
  let context = "Current document context :\n\nDocument blocks :\n";

  const blocksByIds = new Map<string, BlockInfo>();

  doc.descendants(
    (node: ProseMirrorNode, pos: number, parent?: ProseMirrorNode) => {
      if (!node.type.isBlock) return;

      if (node.type.name === "paragraph" && parent?.type?.name === "listItem")
        return;

      let id = node.attrs.id;
      let blockName =
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

      // if (data.trim() === "" && (blockName === "paragraph" || blockName === "listItem")) {
      //   return;
      // }

      if (blockName === "bulletList" || blockName === "orderedList") {
        context += `[${id}] ${blockName}:\n`;
      } else context += `[${id}] ${blockName}:\n${data}\n\n`;
    }
  );

  console.log(blocksByIds);

  return { context, blocksByIds };
}
