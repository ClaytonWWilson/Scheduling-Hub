import { z } from "zod";

const AppTheme = z.enum(["LIGHTRED", "DARKRED"]);

type AppTheme = z.infer<typeof AppTheme>;

const AppSettingsType = z.object({
  theme: AppTheme,
});

type AppSettingsType = z.infer<typeof AppSettingsType>;

export { AppTheme, AppSettingsType };
