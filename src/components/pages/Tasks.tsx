import React, { useState } from "react";
import { fromZodError } from "zod-validation-error";
import SameDay from "../tasks/SameDay";
import {
  Backdrop,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from "@mui/material";
import { invoke } from "@tauri-apps/api/tauri";

import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
// import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
// import AMXL from "../tasks/AMXL";
import {
  AMXLData,
  DialogInfo,
  LMCPExportableData,
  LMCPTaskData,
  SameDayData,
} from "../../types/Tasks";
import {
  QueryableLMCPTask,
  QueryableSameDayRouteTask,
  QueryableStation,
} from "../../types/Database";
import LMCP from "../tasks/LMCP";
import { enqueueSnackbar } from "notistack";
import { ZodError } from "zod";
type TaskProps = {
  visible: boolean;
};

const Tasks = (props: TaskProps) => {
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [currentTasks, setCurrentTasks] = useState<JSX.Element[]>([]);
  const [taskCounter, setTaskCounter] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogInfo, setDialogInfo] = useState<DialogInfo | undefined>();

  const taskCanceledHandler = (taskId: number) => {
    const dialog: DialogInfo = {
      title: "Close Task in progress?",
      message:
        "You've already started this task, closing it out now will erase all of it's data. Are you sure?",
      options: "YesNo",
      onConfirm: () => {
        removeTask(taskId);
      },
    };

    showDialog(dialog);
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
      console.error(errorMessage);

      const dialog: DialogInfo = {
        title: "Error",
        message: `An error occurred when trying to save this task: \n${errorMessage}}\nDo you want to continue closing this task without saving?`,
        options: "YesNo",
        error: true,
        onConfirm: () => {
          removeTask(taskId);
          enqueueSnackbar("Same Day task closed", { variant: "error" });
        },
      };

      showDialog(dialog);
    }

    const dialog: DialogInfo = {
      title: "Complete task?",
      message: "Are you ready to mark this task as completed?",
      options: "YesNo",
      onConfirm: () => {
        saveSameDayTaskToDatabase(data)
          .then((res) => {
            console.log(res);
            removeTask(taskId);
            enqueueSnackbar("Same Day task completed", { variant: "success" });
          })
          .catch((err) => {
            console.error(err);
            const dialog: DialogInfo = {
              title: "Error",
              message: `An error occurred when trying to save this task: \n${err}}`,
              error: true,
              options: "Ok",
            };
            showDialog(dialog);
          });
      },
    };
    showDialog(dialog);
  };

  const saveStationToDatabase = async (station: QueryableStation) => {
    return invoke("insert_station", station);
  };

  const saveSameDayTaskToDatabase = async (data: SameDayData) => {
    const insertableStation: QueryableStation = {
      stationCode: data.stationCode as string,
    };

    // TODO: Fix same day types and fix these hardcoded dates
    return saveStationToDatabase(insertableStation).then(() => {
      const insertableTaskData: QueryableSameDayRouteTask = {
        stationCode: data.stationCode as string,
        startTime: data.startTime ? data.startTime : new Date(),
        tbaSubmittedCount: data.fileTbaCount,
        dpoCompleteTime: data.dpoCompleteTime
          ? data.dpoCompleteTime
          : new Date(),
        endTime: data.endTime ? data.endTime : new Date(),
        sameDayType: data.routingType as string,
        bufferPercent: data.bufferPercent as number,
        dpoLink: data.dpoLink as string,
        tbaRoutedCount: data.routedTbaCount as number,
        routeCount: data.routeCount as number,
      };

      return invoke("insert_same_day_task", insertableTaskData);
    });
  };

  const saveLMCPTaskToDatabase = async (data: LMCPTaskData) => {
    const insertableStation: QueryableStation = {
      stationCode: data.stationCode,
    };

    saveStationToDatabase(insertableStation).then(() => {
      const res = QueryableLMCPTask.safeParse(data);

      if (!res.success) {
        // TODO: Show error dialog
        console.error(res.error);
        return;
      } else {
        return invoke("insert_lmcp_task", res.data);
      }
    });
  };

  const LMCPCompletedHandler = (taskId: number, data: LMCPTaskData) => {
    const dialog: DialogInfo = {
      title: "Complete task?",
      message: "Are you ready to mark this task as completed?",
      options: "YesNo",
      onConfirm: () => {
        saveLMCPTaskToDatabase(data)
          .then((res) => {
            console.log(res);
            removeTask(taskId);
            enqueueSnackbar("LMCP task completed", { variant: "success" });
          })
          .catch((err) => {
            console.error(err);
            const dialog: DialogInfo = {
              title: "Error",
              message: `An error occurred when trying to save this task: \n${err}}`,
              error: true,
              options: "Ok",
            };
            showDialog(dialog);
          });
      },
    };
    showDialog(dialog);
    console.log(data);
  };

  const removeTask = (taskId: number) => {
    setCurrentTasks((prev) => {
      const newTaskList = prev.filter((task) => {
        return task.props.taskId !== taskId;
      });

      return [...newTaskList];
    });
  };

  const showDialog = (dialogInfo: DialogInfo) => {
    let parsedInfo: DialogInfo;
    try {
      parsedInfo = DialogInfo.parse(dialogInfo);
    } catch (zError) {
      const readableError = fromZodError(zError as ZodError);
      console.log(readableError);
      return;
    }

    setDialogInfo(parsedInfo);
    setDialogOpen(true);
  };

  return (
    <div
      className={`h-full w-full px-2 flex gap-4 flex-wrap transition-all ${
        !props.visible ? "hidden" : ""
      }`}
    >
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          if (dialogInfo?.onCancel) {
            dialogInfo.onCancel();
          }
        }}
      >
        <DialogTitle>{dialogInfo?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogInfo?.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          {dialogInfo?.options === "YesNo" ? (
            <>
              <Button
                variant="outlined"
                color="primary"
                autoFocus
                onClick={() => {
                  setDialogOpen(false);
                  if (dialogInfo?.onCancel) {
                    dialogInfo.onCancel();
                  }
                }}
              >
                No
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setDialogOpen(false);
                  if (dialogInfo?.onConfirm) {
                    dialogInfo.onConfirm();
                  }
                }}
              >
                Yes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                color="primary"
                autoFocus
                onClick={() => {
                  setDialogOpen(false);
                  if (dialogInfo?.onConfirm) {
                    dialogInfo.onConfirm();
                  }
                }}
              >
                Ok
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

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
                  onShowDialog={showDialog}
                />,
              ];
              setTaskCounter((prevCounter) => {
                return ++prevCounter;
              });
              return newTasks;
            });
          }}
        />
        {/* <SpeedDialAction
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
        /> */}
        <SpeedDialAction
          key="LMCP"
          icon={<ThunderstormIcon />}
          tooltipTitle="LMCP"
          tooltipOpen
          onClick={() => {
            setNewTaskOpen(false);
            setCurrentTasks((prev) => {
              const newTasks = [
                ...prev,
                <LMCP
                  key={taskCounter}
                  taskId={taskCounter}
                  onComplete={LMCPCompletedHandler}
                  onCancel={taskCanceledHandler}
                  onShowDialog={showDialog}
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

// TODO: validate input forms with zod. Optional textfield values can be created with
// const optionalUrl = z.union([z.string().url().nullish(), z.literal("")]);
