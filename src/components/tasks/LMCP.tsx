import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  LMCPExportableData,
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
  coerceStringToInteger,
  csv2json,
  isNumeric,
  isSimLinkValid,
  isStationCodeValid,
  json2csv,
  objectHasDefinedValue,
  objectHasUndefinedValue,
  percentChange,
} from "../../Utilities";
import { format } from "date-fns";
import { save } from "@tauri-apps/api/dialog";
import { writeTextFile } from "@tauri-apps/api/fs";

type LMCPProps = {
  onCancel: (taskId: number) => void;
  onComplete: (taskId: number, data: LMCPExportableData) => void;
  taskId: number;
};

// Stores all the raw strings from the user before they are validated
type LMCPInputs = {
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
  requested: string;
  currentLmcp: string;
  currentAtrops: string;
  pdr: string;
  simLink: string;
};

const LMCPApprovalStatus = z.enum([
  "auto_approved",
  "l7_required",
  "war_room",
  "unknown",
]);
type LMCPApprovalStatus = z.infer<typeof LMCPApprovalStatus>;

const getApprovalStatusString = (status: LMCPApprovalStatus): string => {
  switch (status) {
    case LMCPApprovalStatus.enum.auto_approved:
      return "Auto-Approved";

    case LMCPApprovalStatus.enum.l7_required:
      return "L7 Required";
    case LMCPApprovalStatus.enum.war_room:
      return "War Room";
    case LMCPApprovalStatus.enum.unknown:
      return "???";
  }
};

const getApprovalStatusColor = (status: LMCPApprovalStatus) => {
  switch (status) {
    case LMCPApprovalStatus.enum.auto_approved:
      return "text-green-500";
    case LMCPApprovalStatus.enum.l7_required:
      return "text-yellow-400";
    case LMCPApprovalStatus.enum.war_room:
      return "text-red-500";
    case LMCPApprovalStatus.enum.unknown:
      return "";
  }
};

const getAdjustmentPercent = (
  requested: number,
  currentLmcp: number,
  currentAtrops: number
) => {
  // Use the higher value between LMCP and ATROPS to determine the adjustment percentage
  const highestCurrentValue = Math.max(currentLmcp, currentAtrops);

  // console.log("highest val", highestCurrentValue);

  const adjustmentPercent = (requested / highestCurrentValue - 1) * 100;
  // console.log("adjustment", adjustmentPercent);

  return adjustmentPercent;
};

