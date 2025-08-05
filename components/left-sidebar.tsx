"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

import { SidebarShimmer } from "./sidebar-shimmer";
import { createNewDocu, deleteDoc, renameDoc } from "@/hooks/useDocuments";
import { DocumentItem } from "./document-item";

import { AboutDoc, Document } from "@/lib/types";

export function LeftSideBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const { data: session, isPending } = authClient.useSession();

  const { mutate: createNewDocument } = createNewDocu();

  const { mutate: renameDocument } = renameDoc();
  const { mutate: deleteDocument } = deleteDoc();

  const [aboutRenameDoc, setAboutRenameDoc] = useState<AboutDoc>({
    id: null,
    originalTitle: "",
    updateTitle: "",
  });

  const handleRename = useCallback((docId: string, title: string) => {
    setAboutRenameDoc({
      id: docId,
      originalTitle: title,
      updateTitle: title,
    });
  }, []);

  const handleRenameCancel = useCallback((docId: string) => {
    setAboutRenameDoc({
      id: null,
      originalTitle: "",
      updateTitle: "",
    });
  }, []);

  const handleRenameSubmit = useCallback(
    (docId: string) => {
      const trimmedTitle = aboutRenameDoc.updateTitle?.trim();
      if (
        trimmedTitle &&
        trimmedTitle !== "" &&
        trimmedTitle !== aboutRenameDoc.originalTitle
      ) {
        renameDocument({
          docId,
          updateTitle: trimmedTitle,
          setAboutRenameDoc,
          aboutRenameDoc,
        });
      } else {
        handleRenameCancel(docId);
      }
    },
    [aboutRenameDoc, renameDocument, handleRenameCancel]
  );

  const handleRenameChange = useCallback((value: string) => {
    setAboutRenameDoc((prev) => ({
      ...prev,
      updateTitle: value,
    }));
  }, []);

  const handleDelete = useCallback(
    (docId: string) => {
      deleteDocument({
        docId,
        selectedId,
      });
    },
    [deleteDocument, selectedId]
  );

  const handleNavigate = useCallback((docId: string) => {
    window.history.replaceState(null, "", `/editor?id=${docId}`);
  }, []);

  const handleCreateNew = useCallback(() => {
    createNewDocument();
  }, [createNewDocument]);

  // const handleRenameCancel = (docId: string) => {
  //   console.log(docId);
  //   setAboutRenameDoc({
  //     id: null,
  //     originalTitle: "",
  //     updateTitle: "",
  //   });
  // };

  // const handleRenameSubmit = (docId: string) => {
  //   console.log("submit working");
  //   const trimmedTitle = aboutRenameDoc.updateTitle?.trim();
  //   console.log(trimmedTitle);
  //   if (
  //     trimmedTitle &&
  //     trimmedTitle !== "" &&
  //     trimmedTitle !== aboutRenameDoc.originalTitle
  //   ) {
  //     renameDocument({
  //       docId,
  //       updateTitle: trimmedTitle,
  //       setAboutRenameDoc,
  //       aboutRenameDoc,
  //     });
  //   } else {
  //     handleRenameCancel(docId);
  //   }
  // };

  // const handleDelete = (docId: string) => {
  //   console.log("Delete doc:", docId);
  //   deleteDocument({
  //     docId,
  //     selectedId,
  //   });
  // };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["documents", session?.user.id],
      queryFn: async ({ pageParam = 0 }) => {
        const response = await fetch(
          `/api/recent?offset=${pageParam}&limit=5`
        );
        return response.json();
      },
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < 5) return undefined;
        return allPages.length * 5;
      },
      initialPageParam: 0,
      enabled: !!session?.user?.id,
      staleTime: Infinity,
    });

  const allDocuments = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data?.pages]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  if (isPending || !data) {
    return <SidebarShimmer />;
  }

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
            <SidebarMenu className="overflow-y-scroll scrollbar-none overscroll-contain">
              {isLoading ? (
                <SidebarMenuItem>Loading...</SidebarMenuItem>
              ) : (
                allDocuments.map((doc: Document) => (
                  <DocumentItem
                    key={doc.id}
                    doc={doc}
                    isSelected={selectedId === doc.id}
                    isRenaming={aboutRenameDoc.id === doc.id}
                    renameState={aboutRenameDoc}
                    onRename={handleRename}
                    onRenameCancel={handleRenameCancel}
                    onRenameSubmit={handleRenameSubmit}
                    onRenameChange={handleRenameChange}
                    onDelete={handleDelete}
                    onNavigate={handleNavigate}
                  />
                ))
              )}
              {hasNextPage && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <span
                      onClick={() => fetchNextPage()}
                      className="text-sm cursor-pointer text-muted-foreground"
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

    {/* <SidebarFooter className="">
        
      <div className="px-2 py-4 rounded bg-card/80">
              <p className="text-gray-50 text-xs">
                {session?.user?.name}
                </p> 
      </div>
    </SidebarFooter> */}
    </Sidebar>
  );
}
