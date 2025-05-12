import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { Aarobot } from "./agents";
import { D1Store } from "@mastra/cloudflare-d1";
import { LibSQLStore } from "@mastra/libsql";

export const mastra = new Mastra({
  agents: { Aarobot },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
  storage: new LibSQLStore({
    url: "file:./mastra.db",
  }),
});
