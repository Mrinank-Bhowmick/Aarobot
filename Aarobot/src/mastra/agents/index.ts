import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";

const productSafetyAgent = new Agent({
  name: "Product Safety Agent",
  instructions:
    "You are a product safety agent. Your task is to assess whether a product is harmful or not based on its ingredients and a health profile (e.g., diabetes).",
  model: google("gemini-2.5-flash-preview-04-17"),
});

const productSafetyTool = createTool({
  id: "assess-product-harm",
  description: "Calls the product safety agent to check product safety.",
  inputSchema: z.object({
    product_code: z
      .string()
      .describe(
        "The name of the product or label to evaluate for potential harm."
      ),
  }),
  outputSchema: z.object({
    assessment: z
      .string()
      .describe("The harm assessment for the product, or an error message."),
  }),
  execute: async ({ context }) => {
    const { product_code } = context;
    try {
      const url = `https://world.openfoodfacts.net/api/v2/product/${product_code}?fields=product_name,ingredients_text`;
      const response = await fetch(url);

      if (!response.ok) {
        return {
          assessment: `Error fetching product data from Open Food Facts: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();

      if (
        !data.product ||
        (!data.product.ingredients_text && !data.product.product_name)
      ) {
        return {
          assessment: `Product with code '${product_code}' not found or does not have ingredient information on Open Food Facts.`,
        };
      }

      const ingredients =
        data.product.ingredients_text || "No ingredients listed.";
      const product_name = data.product.product_name || "Unknown Product";
      const health_history = "diabetes";

      const result = await productSafetyAgent.generate(`
          I have the following health issues: ${health_history} \n\nIngredients: ${ingredients} \n\nProduct Name(Product code): ${product_name}(${product_code})  
        `);
      const responseText = result.text;
      return { assessment: responseText };
    } catch (e: any) {
      console.error(
        `Error in assess-product-harm tool for ${product_code}:`,
        e
      );
      return {
        assessment: `Error while assessing harm for product ${product_code}: ${e.message}`,
      };
    }
  },
});

const conversationalAgent = new Agent({
  name: "ConversationalAgent",
  instructions:
    "You are a friendly and helpful conversational agent. Engage in day-to-day conversation based on the user's message. Keep your responses concise and natural.",
  model: google("gemini-2.5-flash-preview-04-17"),
});

export const Aarobot = new Agent({
  name: "Aarobot",
  instructions:
    "You are Aarobot, a healthcare assistant. You have access to two tools: \n1. 'productSafetyTool' (with ID 'assess-product-harm'): Use this to determine if a product is harmful when the user provides its name or barcode. This tool considers a predefined health profile (diabetes). \n2. 'conversational-tool': Use this for general, day-to-day conversation. \nBased on the user's query, decide which tool is appropriate. If asked about product safety, state that you are assessing it and then provide the assessment. For conversation, just chat naturally.", // Updated instructions
  model: google("gemini-2.5-flash-preview-04-17"),
  tools: { productSafetyTool },
});
