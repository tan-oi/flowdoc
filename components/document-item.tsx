import { memo, useCallback } from "react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Input } from "./ui/input";
import { Check, Edit, MoreHorizontal, Trash2, X } from "lucide-react";
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

import { AboutDoc, Document } from "@/lib/types";

export const DocumentItem = memo(
  ({
    doc,
    isSelected,
    isRenaming,
    renameState,
    onRename,
    onRenameChange,
    onRenameSubmit,
    onRenameCancel,
    onNavigate,
    onDelete,
  }: {
    doc: Document;
    isSelected: boolean;
    isRenaming: boolean;
    renameState: AboutDoc;
    onRename: (docId: string, title: string) => void;
    onRenameCancel: (docId: string) => void;
    onRenameSubmit: (docId: string) => void;
    onDelete: (docId: string) => void;
    onNavigate: (docId: string) => void;
    onRenameChange: (value: string) => void;
  }) => {
    const handleRenameKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onRenameSubmit(doc.id);
        }
        if (e.key === "Escape") {
          e.preventDefault();
          onRenameCancel(doc.id);
        }
      },
      [doc.id, onRenameSubmit, onRenameCancel]
    );

    const handleRenameBlur = useCallback(() => {
      onRenameCancel(doc.id);
    }, [doc.id, onRenameCancel]);

    const handleRenameSubmitClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        onRenameSubmit(doc.id);
      },
      [doc.id, onRenameSubmit]
    );

    const handleRenameCancelClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        onRenameCancel(doc.id);
      },
      [doc.id, onRenameCancel]
    );

    const handleNavigateClick = useCallback(() => {
      onNavigate(doc.id);
    }, [doc.id, onNavigate]);

    const handleRenameClick = useCallback(() => {
      onRename(doc.id, doc.title);
    }, [doc.id, doc.title, onRename]);

    const handleDeleteClick = useCallback(() => {
      onDelete(doc.id);
    }, [doc.id, onDelete]);

    const handleDropdownClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
    }, []);
    if (isRenaming) {
      return (
        <SidebarMenuItem className={`cursor-pointer flex group rounded-lg`}>
          <Input
            className="bg-transparent border-none rounded"
            value={renameState.updateTitle || ""}
            onChange={(e) => {
              onRenameChange(e.target.value);
            }}
            onKeyDown={handleRenameKeyDown}
            autoFocus
            onBlur={handleRenameBlur}
          />

          <button
            className="p-[1px] mr-1 cursor-pointer"
            onClick={handleRenameSubmitClick}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Check className="text-emerald-400 size-5" />
          </button>

          <button
            className="p-[1px] cursor-pointer"
            onClick={handleRenameCancelClick}
            onMouseDown={(e) => e.preventDefault()}
          >
            <X className="text-red-400 size-5" />
          </button>
        </SidebarMenuItem>
      );
    }

    return (
      <>
        <SidebarMenuItem
          key={doc.id}
          className={`cursor-pointer group rounded-lg ${
            isSelected ? "bg-accent text-accent-foreground font-medium" : ""
          }`}
        >
          <SidebarMenuButton asChild>
            <div className="flex items-center justify-between w-full">
              <span onClick={handleNavigateClick} className={`flex-1 truncate`}>
                {doc.title}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <button
                    className="opacity-100 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity"
                    onClick={handleDropdownClick}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleRenameClick}
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
                        <AlertDialogTitle>Delete Document</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {doc.title} ? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteClick}
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
      </>
    );
  }
);

DocumentItem.displayName = "document-item";
