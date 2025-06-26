"use client"
import { useEditorContext } from "./editor-provider";
import { Button } from "./ui/button";

export function Chat() {
    const { editor } = useEditorContext();
    return (
        <>
        <Button onClick={() => {
            console.log(editor?.getJSON());
        }}>
               get json 
        </Button>
        
        <Button onClick={() => {
            editor?.chain().focus().insertContentAt({
                from : 0,
                to : 10
            },`this working?`).run();
        }}>
            add to cursor
        </Button>
            </>
    )
}