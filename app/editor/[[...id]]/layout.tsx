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
    <SidebarProvider>
      <LeftSideBar />
      <SidebarInset>

        <div className="flex flex-1 h-full">
          <main className="flex-1 p-4 relative bg-muted/30 h-full">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
