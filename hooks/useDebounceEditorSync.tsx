import { useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import debounce from 'lodash.debounce';

export const useDebouncedEditorSync = (editor: Editor | null) => {
  const debouncedSyncRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    if (!editor) return;

   
    const debouncedSync = debounce(() => {
      console.log('🔄 Debounced editor sync triggered!');
      console.log('Editor content:', editor.getText());
      console.log('Editor JSON:', editor.getJSON());
      
      // TODO: Update Zustand store here
      // updateEditorState(editor.getJSON());
    }, 5000); // 500ms debounce

    debouncedSyncRef.current = debouncedSync;

    // Set up the editor update handler
    const handleUpdate = () => {
      console.log('📝 Editor updated (before debounce)');
      debouncedSync();
    };

    editor.on('update', handleUpdate);

    // Cleanup
    return () => {
      editor.off('update', handleUpdate);
      debouncedSync.cancel();
    };
  }, [editor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debouncedSyncRef.current) {
        debouncedSyncRef.current.cancel();
      }
    };
  }, []);
};