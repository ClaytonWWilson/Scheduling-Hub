import React, { useState } from "react";
import SameDay from "../tasks/SameDay";
import {
  Backdrop,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from "@mui/material";
import { invoke } from "@tauri-apps/api/tauri";

import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AMXL from "../tasks/AMXL";
import { AMXLData, SameDayData } from "../../types/Tasks";
import {
  QueryableSameDayRouteTask,
  QueryableStation,
} from "../../types/Database";
import { enqueueSnackbar } from "notistack";

type TaskProps = {
  visible: boolean;
};

const Tasks = (props: TaskProps) => {
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [currentTasks, setCurrentTasks] = useState<JSX.Element[]>([]);
  const [taskCounter, setTaskCounter] = useState(0);

  const taskCanceledHandler = (taskId: number) => {
    removeTask(taskId);
  };

  const amxlCompletedHandler = () => {};

  const sameDayCompletedHandler = (taskId: number, data: SameDayData) => {
    let errorMessage = "";
    if (data.startTime === undefined)
      errorMessage += "Start Time is undefined.\n";
    if (data.stationCode === undefined)
      errorMessage += "Station Code is undefined.\n";
    if (data.routingType === undefined)
      errorMessage += "Routing Type is undefined.\n";
    if (data.bufferPercent === undefined)
      errorMessage += "Buffer Percent is undefined.\n";
    if (data.dpoLink === undefined) errorMessage += "DPO Link is undefined.\n";
    if (data.dpoCompleteTime === undefined)
      errorMessage += "DPO complete time is undefined.\n";
    if (data.routeCount === undefined)
      errorMessage += "Route Count is undefined.\n";
    if (data.routedTbaCount === undefined)
      errorMessage += "Routed TBA count is undefined.\n";
    if (data.endTime === undefined) errorMessage += "End Time is undefined.\n";

    if (errorMessage !== "") {
      // TODO: Show error dialog
      console.error(errorMessage);
      return;
    }

    const insertableStation: QueryableStation = {
      stationCode: data.stationCode as string,
    };

    invoke("insert_station", insertableStation)
      .then(() => {
        const insertableTaskData: QueryableSameDayRouteTask = {
          stationCode: data.stationCode as string,
          startTime: data.startTime as string,
          tbaSubmittedCount: data.fileTbaCount,
          dpoCompleteTime: data.dpoCompleteTime as string,
          endTime: data.endTime as string,
          sameDayType: data.routingType as string,
          bufferPercent: data.bufferPercent as number,
          dpoLink: data.dpoLink as string,
          tbaRoutedCount: data.routedTbaCount as number,
          routeCount: data.routeCount as number,
        };

        return invoke("insert_same_day_task", insertableTaskData);
      })
      .then((res) => {
        console.log(res);
        removeTask(taskId);
        enqueueSnackbar("Same Day task completed", { variant: "success" });
      })
      .catch((err) => {
        console.error(err);
        // TODO: Show error dialog
      });
  };

  const removeTask = (taskId: number) => {
    setCurrentTasks((prev) => {
      const newTaskList = prev.filter((task) => {
        return task.props.taskId !== taskId;
      });

      return [...newTaskList];
    });
  };

  return (
    <div
      className={`h-full w-full px-2 flex gap-4 flex-wrap transition-all ${
        !props.visible ? "hidden" : ""
      }`}
    >
      <Backdrop className="z-10" open={newTaskOpen} />
      {currentTasks}

      <SpeedDial
        ariaLabel="New task button"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        open={newTaskOpen}
        onOpen={() => {}}
        onClose={() => {
          setNewTaskOpen(false);
        }}
        onClick={() => {
          setNewTaskOpen(!newTaskOpen);
        }}
      >
        <SpeedDialAction
          key="Same Day"
          icon={<RocketLaunchIcon />}
          tooltipTitle="Same Day"
          tooltipOpen
          onClick={() => {
            setNewTaskOpen(false);
            setCurrentTasks((prev) => {
              const newTasks = [
                ...prev,
                <SameDay
                  key={taskCounter}
                  taskId={taskCounter}
                  onComplete={sameDayCompletedHandler}
                  onCancel={taskCanceledHandler}
                />,
              ];
              setTaskCounter((prevCounter) => {
                return ++prevCounter;
              });
              return newTasks;
            });
          }}
        />
        <SpeedDialAction
          key="AMXL"
          icon={<FitnessCenterIcon />}
          tooltipTitle="AMXL"
          tooltipOpen
          onClick={() => {
            setNewTaskOpen(false);
            setCurrentTasks((prev) => {
              const newTasks = [
                ...prev,
                <AMXL
                  key={taskCounter}
                  taskId={taskCounter}
                  onComplete={amxlCompletedHandler}
                  onCancel={taskCanceledHandler}
                />,
              ];
              setTaskCounter((prevCounter) => {
                return ++prevCounter;
              });
              return newTasks;
            });
          }}
        />
      </SpeedDial>
    </div>
  );
};

export default Tasks;

// TODO: Confirm before closing or canceling task
