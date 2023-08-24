import { z } from "zod";
import { LMCPTaskData } from "./Tasks";

type QueryableStation = {
  stationCode: string;
};

const QueryableSameDayRouteTask = z.object({
  id: z.number().positive().optional(),
  stationCode: z.string(),
  startTime: z.union([z.date(), z.string().datetime(), z.undefined()]),
  tbaSubmittedCount: z.number().optional(),
  dpoCompleteTime: z.union([z.date(), z.string().datetime(), z.undefined()]),
  sameDayType: z.string(),
  bufferPercent: z.number(),
  dpoLink: z.string(),
  tbaRoutedCount: z.number(),
  routeCount: z.number(),
  endTime: z.union([z.date(), z.string().datetime(), z.undefined()]),
});

type QueryableSameDayRouteTask = z.infer<typeof QueryableSameDayRouteTask>;

const QueryableLMCPTask = LMCPTaskData.merge(
  z.object({
    id: z.number().positive().optional(),
  })
);

type QueryableLMCPTask = z.infer<typeof QueryableLMCPTask>;

export type { QueryableStation, QueryableSameDayRouteTask };

export { QueryableLMCPTask };
