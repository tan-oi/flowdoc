# FlowDocs

A reactive document editor using Next.js, React, Prisma ORM, AI-SDK, Better-Auth, Tailwind, Tiptap, React-Query, Zustand.

Generates content from conversational prompts. Blocks output charts, summaries, analysis. Nodes recompute when context changes or gets updated. History panel exposes prompts and guards context window size. Interface avoids clutter.

## Stack

Next.js
Tiptap
Prisma ORM
Better-Auth
Tailwind
React Query
Zustand
AI-SDK

## Demo

[Watch a short demo](https://www.youtube.com/watch?v=EyPwyjhCJvY)

## V2 Plan

FlowDocs v2 will introduce a separate application layer so request handling, product logic, and external systems can evolve independently.

- Keep it as one app, but group the code by feature: documents, editor, AI, reactive blocks, connected sources, and background tasks.
- Keep routes focused on receiving and validating requests while the application layer decides what work needs to happen.
- Let AI tasks run in the background, show their progress, keep their history, and retry after failures.
- Update reactive blocks only when the information they use has changed.
- Support connections to Google Drive, Gmail, Slack, and other services without building each one directly into the editor.
- Let users combine actions into a flow, such as gathering sources, extracting information, drafting a response, and updating the document.

V2 is currently being designed. This repository contains the working v1.
