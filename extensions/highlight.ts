import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

export const MyDecorationExtension = Extension.create({
  name: 'myDecoration',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('myDecoration'),
        
        state: {
          init() {
            return DecorationSet.empty
          },
          
          apply(tr, decorationSet) {
            decorationSet = decorationSet.map(tr.mapping, tr.doc)
            
            
            const decorations = []
            
           
            tr.doc.descendants((node, pos) => {
              if (node.isText) {
                const text = node.text
                let index = 0
                while ((index = text.indexOf('hello', index)) !== -1) {
                  const from = pos + index
                  const to = from + 5
                  decorations.push(
                    Decoration.inline(from, to, {
                      class: 'highlight'
                    })
                  )
                  index += 5
                }
              }
            })
            
            return decorationSet.add(tr.doc, decorations)
          }
        },
        
        props: {
          decorations(state) {
            return this.getState(state)
          }
        }
      })
    ]
  }
})