// extensions/slash-command.ts
import { Extension } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'

export interface SlashCommandProps {
  suggestion: {
    items: ({ query }: { query: string }) => any[]
    render: () => {
      onStart: (props: any) => void
      onUpdate: (props: any) => void  
      onKeyDown: (props: any) => boolean
      onExit: () => void
    }
  }
}

export const SlashCommand = Extension.create<SlashCommandProps>({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        pluginKey: new PluginKey('slashCommand'),
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
        items: ({ query }: { query: string }) => [],
        render: () => ({
          onStart: () => {},
          onUpdate: () => {},
          onKeyDown: () => false,
          onExit: () => {},
        }),
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})