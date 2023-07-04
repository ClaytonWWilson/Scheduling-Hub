type SameDayData = {
  stationCode: string;
  routingType: string;
  dpoLink: string;
  percent: string;
  routeCount: string;
  tbaCount: string;
};

type SameDayErrors = {
  stationCode: string;
  percent: string;
  dpoLink: string;
  routeCount: string;
  tbaCount: string;
};

export type { SameDayData, SameDayErrors };
