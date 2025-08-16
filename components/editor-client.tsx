"use client";

import { useSearchParams, useRouter, notFound } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, Suspense } from "react";
import Tiptap from "./tiptap";
import { EditorProvider } from "./editor-provider";
import { DocumentPanel } from "./document-panel";
import { Toolbar } from "./toolbar";
import { SidebarTrigger } from "./ui/sidebar";
import { EditorShimmer } from "./main-shimmer";

function EditorContent({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const queryClient = useQueryClient();

  const urlId = searchParams.get("id");

  console.log(`editor client rendered ${urlId}`);
  const { data, isLoading, error } = useQuery({
    queryKey: ["editor-setup", urlId, userId],
    queryFn: async () => {
      const response = await fetch("/api/editor/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedId: urlId,
          userId,
        }),
      });
      if(!response.ok) {
        const error = await response.json();
        console.log(error);
        if(response.status === 404) throw new Error("Document not found")
      }
      return response.json();
    },
    staleTime: Infinity,
    retry : false
  });

  useEffect(() => {
    if (data && data.correctId) {
      if (urlId !== data.correctId) {
        if (data.isFirstDocument) {
          const documentsQueryKey = ["documents", userId];
          queryClient.setQueryData(documentsQueryKey, (prev: any) => {
            console.log(data.document)
            if (!prev) {
              return {
                pages: [[{ ...data.document, title: "Untitled" }]],
                pageParams: [0],
              };
            }
   
            const exists = prev.pages.some((page: any) =>
              page.some((doc: any) => doc.id === data.correctId)
            );
   
            if (!exists) {
              return {
                ...prev,
                pages: [
                  [{ ...data.document, title: "Untitled" }, ...prev.pages[0]],
                  ...prev.pages.slice(1),
                ],
              };
            }
            return prev;
          });
        }
   
        window.history.replaceState(null, "", `/editor?id=${data.correctId}`);
      } else {
        setIsReady(true);
      }
    }
   }, [data, urlId, router, queryClient, userId]);

  useEffect(() => {
    if (data && urlId === data.correctId && !isReady) {
      setIsReady(true);
    }
  }, [data, urlId, isReady]);

  if(error) {
    console.log(error.message)
    notFound();
  }

  if (isLoading || !isReady) {
    return (
      <div>
        <EditorShimmer />
      </div>
    );
  }

  if (!data) {
    console.log(data);
    return <div>Error loading editor</div>;
  }

  return (
    <div>
      <div className="h-screen flex flex-col overflow-hidden">
        <EditorProvider>
          <div>
            <Toolbar id={data.correctId}>
              <SidebarTrigger />
            </Toolbar>
          </div>
          <div className="flex flex-1 gap-1 p-1 min-h-0 p-3">
            <Tiptap data={data.document.content ?? null} />
            <DocumentPanel id={data.correctId} />
          </div>
        </EditorProvider>
      </div>
    </div>
  );
}

export default function EditorClient({ userId }: { userId: string }) {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <EditorContent userId={userId} />
    </Suspense>
  );
}
