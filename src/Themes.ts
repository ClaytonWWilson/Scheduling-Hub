import { ThemeOptions } from "@mui/material/styles";

const muiLightRedTheme: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#ef6c6b",
      light: "#ffcbd0",
      dark: "#fc3227",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f8f3fc",
      paper: "#f8f3fc",
    },
    error: {
      main: "#f93636",
    },
  },
};

const muiDarkRedTheme: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#ef6c6b",
      light: "#ffcbd0",
      dark: "#fc3227",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#373737",
      paper: "#373737",
    },
    error: {
      main: "#f93636",
    },
    text: {
      secondary: "#ffffff",
      disabled: "#ffffff",
    },
  },
};

export { muiLightRedTheme, muiDarkRedTheme };
