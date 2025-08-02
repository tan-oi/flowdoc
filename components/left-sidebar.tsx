"use client";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  LoaderIcon,
  Check,
  X,
  Loader,
  Loader2,
} from "lucide-react";
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
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { SidebarShimmer } from "./sidebar-shimmer";

interface AboutDoc {
  id: string | null;
  originalTitle?: string;
  updateTitle?: string;
}
interface Document {
  id: string;
  title: string;
  updatedAt: string;
}

type DocumentsData = InfiniteData<Document[], number>;

export function LeftSideBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const qc = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const [aboutRenameDoc, setAboutRenameDoc] = useState<AboutDoc>({
    id: null,
    originalTitle: "",
    updateTitle: "",
  });

  const handleRename = (docId: string, title: string) => {
    setAboutRenameDoc({
      id: docId,
      originalTitle: title,
      updateTitle: title,
    });
  };

  const handleRenameCancel = (docId: string) => {
    console.log(docId);
    setAboutRenameDoc({
      id: null,
      originalTitle: "",
      updateTitle: "",
    });
  };

  const handleRenameSubmit = (docId: string) => {
    console.log("submit working");
    const trimmedTitle = aboutRenameDoc.updateTitle?.trim();
    console.log(trimmedTitle);
    if (
      trimmedTitle &&
      trimmedTitle !== "" &&
      trimmedTitle !== aboutRenameDoc.originalTitle
    ) {
      renameDocument({
        docId,
        updateTitle: trimmedTitle,
      });
    } else {
      handleRenameCancel(docId);
    }
  };

  const handleDelete = (docId: string) => {
    console.log("Delete doc:", docId);
    deleteDocument({
      docId,
    });
  };

  // const { mutate: deleteDocument, isPending: isDeleting } = useMutation({
  //   mutationFn: async ({ docId }: { docId: string }) => {
  //     const res = await fetch(`/api/doc/${docId}`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     if (!res.ok) {
  //       const errorData = await res.json();
  //       throw new Error(errorData.message);
  //     }
  //     return res.json();
  //   },
  //   onSuccess: (data, variables) => {
  //     console.log(variables);
  //     toast.success("Deleted, redirecting to the new one");

  //     window.history.pushState(null, "", "/editor");
    //     qc.setQueryData<DocumentsData>(
    //       ["documents", session?.user.id],
    //       (prev) => {
    //         if (!prev) return prev;

    //         return {
    //           ...prev,
    //           pages: prev.pages.map((p: Document[]) =>
    //             p.filter((doc: Document) => doc.id !== variables.docId)
    //           ),
    //         };
    //       }
    //     );
  //     qc.removeQueries({
  //       queryKey: ["editor-setup", session?.user?.id, variables.docId],
  //       exact: true,
  //     });
  //     qc.removeQueries({ queryKey: ["doc", history, variables.docId] });
  //   },
  //   onError(error) {
  //     console.log(error);
  //     toast.error(error?.message);
  //   },
  // });

  const { mutate: deleteDocument, isPending: isDeleting } = useMutation({
 
    mutationFn: async ({ docId }: { docId: string }) => {
      const res = await fetch(`/api/doc/${docId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }
      return res.json();
    },
    
    onSuccess: (data, variables) => {
      const deletedDocId = variables.docId;
      const isCurrentlySelected = selectedId === deletedDocId;
  
      qc.setQueryData<DocumentsData>(
        ["documents", session?.user.id],
        (prev) => {
          if (!prev) return prev;
  
          const updatedPages = prev.pages
            .map((page) => page.filter((doc) => doc.id !== deletedDocId))
            .filter((page) => page.length > 0); 
  
          if (isCurrentlySelected) {
            const remainingDocs = updatedPages.flat();
            
            if (remainingDocs.length > 0) {
              window.history.pushState(null, "", `/editor?id=${remainingDocs[0].id}`);
            } else {
              setTimeout(() => createNewDocument(), 100);
            }
          }
  
          return {
            ...prev,
            pages: updatedPages,
          };
        }
      );
  
      qc.removeQueries({
        queryKey: ["editor-setup", session?.user?.id, deletedDocId],
        exact: true,
      });
      qc.removeQueries({ queryKey: ["doc", "history", deletedDocId] });
  
      toast.success("Document deleted");
    },
    
    onError(error) {
      console.log(error);
      toast.error(error?.message);
    },
  });

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
      if (!res.ok) {
        const errorData = await res.json();

        if (res.status === 401) {
          router.replace("/");
        } else {
          console.log(errorData);
          throw new Error(errorData.message);
        }
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("created!");
      qc.setQueryData(["editor-setup", data.id, session?.user?.id], {
        correctId: data.id,
        document: data,
      });

      qc.setQueryData<DocumentsData>(
        ["documents", session?.user.id],
        (prev) => {
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
        }
      );
      window.history.pushState(null, "", `/editor?id=${data.id}`);
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  const { mutate: renameDocument, isPending: isRenaming } = useMutation({
    mutationFn: async ({
      docId,
      updateTitle,
    }: {
      docId: string;
      updateTitle: string;
    }) => {
      const res = await fetch(`api/doc/${docId}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: updateTitle,
          userId: session?.user?.id,
          docId,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();

        if (res.status === 401) {
          router.replace("/");
        } else {
          throw new Error(errorData.message);
        }
      }
      return res.json();
    },

    onSuccess(data, variables, context) {
      console.log(data);
      console.log(variables);
      console.log(context);
      qc.setQueryData<DocumentsData>(
        ["documents", session?.user.id],
        (prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            pages: prev.pages.map((p: Document[]) =>
              p.map((doc: Document) =>
                doc.id === variables.docId
                  ? {
                      ...doc,
                      title: variables.updateTitle,
                    }
                  : doc
              )
            ),
          };
        }
      );

      handleRenameCancel(variables.docId);
    },
    onError(error, variables, context) {
      console.log(error);
      console.log(context);
      console.log(variables);
      toast.error(error.message);
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

  if (isPending || !data) {
    return <SidebarShimmer />;
  }
  const allDocuments = data?.pages.flat() || [];

  return (
    <Sidebar className="bg-sidebar">
      <SidebarContent className="">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold font-italic font-mono">
            FlowDocs
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
                  <div key={doc.id}>
                    {aboutRenameDoc.id === doc.id ? (
                      <>
                        <SidebarMenuItem
                          key={doc.id}
                          className={`cursor-pointer flex group rounded-lg ${
                            selectedId === doc.id ? "font-medium" : ""
                          }`}
                        >
                          {isRenaming ? (
                            <>
                              <Loader className="animate-spin" />
                            </>
                          ) : (
                            <>
                              <Input
                                className="bg-transparent border-none rounded"
                                value={aboutRenameDoc.updateTitle || ""}
                                onChange={(e) =>
                                  setAboutRenameDoc((p) => ({
                                    ...p,
                                    updateTitle: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleRenameSubmit(doc.id);
                                  }
                                  if (e.key === "Escape") {
                                    e.preventDefault();
                                    handleRenameCancel(doc.id);
                                  }
                                }}
                                autoFocus
                                onBlur={() => handleRenameCancel(doc.id)}
                              />

                              <button
                                className="p-[1px] mr-1 cursor-pointer"
                                onClick={() => handleRenameSubmit(doc.id)}
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <Check className="text-emerald-400 size-5" />
                              </button>

                              <button
                                className="p-[1px] cursor-pointer"
                                onClick={() => handleRenameCancel(doc.id)}
                                onMouseDown={(e) => e.preventDefault()} // Prevent input from losing focus
                              >
                                <X className="text-red-400 size-5" />
                              </button>
                            </>
                          )}
                        </SidebarMenuItem>
                      </>
                    ) : (
                      <>
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
                                  <DropdownMenuItem className="cursor-pointer"
                                    onClick={() =>
                                      handleRename(doc.id, doc.title)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Rename
                                  </DropdownMenuItem>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem

                                        onSelect={(e) => e.preventDefault()}
                                        className="text-destructive cursor-pointer"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete Document
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete
                                          {doc.title}? This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDelete(doc.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          {isDeleting ? (
                                            <>
                                              <Loader2 className="animate-spin size-4" />
                                            </>
                                          ) : (
                                            <>{"Delete"}</>
                                          )}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </>
                    )}
                  </div>
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
