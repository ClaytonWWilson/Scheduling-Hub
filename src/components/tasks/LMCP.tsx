import React, { useEffect, useState } from "react";
import { LMCPData } from "../../types/Tasks";
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
import { coerceStringToInteger, csv2json, json2csv } from "../../Utilities";
import { format } from "date-fns";
import { save } from "@tauri-apps/api/dialog";
import { writeTextFile } from "@tauri-apps/api/fs";

type LMCPProps = {
  onCancel: (taskId: number) => void;
  onComplete: (taskId: number, data: LMCPData) => void;
  taskId: number;
};

// Stores all the raw strings from the user before they are validated
type LMCPUserInputs = {
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
  week: string;
  f: string;
  value: string;
  currentLmcp: string;
  currentAtrops: string;
  pdr: string;
  simLink: string;
};

type LMCPApprovalStatus = "autoapproved" | "l7required" | "escalate";

// TODO: This should take into account PDR and the larger of the two (atrops and lmcp) values
const getApprovalStatus = (
  requested: number,
  current: number
): LMCPApprovalStatus => {
  const percent = getAdjustmentPercent(requested, current);

  if (percent <= 5) {
    return "autoapproved";
  } else if (percent > 5 && percent <= 10) {
    return "l7required";
  } else {
    return "escalate";
  }
};

const getAdjustmentPercent = (requested: number, current: number) => {
  return (requested / current - 1) * 100;
};

