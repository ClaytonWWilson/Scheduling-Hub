import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React, { useState } from "react";
import { AppSettings, Themes } from "../../types/Settings";

type SettingsProps = {
  visible: boolean;
  settings: AppSettings;
  onSettingsChanged: (settings: AppSettings) => void;
};

const Settings = (props: SettingsProps) => {
  const [settings, setSettings] = useState(props.settings);

  return (
    <div
      className={`border-2 border-solid border-green-500 h-full w-full px-2 py-2 flex flex-col ${
        !props.visible ? "hidden" : ""
      }`}
    >
      <FormControl className="w-32">
        <InputLabel>Theme</InputLabel>
        <Select
          value={settings.theme}
          label="Theme"
          onChange={(e) => {
            const chosenTheme = e.target.value as Themes;

            setSettings((prevSettings) => {
              const newSettings = { ...prevSettings, theme: chosenTheme };
              props.onSettingsChanged(newSettings);
              return newSettings;
            });
          }}
        >
          <MenuItem value={Themes.darkred}>Dark Red</MenuItem>
          <MenuItem value={Themes.lightred}>Light Red</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default Settings;
