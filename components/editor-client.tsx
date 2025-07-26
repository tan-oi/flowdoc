// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useQuery } from "@tanstack/react-query";
// import {  useEffect, useState } from "react";
// import Tiptap from "./tiptap";
// import { EditorProvider } from "./editor-provider";
// import { DocumentPanel } from "./document-panel";
// import { Toolbar } from "./toolbar";
// import { SidebarTrigger } from "./ui/sidebar";

// export default function EditorClient({ userId }: { userId: string }) {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [isReady, setIsReady] = useState(false);

//   const urlId = searchParams.get("id");

//   const { data, isLoading } = useQuery({
//     queryKey: ["editor-setup", urlId, userId],
//     queryFn: async () => {
//       const response = await fetch("/api/editor/setup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           requestedId: urlId,
//           userId,
//         }),
//       });
//       return response.json();
//     },
//     staleTime: Infinity,
//   });

//   console.log(data);


//   useEffect(() => {
//     if (data && data.correctId) {
//       if (urlId !== data.correctId) {
//         console.log("🟦 CLIENT: About to router.replace", data.correctId);
//         window.history.replaceState(null, "", `/editor?id=${data.correctId}`);
//       } else {
//         setIsReady(true);
//       }
//     }
//   }, [data, urlId, router]);


//   useEffect(() => {
  
//     if (data && urlId === data.correctId && !isReady) {
//       setIsReady(true);
//     }
//   }, [data, urlId, isReady]);




//   if (isLoading || !isReady) {
//     return <div></div>;
//   }

//   if (!data) {
//     console.log(data);
//     return <div>Error loading editor</div>;
//   }
  
//   return (
//     <div>
//       <div className="h-screen flex flex-col overflow-hidden">
//         <EditorProvider>
//         <div>
//                 <Toolbar id={data.correctId}>
//                   <SidebarTrigger/>
//                 </Toolbar>

//               </div>
//           <div className="flex flex-1 gap-1 p-1 min-h-0 p-3">
             
//           <Tiptap data={data.document.content ?? null} />
//           <DocumentPanel id={data.correctId} />
//           </div>
//         </EditorProvider>
//       </div>
//     </div>
//   );
// }


"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, Suspense } from "react";
import Tiptap from "./tiptap";
import { EditorProvider } from "./editor-provider";
import { DocumentPanel } from "./document-panel";
import { Toolbar } from "./toolbar";
import { SidebarTrigger } from "./ui/sidebar";

function EditorContent({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const urlId = searchParams.get("id");

  const { data, isLoading } = useQuery({
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
      return response.json();
    },
    staleTime: Infinity,
  });

  console.log(data);

  useEffect(() => {
    if (data && data.correctId) {
      if (urlId !== data.correctId) {
        console.log("🟦 CLIENT: About to router.replace", data.correctId);
        window.history.replaceState(null, "", `/editor?id=${data.correctId}`);
      } else {
        setIsReady(true);
      }
    }
  }, [data, urlId, router]);

  useEffect(() => {
    if (data && urlId === data.correctId && !isReady) {
      setIsReady(true);
    }
  }, [data, urlId, isReady]);

  if (isLoading || !isReady) {
    return <div></div>;
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
              <SidebarTrigger/>
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