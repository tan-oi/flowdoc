import { memo } from "react";

export const EmptyState = memo(() => (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="text-center">
        <p className="text-xs text-gray-400 mt-1">
          Ask questions or get help with your writing
        </p>
      </div>
    </div>
  ));

  EmptyState.displayName = "EmptyState";
