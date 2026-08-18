export interface EditorSetupIdentity<TDocument = unknown> {
  correctId: string;
  editorInstanceKey?: string;
  document?: TDocument;
}

export function getEditorInstanceKey(setup: EditorSetupIdentity) {
  return setup.editorInstanceKey ?? setup.correctId;
}

export function isTemporaryDocumentId(id: string) {
  return id.startsWith("temp-");
}

export function isDocumentStillSelected(
  selectedDocumentId: string | null,
  expectedDocumentId: string,
) {
  return selectedDocumentId === expectedDocumentId;
}

export function createEditorSetup<TDocument>(
  correctId: string,
  document: TDocument,
  editorInstanceKey = correctId,
): EditorSetupIdentity<TDocument> {
  return {
    correctId,
    editorInstanceKey,
    document,
  };
}
