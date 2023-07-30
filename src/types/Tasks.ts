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

type LMCPData = {
  source: string;
  namespace: string;
  type: string;
  stationCode: string;
  waveGroupName: string;
  shipOptionCategory: string;
  addressType: string;
  packageType: string;
  ofdDate: string;
  ead: string;
  cluster: string;
  fulfillmentNetworkType: string;
  volumeType: string;
  week: number;
  f: string;
  value: number;
};

export type { AMXLData, AMXLErrors, SameDayData, SameDayErrors, LMCPData };
