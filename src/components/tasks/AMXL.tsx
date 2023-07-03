import React, { useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

type AMXLData = {
  stationCode: string;
  startTime: string | dayjs.Dayjs;
  endTime: string | dayjs.Dayjs;
  exclusion: boolean;
  planned: number;
  spr: number;
  lmcp: number;
  reductions: number;
  aa: boolean;
  rtwLink: string;
  adhocLink: string;
};

const AMXL = () => {
  const [data, setData] = useState<AMXLData>({
    stationCode: "",
    startTime: "",
    endTime: "",
    exclusion: false,
    planned: -1,
    spr: -1,
    lmcp: -1,
    reductions: -1,
    aa: false,
    rtwLink: "",
    adhocLink: "",
  });

  return (
    <div
      className={
        "border-2 border-solid border-green-500 h-full w-full px-2 py-2 flex flex-col gap-y-2"
      }
    >
      <TextField
        label="Station Code"
        value={data.stationCode}
        onChange={(e) => setData({ ...data, stationCode: e.target.value })}
        autoComplete="aaaaa"
        aria-autocomplete="none"
        className="w-96"
      />

      <div>
        <TimePicker
          className="w-36 scrollbar-none"
          timeSteps={{ hours: 1, minutes: 1 }}
          closeOnSelect
          label={"Start Time"}
          onChange={(value) => {
            if (!value) return;

            setData((prev) => {
              return { ...prev, startTime: value };
            });
          }}
          value={data.startTime}
        />
        <Button
          onClick={() => {
            setData((prev) => {
              return { ...prev, startTime: dayjs() };
            });
          }}
        >
          Now
        </Button>
        <TimePicker
          className="w-36 scrollbar-none"
          timeSteps={{ hours: 1, minutes: 1 }}
          closeOnSelect
          label={"End Time"}
          onChange={(value) => {
            if (!value) return;

            setData((prev) => {
              return { ...prev, endTime: value };
            });
          }}
          value={data.endTime}
        />
        <Button
          onClick={() => {
            setData((prev) => {
              return { ...prev, endTime: dayjs() };
            });
          }}
        >
          Now
        </Button>
      </div>
      <FormGroup className="w-fit">
        <FormControlLabel
          label={"Exclusion file present?"}
          control={<Checkbox />}
        />
      </FormGroup>

      <div>
        <TextField
          label="Planned"
          value={data.stationCode}
          onChange={(e) => setData({ ...data, stationCode: e.target.value })}
          error={data.stationCode === ""}
          autoComplete="aaaaa"
          aria-autocomplete="none"
          className="w-40"
        />
        <TextField
          label="SPR"
          value={data.stationCode}
          onChange={(e) => setData({ ...data, stationCode: e.target.value })}
          error={data.stationCode === ""}
          autoComplete="aaaaa"
          aria-autocomplete="none"
          className="w-40"
        />
      </div>
      <div>
        <TextField
          label="LMCP Value"
          value={data.stationCode}
          onChange={(e) => setData({ ...data, stationCode: e.target.value })}
          error={data.stationCode === ""}
          autoComplete="aaaaa"
          aria-autocomplete="none"
          className="w-40"
        />
        <TextField
          label="Reductions"
          value={data.stationCode}
          onChange={(e) => setData({ ...data, stationCode: e.target.value })}
          error={data.stationCode === ""}
          autoComplete="aaaaa"
          aria-autocomplete="none"
          className="w-40"
        />
      </div>

      <FormGroup>
        <FormControlLabel label={"AA Ran?"} control={<Checkbox />} />
      </FormGroup>

      <TextField
        label="RTW Link"
        value={data.stationCode}
        onChange={(e) => setData({ ...data, stationCode: e.target.value })}
        error={data.stationCode === ""}
        autoComplete="aaaaa"
        aria-autocomplete="none"
        className="w-96"
      />
      <TextField
        label="Adhoc Link"
        value={data.stationCode}
        onChange={(e) => setData({ ...data, stationCode: e.target.value })}
        error={data.stationCode === ""}
        autoComplete="aaaaa"
        aria-autocomplete="none"
        className="w-96"
      />
    </div>
  );
};

export default AMXL;
