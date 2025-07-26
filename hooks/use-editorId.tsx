
// 'use client';
// import { useState, useCallback } from 'react';
// import { useRouter, useParams } from 'next/navigation';

// export const useEditorId = (id : string) => {
//   const router = useRouter();
//   const params = useParams();
  

 
//   const isNewSession = Array.isArray(params.id) ? params.id[0] : params.id || null;
  
//   const triggerNavigation = useCallback(() => {
//     if (!isNewSession) {
//       router.replace(`/editor/${id}`);
//     }
//   }, [isNewSession, id, router]);

//   return { docId : isNewSession , triggerNavigation };
// };

'use client';
import { useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

export const useEditorId = (id: string) => {
  const router = useRouter();
  const params = useParams();
  const hasNavigated = useRef(false);
  
  const docId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isNewSession = !docId; 
  
  const triggerNavigation = useCallback(() => {
   
    if (isNewSession && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace(`/editor?id=${id}`,{scroll : false});
    }
  }, [isNewSession, id, router]);

  return { docId, triggerNavigation };
};