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
    success: {
      main: "#6bef6b",
    },
    text: {
      secondary: "#ffffff",
      disabled: "#ffffff",
    },
  },
};

const noviLightTheme = {
  text: {
    fontSize: 11,
    fill: "#333333",
    outlineWidth: 0,
    outlineColor: "transparent",
  },
  axis: {
    domain: {
      line: {
        stroke: "#777777",
        strokeWidth: 1,
      },
    },
    legend: {
      text: {
        fontSize: 12,
        fill: "#333333",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
    ticks: {
      line: {
        stroke: "#777777",
        strokeWidth: 1,
      },
      text: {
        fontSize: 11,
        fill: "#333333",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
  },
  grid: {
    line: {
      stroke: "#dddddd",
      strokeWidth: 1,
    },
  },
  legends: {
    title: {
      text: {
        fontSize: 11,
        fill: "#333333",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
    text: {
      fontSize: 11,
      fill: "#333333",
      outlineWidth: 0,
      outlineColor: "transparent",
    },
    ticks: {
      line: {},
      text: {
        fontSize: 10,
        fill: "#333333",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
  },
  annotations: {
    text: {
      fontSize: 13,
      fill: "#333333",
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    link: {
      stroke: "#000000",
      strokeWidth: 1,
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    outline: {
      stroke: "#000000",
      strokeWidth: 2,
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    symbol: {
      fill: "#000000",
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
  },
  tooltip: {
    container: {
      background: "#ffffff",
      fontSize: 12,
    },
    basic: {},
    chip: {},
    table: {},
    tableCell: {},
    tableCellValue: {},
  },
};

const noviDarkTheme = {
  textColor: "#FFF",
  dots: {
    text: {
      fill: "#FFFFFF",
    },
  },
  text: {
    fontSize: 11,
    fill: "#FFF",
    outlineWidth: 0,
    outlineColor: "transparent",
  },
  axis: {
    domain: {
      line: {
        stroke: "#FFF",
        strokeWidth: 1,
      },
    },
    legend: {
      text: {
        fontSize: 12,
        fill: "#FFF",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
    ticks: {
      line: {
        stroke: "#FFF",
        strokeWidth: 1,
      },
      text: {
        fontSize: 11,
        fill: "#FFF",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
  },
  grid: {
    line: {
      stroke: "#dddddd",
      strokeWidth: 1,
    },
  },
  legends: {
    title: {
      text: {
        fontSize: 11,
        fill: "#FFF",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
    text: {
      fontSize: 11,
      fill: "#FFF",
      outlineWidth: 0,
      outlineColor: "transparent",
    },
    ticks: {
      line: {},
      text: {
        fontSize: 10,
        fill: "#FFF",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
  },
  annotations: {
    text: {
      fontSize: 13,
      fill: "#FFFFFF",
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    link: {
      stroke: "#000000",
      strokeWidth: 1,
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    outline: {
      stroke: "#000000",
      strokeWidth: 2,
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    symbol: {
      fill: "#000000",
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
  },
  tooltip: {
    container: {
      background: "#373737",
      fontSize: 12,
    },
    basic: {},
    chip: {},
    table: {},
    tableCell: {},
    tableCellValue: {},
  },
};

export { muiLightRedTheme, muiDarkRedTheme, noviLightTheme, noviDarkTheme };
