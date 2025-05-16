"use server";

import { model } from "@/ai/ai-instance";
import { findRelevantHealthDocs } from "@/ai/retrievers/health-knowledge-retriever";
import { generateText } from "ai";

export interface HealthAssistantInput {
  message: string;
}

export interface HealthAssistantOutput {
  response: string;
}

const buildHealthAssistantPrompt = (
  message: string,
  context: Array<{ content: Array<{ text: string }>; metadata: any }>
): string => {
  const contextText = context
    .map(
      (doc) =>
        `- ${doc.content[0]?.text || "Document content unavailable"} (Source: ${
          doc.metadata.source
        })`
    )
    .join("\n");

  return `You are an AI Health Assistant. You provide helpful and informative responses regarding general health queries, interpreting medical information in plain language, and offering suggestions for well-being.

Use the following context to answer the user's question. If the context doesn't contain the answer, say you don't have information on that topic but provide a general response based on your knowledge.

Context:
${contextText}

User's message: ${message}

IMPORTANT: You must always include a disclaimer that you are an AI and cannot provide medical advice. Advise the user to consult with a qualified healthcare professional for any medical concerns or decisions.

Respond clearly and concisely.`;
};

export async function askHealthAssistant(
  input: HealthAssistantInput
): Promise<HealthAssistantOutput> {
  try {
    const relevantDocs = await findRelevantHealthDocs(input.message);

    const prompt = buildHealthAssistantPrompt(input.message, relevantDocs);

    const { text } = await generateText({
      model: model,
      prompt: prompt,
    });

    return { response: text };
  } catch (error) {
    console.error("Error in askHealthAssistant flow:", error);

    return {
      response:
        "I'm sorry, I encountered an error processing your request. Please try again later. \n\nDisclaimer: I am an AI assistant and cannot provide medical advice. Please consult a healthcare professional.",
    };
  }
}
