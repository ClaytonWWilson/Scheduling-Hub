import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React, { useState } from "react";
import { AppTheme, AppSettingsType } from "../../types/Settings";
import App from "../../App";

type SettingsProps = {
  visible: boolean;
  settings: AppSettingsType;
  onSettingsChanged: (settings: AppSettingsType) => void;
};

const Settings = (props: SettingsProps) => {
  const [settings, setSettings] = useState(props.settings);

  return (
    <div
      className={`h-full w-full px-2 py-2 flex flex-col ${
        !props.visible ? "hidden" : ""
      }`}
    >
      <FormControl className="w-32">
        <InputLabel>Theme</InputLabel>
        <Select
          value={settings.theme}
          label="Theme"
          onChange={(e) => {
            const newTheme = e.target.value as AppTheme;

            setSettings((prevSettings) => {
              const newSettings = { ...prevSettings, theme: newTheme };
              props.onSettingsChanged(newSettings);
              return newSettings;
            });
          }}
        >
          <MenuItem value={AppTheme.enum.DARKRED}>Dark Red</MenuItem>
          <MenuItem value={AppTheme.enum.LIGHTRED}>Light Red</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default Settings;

// PROPOSAL: In-app changelog?
// PROPOSAL: Add options to change what is copied for the audits
