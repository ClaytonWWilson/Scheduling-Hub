import React, { useContext, useEffect, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { AppContext } from "../../App";
import { AppTheme } from "../../types/Settings";
import { noviDarkTheme, noviLightTheme } from "../../Themes";
import { invoke } from "@tauri-apps/api";
import {
  QueryableLMCPTask,
  QueryableSameDayRouteTask,
} from "../../types/Database";
import { z } from "zod";
import { Typography } from "@mui/material";
import { countMatchingElements } from "../../Utilities";

type StatsProps = {
  visible: boolean;
};

const LinePlotLineData = z.object({
  id: z.string(),
  data: z.array(
    z.object({
      x: z.string(),
      y: z.number(),
    })
  ),
});
type LinePlotLineData = z.infer<typeof LinePlotLineData>;

const getNoviTheme = (appTheme: AppTheme) => {
  switch (appTheme) {
    case AppTheme.enum.DARKRED:
      return noviDarkTheme;
    case AppTheme.enum.LIGHTRED:
      return noviLightTheme;
  }
};

const sumOfTasks = (
  sameDayTasks: QueryableSameDayRouteTask[],
  lmcpTasks: QueryableLMCPTask[]
) => {
  let sum = 0;

  sum += sameDayTasks.length;
  sum += lmcpTasks.length;

  return sum;
};

const sumOfTbas = (sameDayTasks: QueryableSameDayRouteTask[]) => {
  let sum = 0;

  sameDayTasks.forEach((task) => {
    sum += task.tbaRoutedCount;
  });

  return sum;
};

const makeHistogramData = (
  rawData: number[],
  bucketSize: number,
  options?: { start: number; end: number }
) => {
  const adjustedData = rawData.map((el) => {
    return Math.ceil(el / bucketSize);
  });

  const start = options?.start ? options.start : Math.min(...rawData);
  const end = options?.end ? options.end : Math.max(...rawData);

  const bucketedData = countMatchingElements(adjustedData).sort((a, b) => {
    return a[0] - b[0];
  });

  // Put bucketedData in buckets and fill in any zero buckets
  const buckets: [number, number][] = [];
  const startBucket = Math.ceil(start / bucketSize);
  const endBucket = Math.ceil(end / bucketSize);
  for (let i = startBucket; i <= endBucket; i++) {
    const temp = bucketedData.find((el) => {
      return el[0] == i;
    });

    const count = temp ? temp[1] : 0;
    buckets.push([i, count]);
  }

  const data = buckets.map((bucket) => {
    return {
      bucket: `${(bucket[0] - 1) * bucketSize} - ${bucket[0] * bucketSize}`,
      count: bucket[1],
    };
  });

  return data;
};

const Stats = (props: StatsProps) => {
  const appSettings = useContext(AppContext);
  const [tasksPerDayData, setTasksPerDayData] = useState<LinePlotLineData[]>(
    []
  );
  const [taskTimeData, setTaskTimeData] = useState<
    { bucket: string; sameDayCount: number; lmcpCount: number }[]
  >([]);
  const [allocationPieData, setAllocationPieData] = useState<
    { id: string; label: string; value: number; color: string }[]
  >([]);

  const [rawSameDayData, setRawSameDayData] = useState<
    QueryableSameDayRouteTask[] | undefined
  >();
  const [rawLMCPData, setRawLMCPData] = useState<
    QueryableLMCPTask[] | undefined
  >();

  const loadDataAndCharts = async () => {
    // TODO: Zod parse the data after fixing types
    const sameDayResults = await invoke<string>("get_all_same_day_tasks");
    const lmcpResults = await invoke<string>("get_all_lmcp_tasks");
    const sameDayTasks: QueryableSameDayRouteTask[] =
      JSON.parse(sameDayResults);
    const lmcpTasks: QueryableLMCPTask[] = JSON.parse(lmcpResults);

    setRawSameDayData(sameDayTasks);
    setRawLMCPData(lmcpTasks);

    loadTaskPerDayPlot(sameDayTasks, lmcpTasks);
    loadTaskTimeHistogram(sameDayTasks, lmcpTasks);
    loadTaskAllocationPlot(sameDayTasks, lmcpTasks);
  };

  const loadTaskPerDayPlot = (
    sameDayTasks: QueryableSameDayRouteTask[],
    lmcpTasks: QueryableLMCPTask[]
  ) => {
    const sameDayDateStrings: string[] = sameDayTasks
      .filter((task) => {
        if (task.startTime === undefined) return false;
        return true;
      })
      .map((task) => {
        // BUG: Fix this type so it's clear that database queries can't return Date() objects
        const date: string = (task.startTime as string)
          .replace("T", " ")
          .split(" ")[0];
        return date;
      });

    const sameDayDateOccurances = countMatchingElements(sameDayDateStrings);

    const sameDayPlot: LinePlotLineData = { id: "Same Day Tasks", data: [] };
    sameDayPlot.data.push(
      ...sameDayDateOccurances.map((occurance) => {
        return {
          x: occurance[0], // Date
          y: occurance[1], // Times on date
        };
      })
    );

    const lmcpDateStrings: string[] = lmcpTasks
      .filter((task) => {
        if (task.startTime === undefined) return false;
        return true;
      })
      .map((task) => {
        const date: string = (task.startTime as unknown as string)
          .replace("T", " ")
          .split(" ")[0];
        return date;
      });

    const lmcpDateOccurances = countMatchingElements(lmcpDateStrings);
    const lmcpPlot: LinePlotLineData = { id: "LMCP Tasks", data: [] };

    lmcpPlot.data.push(
      ...lmcpDateOccurances.map((occurance) => {
        return {
          x: occurance[0],
          y: occurance[1],
        };
      })
    );

    setTasksPerDayData([sameDayPlot, lmcpPlot]);
  };

  const loadTaskTimeHistogram = (
    sameDayTasks: QueryableSameDayRouteTask[],
    lmcpTasks: QueryableLMCPTask[]
  ) => {
    const BUCKET_SIZE = 5;
    const MIN_VALUE = 0;

    const sameDayTaskLengthsMinutes = sameDayTasks
      .filter((task) => {
        if (task.startTime === undefined || task.endTime === undefined) {
          return false;
        } else {
          return true;
        }
      })
      .map((task) => {
        const startDate = new Date(task.startTime);
        const endDate = new Date(task.endTime);
        const minutesTaken =
          (endDate.valueOf() - startDate.valueOf()) / 1000 / 60;
        return minutesTaken;
      });

    const lmcpTaskLengthMinutes = lmcpTasks
      .filter((task) => {
        if (task.startTime === undefined || task.endTime === undefined) {
          return false;
        } else {
          return true;
        }
      })
      .map((task) => {
        // TODO: Fix type here
        const startDate = new Date(task.startTime as unknown as string);
        const endDate = new Date(task.endTime as unknown as string);
        const minutesTaken =
          (endDate.valueOf() - startDate.valueOf()) / 1000 / 60;
        return minutesTaken;
      });

    const MAX_VALUE = Math.ceil(
      Math.max(...sameDayTaskLengthsMinutes, ...lmcpTaskLengthMinutes)
    );

    const sameDayHistogramData = makeHistogramData(
      sameDayTaskLengthsMinutes,
      BUCKET_SIZE,
      { start: MIN_VALUE, end: MAX_VALUE }
    );

    const lmcpHistogramData = makeHistogramData(
      lmcpTaskLengthMinutes,
      BUCKET_SIZE,
      {
        start: MIN_VALUE,
        end: MAX_VALUE,
      }
    );

    // Combine datasets
    const maxLength = Math.max(
      sameDayHistogramData.length,
      lmcpHistogramData.length
    );
    const combinedHistogramData = [];

    for (let i = 0; i < maxLength; i++) {
      const lmcpData:
        | {
            bucket: string;
            count: number;
          }
        | undefined = lmcpHistogramData[i];
      const sameDayData:
        | {
            bucket: string;
            count: number;
          }
        | undefined = sameDayHistogramData[i];

      let bucket: string;
      if (lmcpData) {
        bucket = lmcpData.bucket;
      } else {
        bucket = sameDayData.bucket;
      }

      combinedHistogramData.push({
        bucket,
        sameDayCount: sameDayData?.count ? sameDayData.count : 0,
        lmcpCount: lmcpData?.count ? lmcpData.count : 0,
      });
    }

    setTaskTimeData(combinedHistogramData);
  };

  const loadTaskAllocationPlot = (
    sameDayTasks: QueryableSameDayRouteTask[],
    lmcpTasks: QueryableLMCPTask[]
  ) => {
    const allocationData = [
      {
        id: "SameDay",
        label: "Same Day",
        value: sameDayTasks.length,
        color: "hsl(197, 70%, 50%)",
      },
      {
        id: "LMCP",
        label: "LMCP",
        value: lmcpTasks.length,
        color: "hsl(357, 70%, 50%)",
      },
    ];

    setAllocationPieData(allocationData);
  };

  useEffect(() => {
    loadDataAndCharts();
  }, []);

  return (
    <div className={`h-full w-full px-2 ${!props.visible ? "hidden" : ""}`}>
      <div className="h-96 min-w-[25rem] max-w-[50rem]">
        <ResponsiveLine
          animate
          theme={getNoviTheme(appSettings.theme)}
          axisBottom={{
            format: "%b %d",
            legend: "day",
            legendOffset: -12,
            tickValues: "every 1 days",
          }}
          axisLeft={{
            legend: "# of tasks",
            legendOffset: 12,
          }}
          curve="monotoneX"
          data={tasksPerDayData}
          enablePointLabel
          margin={{
            bottom: 60,
            left: 80,
            right: 80,
            top: 20,
          }}
          pointBorderColor={{
            from: "color",
            modifiers: [["darker", 0.3]],
          }}
          pointBorderWidth={1}
          pointSize={16}
          useMesh
          xFormat="time:%Y-%m-%d"
          xScale={{
            format: "%Y-%m-%d",
            precision: "day",
            type: "time",
            useUTC: false,
          }}
          yScale={{
            type: "linear",
          }}
        />
      </div>
      <div className="h-96 min-w-[25rem] max-w-[50rem]">
        <ResponsiveBar
          data={taskTimeData}
          keys={["sameDayCount", "lmcpCount"]}
          indexBy="bucket"
          theme={getNoviTheme(appSettings.theme)}
          margin={{ top: 50, right: 120, bottom: 50, left: 80 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "nivo" }}
          borderColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "time (minutes)",
            legendPosition: "middle",
            legendOffset: 32,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "# of tasks",
            legendPosition: "middle",
            legendOffset: -40,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 210,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 200,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: "hover",
                  style: {
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          role="application"
          // ariaLabel="Nivo bar chart demo"
          // barAriaLabel={(e) =>
          //   e.id + ": " + e.formattedValue + " in country: " + e.indexValue
          // }
        />
      </div>
      <div className="h-96 min-w-[25rem] max-w-[50rem]">
        <ResponsivePie
          data={allocationPieData}
          theme={getNoviTheme(appSettings.theme)}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.2]],
          }}
          arcLinkLabelsSkipAngle={10}
          // arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
            from: "color",
            modifiers: [["darker", 2]],
          }}
          arcLinkLabel={(datum) => {
            return datum.label as string;
          }}
          defs={[
            {
              id: "dots",
              type: "patternDots",
              background: "inherit",
              color: "rgba(255, 255, 255, 0.3)",
              size: 4,
              padding: 1,
              stagger: true,
            },
            {
              id: "lines",
              type: "patternLines",
              background: "inherit",
              color: "rgba(255, 255, 255, 0.3)",
              rotation: -45,
              lineWidth: 6,
              spacing: 10,
            },
          ]}
          fill={[
            {
              match: {
                id: "LMCP",
              },
              id: "lines",
            },
            {
              match: {
                id: "SameDay",
              },
              id: "dots",
            },
          ]}
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 0,
              itemWidth: 100,
              itemHeight: 18,
              // itemTextColor: "#999",
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: "circle",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemTextColor: "#000",
                  },
                },
              ],
            },
          ]}
        />
      </div>
      {rawSameDayData && rawLMCPData && (
        <div>
          <Typography>{`Total # of completed tasks: ${sumOfTasks(
            rawSameDayData,
            rawLMCPData
          ).toString()}`}</Typography>
          <Typography>{`Total # of routed TBAs: ${sumOfTbas(
            rawSameDayData
          ).toString()}`}</Typography>
        </div>
      )}
    </div>
  );
};

export default Stats;
