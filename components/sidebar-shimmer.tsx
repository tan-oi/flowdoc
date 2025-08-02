import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
  } from "@/components/ui/sidebar";
  import { Separator } from "@/components/ui/separator";
  import { Skeleton } from "@/components/ui/skeleton";
  
  export function SidebarShimmer() {
    return (
      <Sidebar className="bg-sidebar">
        <SidebarContent>
          {/* Header */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-lg font-bold font-italic font-mono">
             FlowDocs
            </SidebarGroupLabel>
            <Separator className="my-2" />
          </SidebarGroup>
  
          {/* Create Button */}
          <SidebarGroup>
            <SidebarGroupContent>
              <Skeleton className="h-10 w-full" />
            </SidebarGroupContent>
          </SidebarGroup>
  
          {/* Recent Documents */}
          <SidebarGroup>
            <SidebarGroupLabel>Recent Documents</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Document items shimmer */}
                {Array.from({ length: 8 }).map((_, index) => (
                  <SidebarMenuItem key={index} className="cursor-pointer group rounded-lg">
                    <div className="flex items-center justify-between w-full p-2">
              
                      <Skeleton className={`h-4 ${
                        index === 0 ? 'w-32' : 
                        index === 1 ? 'w-24' : 
                        index === 2 ? 'w-28' : 
                        index === 3 ? 'w-20' : 
                        index === 4 ? 'w-36' : 
                        index === 5 ? 'w-26' : 
                        index === 6 ? 'w-30' : 'w-22'
                      }`} />
                      
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </SidebarMenuItem>
                ))}
                
              
                <SidebarMenuItem>
                  <div className="p-2">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }