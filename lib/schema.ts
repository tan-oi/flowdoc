import z from "zod";
export const generateSchema = z.object({
    content: z.string().describe("The content to insert or use as replacement. For charts, this will be a JSON string."),
    targetBlock: z.string().describe("ID or name of the block to reference").optional(),
    position: z
      .enum(["before", "after", "replace"])
      .describe(
        "before/after for insert operations, replace for replace operations"
      ),
    operation: z
      .enum(["insert", "replace","insertReactive"])
      .describe("insert: add new content, replace: modify existing content, insertReactive: add new content with reactivity"),
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
        "Only for insertReactive operations - array of dependency identifiers that the reactive text depends on. Can include specific block IDs or 'document' for whole document dependency"
      ),
      prompt : z.string().optional().describe("for insertReactive operations - give back the user query, its very important that you give back the query.")
  });