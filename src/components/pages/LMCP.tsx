import React, { useRef, useState } from "react";
import { Button, Dialog, Pane } from "evergreen-ui";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FileUploader from "../FileUploader";
// import csv2jsonparser from "csv-parser";
// import { parse } from "csv-parse";
import { Parser as json2csvparser } from "@json2csv/plainjs";
// import { fs } from "@tauri-apps/api";
import { csv2json } from "../../Utilities";

type FileWithPath = {
  lastModified: number;
  lastModifiedDate?: Date;
  name: string;
  path?: string;
  size: number;
  type: string;
  webkitRelativePath: string;
};

type LmcpDataSimExport = {
  "Source (string)": string;
  "Namespace (string)": string;
  "Type (string)": string;
  "StationCode (string)": string;
  "WaveGroupName (string)": string;
  "ShipOptionCategory (string)": string;
  "AddressType (string)": string;
  "PackageType (string)": string;
  "OFDDate (string)": string;
  "EAD (string)": string;
  "Cluster (string)": string;
  "FulfillmentNetworkType (string)": string;
  "VolumeType (string)": string;
  "Week (number)": string;
  "f (string)": string;
  "Value (number)": string;
};

type LmcpDataUploadable = {
  Source: string;
  Namespace: string;
  Type: string;
  StationCode: string;
  WaveGroupName: string;
  ShipOptionCategory: string;
  AddressType: string;
  PackageType: string;
  OFDDate: string;
  EAD: string;
  Cluster: string;
  FulfillmentNetworkType: string;
  VolumeType: string;
  Week: string;
  f: string;
  Value: string;
};

type LMCPProps = {
  visible: boolean;
};

let csv: LmcpDataSimExport[] = [];
let stationChoices: string[] = [];

const LMCP = (props: LMCPProps) => {
  const [stationPickerVisible, setStationPickerVisible] = useState(false);
  const [ofdDate, setOfdDate] = useState<any>();
  const inputRef = useRef(null);

  const generateCSV = (simData: LmcpDataUploadable) => {
    const parser = new json2csvparser();
    const csvData = parser.parse(simData).replace(/\"/g, "");
    return csvData;
  };

  const formatLmcpData = (data: LmcpDataSimExport): LmcpDataUploadable => {
    let formatted: LmcpDataUploadable = {} as LmcpDataUploadable;

    formatted.Source = data["Source (string)"];
    formatted.Namespace = data["Namespace (string)"];
    formatted.Type = data["Type (string)"];
    formatted.StationCode = data["StationCode (string)"];
    formatted.WaveGroupName = data["WaveGroupName (string)"];
    formatted.ShipOptionCategory = "";
    formatted.AddressType = "";
    formatted.PackageType = "";
    formatted.OFDDate = ofdDate.format("YYYY-MM-DD");
    formatted.EAD = ofdDate.format("YYYY-MM-DD");
    formatted.Cluster = "";
    formatted.FulfillmentNetworkType = "";
    formatted.VolumeType = data["VolumeType (string)"];
    formatted.Week = data["Week (number)"];
    formatted.f = "";
    formatted.Value = data["Value (number)"];

    return formatted;
  };

  const fileDropped = (files: FileList) => {
    if (files === undefined || files.length == 0) {
      console.error("Unable to get dropped file.");
      return;
    }

    const inputFile = files[0];
    const reader = new FileReader();

    reader.addEventListener("load", (e) => {
      if (!e.target || !e.target.result) return;

      console.log(csv2json(e.target.result as string, { headers: true }));
    });

    reader.readAsText(inputFile);

    // if (inputFile.path === undefined) {
    //   console.error("The file path is undefined");
    //   return;
    // }

    // csv = [];
    // fs.readTextFile(inputFile.path).then((contents) => {
    //   console.log(contents);
    // });
    // fs.createReadStream(inputFile.path)
    // .pipe(parse({ delimiter: ",", from_line: 0 }))
    // .on("data", function (row) {
    //   console.log(row);
    //   csv.push(row);
    // })
    // .on("error", function (error) {
    //   console.log(error.message);
    // })
    // .on("end", function () {
    //   console.log("finished");
    // });

    // fs.createReadStream(inputFile.path)
    //   .pipe(csv2jsonparser())
    //   .on("data", (data) => {
    //     csv.push(data);
    //   })
    //   .on("end", () => {
    //     if (csv.length > 0) {
    //       stationChoices = [];
    //       csv.forEach((station) => {
    //         stationChoices.push(station["StationCode (string)"]);
    //       });
    //       setStationPickerVisible(true);
    //     }
    //   });
    // TODO: Set error state if invalid csv is dropped
  };

  return (
    <div
      className={`border-2 border-solid border-green-500 h-full w-full px-2 py-2 flex flex-col gap-y-1 ${
        !props.visible ? "hidden" : ""
      }`}
    >
      <Pane>
        <Dialog
          isShown={stationPickerVisible}
          title="Select Station"
          hasFooter={false}
          onCloseComplete={() => setStationPickerVisible(false)}
        >
          {/* {({ close }) => ( */}
          <Pane style={{ height: "400px !important" }}>
            {/* <Paragraph>Manage your own buttons and close interaction</Paragraph> */}
            {csv.map((station, index) => {
              return (
                <Button
                  key={index}
                  marginTop={16}
                  ref={inputRef}
                  onClick={() => {
                    let formattedStation = formatLmcpData(station);

                    let uploadableCSV = generateCSV(formattedStation);

                    const element = document.createElement("a");
                    const file = new Blob([uploadableCSV], {
                      type: "text/plain",
                    });
                    element.href = URL.createObjectURL(file);
                    element.download = `${station["StationCode (string)"]} - LMCP Adjustment.csv`;
                    element.click();

                    setStationPickerVisible(false);

                    // close();
                  }}
                >
                  {station["StationCode (string)"]}
                </Button>
              );
            })}
          </Pane>
          {/* )} */}
        </Dialog>
      </Pane>

      {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker onChange={(date) => setOfdDate(date)} />
      </LocalizationProvider> */}

      {/* <FileUploader
        browseOrDragText={() => {
          return "Drop documentSearch csv file here";
        }}
        maxFiles={1}
        onAccepted={fileDropped}
        onDrop={() => console.log("dropped")}
      /> */}
      <FileUploader onAccepted={fileDropped} />
    </div>
  );
};

export default LMCP;
