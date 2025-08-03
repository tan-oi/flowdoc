"use client";
import { MoreHorizontal, Edit, Trash2, Check, X } from "lucide-react";
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
import { useEffect, useState } from "react";
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

  const handleError = async (res: Response, router: any) => {
    if (res.status === 401) {
      router.replace("/");
      return;
    }
    try {
      const errorData = await res.json();
      throw new Error(
        errorData.message || "Something went wrong. Please try again."
      );
    } catch {
      throw new Error("Something went wrong. Please try again.");
    }
  };

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

  const { mutate: deleteDocument } = useMutation({
    mutationFn: async ({ docId }: { docId: string }) => {
      const res = await fetch(`/api/doc/${docId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        // const errorData = await res.json();
        // throw new Error(errorData.message);
        await handleError(res, router);
      }
      return res.json();
    },

    onMutate: async ({ docId }) => {
      const queryKey = ["documents", session?.user.id];

      await qc.cancelQueries({ queryKey });
      const previousData = qc.getQueryData<DocumentsData>(queryKey);

      const isCurrentlySelected = selectedId === docId;

      qc.setQueryData<DocumentsData>(queryKey, (prev) => {
        if (!prev) return prev;

        const updatedPages = prev.pages
          .map((page) => page.filter((doc) => doc.id !== docId))
          .filter((page) => page.length > 0);

        return {
          ...prev,
          pages: updatedPages,
        };
      });

      if (isCurrentlySelected) {
        const remainingDocs =
          qc.getQueryData<DocumentsData>(queryKey)?.pages.flat() || [];
        if (remainingDocs.length > 0) {
          window.history.pushState(
            null,
            "",
            `/editor?id=${remainingDocs[0].id}`
          );
        } else {
          window.history.pushState(null, "", "/editor");

          setTimeout(() => createNewDocument(), 0);
        }
      }

      qc.removeQueries({
        queryKey: ["editor-setup", session?.user?.id, docId],
        exact: true,
      });
      qc.removeQueries({ queryKey: ["doc", "history", docId] });

      toast.success("Document deleted");

      return { previousData, isCurrentlySelected, docId };
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        qc.setQueryData(["documents", session?.user.id], context.previousData);

        if (context.isCurrentlySelected) {
          window.history.pushState(null, "", `/editor?id=${context.docId}`);
        }
      }

      toast.error(error?.message || "Failed to delete document");
    },

    onSuccess: () => {},
  });

  const { mutate: createNewDocument } = useMutation({
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
        await handleError(res, router);
      }
      return res.json();
    },

    onMutate: async () => {
      const queryKey = ["documents", session?.user.id];

      await qc.cancelQueries({ queryKey });

      const previousData = qc.getQueryData<DocumentsData>(queryKey);

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticDoc = {
        id: tempId,
        title: "Untitled",
        updatedAt: new Date().toISOString(),
      };

      qc.setQueryData<DocumentsData>(queryKey, (prev) => {
        if (!prev) {
          return {
            pages: [[optimisticDoc]],
            pageParams: [0],
          };
        }
        return {
          ...prev,
          pages: [[optimisticDoc, ...prev.pages[0]], ...prev.pages.slice(1)],
        };
      });

      window.history.pushState(null, "", `/editor?id=${tempId}`);

      qc.setQueryData(["editor-setup", tempId, session?.user?.id], {
        correctId: tempId,
        document: optimisticDoc,
      });

      toast.success("Document created!");

      return { previousData, optimisticDoc, tempId };
    },

    onSuccess: (realData, variables, context) => {
      const queryKey = ["documents", session?.user.id];

      if (!context) return;
      qc.setQueryData<DocumentsData>(queryKey, (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          pages: prev.pages.map((page, pageIndex) =>
            pageIndex === 0
              ? page.map((doc) =>
                  doc.id === context.tempId
                    ? { ...realData, title: "Untitled" }
                    : doc
                )
              : page
          ),
        };
      });

      qc.removeQueries({
        queryKey: ["editor-setup", session?.user?.id, context.tempId],
        exact: true,
      });
      qc.setQueryData(["editor-setup", realData.id, session?.user?.id], {
        correctId: realData.id,
        document: realData,
      });

      window.history.replaceState(null, "", `/editor?id=${realData.id}`);
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        qc.setQueryData(["documents", session?.user.id], context.previousData);
      }

      if (context?.tempId) {
        qc.removeQueries({
          queryKey: ["editor-setup", session?.user?.id, context.tempId],
          exact: true,
        });
      }

      window.history.pushState(null, "", "/editor");

      toast.error(error.message || "Failed to create document");
    },
  });

  const { mutate: renameDocument } = useMutation({
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
        await handleError(res, router);
      }
      return res.json();
    },

    onMutate: async ({ docId, updateTitle }) => {
      const queryKey = ["documents", session?.user.id];

      await qc.cancelQueries({ queryKey });

      const previousData = qc.getQueryData<DocumentsData>(queryKey);
      const previousRenameState = { ...aboutRenameDoc };

      qc.setQueryData<DocumentsData>(queryKey, (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          pages: prev.pages.map((page: Document[]) =>
            page.map((doc: Document) =>
              doc.id === docId
                ? {
                    ...doc,
                    title: updateTitle,
                    updatedAt: new Date().toISOString(),
                  }
                : doc
            )
          ),
        };
      });

      setAboutRenameDoc({
        id: null,
        originalTitle: "",
        updateTitle: "",
      });

      toast.success("Document renamed");

      return { previousData, previousRenameState, docId, updateTitle };
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        qc.setQueryData(["documents", session?.user.id], context.previousData);
      }

      // Restore rename UI state
      if (context?.previousRenameState) {
        setAboutRenameDoc(context.previousRenameState);
      }

      toast.error(error.message || "Failed to rename document");
    },

    onSuccess: () => {},
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
            >
              Create new
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
                      <SidebarMenuItem
                        key={doc.id}
                        className={`cursor-pointer flex group rounded-lg ${
                          selectedId === doc.id ? "font-medium" : ""
                        }`}
                      >
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
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <X className="text-red-400 size-5" />
                        </button>
                      </SidebarMenuItem>
                    ) : (
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
                                  className="cursor-pointer"
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
