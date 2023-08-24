import { z } from "zod";
import { LMCPTaskData } from "./Tasks";

type QueryableStation = {
  stationCode: string;
};

const InsertableSameDayRouteTask = z.object({
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

type InsertableSameDayRouteTask = z.infer<typeof InsertableSameDayRouteTask>;

const SelectableSameDayRouteTask = z.object({
  id: z.number().positive(),
  stationCode: z.string(),
  startTime: z.union([z.string().datetime(), z.null()]),
  tbaSubmittedCount: z.number().optional(),
  dpoCompleteTime: z.union([z.string().datetime(), z.null()]),
  sameDayType: z.string(),
  bufferPercent: z.number(),
  dpoLink: z.string(),
  tbaRoutedCount: z.number(),
  routeCount: z.number(),
  endTime: z.union([z.string().datetime(), z.null()]),
});

type SelectableSameDayRouteTask = z.infer<typeof SelectableSameDayRouteTask>;

const QueryableLMCPTask = LMCPTaskData.merge(
  z.object({
    id: z.number().positive().optional(),
  })
);

type QueryableLMCPTask = z.infer<typeof QueryableLMCPTask>;

export type {
  QueryableStation,
  InsertableSameDayRouteTask,
  SelectableSameDayRouteTask,
};

export { QueryableLMCPTask };
