import { format } from "date-fns";
import { z } from "zod";

type AMXLData = {
  stationCode: string;
  startTime: Date | null;
  endTime: Date | null;
  exclusion: boolean;
  planned: string;
  spr: string;
  lmcp: string;
  reductions: string;
  aa: boolean;
  rtwLink: string;
  adhocLink: string;
};

type AMXLErrors = {
  stationCode: string;
  startTime: string;
  endTime: string;
  planned: string;
  spr: string;
  lmcp: string;
  reductions: string;
  rtwLink: string;
  adhocLink: string;
};

type SameDayData = {
  startTime: string | undefined;
  stationCode: string | undefined;
  routingType: "samedaysunrise" | "samedayam" | undefined;
  bufferPercent: number | undefined;
  dpoLink: string | undefined;
  dpoCompleteTime: string | undefined;
  routeCount: number | undefined;
  fileTbaCount: number | undefined;
  routedTbaCount: number | undefined;
  endTime: string | undefined;
};

type SameDayErrors = {
  stationCode: string | undefined;
  routingType: string | undefined;
  bufferPercent: string | undefined;
  dpoLink: string | undefined;
  routeCount: string | undefined;
  routedTbaCount: string | undefined;
};

const LMCPExportableData = z.object({
  source: z.string(),
  namespace: z.string(),
  type: z.string(),
  stationCode: z.string().regex(/^[A-Z]{3}[1-9]{1}$/, "Invalid Station Code"),
  waveGroupName: z.string(),
  shipOptionCategory: z.string(),
  addressType: z.string(),
  packageType: z.string(),
  ofdDate: z.coerce.date().transform((date) => format(date, "yyyy-MM-dd")),
  ead: z.coerce.date().transform((date) => format(date, "yyyy-MM-dd")),
  cluster: z.string(),
  fulfillmentNetworkType: z.string(),
  volumeType: z.string(),
  week: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(53, "Cannot be > 53"),
  f: z.string(),
  value: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cannot be negative"),
});

type LMCPExportableData = z.infer<typeof LMCPExportableData>;

const LMCPTaskData = LMCPExportableData.merge(
  z.object({
    requested: z.coerce
      .number({ invalid_type_error: "Must be a number" })
      .min(0, "Cannot be negative"),
    currentLmcp: z.coerce
      .number({ invalid_type_error: "Must be a number" })
      .min(0, "Cannot be negative"),
    currentAtrops: z.coerce
      .number({ invalid_type_error: "Must be a number" })
      .min(0, "Cannot be negative"),
    pdr: z.coerce
      .number({ invalid_type_error: "Must be a number" })
      .min(0, "Cannot be negative"),
    simLink: z
      .string()
      .regex(
        /^https:\/\/sim\.amazon\.com\/issues\/[A-Z]{1}[0-9]+$/g,
        "Invalid SIM link"
      ),
  })
);

type LMCPTaskData = z.infer<typeof LMCPTaskData>;

const LMCPInputs = z.object({
  source: z.string(),
  namespace: z.string(),
  type: z.string(),
  stationCode: z.string(),
  waveGroupName: z.string(),
  shipOptionCategory: z.string(),
  addressType: z.string(),
  packageType: z.string(),
  ofdDate: z.union([z.coerce.date(), z.literal("")]),
  ead: z.union([z.coerce.date(), z.literal("")]),
  cluster: z.string(),
  fulfillmentNetworkType: z.string(),
  volumeType: z.string(),
  week: z.string(),
  f: z.string(),
  requested: z.string(),
  currentLmcp: z.string(),
  currentAtrops: z.string(),
  pdr: z.string(),
  simLink: z.string(),
});

type LMCPInputs = z.infer<typeof LMCPInputs>;

const LMCPTaskErrors = z.object({
  stationCode: z.union([z.string(), z.undefined()]),
  ofdDate: z.union([z.string(), z.undefined()]),
  ead: z.union([z.string(), z.undefined()]),
  source: z.union([z.string(), z.undefined()]),
  namespace: z.union([z.string(), z.undefined()]),
  type: z.union([z.string(), z.undefined()]),
  waveGroupName: z.union([z.string(), z.undefined()]),
  shipOptionCategory: z.union([z.string(), z.undefined()]),
  addressType: z.union([z.string(), z.undefined()]),
  packageType: z.union([z.string(), z.undefined()]),
  cluster: z.union([z.string(), z.undefined()]),
  fulfillmentNetworkType: z.union([z.string(), z.undefined()]),
  volumeType: z.union([z.string(), z.undefined()]),
  f: z.union([z.string(), z.undefined()]),
  value: z.union([z.string(), z.undefined()]),
  requested: z.union([z.string(), z.undefined()]),
  currentLmcp: z.union([z.string(), z.undefined()]),
  currentAtrops: z.union([z.string(), z.undefined()]),
  pdr: z.union([z.string(), z.undefined()]),
  simLink: z.union([z.string(), z.undefined()]),
  week: z.union([z.string(), z.undefined()]),
});

type LMCPTaskErrors = z.infer<typeof LMCPTaskErrors>;

const DialogInfo = z.object({
  title: z.string(),
  message: z.string(),
  error: z.boolean().default(false).optional(),
  options: z.union([z.literal("YesNo"), z.literal("Ok")]),
  onConfirm: z
    .function()
    .returns(z.void())
    .optional()
    .describe("The function ran when the Yes button is clicked"),
  onCancel: z
    .function()
    .returns(z.void())
    .optional()
    .describe("The function ran when the No button is clicked"),
});

type DialogInfo = z.infer<typeof DialogInfo>;

export type { AMXLData, AMXLErrors, SameDayData, SameDayErrors };

export {
  DialogInfo,
  LMCPTaskData,
  LMCPTaskErrors,
  LMCPInputs,
  LMCPExportableData,
};
