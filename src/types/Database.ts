import { z } from "zod";
import { LMCPTaskData } from "./Tasks";

type QueryableStation = {
  stationCode: string;
};

type QueryableSameDayRouteTask = {
  id?: number;
  stationCode: string;
  startTime: string;
  tbaSubmittedCount?: number;
  dpoCompleteTime: string;
  endTime: string;
  sameDayType: string;
  bufferPercent: number;
  dpoLink: string;
  tbaRoutedCount: number;
  routeCount: number;
};

const QueryableLMCPTask = LMCPTaskData.merge(
  z.object({
    id: z.number().positive().optional(),
  })
);

type QueryableLMCPTask = z.infer<typeof QueryableLMCPTask>;

export type { QueryableStation, QueryableSameDayRouteTask };

export { QueryableLMCPTask };
