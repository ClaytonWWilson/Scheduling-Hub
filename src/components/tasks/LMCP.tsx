import React, { useEffect, useState } from "react";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  DialogInfo,
  LMCPExportableData,
  LMCPInputs,
  LMCPTaskData,
  LMCPTaskErrors,
} from "../../types/Tasks";
import DropArea from "../DropArea";
import {
  Autocomplete,
  Button,
  FormControlLabel,
  FormGroup,
  IconButton,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { DatePicker } from "@mui/x-date-pickers";
import {
  coerceToNumber,
  csv2json,
  getTimezoneAdjustedDate,
  json2csv,
  noAutocomplete,
  objectHasData,
} from "../../Utilities";
import { format } from "date-fns";
import { save } from "@tauri-apps/api/dialog";
import { writeTextFile } from "@tauri-apps/api/fs";
import LMCPStatusOverview from "../LMCPStatusOverview";
import { enqueueSnackbar } from "notistack";

type LMCPProps = {
  onCancel: (taskId: number) => void;
  onComplete: (taskId: number, data: LMCPTaskData) => void;
  onShowDialog: (dialogInfo: DialogInfo) => void;
  taskId: number;
};

const TaskTimes = z.object({
  startTime: z.date().optional(),
  exportTime: z.date().optional(),
  endTime: z.date().optional(),
});

type TaskTimes = z.infer<typeof TaskTimes>;

const emptyRequest = (): LMCPInputs => {
  return {
    source: "",
    namespace: "",
    type: "",
    stationCode: "",
    waveGroupName: "",
    shipOptionCategory: "",
    addressType: "",
    packageType: "",
    ofdDate: "",
    ead: "",
    cluster: "",
    fulfillmentNetworkType: "",
    volumeType: "",
    week: "",
    f: "",
    requested: "",
    currentLmcp: "",
    currentAtrops: "",
    pdr: "",
    simLink: "",
  };
};

const parseLMCPInputs = (currentData: LMCPInputs) => {
  const temp = { ...currentData };

  // Coerce to numbers. Ensures that commas in a number string dont invalidate it.
  // @ts-ignore
  temp.requested = coerceToNumber(temp.requested);
  // @ts-ignore
  temp.pdr = coerceToNumber(temp.pdr);
  // @ts-ignore
  temp.currentLmcp = coerceToNumber(temp.currentLmcp);
  // @ts-ignore
  temp.currentAtrops = coerceToNumber(temp.currentAtrops);
  // @ts-ignore
  temp.value = temp.requested - temp.pdr;

  return LMCPTaskData.safeParse(temp);
};

const LMCP = (props: LMCPProps) => {
  const inputs = useState<LMCPInputs>();
  const [importedRequests, setImportedRequests] = useState(
    new Map<string, LMCPInputs>()
  );
  const [currentRequest, setCurrentRequest] = useState<LMCPInputs>(
    emptyRequest()
  );
  const [errors, setErrors] = useState<LMCPTaskErrors>({});
  const [showExtended, setShowExtended] = useState(false);
  const [times, setTimes] = useState<TaskTimes>({});

  const importFileHandler = (files: FileList) => {
    // TODO: Error check if wrong file is dropped
    if (files.length === 0) return;

    if (objectHasData(currentRequest)) {
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

      const requests = new Map<string, LMCPInputs>();

      fileJson.forEach((row) => {
        const lmcpRequest: LMCPInputs = {
          source: row['"Source (string)"'] ? row['"Source (string)"'] : "",
          namespace: row['"Namespace (string)"']
            ? row['"Namespace (string)"']
            : "",
          type: row['"Type (string)"'] ? row['"Type (string)"'] : "",
          stationCode: row['"StationCode (string)"']
            ? row['"StationCode (string)"']
            : "",
          waveGroupName: row['"WaveGroupName (string)"']
            ? row['"WaveGroupName (string)"']
            : "",
          shipOptionCategory: row['"ShipOptionCategory (string)"']
            ? row['"ShipOptionCategory (string)"']
            : "",
          addressType: row['"AddressType (string)"']
            ? row['"AddressType (string)"']
            : "",
          packageType: row['"PackageType (string)"']
            ? row['"PackageType (string)"']
            : "",
          ofdDate: row['"OFDDate (string)"']
            ? new Date(row['"OFDDate (string)"'])
            : "",
          ead: row['"EAD (string)"'] ? new Date(row['"EAD (string)"']) : "",
          cluster: row['"Cluster (string)"'] ? row['"Cluster (string)"'] : "",
          fulfillmentNetworkType: row['"FulfillmentNetworkType (string)"']
            ? row['"FulfillmentNetworkType (string)"']
            : "",
          volumeType: row['"VolumeType (string)"']
            ? row['"VolumeType (string)"']
            : "",
          requested: row['"Value (number)"'] ? row['"Value (number)"'] : "",
          f: row['"f (string)"'] ? row['"f (string)"'] : "",
          week: row['"Week (number)"'] ? row['"Week (number)"'] : "",
          currentLmcp: "",
          currentAtrops: "",
          pdr: "",
          simLink: "",
        };

        requests.set(lmcpRequest.stationCode, lmcpRequest);
      });

      setImportedRequests(() => {
        const initiallySelected = [...requests.values()][0];

        if (initiallySelected) {
          setCurrentRequest(initiallySelected);
        } else {
          setCurrentRequest(emptyRequest());
        }

        return requests;
      });
    });

    reader.readAsText(inputFile);
  };

  const exportHandler = () => {
    if (!currentRequest) return;

    const temp = {
      ...currentRequest,
      value:
        parseInt(currentRequest.requested.toString()) -
        parseInt(currentRequest.pdr.toString()),
    };

    // TODO: Need to do this same kind of parsing and validation in the validation func
    const res = LMCPExportableData.safeParse(temp);

    if (!res.success) {
      console.error(res);
      return;
    }

    const intExtHeaderMapping = new Map(
      Object.entries({
        source: "Source",
        namespace: "Namespace",
        type: "Type",
        stationCode: "StationCode",
        waveGroupName: "WaveGroupName",
        shipOptionCategory: "ShipOptionCategory",
        addressType: "AddressType",
        packageType: "PackageType",
        ofdDate: "OFDDate",
        ead: "EAD",
        cluster: "Cluster",
        fulfillmentNetworkType: "FulfillmentNetworkType",
        volumeType: "VolumeType",
        week: "Week",
        f: "f",
        value: "Value",
      })
    );

    const csvData = json2csv([res.data], intExtHeaderMapping);

    const today = format(new Date(), "yyyy-MM-dd");

    save({
      filters: [
        {
          name: "Comma Separated Values",
          extensions: ["csv"],
        },
      ],
      defaultPath: `${res.data.stationCode} - ${today} - LMCP Adjustment.csv`,
    })
      .then((path) => {
        if (!path) return;

        return writeTextFile({ path: path, contents: csvData });
      })
      .then((writeResult) => {
        // null == completed, undefined == cancelled/errored
        if (writeResult === null) {
          enqueueSnackbar("File saved", {
            variant: "success",
          });
        } else {
          enqueueSnackbar("Export failed", {
            variant: "error",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getWarRoomBlurb = () => {
    const blurb = `(${currentRequest.simLink})
Site: ${currentRequest.stationCode}
Requesting: ${currentRequest.requested}
LMCP: ${currentRequest.currentLmcp}
Atrops: ${currentRequest.currentAtrops}
Reason: `;

    return blurb;
  };

  const validateInputData = () => {
    const res = parseLMCPInputs(currentRequest);
    if (res.success) {
      setErrors({});
    } else {
      mapErrorsToState(res.error.errors);
    }
  };

  const mapErrorsToState = (zodErrors: z.ZodIssue[]) => {
    const lmcpErrors: LMCPTaskErrors = {};

    zodErrors.forEach((zodError) => {
      lmcpErrors[zodError.path[0] as keyof LMCPTaskErrors] = zodError.message;
    });

    setErrors(lmcpErrors);
  };

  // Automatically validates the inputs when any of their values change
  useEffect(validateInputData, [currentRequest]);

  // Runs once when the component is mounted
  useEffect(() => {
    setTimes({ startTime: new Date() });
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
            LMCP Adjustment
          </Typography>
        </div>
        <Autocomplete
          options={[...importedRequests.keys()]}
          value={currentRequest.stationCode}
          getOptionLabel={(option) => option}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Station"
              inputProps={{
                ...params.inputProps,
                autoComplete: noAutocomplete,
              }}
              onChange={(e) => {
                const stationCode = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, stationCode };
                });
              }}
              error={
                errors.stationCode !== undefined &&
                currentRequest.stationCode !== ""
              }
            />
          )}
          onChange={(_, stationCode) => {
            if (!stationCode) {
              setCurrentRequest((prev) => {
                return { ...prev, stationCode: "" };
              });
              return;
            }

            const temp = importedRequests.get(stationCode);
            let nextRequest: LMCPInputs;

            if (temp) {
              nextRequest = temp;
            } else {
              nextRequest = emptyRequest();
            }
            setCurrentRequest(() => {
              // Update import map
              const copyOfImported = importedRequests;
              copyOfImported.set(currentRequest.stationCode, currentRequest);

              setImportedRequests(copyOfImported);
              return nextRequest;
            });
          }}
          freeSolo
          disablePortal
        />
        <div className="flex flex-row gap-x-2">
          <DatePicker
            label="OFD Date"
            value={(() => {
              // Keeps the datepicker from throwing an error
              if (currentRequest.ofdDate === "") return null;
              return getTimezoneAdjustedDate(currentRequest.ofdDate);
            })()}
            onChange={(newOfdDate) => {
              if (!newOfdDate) return null;

              setCurrentRequest((prevSelected) => {
                return { ...prevSelected, ofdDate: newOfdDate };
              });
            }}
          />
          <DatePicker
            label="EAD Date"
            value={(() => {
              // Keeps the datepicker from throwing an error
              if (currentRequest.ead === "") return null;
              return getTimezoneAdjustedDate(currentRequest.ead);
            })()}
            onChange={(newEadDate) => {
              if (!newEadDate) return null;

              setCurrentRequest((prevSelected) => {
                return { ...prevSelected, ead: newEadDate };
              });
            }}
          />
        </div>
        <div className="flex flex-row gap-x-2">
          <TextField
            label="Current LMCP"
            autoComplete={noAutocomplete}
            aria-autocomplete="none"
            className="w-full"
            value={currentRequest.currentLmcp}
            onChange={(e) => {
              const current = e.target.value
                .replaceAll(",", "")
                .replaceAll(" ", "");

              setCurrentRequest((prevSelected) => {
                const updatedSelected = {
                  ...prevSelected,
                  currentLmcp: current,
                };

                return updatedSelected;
              });
            }}
            error={
              errors.currentLmcp !== undefined &&
              currentRequest.currentLmcp !== ""
            }
          />
          <TextField
            label="Current ATROPS"
            autoComplete={noAutocomplete}
            aria-autocomplete="none"
            className="w-full"
            value={currentRequest.currentAtrops}
            onChange={(e) => {
              const atrops = e.target.value
                .replaceAll(",", "")
                .replaceAll(" ", "");

              setCurrentRequest((prevSelected) => {
                return { ...prevSelected, currentAtrops: atrops };
              });
            }}
            error={
              errors.currentAtrops !== undefined &&
              currentRequest.currentAtrops !== ""
            }
          />
        </div>
        <div className="flex flex-row gap-x-2">
          <TextField
            label="PDR"
            autoComplete={noAutocomplete}
            aria-autocomplete="none"
            className="w-full"
            value={currentRequest.pdr}
            onChange={(e) => {
              const pdr = e.target.value
                .replaceAll(",", "")
                .replaceAll(" ", "");

              setCurrentRequest((prevSelected) => {
                return { ...prevSelected, pdr: pdr };
              });
            }}
            error={errors.pdr !== undefined && currentRequest.pdr !== ""}
          />

          <TextField
            label="Requested Value"
            autoComplete={noAutocomplete}
            aria-autocomplete="none"
            className="w-full"
            value={currentRequest.requested}
            onChange={(e) => {
              const requested = e.target.value
                .replaceAll(",", "")
                .replaceAll(" ", "");

              setCurrentRequest((prevSelected) => {
                return { ...prevSelected, requested: requested };
              });
            }}
            error={
              errors.requested !== undefined && currentRequest.requested !== ""
            }
          />
        </div>
        <div className="flex flex-row gap-x-2">
          <TextField
            label="SIM Link"
            autoComplete={noAutocomplete}
            aria-autocomplete="none"
            className="w-full"
            value={currentRequest.simLink}
            onChange={(e) => {
              const simLink = e.target.value;

              setCurrentRequest((prevSelected) => {
                return { ...prevSelected, simLink: simLink };
              });
            }}
            error={
              errors.simLink !== undefined && currentRequest.simLink !== ""
            }
          />
        </div>
        <div>
          <LMCPStatusOverview
            requested={coerceToNumber(currentRequest.requested)}
            pdr={coerceToNumber(currentRequest.pdr)}
            currentLmcp={coerceToNumber(currentRequest.currentLmcp)}
            currentAtrops={coerceToNumber(currentRequest.currentAtrops)}
          />
        </div>
        <FormGroup className="w-fit ml-auto">
          <FormControlLabel
            control={<Switch />}
            label="Show all"
            labelPlacement="start"
            value={showExtended}
            onChange={(_, checked) => setShowExtended(checked)}
          />
        </FormGroup>
        <div className={`flex-col gap-y-2 ${showExtended ? "flex" : "hidden"}`}>
          <div className="flex flex-row gap-x-2">
            <TextField
              label="Wave Group Name"
              autoComplete={noAutocomplete}
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.waveGroupName}
              onChange={(e) => {
                const waveGroupName = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, waveGroupName };
                });
              }}
              error={
                errors.waveGroupName !== undefined &&
                currentRequest.waveGroupName !== ""
              }
            />
            <TextField
              label="Week"
              autoComplete={noAutocomplete}
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.week}
              onChange={(e) => {
                const week = e.target.value
                  .replaceAll(",", "")
                  .replaceAll(" ", "");

                setCurrentRequest((prev) => {
                  return { ...prev, week };
                });
              }}
              error={errors.week !== undefined && currentRequest.week !== ""}
            />
          </div>

          <div className="flex flex-row gap-x-2">
            <TextField
              label="Source"
              autoComplete={noAutocomplete}
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.source}
              onChange={(e) => {
                const source = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, source };
                });
              }}
              error={
                errors.source !== undefined && currentRequest.source !== ""
              }
            />
            <TextField
              label="Namespace"
              autoComplete={noAutocomplete}
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.namespace}
              onChange={(e) => {
                const namespace = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, namespace };
                });
              }}
              error={
                errors.namespace !== undefined &&
                currentRequest.namespace !== ""
              }
            />
            <TextField
              label="Type"
              autoComplete={noAutocomplete}
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.type}
              onChange={(e) => {
                const type = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, type };
                });
              }}
              error={errors.type !== undefined && currentRequest.type !== ""}
            />
          </div>
          <div className="flex flex-row gap-x-2">
            <TextField
              label="Ship Option Category"
              autoComplete={noAutocomplete}
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.shipOptionCategory}
              onChange={(e) => {
                const shipOptionCategory = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, shipOptionCategory };
                });
              }}
              error={
                errors.shipOptionCategory !== undefined &&
                currentRequest.shipOptionCategory !== ""
              }
            />
            <TextField
              label="Address Type"
              autoComplete={noAutocomplete}
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.addressType}
              onChange={(e) => {
                const addressType = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, addressType };
                });
              }}
              error={
                errors.addressType !== undefined &&
                currentRequest.addressType !== ""
              }
            />
          </div>
          <div className="flex flex-row gap-x-2">
            <TextField
              label="Package Type"
              autoComplete={noAutocomplete}
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.packageType}
              onChange={(e) => {
                const packageType = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, packageType };
                });
              }}
              error={
                errors.packageType !== undefined &&
                currentRequest.packageType !== ""
              }
            />
            <TextField
              label="Volume Type"
              autoComplete={noAutocomplete}
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.volumeType}
              onChange={(e) => {
                const volumeType = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, volumeType };
                });
              }}
              error={
                errors.volumeType !== undefined &&
                currentRequest.volumeType !== ""
              }
            />
          </div>
          <div className="flex flex-row gap-x-2">
            <TextField
              label="Cluster"
              autoComplete={noAutocomplete}
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.cluster}
              onChange={(e) => {
                const cluster = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, cluster };
                });
              }}
              error={
                errors.cluster !== undefined && currentRequest.cluster !== ""
              }
            />
            <TextField
              label="f"
              autoComplete={noAutocomplete}
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.f}
              onChange={(e) => {
                const f = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, f };
                });
              }}
              error={errors.f !== undefined && currentRequest.f !== ""}
            />
          </div>
          <div className="flex flex-row gap-x-2">
            <TextField
              label="Fulfillment Network Type"
              autoComplete={noAutocomplete}
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.fulfillmentNetworkType}
              onChange={(e) => {
                const fulfillmentNetworkType = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, fulfillmentNetworkType };
                });
              }}
              error={
                errors.fulfillmentNetworkType !== undefined &&
                currentRequest.fulfillmentNetworkType !== ""
              }
            />
          </div>
        </div>

        <div className="w-96 flex flex-row gap-x-2">
          <Button
            onClick={() => {
              setTimes((prev) => {
                return { ...prev, exportTime: new Date() };
              });
              exportHandler();
            }}
            variant="outlined"
            disabled={Object.keys(errors).length > 0}
          >
            Export
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(getWarRoomBlurb());
              enqueueSnackbar("War Room blurb copied", {
                variant: "success",
              });
            }}
            variant="outlined"
            disabled={Object.keys(errors).length > 0}
          >
            Blurb
          </Button>
          <div className="ml-auto">
            <Button
              onClick={() => {
                const res = parseLMCPInputs(currentRequest);
                const endTime = new Date();

                if (res.success) {
                  setTimes((prev) => {
                    return { ...prev, endTime };
                  });
                  props.onComplete(props.taskId, {
                    ...res.data,
                    ...times,
                    endTime,
                  });
                } else {
                  // Should never occur since the button shouldn't be clickable
                  const dialog: DialogInfo = {
                    title:
                      "The following error(s) occurred while trying to close",
                    message: `${
                      fromZodError(res.error).message
                    }\nDo you want to continue closing without saving?`,
                    options: "YesNo",
                    onConfirm: () => {
                      props.onCancel(props.taskId);
                    },
                  };
                  props.onShowDialog(dialog);
                }
              }}
              variant="contained"
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

export default LMCP;
