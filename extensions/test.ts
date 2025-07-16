import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import componentView from './views/component-view'

export const testNode = () => Node.create({
  name: 'reactComponent',

  group: 'block',
  content : "",
  atom: true,

  addAttributes() {
    return {
      count: {
        default: 10,
      
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

//tiptap automagically does render your attritute and everything, provided its saved with current name both sides.