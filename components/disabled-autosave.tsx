"use client";
import { X } from "lucide-react";
import { useState } from "react";

export function DisabledSave() {
  const [showAutoSaveWarning, setShowAutoSaveWarning] = useState(
    localStorage.getItem("autoSaveWarningDismissed") !== "true"
  );

  const dismissWarning = () => {
    setShowAutoSaveWarning(false);
    localStorage.setItem("autoSaveWarningDismissed", "true");
  };

  return (
    <>
      {showAutoSaveWarning && (
        <>
          <div className="sm:flex sm:items-center space-x-1.5 text-xs text-yellow-400 hidden">
            <span>⚠️</span>
            <span className="">
              Auto-save is currently disabled, please manually save to not lose
              anything
            </span>
            <button
              onClick={dismissWarning}
              className="ml-1 text-yellow-600 hover:text-yellow-400"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="text-xs text-yellow-400 sm:hidden flex items-center">
            <div>Auto save disabled, save manually</div>
            <button
              onClick={dismissWarning}
              className="ml-1 text-yellow-600 hover:text-yellow-400"
            >
              <X className="size-4" />
            </button>
          </div>
        </>
      )}
    </>
  );
}
