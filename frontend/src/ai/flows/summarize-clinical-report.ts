"use server";

import { model } from "@/ai/ai-instance";
import { generateObject, generateText } from "ai";
import { z } from "zod";

const SummarizeClinicalReportInputSchema = z.object({
  reportDataUri: z
    .string()
    .describe(
      "A clinical report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type SummarizeClinicalReportInput = z.infer<
  typeof SummarizeClinicalReportInputSchema
>;

const SummarizeClinicalReportOutputSchema = z.object({
  summary: z
    .string()
    .describe("A summary of the clinical report in plain language."),
  diagnoses: z
    .array(z.string())
    .describe("The diagnoses mentioned in the report."),
  medications: z
    .array(z.string())
    .describe("The medications mentioned in the report."),
  nextSteps: z.string().describe("The next steps recommended in the report."),
});
export type SummarizeClinicalReportOutput = z.infer<
  typeof SummarizeClinicalReportOutputSchema
>;

const buildSummarizePrompt = (): string => {
  return `You are a medical expert summarizing clinical reports for patients. Simplify medical jargon and provide clear explanations.

Analyze the provided clinical report image.

Summarize the key findings, diagnoses, and recommendations in plain language.
Extract the diagnoses, medications, and next steps from the report.
Return a JSON object matching the specified schema.`;
};

export async function summarizeClinicalReport(
  input: SummarizeClinicalReportInput
): Promise<SummarizeClinicalReportOutput> {
  const validatedInput = SummarizeClinicalReportInputSchema.parse(input);

  const prompt = buildSummarizePrompt();

  try {
    const { object } = await generateObject({
      model: model,
      schema: SummarizeClinicalReportOutputSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image",
              image: new URL(validatedInput.reportDataUri),
            },
          ],
        },
      ],
      mode: "json",
    });

    return object;
  } catch (error) {
    console.error("Error summarizing clinical report:", error);

    try {
      const { text } = await generateText({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${prompt}\n\nPlease provide the summary, diagnoses, medications, and next steps as plain text.`,
              },
              {
                type: "image",
                image: new URL(validatedInput.reportDataUri),
              },
            ],
          },
        ],
      });

      return {
        summary: `Could not extract structured data. Raw summary: ${text}`,
        diagnoses: [],
        medications: [],
        nextSteps: "Consult the original report or a healthcare professional.",
      };
    } catch (textError) {
      console.error("Fallback text generation also failed:", textError);
      throw new Error("Failed to summarize clinical report.");
    }
  }
}
