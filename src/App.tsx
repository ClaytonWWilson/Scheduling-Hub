import { useState } from "react";
import CollapsableSidebar from "./components/CollapsableSidebar";
import Settings from "./components/pages/Settings";
import Tasks from "./components/pages/Tasks";
import { AppSettings, Themes } from "./types/Settings";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
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
  const [page, setPage] = useState("tasks");
  const [appSettings, setAppSettings] =
    useState<AppSettings>(defaultAppSettings);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const muiTheme = getMuiTheme(appSettings.theme);

  return (
    <ThemeProvider theme={createTheme(muiTheme)}>
      <div
        className={`flex h-full min-h-screen bg-primary shadow-primary ${appSettings.theme} text-main`}
      >
        <CollapsableSidebar
          defaultSelected="tasks"
          onSelect={(page) => setPage(page)}
          onCollapse={(status) => setSidebarCollapsed(status)}
        />
        <div
          className={`w-screen h-fit mt-4 transition-all ${
            sidebarCollapsed ? "pl-16" : "pl-52"
          }`}
        >
          <Tasks visible={page === "tasks"} />
          <Settings
            visible={page === "settings"}
            settings={appSettings}
            onSettingsChanged={(settings) => {
              console.log(settings);
              setAppSettings(settings);
            }}
          />
        </div>
        <SnackbarProvider autoHideDuration={1500} disableWindowBlurListener />
      </div>
    </ThemeProvider>
  );
}

export default App;

// FEATURE: Stats tracking: Number of tasks completed per day/hour. Steps where most time is spent.
// FEATURE: Confetti when you complete a task faster than your previous record for the month/week
// FEATURE: Achievements
// FEATURE: Ask before closing if a task is currently open

// TODO: Add aria props where necessary
// TODO: Add logging to every step of the process
