import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import {
  CSVDecodedRow,
  coerceToNumber,
  csv2json,
  // dateToSQLiteDateString,
  isDpoLinkValid,
  isNumeric,
  isStationCodeValid,
  objectHasData,
  percentChange,
} from "../../Utilities";
import {
  DialogInfo,
  SameDayData,
  SameDayErrors,
  SameDayInputs,
} from "../../types/Tasks";
import DropArea from "../DropArea";
import IconTypography from "../IconTypography";
import { enqueueSnackbar } from "notistack";
import { z } from "zod";

type SameDayProps = {
  onCancel: (taskId: number) => void;
  onComplete: (taskId: number, data: SameDayData) => void;
  onShowDialog: (dialogInfo: DialogInfo) => void;
  taskId: number;
};

const TaskTimes = z.object({
  startTime: z.date().optional(),
  dpoCompleteTime: z.date().optional(),
  endTime: z.date().optional(),
});

type TaskTimes = z.infer<typeof TaskTimes>;

const parseSameDayInputs = (currentData: SameDayInputs) => {
  const temp = { ...currentData };
  // Coerce to numbers. Ensures that commas in a number string dont invalidate it.
  // @ts-ignore
  temp.bufferPercent = coerceToNumber(temp.bufferPercent);
  // @ts-ignore
  temp.routedTbaCount = coerceToNumber(temp.routedTbaCount);
  // @ts-ignore
  temp.routeCount = coerceToNumber(temp.routeCount);
  // @ts-ignore

  return SameDayData.safeParse(temp);
};

// Checks all inputs
const areInputErrors = (data: SameDayData, errors: SameDayErrors) => {
  // Check if any input data is empty
  for (let i = 0; i < Object.entries(data).length; i++) {
    const [key, val] = Object.entries(data)[i];
    if (val === undefined && key !== "fileTbaCount" && key !== "endTime") {
      // # of TBAs in file is not required to finish a task, it just helps to verify volume
      return true;
    }
  }

  // Check if there are any errors
  for (let i = 0; i < Object.entries(errors).length; i++) {
    const [_key, val] = Object.entries(errors)[i];
    if (val !== undefined) {
      return true;
    }
  }

  return false;
};

// Only check inputs required for volume check
const areVolumeCheckErrors = (errors: SameDayErrors) => {
  // Can't do a volume check without file volume
  // if (!data.fileTbaCount) return true;

  const val = Boolean(
    errors.stationCode ||
      errors.routingType ||
      errors.routedTbaCount ||
      errors.fileTbaCount
  );
  console.log(val);
  return val;

  // const volumeCheckRequiredKeys = [
  //   "stationCode",
  //   "routingType",
  //   "routedTbaCount",
  //   "fileTbaCount",
  // ];

  // // Check if any required input data is missing
  // for (let i = 0; i < Object.entries(data).length; i++) {
  //   const [key, val] = Object.entries(data)[i];
  //   if (volumeCheckRequiredKeys.indexOf(key) != -1 && val === undefined) {
  //     return true;
  //   }
  // }

  // // Check if there are any errors in the required data
  // for (let i = 0; i < Object.entries(errors).length; i++) {
  //   const [key, val] = Object.entries(errors)[i];
  //   if (volumeCheckRequiredKeys.indexOf(key) != -1 && val !== undefined) {
  //     return true;
  //   }
  // }

  // return false;
};

const percentToTextColor = (
  percent: number,
  target: "high" | "low",
  good: number,
  bad: number
) => {
  if (target === "low") {
    if (percent <= good) {
      return "text-green-500";
    } else if (percent > good && percent <= bad) {
      return "text-yellow-400";
    } else {
      return "text-red-500";
    }
  } else {
    if (percent >= good) {
      return "text-green-500";
    } else if (percent < good && percent >= bad) {
      return "text-yellow-400";
    } else {
      return "text-red-500";
    }
  }
};

const getVolumeAudit = (
  stationCode: string,
  routingType: string,
  fileTbaCount: number,
  routedTbaCount: number
) => {
  // if (!validatedData.fileTbaCount || !validatedData.routedTbaCount) return "";

  const blurb = `/md\n**${stationCode}** ${
    routingType == "samedaysunrise" ? "SAME_DAY_SUNRISE" : "SAME_DAY_AM"
  }: Routing completed.\nFile: **${fileTbaCount}** TBAs // Routed: **${routedTbaCount}** TBAs // Delta: **${percentChange(
    fileTbaCount,
    routedTbaCount
  ).toFixed(2)}%**`;

  return blurb;
};

