import React, { useState } from "react";
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
import { isNumeric } from "../../Utilities";

type SameDayProps = {
  onClose: (taskId: number) => void;
  taskId: number;
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

  const [focused, setFocused] = useState({
    stationCode: false,
    percent: false,
    dpoLink: false,
    routeCount: false,
    tbaCount: false,
  });

  const [errors, setErrors] = useState({
    stationCode: "",
    percent: "",
    dpoLink: "",
    routeCount: "",
    tbaCount: "",
  });

  const isDpoLinkValid = (link: string) => {
    if (
      link.match(
        /https:\/\/na.dispatch.planning.last-mile.a2z.com\/dispatch-planning\/[A-Z]{3}[1-9]{1}\/.+/g
      ) === null
    ) {
      return false;
    }

    // BUG: Date in DPO link could be incorrect

    // Return true if station code is blank to avoid confusion. User will not be able to proceed in this state anyways.
    if (data.stationCode.length === 0) {
      return true;
    }

    if (!link.includes(data.stationCode)) {
      return false;
    }
    return true;
  };

  return (
    <Paper className={"h-fit w-fit px-2 py-2 flex flex-col gap-y-2 relative"}>
      <div className="absolute w-fit right-[-20px] top-[-20px] z-[9]">
        <IconButton
          aria-label="delete"
          onClick={() => {
            props.onClose(props.taskId);
          }}
        >
          <CancelIcon />
        </IconButton>
      </div>

      <Typography align="center">Same Day</Typography>
      <TextField
        label="Station Code"
        value={data.stationCode}
        onChange={(e) => {
          let code = e.target.value.toUpperCase();

          setErrors((prev) => {
            let error = "";

            if (code.match(/^[A-Z]{3}[1-9]{1}$/) === null) {
              error = "Station Code is invalid.";
            }

            if (code === "") {
              error = "Station Code is empty.";
            }

            return { ...prev, stationCode: error };
          });

          setData((prev) => {
            return { ...prev, stationCode: code };
          });
        }}
        color={(() => {
          if (focused.stationCode && data.stationCode.length === 0) {
            return "primary";
          } else if (errors.stationCode) {
            return "error";
          } else {
            return "success";
          }
        })()}
        focused={focused.stationCode || data.stationCode.length != 0}
        onFocus={() =>
          setFocused((prev) => {
            return { ...prev, stationCode: true };
          })
        }
        onBlur={() => {
          setFocused((prev) => {
            return { ...prev, stationCode: false };
          });
        }}
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
        className="w-fit ml-2"
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
        onChange={(e) => {
          let percent = e.target.value;

          setErrors((prev) => {
            let error = "";

            if (!isNumeric(percent)) {
              error = "Buffer percentage must be a number.";
            } else if (parseInt(percent) < 0) {
              error = "Buffer percentage must be a positive number.";
            }

            return { ...prev, percent: error };
          });

          setData((prev) => {
            return { ...prev, percent: percent };
          });
        }}
        color={(() => {
          if (focused.percent && data.percent.length === 0) {
            return "primary";
          } else if (errors.percent) {
            return "error";
          } else {
            return "success";
          }
        })()}
        focused={focused.percent || data.percent.length != 0}
        onFocus={() =>
          setFocused((prev) => {
            return { ...prev, percent: true };
          })
        }
        onBlur={() => {
          setFocused((prev) => {
            return { ...prev, percent: false };
          });
        }}
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
        onChange={(e) => {
          let link = e.target.value;

          setErrors((prev) => {
            let error = "";

            if (!isDpoLinkValid(link)) {
              error = "DPO Link is invalid";
            }

            return { ...prev, dpoLink: error };
          });

          setData((prev) => {
            return { ...prev, dpoLink: link };
          });
        }}
        color={(() => {
          if (focused.dpoLink && data.dpoLink.length === 0) {
            return "primary";
          } else if (errors.dpoLink) {
            return "error";
          } else {
            return "success";
          }
        })()}
        focused={focused.dpoLink || data.dpoLink.length != 0}
        onFocus={() =>
          setFocused((prev) => {
            return { ...prev, dpoLink: true };
          })
        }
        onBlur={() => {
          setFocused((prev) => {
            return { ...prev, dpoLink: false };
          });
        }}
        autoComplete="aaaaa"
        aria-autocomplete="none"
        className="w-96"
      ></TextField>
      <div>
        <TextField
          label="TBAs routed"
          value={data.tbaCount}
          onChange={(e) => {
            let numOfTBAs = e.target.value;

            setErrors((prev) => {
              let error = "";

              if (!isNumeric(numOfTBAs)) {
                error = "TBAs routed must be a number.";
              } else if (parseInt(numOfTBAs) < 0) {
                error = "TBAs routed cannot be negative.";
              }

              return { ...prev, tbaCount: error };
            });

            setData((prev) => {
              return { ...prev, tbaCount: numOfTBAs };
            });
          }}
          color={(() => {
            if (focused.tbaCount && data.tbaCount.length === 0) {
              return "primary";
            } else if (errors.tbaCount) {
              return "error";
            } else {
              return "success";
            }
          })()}
          focused={focused.tbaCount || data.tbaCount.length != 0}
          onFocus={() =>
            setFocused((prev) => {
              return { ...prev, tbaCount: true };
            })
          }
          onBlur={() => {
            setFocused((prev) => {
              return { ...prev, tbaCount: false };
            });
          }}
          autoComplete="aaaaa"
          aria-autocomplete="none"
          className="w-48"
        ></TextField>
        <TextField
          label="# of generated routes"
          value={data.routeCount}
          onChange={(e) => {
            let NumOfRoutes = e.target.value;

            setErrors((prev) => {
              let error = "";

              if (!isNumeric(NumOfRoutes)) {
                error = "Number of routes must be a number.";
              } else if (parseInt(NumOfRoutes) < 0) {
                error = "Number of routes cannot be negative.";
              }

              return { ...prev, routeCount: error };
            });

            setData((prev) => {
              return { ...prev, routeCount: NumOfRoutes };
            });
          }}
          color={(() => {
            if (focused.routeCount && data.routeCount.length === 0) {
              return "primary";
            } else if (errors.routeCount) {
              return "error";
            } else {
              return "success";
            }
          })()}
          focused={focused.routeCount || data.routeCount.length != 0}
          onFocus={() =>
            setFocused((prev) => {
              return { ...prev, routeCount: true };
            })
          }
          onBlur={() => {
            setFocused((prev) => {
              return { ...prev, routeCount: false };
            });
          }}
          autoComplete="aaaaa"
          aria-autocomplete="none"
          className="w-48"
        ></TextField>
      </div>
      <Typography>
        {"Total routes: " +
          (isNumeric(data.routeCount) && isNumeric(data.percent)
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
            data.routingType === "" || // No empty data
            Object.entries(errors).find(([_, val]) => val !== "") !== undefined // No errors
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
    </Paper>
  );
};

export default SameDay;

// FEATURE: Autocomplete station code
// FEATURE: Easily add stations to autocomplete
// FEATURE: Adjust percentage with scrollbar
// FEATURE: Copy DPO link
// FEATURE: Toast shown for every copy

// FEATURE: Drop submitted files to easily copy tbas and check # of tbas
