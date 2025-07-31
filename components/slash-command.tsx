import { SlashCmd } from "@harshtalks/slash-tiptap";
import { suggestionItems, type Command } from "@/lib/slash-commands";
import { Editor } from "@tiptap/core";

interface SlashCommandProps {
  editor: Editor;
}

const SlashCommand = ({ editor }: SlashCommandProps) => {
  return (
    <SlashCmd.Root editor={editor}>
      <SlashCmd.Cmd>
        <SlashCmd.Empty>
          <SlashCmd.Item key={suggestionItems[0].title}
          value={suggestionItems[0].title}
          className="flex items-center gap-2 p-1.5 text-sm font-medium text-gray-500 select-none data-[selected=true]:bg-gray-100 rounded-md"
          onCommand={(val) => {suggestionItems[0].command(val)}}
          >
            {suggestionItems[0].title}
          </SlashCmd.Item>
        </SlashCmd.Empty>
        <SlashCmd.List className="bg-neutral-900 px-4 rounded-lg min-w-[130px]">
          <p className="text-[10px] text-gray-400 font-semibold uppercase py-2 px-1">
            Suggestions
          </p>
          {suggestionItems.map((item) => (
            <SlashCmd.Item
              key={item.title}
              value={item.title}
              className="flex items-center gap-2 p-1.5 text-sm font-medium text-gray-500 select-none data-[selected=true]:bg-gray-100 rounded-md"
              onCommand={(val) => item.command(val)}>
              <item.icon size={16} />
              {item.title}
            </SlashCmd.Item>
          ))}
        </SlashCmd.List>
      </SlashCmd.Cmd>
    </SlashCmd.Root>
  );
};

export default SlashCommand;