const getDispatchAudit = (data: SameDayData) => {
  // const totalRoutes = Math.ceil(
  //   parseInt(userInputs.routeCount) *
  //     (1 + parseInt(userInputs.bufferPercent) / 100)
  // );
  const totalRoutes = Math.ceil(
    data.routeCount * (1 + data.bufferPercent / 100)
  );
  let blurb = `/md\n**${data.stationCode}** ${
    data.routingType == "samedaysunrise" ? "SAME_DAY_SUNRISE" : "SAME_DAY_AM"
  }: **${totalRoutes}** total flex routes (**${data.routeCount}** + **${
    totalRoutes - data.routeCount
  }** buffer)`;

  if (data.fileTbaCount && data.routedTbaCount) {
    blurb += `\nFile: **${data.fileTbaCount}** TBAs // Routed: **${
      data.routedTbaCount
    }** TBAs // Delta: **${percentChange(
      data.fileTbaCount,
      data.routedTbaCount
    ).toFixed(2)}%**`;
  }

  return blurb;
};

const SameDay = (props: SameDayProps) => {
  const [userInputs, setUserInputs] = useState<SameDayInputs>({
    stationCode: "",
    routingType: "",
    bufferPercent: "",
    dpoLink: "",
    routeCount: "",
    routedTbaCount: "",
  });

  const [times, setTimes] = useState<TaskTimes>({});

  const [fileData, setFileData] = useState<CSVDecodedRow[] | undefined>(
    undefined
  );

  const [errors, setErrors] = useState<SameDayErrors>({
    stationCode: undefined,
    routingType: undefined,
    bufferPercent: undefined,
    dpoLink: undefined,
    routeCount: undefined,
    routedTbaCount: undefined,
  });

  const importFileHandler = (files: FileList) => {
    // TODO: Error check if wrong file is dropped
    if (files.length === 0) return;

    if (objectHasData(userInputs)) {
      const dialog: DialogInfo = {
        title: "Overwrite current data?",
        message:
          "Importing this file will overwrite your current data. Are you sure?",
        options: "YesNo",
        onConfirm: () => {
          importFiles(files[0]);
        },
      };
      props.onShowDialog(dialog);
    } else {
      importFiles(files[0]);
    }
  };

  const importFiles = (inputFile: File) => {
    // const inputFile = files[0];

    const reader = new FileReader();

    reader.addEventListener("load", (e) => {
      if (!e.target || !e.target.result) return;

      const fileJson = csv2json(e.target.result as string, { headers: true });

      const stationCode = inputFile.name.split("_")[0].toUpperCase();

      let routingType = "";
      if (inputFile.name.toLowerCase().includes("same_day_sunrise")) {
        routingType = "samedaysunrise";
      } else if (inputFile.name.toLowerCase().includes("same_day_am")) {
        routingType = "samedayam";
      }

      const fileTbaCount = fileJson.length;

      setUserInputs((prev) => {
        return { ...prev, stationCode, routingType, fileTbaCount };
      });

      // setValidatedData((currentData) => {
      //   return { ...currentData, fileTbaCount };
      // });

      setFileData(fileJson);
    });

    reader.readAsText(inputFile);
  };

  const copyAuditBlurb = () => {
    console.log("here");
    if (Object.keys(errors).length == 0) {
      const res = parseSameDayInputs(userInputs);
      if (res.success) {
        navigator.clipboard.writeText(getDispatchAudit(res.data));
        enqueueSnackbar("Dispatch audit copied", {
          variant: "success",
        });
      }
    } else if (
      userInputs.fileTbaCount !== undefined &&
      !areVolumeCheckErrors(errors)
    ) {
      navigator.clipboard.writeText(
        getVolumeAudit(
          userInputs.stationCode,
          userInputs.routingType,
          userInputs.fileTbaCount,
          coerceToNumber(userInputs.routedTbaCount)
        )
      );
      enqueueSnackbar("Volume audit copied", { variant: "success" });
    }
  };

  // Checks all user input and sets errors and validated data
  const validateInputData = () => {
    const res = parseSameDayInputs(userInputs);
    console.log(res);

    if (res.success) {
      setErrors({});
    } else {
      mapErrorsToState(res.error.errors);
    }
  };

  const mapErrorsToState = (zodErrors: z.ZodIssue[]) => {
    const sameDayErrors: SameDayErrors = {};

    zodErrors.forEach((zodError) => {
      sameDayErrors[zodError.path[0] as keyof SameDayErrors] = zodError.message;
    });

    setErrors(sameDayErrors);
  };

  const copyTbasToClipboard = () => {
    if (!fileData) return;

    let tbas = "";
    fileData.forEach((row) => {
      tbas += `${row["Tracking Id"]}\n`;
    });

    navigator.clipboard.writeText(tbas);
  };

  // Automatically validates the inputs when any of their values change
  useEffect(validateInputData, [userInputs]);

  // Runs once when the component is mounted
  useEffect(() => {
    setTimes((prev) => {
      return { ...prev, startTime: new Date() };
    });
  }, []);

  return (
    <DropArea onAccepted={importFileHandler}>
      <Paper
        className={"h-fit w-[25rem] px-2 py-2 flex flex-col gap-y-2 relative"}
      >
        <div className="absolute w-fit right-[-20px] top-[-20px] z-[9]">
          <IconButton
            aria-label="delete"
            onClick={() => {
              props.onCancel(props.taskId);
            }}
          >
            <CancelIcon />
          </IconButton>
        </div>

        <div className="flex">
          <Typography className="pl-1 py-2" align="left" variant="h5">
            Same Day
          </Typography>
          <IconTypography
            className="ml-auto"
            align="right"
            icon={CopyAllIcon}
            onClick={() => {
              copyTbasToClipboard();
              enqueueSnackbar("TBAs copied", { variant: "success" });
            }}
          >{`File TBAs: ${
            userInputs.fileTbaCount ? userInputs.fileTbaCount : "???"
          }`}</IconTypography>
        </div>
        <Tooltip
          title={userInputs.stationCode !== "" ? errors.stationCode : ""}
          followCursor
        >
          <TextField
            label="Station Code"
            value={userInputs.stationCode}
            onChange={(e) => {
              let code = e.target.value.toUpperCase();

              setUserInputs((prev) => {
                return { ...prev, stationCode: code };
              });
            }}
            error={
              userInputs.stationCode !== "" && errors.stationCode !== undefined
            }
            autoComplete="aaaaa"
            aria-autocomplete="none"
            className="w-96"
          />
        </Tooltip>

        {/* <Autocomplete
          disablePortal
          freeSolo
          options={["DBO7", "DAU5", "DBM3"]}
          renderInput={(params) => (
            <TextField {...params} label="Station Code" />
          )}
          className="w-96"
        /> */}
        <Typography className="pl-2">Same Day Type:</Typography>
        <RadioGroup
          value={userInputs.routingType}
          onChange={(e) =>
            setUserInputs({ ...userInputs, routingType: e.target.value })
          }
          className="w-fit pl-4"
        >
          <FormControlLabel
            value="samedaysunrise"
            control={<Radio />}
            label="Same Day Sunrise"
            required
          />
          <FormControlLabel
            value="samedayam"
            control={<Radio />}
            label="Same Day AM"
            required
          />
        </RadioGroup>

        <Tooltip
          title={userInputs.bufferPercent !== "" ? errors.bufferPercent : ""}
          followCursor
        >
          <TextField
            label="Buffer Percentage"
            value={userInputs.bufferPercent}
            onChange={(e) => {
              const percent = e.target.value.replaceAll(",", "");

              setUserInputs((prev) => {
                return { ...prev, bufferPercent: percent };
              });
            }}
            error={
              userInputs.bufferPercent !== "" &&
              errors.bufferPercent !== undefined
            }
            autoComplete="aaaaa"
            aria-autocomplete="none"
            className="w-96"
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Tooltip>

        <Tooltip
          title={userInputs.dpoLink !== "" ? errors.dpoLink : ""}
          followCursor
        >
          <TextField
            label="DPO Link"
            value={userInputs.dpoLink}
            onChange={(e) => {
              let link = e.target.value;

              setUserInputs((prev) => {
                return { ...prev, dpoLink: link };
              });

              setTimes((prev) => {
                return { ...prev, dpoCompleteTime: new Date() };
              });
            }}
            error={userInputs.dpoLink !== "" && errors.dpoLink !== undefined}
            autoComplete="aaaaa"
            aria-autocomplete="none"
            className="w-96"
          />
        </Tooltip>

        <div className="flex flex-row gap-x-2">
          <Tooltip
            title={
              userInputs.routedTbaCount !== "" ? errors.routedTbaCount : ""
            }
            followCursor
          >
            <TextField
              label="TBAs routed"
              value={userInputs.routedTbaCount}
              onChange={(e) => {
                let numOfTBAs = e.target.value.replaceAll(",", "");

                setUserInputs((prev) => {
                  return { ...prev, routedTbaCount: numOfTBAs };
                });
              }}
              error={
                userInputs.routedTbaCount !== "" &&
                errors.routedTbaCount !== undefined
              }
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
            />
          </Tooltip>

          <Tooltip
            title={userInputs.routeCount !== "" ? errors.routeCount : ""}
            followCursor
          >
            <TextField
              label="# of generated routes"
              value={userInputs.routeCount}
              onChange={(e) => {
                let NumOfRoutes = e.target.value.replaceAll(",", "");

                setUserInputs((prev) => {
                  return { ...prev, routeCount: NumOfRoutes };
                });
              }}
              error={
                userInputs.routeCount !== "" && errors.routeCount !== undefined
              }
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
            />
          </Tooltip>
        </div>
        <div className="flex flex-row gap-x-2">
          <Typography className="pl-2">
            {"Total routes: " +
              (isNumeric(userInputs.routeCount) &&
              isNumeric(userInputs.bufferPercent)
                ? Math.ceil(
                    parseInt(userInputs.routeCount) +
                      parseInt(userInputs.routeCount) *
                        (parseInt(userInputs.bufferPercent) / 100)
                  )
                : "???")}
          </Typography>
          <div className="ml-auto">
            <Typography
              className={`pr-2 ml-auto ${
                userInputs.fileTbaCount && userInputs.routedTbaCount
                  ? percentToTextColor(
                      percentChange(
                        userInputs.fileTbaCount,
                        coerceToNumber(userInputs.routedTbaCount)
                      ),
                      "low",
                      5,
                      10
                    )
                  : ""
              }`}
            >{`Delta: ${
              userInputs.fileTbaCount && userInputs.routedTbaCount
                ? percentChange(
                    userInputs.fileTbaCount,
                    coerceToNumber(userInputs.routedTbaCount)
                  ).toFixed(2) + "%"
                : "???"
            }`}</Typography>
          </div>
        </div>

        <div className="w-96 flex flex-row gap-x-2">
          <Button
            variant="outlined"
            onClick={() => {
              copyAuditBlurb();
            }}
            disabled={
              (areVolumeCheckErrors(errors) ||
                userInputs.fileTbaCount === undefined) &&
              Object.keys(errors).length != 0
            }
          >
            Audit
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              const totalRoutes = Math.ceil(
                parseInt(userInputs.routeCount) *
                  (1 + parseInt(userInputs.bufferPercent) / 100)
              );

              const blurb = `${
                userInputs.routingType == "samedaysunrise"
                  ? "Same Day Sunrise"
                  : "Same Day AM"
              } routing complete: ${
                userInputs.routedTbaCount
              } TBAs routed. ${totalRoutes} total flex routes (${
                userInputs.routeCount
              } + ${
                totalRoutes - parseInt(userInputs.routeCount)
              } buffer).\nDispatch plan: ${userInputs.dpoLink}`;

              navigator.clipboard.writeText(blurb);
              enqueueSnackbar("Station blurb copied", {
                variant: "success",
              });
            }}
            disabled={Object.keys(errors).length > 0}
          >
            Station
          </Button>
          <div className="ml-auto">
            <Button
              variant="contained"
              onClick={() => {
                const completeTime = new Date();
                setTimes((prev) => {
                  return { ...prev, endTime: completeTime };
                });
                const res = parseSameDayInputs(userInputs);
                if (res.success) {
                  props.onComplete(props.taskId, {
                    ...res.data,
                    ...times,
                    endTime: completeTime,
                  });
                }
              }}
              disabled={Object.keys(errors).length > 0}
            >
              Complete Task
            </Button>
          </div>
        </div>
      </Paper>
    </DropArea>
  );
};

export default SameDay;

// PROPOSAL: Adjust percentage with mouse scrollwheel
