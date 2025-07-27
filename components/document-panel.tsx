"use client";
import { useHistoryState } from "@/store/useHistoryStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { formatTimestamp } from "@/lib/functions/calculateTime";
import { SafeHtml } from "./safe-html";
import { Clipboard, Clock } from "lucide-react";
import { Button } from "./ui/button";
export function DocumentPanel({ id }: { id: string }) {
  const setActiveDocument = useHistoryState((s) => s.setActiveDocument);

  const entries = useHistoryState(
    useShallow((state) => state.batchedEntries[id] || [])
  );

  async function handleCopy(htmlContent: any) {
    try {
      await navigator.clipboard.writeText(htmlContent);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  useEffect(() => {
    setActiveDocument(id);
  }, [id, setActiveDocument]);

  const { data, isLoading } = useQuery({
    queryKey: ["doc", "history", `${id}`],
    queryFn: () => fetch(`/api/doc/history/${id}`).then((res) => res.json()),
    staleTime: Infinity,
  });

  console.log(data);

  if (isLoading)
    return (
      <div className="flex flex-1 flex-col h-full border shadow-sm bg-card rounded min-w-[300px]">
        {" "}
      </div>
    );

  const totalHistory = [...(data ?? []), ...entries];

  console.log(entries, "from entires");
  return (
    <>
      <div className="flex flex-1 flex-col h-full border-l-px shadow-sm bg-card rounded-lg min-w-[300px] text-card-foreground py-2 px-1 border-r-card overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent ">
        <div className="py-1 px-1 w-full h-full">
          <Tabs className="w-full h-full" defaultValue="history">
            <TabsList className="w-full">
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-white data-[state=active]:rounded-none data-[state=active]:border-none"
              >
                History
              </TabsTrigger>

              <TabsTrigger
                value="ideas"
                className="data-[state=active]:bg-white data-[state=active]:rounded-none data-[state=active]:border-none"
              >
                Ideas
              </TabsTrigger>
            </TabsList>

            <TabsContent className="w-full h-full" value="history">
              {totalHistory.length === 0 ? (
                <>
                  <div className="flex items-center justify-center h-full">
                    <p className="text-neutral-400">
                      {" "}
                      Ask, and reference, anytime {":)"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    {totalHistory.map((h, i) => (
                      <div
                        key={i}
                        className="flex flex-col rounded-lg bg-gradient-to-r from-transparent via-neutral-800 to-transparent border border-px px-2 py-4 gap-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-[4px]">
                            <Clock className="w-3 h-3 dark:text-[#faf8b5f0] text-emerald-400" />
                            <p className="dark:text-[#faf8b5f0] text-emerald-400 text-xs font-mono">
                              {formatTimestamp(h.createdAt)}
                            </p>
                          </div>
                          <div>
                            {h?.type === "text" ? (
                              <Button
                                size={"sm"}
                                onClick={() => handleCopy(h.content)}
                                className="cursor-pointer"
                              >
                                <Clipboard className="w-4 h-4" />
                              </Button>
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="break-words text-md font-medium text-bold line-clamp-1">
                            {h.prompt}
                          </p>
                          <SafeHtml
                            html={h.content}
                            className="text-[16px] text-gray-300 line-clamp-4 leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="ideas">ideas rendering</TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

//#181818 #b2b2b200
