"use client";
import { MoreHorizontal, Edit, Trash2, LoaderIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

export function LeftSideBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const qc = useQueryClient();
  const { data: session, isPending } = authClient.useSession();

  const handleRename = (docId: string) => {
    console.log("Rename doc:", docId);
  };

  const handleDelete = (docId: string) => {
    console.log("Delete doc:", docId);
  };
  const handleNextLoading = (id: string) => {
    console.log(id, "loading");
  }
  const { mutate: createNewDocument, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/doc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: (data) => {
      qc.setQueryData(["editor-setup", data.id, session?.user?.id], {
        correctId: data.id,
        document: data,
      });

      qc.setQueryData(["documents", session?.user.id], (prev) => {
        if (!prev)
          return {
            pages: [
              [
                {
                  ...data,
                  title: "Untitled1",
                },
              ],
            ],
            pageParams: [0],
          };
        return {
          ...prev,
          pages: [
            [
              {
                ...data,
                title: "Untitled",
              },
              ...prev.pages[0],
            ],
            ...prev.pages.slice(1),
          ],
        };
      });
      window.history.pushState(null, "", `/editor?id=${data.id}`);
    },
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["documents", session?.user.id],
      queryFn: async ({ pageParam = 0 }) => {
        const response = await fetch(
          `/api/recent?offset=${pageParam}&limit=15`
        );
        return response.json();
      },
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < 15) return undefined;
        return allPages.length * 15;
      },
      initialPageParam: 0,
      enabled: !!session?.user?.id,
      staleTime: Infinity,
    });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  if (isPending) return <div>Loading sidebar</div>;

  if (!data) {
    return (
      <>
        <div>Sidbear loading</div>
      </>
    );
  }

  const allDocuments = data?.pages.flat() || [];

  return (
    <Sidebar className="bg-sidebar">
      <SidebarContent className="">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold font-italic font-mono">
            Vellum
          </SidebarGroupLabel>
          <Separator className="my-2" />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <Button
              className="w-full cursor-pointer"
              onClick={() => createNewDocument()}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <LoaderIcon className="animate-spin mr-2" />
                  <span>Creating..</span>
                </>
              ) : (
                <>Create new</>
              )}
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Recent Documents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <SidebarMenuItem>Loading...</SidebarMenuItem>
              ) : (
                allDocuments.map((doc) => (
                  <SidebarMenuItem
                    key={doc.id}
                    className={`cursor-pointer group rounded-lg ${
                      selectedId === doc.id
                        ? "bg-accent text-accent-foreground font-medium"
                        : ""
                    }`}
                  >
                    <SidebarMenuButton asChild>
                      <div className="flex items-center justify-between w-full">
                        <span
                          onClick={() =>
                            window.history.replaceState(
                              null,
                              "",
                              `/editor?id=${doc.id}`
                            )
                          }
                          className={`flex-1 truncate`}
                        >
                          {doc.title}
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            className="cursor-pointer"
                          >
                            <button
                              className="opacity-100 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRename(doc.id)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4"  />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader> 
                                  <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{doc.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(doc.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
              {hasNextPage && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <span
                      onClick={() => fetchNextPage()}
                      className="text-sm text-muted-foreground"
                    >
                      {isFetchingNextPage ? "Loading..." : "Load More"}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
