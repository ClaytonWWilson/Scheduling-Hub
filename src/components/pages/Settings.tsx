import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React, { useState } from "react";

type SettingsProps = {
  visible: boolean;
};

type SettingsState = {
  theme: Themes;
};

enum Themes {
  light,
  dark,
}

const Settings = (props: SettingsProps) => {
  const [settings, setSettings] = useState<SettingsState>({
    theme: Themes.light,
  });
  return (
    <div
      className={`border-2 border-solid border-green-500 h-full w-full px-2 py-2 flex flex-col ${
        !props.visible ? "hidden" : ""
      }`}
    >
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Age</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={settings.theme}
          label="Age"
          onChange={(e) => {
            const chosenTheme = e.target.value;
            if (chosenTheme! in Themes || typeof chosenTheme === "string") {
              return;
            }

            setSettings((prevSettings) => {
              return { ...prevSettings, theme: chosenTheme };
            });
          }}
        >
          <MenuItem value={Themes.dark}>Dark</MenuItem>
          <MenuItem value={Themes.light}>Light</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default Settings;
