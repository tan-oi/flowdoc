import {Node} from "@tiptap/core"
export const Summary = Node.create({
    name : "summaryBlock",
    group : "block",
    content : "inline*",
    atom : true,

    renderHTML({
        HTMLAttributes
    }) {
        return ["div",{
            class:"summary-block",
            "data-block-id" : HTMLAttributes.blockId,
        },0]
    },

    parseHTML() {
        return [{
            tag : "div",
            class : "summary-block"
        }]
    },
    
})