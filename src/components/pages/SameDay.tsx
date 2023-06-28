import React, { useState } from "react";
import {
  Autocomplete,
  Button,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";

type SameDayProps = {
  visible: boolean;
};

const SameDay = (props: SameDayProps) => {
  const [data, setData] = useState({
    stationCode: "",
    routingType: "",
    dpoLink: "",
    percent: "",
    routeCount: "",
    tbaCount: "",
  });

  return (
    <div
      className={`border-2 border-solid border-green-500 h-full w-full px-2 py-2 flex flex-col gap-y-2 ${
        !props.visible ? "hidden" : ""
      }`}
    >
      <TextField
        label="Station Code"
        value={data.stationCode}
        onChange={(e) => setData({ ...data, stationCode: e.target.value })}
        error={data.stationCode === ""}
        autoComplete="aaaaa"
        aria-autocomplete="none"
        className="w-96"
      ></TextField>
      {/* <Autocomplete
        // disablePortal
        options={["DBO7", "DAU5", "DBM3"]}
        renderInput={(params) => <TextField {...params} label="Station Code" />}

        className="w-96"
      /> */}
      <Typography>Same Day Type:</Typography>
      <RadioGroup
        value={data.routingType}
        onChange={(e) => setData({ ...data, routingType: e.target.value })}
        className="w-fit"
      >
        <FormControlLabel
          value="sunrise"
          control={<Radio />}
          label="Same Day Sunrise"
          required
        />
        <FormControlLabel
          value="am"
          control={<Radio />}
          label="Same Day AM"
          required
        />
      </RadioGroup>

      <TextField
        label="Buffer Percentage"
        value={data.percent}
        onChange={(e) => setData({ ...data, percent: e.target.value })}
        error={data.percent === ""}
        autoComplete="aaaaa"
        aria-autocomplete="none"
        className="w-96"
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
        }}
      ></TextField>
      <TextField
        label="DPO Link"
        value={data.dpoLink}
        onChange={(e) => setData({ ...data, dpoLink: e.target.value })}
        error={data.dpoLink === ""}
        autoComplete="aaaaa"
        aria-autocomplete="none"
        className="w-96"
      ></TextField>
      <TextField
        label="TBAs routed"
        value={data.tbaCount}
        onChange={(e) => setData({ ...data, tbaCount: e.target.value })}
        error={data.tbaCount === ""}
        autoComplete="aaaaa"
        aria-autocomplete="none"
        className="w-96"
      ></TextField>
      <TextField
        label="# of generated routes"
        value={data.routeCount}
        onChange={(e) => setData({ ...data, routeCount: e.target.value })}
        error={data.routeCount === ""}
        autoComplete="aaaaa"
        aria-autocomplete="none"
        className="w-96"
      ></TextField>
      <Typography>
        {"Total routes: " +
          (data.routeCount && data.percent
            ? Math.ceil(
                parseInt(data.routeCount) * (1 + parseInt(data.percent) / 100)
              )
            : "???")}
      </Typography>

      <div className="w-96">
        <Button
          onClick={() => {
            const totalRoutes = Math.ceil(
              parseInt(data.routeCount) * (1 + parseInt(data.percent) / 100)
            );
            navigator.clipboard.writeText(
              `${data.stationCode} ${
                data.routingType == "sunrise"
                  ? "SAME_DAY_SUNRISE"
                  : "SAME_DAY_AM"
              }: ${totalRoutes} total flex routes (${data.routeCount} + ${
                totalRoutes - parseInt(data.routeCount)
              } buffer)`
            );
          }}
          disabled={
            Object.entries(data).find(([_, val]) => val === "") !== undefined
          }
        >
          Copy Audit
        </Button>
        <Button
          onClick={() => {
            const totalRoutes = Math.ceil(
              parseInt(data.routeCount) * (1 + parseInt(data.percent) / 100)
            );
            navigator.clipboard.writeText(
              `${
                data.routingType == "sunrise"
                  ? "Same Day Sunrise"
                  : "Same Day AM"
              } routing complete: ${
                data.tbaCount
              } TBAs routed. ${totalRoutes} total flex routes (${
                data.routeCount
              } + ${
                totalRoutes - parseInt(data.routeCount)
              } buffer)\nDPO Link: ${data.dpoLink}`
            );
          }}
          disabled={
            Object.entries(data).find(([_, val]) => val === "") !== undefined
          }
        >
          Copy Station
        </Button>
        <Button
          onClick={() =>
            setData({
              stationCode: "",
              routingType: "",
              dpoLink: "",
              percent: "",
              routeCount: "",
              tbaCount: "",
            })
          }
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default SameDay;

// FEATURE: Autocomplete station code
// FEATURE: Easily add stations to autocomplete
// FEATURE: Make Layout nicer
// FEATURE: Adjust percentage with scrollbar
// FEATURE: Copy DPO link
// FEATURE: Toast shown for every copy
// FEATURE: Input validation on every textfield

// FEATURE: Drop submitted files to easily copy tbas and check # of tbas
