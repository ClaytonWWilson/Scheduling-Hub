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

export type { QueryableStation, QueryableSameDayRouteTask };
