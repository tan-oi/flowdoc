"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Smartphone, Tablet } from "lucide-react";

type ScreenSize = "mobile" | "tablet" | "desktop";


function ResponsiveWarningModal() {
  const [open, setOpen] = useState<boolean>(false);
  const [screenSize, setScreenSize] = useState<ScreenSize>("desktop");

  useEffect(() => {
    const checkScreenSize = (): void => {
      const width: number = window.innerWidth;

      if (width < 640) {
        // < sm (mobile)
        setScreenSize("mobile");
        setOpen(true);
      } else if (width < 768) {
        // < md (tablet)
        setScreenSize("tablet");
        setOpen(true);
      } else {
        setScreenSize("desktop");
        setOpen(false);
      }
    };

    checkScreenSize();

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const debouncedCheck = (): void => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 150);
    };

    window.addEventListener("resize", debouncedCheck);

    return (): void => {
      window.removeEventListener("resize", debouncedCheck);
      clearTimeout(timeoutId);
    };
  }, []);

  const getWarningContent = () => {
    if (screenSize === "mobile") {
      return {
        icon: <Smartphone className="h-6 w-6 text-red-500" />,
        title: "Mobile Experience Limited",
        description:
          "This application isn't made for mobile devices. Most features won't work properly on your current screen size. Please use a desktop or laptop for the full experience.",
        severity: "critical",
      };
    } else if (screenSize === "tablet") {
      return {
        icon: <Tablet className="h-6 w-6 text-amber-500" />,
        title: "Suboptimal Experience",
        description:
          "For best experience and joy, please switch to a bigger screen, the platform would work well but you might have to negotiate a bit with visual quality.",
        severity: "warning",
      };
    }
    return null;
  };

  const content = getWarningContent();

  if (!content) return null;

  const handleOpenChange = (newOpen: boolean): void => {
    setOpen(newOpen);
  };

  const handleButtonClick = (): void => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {content.icon}
            <DialogTitle className="text-lg font-semibold">
              {content.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleButtonClick}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              content.severity === "critical"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            }`}
          >
            I Understand
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ResponsiveWarningModal;