import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { Aarobot } from "./agents";

export const mastra = new Mastra({
  agents: { Aarobot },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
