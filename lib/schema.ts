// import z from "zod";
// export const generateSchema = z.object({
//     content: z.string().describe("The content to insert or use as replacement. For charts, this will be a JSON string."),
//     targetBlock: z.string().describe("ID or name of the block to reference").optional(),
//     position: z
//       .enum(["before", "after", "replace"])
//       .describe(
//         "before/after for insert operations, replace for replace operations"
//       ),
//     operation: z
//       .enum(["insert", "replace","insertReactive"])
//       .describe("insert: add new content, replace: modify existing content, insertReactive: add new content with reactivity"),
//     replaceType: z
//       .enum(["normal", "inplace"])
//       .optional()
//       .describe(
//         "Only for replace operations - normal: replace entire block, inplace: modify within block structure"
//       ),
//     chartType: z
//       .enum(["bar", "pie"])
//       .optional()
//       .describe("Specify the type of chart to render."),
//     dependencyScope: z
//       .array(z.string())
//       .optional()
//       .describe(
//         "If it is an insertReactive operations always always either add a array of dependency identifiers that the reactive text depends on. Can include specific block IDs or 'document' for whole document dependency"
//       ),
//       prompt : z.string().optional().describe("for insertReactive operations - give back the user query, its very important that you give back the query.")
//   });
import { z } from "zod";
export const generateSchema = z
  .object({
    content: z
      .string()
      .describe(
        "The content to insert or use as replacement. For charts, this will be a JSON string."
      ),
    targetBlock: z
      .string()
      .describe("ID or name of the block to reference")
      .optional(),
    position: z
      .enum(["before", "after", "replace"])
      .describe(
        "before/after for insert operations, replace for replace operations"
      )
      .optional(),
    operation: z
      .enum(["insert", "replace", "insertReactive"])
      .describe(
        "insert: add new content, replace: modify existing content, insertReactive: add new content with reactivity"
      ),
    replaceType: z
      .enum(["normal", "inplace"])
      .optional()
      .describe(
        "Only for replace operations - normal: replace entire block, inplace: modify within block structure"
      ),
    chartType: z
      .enum(["bar", "pie"])
      .optional()
      .describe("Specify the type of chart to render."),
    dependencyScope: z
      .array(z.string())
      .optional()
      .describe(
        "If it is an insertReactive operations always always either add a array of dependency identifiers that the reactive text depends on. Can include specific block IDs or 'document' for whole document dependency"
      ),
    prompt: z
      .string()
      .describe(
        "for every operations - give back the user query, its very important that you give back the query."
      ),
  })
  .refine(
    (data) => {
      if (data.operation === "insertReactive") {
        return (
          data.dependencyScope && data.dependencyScope.length > 0 && data.prompt
        );
      }
      return true;
    },
    {
      message:
        "insertReactive operations require both dependencyScope and prompt fields",
    }
  );

  export const staticBlockSchema = z.object({
    content: z
      .string()
      .describe(
        "The content to insert or use as replacement. For charts, this will be a JSON string"
      ),
    operation: z
      .enum(["insert", "replace"])
      .describe("insert: add new content, replace: modify existing content"),
    replaceType: z
      .enum(["normal", "inplace"])
      .optional()
      .describe(
        "REQUIRED for replace operations - normal: replace entire block, inplace: modify within block structure. Must be omitted for insert operations."
      ),
    prompt: z
      .string()
      .describe(
        "for every operations - give back the user query, its very important that you give back the query."
      ),
    targetBlock: z
      .string()
      .optional()
      .describe(
        "For INSERT: Optional positioning reference block ID (only include if user specifies location like 'after paragraph 2'). For REPLACE: Required - the specific block ID containing content to replace for diff preview."
      ),
    position: z
      .enum(["before", "after"])
      .describe("For INSERT operations only - position relative to targetBlock when positioning is specified")
      .optional(),
    chartType: z
      .enum(["bar", "pie"])
      .optional()
      .describe("Specify the type of chart to render."),
  });

export const reactiveBlockSchema = z.object({
  content: z
    .string()
    .describe("Initial HTML content for text or JSON string for charts."),
  operation: z.literal("insertReactive"),
  prompt: z
    .string()
    .describe(
      "give back the user query, its very important that you give back the query"
    ),
  dependencyScope: z
    .array(z.string())
    .describe(
      "Array of specific block IDs that should trigger updates, or 'document' for document-wide dependencies"
    ),
  chartType: z
    .enum(["bar", "pie"])
    .describe("Specify the type of chart to render")
    .optional(),
  targetBlock: z
    .string()
    .describe("Block ID for positioning - omit unless user specifies location")
    .optional(),
  position: z
    .enum(["before", "after"])
    .describe("Position relative to target block")
    .optional(),
});
