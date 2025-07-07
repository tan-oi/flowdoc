import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, EditorState } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const DiffExtension = Extension.create({
  name: "diffing",

  addProseMirrorPlugins() {
    const plugin = new Plugin({
      key: new PluginKey("diffDecor"),

      state: {
        init() {
          return DecorationSet.empty;
        },
        apply(tr, oldState: DecorationSet): DecorationSet {
          if (tr.getMeta("clearDiff")) {
            return DecorationSet.empty;
          }
          let newState: DecorationSet;
          try {
            newState = oldState.map(tr.mapping, tr.doc);
          } catch (error) {
            console.warn(
              "Decoration mapping failed, resetting decorations:",
              error
            );
            newState = DecorationSet.empty;
          }

          const meta = tr.getMeta("createDiff");
          if (meta) {
            const { to, from, changePayload, type } = meta;
          

            if (!changePayload) {
              console.log("failed");
              return newState;
            }

            if (type === "replace") {
              if (from >= 0 && to <= tr.doc.content.size && from <= to && Array.isArray(changePayload)) {
                try {
                  const hideText = Decoration.inline(from, to, {
                    style: "display: none !important;",
                    class: "diff-hidden-original",
                  });

                  const widgetDecor = Decoration.widget(from, () => {
                    const container = document.createElement("div");
                    container.className = `widget-replace-container`

                    const divData = document.createElement("div");
                    console.log("div creating");
                    divData.innerHTML = diffToSentence(changePayload);
                    divData.className = "diff-content";

                    const buttonContainer = document.createElement('div');
                    buttonContainer.className = `diff-buttons`;
                    
                    const acceptBtn = document.createElement("div");
                    acceptBtn.innerText = 'Accept'
                    acceptBtn.className = 'accept-btn'; 
                    // acceptBtn.onclick = (e) => {
                    //   e.preventDefault();
                    //   handleAccept();
                    // }


                    const rejectBtn = document.createElement("div");
                    rejectBtn.innerText = 'Reject'
                    rejectBtn.className = 'reject-btn'; 
                    // acceptBtn.onclick = (e) => {
                    //   e.preventDefault();
                    //   handleReject();
                    // }

                    buttonContainer.appendChild(acceptBtn);
                    buttonContainer.appendChild(rejectBtn);
                    container.appendChild(divData);
                    container.appendChild(buttonContainer);


                    return container;
                  });

                  newState = newState.add(tr.doc, [hideText, widgetDecor]);
                } catch (error) {
                  console.warn("Failed to add decoration:", error);
                }
              }
               else {
                console.warn("Invalid decoration positions:", {
                  from,
                  to,
                  docSize: tr.doc.content.size,
                });
              }
            }
             else if (type === "insert") {
              
              try {
               
                const insertDecor = Decoration.widget(from, () => {
                  const container = document.createElement("div");
                  container.className = `widget-container`
                  const divData = document.createElement("div");
                  console.log("div creating");
                  divData.innerHTML = changePayload;
                  divData.className = "diff-content";


                  
                  const buttonContainer = document.createElement('div');
                  buttonContainer.className = `diff-buttons`;
                  
                  const acceptBtn = document.createElement("div");
                  acceptBtn.innerText = 'Accept'
                  acceptBtn.className = 'accept-btn'; 
                  acceptBtn.onclick = (e) => {
                    e.preventDefault();
                    // handleAccept();
                  }


                  const rejectBtn = document.createElement("div");
                  rejectBtn.innerText = 'Reject'
                  rejectBtn.className = 'reject-btn'; 
                  acceptBtn.onclick = (e) => {
                    e.preventDefault();
                    // handleReject();
                  }

                  buttonContainer.appendChild(acceptBtn);
                    buttonContainer.appendChild(rejectBtn);
                    container.appendChild(divData);
                    container.appendChild(buttonContainer);



                  return container;
                });
                newState = newState.add(tr.doc, [insertDecor]);
              } catch (err) {
                console.log("failed");
              }
            } else {
              const trail = Decoration.widget(from, () => {
                const span = document.createElement("span");
                console.log("delete");

                return span;
              });

              newState = newState.add(tr.doc, [trail]);
            }
          }
          return newState;
        },
      },
      props: {
        decorations(state: EditorState) {
          return plugin.getState(state);
        },
      },
    });
    
    return [plugin];
  },
});

function diffToSentence(diffs) {
  let result = "";

  for (let i = 0; i < diffs.length; i++) {
    const part = diffs[i];
    const prevPart = i > 0 ? diffs[i - 1] : null;

    if (
      prevPart &&
      (prevPart.added || prevPart.removed) &&
      (part.added || part.removed) &&
      prevPart.added !== part.added &&
      !prevPart.value.endsWith(" ") &&
      !part.value.startsWith(" ")
    ) {
      result += " ";
    }

    if (part.added) {
      result += `<span class="insert">${part.value}</span>`;
    } else if (part.removed) {
      result += `<span class="remove">${part.value}</span>`;
    } else {
      result += part.value;
    }
  }

  return result;
}