const LMCP = (props: LMCPProps) => {
  const [importedRequests, setImportedRequests] = useState(
    new Map<string, LMCPInputs>()
  );

  const [currentRequest, setCurrentRequest] = useState<LMCPInputs>({
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
  });

  const [validatedData, setValidatedData] = useState<LMCPTaskData>({
    source: undefined,
    namespace: undefined,
    type: undefined,
    stationCode: undefined,
    waveGroupName: undefined,
    shipOptionCategory: undefined,
    addressType: undefined,
    packageType: undefined,
    ofdDate: undefined,
    ead: undefined,
    cluster: undefined,
    fulfillmentNetworkType: undefined,
    volumeType: undefined,
    week: undefined,
    f: undefined,
    value: undefined,
    requested: undefined,
    currentLmcp: undefined,
    currentAtrops: undefined,
    pdr: undefined,
    simLink: undefined,
  });

  const [errors, setErrors] = useState<LMCPTaskErrors>({
    stationCode: undefined,
    ofdDate: undefined,
    ead: undefined,
    requested: undefined,
    currentLmcp: undefined,
    currentAtrops: undefined,
    pdr: undefined,
    simLink: undefined,
    week: undefined,
  });

  const [showExtended, setShowExtended] = useState(false);

  const importFileHandler = (files: FileList) => {
    // TODO: Error check if wrong file is dropped
    if (files.length === 0) return;

    const inputFile = files[0];
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
            ? format(new Date(row['"OFDDate (string)"']), "yyyy-MM-dd")
            : "",
          ead: row['"EAD (string)"']
            ? format(new Date(row['"EAD (string)"']), "yyyy-MM-dd")
            : "",
          cluster: row['"Cluster (string)"'] ? row['"Cluster (string)"'] : "",
          fulfillmentNetworkType: row['"FulfillmentNetworkType (string)"']
            ? row['"FulfillmentNetworkType (string)"']
            : "",
          volumeType: row['"VolumeType (string)"']
            ? row['"VolumeType (string)"']
            : "",
          week: row['"Week (number)"'] ? row['"Week (number)"'] : "",
          f: row['"f (string)"'] ? row['"f (string)"'] : "",
          requested: row['"Value (number)"'] ? row['"Value (number)"'] : "",
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
          setCurrentRequest({
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
          });
        }

        return requests;
      });
    });

    reader.readAsText(inputFile);
  };

  const exportHandler = () => {
    // TODO: Switch this to the validated data
    if (!currentRequest) return;

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
        requested: "Value",
      })
    );

    // const data: LMCPExportableData = {
    //   source: currentRequest.source,
    //   namespace: currentRequest.namespace,
    //   type: currentRequest.type,
    //   stationCode: currentRequest.stationCode,
    //   waveGroupName: currentRequest.waveGroupName,
    //   shipOptionCategory: currentRequest.shipOptionCategory,
    //   addressType: currentRequest.addressType,
    //   packageType: currentRequest.packageType,
    //   ofdDate: currentRequest.ofdDate,
    //   ead: currentRequest.ead,
    //   cluster: currentRequest.cluster,
    //   fulfillmentNetworkType: currentRequest.fulfillmentNetworkType,
    //   volumeType: currentRequest.volumeType,
    //   week: coerceStringToInteger(currentRequest.week),
    //   f: currentRequest.f,
    //   value: coerceStringToInteger(currentRequest.value),
    // };

    if (
      objectHasDefinedValue(errors) ||
      objectHasUndefinedValue(validatedData)
    ) {
      console.error(errors);
      return;
    }

    const csvData = json2csv([validatedData], headersMapping);

    const today = format(new Date(), "yyyy-MM-dd");

    save({
      filters: [
        {
          name: "Comma Separated Values",
          extensions: ["csv"],
        },
      ],
      defaultPath: `${validatedData.stationCode} - ${today} - LMCP Adjustment.csv`,
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

  const getNewIntakeString = () => {
    if (
      validatedData.requested !== undefined &&
      validatedData.pdr !== undefined
    ) {
      return (validatedData.requested - validatedData.pdr).toString();
    } else {
      return "???";
    }
  };

  const getNewIntakePopover = () => {
    if (
      validatedData.requested !== undefined &&
      validatedData.pdr !== undefined
    ) {
      return `Requested - PDR\n${validatedData.requested} - ${validatedData.pdr}`;
    } else {
      return "";
    }
  };

  // TODO: This should take into account PDR and the larger of the two (atrops and lmcp) values
  const getApprovalStatus = (): LMCPApprovalStatus => {
    if (
      validatedData.requested === undefined ||
      validatedData.currentLmcp === undefined ||
      validatedData.currentAtrops === undefined
    ) {
      return LMCPApprovalStatus.enum.unknown;
    }

    const percent = getAdjustmentPercent(
      validatedData.requested,
      validatedData.currentLmcp,
      validatedData.currentAtrops
    );

    if (percent <= 5) {
      return LMCPApprovalStatus.enum.auto_approved;
    } else if (percent > 5 && percent <= 10) {
      return LMCPApprovalStatus.enum.l7_required;
    } else {
      return LMCPApprovalStatus.enum.war_room;
    }
  };

  const getApprovalStatusPopover = () => {};

  const getDeltaString = (): string => {
    if (
      validatedData.requested === undefined ||
      validatedData.currentLmcp === undefined ||
      validatedData.currentAtrops === undefined
    ) {
      return "???";
    }

    const percent = getAdjustmentPercent(
      validatedData.requested,
      validatedData.currentLmcp,
      validatedData.currentAtrops
    );

    if (percent > 100) {
      return "> 100%";
    } else if (percent < -100) {
      return "< -100%";
    } else {
      return `${percent.toFixed(2)}%`;
    }
  };

  const getLargerSourceString = (): string => {
    if (
      validatedData.currentLmcp === undefined ||
      validatedData.currentAtrops === undefined
    ) {
      return "???";
    }

    if (validatedData.currentLmcp > validatedData.currentAtrops) {
      return "LMCP";
    } else {
      return "ATROPS";
    }
  };

  const getApprovalBlurb = () => {
    const blurb = `
${validatedData.simLink}
Site: ${validatedData.stationCode}
Requesting: ${validatedData.requested}
LMCP: ${validatedData.currentLmcp}
Atrops: ${validatedData.currentAtrops}
Reason: <Insert reason>
    `;
    console.log(blurb);
  };

  // Only error-checking important properties. All other properties can be set
  // to any value that the user wants to override them to
  const validateInputData = () => {
    const errors: LMCPTaskErrors = {
      stationCode: undefined,
      ofdDate: undefined,
      ead: undefined,
      requested: undefined,
      currentLmcp: undefined,
      currentAtrops: undefined,
      pdr: undefined,
      simLink: undefined,
      week: undefined,
    };

    const validated: LMCPTaskData = {
      stationCode: undefined,
      ofdDate: undefined,
      ead: undefined,
      requested: undefined,
      currentLmcp: undefined,
      currentAtrops: undefined,
      pdr: undefined,
      simLink: undefined,
      week: undefined,
      value: undefined,
      source: currentRequest.source,
      namespace: currentRequest.namespace,
      type: currentRequest.type,
      waveGroupName: currentRequest.waveGroupName,
      shipOptionCategory: currentRequest.shipOptionCategory,
      addressType: currentRequest.addressType,
      packageType: currentRequest.packageType,
      cluster: currentRequest.cluster,
      fulfillmentNetworkType: currentRequest.fulfillmentNetworkType,
      volumeType: currentRequest.volumeType,
      f: currentRequest.f,
    };

    // Validate stationCode
    if (currentRequest.stationCode === "") {
      errors.stationCode = "Station Code cannot be empty.";
    } else if (!isStationCodeValid(currentRequest.stationCode)) {
      errors.stationCode = "Station Code is invalid.";
    } else {
      validated.stationCode = currentRequest.stationCode;
    }

    // Validate ofdDate
    if (Number.isNaN(Date.parse(currentRequest.ofdDate))) {
      errors.ofdDate = "OFD Date is invalid";
    } else {
      validated.ofdDate = currentRequest.ofdDate;
    }

    // Validate ead
    if (Number.isNaN(Date.parse(currentRequest.ead))) {
      errors.ead = "EAD Date is invalid";
    } else {
      validated.ead = currentRequest.ead;
    }

    // Validate requested
    if (currentRequest.requested === "") {
      errors.requested = "Requested cannot be empty.";
    } else if (!isNumeric(currentRequest.requested)) {
      errors.requested = "Requested must be a number.";
    } else if (parseInt(currentRequest.requested) < 0) {
      errors.requested = "Requested must be a positive number.";
    } else {
      validated.requested = parseInt(currentRequest.requested);
    }

    // Validate currentLmcp
    if (currentRequest.currentLmcp === "") {
      errors.currentLmcp = "Current LMCP cannot be empty.";
    } else if (!isNumeric(currentRequest.currentLmcp)) {
      errors.currentLmcp = "Current LMCP must be a number.";
    } else if (parseInt(currentRequest.currentLmcp) < 0) {
      errors.currentLmcp = "Current LMCP must be a positive number.";
    } else {
      validated.currentLmcp = parseInt(currentRequest.currentLmcp);
    }

    // Validate currentAtrops
    if (currentRequest.currentAtrops === "") {
      errors.currentAtrops = "Current ATROPS cannot be empty.";
    } else if (!isNumeric(currentRequest.currentAtrops)) {
      errors.currentAtrops = "Current ATROPS must be a number.";
    } else if (parseInt(currentRequest.currentAtrops) < 0) {
      errors.currentAtrops = "Current ATROPS must be a positive number.";
    } else {
      validated.currentAtrops = parseInt(currentRequest.currentAtrops);
    }

    // Validate pdr
    if (currentRequest.pdr === "") {
      validated.pdr = 0;
    } else if (!isNumeric(currentRequest.pdr)) {
      errors.pdr = "PDR must be a number.";
    } else if (parseInt(currentRequest.pdr) < 0) {
      errors.pdr = "PDR must be a positive number.";
    } else {
      validated.pdr = parseInt(currentRequest.pdr);
    }

    // Validate simLink
    if (currentRequest.simLink === "") {
      errors.simLink = "SIM link cannot be empty.";
    } else if (!isSimLinkValid(currentRequest.simLink)) {
      errors.simLink = "SIM Link is invalid.";
    } else {
      validated.simLink = currentRequest.simLink;
    }

    // Validate week
    if (currentRequest.week === "") {
      errors.week = "Week cannot be empty.";
    } else if (!isNumeric(currentRequest.week)) {
      errors.week = "Week must be a number.";
    } else if (parseInt(currentRequest.week) < 0) {
      errors.week = "Week must be a positive number.";
    } else {
      validated.week = parseInt(currentRequest.week);
    }

    if (validated.requested && validated.pdr) {
      validated.value = validated.requested - validated.pdr;
    }

    setValidatedData(validated);
    setErrors(errors);
  };

  // Automatically validates the inputs when any of their values change
  useEffect(validateInputData, [currentRequest]);

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
                autoComplete: "new-password", // disable autocomplete and autofill
              }}
            />
          )}
          onChange={(_, stationCode) => {
            if (!stationCode) return;

            const temp = importedRequests.get(stationCode);
            let nextRequest: LMCPInputs;

            if (temp) {
              nextRequest = temp;
            } else {
              nextRequest = {
                source: stationCode,
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
            }
            setCurrentRequest(() => {
              // Update import map
              if (currentRequest) {
                const copyOfImported = importedRequests;
                copyOfImported.set(currentRequest.stationCode, currentRequest);

                setImportedRequests(copyOfImported);
              }
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

              const ofdDate = currentRequest.ofdDate;

              const date = new Date(ofdDate);
              const timezoneAdjustedDate = new Date(
                date.getTime() + date.getTimezoneOffset() * 60000
              );
              return timezoneAdjustedDate;
            })()}
            onChange={(newOfdDate) => {
              if (!currentRequest || !newOfdDate) return;

              const formattedDate = format(newOfdDate, "yyyy-MM-dd");
              setCurrentRequest((prevSelected) => {
                return { ...prevSelected, ofdDate: formattedDate };
              });
            }}
          />
          <DatePicker
            label="EAD Date"
            value={(() => {
              // Keeps the datepicker from throwing an error
              if (currentRequest.ofdDate === "") return null;

              const eadDate = currentRequest.ead;

              const date = new Date(eadDate);
              const timezoneAdjustedDate = new Date(
                date.getTime() + date.getTimezoneOffset() * 60000
              );
              return timezoneAdjustedDate;
            })()}
            onChange={(newOfdDate) => {
              if (!currentRequest || !newOfdDate) return;

              const formattedDate = format(newOfdDate, "yyyy-MM-dd");

              setCurrentRequest((prevSelected) => {
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
            value={currentRequest.currentLmcp}
            onChange={(e) => {
              const current = e.target.value;

              setCurrentRequest((prevSelected) => {
                const updatedSelected = {
                  ...prevSelected,
                  currentLmcp: current,
                };

                return updatedSelected;
              });
            }}
          />
          <TextField
            label="Current ATROPS"
            autoComplete="aaaaa"
            aria-autocomplete="none"
            className="w-full"
            value={currentRequest.currentAtrops}
            onChange={(e) => {
              const atrops = e.target.value;

              setCurrentRequest((prevSelected) => {
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
            value={currentRequest.pdr}
            onChange={(e) => {
              const pdr = e.target.value;

              setCurrentRequest((prevSelected) => {
                return { ...prevSelected, pdr: pdr };
              });
            }}
          />

          <TextField
            label="Requested Value"
            autoComplete="aaaaa"
            aria-autocomplete="none"
            className="w-full"
            value={currentRequest.requested}
            onChange={(e) => {
              const requested = e.target.value;

              setCurrentRequest((prevSelected) => {
                return { ...prevSelected, requested: requested };
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
            value={currentRequest.simLink}
            onChange={(e) => {
              const simLink = e.target.value;

              setCurrentRequest((prevSelected) => {
                return { ...prevSelected, simLink: simLink };
              });
            }}
            helperText={currentRequest.simLink ? errors.simLink : ""}
            error={
              currentRequest.simLink && errors.simLink !== undefined
                ? true
                : false
            }
          />
        </div>
        <div>
          {/* TODO: Break this section out into it's own component */}
          <Typography align="center">{`New LMCP: ${getNewIntakeString()}`}</Typography>
          <div className="grid grid-cols-3">
            <Typography
              className={`${getApprovalStatusColor(getApprovalStatus())}`}
              align="center"
            >{`Status: ${getApprovalStatusString(
              getApprovalStatus()
            )}`}</Typography>
            <Typography align="center">{`Delta: ${getDeltaString()}`}</Typography>
            <Typography align="center">{`Using: ${getLargerSourceString()}`}</Typography>
          </div>
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
              value={currentRequest.waveGroupName}
              onChange={(e) => {
                let waveGroupName = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, waveGroupName };
                });
              }}
            />
            <TextField
              label="Week"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.week}
              onChange={(e) => {
                let week = e.target.value;
                setCurrentRequest((prev) => {
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
              value={currentRequest.source}
              onChange={(e) => {
                let source = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, source };
                });
              }}
            />
            <TextField
              label="Namespace"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.namespace}
              onChange={(e) => {
                let namespace = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, namespace };
                });
              }}
            />
            <TextField
              label="Type"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.type}
              onChange={(e) => {
                let type = e.target.value;
                setCurrentRequest((prev) => {
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
              value={currentRequest.shipOptionCategory}
              onChange={(e) => {
                let shipOptionCategory = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, shipOptionCategory };
                });
              }}
            />
            <TextField
              label="Address Type"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.addressType}
              onChange={(e) => {
                let addressType = e.target.value;
                setCurrentRequest((prev) => {
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
              value={currentRequest.packageType}
              onChange={(e) => {
                let packageType = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, packageType };
                });
              }}
            />
            <TextField
              label="Volume Type"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.volumeType}
              onChange={(e) => {
                let volumeType = e.target.value;
                setCurrentRequest((prev) => {
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
              value={currentRequest.cluster}
              onChange={(e) => {
                let cluster = e.target.value;
                setCurrentRequest((prev) => {
                  return { ...prev, cluster };
                });
              }}
            />
            <TextField
              label="f"
              autoComplete="aaaaa"
              aria-autocomplete="none"
              className="w-full"
              value={currentRequest.f}
              onChange={(e) => {
                let f = e.target.value;
                setCurrentRequest((prev) => {
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
              value={currentRequest.fulfillmentNetworkType}
              onChange={(e) => {
                let fulfillmentNetworkType = e.target.value;
                setCurrentRequest((prev) => {
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
          <Button
            variant="outlined"
            onClick={getApprovalBlurb}
            disabled={
              getApprovalStatus() !== LMCPApprovalStatus.enum.war_room ||
              getApprovalStatus() !== LMCPApprovalStatus.enum.war_room
            }
          >
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
