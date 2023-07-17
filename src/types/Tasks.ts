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
  stationCode: string;
  routingType: string;
  percent: string;
  dpoLink: string;
  routeCount: string;
  fileTbaCount: string;
  routedTbaCount: string;
};

type SameDayErrors = {
  stationCode: string;
  percent: string;
  dpoLink: string;
  routeCount: string;
  tbaCount: string;
};

export type { AMXLData, AMXLErrors, SameDayData, SameDayErrors };
