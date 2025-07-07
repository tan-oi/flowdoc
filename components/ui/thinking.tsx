import { memo } from "react";

export const LoadingIndicator = memo(() => (
    <div className="flex gap-3">
      <div className="flex-1">
        <div className="inline-block rounded-2xl rounded-bl-md bg-gray-100 p-3">
          <div className="flex gap-1">
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">thinking...</div>
      </div>
    </div>
  ));