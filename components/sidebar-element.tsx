
/* eslint-disable */
import { memo, useCallback } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  LoaderIcon,
  Check,
  X,
  Loader,
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
import { Input } from "./ui/input";

interface Document {
  id: string;
  title: string;
}
export const DocumentItem = memo(
  ({
    doc,
    selectedId,
    isRenaming,
    renameTitle,
    onRename,
    onRenameCancel,
    onRenameSubmit,
    onRenameChange,
    onDelete,
    onNavigate,
  }: {
    doc: Document;
    selectedId: string | null;
    isRenaming: boolean;
    renameTitle: string;
    onRename: (id: string, title: string) => void;
    onRenameCancel: () => void;
    onRenameSubmit: () => void;
    onRenameChange: (value: string) => void;
    onDelete: (id: string) => void;
    onNavigate: (id: string) => void;
  }) => {
    const isSelected = selectedId === doc.id;

    // Memoize keyboard handler
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onRenameSubmit();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          onRenameCancel();
        }
      },
      [onRenameSubmit, onRenameCancel]
    );

    // Memoize click handlers
    const handleRenameClick = useCallback(
      () => onRename(doc.id, doc.title),
      [onRename, doc.id, doc.title]
    );
    const handleDeleteClick = useCallback(
      () => onDelete(doc.id),
      [onDelete, doc.id]
    );
    const handleNavigateClick = useCallback(
      () => onNavigate(doc.id),
      [onNavigate, doc.id]
    );
    const handleStopPropagation = useCallback(
      (e: React.MouseEvent) => e.stopPropagation(),
      []
    );
    const handlePreventDefault = useCallback(
      (e: React.MouseEvent) => e.preventDefault(),
      []
    );

    if (isRenaming) {
      return (
        <SidebarMenuItem
          className={`cursor-pointer flex group rounded-lg ${
            isSelected ? "font-medium" : ""
          }`}
        >
          <Input
            className="bg-transparent border-none rounded"
            value={renameTitle}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            onBlur={onRenameCancel}
          />
          <button
            className="p-[1px] mr-1 cursor-pointer"
            onClick={onRenameSubmit}
            onMouseDown={handlePreventDefault}
          >
            <Check className="text-emerald-400 size-5" />
          </button>
          <button
            className="p-[1px] cursor-pointer"
            onClick={onRenameCancel}
            onMouseDown={handlePreventDefault}
          >
            <X className="text-red-400 size-5" />
          </button>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem
        className={`cursor-pointer group rounded-lg ${
          isSelected ? "bg-accent text-accent-foreground font-medium" : ""
        }`}
      >
        <SidebarMenuButton asChild>
          <div className="flex items-center justify-between w-full">
            <span onClick={handleNavigateClick} className="flex-1 truncate">
              {doc.title}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <button
                  className="opacity-100 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity"
                  onClick={handleStopPropagation}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleRenameClick}>
                  <Edit className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {doc.title}? This
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
    );
  }
);
