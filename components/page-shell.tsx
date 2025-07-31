  // "use client";

  // import { useQuery } from "@tanstack/react-query";
  // import { useRouter, useSearchParams } from "next/navigation";

  // import { useEffect, useState } from "react";
  // import { EditorProvider } from "./editor-provider";
  // import { Toolbar } from "./toolbar";
  // import { SidebarTrigger } from "./ui/sidebar";
  // import Tiptap from "./tiptap";


  // export function PageShell({
  //   docId,
  //   type,
  // }: {
  //   docId: string;
  //   type: "temporary" | "permanent";
  // }) {
   

  //   const router = useRouter();
  //   const searchParams = useSearchParams();
  //   let urlId = searchParams.get("id");
  //   const [isNew, setIsNew] = useState(type === "temporary");


  //   // useEffect(() => {
  //   //   router.push(`/editor?id=${docId}`);
  //   //   console.log('changes happen in here');
  //   // }, [docId]);
  //   useEffect(() => {
     
  //       router.replace(`/editor?id=${docId}`);

  //   }, []);


  //   // const router = useRouter();
  //   // let urlId = searchParams.get("id");

  //   // const [docId, setDocId] = useState<string | null>(existingDocId || urlId);
  //   // const [mounted, setMounted] = useState(false);

  //   // const [isNewDoc, setIsNewDoc] = useState(!existingDocId && !urlId);

  //   // useEffect(() => {
  //   //   setMounted(true);
  //   // }, []);

  //   // useEffect(() => {
  //   //   if (!mounted) return;

  //   //   if (!urlId && !existingDocId && !docId) {
  //   //     const newId = crypto.randomUUID();
  //   //     setDocId(newId);
  //   //     setIsNewDoc(true);
  //   //   } else if (urlId && urlId !== docId) {
  //   //     setDocId(urlId);
  //   //     setIsNewDoc(false);
  //   //   }
  //   // }, [urlId, existingDocId, mounted]);

  //   // const shouldFetchData = !isNewDoc && Boolean(docId);
  //   const shouldFetchData = docId === urlId;
  //   console.log(docId, "heu", urlId);
  //   const { data, isLoading } = useQuery({
  //     queryKey: ["doc", docId],
  //     queryFn: () => fetch(`/api/doc/${docId}`).then((res) => res.json()),
  //     staleTime: Infinity,
  //     enabled: !shouldFetchData
  //   });
  //   console.log(data);

  //   // if (!mounted || (shouldFetchData && isLoading)) {
  //   //   return <div>Loading...</div>;
  //   // }

  //   // if (!docId) return <div>Loading...</div>;
  //   if(isLoading) return <p>Wait</p>
  //   // const assignId = () => {
  //   //   if (docId && !urlId) {
  //   //     router.replace(`/editor?id=${docId}`);
  //   //   }
  //   // };

  //   return (
  //     <>
  //       <div className="h-screen flex flex-col overflow-hidden">
  //         <EditorProvider>
  //           <div className="flex-shrink-0">
  //             <Toolbar>
  //               <SidebarTrigger />
  //             </Toolbar>
  //           </div>

  //           <div className="flex-1 flex gap-1 p-1 min-h-0 p-3">
  //             <Tiptap data={data ? data.content : null} />

  //             {/* <DocumentPanel isExisting={shouldFetchData} id={docId} /> */}
  //           </div>
  //         </EditorProvider>
  //       </div>
  //     </>
  //   );
  // }
