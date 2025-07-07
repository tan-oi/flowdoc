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
        <SlashCmd.Empty>No command found</SlashCmd.Empty>
        <SlashCmd.List>
          <p className="text-[10px] text-gray-400 font-semibold uppercase p-1">
            Suggestions
          </p>
          {suggestionItems.map((item: Command) => (
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
