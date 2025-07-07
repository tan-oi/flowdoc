  import { memo } from "react";
  import { Input } from "./input";
  import { Button } from "./button";
  import { Send, Square } from "lucide-react";
  import type { UseChatHelpers } from "ai/react";

  interface ChatInputProps {
    input: string;
    isLoading: boolean;
    error?: Error | null;

    handleInputChange: UseChatHelpers["handleInputChange"];
    stop: UseChatHelpers["stop"];
  }

  export const ChatInput = memo<ChatInputProps>(
    ({
      input,
      isLoading,
      error,
      handleInputChange,
      stop
    }) => {
      return (
        <div className="border-t p-4 bg-background rounded-b-lg flex-shrink-0">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">Error: {error.message}</p>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <Input
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              className="py-5"
              placeholder="Type your message..."
            />

            {isLoading ? (
              <Button type="button" onClick={stop} variant="outline" size="icon">
                <Square className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <Send className="size-4" />
              </Button>
            )}
          </div>
        </div>
      );
    }
  );

  ChatInput.displayName = "ChatInput";
