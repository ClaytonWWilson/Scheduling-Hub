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
  Typography,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import {
  CSVDecodedRow,
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

type SameDayProps = {
  onCancel: (taskId: number) => void;
  onComplete: (taskId: number, data: SameDayData) => void;
  onShowDialog: (dialogInfo: DialogInfo) => void;
  taskId: number;
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
const areVolumeCheckErrors = (data: SameDayData, errors: SameDayErrors) => {
  // Can't do a volume check without file volume
  if (!data.fileTbaCount) return true;

  const volumeCheckRequiredKeys = [
    "stationCode",
    "routingType",
    "routedTbaCount",
    "fileTbaCount",
  ];

  // Check if any required input data is missing
  for (let i = 0; i < Object.entries(data).length; i++) {
    const [key, val] = Object.entries(data)[i];
    if (volumeCheckRequiredKeys.indexOf(key) != -1 && val === undefined) {
      return true;
    }
  }

  // Check if there are any errors in the required data
  for (let i = 0; i < Object.entries(errors).length; i++) {
    const [key, val] = Object.entries(errors)[i];
    if (volumeCheckRequiredKeys.indexOf(key) != -1 && val !== undefined) {
      return true;
    }
  }

  return false;
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

const SameDay = (props: SameDayProps) => {
  const [userInputs, setUserInputs] = useState<SameDayInputs>({
    stationCode: "",
    routingType: "",
    bufferPercent: "",
    dpoLink: "",
    routeCount: "",
    routedTbaCount: "",
  });

  const [validatedData, setValidatedData] = useState<SameDayData>({
    startTime: undefined,
    stationCode: undefined,
    routingType: undefined,
    bufferPercent: undefined,
    dpoLink: undefined,
    dpoCompleteTime: undefined,
    routeCount: undefined,
    fileTbaCount: undefined,
    routedTbaCount: undefined,
    endTime: undefined,
  });

  // const [focused, setFocused] = useState({
  //   stationCode: false,
  //   bufferPercent: false,
  //   dpoLink: false,
  //   routeCount: false,
  //   routedTbaCount: false,
  // });

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

      setUserInputs((prev) => {
        return { ...prev, stationCode, routingType };
      });

      const fileTbaCount = fileJson.length;

      setValidatedData((currentData) => {
        return { ...currentData, fileTbaCount };
      });

      setFileData(fileJson);
    });

    reader.readAsText(inputFile);
  };

  const getVolumeAudit = () => {
    if (!validatedData.fileTbaCount || !validatedData.routedTbaCount) return "";

    const blurb = `/md\n**${userInputs.stationCode}** ${
      userInputs.routingType == "samedaysunrise"
        ? "SAME_DAY_SUNRISE"
        : "SAME_DAY_AM"
    }: Routing completed.\nFile: **${
      validatedData.fileTbaCount
    }** TBAs // Routed: **${
      validatedData.routedTbaCount
    }** TBAs // Delta: **${percentChange(
      validatedData.fileTbaCount,
      validatedData.routedTbaCount
    ).toFixed(2)}%**`;

    return blurb;
  };

  const getDispatchAudit = () => {
    const totalRoutes = Math.ceil(
      parseInt(userInputs.routeCount) *
        (1 + parseInt(userInputs.bufferPercent) / 100)
    );
    let blurb = `/md\n**${userInputs.stationCode}** ${
      userInputs.routingType == "samedaysunrise"
        ? "SAME_DAY_SUNRISE"
        : "SAME_DAY_AM"
    }: **${totalRoutes}** total flex routes (**${userInputs.routeCount}** + **${
      totalRoutes - parseInt(userInputs.routeCount)
    }** buffer)`;

    if (validatedData.fileTbaCount && validatedData.routedTbaCount) {
      blurb += `\nFile: **${validatedData.fileTbaCount}** TBAs // Routed: **${
        validatedData.routedTbaCount
      }** TBAs // Delta: **${percentChange(
        validatedData.fileTbaCount,
        validatedData.routedTbaCount
      ).toFixed(2)}%**`;
    }

    return blurb;
  };

  // Checks all user input and sets errors and validated data
  const validateInputData = () => {
    const errors: SameDayErrors = {
      stationCode: undefined,
      routingType: undefined,
      bufferPercent: undefined,
      dpoLink: undefined,
      routeCount: undefined,
      routedTbaCount: undefined,
    };

    const validated: SameDayData = {
      startTime: validatedData.startTime,
      stationCode: undefined,
      routingType: undefined,
      bufferPercent: undefined,
      dpoLink: undefined,
      dpoCompleteTime: validatedData.dpoCompleteTime,
      routeCount: undefined,
      routedTbaCount: undefined,
      fileTbaCount: validatedData.fileTbaCount,
      endTime: validatedData.endTime,
    };

    // Validate stationCode
    if (userInputs.stationCode === "") {
      errors.stationCode = "Station Code cannot be empty.";
    } else if (!isStationCodeValid(userInputs.stationCode)) {
      errors.stationCode = "Station Code is invalid.";
    } else {
      validated.stationCode = userInputs.stationCode;
    }

    // Validate routingType
    if (userInputs.routingType === "") {
      errors.routingType = "Routing type cannot be blank.";
    } else if (
      userInputs.routingType !== "samedaysunrise" &&
      userInputs.routingType !== "samedayam"
    ) {
      errors.routingType =
        "Routing Type must be either Same Day Sunrise or Same Day AM.";
    } else {
      validated.routingType = userInputs.routingType;
    }

    // Validate bufferPercent
    if (userInputs.bufferPercent === "") {
      errors.bufferPercent = "Buffer percentage cannot be empty.";
    } else if (!isNumeric(userInputs.bufferPercent)) {
      errors.bufferPercent = "Buffer percentage must be a number.";
    } else if (parseInt(userInputs.bufferPercent) < 0) {
      errors.bufferPercent = "Buffer percentage must be a positive number.";
    } else {
      validated.bufferPercent = parseInt(userInputs.bufferPercent);
    }
    if (errors.bufferPercent) {
      validated.dpoCompleteTime = undefined;
    }

    // Validate dpoLink
    if (!isDpoLinkValid(userInputs.dpoLink, userInputs.stationCode)) {
      errors.dpoLink = "DPO Link is invalid.";
    } else {
      validated.dpoLink = userInputs.dpoLink;
      validated.dpoCompleteTime = new Date();
    }

    // Validate routedTbaCount
    if (userInputs.routedTbaCount === "") {
      errors.routedTbaCount = "TBAs routed cannot be empty.";
    } else if (!isNumeric(userInputs.routedTbaCount)) {
      errors.routedTbaCount = "TBAs routed must be a number.";
    } else if (parseInt(userInputs.routedTbaCount) < 0) {
      errors.routedTbaCount = "TBAs routed cannot be negative.";
    } else {
      validated.routedTbaCount = parseInt(userInputs.routedTbaCount);
    }

    // generated routes
    if (userInputs.routeCount === "") {
      errors.routeCount = "Number of routes cannot be empty.";
    } else if (!isNumeric(userInputs.routeCount)) {
      errors.routeCount = "Number of routes must be a number.";
    } else if (parseInt(userInputs.routeCount) < 0) {
      errors.routeCount = "Number of routes cannot be negative.";
    } else {
      validated.routeCount = parseInt(userInputs.routeCount);
    }

    setErrors(errors);
    setValidatedData((prev) => {
      return { ...prev, ...validated };
    });
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
    setValidatedData((prev) => {
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
            validatedData.fileTbaCount ? validatedData.fileTbaCount : "???"
          }`}</IconTypography>
        </div>
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
        <TextField
          label="DPO Link"
          value={userInputs.dpoLink}
          onChange={(e) => {
            let link = e.target.value;

            setUserInputs((prev) => {
              return { ...prev, dpoLink: link };
            });
          }}
          error={userInputs.dpoLink !== "" && errors.dpoLink !== undefined}
          autoComplete="aaaaa"
          aria-autocomplete="none"
          className="w-96"
        />
        <div className="flex flex-row gap-x-2">
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
                validatedData.fileTbaCount && validatedData.routedTbaCount
                  ? percentToTextColor(
                      percentChange(
                        validatedData.fileTbaCount,
                        validatedData.routedTbaCount
                      ),
                      "low",
                      5,
                      10
                    )
                  : ""
              }`}
            >{`Delta: ${
              validatedData.fileTbaCount && validatedData.routedTbaCount
                ? percentChange(
                    validatedData.fileTbaCount,
                    validatedData.routedTbaCount
                  ).toFixed(2) + "%"
                : "???"
            }`}</Typography>
          </div>
        </div>

        <div className="w-96 flex flex-row gap-x-2">
          <Button
            variant="outlined"
            onClick={() => {
              if (
                !areVolumeCheckErrors(validatedData, errors) &&
                areInputErrors(validatedData, errors)
              ) {
                navigator.clipboard.writeText(getVolumeAudit());
                enqueueSnackbar("Volume audit copied", { variant: "success" });
              } else if (!areInputErrors(validatedData, errors)) {
                navigator.clipboard.writeText(getDispatchAudit());
                enqueueSnackbar("Dispatch audit copied", {
                  variant: "success",
                });
              }
            }}
            disabled={
              areVolumeCheckErrors(validatedData, errors) &&
              areInputErrors(validatedData, errors)
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
            disabled={areInputErrors(validatedData, errors)}
          >
            Station
          </Button>
          <div className="ml-auto">
            <Button
              variant="contained"
              onClick={() => {
                const completeTime = new Date();
                setValidatedData((prev) => {
                  return { ...prev, endTime: completeTime };
                });
                props.onComplete(props.taskId, {
                  ...validatedData,
                  endTime: completeTime,
                });
              }}
              disabled={areInputErrors(validatedData, errors)}
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

// FEATURE: Autocomplete station code
// FEATURE: Easily add stations to autocomplete
// PROPOSAL: Adjust percentage with mouse scrollwheel
// FEATURE: Copy DPO link

// TODO: Create multiple error severities: info, warn, error

// TODO: Dynamic tooltips on buttons to give more info
// TODO: Add helpertext prop to textfield to show errors
