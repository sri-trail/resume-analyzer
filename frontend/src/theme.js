import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f5f7fa"
    }
  }
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212"
    }
  }
});
