import { TextOverlayAi } from "@/components/ai-text-overlay";
import { LeftSideBar } from "@/components/left-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function EditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("--- LAYOUT re-rendering on the SERVER ---");

  return (
  <>
    <SidebarProvider
      style={{
        "--sidebar-width": "12rem",
        "--sidebar-width-mobile": "20rem",
      } as React.CSSProperties}
    >
      <LeftSideBar />
      <TextOverlayAi />
      <SidebarInset>
        <div className="h-full">
          <main className="relative bg-muted/30 h-full">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  </>
  );
}