const LMCP = (props: LMCPProps) => {
  const [importedRequests, setImportedRequests] = useState(
    new Map<string, LMCPUserInputs>()
  );

  const [selectedRequest, setSelectedRequest] = useState<LMCPUserInputs | null>(
    null
  );
  const [showExtended, setShowExtended] = useState(false);

  const importFileHandler = (files: FileList) => {
    // TODO: Error check if wrong file is dropped
    if (files.length === 0) return;

    const inputFile = files[0];
    const reader = new FileReader();

    reader.addEventListener("load", (e) => {
      if (!e.target || !e.target.result) return;

      const fileJson = csv2json(e.target.result as string, { headers: true });

      const requests = new Map<string, LMCPUserInputs>();

      fileJson.forEach((row) => {
        const lmcpRequest: LMCPUserInputs = {
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
          ofdDate: row['"OFDDate (string)"'] ? row['"OFDDate (string)"'] : "",
          ead: row['"EAD (string)"'] ? row['"EAD (string)"'] : "",
          cluster: row['"Cluster (string)"'] ? row['"Cluster (string)"'] : "",
          fulfillmentNetworkType: row['"FulfillmentNetworkType (string)"']
            ? row['"FulfillmentNetworkType (string)"']
            : "",
          volumeType: row['"VolumeType (string)"']
            ? row['"VolumeType (string)"']
            : "",
          week: row['"Week (number)"'] ? row['"Week (number)"'] : "",
          f: row['"f (string)"'] ? row['"f (string)"'] : "",
          value: row['"Value (number)"'] ? row['"Value (number)"'] : "",
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
          setSelectedRequest(initiallySelected);
        } else {
          setSelectedRequest(null);
        }

        return requests;
      });
    });

    reader.readAsText(inputFile);
  };

  const exportHandler = () => {
    // TODO: Switch this to the validated data
    if (!selectedRequest) return;

    const headersMapping = new Map(
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

    const data: LMCPData = {
      source: selectedRequest.source,
      namespace: selectedRequest.namespace,
      type: selectedRequest.type,
      stationCode: selectedRequest.stationCode,
      waveGroupName: selectedRequest.waveGroupName,
      shipOptionCategory: selectedRequest.shipOptionCategory,
      addressType: selectedRequest.addressType,
      packageType: selectedRequest.packageType,
      ofdDate: selectedRequest.ofdDate,
      ead: selectedRequest.ead,
      cluster: selectedRequest.cluster,
      fulfillmentNetworkType: selectedRequest.fulfillmentNetworkType,
      volumeType: selectedRequest.volumeType,
      week: coerceStringToInteger(selectedRequest.week),
      f: selectedRequest.f,
      value: coerceStringToInteger(selectedRequest.value),
    };

    const csvData = json2csv([data], headersMapping);

    const today = format(new Date(), "yyyy-MM-dd");

    save({
      filters: [
        {
          name: "Comma Separated Values",
          extensions: ["csv"],
        },
      ],
      defaultPath: `${data.stationCode} - ${today} - LMCP Adjustment.csv`,
    })
      .then((path) => {
        if (!path) return;

        return writeTextFile({ path: path, contents: csvData });
      })
      .then((writeResult) => {
        console.log(writeResult);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const validateInputData = () => {
    return;
  };

  // Automatically validates the inputs when any of their values change
  useEffect(validateInputData, [selectedRequest]);

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
          value={selectedRequest ? selectedRequest.stationCode : null}
          getOptionLabel={(option) => option}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Station"
              inputProps={{
                ...params.inputProps,
                autoComplete: "new-password", // disable autocomplete and autofill
              }}
            />
          )}
          onChange={(_, stationCode) => {
            if (!stationCode) return;

            const temp = importedRequests.get(stationCode);
            let nextRequest: LMCPUserInputs | null = temp ? temp : null;
            setSelectedRequest(() => {
              // Update import map
              if (selectedRequest) {
                const copyOfImported = importedRequests;
                copyOfImported.set(
                  selectedRequest.stationCode,
                  selectedRequest
                );

                setImportedRequests(copyOfImported);
              }
              return nextRequest;
            });
          }}
        />
        <div className="flex flex-row gap-x-2">
          <DatePicker
            label="OFD Date"
            value={(() => {
              if (!selectedRequest) return null;

              const ofdDate = selectedRequest.ofdDate;

              const date = new Date(ofdDate);
              const timezoneAdjustedDate = new Date(
                date.getTime() + date.getTimezoneOffset() * 60000
              );
              return timezoneAdjustedDate;
            })()}
            onChange={(newOfdDate) => {
              if (!selectedRequest || !newOfdDate) return;

              const formattedDate = format(newOfdDate, "yyyy-MM-dd");
              setSelectedRequest((prevSelected) => {
                if (!prevSelected) return null;

                return { ...prevSelected, ofdDate: formattedDate };
              });
            }}
          />
          <DatePicker
            label="EAD Date"
            value={(() => {
              if (!selectedRequest) return null;

              const eadDate = selectedRequest.ead;

              const date = new Date(eadDate);
              const timezoneAdjustedDate = new Date(
                date.getTime() + date.getTimezoneOffset() * 60000
              );
              return timezoneAdjustedDate;
            })()}
            onChange={(newOfdDate) => {
              if (!selectedRequest || !newOfdDate) return;

              const formattedDate = format(newOfdDate, "yyyy-MM-dd");

              setSelectedRequest((prevSelected) => {
                if (!prevSelected) return null;

                return { ...prevSelected, ead: formattedDate };
              });
            }}
          />
        </div>
        <div className="flex flex-row gap-x-2">
          <TextField
            label="Current LMCP"
            autoComplete="aaaaa"
            aria-autocomplete="none"
            className="w-full"
            value={selectedRequest ? selectedRequest.currentLmcp : ""}
            onChange={(e) => {
              if (!selectedRequest) return;

              const current = e.target.value;

              setSelectedRequest((prevSelected) => {
                if (!prevSelected) return null;
                const updatedSelected = {
                  ...prevSelected,
                  currentLmcp: current,
                };
                // setImportedRequests

                return updatedSelected;
              });
            }}
          />
          <TextField
            label="Current ATROPS"
            autoComplete="aaaaa"
            aria-autocomplete="none"
            className="w-full"
            value={selectedRequest ? selectedRequest.currentAtrops : ""}
            onChange={(e) => {
              if (!selectedRequest) return;

              const atrops = e.target.value;

              setSelectedRequest((prevSelected) => {
                if (!prevSelected) return null;

                return { ...prevSelected, currentAtrops: atrops };
              });
            }}
          />
        </div>
        <div className="flex flex-row gap-x-2">
          <TextField
            label="PDR"
            autoComplete="aaaaa"
            aria-autocomplete="none"
            className="w-full"
            value={selectedRequest ? selectedRequest.pdr : ""}
            onChange={(e) => {
              if (!selectedRequest) return;

              const pdr = e.target.value;

              setSelectedRequest((prevSelected) => {
                if (!prevSelected) return null;

                return { ...prevSelected, pdr: pdr };
              });
            }}
          />

          <TextField
            label="Requested Value"
            autoComplete="aaaaa"
            aria-autocomplete="none"
            className="w-full"
            value={selectedRequest ? selectedRequest.value : ""}
            onChange={(e) => {
              if (!selectedRequest) return;

              const requested = e.target.value;

              setSelectedRequest((prevSelected) => {
                if (!prevSelected) return null;

                return { ...prevSelected, value: requested };
              });
            }}
          />
        </div>
        <div className="flex flex-row gap-x-2">
          <TextField
            label="SIM Link"
            autoComplete="aaaaa"
            aria-autocomplete="none"
            className="w-full"
            value={selectedRequest ? selectedRequest.simLink : ""}
            onChange={(e) => {
              if (!selectedRequest) return;

              const simLink = e.target.value;

              setSelectedRequest((prevSelected) => {
                if (!prevSelected) return null;

                return { ...prevSelected, simLink: simLink };
              });
            }}
          />
        </div>
        <div className="flex">
          <Typography className="pl-2 w-fit">{`Status: ${getApprovalStatus(
            1,
            1
          )}`}</Typography>
          <FormGroup className="w-fit ml-auto">
            <FormControlLabel
              control={<Switch />}
              label="Show all"
              labelPlacement="start"
              value={showExtended}
              onChange={(_, checked) => setShowExtended(checked)}
            />
          </FormGroup>
        </div>
        <div className={`flex-col gap-y-2 ${showExtended ? "flex" : "hidden"}`}>
          <Typography className="pl-2">
            Please make sure you know what your doing. The following options are
            not error checked.
          </Typography>
          <div className="flex flex-row gap-x-2">
            <TextField
              label="Wave Group Name"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={selectedRequest ? selectedRequest.waveGroupName : ""}
              onChange={(e) => {
                let waveGroupName = e.target.value;
                setSelectedRequest((prev) => {
                  if (!prev) return null;
                  return { ...prev, waveGroupName };
                });
              }}
            />
            <TextField
              label="Week"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={selectedRequest ? selectedRequest.week : ""}
              onChange={(e) => {
                let week = e.target.value;
                setSelectedRequest((prev) => {
                  if (!prev) return null;
                  return { ...prev, week };
                });
              }}
            />
          </div>

          <div className="flex flex-row gap-x-2">
            <TextField
              label="Source"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={selectedRequest ? selectedRequest.source : ""}
              onChange={(e) => {
                let source = e.target.value;
                setSelectedRequest((prev) => {
                  if (!prev) return null;
                  return { ...prev, source };
                });
              }}
            />
            <TextField
              label="Namespace"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={selectedRequest ? selectedRequest.namespace : ""}
              onChange={(e) => {
                let namespace = e.target.value;
                setSelectedRequest((prev) => {
                  if (!prev) return null;
                  return { ...prev, namespace };
                });
              }}
            />
            <TextField
              label="Type"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={selectedRequest ? selectedRequest.type : ""}
              onChange={(e) => {
                let type = e.target.value;
                setSelectedRequest((prev) => {
                  if (!prev) return null;
                  return { ...prev, type };
                });
              }}
            />
          </div>
          <div className="flex flex-row gap-x-2">
            <TextField
              label="Ship Option Category"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={selectedRequest ? selectedRequest.shipOptionCategory : ""}
              onChange={(e) => {
                let shipOptionCategory = e.target.value;
                setSelectedRequest((prev) => {
                  if (!prev) return null;
                  return { ...prev, shipOptionCategory };
                });
              }}
            />
            <TextField
              label="Address Type"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={selectedRequest ? selectedRequest.addressType : ""}
              onChange={(e) => {
                let addressType = e.target.value;
                setSelectedRequest((prev) => {
                  if (!prev) return null;
                  return { ...prev, addressType };
                });
              }}
            />
          </div>
          <div className="flex flex-row gap-x-2">
            <TextField
              label="Package Type"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={selectedRequest ? selectedRequest.packageType : ""}
              onChange={(e) => {
                let packageType = e.target.value;
                setSelectedRequest((prev) => {
                  if (!prev) return null;
                  return { ...prev, packageType };
                });
              }}
            />
            <TextField
              label="Volume Type"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={selectedRequest ? selectedRequest.volumeType : ""}
              onChange={(e) => {
                let volumeType = e.target.value;
                setSelectedRequest((prev) => {
                  if (!prev) return null;
                  return { ...prev, volumeType };
                });
              }}
            />
          </div>
          <div className="flex flex-row gap-x-2">
            <TextField
              label="Cluster"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={selectedRequest ? selectedRequest.cluster : ""}
              onChange={(e) => {
                let cluster = e.target.value;
                setSelectedRequest((prev) => {
                  if (!prev) return null;
                  return { ...prev, cluster };
                });
              }}
            />
            <TextField
              label="f"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={selectedRequest ? selectedRequest.f : ""}
              onChange={(e) => {
                let f = e.target.value;
                setSelectedRequest((prev) => {
                  if (!prev) return null;
                  return { ...prev, f };
                });
              }}
            />
          </div>
          <div className="flex flex-row gap-x-2">
            <TextField
              label="Fulfillment Network Type"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={
                selectedRequest ? selectedRequest.fulfillmentNetworkType : ""
              }
              onChange={(e) => {
                let fulfillmentNetworkType = e.target.value;
                setSelectedRequest((prev) => {
                  if (!prev) return null;
                  return { ...prev, fulfillmentNetworkType };
                });
              }}
            />
          </div>
        </div>

        <div className="w-96 flex flex-row gap-x-2">
          <Button variant="outlined" onClick={exportHandler}>
            Export
          </Button>
          <Button variant="outlined" onClick={exportHandler}>
            Blurb
          </Button>
          <div className="ml-auto">
            <Button variant="contained" onClick={() => {}} disabled>
              Complete Task
            </Button>
          </div>
        </div>
      </Paper>
    </DropArea>
  );
};

export default LMCP;

// TODO: Warn when dropping a file that might overwrite data
// TODO: Check for error states such as station being null/undefined for some reason
