import { z } from "zod";

const Page = z.enum(["TASKS", "DCAP", "TOOLS", "STATS", "SETTINGS"]);

type Page = z.infer<typeof Page>;

export { Page };
