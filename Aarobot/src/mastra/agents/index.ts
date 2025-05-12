import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const fetchOpenFoodFactsTool = createTool({
  id: "fetch-open-food-facts",
  description: "Fetches food ingredient details from the Open Food Facts API.",
  inputSchema: z.object({
    productQuery: z
      .string()
      .describe("Product name or barcode to search on Open Food Facts"),
  }),
  outputSchema: z.object({
    ingredients: z
      .string()
      .describe(
        "Ingredient details from Open Food Facts, or an error message."
      ),
  }),
  execute: async ({ context }) => {
    console.log(
      `Simulating Open Food Facts API call for: ${context.productQuery}`
    );
    const simulatedIngredients = `Simulated ingredients for '${context.productQuery}': Organic Oats, Water, Sea Salt. Allergens: Gluten. (Note: This is simulated data.)`;
    return { ingredients: simulatedIngredients };
  },
});

const productSafetyAgent = new Agent({
  name: "ProductSafetyAgent",
  instructions:
    "You are a specialized agent for product safety. Given a product query (e.g., product name or barcode), use the 'fetch-open-food-facts' tool to get its ingredient details from Open Food Facts and return only these details.",
  model: google("gemini-2.5-flash-preview-04-17"),
  tools: { fetchOpenFoodFactsTool },
});

const productSafetyTool = createTool({
  id: "product-safety-tool",
  description:
    "Calls the ProductSafetyAgent to fetch food ingredient details using a product name or barcode.",
  inputSchema: z.object({
    productQuery: z.string().describe("Product name or barcode"),
  }),
  outputSchema: z.object({
    ingredientDetails: z.string().describe("Food ingredient details"),
  }),
  execute: async ({ context }) => {
    const result = await productSafetyAgent.generate(
      `Fetch ingredient details for the product: ${context.productQuery}.`
    );
    return { ingredientDetails: result.text };
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
    "You are Aarobot, a healthcare assistant. You have access to two tools: \n1. 'product-safety-tool': Use this to fetch food ingredient details when the user asks about a specific product (provide its name or barcode). \n2. 'conversational-tool': Use this for general, day-to-day conversation. \nBased on the user's query, decide which tool is appropriate and use it. If asked about ingredients, state that you are fetching them and then provide the details. For conversation, just chat naturally.",
  model: google("gemini-2.5-flash-preview-04-17"),
  tools: { productSafetyTool },
});
