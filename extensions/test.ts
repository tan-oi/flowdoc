import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import componentView from './views/component-view'

export const testNode = () => Node.create({
  name: 'reactComponent',

  group: 'block',
  content : "inline*",
  atom: false,

  addAttributes() {
    return {
      count: {
        default: 0,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'react-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['react-component', mergeAttributes(HTMLAttributes)]
  },

  addCommands() {
    return {
      insertReactComponent:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          })
        },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(componentView)
  },
})
