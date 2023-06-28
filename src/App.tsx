import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import CollapsableSidebar from "./components/CollapsableSidebar";
import SameDay from "./components/pages/SameDay";
import LMCP from "./components/pages/LMCP";
import Settings from "./components/pages/Settings";
import { AppSettings, Themes } from "./types/Settings";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { muiLightRedTheme, muiDarkRedTheme } from "./Themes";

const defaultAppSettings: AppSettings = {
  theme: Themes.darkred,
};

const getMuiTheme = (appTheme: Themes) => {
  switch (appTheme) {
    case Themes.darkred:
      return muiDarkRedTheme;
    case Themes.lightred:
      return muiLightRedTheme;

    default:
      return muiLightRedTheme;
  }
};

function App() {
  const [page, setPage] = useState("dcap");
  const [appSettings, setAppSettings] =
    useState<AppSettings>(defaultAppSettings);

  const muiTheme = getMuiTheme(appSettings.theme);

  return (
    <ThemeProvider theme={createTheme(muiTheme)}>
      <div
        className={`flex bg-primary shadow-primary ${appSettings.theme} text-main`}
      >
        <CollapsableSidebar
          defaultSelected="dcap"
          onSelect={(page) => setPage(page)}
        />

        <div className="w-full h-full">
          <LMCP visible={page === "lmcp"} />
          <SameDay visible={page === "same-day"} />
          <Settings
            visible={page === "settings"}
            settings={appSettings}
            onSettingsChanged={(settings) => {
              console.log(settings);
              setAppSettings(settings);
            }}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;

// FEATURE: Run multiple of the same type of routing task.
// FEATURE: Stats tracking: Number of tasks completed per day/hour. Steps where most time is spent.
