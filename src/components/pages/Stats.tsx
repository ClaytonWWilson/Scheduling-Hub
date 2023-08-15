import React, { useContext, useEffect, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { AppContext } from "../../App";
import { AppTheme } from "../../types/Settings";
import { noviDarkTheme, noviLightTheme } from "../../Themes";
import { invoke } from "@tauri-apps/api";
import { QueryableSameDayRouteTask } from "../../types/Database";
import { z } from "zod";

type StatsProps = {
  visible: boolean;
};

const LinePlotDatapoint = z.object({
  id: z.string(),
  data: z.array(
    z.object({
      x: z.string(),
      y: z.number(),
    })
  ),
});
type LinePlotDatapoint = z.infer<typeof LinePlotDatapoint>;

const getNoviTheme = (appTheme: AppTheme) => {
  switch (appTheme) {
    case AppTheme.enum.DARKRED:
      return noviDarkTheme;
    case AppTheme.enum.LIGHTRED:
      return noviLightTheme;
  }
};

const sameDayToTimePlot = (sameDayData: QueryableSameDayRouteTask[]) => {
  const plotData: LinePlotDatapoint = { id: "Same Day Tasks", data: [] };

  // Sum same day tasks by start date
  const taskCounter = new Map<string, number>();
  sameDayData.forEach((task) => {
    const taskDate = (task.startTime as string).replace("T", " ").split(" ")[0];
    const temp = taskCounter.get(taskDate);
    const count = temp ? temp : 0;
    taskCounter.set(taskDate, count + 1);
  });

  let sortedDates = [...taskCounter.entries()].sort((a, b) => {
    const difference = new Date(a[0]).valueOf() - new Date(b[0]).valueOf();
    return difference;
  });

  sortedDates.forEach((day) => {
    plotData.data.push({
      x: day[0],
      y: day[1],
    });
  });

  return plotData;
};

const Stats = (props: StatsProps) => {
  const appSettings = useContext(AppContext);
  const [tasksPerDayData, setTasksPerDayData] = useState<LinePlotDatapoint[]>(
    []
  );

  useEffect(() => {
    invoke("get_all_same_day_tasks")
      .then((res) => {
        const tasks: QueryableSameDayRouteTask[] = JSON.parse(res as string);
        const plotData = sameDayToTimePlot(tasks);
        setTasksPerDayData([plotData]);
      })
      .catch((err) => {
        console.error(err);
      });
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
    </div>
  );
};

export default Stats;
