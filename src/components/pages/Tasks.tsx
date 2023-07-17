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

  const taskCompletedHandler = (
    taskId: number,
    data: SameDayData | AMXLData
  ) => {
    removeTask(taskId);
    console.log(data);
    // TODO: Save to a database
    // invoke("save_data", { data: data });
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
                  onComplete={taskCompletedHandler}
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
                  onComplete={taskCompletedHandler}
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
