/** @type {import('tailwindcss').Config} */

const generateColorClass = (variable) => {
  return ({ opacityValue }) =>
    opacityValue
      ? `rgba(var(--${variable}), ${opacityValue})`
      : `rgb(var(--${variable}))`;
};

const textColor = {
  main: generateColorClass("text-main"),
  primary: generateColorClass("text-primary"),
  secondary: generateColorClass("text-secondary"),
};

const backgroundColor = {
  primary: generateColorClass("bg-primary"),
  main: generateColorClass("bg-main"),
  light: generateColorClass("bg-light"),
  dark: generateColorClass("bg-dark"),
  accent: generateColorClass("bg-accent"),
  highlight: generateColorClass("bg-highlight"),
};

const borderColor = {
  primary: generateColorClass("border-primary"),
  secondary: generateColorClass("border-secondary"),
  accent: generateColorClass("border-accent"),
};

const boxShadowColor = {
  primary: generateColorClass("shadow-primary"),
};

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },

    extend: {
      textColor,
      backgroundColor,
      borderColor,
      boxShadowColor,
    },
  },
  plugins: [],
};
