import { useSession } from "@/lib/auth-client";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { AboutDoc, Document } from "@/lib/types";

type DocumentsData = InfiniteData<Document[], number>;

const handleError = async (res: Response) => {
  if (res.status === 401) {
    window.location.replace("/");
    return;
  }
  let errorData;
  try {
    errorData = await res.json();
  } catch (err) {
    console.log("parse error", err);
    throw new Error("Something went wrong. Please try again.");
  }

  throw new Error(errorData.message || "Something went wrong, try again!");
};

export function createNewDocu() {
  const qc = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/doc", {
        method: "POST",
      });
      if (!res.ok) {
        await handleError(res);
      }
      return res.json();
    },

    onMutate: async () => {
      const queryKey = ["documents", session?.user?.id];

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
}

export function renameDoc() {
  const qc = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({
      docId,
      updateTitle,
      setAboutRenameDoc,
      aboutRenameDoc,
    }: {
      docId: string;
      updateTitle: string;
      setAboutRenameDoc: (obj: AboutDoc) => void;
      aboutRenameDoc: AboutDoc;
    }) => {
      const res = await fetch(`/api/doc/${docId}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: updateTitle,
        }),
      });
      if (!res.ok) {
        await handleError(res);
      }
      return res.json();
    },

    onMutate: async ({
      docId,
      updateTitle,
      aboutRenameDoc,
      setAboutRenameDoc,
    }) => {
      const queryKey = ["documents", session?.user?.id];

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

      toast.success("Document renamed!");

      return {
        previousData,
        previousRenameState,
        docId,
        updateTitle,
        setAboutRenameDoc,
      };
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        qc.setQueryData(["documents", session?.user.id], context.previousData);
      }

      if (context?.previousRenameState) {
        context.setAboutRenameDoc(context.previousRenameState);
      }

      console.log(error.message);
      toast.error(error.message || "Failed to rename document");
    },

    onSuccess: () => {},
  });
}

export function deleteDoc() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const createDocMutation = createNewDocu();

  return useMutation({
    mutationFn: async ({
      docId,
      selectedId,
    }: {
      docId: string;
      selectedId: string | null;
    }) => {
      const res = await fetch(`/api/doc/${docId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        await handleError(res);
      }
      return res.json();
    },

    onMutate: async ({ docId, selectedId }) => {
      const queryKey = ["documents", session?.user.id];

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

          setTimeout(() => createDocMutation.mutate(), 0);
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
}
