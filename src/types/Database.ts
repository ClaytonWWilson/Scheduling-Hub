import { z } from "zod";
import { LMCPTaskData, SameDayData } from "./Tasks";

type QueryableStation = {
  stationCode: string;
};

// type QueryableSameDayRouteTask = {
//   id?: number;
//   stationCode: string;
//   startTime: string;
//   tbaSubmittedCount?: number;
//   dpoCompleteTime: string;
//   endTime: string;
//   sameDayType: string;
//   bufferPercent: number;
//   dpoLink: string;
//   tbaRoutedCount: number;
//   routeCount: number;
// };

const QueryableSameDayRouteTask = z.object({
  id: z.number().positive().optional(),
  stationCode: z.string(),
  startTime: z.date(),
  tbaSubmittedCount: z.number().optional(),
  dpoCompleteTime: z.date(),
  sameDayType: z.string(),
  bufferPercent: z.number(),
  dpoLink: z.string(),
  tbaRoutedCount: z.number(),
  routeCount: z.number(),
  endTime: z.date(),
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
