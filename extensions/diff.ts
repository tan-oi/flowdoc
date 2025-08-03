import { Extension } from "@tiptap/core";
import { diffWords } from "diff";
import { Plugin, PluginKey, EditorState, Transaction } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

let currentEditor: any = null;

export const setCurrentEditor = (editor: any) => {
  currentEditor = editor;
};

export const DiffExtension = Extension.create({
  name: "diffing",

  addProseMirrorPlugins() {
    const plugin: Plugin = new Plugin({
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
            const { to, from, payload, type, replaceType } = meta;
            console.log(payload," ", replaceType);
            const { changePayload, originalPayload } = payload;
            if (type === "replace" && !changePayload) return newState;

            if (!changePayload) {
              return newState;
            }

            if (type === "replace") {
              console.log('working?');
              if (
                currentEditor &&
                from >= 0 &&
                to <= tr.doc.content.size &&
                from <= to
              ) {
                try {
                  const hideText = Decoration.inline(from, to, {
                    style: "display : none !important",
                    class: "diff-hidden-original",
                  });

                  if (replaceType === "inplace") {
                    console.log('inline');
                    const replaceDecor = Decoration.widget(from, () => {
                      const container = document.createElement("div");
                      container.className = "widget-container inplace-change";

                      const buttonContainer = document.createElement("div");
                      buttonContainer.className = "diff-buttons";

                      const acceptBtn = document.createElement("div");
                      acceptBtn.innerText = "Accept";
                      acceptBtn.className = "accept-btn";

                      acceptBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (currentEditor) {
                          currentEditor
                            .chain()
                            .scrollIntoView()
                            .insertContentAt(
                              {
                                from,
                                to,
                              },
                              changePayload
                            )
                            .setMeta("clearDiff", true)
                            .run();
                        }
                      };

                      const rejectBtn = document.createElement("div");
                      rejectBtn.innerText = "Reject";
                      rejectBtn.className = "reject-btn";
                      rejectBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (currentEditor) {
                          currentEditor
                            .chain()
                            .setMeta("clearDiff", true)
                            .run();
                        }
                      };

                      buttonContainer.appendChild(acceptBtn);
                      buttonContainer.appendChild(rejectBtn);

                      const newDiv = document.createElement("div");

                      newDiv.className = `diff-content`;
                      const diffCalc = diffWords(
                        originalPayload,
                        changePayload
                      );

                      console.log(diffCalc);
                      newDiv.innerHTML = diffToSentence(diffCalc);

                      container.appendChild(buttonContainer);
                      container.appendChild(newDiv);

                      return container;
                    });

                    newState = newState.add(tr.doc, [replaceDecor, hideText]);
                  } else if (replaceType === "normal") {
                    console.log('hello');
                      const replaceOverlay = Decoration.widget(from, () => {
                        const container = document.createElement("div");
                        container.className = "overlay-container";

                        const buttonContainer = document.createElement("div");
                        buttonContainer.className = "diff-buttons";

                        const acceptBtn = document.createElement("div");
                        acceptBtn.innerText = "Accept";
                        acceptBtn.className = "accept-btn";

                        acceptBtn.onclick = (e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if(currentEditor) {
                            currentEditor.chain()
                            .scrollIntoView()
                            .insertContentAt({
                              from,to
                            }, changePayload).setMeta("clearDiff",true).run();
                          }
                        }

                        const rejectBtn = document.createElement("div");
                        rejectBtn.innerText = "Reject";
                        rejectBtn.className = "reject-btn";
                        rejectBtn.onclick = (e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if(currentEditor) {
                            currentEditor.chain().setMeta("clearDiff",true).run();
                          }
                        }

                        buttonContainer.appendChild(acceptBtn);
                        buttonContainer.appendChild(rejectBtn);

                        const oldDiv = document.createElement("div");
                        const newDiv = document.createElement("div");

                        oldDiv.className = "old-overlay-content";
                        newDiv.className = "new-overlay-content"

                        oldDiv.innerHTML = originalPayload;
                        newDiv.innerHTML = changePayload;

                        container.appendChild(buttonContainer);
                        container.appendChild(oldDiv);
                        container.appendChild(newDiv);

                        return container;
                      })

                      newState = newState.add(tr.doc,[hideText,replaceOverlay]);
                  }
                } catch (err) {
                  console.log(err);
                }
              }
            }

            if (type === "insert") {
              try {
                const insertDecor = Decoration.widget(from, () => {
                  const container = document.createElement("div");
                  container.className = `widget-container`;

                  const buttonContainer = document.createElement("div");
                  buttonContainer.className = `diff-buttons`;

                  const acceptBtn = document.createElement("div");
                  acceptBtn.innerText = "Accept";
                  acceptBtn.className = "accept-btn";
                  acceptBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (currentEditor) {
                      currentEditor
                        .chain().scrollIntoView()
                        .insertContentAt(from, changePayload)
                        .setMeta("clearDiff", true)
                        .focus(from + (changePayload?.length || 0))
                        .run();
                    }
                  };

                  const rejectBtn = document.createElement("div");
                  rejectBtn.innerText = "Reject";
                  rejectBtn.className = "reject-btn";
                  rejectBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (currentEditor) {
                      currentEditor.chain().setMeta("clearDiff", true).run();
                    }
                  };

                  buttonContainer.appendChild(acceptBtn);
                  buttonContainer.appendChild(rejectBtn);

                  const divData = document.createElement("div");
                  divData.innerHTML = changePayload;
                  divData.className = "diff-content";

                  container.appendChild(buttonContainer);
                  container.appendChild(divData);

                  return container;
                });
                newState = newState.add(tr.doc, [insertDecor]);
              } catch (err) {}
            }
          }
          return newState;
        },
      },
      props: {
        decorations(state: EditorState): DecorationSet {
          return plugin.getState(state);
        },
      },
    });
    return [plugin];
  },
});

function diffToSentence(diffs: any[]): string {
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
      result += `<span class=\"insert\">${part.value}</span>`;
    } else if (part.removed) {
      result += `<span class=\"remove\">${part.value}</span>`;
    } else {
      result += part.value;
    }
  }
  return result;
}