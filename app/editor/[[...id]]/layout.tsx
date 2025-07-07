import { TextOverlayAi } from "@/components/ai-text-overlay";
import { LeftSideBar } from "@/components/left-sidebar";


import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";

export default function EditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider
    style={{
      "--sidebar-width": "13rem",
      "--sidebar-width-mobile": "20rem",
    }}
>  
      <LeftSideBar />
      <TextOverlayAi/>
      <SidebarInset>

        <div className="h-full">
          <main className="relative bg-muted/30 h-full">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


