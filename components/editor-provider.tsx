'use client';
import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Editor } from '@tiptap/react';

interface EditorContextType {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

interface EditorProviderProps {
  children: ReactNode;
}

export function EditorProvider({ children }: EditorProviderProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  
  
  const contextValue = useMemo(() => ({
    editor,
    setEditor
  }), [editor]); 
  
  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext(): EditorContextType {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within EditorProvider');
  }
  return context;
}