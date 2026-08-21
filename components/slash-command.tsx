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
          <div className="bg-neutral-900/95 backdrop-blur-md border border-white/10 shadow-xl rounded-xl min-w-[240px] px-1.5 py-1.5">
            <p className="text-[11px] text-neutral-500 font-medium px-2 py-1.5">
              No results
            </p>
          </div>
        </SlashCmd.Empty>
        <SlashCmd.List className="bg-neutral-900/95 backdrop-blur-md border border-white/10 shadow-xl rounded-xl min-w-[240px] max-h-72 overflow-y-auto overscroll-contain scrollbar-none px-1.5 py-1.5">
          <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider px-2 pt-1.5 pb-1">
            Suggestions
          </p>
          {suggestionItems.map((item) => (
            <SlashCmd.Item
              key={item.title}
              value={item.title}
              className="group flex items-center gap-2.5 px-2 py-1.5 text-sm text-neutral-300 select-none cursor-pointer rounded-md transition-colors data-[selected=true]:bg-white/10 data-[selected=true]:text-white"
              onCommand={(val) => item.command(val)}
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-md border border-white/10 bg-white/5 text-neutral-300 group-data-[selected=true]:text-white group-data-[selected=true]:border-white/20">
                <item.icon size={14} />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-medium">{item.title}</span>
                {(item as { tooltip?: string }).tooltip && (
                  <span className="text-[11px] text-neutral-500 group-data-[selected=true]:text-neutral-400">
                    {(item as { tooltip?: string }).tooltip}
                  </span>
                )}
              </span>
            </SlashCmd.Item>
          ))}
        </SlashCmd.List>
      </SlashCmd.Cmd>
    </SlashCmd.Root>
  );
};

export default SlashCommand;