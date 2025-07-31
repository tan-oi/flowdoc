import { memo } from "react";
import { type Message as VercelMessage } from "ai/react";
import { SafeHtml } from "./safe-html";

export const Message = memo(({ message }: { message: VercelMessage }) => {
    const isUser = message.role === "user";
  
    return (
      <div className={`${isUser ? "justify-end" : ""} flex`}>
        <div
          className={`p-2 rounded-xl ${
            isUser ? "bg-blue-500 text-white" : "bg-secondary text-white"
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <SafeHtml html={message.content} />
          )}
        </div>
      </div>
    );
  });
  Message.displayName = "Message";
