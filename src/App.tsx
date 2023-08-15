import { useState, createContext } from "react";
import CollapsableSidebar from "./components/CollapsableSidebar";
import Settings from "./components/pages/Settings";
import Tasks from "./components/pages/Tasks";
import { AppTheme, AppSettingsType } from "./types/Settings";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { muiLightRedTheme, muiDarkRedTheme } from "./Themes";
import { Page } from "./types/App";
import Stats from "./components/pages/Stats";

const defaultAppSettings: AppSettingsType = {
  theme: AppTheme.enum.DARKRED,
};

export const AppContext = createContext<AppSettingsType>(defaultAppSettings);

const getMuiTheme = (appTheme: AppTheme) => {
  switch (appTheme) {
    case AppTheme.enum.DARKRED:
      return muiDarkRedTheme;
    case AppTheme.enum.LIGHTRED:
      return muiLightRedTheme;
  }
};

function App() {
  const [page, setPage] = useState<Page>(Page.enum.TASKS);
  const [appSettings, setAppSettings] =
    useState<AppSettingsType>(defaultAppSettings);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const muiTheme = getMuiTheme(appSettings.theme);

  return (
    <ThemeProvider theme={createTheme(muiTheme)}>
      <AppContext.Provider value={appSettings}>
        <div
          className={`flex h-full min-h-screen bg-primary shadow-primary ${appSettings.theme} text-main`}
        >
          <CollapsableSidebar
            defaultSelected={Page.enum.TASKS}
            onSelect={(page) => setPage(page)}
            onCollapse={(status) => setSidebarCollapsed(status)}
          />
          <div
            className={`w-screen h-fit mt-4 transition-all ${
              sidebarCollapsed ? "pl-16" : "pl-52"
            }`}
          >
            <Tasks visible={page === Page.enum.TASKS} />
            {page === Page.enum.DCAP ? <div>Under construction 🧰</div> : null}
            {page === Page.enum.TOOLS ? (
              <div>Nothing to see here 😧</div>
            ) : null}
            <Stats visible={page === Page.enum.STATS} />
            <Settings
              visible={page === Page.enum.SETTINGS}
              settings={appSettings}
              onSettingsChanged={(settings) => {
                setAppSettings(settings);
              }}
            />
          </div>
          <SnackbarProvider autoHideDuration={1500} disableWindowBlurListener />
        </div>
      </AppContext.Provider>
    </ThemeProvider>
  );
}

export default App;

// FEATURE: Confetti when you complete a task faster than your previous record for the month/week
// FEATURE: Achievements
// FEATURE: Ask before closing program if a task is currently open
// PROPOSAL: Add current routing time to audit?, It could be inaccurate

// TODO: Add aria props where necessary
// TODO: Add logging to every step of the process
