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

type LMCPExportableData = {
  source: string | undefined;
  namespace: string | undefined;
  type: string | undefined;
  stationCode: string | undefined;
  waveGroupName: string | undefined;
  shipOptionCategory: string | undefined;
  addressType: string | undefined;
  packageType: string | undefined;
  ofdDate: string | undefined;
  ead: string | undefined;
  cluster: string | undefined;
  fulfillmentNetworkType: string | undefined;
  volumeType: string | undefined;
  week: number | undefined;
  f: string | undefined;
  value: number | undefined;
};

type LMCPTaskData = LMCPExportableData & {
  requested: number | undefined;
  currentLmcp: number | undefined;
  currentAtrops: number | undefined;
  pdr: number | undefined;
  simLink: string | undefined;
};

type LMCPTaskErrors = {
  stationCode: string | undefined;
  ofdDate: string | undefined;
  ead: string | undefined;
  requested: string | undefined;
  currentLmcp: string | undefined;
  currentAtrops: string | undefined;
  pdr: string | undefined;
  simLink: string | undefined;
  week: string | undefined;
};

export type {
  AMXLData,
  AMXLErrors,
  SameDayData,
  SameDayErrors,
  LMCPExportableData,
  LMCPTaskData,
  LMCPTaskErrors,
};
