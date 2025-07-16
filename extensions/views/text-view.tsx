// import { Node } from "@tiptap/pm/model";
// import { Editor, NodeViewContent, NodeViewWrapper } from "@tiptap/react";

// interface NodeViewProps {
//   node: Node;
//   editor: Editor;
//   getPos: () => number | undefined;

//   updateAttributes: (attributes: Record<string, any>) => void;
//   deleteNode: () => void;
// }

// export function TextView({
//   node,
//   editor,
//   getPos,
//   updateAttributes,
//   deleteNode,
// }: NodeViewProps) {
//   return (
//     <NodeViewWrapper className="reactive-text-component">
//       <div>
//         {node.attrs.generatedContent}
//       </div>
//     </NodeViewWrapper>
//   );
// }// src/components/ReactiveTextNodeView.jsx

import React from 'react';
import { NodeViewWrapper, Editor, NodeViewProps } from '@tiptap/react';
import { forceNodeReevaluation } from '@/lib/services/llmOrchestrator';

export const TextView = (props: NodeViewProps) => {
  const { node, getPos, editor } = props;
  const { prompt, computedContent, status, errorMessage } = node.attrs;
  console.log(status);
  const handleManualUpdate = () => {
    if (editor && getPos) {
      const pos = getPos(); // Get the current position of this node in the editor
      if (typeof pos === 'number') { // Ensure pos is a valid number
        forceNodeReevaluation(editor, pos); // Trigger re-evaluation via orchestrator
      }
    }
  };

  return (
    // NodeViewWrapper is crucial for proper integration with Tiptap/ProseMirror
    // It provides features like drag handles and correct selection behavior.
    <NodeViewWrapper className="reactive-text-node-wrapper" draggable="true" data-drag-handle>
      <div className="reactive-text-header" contentEditable={false}>
        <span className="reactive-text-prompt-label">Prompt:</span>
        <span className="reactive-text-prompt-value">
          {prompt || 'No prompt set.'}
        </span>
        <button
          onClick={handleManualUpdate}
          disabled={status === 'computing'}
          className="reactive-text-update-button"
        >
          {status === 'computing' ? 'Updating...' : 'Update Manually'}
        </button>
      </div>

      <div className="reactive-text-content">
        {status === 'computing' && (
          <div className="status-indicator computing">
            <span className="spinner">🔄</span> Generating content...
          </div>
        )}
        {status === 'error' && (
          // Display error message directly using dangerouslySetInnerHTML
          <div className="status-indicator error" dangerouslySetInnerHTML={{ __html: computedContent || `<p style=\"color: red;\">Error: ${errorMessage || 'Failed to generate content.'}</p>` }}>
          </div>
        )}
        {status === 'idle' && (
          // *** Use dangerouslySetInnerHTML for HTML content ***
          <div className="generated-content-html text-black" dangerouslySetInnerHTML={{ __html: computedContent || '<p>Generated content will appear here.</p>' }}>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};


