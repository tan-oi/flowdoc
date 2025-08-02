import { Skeleton } from "./ui/skeleton";

export function EditorShimmer() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div>
   
        <div className="border-b p-3">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      <div className="flex flex-1 gap-1 p-1 min-h-0 p-3">
   
        <div className="flex-[2.5] shadow-sm bg-background/10 overflow-hidden">
          <div className="h-full overflow-hidden p-4 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="space-y-3 mt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-3 mt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>

        {/* Document panel shimmer */}
        <div className="flex flex-1 flex-col h-full border-l-px shadow-sm bg-muted rounded-lg min-w-[300px] text-card-foreground py-2 px-1 border-r-card overflow-y-auto">
          <div className="py-1 px-1 w-full h-full">
            {/* Tabs shimmer */}
            <div className="w-full mb-4">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Empty state shimmer */}
            <div className="flex items-center justify-center h-32">
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
